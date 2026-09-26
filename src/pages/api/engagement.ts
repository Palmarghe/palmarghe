import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { errorResponse, sameOrigin } from '../../lib/security';
import { parsePath } from '../../lib/site';

const payload = z.object({ path: z.string().regex(/^\/[a-z0-9/-]*$/).max(500), event: z.enum(['read','share']) });

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const input = payload.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse('Invalid engagement event', 400);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Service unavailable', 503);
  const { locale, slug } = parsePath(input.data.path);
  if (!slug) return errorResponse('Content unavailable', 404);
  const { data: content } = await db.from('content_items').select('id').eq('locale', locale).eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString()).single();
  if (!content) return errorResponse('Content unavailable', 404);
  const { error } = await db.rpc('record_content_engagement', { p_content_id: content.id, p_event: input.data.event });
  if (error) return errorResponse('Engagement unavailable', 503);
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
};

export const GET: APIRoute = async ({ request, cookies }) => {
  const path = new URL(request.url).searchParams.get('path') ?? '';
  if (!/^\/[a-z0-9/-]*$/.test(path)) return errorResponse('Invalid path', 400);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Service unavailable', 503);
  const { locale, slug } = parsePath(path);
  const { data: content } = await db.from('content_items').select('id').eq('locale', locale).eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString()).single();
  if (!content) return errorResponse('Content unavailable', 404);
  const { data, error } = await db.rpc('get_content_metrics', { p_content_id: content.id }).maybeSingle();
  if (error) return errorResponse('Metrics unavailable', 503);
  return Response.json({ reads: Number(data?.reads ?? 0), shares: Number(data?.shares ?? 0) }, { headers: { 'Cache-Control': 'no-store' } });
};
