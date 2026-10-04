(() => {
  const form = document.querySelector('.advertising-form');
  const panel = document.querySelector('[data-ad-preview]');
  if (!form || !panel) return;
  const render = () => {
    ['header','article','footer'].forEach((name) => {
      const card = panel.querySelector(`[data-preview-placement="${name}"]`); if (!card) return;
      const read = (suffix) => form.querySelector(`[name="${name}_${suffix}"]`)?.value?.trim() || '';
      const visible = form.querySelector(`[name="${name}_visible"]`)?.checked;
      card.classList.toggle('is-hidden', !visible);
      card.querySelector('strong').textContent = read('title') || 'Başlık bekliyor';
      card.querySelector('small').textContent = read('description') || 'Kısa açıklama';
      card.querySelector('em').textContent = read('cta') || 'İncele';
      let img=card.querySelector('img');if(!img){img=document.createElement('img');img.alt='';card.prepend(img);}
      const source=read('image_url');img.hidden=!source;
      if(source){try{const url=new URL(source,location.origin);if(url.origin===location.origin||url.protocol==='https:')img.src=url.href;else img.hidden=true;}catch{img.hidden=true;}}
      const mobile=panel.dataset.previewDevice==='mobile';const device=read('device');
      card.hidden=!visible||(device==='mobile'&&!mobile)||(device==='desktop'&&mobile);
    });
  };
  new MutationObserver(render).observe(panel,{attributes:true,attributeFilter:['data-preview-device']});
  form.addEventListener('input', render); form.addEventListener('change', render); render();
})();
