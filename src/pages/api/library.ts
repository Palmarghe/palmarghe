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
  desired: z.boolean().optional(),
  viewer_id: z.uuid().optional(),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const input = payload.safeParse(await request.json().catch(() => null));
  if (!input.success) return errorResponse('Invalid library request', 400);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Service unavailable', 503);
  const { data: { user } } = await db.auth.getUser();
  if (!user) return errorResponse('Sign in required', 401);
  if(input.data.viewer_id && input.data.viewer_id!==user.id)return errorResponse('Session changed',401);
  if (['like','bookmark','follow'].includes(input.data.action)) {
    const action=input.data.action;
    if(action==='follow' ? !input.data.targetKind || !input.data.targetId : !input.data.contentId)return errorResponse('Target is required',400);
    if(action==='like'){
      const {data:content}=await db.from('content_items').select('status,published_at').eq('id',input.data.contentId!).single();
      if(!content || !['published','scheduled'].includes(content.status) || !content.published_at || content.published_at>new Date().toISOString())return errorResponse('Content unavailable',404);
    }
    const table=action==='like'?'content_likes':action==='bookmark'?'content_bookmarks':'content_follows';
    const row=action==='follow'?{user_id:user.id,target_kind:input.data.targetKind!,target_id:input.data.targetId!}:{user_id:user.id,content_id:input.data.contentId!};
    const filter=(query:any)=>action==='follow'?query.eq('user_id',user.id).eq('target_kind',input.data.targetKind!).eq('target_id',input.data.targetId!):query.eq('user_id',user.id).eq('content_id',input.data.contentId!);
    let desired=input.data.desired;
    // Older clients still toggle. Current clients retain an explicit desired
    // state across uncertain responses, so replay cannot reverse a committed write.
    if(desired===undefined){const {data:existing,error}=await filter(db.from(table).select(action==='follow'?'target_id':'content_id')).single();if(error&&error.code!=='PGRST116')return errorResponse('Library unavailable',503);desired=!existing;}
    const result=desired?await db.from(table).upsert(row,{onConflict:action==='follow'?'user_id,target_kind,target_id':'user_id,content_id',ignoreDuplicates:true}):await filter(db.from(table).delete());
    if(result.error)return errorResponse('Library unavailable',503);
    const state=action==='like'?'liked':action==='bookmark'?'saved':'following';
    const response:Record<string,unknown>={[state]:desired,viewer_id:user.id};
    if(action==='like'){const count=await db.rpc('content_like_count',{p_content_id:input.data.contentId!});if(count.error)return errorResponse('Like count unavailable',503);response.count=Number(count.data);}
    return Response.json(response,{headers:{'Cache-Control':'no-store'}});
  }
  if (!input.data.notificationId) return errorResponse('Notification is required',400);
  const { data,error } = await db.from('content_notifications').update({read_at:new Date().toISOString()}).eq('id',input.data.notificationId).eq('user_id',user.id).select('id').single();
  if (error) return errorResponse('Notification unavailable',error.code==='PGRST116'?404:503);
  if(!data)return errorResponse('Notification unavailable',404);
  return Response.json({read:true,viewer_id:user.id},{headers:{'Cache-Control':'no-store'}});
};