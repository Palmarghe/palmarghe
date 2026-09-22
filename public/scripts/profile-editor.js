(()=>{
  const account=document.querySelector('.account-content');
  if(!account||!account.querySelector('input[value="logout"]'))return;
  const locale=document.documentElement.lang==='en'?'en':'tr';
  const old=account.querySelector('form:has(input[value="profile"])');
  const panel=document.createElement('section');
  panel.className='profile-card';
  const choices=Array.from({length:20},(_,i)=>`avatar-${String(i+1).padStart(2,'0')}`);
  panel.innerHTML=`<div class="profile-summary"><div class="profile-avatar" data-avatar><img src="/avatars/avatar-01.webp" alt=""></div><span class="profile-badge">${locale==='tr'?'PALMARGHE ÜYESİ':'PALMARGHE MEMBER'}</span></div><div><span class="eyebrow">${locale==='tr'?'PROFİL':'PROFILE'}</span><h2>${locale==='tr'?'Profiliniz':'Your profile'}</h2><p>${locale==='tr'?'Yorumlarda görünen adınızı, kısa tanıtımınızı ve hazır avatarınızı düzenleyin.':'Edit the name, short bio and preset avatar shown with your comments.'}</p><form><label class="field">${locale==='tr'?'Görünen ad':'Display name'}<input name="display_name" maxlength="100" required></label><label class="field">${locale==='tr'?'Kısa tanıtım':'Short bio'}<textarea name="bio" maxlength="500"></textarea></label><fieldset class="avatar-picker"><legend>${locale==='tr'?'Avatarınızı seçin':'Choose your avatar'}</legend><div>${choices.map((key,index)=>`<label><input type="radio" name="avatar_key" value="${key}" ${index===0?'checked':''}><img src="/avatars/${key}.webp" alt="Avatar ${index+1}" loading="lazy"></label>`).join('')}</div><small>${locale==='tr'?'Profil fotoğrafı yüklenmez; yalnız Palmarghe avatarları kullanılabilir.':'Profile photos are not uploaded; only Palmarghe avatars can be used.'}</small></fieldset><button class="button">${locale==='tr'?'Profili kaydet':'Save profile'}</button><span data-profile-status aria-live="polite"></span></form></div>`;
  (old?.parentElement||account).prepend(panel);old?.remove();
  const form=panel.querySelector('form');const status=panel.querySelector('[data-profile-status]');const avatar=panel.querySelector('[data-avatar] img');
  const render=(key)=>{avatar.src=`/avatars/${key}.webp`;};
  form.addEventListener('change',(event)=>{if(event.target.name==='avatar_key')render(event.target.value);});
  form.setAttribute('aria-busy','true');
  fetch('/api/profile/',{credentials:'same-origin'}).then((response)=>response.ok?response.json():Promise.reject()).then((profile)=>{form.elements.display_name.value=profile.display_name||'';form.elements.bio.value=profile.bio||'';const key=profile.avatar_key||'avatar-01';const input=form.querySelector(`input[value="${key}"]`);if(input)input.checked=true;render(key);}).catch(()=>{}).finally(()=>form.setAttribute('aria-busy','false'));
  form.addEventListener('submit',async(event)=>{event.preventDefault();status.textContent=locale==='tr'?'Kaydediliyor…':'Saving…';const response=await fetch('/api/profile/',{method:'POST',body:new FormData(form),credentials:'same-origin'});status.textContent=response.ok?(locale==='tr'?'Profil kaydedildi.':'Profile saved.'):(locale==='tr'?'Profil kaydedilemedi.':'Could not save profile.');});
})();
