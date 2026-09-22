import type { APIRoute } from 'astro';
import { supabase, localMode } from '../../../lib/supabase';
import { localStoreMedia } from '../../../lib/local-adapter';
import { detectImage, validMediaSize } from '../../../lib/media';
import { sameOrigin, errorResponse, redirectTo } from '../../../lib/security';
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Service unavailable', 503);
  const { data: { user } } = await db.auth.getUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const { data: profile } = await db.from('profiles').select('role,permission_group_id').eq('id',user.id).single();
  if (!['admin','editor'].includes(profile?.role ?? '')) return errorResponse('Forbidden', 403);
  if(profile?.role==='editor'&&profile.permission_group_id){const {data:group}=await db.from('permission_groups').select('permissions').eq('id',profile.permission_group_id).single();if(group&&!group.permissions?.media)return errorResponse('Forbidden',403);}
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !validMediaSize(file.size)) return errorResponse('Invalid file', 400);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = detectImage(bytes);
  if (!mime || file.type !== mime) return errorResponse('Invalid image type', 400);
  const alt = String(form.get('alt_tr') ?? '').trim().slice(0,200);
  const altEn = String(form.get('alt_en') ?? '').trim().slice(0,200);
  const captionTr = String(form.get('caption_tr') ?? '').trim().slice(0,500);
  const captionEn = String(form.get('caption_en') ?? '').trim().slice(0,500);
  if (!alt) return errorResponse('Turkish alt text required',400);
  const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[mime];
  const path = `${crypto.randomUUID()}.${extension}`;
  if (localMode) localStoreMedia(path, bytes);
  else { const { error } = await db.storage.from('media').upload(path, bytes, { contentType: mime, upsert: false }); if (error) return errorResponse('Upload failed', 503); }
  const { error } = await db.from('media').insert({ path, mime, bytes: bytes.length, alt_tr: alt, alt_en: altEn || null, caption_tr: captionTr || null, caption_en: captionEn || null, uploaded_by: user.id });
  if (error) { if (!localMode) await db.storage.from('media').remove([path]); return errorResponse('Metadata save failed', 503); }
  return redirectTo(request, '/studio/?section=media');
};
