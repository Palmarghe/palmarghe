import type {APIRoute} from 'astro';
import {z} from 'zod';
import {supabase,localMode} from '../../../lib/supabase';
import {canManageMedia} from '../../../lib/media-permission';
import {sameOrigin,errorResponse} from '../../../lib/security';
import {claimMediaUpload,mediaFormData,MediaInputError} from '../../../lib/media-request';
import {InvalidImage,validateImage} from '../../../lib/image-validation';
import {localStoreMedia} from '../../../lib/local-adapter';
import {renditionWidths,validRendition,type MediaRendition} from '../../../lib/media-renditions';
export const POST:APIRoute=async({request,cookies})=>{
 if(!sameOrigin(request))return errorResponse('Invalid origin',403);
 const db=supabase(cookies,request);if(!db)return errorResponse('Service unavailable',503);
 const {data:{user}}=await db.auth.getUser();if(!user)return errorResponse('Unauthorized',401);
 if(!await canManageMedia(db,user.id))return errorResponse('Forbidden',403);
 const release=claimMediaUpload();if(!release)return errorResponse('Başka bir görsel işleniyor. Biraz sonra yeniden deneyin.',429);
 try{
  const form=await mediaFormData(request),parsed=z.uuid().safeParse(form.get('media_id'));
  if(!parsed.success)return errorResponse('Invalid media',400);
  if(form.get('expected_actor')!==user.id)return errorResponse('Oturum değişti; görsel kitaplığını yeniden açın.',409);
  const id=parsed.data;
  const {data:source,error:sourceError}=await db.from('media').select('id,path,width,height,bytes').eq('id',id).single();
  if(sourceError||!source)return errorResponse('Not found',404);
  const widths=renditionWidths(source.width),files:{width:number;height:number;bytes:Uint8Array}[]=[];
  for(const [key,value] of form.entries())if(value instanceof File&&!widths.some(width=>key===`rendition_${width}`))return errorResponse('Invalid rendition',400);
  for(const width of widths){
   const file=form.get(`rendition_${width}`);if(file===null)continue;
   if(!(file instanceof File)||file.type!=='image/webp'||file.size<1||file.size>2097152||file.size>=source.bytes)return errorResponse('Invalid rendition size',400);
   const bytes=new Uint8Array(await file.arrayBuffer()),dimensions=await validateImage(bytes,file.type);
   if(dimensions.width!==width||dimensions.height!==Math.max(1,Math.round(source.height*width/source.width)))return errorResponse('Invalid rendition dimensions',400);
   files.push({width,height:dimensions.height,bytes});
  }
  const existing=await db.from('media_renditions').select('media_id,width,height,bytes,path').eq('media_id',id);
  if(existing.error)return errorResponse('Görsel sürümleri okunamadı; özgün dosya korunuyor.',503);
  const ready:MediaRendition[]=(existing.data??[]).filter(validRendition);
  const missing=files.filter(file=>!ready.some(row=>row.width===file.width));
  if(!missing.length)return Response.json({saved:true,media_id:id,widths:ready.map(row=>row.width)});
  const registered=await db.rpc('prepare_media_renditions',{p_media_id:id,p_source_path:source.path,
   p_descriptors:missing.map(file=>({width:file.width,height:file.height,bytes:file.bytes.length}))});
  const job=registered.data;
  if(registered.error||!job||typeof job.id!=='string'||!Array.isArray(job.descriptors)||job.descriptors.length!==missing.length)
   return errorResponse('Görsel sürümleri hazırlanamadı; özgün dosya korunuyor.',503);
  const paths=job.descriptors.map((row:unknown)=>({...row as object,media_id:id}));
  if(paths.some((row:unknown)=>!validRendition(row)))return errorResponse('Invalid server acknowledgement',503);
  // Durable job paths exist before the first upload. An uncertain result never causes a blind deletion.
  for(const file of missing){
   const descriptor=paths.find((row:any)=>row.width===file.width);
   if(!descriptor||descriptor.height!==file.height||descriptor.bytes!==file.bytes.length)return errorResponse('Invalid server acknowledgement',503);
   if(localMode)localStoreMedia(descriptor.path,file.bytes);
   else{const result=await db.storage.from('media').upload(descriptor.path,file.bytes,{contentType:'image/webp',upsert:false});
    if(result.error)return errorResponse('Aktarım tamamlanamadı; özgün dosya korunuyor. Yeniden deneyebilirsiniz.',503);}
  }
  const complete=await db.rpc('complete_media_renditions',{p_job_id:job.id});
  if(complete.error||complete.data!==true)return errorResponse('Görsel sürümleri doğrulanamadı; özgün dosya korunuyor.',503);
  const confirmation=await db.from('media_renditions').select('media_id,width,height,bytes,path').eq('media_id',id);
  if(confirmation.error||missing.some(file=>!(confirmation.data??[]).some((row:unknown)=>validRendition(row)&&row.width===file.width)))
   return errorResponse('Sonuç doğrulanamadı; yeniden denemeden önce kitaplığı yenileyin.',503);
  return Response.json({saved:true,media_id:id,widths:((confirmation.data??[]).filter(validRendition) as MediaRendition[]).map(row=>row.width)});
 }catch(error){
  if(error instanceof MediaInputError)return errorResponse(error.message,error.status);
  if(error instanceof InvalidImage)return errorResponse('Geçerli bir WebP görseli gönderin.',400);
  return errorResponse('Görsel sürümleri kaydedilemedi; özgün dosya korunuyor.',503);
 }finally{release();}
};
