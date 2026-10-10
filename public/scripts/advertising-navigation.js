(() => {
  const status = document.querySelector('[data-ad-jump-status]');
  const open = (id, focus) => {
    const target = document.getElementById(id); if (!target) return false;
    document.querySelectorAll('.sponsor-editor').forEach(item => {item.open=item===target;item.classList.toggle('is-editing',item===target);});
    target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    if(focus)target.querySelector('input,select')?.focus({preventScroll:true});
    if(status)status.textContent=`${target.querySelector('h3')?.textContent||'Reklam alanı'} düzenlemeye hazır.`;
    return true;
  };
  document.querySelectorAll('[data-ad-jump]').forEach(card=>card.addEventListener('click',event=>{const id=card.dataset.adJump;if(open(id,true)){event.preventDefault();history.replaceState(null,'',`#${id}`);}}));
  if(location.hash.startsWith('#ad-'))open(location.hash.slice(1),false);
})();
