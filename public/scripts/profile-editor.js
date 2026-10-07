(()=>{
  const account=document.querySelector('.account-content');
  if(!account||!account.querySelector('input[value="logout"]'))return;
  const locale=document.documentElement.lang==='en'?'en':'tr';
  const old=account.querySelector('form:has(input[value="profile"])');
  const panel=document.createElement('section');
  panel.className='profile-card';
  const choices=Array.from({length:20},(_,i)=>`avatar-${String(i+1).padStart(2,'0')}`);
  panel.innerHTML=`<div class="profile-summary"><div class="profile-avatar" data-avatar><img src="/avatars/avatar-01.webp" alt=""></div><span class="profile-badge">${locale==='tr'?'PALMARGHE ÜYESİ':'PALMARGHE MEMBER'}</span></div><div><span class="eyebrow">${locale==='tr'?'PROFİL':'PROFILE'}</span><h2>${locale==='tr'?'Profiliniz':'Your profile'}</h2><p>${locale==='tr'?'Yorumlarda görünen adınızı, kısa tanıtımınızı ve hazır avatarınızı düzenleyin.':'Edit the name, short bio and preset avatar shown with your comments.'}</p><form><label class="field">${locale==='tr'?'Görünen ad':'Display name'}<input name="display_name" maxlength="100" required></label><label class="field">${locale==='tr'?'Kısa tanıtım':'Short bio'}<textarea name="bio" maxlength="500"></textarea></label><fieldset class="public-profile-settings"><legend>${locale==='tr'?'Yazar profili':'Author profile'}</legend><label class="field">${locale==='tr'?'Profil adresi':'Profile address'}<span class="profile-slug-prefix">/authors/</span><input name="author_slug" inputmode="url" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxlength="80" placeholder="ad-soyad"></label><label class="public-profile-toggle"><input type="checkbox" name="public_profile">${locale==='tr'?'Yazar profilimi ve yayımlanmış içeriklerimi herkese açık göster.':'Show my author profile and published work publicly.'}</label><small>${locale==='tr'?'Profil yalnız bu seçeneği açtığınızda ve geçerli bir adres verdiğinizde yayınlanır.':'Your profile is public only when this option is on and its address is valid.'}</small></fieldset><fieldset class="avatar-picker"><legend>${locale==='tr'?'Avatarınızı seçin':'Choose your avatar'}</legend><div>${choices.map((key,index)=>`<label><input type="radio" name="avatar_key" value="${key}" ${index===0?'checked':''}><img src="/avatars/${key}.webp" alt="Avatar ${index+1}" loading="lazy"></label>`).join('')}</div><small>${locale==='tr'?'Profil fotoğrafı yüklenmez; yalnız Palmarghe avatarları kullanılabilir.':'Profile photos are not uploaded; only Palmarghe avatars can be used.'}</small></fieldset><button class="button">${locale==='tr'?'Profili kaydet':'Save profile'}</button><span data-profile-status aria-live="polite"></span></form></div>`;
  (old?.parentElement||account).prepend(panel);old?.remove();
  const form=panel.querySelector('form');const status=panel.querySelector('[data-profile-status]');const avatar=panel.querySelector('[data-avatar] img');
  const render=(key)=>{avatar.src=`/avatars/${key}.webp`;};
  form.addEventListener('change',(event)=>{if(event.target.name==='avatar_key')render(event.target.value);});
  const retry=document.createElement('button');retry.type='button';retry.className='text-link';retry.hidden=true;retry.textContent=locale==='tr'?'Yeniden dene':'Try again';form.append(retry);
  status.setAttribute('role','status');status.tabIndex=-1;
  let ready=false,busy=false,viewerId=null;
  const timedFetch=async(options={})=>{const controller=new AbortController(),deadline=setTimeout(()=>controller.abort(),12000);try{const response=await fetch('/api/profile/',{...options,credentials:'same-origin',signal:controller.signal});const data=await response.json().catch(()=>null);return {response,data};}finally{clearTimeout(deadline);}};
  const message=(tr,en)=>locale==='tr'?tr:en;
  const controls=[...form.querySelectorAll('input,textarea,button')].filter(control=>control!==retry);
  const setBusy=value=>{busy=value;form.setAttribute('aria-busy',String(value));controls.forEach(control=>control.disabled=value||!ready);};
  const load=async()=>{
    if(busy)return;
    ready=false;retry.hidden=true;setBusy(true);status.textContent=message('Profil yükleniyor…','Loading profile…');
    try{
      const {response,data:profile}=await timedFetch();
      if(!response.ok)throw new Error('load');
            if(!profile || typeof profile.viewer_id!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile.viewer_id) || (profile.display_name!==null && typeof profile.display_name!=='string'))throw new Error('load');
      viewerId=profile.viewer_id;
      form.elements.display_name.value=profile.display_name||'';
      form.elements.display_name.minLength=2;
      form.elements.bio.value=profile.bio||'';form.elements.author_slug.value=profile.author_slug||'';
      form.elements.public_profile.checked=Boolean(profile.public_profile);
      const key=choices.includes(profile.avatar_key)?profile.avatar_key:'avatar-01';
      form.querySelector('input[value="'+key+'"]').checked=true;render(key);
      ready=true;status.textContent='';
    }catch{status.textContent=message('Profil yüklenemedi. Bilgilerinizi korumak için kayıt kapatıldı. Bağlantıyı kontrol edip yeniden deneyin.','Profile could not load. Saving is disabled to protect your details. Check your connection and try again.');retry.hidden=false;}
    finally{setBusy(false);}
  };
  retry.addEventListener('click',load);
  window.addEventListener('online',()=>{if(!ready&&!busy&&!retry.hidden)load();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!ready||busy)return;
    form.querySelectorAll('[aria-invalid]').forEach(control=>control.removeAttribute('aria-invalid'));
    const payload=new FormData(form);payload.set('viewer_id',viewerId); // Capture before disabling controls.
    setBusy(true);status.textContent=message('Kaydediliyor…','Saving…');
    try{
      const {response,data:result}=await timedFetch({method:'POST',body:payload});
      if(response.ok){if(result?.ok!==true || result.viewer_id!==viewerId)throw new Error('unconfirmed');status.textContent=message('Profil kaydedildi.','Profile saved.');return;}
      const error=result ?? {};
      if(error.error==='invalid_profile' && ['display_name','bio','author_slug','avatar_key'].includes(error.field)){
        const control=form.elements[error.field];if(control?.setAttribute)control.setAttribute('aria-invalid','true');
        const errors={display_name:message('Görünen ad 2–100 karakter olmalı.','Display name must be 2–100 characters.'),bio:message('Kısa tanıtım en fazla 500 karakter olmalı.','Short bio must be at most 500 characters.'),author_slug:message('Profil adresinde küçük harf, sayı ve kelimeler arasında tire kullanın.','Use lowercase letters, numbers and hyphens between words for the profile address.'),avatar_key:message('Hazır avatarlardan birini seçin.','Choose one of the preset avatars.')};status.textContent=errors[error.field];
      }else if(error.field==='author_slug'){
        form.elements.author_slug.setAttribute('aria-invalid','true');
        status.textContent=error.error==='author_slug_taken'?message('Bu profil adresi kullanılıyor. Başka bir adres seçin.','This profile address is taken. Choose another address.'):message('Herkese açık profil için bir profil adresi girin.','Enter a profile address to publish your profile.');
      }else status.textContent=response.status===401?message('Oturumunuz sona erdi. Sayfayı yenileyip yeniden giriş yapın.','Your session expired. Reload the page and sign in again.'):message('Profil kaydedilemedi. Bilgileriniz bu formda korunuyor; bağlantıyı kontrol edip yeniden deneyin.','Profile could not be saved. Your entries remain in this form; check your connection and try again.');
    }catch{status.textContent=message('Bağlantı kurulamadı veya kayıt sonucu doğrulanamadı. Bilgileriniz bu formda korunuyor; yeniden deneyin.','Connection failed or the save could not be confirmed. Your entries remain in this form; try again.');}
    finally{setBusy(false);}
  });
  load();
})();
