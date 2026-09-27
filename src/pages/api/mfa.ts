import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { sameOrigin, errorResponse } from '../../lib/security';

const factorId = z.uuid();
const verificationCode = z.string().trim().regex(/^\d{6,8}$/);

const unavailable = () => errorResponse('MFA service unavailable', 503);
const cleanError = () => errorResponse('MFA request could not be completed', 400);

export const GET: APIRoute = async ({ request, cookies }) => {
  const db = supabase(cookies, request);
  if (!db) return unavailable();
  if (!('mfa' in db.auth)) return unavailable();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const { data, error } = await db.auth.mfa.listFactors();
  if (error) return unavailable();
  const factors = (data?.totp ?? []).filter((factor: { status: string }) => factor.status === 'verified').map((factor: { id: string; friendly_name?: string; created_at?: string }) => ({ id: factor.id, name: factor.friendly_name ?? 'Authenticator', createdAt: factor.created_at }));
  return Response.json({ factors });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const db = supabase(cookies, request);
  if (!db) return unavailable();
  if (!('mfa' in db.auth)) return unavailable();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return errorResponse('Unauthorized', 401);
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse('Invalid request', 400); }
  const action = z.object({ action: z.enum(['enroll', 'verify', 'unenroll']), factorId: z.string().optional(), code: z.string().optional() }).safeParse(body);
  if (!action.success) return errorResponse('Invalid request', 400);
  if (action.data.action === 'enroll') {
    // A closed setup dialog leaves an unverified factor behind in Supabase.
    // Remove only those incomplete factors before issuing a fresh QR secret.
    const { data: existing, error: listError } = await db.auth.mfa.listFactors();
    if (listError) return unavailable();
    const incomplete = (existing?.totp ?? []).filter((factor: { status: string }) => factor.status !== 'verified');
    for (const factor of incomplete) {
      const { error: removeError } = await db.auth.mfa.unenroll({ factorId: factor.id });
      if (removeError) return cleanError();
    }
    const { data, error } = await db.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Palmarghe Authenticator' });
    if (error || !data.totp) return cleanError();
    return Response.json({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  }
  const id = factorId.safeParse(action.data.factorId);
  if (!id.success) return errorResponse('Invalid factor', 400);
  if (action.data.action === 'verify') {
    const code = verificationCode.safeParse(action.data.code);
    if (!code.success) return errorResponse('Enter the 6-digit authenticator code', 400);
    const { error } = await db.auth.mfa.challengeAndVerify({ factorId: id.data, code: code.data });
    if (error) return cleanError();
    return Response.json({ ok: true });
  }
  const { error } = await db.auth.mfa.unenroll({ factorId: id.data });
  if (error) return cleanError();
  return Response.json({ ok: true });
};
