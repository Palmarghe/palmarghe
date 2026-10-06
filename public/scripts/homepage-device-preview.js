(() => {
 const form=document.querySelector('.homepage-editor'),panel=document.querySelector('[data-device-preview]');if(!form||!panel)return;
 const frame=panel.querySelector('[data-device-frame]'),viewport=panel.querySelector('[data-device-viewport]'),status=panel.querySelector('[data-device-status]'),retry=panel.querySelector('[data-device-retry]');
 const field=name=>form.elements.namedItem(name);
 const value=name=>field(name)?.value??'';
 let width=1440,height=700,ready=false,loadTimer;
 const scale=()=>{const ratio=Math.min(1,viewport.clientWidth/width);frame.style.width=width+'px';frame.style.height=height+'px';frame.style.transform=`scale(${ratio})`;viewport.style.height=Math.ceil(height*ratio)+'px';};
 const update=()=>{
  if(!ready)return;const locale=panel.querySelector('[data-device-locale]').value;
  const selected=field('preview_content_id')?.selectedOptions?.[0];
  const theme=document.body.dataset.theme;
  frame.contentWindow.postMessage({type:'palmarghe-preview-update',values:{locale,theme,visible:field('hero_visible')?.checked!==false,mode:value('hero_mode'),eyebrow:value('hero_eyebrow_'+locale)||'PALMARGHE',title:value('hero_title_'+locale)||(locale==='tr'?'Dijital işler için bir yayın alanı.':'A publishing space for digital work.'),descriptor:value('hero_descriptor_'+locale),image:value('hero_media_id')?'/api/media/'+value('hero_media_id')+'/':value('hero_image_url')||'/visuals/hero-glass.webp',cardVisible:field('preview_visible')?.checked!==false,cardTitle:value('preview_title_'+locale)||selected?.dataset.title||'Yayınlanmış içerik seç',cardLabel:value('preview_label_'+locale)||(locale==='tr'?'VİTRİNDEN':'IN THE SHOWCASE'),cardImage:value('preview_media_id')?'/api/media/'+value('preview_media_id')+'/':selected?.dataset.image,cardWidth:value('preview_width'),cardZoom:value('preview_zoom'),cardX:value('preview_focus_x'),cardY:value('preview_focus_y'),cardRatio:value('preview_ratio'),cardFit:value('preview_fit')}},location.origin);
  status.textContent=field('hero_visible')?.checked===false?'Vitrin gizli':`${width}px · Kaydedilmemiş değerler önizlenir`;
 };
 const allowed=new Set(['hero_title_tr','hero_title_en','hero_eyebrow_tr','hero_eyebrow_en','hero_descriptor_tr','hero_descriptor_en','hero_image_url','preview_content_id']);
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
  if(event.data?.type==='palmarghe-preview-ready'){clearTimeout(loadTimer);ready=true;retry.hidden=true;update();scale();}
  else if(event.data?.type==='palmarghe-preview-height'&&Number.isFinite(event.data.height)){height=Math.max(100,Math.min(1600,event.data.height));scale();}
  else if(event.data?.type==='palmarghe-preview-select'&&allowed.has(event.data.field)){const input=field(event.data.field);input?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});input?.focus({preventScroll:true});}
 });
 for(const button of panel.querySelectorAll('[data-device-width]'))button.addEventListener('click',()=>{width=Number(button.dataset.deviceWidth);for(const other of panel.querySelectorAll('[data-device-width]'))other.setAttribute('aria-pressed',String(other===button));scale();update();});
 form.addEventListener('input',update);form.addEventListener('change',update);panel.querySelector('[data-device-locale]').addEventListener('change',update);
 let observedWidth=-1;
 new ResizeObserver(entries=>{const nextWidth=entries[0].contentRect.width;if(nextWidth===observedWidth)return;observedWidth=nextWidth;requestAnimationFrame(scale);}).observe(viewport);
 new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
 const unavailable=()=>{ready=false;retry.hidden=false;status.textContent='Önizleme açılamadı. Alanların korunuyor; oturumunu ve bağlantını kontrol edip yeniden dene.';};
 const loaded=()=>{clearTimeout(loadTimer);try{if(!frame.contentDocument?.querySelector('[data-hero-editable]')){unavailable();return;}ready=true;retry.hidden=true;update();scale();}catch{unavailable();}};
 frame.addEventListener('load',loaded);
 frame.addEventListener('error',unavailable);
 retry.addEventListener('click',()=>{clearTimeout(loadTimer);ready=false;retry.hidden=true;status.textContent='Önizleme yeniden yükleniyor…';loadTimer=setTimeout(unavailable,15000);frame.src='/studio/preview/homepage/';});
 loadTimer=setTimeout(unavailable,15000);
 try{if(frame.contentDocument?.readyState==='complete'&&frame.contentWindow.location.pathname==='/studio/preview/homepage/')loaded();}catch{unavailable();}
 scale();
})();
