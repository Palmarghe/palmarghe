import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { sameOrigin, errorResponse, redirectTo } from '../../lib/security';

const schema = z.object({ name: z.string().trim().min(1).max(100), email: z.email().max(254), message: z.string().trim().min(10).max(5000), locale: z.enum(['tr','en']), consent: z.literal('on'), token: z.string().min(1) });
export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const form = await request.formData();
  if (form.get('website')) return redirectTo(request, '/contact/?sent=1');
  const parsed = schema.safeParse({ name: form.get('name'), email: form.get('email'), message: form.get('message'), locale: form.get('locale'), consent: form.get('consent'), token: form.get('cf-turnstile-response') });
  if (!parsed.success) return errorResponse('Invalid form', 400);
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !url || !serviceKey) return errorResponse('Contact service unavailable', 503);
  const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret, response: parsed.data.token }), signal: AbortSignal.timeout(7000) });
  if (!verification.ok || !(await verification.json() as { success: boolean }).success) return errorResponse('Bot check failed', 403);
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await db.from('contact_messages').insert({ name: parsed.data.name, email: parsed.data.email, message: parsed.data.message });
  if (error) return errorResponse('Contact service unavailable', 503);
  return redirectTo(request, `${parsed.data.locale === 'en' ? '/en' : ''}/contact/?sent=1`);
};
