import type { APIRoute } from 'astro';
import { canManageMedia } from '../../../lib/media-permission';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase';
import { cleanDeletedMedia } from '../../../lib/media-cleanup';
import { sameOrigin, errorResponse, redirectTo } from '../../../lib/security';
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin',403);
  const db = supabase(cookies,request);
  if (!db) return errorResponse('Service unavailable',503);
  const { data: { user } } = await db.auth.getUser();
  if (!user) return errorResponse('Unauthorized',401);
  if (!await canManageMedia(db, user.id)) return errorResponse('Forbidden',403);
  const form = await request.formData();
  const id = z.uuid().safeParse(form.get('id'));
  if (!id.success) return errorResponse('Invalid id');
  if (form.get('operation') === 'cleanup') {
    const cleaned = await cleanDeletedMedia(db,id.data);
    return redirectTo(request,'/studio/?panel=editor&section=media&cleanup=' + (cleaned ? 'complete' : 'pending'));
  }
  const { data: media } = await db.from('media').select('id,path').eq('id',id.data).single();
  if (!media) return errorResponse('Not found',404);
  if (form.get('operation') === 'update') {
    const alt = z.string().trim().min(1).max(200).safeParse(form.get('alt_tr'));
    if (!alt.success) return errorResponse('Invalid alt text');
    const altEn = z.string().trim().max(200).safeParse(form.get('alt_en') ?? '');
    const captionTr = z.string().trim().max(500).safeParse(form.get('caption_tr') ?? '');
    const captionEn = z.string().trim().max(500).safeParse(form.get('caption_en') ?? '');
    if (!altEn.success || !captionTr.success || !captionEn.success) return errorResponse('Invalid media text');
    const { error } = await db.from('media').update({ alt_tr: alt.data, alt_en: altEn.data || null, caption_tr: captionTr.data || null, caption_en: captionEn.data || null }).eq('id',id.data);
    if (error) return errorResponse('Update failed',400);
    return redirectTo(request,'/studio/?panel=editor&section=media');
  }
  if (form.get('operation') === 'delete') {
    const { data: referenced, error: usageError } = await db.rpc('media_has_references',{p_media_id:id.data});
    if (usageError || typeof referenced !== 'boolean') return errorResponse('Usage check failed',503);
    if (referenced) return errorResponse('Media is in use (including revisions)',409);
    const cleanupSupport = await db.rpc('pending_media_cleanup',{p_media_id:id.data});
    if (cleanupSupport.error || !Array.isArray(cleanupSupport.data)) return errorResponse('Cleanup unavailable',503);
    const { error } = await db.from('media').delete().eq('id',id.data);
    // The FK closes the race between this friendly preflight and DELETE.
    if (error && ['23503','23001'].includes(error.code)) return errorResponse('Media is in use (including revisions)',409);
    if (error) return errorResponse('Delete failed',400);
    const cleaned = await cleanDeletedMedia(db,id.data);
    return redirectTo(request,'/studio/?panel=editor&section=media&cleanup=' + (cleaned ? 'complete' : 'pending'));
  }
  return errorResponse('Invalid operation');
};
