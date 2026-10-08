import {submitStudioForm,studioSaveMessage,type StudioSaveSection} from '../lib/studio-save';
const sections:Record<string,StudioSaveSection>={homepage:'homepage',advertising:'advertising',collection:'collections',appearance:'appearance',social:'settings',category:'categories',tag:'tags',navigation:'navigation',redirect:'redirects',comment:'comments',message:'messages',permission_group:'access',member_group:'members',member_account:'members',member_role:'users',deletion_request:'users'};
for(const form of document.querySelectorAll<HTMLFormElement>('form[action="/api/studio/"]')){
 const entity=String(new FormData(form).get('entity')??'');const section=sections[entity];if(!section)continue;
 const status=document.createElement('p');status.className='studio-settings-status';status.setAttribute('role','status');form.append(status);let saving=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(saving||!form.reportValidity())return;
  const body=new FormData(form);const button=(event as SubmitEvent).submitter as HTMLButtonElement|null;if(button?.name)body.set(button.name,button.value);
  const controls=[...form.querySelectorAll<HTMLInputElement|HTMLButtonElement|HTMLSelectElement|HTMLTextAreaElement>('input,button,select,textarea')];const disabled=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);saving=true;form.setAttribute('aria-busy','true');status.textContent='Kaydediliyor…';
  try{const url=await submitStudioForm(form.action,body,section);form.dispatchEvent(new Event('studio-saved'));location.assign(url);}
  catch(error){saving=false;controls.forEach((c,i)=>c.disabled=disabled[i]);form.setAttribute('aria-busy','false');status.textContent=studioSaveMessage(error);}
 });
}
