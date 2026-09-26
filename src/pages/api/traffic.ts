import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { errorResponse, sameOrigin } from '../../lib/security';

const payload = z.object({ path: z.string().regex(/^\/[a-z0-9/-]*$/).max(500), visitor: z.uuid() });

const botUserAgent = /bot\b|crawler|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|preview|prerender|curl|wget/i;
const searchReferrer = /(^|\.)(google|bing|yandex|duckduckgo|baidu)\./i;

function acquisitionSource(referrer: string | null) {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname;
    if (searchReferrer.test(host)) return 'organic_search';
    return 'referral';
  } catch { return 'direct'; }
}

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
    p_source: acquisitionSource(request.headers.get('referer')),
  });
  if (qualifiedError) return errorResponse('Traffic unavailable', 503);
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
};
