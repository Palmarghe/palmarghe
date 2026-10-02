import { MAX_MEDIA_BYTES } from './media';

export const MAX_MEDIA_REQUEST_BYTES=MAX_MEDIA_BYTES+64*1024;
export const MEDIA_BODY_TIMEOUT_MS=10000;
export class MediaInputError extends Error {
  constructor(message:string, public status:number) {super(message);}
}
let active: symbol|null=null;
/** At most one buffered/decoded media upload per isolate, including Storage I/O. */
export function claimMediaUpload(): (()=>void)|null {
  if(active) return null;
  const token=Symbol(); active=token;
  return ()=>{if(active===token) active=null;};
}
export async function mediaFormData(request:Request):Promise<FormData> {
  const type=request.headers.get('content-type') ?? '';
  if(!/^multipart\/form-data\s*;/i.test(type) || !request.body) throw new MediaInputError('Geçerli bir dosya yükleme formu gönderin.',400);
  const declared=request.headers.get('content-length');
  if(declared && (!/^\d+$/.test(declared) || Number(declared)>MAX_MEDIA_REQUEST_BYTES)) throw new MediaInputError('Yükleme isteği çok büyük; dosya en fazla 10 MB olabilir.',413);
  const reader=request.body.getReader();
  let expired=false, size=0;
  const chunks:Uint8Array[]=[];
  const timer=setTimeout(()=>{expired=true;void reader.cancel().catch(()=>{});},MEDIA_BODY_TIMEOUT_MS);
  try {
    while(true){
      const result=await reader.read();
      if(expired) throw new MediaInputError('Dosya aktarımı zaman aşımına uğradı. Yeniden deneyin.',408);
      if(result.done) break;
      size+=result.value.length;
      if(size>MAX_MEDIA_REQUEST_BYTES){await reader.cancel();throw new MediaInputError('Yükleme isteği çok büyük; dosya en fazla 10 MB olabilir.',413);}
      chunks.push(result.value);
    }
  } finally {clearTimeout(timer);reader.releaseLock();}
  const bytes=new Uint8Array(size);
  let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  try {return await new Response(bytes,{headers:{'content-type':type}}).formData();}
  catch {throw new MediaInputError('Yükleme formu okunamadı. Dosyayı yeniden seçin.',400);}
}
