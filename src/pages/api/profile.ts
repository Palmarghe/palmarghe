import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase, localMode } from '../../lib/supabase';
import { localStoreMedia } from '../../lib/local-adapter';
import { detectImage, validMediaSize } from '../../lib/media';
import { errorResponse, sameOrigin } from '../../lib/security';

export const GET: APIRoute = async ({ request,cookies }) => {
  const db=supabase(cookies,request); if(!db) return errorResponse('Service unavailable',503);
  const { data:{user} }=await db.auth.getUser(); if(!user) return errorResponse('Unauthorized',401);
  const { data,error }=await db.from('profiles').select('display_name,bio,avatar_media_id').eq('id',user.id).single();
  if(error) return errorResponse('Profile unavailable',503);
  return new Response(JSON.stringify({ email:user.email,...data }),{ headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'} });
};

export const POST: APIRoute = async ({ request,cookies }) => {
  if(!sameOrigin(request)) return errorResponse('Invalid origin',403);
  const db=supabase(cookies,request); if(!db) return errorResponse('Service unavailable',503);
  const { data:{user} }=await db.auth.getUser(); if(!user) return errorResponse('Unauthorized',401);
  const form=await request.formData();
  const input=z.object({ display_name:z.string().trim().min(2).max(100),bio:z.string().trim().max(500) }).safeParse({display_name:form.get('display_name'),bio:form.get('bio')??''});
  if(!input.success) return errorResponse('Invalid profile',400);
  let avatar_media_id:string|null=null;
  const file=form.get('avatar');
  if(file instanceof File && file.size>0){
    if(!validMediaSize(file.size)) return errorResponse('Invalid file',400);
    const bytes=new Uint8Array(await file.arrayBuffer()); const mime=detectImage(bytes);
    if(!mime || mime!==file.type) return errorResponse('Invalid image type',400);
    const extension={ 'image/png':'png','image/jpeg':'jpg','image/webp':'webp' }[mime];
    const path=`${crypto.randomUUID()}.${extension}`;
    if(localMode) localStoreMedia(path,bytes); else { const {error}=await db.storage.from('media').upload(path,bytes,{contentType:mime,upsert:false}); if(error) return errorResponse('Upload failed',503); }
    const {data:created,error}=await db.from('media').insert({path,mime,bytes:bytes.length,alt_tr:`${input.data.display_name} profil fotoğrafı`,alt_en:`Profile photo of ${input.data.display_name}`,uploaded_by:user.id}).select('id').single();
    if(error||!created){ if(!localMode) await db.storage.from('media').remove([path]); return errorResponse('Profile image failed',503); }
    avatar_media_id=created.id;
  }
  const changes:{display_name:string;bio:string;avatar_media_id?:string}={display_name:input.data.display_name,bio:input.data.bio};
  if(avatar_media_id) changes.avatar_media_id=avatar_media_id;
  const {error}=await db.from('profiles').update(changes).eq('id',user.id); if(error) return errorResponse('Update failed',400);
  return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
};
