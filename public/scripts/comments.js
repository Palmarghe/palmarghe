(() => {
 const article=document.querySelector('.content-detail');if(!article||document.querySelector('.comments-section'))return;
 const path=location.pathname,tr=!path.startsWith('/en/'),say=(a,b)=>tr?a:b;
 const section=document.createElement('section');section.className='comments-section';section.setAttribute('aria-labelledby','comments-title');
 section.innerHTML=`<div class="comments-head"><span class="eyebrow">${say('TOPLULUK','COMMUNITY')}</span><h2 id="comments-title">${say('Yorumlar','Comments')}</h2></div><p class="comments-status" role="status"></p><button type="button" class="text-link comments-retry" hidden>${say('Yorumları yeniden yükle','Reload comments')}</button><div class="comments-list" aria-busy="true"></div><div class="comments-composer"></div>`;article.insertAdjacentElement('afterend',section);
 const status=section.querySelector('.comments-status'),retry=section.querySelector('.comments-retry'),list=section.querySelector('.comments-list'),composer=section.querySelector('.comments-composer');
 const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
 let reading=false,readFailed=false,posting=false,viewer=null,form=null,pending=null,storageKey=null;
 const announce=text=>{status.hidden=false;status.textContent=text;};
 const timedFetch=async(url,options={})=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{return await fetch(url,{...options,credentials:'same-origin',signal:controller.signal});}finally{clearTimeout(timer);}};
 const remember=()=>{try{if(storageKey){if(pending)sessionStorage.setItem(storageKey,JSON.stringify(pending));else sessionStorage.removeItem(storageKey);}}catch{/* In-place delivery remains safe if storage is unavailable. */}};
 const attachComposer=data=>{
  const nextViewer=data.authenticated?data.viewer_id:null;
  if(viewer===nextViewer&&composer.childElementCount)return;
  viewer=nextViewer;composer.replaceChildren();form=null;pending=null;storageKey=viewer?`palmarghe-comment:${viewer}:${path}`:null;
  if(!viewer){composer.innerHTML=`<p class="comment-login">${say('Yorum yapmak için','To comment,')} <a href="${tr?'/account/':'/en/account/'}">${say('üye girişi yapın','sign in')}</a>.</p>`;return;}
  form=document.createElement('form');form.className='comment-form';form.setAttribute('aria-busy','false');
  form.innerHTML=`<label for="comment-body">${say('Yorumunuz','Your comment')}</label><textarea id="comment-body" name="body" minlength="2" maxlength="2000" required></textarea><span><small data-count>0 / 2000</small><button class="button" type="submit">${say('Yorum gönder','Post comment')}</button></span><p class="comment-delivery-status" role="status"></p>`;composer.append(form);
  const textarea=form.querySelector('textarea'),count=form.querySelector('[data-count]'),button=form.querySelector('button'),delivery=form.querySelector('.comment-delivery-status');
  try{const stored=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(stored&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(stored.request)&&typeof stored.body==='string'&&stored.body.length>=2&&stored.body.length<=2000)pending=stored;}catch{/* Invalid local recovery data is ignored. */}
  const updateCount=()=>{count.textContent=`${textarea.value.length} / 2000`;};textarea.addEventListener('input',updateCount);
  const uncertain=()=>{pending.uncertain=true;remember();textarea.readOnly=true;button.textContent=say('Gönderimi doğrula','Verify submission');delivery.textContent=say('Sonuç doğrulanamadı. Metnin korundu; aynı gönderimi güvenle tekrar deneyebilirsin.','The result could not be confirmed. Your text is retained; safely retry the same submission.');};
  if(pending){textarea.value=pending.body;updateCount();uncertain();}
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(posting)return;
   const body=pending?.body??textarea.value.trim();if(body.length<2||body.length>2000)return;
   if(!pending)pending={body,request:crypto.randomUUID(),uncertain:false};remember();posting=true;form.setAttribute('aria-busy','true');button.disabled=true;textarea.readOnly=true;delivery.textContent=say('Yorum gönderiliyor…','Posting comment…');
   const payload=new FormData();payload.append('path',path);payload.append('body',pending.body);payload.append('request_id',pending.request);payload.append('viewer_id',viewer);
   try{
    const response=await timedFetch('/api/comments/',{method:'POST',body:payload});
    if(!response.ok){if(response.status>=500||response.status===408||response.status===429)throw new Error('uncertain');if(pending.uncertain){uncertain();if(response.status===401)delivery.textContent=say('Oturum değişti. İlk gönderimin sonucu belirsiz; metin ve gönderim anahtarı korundu. Aynı hesapla giriş yapıp doğrula.','The session changed. The first outcome is uncertain; its text and delivery key are retained. Sign in with the same account and verify.');return;}pending=null;remember();textarea.readOnly=false;button.textContent=say('Yorum gönder','Post comment');delivery.textContent=response.status===401?say('Oturumun sona erdi. Metnin burada duruyor; tekrar giriş yap.','Your session expired. Your text remains here; sign in again.'):say('Yorum kaydedilemedi. Metnin korundu; kontrol edip tekrar deneyebilirsin.','Comment was rejected. Your text remains; review it and retry.');return;}
    const result=await response.json();if(result.ok!==true||result.viewer_id!==viewer||typeof result.created!=='boolean'||typeof result.removed!=='boolean'||(result.removed?result.id!==null||result.created:typeof result.id!=='string'))throw new Error('uncertain');
    pending=null;remember();textarea.value='';textarea.readOnly=false;updateCount();button.textContent=say('Yorum gönder','Post comment');delivery.textContent=result.removed?say('Bu gönderim daha önce işlendi ve yorum kaldırıldı. Tekrar oluşturulmadı.','This submission was already processed and removed. It was not recreated.'):say('Yorum kaydedildi.','Comment posted.');await load();
   }catch{uncertain();}finally{posting=false;form?.setAttribute('aria-busy','false');button.disabled=false;}
  });
 };
 const load=async()=>{
  if(reading)return;reading=true;retry.disabled=true;list.setAttribute('aria-busy','true');announce(say('Yorumlar yükleniyor…','Loading comments…'));
  try{const response=await timedFetch(`/api/comments/?path=${encodeURIComponent(path)}`);if(!response.ok)throw new Error('read failed');const data=await response.json();if(!Array.isArray(data.comments))throw new Error('invalid response');
   list.innerHTML=data.comments.length?data.comments.map(comment=>`<article class="comment"><div class="comment-avatar"><img src="/avatars/${escape(/^avatar-(0[1-9]|1[0-9]|20)$/.test(comment.avatar_key)?comment.avatar_key:'avatar-01')}.webp" alt="" loading="lazy"></div><div><header><strong>${escape(comment.display_name)}</strong><time datetime="${escape(comment.created_at)}">${new Date(comment.created_at).toLocaleDateString(tr?'tr-TR':'en-US')}</time></header><p>${escape(comment.body).replace(/\n/g,'<br>')}</p></div></article>`).join(''):`<p class="empty-comment">${say('İlk yorumu siz yazın.','Be the first to comment.')}</p>`;
   attachComposer(data);readFailed=false;retry.hidden=false;retry.textContent=say('Yorumları yenile','Refresh comments');status.hidden=true;
  }catch{readFailed=true;retry.hidden=false;announce(say('Yorumlar şu anda yüklenemiyor. Mevcut metin ve yorumlar korundu.','Comments could not be loaded. Existing text and comments are retained.'));}
  finally{reading=false;retry.disabled=false;list.setAttribute('aria-busy','false');}
 };
 retry.addEventListener('click',()=>load());window.addEventListener('online',()=>{if(readFailed&&!posting)load();});load();
})();
