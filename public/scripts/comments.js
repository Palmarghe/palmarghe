(() => {
  const article = document.querySelector('.content-detail');
  if (!article) return;
  const path = location.pathname;
  const locale = path.startsWith('/en/') ? 'en' : 'tr';
  const section = document.createElement('section');
  section.className = 'comments-section';
  section.setAttribute('aria-labelledby','comments-title');
  section.innerHTML = `<div class="comments-head"><span class="eyebrow">${locale === 'tr' ? 'TOPLULUK' : 'COMMUNITY'}</span><h2 id="comments-title">${locale === 'tr' ? 'Yorumlar' : 'Comments'}</h2></div><p class="comments-status" aria-live="polite">${locale === 'tr' ? 'Yorumlar yükleniyor…' : 'Loading comments…'}</p><div class="comments-list"></div>`;
  article.insertAdjacentElement('afterend',section);
  const status = section.querySelector('.comments-status');
  const list = section.querySelector('.comments-list');
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g,(char)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[char]);
  const load = async () => {
    const response = await fetch(`/api/comments/?path=${encodeURIComponent(path)}`,{ credentials:'same-origin' });
    if (!response.ok) { status.textContent = locale === 'tr' ? 'Yorumlar şu anda yüklenemiyor.' : 'Comments are unavailable.'; return; }
    const data = await response.json();
    list.innerHTML = data.comments.length ? data.comments.map((comment) => `<article class="comment"><div class="comment-avatar"><img src="/avatars/${escape(comment.avatar_key||'avatar-01')}.webp" alt="" loading="lazy"></div><div><header><strong>${escape(comment.display_name)}</strong><time datetime="${escape(comment.created_at)}">${new Date(comment.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</time></header><p>${escape(comment.body).replace(/\n/g,'<br>')}</p></div></article>`).join('') : `<p class="empty-comment">${locale === 'tr' ? 'İlk yorumu siz yazın.' : 'Be the first to comment.'}</p>`;
    status.hidden = true;
    if (data.authenticated) {
      const form = document.createElement('form');
      form.className = 'comment-form';
      form.innerHTML = `<label for="comment-body">${locale === 'tr' ? 'Yorumunuz' : 'Your comment'}</label><textarea id="comment-body" name="body" minlength="2" maxlength="2000" required></textarea><span><small data-count>0 / 2000</small><button class="button" type="submit">${locale === 'tr' ? 'Yorum gönder' : 'Post comment'}</button></span>`;
      const textarea = form.querySelector('textarea');
      const count = form.querySelector('[data-count]');
      textarea.addEventListener('input',()=>{ count.textContent=`${textarea.value.length} / 2000`; });
      form.addEventListener('submit',async (event)=>{ event.preventDefault(); const body=textarea.value.trim(); if (body.length<2) return; const payload=new FormData(); payload.append('path',path); payload.append('body',body); const result=await fetch('/api/comments/',{ method:'POST',body:payload,credentials:'same-origin' }); if (result.ok) { form.remove(); status.hidden=false; status.textContent=locale==='tr'?'Yorum kaydedildi.':'Comment posted.'; await load(); } else { status.hidden=false; status.textContent=locale==='tr'?'Yorum kaydedilemedi.':'Comment could not be posted.'; } });
      section.append(form);
    } else {
      const notice=document.createElement('p'); notice.className='comment-login'; notice.innerHTML=`${locale === 'tr' ? 'Yorum yapmak için' : 'To comment,'} <a href="${locale === 'tr' ? '/account/' : '/en/account/'}">${locale === 'tr' ? 'üye girişi yapın' : 'sign in'}</a>.`; section.append(notice);
    }
  };
  load().catch(()=>{ status.textContent=locale==='tr'?'Yorumlar şu anda yüklenemiyor.':'Comments are unavailable.'; });
})();
