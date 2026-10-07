import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { errorResponse, sameOrigin } from '../../lib/security';

const pathSchema = z.string().trim().regex(/^\/(?:en\/)?[a-z0-9/-]+\/$/).max(500);
const resolveContent = async (db: any, path: string) => {
  const locale = path.startsWith('/en/') ? 'en' : 'tr';
  const slug = path.replace(/^\/en\//,'').replace(/^\//,'').replace(/\/$/,'');
  const { data } = await db.from('content_items').select('id,title').eq('locale',locale).eq('slug',slug).eq('status','published').lte('published_at',new Date().toISOString()).single();
  return data;
};

export const GET: APIRoute = async ({ request, cookies }) => {
  const db = supabase(cookies,request);
  if (!db) return errorResponse('Service unavailable',503);
  const parsedPath = pathSchema.safeParse(new URL(request.url).searchParams.get('path'));
  if (!parsedPath.success) return errorResponse('Invalid path',400);
  const content = await resolveContent(db,parsedPath.data);
  if (!content) return errorResponse('Not found',404);
  const [{ data: comments, error }, { data: { user } }] = await Promise.all([
    db.rpc('get_public_comments',{ p_content_id:content.id }),
    db.auth.getUser(),
  ]);
  if (error) return errorResponse('Comments unavailable',503);
  return new Response(JSON.stringify({ contentId:content.id,authenticated:Boolean(user),viewer_id:user?.id??null,comments:comments ?? [] }),{ headers:{ 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff' } });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin',403);
  const db = supabase(cookies,request);
  if (!db) return errorResponse('Service unavailable',503);
  const { data:{ user } } = await db.auth.getUser();
  if (!user) return errorResponse('Üye girişi gerekli',401);
  const form = await request.formData();
  const input = z.object({ path:pathSchema, body:z.string().trim().min(2).max(2000),request_id:z.uuid(),viewer_id:z.uuid().optional() }).safeParse({ path:form.get('path'),body:form.get('body'),request_id:form.get('request_id') ?? crypto.randomUUID(),viewer_id:form.get('viewer_id')??undefined });
  if (!input.success) return errorResponse('Geçersiz yorum',400);
  if(input.data.viewer_id && input.data.viewer_id!==user.id)return errorResponse('Comment session changed',401);
  const content = await resolveContent(db,input.data.path);
  if (!content) return errorResponse('Not found',404);
  const { data, error } = await db.rpc('deliver_comment',{p_content_id:content.id,p_request_id:input.data.request_id,p_body:input.data.body});
  if (error) return errorResponse('Yorum kaydedilemedi',error.code==='22023'?409:error.code==='42501'?403:503);
  const receipt=z.object({id:z.uuid().nullable(),created:z.boolean(),removed:z.boolean()}).refine(r=>r.removed?r.id===null&&!r.created:r.id!==null).safeParse(data);
  if(!receipt.success)return errorResponse('Delivery confirmation unavailable',503);
  return new Response(JSON.stringify({ ok:true,...receipt.data,viewer_id:user.id }),{ status:receipt.data.created ? 201 : 200,headers:{ 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store' } });
};
