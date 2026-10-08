/** A bounded Studio POST; a 200 error page must never be called a saved form. */
export type StudioSaveSection = 'content' | 'media' | 'homepage' | 'advertising' | 'collections' | 'appearance' | 'settings' | 'categories' | 'tags' | 'navigation' | 'redirects' | 'comments' | 'messages' | 'members' | 'access' | 'users';
export const STUDIO_SAVE_TIMEOUT_MS = 30_000;
export type StudioSaveFailure = 'timeout' | 'network' | 'validation' | 'authentication' | 'permission' | 'conflict' | 'server' | 'response';
export class StudioSaveError extends Error {
  constructor(public readonly reason: StudioSaveFailure, public readonly detail?:string, public readonly field?:string) { super(reason); }
}
const mediaErrors:Record<string,string>={
  actor_session:'Oturum başka bir hesaba geçti. Girdileriniz korunuyor; bu hesabın Studio sayfasını başka bir sekmede açarak kontrol edin.',
  content_fields:'Başlık, URL, dil ve içerik türünü kontrol edin. Girdileriniz korunuyor.',
  content_body:'Editör içeriği doğrulanamadı. Girdileriniz korunuyor; desteklenmeyen bir blok olup olmadığını kontrol edin.',
  content_duplicate:'Bu dilde bu URL yolu zaten kullanılıyor. Başka bir URL yolu seçin.',
  content_transaction:'Sunucu içerik kaydını tamamlayamadı. Girdileriniz korunuyor; kayıt hatası inceleniyor.',
  upload_uncertain:'Görsel kaydının sonucu doğrulanamadı. Dosyanız ve girdileriniz korunuyor. Yeniden yüklemeden önce medya listesini başka bir sekmede kontrol edin.',
  image_dimensions:'Görsel en fazla 4096 px kenar ve 3 megapiksel olabilir. Daha küçük bir görsel seçin.',
  image_metadata:'Görselin profil/yön/metin verisi çok büyük. Görseli web için yeniden dışa aktarın.',
  invalid_image:'Görsel çözülemedi. Geçerli, statik PNG, JPEG veya WebP dosyası seçin.',
};
async function mediaErrorDetail(response:Response):Promise<{detail?:string;field?:string}>{
  if(!response.headers.get('content-type')?.includes('application/json')) return {};
  try {const data=await response.json();const fields=['title','slug','locale','type','status','excerpt','seo_title','seo_description','category_id','cover_media_id','og_media_id','canonical_override'];return {detail:typeof data?.error==='string' && Object.hasOwn(mediaErrors,data.error) ? mediaErrors[data.error] : undefined,field:data.error==='content_duplicate'?'slug':data.error==='content_body'?'body':fields.includes(data.field)?data.field:undefined};}catch{return {};}
}

export async function submitStudioForm(action: string, body: FormData, section: StudioSaveSection, transport: typeof fetch = fetch): Promise<string> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, STUDIO_SAVE_TIMEOUT_MS);
  try {
    const response = await transport(action, { method: 'POST', body, credentials: 'same-origin', headers: { Accept: 'text/html' }, signal: controller.signal });
    if (!response.ok) {
      const reason: StudioSaveFailure = response.status === 401 ? 'authentication' : response.status === 403 ? 'permission'
        : response.status === 409 ? 'conflict' : [400,413,422].includes(response.status) ? 'validation' : 'server';
      const error=await mediaErrorDetail(response);throw new StudioSaveError(reason,error.detail,error.field);
    }
    let destination: URL;
    try { destination = new URL(response.url); } catch { throw new StudioSaveError('response'); }
    const source = new URL(action);
    if (!response.redirected || destination.origin !== source.origin || destination.pathname !== '/studio/' || destination.searchParams.get('section') !== section) {
      throw new StudioSaveError('response');
    }
    if(destination.searchParams.has('error'))throw new StudioSaveError('validation');
    return destination.href;
  } catch (error) {
    if (timedOut) throw new StudioSaveError('timeout');
    if (error instanceof StudioSaveError) throw error;
    throw new StudioSaveError('network');
  } finally { clearTimeout(timeout); }
}

export function studioSaveMessage(error: unknown, media = false): string {
  if(error instanceof StudioSaveError && error.detail) return error.detail;
  const reason = error instanceof StudioSaveError ? error.reason : 'network';
  if (reason === 'timeout' || reason === 'response') return 'İşlemin sonucu doğrulanamadı. Girdileriniz bu sayfada korunuyor. Yeniden denemeden önce Studio listesini başka bir sekmede kontrol edin.';
  if (reason === 'authentication') return 'Oturumunuz sona ermiş olabilir. Girdilerinizi koruyarak başka bir sekmede tekrar giriş yapın.';
  if (reason === 'permission') return 'Bu işlem için yetkiniz bulunmuyor. Girdileriniz korunuyor.';
  if (reason === 'conflict') return media ? 'Bu görsel içerik veya sürüm geçmişinde kullanılıyor; silinmedi.' : 'Kayıt mevcut verilerle çakışıyor. URL yolunu ve mevcut içerikleri kontrol edin.';
  if (reason === 'validation') return 'Alanları ve dosya biçimini kontrol edin. Girdileriniz korunuyor; düzelttikten sonra yeniden deneyebilirsiniz.';
  if (reason === 'server') return 'Sunucu işlemi tamamlayamadı. Girdileriniz korunuyor; yeniden deneyebilirsiniz.';
  return 'Bağlantı kurulamadı. Girdileriniz korunuyor. Yeniden denemeden önce Studio listesini kontrol edin.';
}

export async function validateStudioImage(action:string, body:FormData, transport:typeof fetch=fetch):Promise<{width:number;height:number;bytes:number}> {
  body.set('operation','validate');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),STUDIO_SAVE_TIMEOUT_MS);
  try {
    const response=await transport(action,{method:'POST',body,credentials:'same-origin',headers:{Accept:'application/json'},signal:controller.signal});
    if(!response.ok) {const error=await mediaErrorDetail(response);throw new StudioSaveError(response.status===401 ? 'authentication' : response.status===403 ? 'permission' : [400,413,422].includes(response.status) ? 'validation' : 'server',error.detail,error.field);}
    if(response.redirected || !response.headers.get('content-type')?.includes('application/json')) throw new StudioSaveError('response');
    const data=await response.json();
    if(data?.validated!==true || ![data.width,data.height,data.bytes].every(value=>Number.isSafeInteger(value)&&value>0) || data.width>4096 || data.height>4096 || data.width*data.height>3000000 || data.bytes>10485760) throw new StudioSaveError('response');
    return data;
  } catch(error){if(error instanceof StudioSaveError) throw error;throw new StudioSaveError(controller.signal.aborted ? 'timeout' : 'network');}
  finally{clearTimeout(timeout);}
}
