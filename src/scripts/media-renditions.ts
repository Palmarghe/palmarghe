import {renditionWidths} from '../lib/media-renditions';
import {STUDIO_SAVE_TIMEOUT_MS} from '../lib/studio-save';
for(const tools of document.querySelectorAll<HTMLElement>('[data-rendition-tools]')){
 const button=tools.querySelector<HTMLButtonElement>('[data-generate-renditions]')!,status=tools.querySelector<HTMLElement>('[data-rendition-status]')!;
 button.addEventListener('click',async()=>{
  if(button.disabled)return;
  button.disabled=true;tools.setAttribute('aria-busy','true');status.textContent='Görsel sürümleri hazırlanıyor…';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),STUDIO_SAVE_TIMEOUT_MS);
  let bitmap:ImageBitmap|undefined;
  const pageHide=()=>controller.abort();window.addEventListener('pagehide',pageHide,{once:true});
  try{
   const id=tools.dataset.mediaId!,width=Number(tools.dataset.sourceWidth),height=Number(tools.dataset.sourceHeight),size=Number(tools.dataset.sourceBytes);
   const response=await fetch(`/api/media/${id}/`,{credentials:'same-origin',signal:controller.signal});
   if(!response.ok)throw new Error('Özgün görsel okunamadı; oturumunuzu kontrol edip yeniden deneyin.');
   const original=await response.blob();
   if(original.size!==size||original.size>10485760)throw new Error('Özgün görsel değişmiş olabilir; kitaplığı yenileyin.');
   bitmap=await createImageBitmap(original);
   if(bitmap.width!==width||bitmap.height!==height)throw new Error('Görsel ölçüleri doğrulanamadı; özgün dosya korunuyor.');
   const body=new FormData();body.set('media_id',id);body.set('expected_actor',tools.dataset.actor!);
   for(const target of renditionWidths(width)){
    if(controller.signal.aborted)throw new Error('Görsel hazırlığı zaman aşımına uğradı; yeniden deneyebilirsiniz.');
    const canvas=document.createElement('canvas');canvas.width=target;canvas.height=Math.max(1,Math.round(height*target/width));
    const context=canvas.getContext('2d');if(!context)throw new Error('Bu tarayıcı görsel hazırlamayı desteklemiyor.');
    context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.85));canvas.width=canvas.height=1;
    if(!blob||blob.type!=='image/webp')throw new Error('Bu tarayıcı WebP hazırlamayı desteklemiyor.');
    if(blob.size<size&&blob.size<=2097152)body.set(`rendition_${target}`,blob,`${target}.webp`);
   }
   if(controller.signal.aborted)throw new Error('Görsel hazırlığı zaman aşımına uğradı; yeniden deneyebilirsiniz.');
   status.textContent='Görsel sürümleri kaydediliyor…';
   const saved=await fetch('/api/media/renditions/',{method:'POST',body,credentials:'same-origin',signal:controller.signal});
   if(!saved.ok)throw new Error(saved.status===401?'Oturum sona ermiş olabilir; başka bir sekmede giriş yapın.':saved.status===403?'Bu işlem için medya yetkisi gerekir.':'Görsel sürümleri kaydedilemedi. Özgün dosya korunuyor; kitaplığı kontrol edip yeniden deneyebilirsiniz.');
   const data=await saved.json();
   if(data?.saved!==true||data.media_id!==id||!Array.isArray(data.widths)||data.widths.some((value:unknown)=>typeof value!=='number'||!renditionWidths(width).includes(value)))throw new Error('Sonuç doğrulanamadı; kitaplığı yenileyip kontrol edin.');
   status.textContent=data.widths.length?`${data.widths.join(' / ')} px sürümleri kaydedildi. Özgün dosya korunuyor.`:'Özgün görsel zaten yeterince hafif; daha büyük dosya eklenmedi.';
  }catch(error){status.textContent=controller.signal.aborted?'Aktarımın sonucu doğrulanamadı. Özgün dosya korunuyor; kitaplığı kontrol edip yeniden deneyin.':error instanceof Error?error.message:'Görsel hazırlanamadı; yeniden deneyin.';}
  finally{bitmap?.close();clearTimeout(timer);window.removeEventListener('pagehide',pageHide);tools.setAttribute('aria-busy','false');button.disabled=false;}
 });
 if(new URL(location.href).searchParams.get('renditions')===tools.dataset.mediaId){
  tools.setAttribute('open','');button.click();const clean=new URL(location.href);clean.searchParams.delete('renditions');history.replaceState(history.state,'',clean);
 }
}
