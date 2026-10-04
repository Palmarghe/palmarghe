import { parseDocument } from '../lib/blocks';

/** Tab-scoped recovery. A recovered draft is offered, never applied over server data automatically. */
export function editorRecovery(form: HTMLFormElement, restoreBody: (body: object) => void, sync: () => void) {
  const key = `palmarghe-draft:${form.dataset.owner}:${form.querySelector<HTMLInputElement>('[name=id]')?.value || 'new'}`;
  const fields = [...form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('input[name],select[name],textarea[name]')].filter(e=>!['hidden','password','file'].includes(e.type)||e.name==='body');
  const panel = document.createElement('aside'); panel.className='editor-recovery'; panel.setAttribute('aria-label','Taslak kurtarma');
  const message=document.createElement('span'); message.setAttribute('role','status');
  const restore=document.createElement('button'); restore.type='button'; restore.textContent='Taslağı geri getir'; restore.hidden=true;
  const discard=document.createElement('button'); discard.type='button'; discard.textContent='Kurtarma kopyasını kaldır'; discard.hidden=true;
  panel.append(message,restore,discard); form.querySelector('.editor-action-bar')?.after(panel);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: {fields:{name:string;value:string;checked:boolean;selected?:string[]}[];time:number} | null=null;
  try { const data=JSON.parse(sessionStorage.getItem(key)||'null'); if(data && Array.isArray(data.fields)&&Date.now()-data.time<86400000)pending=data; else sessionStorage.removeItem(key); } catch { /* unavailable storage */ }
  if(pending){message.textContent='Bu sekmede kaydedilmemiş bir taslak bulundu. Sunucudaki içerik değiştirilmedi.';restore.hidden=false;discard.hidden=false;}
  else message.textContent='Yazdıkların bu sekmede otomatik korunur; yayınlamak için kaydet.';
  const clear=()=>{clearTimeout(timer);timer=undefined;try{sessionStorage.removeItem(key);}catch{}pending=null;restore.hidden=true;discard.hidden=true;};
  discard.addEventListener('click',()=>{clear();message.textContent='Kurtarma kopyası kaldırıldı.';});
  restore.addEventListener('click',()=>{
    const body=pending?.fields.find(e=>e.name==='body'); const doc=body?parseDocument(body.value):null;
    if(!doc){message.textContent='Kurtarma kopyası doğrulanamadı; mevcut içerik korunuyor.';return;}
    for(const field of fields){const saved=pending?.fields.find(e=>e.name===field.name);if(!saved)continue;if(field.type==='checkbox')(field as HTMLInputElement).checked=saved.checked;else if(field instanceof HTMLSelectElement&&field.multiple){for(const option of field.options)option.selected=saved.selected?.includes(option.value)??false;}else field.value=saved.value;}
    const status=form.querySelector<HTMLSelectElement>('[name=status]');if(status)status.value='draft';
    restoreBody(doc);form.dispatchEvent(new Event('input',{bubbles:true}));restore.hidden=true;message.textContent='Taslak geri getirildi. Henüz sunucuya kaydedilmedi.';
  });
  const save=()=>{sync();try{sessionStorage.setItem(key,JSON.stringify({time:Date.now(),fields:fields.map(e=>({name:e.name,value:e.value,checked:(e as HTMLInputElement).checked,selected:e instanceof HTMLSelectElement&&e.multiple?[...e.selectedOptions].map(o=>o.value):undefined}))}));message.textContent=`Sekme kopyası korundu · ${new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}`;discard.hidden=false;}catch{message.textContent='Tarayıcı taslak kopyasını saklayamıyor. Taslak kaydet ile sunucuya kaydedebilirsin.';}};
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(save,600);};
  form.addEventListener('input',schedule);form.addEventListener('change',schedule);
  // Native page departure gets a final synchronous snapshot while inputs are still enabled.
  window.addEventListener('pagehide',()=>{if(timer)save();});
  return {schedule,clear};
}
