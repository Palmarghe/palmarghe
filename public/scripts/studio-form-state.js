(() => {
  for (const form of document.querySelectorAll('.homepage-editor,.advertising-form')) {
    const controls = [...form.querySelectorAll('input,select,textarea')];
    const snapshot = () => controls.map(el => ({ value: el.value, checked: el.checked, selected: el.tagName === 'SELECT' ? [...el.options].map(o => o.selected) : null }));
    let initial = snapshot(); let dirty = false, leaving = false;
    const bar = document.createElement('div'); bar.className = 'studio-change-bar';
    const state = document.createElement('span'); state.setAttribute('role','status'); state.textContent = 'Kaydedilmiş ayarlar';
    const undo = document.createElement('button'); undo.type = 'button'; undo.textContent = 'Değişiklikleri geri al'; undo.disabled = true;
    bar.append(state,undo); form.prepend(bar);
    const summary = document.createElement('span'); summary.className='studio-change-summary'; bar.append(summary);
    const update = () => {
      const current=snapshot(); const changed=controls.filter((_el,i)=>JSON.stringify(current[i])!==JSON.stringify(initial[i]));
      dirty=changed.length>0; undo.disabled=!dirty;
      state.textContent=dirty?'Kaydedilmemiş değişiklikler':'Kaydedilmiş ayarlar';
      const names=[...new Set(changed.map(el=>el.closest('label')?.childNodes[0]?.textContent?.trim()||el.name).filter(Boolean))];
      summary.textContent=dirty?`${changed.length} alan değişti · ${names.slice(0,3).join(', ')}${names.length>3?'…':''}`:'';
    };
    form.addEventListener('input',update); form.addEventListener('change',update);
    undo.addEventListener('click',() => { controls.forEach((el,i) => { el.value = initial[i].value; if ('checked' in el) el.checked = initial[i].checked; if (initial[i].selected) [...el.options].forEach((o,j)=>o.selected=initial[i].selected[j]); }); form.dispatchEvent(new Event('input',{bubbles:true})); update(); });
    form.addEventListener('submit',event=> { queueMicrotask(()=>{leaving=!event.defaultPrevented;}); });
    form.addEventListener('studio-saved',()=>{initial=snapshot();leaving=true;update();state.textContent='Kaydedildi · '+new Date().toLocaleTimeString('tr-TR');});
    window.addEventListener('beforeunload',event=> { if (dirty && !leaving) event.preventDefault(); });
  }
  for (const preview of document.querySelectorAll('[data-homepage-preview],.hero-card-editor-preview,[data-ad-preview],.cover-editor-preview')) {
    const tools = document.createElement('div'); tools.className = 'studio-preview-tools'; tools.setAttribute('role','group'); tools.setAttribute('aria-label','Önizleme cihazı');
    for (const [mode,label] of [['desktop','Masaüstü'],['tablet','Tablet'],['mobile','Mobil']]) {
      const button = document.createElement('button'); button.type='button'; button.textContent=label; button.setAttribute('aria-pressed',String(mode==='desktop'));
      button.addEventListener('click',()=> { preview.dataset.previewDevice=mode; for(const b of tools.children)b.setAttribute('aria-pressed',String(b===button)); }); tools.append(button);
    }
    preview.before(tools);
  }
  const home=document.querySelector('.homepage-editor');
  const preview=document.querySelector('[data-homepage-preview]');
  if(home&&preview){
    for(const [selector,name,label] of [['[data-preview-title]','hero_title_tr','Vitrin başlığını düzenle'],['[data-preview-eyebrow]','hero_eyebrow_tr','Vitrin üst başlığını düzenle'],['[data-preview-desc]','hero_descriptor_tr','Vitrin açıklamasını düzenle']]){
      const target=preview.querySelector(selector),input=home.elements.namedItem(name);if(!target||!input)continue;
      target.tabIndex=0;target.setAttribute('role','button');target.setAttribute('aria-label',label);
      const focus=()=>{input.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});input.focus({preventScroll:true});};
      target.addEventListener('click',focus);target.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();focus();}});
    }
  }
})();
