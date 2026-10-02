import { submitStudioForm, studioSaveMessage, validateStudioImage } from '../lib/studio-save';
import { validMediaSize } from '../lib/media';

const forms = [...document.querySelectorAll<HTMLFormElement>('form[action="/api/media/"],form[action="/api/media/manage/"]')];
if (forms.length) {
  let busy = false;
  const dirty = new Set<HTMLFormElement>();
  forms.forEach((form, index) => {
    const feedback = document.createElement('p');
    feedback.id = `media-save-feedback-${index}`;
    feedback.className = 'alert studio-form-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.dataset.studioFormStatus = '';
    feedback.hidden = true;
    form.append(feedback);
    form.setAttribute('aria-busy', 'false');
    form.querySelector<HTMLButtonElement>('[data-media-validation]')?.removeAttribute('hidden');
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    for (const event of ['input', 'change']) form.addEventListener(event, () => {
      dirty.add(form);
      fileInput?.removeAttribute('aria-invalid');
      feedback.hidden=true;
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      const body = new FormData(form);
      const validating=event.submitter instanceof HTMLButtonElement && event.submitter.hasAttribute('data-media-validation');
      const file = body.get('file');
      if (file instanceof File && !validMediaSize(file.size)) {
        feedback.hidden = false;
        feedback.textContent = 'Görsel boş olamaz ve en fazla 10 MB olmalıdır. Başka bir dosya seçin.';
        fileInput?.setAttribute('aria-invalid', 'true');
        fileInput?.setAttribute('aria-describedby', feedback.id);
        fileInput?.focus();
        return;
      }
      busy = true;
      const controls = forms.flatMap(item => [...item.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement>('input,button,select,textarea')]);
      const disabled = controls.map(control => control.disabled);
      controls.forEach(control => { control.disabled = true; });
      form.setAttribute('aria-busy', 'true');
      feedback.hidden = false;
      feedback.textContent = 'İşleniyor…';
      try {
        if(validating){
          const result=await validateStudioImage(form.action,body);
          feedback.textContent=`Görsel doğrulandı: ${result.width} × ${result.height} px · ${Math.ceil(result.bytes/1024)} KB. Henüz yüklenmedi.`;
          busy=false;
          controls.forEach((control,position)=>{control.disabled=disabled[position];});
          form.setAttribute('aria-busy','false');
          if(event.submitter instanceof HTMLButtonElement) event.submitter.focus({preventScroll:true});
          return;
        }
        const destination = await submitStudioForm(form.action, body, 'media');
        dirty.delete(form);
        feedback.textContent = new URL(destination).searchParams.get('cleanup') === 'pending'
          ? 'Dosya temizliği bekliyor · yönlendiriliyor'
          : 'İşlem tamamlandı · yönlendiriliyor';
        window.location.assign(destination);
      } catch (error) {
        busy = false;
        controls.forEach((control, position) => { control.disabled = disabled[position]; });
        form.setAttribute('aria-busy', 'false');
        feedback.textContent = studioSaveMessage(error, true);
        if (event.submitter instanceof HTMLButtonElement) event.submitter.focus({ preventScroll: true });
      }
    });
  });
  window.addEventListener('beforeunload', event => { if (dirty.size) event.preventDefault(); });
}
