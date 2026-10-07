(() => {
 const tr=document.documentElement.lang!=='en',say=(a,b)=>tr?a:b,pending=new WeakMap(),feedback=new WeakMap();
 const announce=(button,text)=>{let status=feedback.get(button);if(!status){status=document.createElement('span');status.dataset.actionStatus='';status.className='action-feedback';status.setAttribute('role','status');button.after(status);feedback.set(button,status);}status.textContent=text;};
 const send=async(button,payload)=>{
  if(button.disabled)return null;
  const viewer=button.dataset.libraryViewer;if(!viewer){location.assign(tr?'/account/':'/en/account/');return null;}
  if(!pending.has(button))pending.set(button,{...payload,viewer_id:viewer,...(payload.action==='notification_read'?{}:{desired:button.getAttribute('aria-pressed')!=='true'})});
  const request=pending.get(button);button.disabled=true;button.setAttribute('aria-busy','true');announce(button,say('Kaydediliyor…','Saving…'));
  const controller=new AbortController(),deadline=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch('/api/library/',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(request),signal:controller.signal});
   if(response.status===401){announce(button,say('Oturum değişti. Yeniden giriş yap; işlem otomatik tekrarlanmadı.','The session changed. Sign in again; no action was replayed.'));location.assign(tr?'/account/':'/en/account/');return null;}
   if(!response.ok)throw new Error('unconfirmed');const data=await response.json();
   const state={bookmark:'saved',like:'liked',follow:'following',notification_read:'read'}[request.action];
   if(!data || data.viewer_id!==viewer || data[state]!== (request.action==='notification_read'?true:request.desired) || (request.action==='like'&&(!Number.isInteger(data.count)||data.count<0)))throw new Error('unconfirmed');
   pending.delete(button);return data;
  }catch{announce(button,say('Sonuç doğrulanamadı. Aynı işlemi yeniden basarak güvenle doğrula.','The result could not be confirmed. Press again to safely verify the same action.'));return null;}
  finally{clearTimeout(deadline);button.disabled=false;button.removeAttribute('aria-busy');}
 };
 document.querySelectorAll('[data-bookmark]').forEach(button=>button.addEventListener('click',async()=>{const data=await send(button,{action:'bookmark',contentId:button.dataset.bookmark});if(!data)return;button.setAttribute('aria-pressed',String(data.saved));button.textContent=data.saved?say('Okuma listesinde','Saved for later'):say('Okuma listesine ekle','Save for later');announce(button,data.saved?say('Okuma listene eklendi.','Added to your reading list.'):say('Okuma listenden kaldırıldı.','Removed from your reading list.'));}));
 document.querySelectorAll('[data-like]').forEach(button=>button.addEventListener('click',async()=>{const data=await send(button,{action:'like',contentId:button.dataset.like});if(!data)return;button.setAttribute('aria-pressed',String(data.liked));button.textContent=`${data.liked?'♥':'♡'} ${tr?(data.liked?'Beğenildi':'Beğen'):(data.liked?'Liked':'Like')} · ${data.count}`;announce(button,data.liked?say('Beğenin kaydedildi.','Your like was saved.'):say('Beğenin kaldırıldı.','Your like was removed.'));}));
 document.querySelectorAll('[data-follow-id]').forEach(button=>button.addEventListener('click',async()=>{const data=await send(button,{action:'follow',targetKind:button.dataset.followKind,targetId:button.dataset.followId});if(!data)return;button.textContent=data.following?say('Takip ediliyor','Following'):say('Takip et','Follow');button.setAttribute('aria-pressed',String(data.following));announce(button,data.following?say('Takip başladı.','You are now following.'):say('Takip kaldırıldı.','Unfollowed.'));}));
 document.querySelectorAll('[data-notification-read]').forEach(button=>button.addEventListener('click',async()=>{const data=await send(button,{action:'notification_read',notificationId:Number(button.dataset.notificationRead)});if(!data)return;button.closest('li')?.classList.remove('is-unread');button.hidden=true;announce(button,say('Okundu olarak işaretlendi.','Marked as read.'));}));
})();
