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
  return new Response(JSON.stringify({ contentId:content.id,authenticated:Boolean(user),comments:comments ?? [] }),{ headers:{ 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff' } });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin',403);
  const db = supabase(cookies,request);
  if (!db) return errorResponse('Service unavailable',503);
  const { data:{ user } } = await db.auth.getUser();
  if (!user) return errorResponse('Üye girişi gerekli',401);
  const form = await request.formData();
  const input = z.object({ path:pathSchema, body:z.string().trim().min(2).max(2000) }).safeParse({ path:form.get('path'),body:form.get('body') });
  if (!input.success) return errorResponse('Geçersiz yorum',400);
  const content = await resolveContent(db,input.data.path);
  if (!content) return errorResponse('Not found',404);
  const { error } = await db.from('comments').insert({ content_id:content.id,user_id:user.id,body:input.data.body,status:'published' });
  if (error) return errorResponse('Yorum kaydedilemedi',400);
  return new Response(JSON.stringify({ ok:true }),{ status:201,headers:{ 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store' } });
};
