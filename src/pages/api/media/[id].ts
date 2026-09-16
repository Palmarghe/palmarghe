import type { APIRoute } from 'astro';
import { supabase, localMode } from '../../../lib/supabase';
import { localReadMedia } from '../../../lib/local-adapter';
import { errorResponse } from '../../../lib/security';
export const GET: APIRoute = async ({ request, cookies, params }) => {
  const db = supabase(cookies, request);
  if (!db || !params.id) return errorResponse('Not found', 404);
  const { data: media } = await db.from('media').select('path,mime').eq('id',params.id).single();
  if (!media) return errorResponse('Not found', 404);
  if (localMode) {
    const bytes = localReadMedia(media.path);
    return bytes ? new Response(new Uint8Array(bytes).buffer, { headers: { 'Content-Type': media.mime, 'X-Content-Type-Options': 'nosniff' } }) : errorResponse('Not found',404);
  }
  const { data, error } = await db.storage.from('media').download(media.path);
  if (error || !data) return errorResponse('Not found', 404);
  return new Response(data, { headers: { 'Content-Type': media.mime, 'X-Content-Type-Options': 'nosniff' } });
};
