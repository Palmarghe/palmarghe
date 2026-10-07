import {submitStudioForm,studioSaveMessage} from '../lib/studio-save';
for(const form of document.querySelectorAll<HTMLFormElement>('.homepage-editor,.advertising-form,.collection-editor')){
 const status=document.createElement('p');status.className='studio-settings-status';status.setAttribute('role','status');form.append(status);let saving=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(saving||!form.reportValidity())return;
  const body=new FormData(form);const button=(event as SubmitEvent).submitter as HTMLButtonElement|null;if(button?.name)body.set(button.name,button.value);
  const controls=[...form.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement|HTMLTextAreaElement>('input,button,select,textarea')];const disabled=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);saving=true;form.setAttribute('aria-busy','true');status.textContent='Kaydediliyor…';
  try{const url=await submitStudioForm(form.action,body,form.classList.contains('homepage-editor')?'homepage':form.classList.contains('collection-editor')?'collections':'advertising');form.dispatchEvent(new Event('studio-saved'));location.assign(url);}
  catch(error){saving=false;controls.forEach((c,i)=>c.disabled=disabled[i]);form.setAttribute('aria-busy','false');status.textContent=studioSaveMessage(error);}
 });
}
