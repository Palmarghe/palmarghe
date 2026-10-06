(() => {
  const form = document.querySelector('.homepage-editor');
  const preview = document.querySelector('[data-homepage-preview]');
  if (!form) return;
  const field = (name) => form.querySelector(`[name="${name}"]`);
  const card = form.querySelector('.hero-card-editor-preview');
  const render = () => {
    const title = field('hero_title_tr')?.value.trim() || 'Dijital işler için bir yayın alanı.';
    const eyebrow = field('hero_eyebrow_tr')?.value.trim() || 'PALMARGHE — BAĞIMSIZ DİJİTAL YAYIN';
    const desc = field('hero_descriptor_tr')?.value.trim() || 'Yapay zekâ, oyunlar, Football Manager ve dijital deneyler.';
    const visible = field('hero_visible')?.checked;
    const mode = field('hero_mode')?.value || 'compact';
    if(preview){preview.className = `homepage-live-preview mode-${mode}${visible ? '' : ' is-hidden'}`;
    preview.querySelector('[data-preview-eyebrow]').textContent = eyebrow;
    preview.querySelector('[data-preview-title]').textContent = title;
    preview.querySelector('[data-preview-desc]').textContent = desc;
    preview.querySelector('[data-preview-state]').textContent = visible ? 'Canlı önizleme' : 'Vitrin gizli';
    let artwork=preview.querySelector('[data-preview-artwork]');
    if(!artwork){artwork=document.createElement('img');artwork.dataset.previewArtwork='';artwork.alt='';preview.append(artwork);}
    const heroMedia=field('hero_media_id')?.value;
    const heroSource=heroMedia?'/api/media/'+heroMedia+'/':field('hero_image_url')?.value.trim()||'/visuals/hero-glass.webp';
    try {const url=new URL(heroSource,location.origin);artwork.hidden=mode==='text';if(url.origin===location.origin||url.protocol==='https:')artwork.src=url.href;else artwork.hidden=true;}catch{artwork.hidden=true;}}
    if(card){
      const choice=field('preview_content_id');
      const selected=choice?.selectedOptions[0];
      const source=selected?.dataset.title ? selected : [...choice.options].find(option=>option.value);
      const media=field('preview_media_id')?.value;
      const image=media ? '/api/media/'+media+'/' : source?.dataset.image;
      const img=card.querySelector('[data-card-image]');
      img.hidden=!image;
      if(image)img.src=image;else img.removeAttribute('src');
      card.querySelector('[data-card-frame]').style.aspectRatio=field('preview_ratio')?.value||'16/9';
      const zoom=Number(field('preview_zoom')?.value||100);
      const position=(field('preview_focus_x')?.value||50)+'% '+(field('preview_focus_y')?.value||50)+'%';
      img.style.transform='scale('+zoom/100+')';
      img.style.transformOrigin=position;
      form.querySelector('[data-card-zoom]').textContent=zoom+'%';
      img.style.objectFit=field('preview_fit')?.value||'contain';
      img.style.objectPosition=position;
      card.style.maxWidth=(field('preview_width')?.value||420)+'px';
      form.querySelector('[data-card-width]').textContent=(field('preview_width')?.value||420)+' px';
      card.querySelector('[data-card-label]').textContent=field('preview_label_tr')?.value.trim()||'VİTRİNDEN';
      card.querySelector('[data-card-title]').textContent=field('preview_title_tr')?.value.trim()||source?.dataset.title||'Yayınlanmış içerik seç';
      card.querySelector('[data-card-state]').textContent=!field('preview_visible')?.checked?'Kart gizli':!visible?'Vitrin gizli':mode!=='compact'?'Kart yalnız sade vitrinde görünür':'Kart gösteriliyor';
      card.classList.toggle('is-hidden',!field('preview_visible')?.checked||!visible||mode!=='compact');
    }
  };
  form.querySelector('[data-card-reset]')?.addEventListener('click',()=>{field('preview_zoom').value='100';field('preview_fit').value='contain';field('preview_position').value='center';field('preview_focus_x').value='50';field('preview_focus_y').value='50';form.dispatchEvent(new Event('input',{bubbles:true}));});
  form.addEventListener('input', event=>{if(event.target===field('preview_focus_x')||event.target===field('preview_focus_y')){field('preview_fit').value='cover';if(Number(field('preview_zoom').value)===100)field('preview_zoom').value='125';}render();}); form.addEventListener('change', event=>{if(event.target===field('preview_position')){const coords={center:[50,50],top:[50,0],bottom:[50,100],left:[0,50],right:[100,50]}[event.target.value];field('preview_focus_x').value=coords[0];field('preview_focus_y').value=coords[1];field('preview_fit').value='cover';if(Number(field('preview_zoom').value)===100)field('preview_zoom').value='125';}render();}); render();
})();
