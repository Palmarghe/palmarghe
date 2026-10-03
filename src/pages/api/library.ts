import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { sameOrigin, errorResponse } from '../../lib/security';

const payload = z.object({
  action: z.enum(['bookmark','like','follow','notification_read']),
  contentId: z.uuid().optional(),
  targetKind: z.enum(['category','tag','author']).optional(),
  targetId: z.uuid().optional(),
  notificationId: z.coerce.number().int().positive().optional(),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const input = payload.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse('Invalid library request', 400);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Service unavailable', 503);
  const { data: { user } } = await db.auth.getUser();
  if (!user) return errorResponse('Sign in required', 401);
  if (input.data.action === 'like') {
    if (!input.data.contentId) return errorResponse('Content is required', 400);
    const id = input.data.contentId;
    const { data: content } = await db.from('content_items').select('status,published_at').eq('id',id).single();
    if (!content || !['published','scheduled'].includes(content.status) || !content.published_at || content.published_at > new Date().toISOString()) return errorResponse('Content unavailable',404);
    const { data: existing, error } = await db.from('content_likes').select('content_id').eq('user_id',user.id).eq('content_id',id).single();
    if (error && error.code !== 'PGRST116') return errorResponse('Like unavailable',503);
    const result = existing ? await db.from('content_likes').delete().eq('user_id',user.id).eq('content_id',id) : await db.from('content_likes').insert({user_id:user.id,content_id:id});
    if (result.error) return errorResponse('Like unavailable',503);
    const count = await db.rpc('content_like_count',{p_content_id:id});
    if(count.error) return errorResponse('Like unavailable',503);
    return Response.json({liked:!existing,count:Number(count.data)},{headers:{'Cache-Control':'no-store'}});
  }
  if (input.data.action === 'bookmark') {
    if (!input.data.contentId) return errorResponse('Content is required', 400);
    const { data: existing, error: lookupError } = await db.from('content_bookmarks').select('content_id').eq('user_id', user.id).eq('content_id', input.data.contentId).single();
    if (lookupError && lookupError.code !== 'PGRST116') return errorResponse('Bookmark unavailable', 503);
    const result = existing
      ? await db.from('content_bookmarks').delete().eq('user_id', user.id).eq('content_id', input.data.contentId)
      : await db.from('content_bookmarks').insert({ user_id:user.id, content_id:input.data.contentId });
    if (result.error) return errorResponse('Bookmark unavailable', 503);
    return Response.json({ saved: !existing }, { headers:{ 'Cache-Control':'no-store' } });
  }
  if (input.data.action === 'follow') {
    if (!input.data.targetKind || !input.data.targetId) return errorResponse('Follow target is required', 400);
    const { data: existing, error: lookupError } = await db.from('content_follows').select('target_id').eq('user_id', user.id).eq('target_kind', input.data.targetKind).eq('target_id', input.data.targetId).single();
    if (lookupError && lookupError.code !== 'PGRST116') return errorResponse('Follow unavailable', 503);
    const result = existing
      ? await db.from('content_follows').delete().eq('user_id',user.id).eq('target_kind',input.data.targetKind).eq('target_id',input.data.targetId)
      : await db.from('content_follows').insert({ user_id:user.id,target_kind:input.data.targetKind,target_id:input.data.targetId });
    if (result.error) return errorResponse('Follow unavailable', 503);
    return Response.json({ following: !existing }, { headers:{ 'Cache-Control':'no-store' } });
  }
  if (!input.data.notificationId) return errorResponse('Notification is required',400);
  const { error } = await db.from('content_notifications').update({read_at:new Date().toISOString()}).eq('id',input.data.notificationId).eq('user_id',user.id);
  if (error) return errorResponse('Notification unavailable',503);
  return new Response(null,{status:204});
};