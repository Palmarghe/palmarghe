/** A bounded Studio POST; a 200 error page must never be called a saved form. */
export const STUDIO_SAVE_TIMEOUT_MS = 30_000;
export type StudioSaveFailure = 'timeout' | 'network' | 'validation' | 'authentication' | 'permission' | 'conflict' | 'server' | 'response';
export class StudioSaveError extends Error {
  constructor(public readonly reason: StudioSaveFailure) { super(reason); }
}

export async function submitStudioForm(action: string, body: FormData, section: 'content' | 'media', transport: typeof fetch = fetch): Promise<string> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, STUDIO_SAVE_TIMEOUT_MS);
  try {
    const response = await transport(action, { method: 'POST', body, credentials: 'same-origin', headers: { Accept: 'text/html' }, signal: controller.signal });
    if (!response.ok) {
      const reason: StudioSaveFailure = response.status === 401 ? 'authentication' : response.status === 403 ? 'permission'
        : response.status === 409 ? 'conflict' : response.status === 400 || response.status === 422 ? 'validation' : 'server';
      throw new StudioSaveError(reason);
    }
    let destination: URL;
    try { destination = new URL(response.url); } catch { throw new StudioSaveError('response'); }
    const source = new URL(action);
    if (!response.redirected || destination.origin !== source.origin || destination.pathname !== '/studio/' || destination.searchParams.get('section') !== section) {
      throw new StudioSaveError('response');
    }
    return destination.href;
  } catch (error) {
    if (timedOut) throw new StudioSaveError('timeout');
    if (error instanceof StudioSaveError) throw error;
    throw new StudioSaveError('network');
  } finally { clearTimeout(timeout); }
}

export function studioSaveMessage(error: unknown, media = false): string {
  const reason = error instanceof StudioSaveError ? error.reason : 'network';
  if (reason === 'timeout' || reason === 'response') return 'İşlemin sonucu doğrulanamadı. Girdileriniz bu sayfada korunuyor. Yeniden denemeden önce Studio listesini başka bir sekmede kontrol edin.';
  if (reason === 'authentication') return 'Oturumunuz sona ermiş olabilir. Girdilerinizi koruyarak başka bir sekmede tekrar giriş yapın.';
  if (reason === 'permission') return 'Bu işlem için yetkiniz bulunmuyor. Girdileriniz korunuyor.';
  if (reason === 'conflict') return media ? 'Bu görsel içerik veya sürüm geçmişinde kullanılıyor; silinmedi.' : 'Kayıt mevcut verilerle çakışıyor. URL yolunu ve mevcut içerikleri kontrol edin.';
  if (reason === 'validation') return 'Alanları ve dosya biçimini kontrol edin. Girdileriniz korunuyor; düzelttikten sonra yeniden deneyebilirsiniz.';
  if (reason === 'server') return 'Sunucu işlemi tamamlayamadı. Girdileriniz korunuyor; yeniden deneyebilirsiniz.';
  return 'Bağlantı kurulamadı. Girdileriniz korunuyor. Yeniden denemeden önce Studio listesini kontrol edin.';
}
