(() => {
  const button = document.querySelector('[data-bookmark]');
  if (!button) return;
  const contentId = button.dataset.bookmark;
  button.addEventListener('click', async () => {
    if (!contentId) return;
    button.disabled = true;
    try {
      const response = await fetch('/api/library/', { method:'POST', headers:{'content-type':'application/json'}, credentials:'same-origin', body:JSON.stringify({action:'bookmark',contentId}) });
      const tr=document.documentElement.lang!=='en';
      if (response.status === 401) { window.location.assign(tr?'/account/':'/en/account/'); return; }
      if(!response.ok) throw new Error('Bookmark unavailable');
      const data = await response.json();
      if(typeof data.saved!=='boolean') throw new Error('Invalid bookmark response');
      button.setAttribute('aria-pressed', String(Boolean(data.saved)));
      button.textContent = data.saved ? (tr?'Okuma listesinde':'Saved for later') : (tr?'Okuma listesine ekle':'Save for later');
    } catch { button.textContent = document.documentElement.lang==='en'?'Try again':'Tekrar dene'; }
    finally { button.disabled = false; }
  });
})();
;(()=>{
  const button=document.querySelector('[data-like]');
  if(!button)return;
  button.addEventListener('click',async()=>{
    if(button.disabled)return;
    const tr=document.documentElement.lang!=='en';
    button.disabled=true;
    try{
      const response=await fetch('/api/library/',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({action:'like',contentId:button.dataset.like}),signal:AbortSignal.timeout(10000)});
      if(response.status===401){window.location.assign(tr?'/account/':'/en/account/');return;}
      if(!response.ok)throw new Error('Like unavailable');
      const data=await response.json();
      if(typeof data.liked!=='boolean'||!Number.isInteger(data.count)||data.count<0)throw new Error('Invalid like response');
      button.setAttribute('aria-pressed',String(data.liked));
      button.textContent=`${data.liked?'♥':'♡'} ${tr?(data.liked?'Beğenildi':'Beğen'):(data.liked?'Liked':'Like')} · ${data.count}`;
    }catch{button.textContent=tr?'Tekrar dene':'Try again';}
    finally{button.disabled=false;}
  });
})();
;(()=>{document.querySelectorAll('[data-notification-read]').forEach((button)=>button.addEventListener('click',async()=>{const response=await fetch('/api/library/',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({action:'notification_read',notificationId:Number(button.dataset.notificationRead)})});if(response.ok){button.closest('li')?.classList.remove('is-unread');button.remove();}}));})();

;(()=>{document.querySelectorAll('[data-follow-id]').forEach((button)=>button.addEventListener('click',async()=>{const response=await fetch('/api/library/',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({action:'follow',targetKind:button.dataset.followKind,targetId:button.dataset.followId})});if(response.ok){const data=await response.json();const tr=document.documentElement.lang!=='en';button.textContent=data.following?(tr?'Takip ediliyor':'Following'):(tr?'Takip et':'Follow');button.setAttribute('aria-pressed',String(data.following));}}));})();
