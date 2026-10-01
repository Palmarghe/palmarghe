import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { errorResponse, sameOrigin } from '../../lib/security';

const payload = z.object({ path: z.string().regex(/^\/[a-z0-9/-]*$/).max(500), visitor: z.uuid(), source: z.enum(['organic_search', 'referral', 'direct']).default('direct') });

const botUserAgent = /bot\b|crawler|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|preview|prerender|curl|wget/i;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Service unavailable', 503);
  const input = payload.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse('Invalid traffic event', 400);
  // Keep legacy totals intact, while the qualified report starts cleanly here.
  // Known automated clients never enter the qualified report.
  if (botUserAgent.test(request.headers.get('user-agent') ?? '')) return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  const { error } = await db.rpc('record_traffic_visit', { p_path: input.data.path, p_visitor_id: input.data.visitor });
  if (error) return errorResponse('Traffic unavailable', 503);
  const { error: qualifiedError } = await db.rpc('record_qualified_traffic_visit', {
    p_path: input.data.path,
    p_visitor_id: input.data.visitor,
    // Only the coarse entry classification is sent, never the raw referrer URL.
    // Browser-reported attribution is not proof that a visitor is human.
    p_source: input.data.source,
  });
  if (qualifiedError) return errorResponse('Traffic unavailable', 503);
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
};
