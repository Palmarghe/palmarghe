import type { APIRoute } from 'astro';
import { canManageMedia } from '../../../lib/media-permission';
import { supabase, localMode } from '../../../lib/supabase';
import { localStoreMedia, localDeleteMedia } from '../../../lib/local-adapter';
import { validMediaSize } from '../../../lib/media';
import { InvalidImage, validateImage } from '../../../lib/image-validation';
import { claimMediaUpload, mediaFormData, MediaInputError } from '../../../lib/media-request';
import { sameOrigin, errorResponse, redirectTo } from '../../../lib/security';
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Service unavailable', 503);
  const { data: { user } } = await db.auth.getUser();
  if (!user) return errorResponse('Unauthorized', 401);
  if (!await canManageMedia(db, user.id)) return errorResponse('Forbidden',403);
  const release=claimMediaUpload();
  if(!release) return errorResponse('Başka bir görsel işleniyor. Biraz sonra yeniden deneyin.',429);
  let storedPath:string|undefined;
  try {
  const form = await mediaFormData(request);
  const operation=String(form.get('operation') ?? 'upload');
  if(!['upload','validate'].includes(operation)) return errorResponse('Invalid operation',400);
  const file = form.get('file');
  if (!(file instanceof File) || !validMediaSize(file.size)) return errorResponse('Invalid file', 400);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const {mime,width,height}=await validateImage(bytes,file.type);
  const alt = String(form.get('alt_tr') ?? '').trim().slice(0,200);
  const altEn = String(form.get('alt_en') ?? '').trim().slice(0,200);
  const captionTr = String(form.get('caption_tr') ?? '').trim().slice(0,500);
  const captionEn = String(form.get('caption_en') ?? '').trim().slice(0,500);
  if (!alt) return errorResponse('Turkish alt text required',400);
  // Read-only preflight uses exactly the same decoder and authorization boundary.
  if(operation==='validate') return Response.json({validated:true,mime,width,height,bytes:bytes.length});
  const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[mime];
  const path = `${crypto.randomUUID()}.${extension}`;
  if (localMode) localStoreMedia(path, bytes);
  else { const { error } = await db.storage.from('media').upload(path, bytes, { contentType: mime, upsert: false }); if (error) return errorResponse('Upload failed', 503); }
  storedPath=path;
  const { error } = await db.from('media').insert({ path, mime, bytes: bytes.length, width, height, alt_tr: alt, alt_en: altEn || null, caption_tr: captionTr || null, caption_en: captionEn || null, uploaded_by: user.id });
  if (error) {
    // A lost remote INSERT response can follow a successful commit. Never
    // remove its object without durable reconciliation of that outcome.
    // The local adapter completes synchronously, so its failure is known.
    if (localMode) localDeleteMedia(path);
    return Response.json({error:'upload_uncertain'},{status:503});
  }
  return redirectTo(request, '/studio/?panel=editor&section=media');
  } catch(error) {
    if(storedPath) {
      if(localMode) localDeleteMedia(storedPath);
      return Response.json({error:'upload_uncertain'},{status:503});
    }
    if(error instanceof MediaInputError) return errorResponse(error.message,error.status);
    if(error instanceof InvalidImage) return Response.json({error:error.message.includes('4096px') ? 'image_dimensions' : error.message.includes('metadata') ? 'image_metadata' : 'invalid_image'},{status:400});
    return errorResponse('Görsel kaydedilemedi. Alanlarınızı koruyup yeniden deneyin.',503);
  } finally {release();}
};
