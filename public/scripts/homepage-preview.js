(() => {
  const form = document.querySelector('.homepage-editor');
  const preview = document.querySelector('[data-homepage-preview]');
  if (!form || !preview) return;
  const field = (name) => form.querySelector(`[name="${name}"]`);
  const card = form.querySelector('.hero-card-editor-preview');
  const render = () => {
    const title = field('hero_title_tr')?.value.trim() || 'Dijital işler için bir yayın alanı.';
    const eyebrow = field('hero_eyebrow_tr')?.value.trim() || 'PALMARGHE — BAĞIMSIZ DİJİTAL YAYIN';
    const desc = field('hero_descriptor_tr')?.value.trim() || 'Yapay zekâ, oyunlar, Football Manager ve dijital deneyler.';
    const visible = field('hero_visible')?.checked;
    const mode = field('hero_mode')?.value || 'compact';
    preview.className = `homepage-live-preview mode-${mode}${visible ? '' : ' is-hidden'}`;
    preview.querySelector('[data-preview-eyebrow]').textContent = eyebrow;
    preview.querySelector('[data-preview-title]').textContent = title;
    preview.querySelector('[data-preview-desc]').textContent = desc;
    preview.querySelector('[data-preview-state]').textContent = visible ? 'Canlı önizleme' : 'Vitrin gizli';
    if(card){
      const choice=field('preview_content_id');
      const selected=choice?.selectedOptions[0];
      const source=selected?.dataset.title ? selected : [...choice.options].find(option=>option.value);
      const media=field('preview_media_id')?.value;
      const image=media ? '/api/media/'+media+'/' : source?.dataset.image;
      const img=card.querySelector('[data-card-image]');
      img.hidden=!image;
      if(image)img.src=image;else img.removeAttribute('src');
      img.style.aspectRatio=field('preview_ratio')?.value||'16/9';
      img.style.objectFit=field('preview_fit')?.value||'contain';
      img.style.objectPosition=field('preview_position')?.value||'center';
      card.style.maxWidth=(field('preview_width')?.value||420)+'px';
      form.querySelector('[data-card-width]').textContent=(field('preview_width')?.value||420)+' px';
      card.querySelector('[data-card-label]').textContent=field('preview_label_tr')?.value.trim()||'VİTRİNDEN';
      card.querySelector('[data-card-title]').textContent=field('preview_title_tr')?.value.trim()||source?.dataset.title||'Yayınlanmış içerik seç';
      card.querySelector('[data-card-state]').textContent=!field('preview_visible')?.checked?'Kart gizli':!visible?'Vitrin gizli':mode!=='compact'?'Kart yalnız sade vitrinde görünür':'Kart gösteriliyor';
      card.classList.toggle('is-hidden',!field('preview_visible')?.checked||!visible||mode!=='compact');
    }
  };
  form.addEventListener('input', render); form.addEventListener('change', render); render();
})();
