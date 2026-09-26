import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { errorResponse, sameOrigin } from '../../lib/security';

const payload = z.object({ path: z.string().regex(/^\/[a-z0-9/-]*$/).max(500), visitor: z.uuid() });

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Service unavailable', 503);
  const input = payload.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse('Invalid traffic event', 400);
  const { error } = await db.rpc('record_traffic_visit', { p_path: input.data.path, p_visitor_id: input.data.visitor });
  if (error) return errorResponse('Traffic unavailable', 503);
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
};
