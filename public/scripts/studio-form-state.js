(() => {
  for (const form of document.querySelectorAll('.homepage-editor,.advertising-form')) {
    const controls = [...form.querySelectorAll('input,select,textarea')];
    const snapshot = () => controls.map(el => ({ value: el.value, checked: el.checked, selected: el.tagName === 'SELECT' ? [...el.options].map(o => o.selected) : null }));
    const initial = snapshot(); let dirty = false, leaving = false;
    const bar = document.createElement('div'); bar.className = 'studio-change-bar';
    const state = document.createElement('span'); state.setAttribute('role','status'); state.textContent = 'Kaydedilmiş ayarlar';
    const undo = document.createElement('button'); undo.type = 'button'; undo.textContent = 'Değişiklikleri geri al'; undo.disabled = true;
    bar.append(state,undo); form.prepend(bar);
    const update = () => { dirty = JSON.stringify(snapshot()) !== JSON.stringify(initial); undo.disabled = !dirty; state.textContent = dirty ? 'Kaydedilmemiş değişiklikler' : 'Kaydedilmiş ayarlar'; };
    form.addEventListener('input',update); form.addEventListener('change',update);
    undo.addEventListener('click',() => { controls.forEach((el,i) => { el.value = initial[i].value; if ('checked' in el) el.checked = initial[i].checked; if (initial[i].selected) [...el.options].forEach((o,j)=>o.selected=initial[i].selected[j]); }); form.dispatchEvent(new Event('input',{bubbles:true})); update(); });
    form.addEventListener('submit',event=> { queueMicrotask(()=>{leaving=!event.defaultPrevented;}); });
    form.addEventListener('studio-saved',()=>{leaving=true;});
    window.addEventListener('beforeunload',event=> { if (dirty && !leaving) event.preventDefault(); });
  }
  for (const preview of document.querySelectorAll('[data-homepage-preview],.hero-card-editor-preview,[data-ad-preview],.cover-editor-preview')) {
    const tools = document.createElement('div'); tools.className = 'studio-preview-tools'; tools.setAttribute('role','group'); tools.setAttribute('aria-label','Önizleme cihazı');
    for (const [mode,label] of [['desktop','Masaüstü'],['mobile','Mobil']]) {
      const button = document.createElement('button'); button.type='button'; button.textContent=label; button.setAttribute('aria-pressed',String(mode==='desktop'));
      button.addEventListener('click',()=> { preview.dataset.previewDevice=mode; for(const b of tools.children)b.setAttribute('aria-pressed',String(b===button)); }); tools.append(button);
    }
    preview.before(tools);
  }
})();
