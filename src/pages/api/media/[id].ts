import type { APIRoute } from 'astro';
import { supabase, localMode } from '../../../lib/supabase';
import { localReadMedia } from '../../../lib/local-adapter';
import { errorResponse } from '../../../lib/security';
import {requestedRendition,validRendition} from '../../../lib/media-renditions';
export const GET: APIRoute = async ({ request, cookies, params }) => {
  const db = supabase(cookies, request);
  if (!db || !params.id) return errorResponse('Not found', 404);
  const { data: media } = await db.from('media').select('path,mime').eq('id',params.id).single();
  if (!media) return errorResponse('Not found', 404);
  // Parent RLS is checked on every request, before any derived-object lookup.
  const width=requestedRendition(new URL(request.url).searchParams.get('w'));
  if(Number.isNaN(width))return errorResponse('Invalid image width',400);
  let path=media.path,mime=media.mime;
  if(width!==null){
    const result=await db.from('media_renditions').select('media_id,width,height,path,bytes').eq('media_id',params.id).eq('width',width).single();
    if(validRendition(result.data)&&result.data.media_id===params.id&&result.data.width===width){path=result.data.path;mime='image/webp';}
    // Missing/unavailable renditions retain the original; never decode on a read.
  }
  const headers={'Content-Type':mime,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'};
  if (localMode) {
    const bytes = localReadMedia(path)??localReadMedia(media.path);
    return bytes ? new Response(new Uint8Array(bytes).buffer, { headers: path!==media.path&&!localReadMedia(path)?{...headers,'Content-Type':media.mime}:headers }) : errorResponse('Not found',404);
  }
  let { data, error } = await db.storage.from('media').download(path);
  if((error||!data)&&path!==media.path){const fallback=await db.storage.from('media').download(media.path);data=fallback.data;error=fallback.error;headers['Content-Type']=media.mime;}
  if (error || !data) return errorResponse('Not found', 404);
  return new Response(data, { headers });
};
