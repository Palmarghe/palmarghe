(() => {
 const hero=document.querySelector('[data-hero-editable]');if(!hero)return;
 const text=(value,max)=>typeof value==='string'?value.slice(0,max):'';
 const source=value=>{try{const url=new URL(text(value,500),location.origin);return url.protocol==='https:'||url.origin===location.origin&&/^\/(visuals|api\/media)\//.test(url.pathname)?url.href:'';}catch{return '';}};
 const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
 const sendHeight=()=>parent.postMessage({type:'palmarghe-preview-height',height:Math.ceil(hero.getBoundingClientRect().bottom+16)},location.origin);
 const update=values=>{
  const locale=values.locale==='en'?'en':'tr';document.documentElement.lang=locale;
  document.body.dataset.theme=['light','dark','aurora'].includes(values.theme)?values.theme:'dark';
  const mode=['compact','editorial','text'].includes(values.mode)?values.mode:'compact';
  hero.className=`hero hero--${mode} wrap`;hero.hidden=values.visible===false;hero.style.display=hero.hidden?'none':'';
  const fields=[['.hero-copy>.eyebrow','eyebrow',100,'hero_eyebrow_'],['.hero-copy>h1','title',120,'hero_title_'],['.hero-copy>p','descriptor',260,'hero_descriptor_']];
  for(const [selector,key,max,name]of fields){const node=hero.querySelector(selector);node.textContent=text(values[key],max);node.dataset.previewField=name+locale;}
  const image=source(values.image);if(image)hero.querySelector('.hero-art').src=image;
  const card=hero.querySelector('.hero-preview');card.hidden=mode!=='compact'||values.cardVisible===false;card.style.display=card.hidden?'none':'';
  card.querySelector('strong').textContent=text(values.cardTitle,200);card.querySelector('.eyebrow').textContent=text(values.cardLabel,60);
  const cardImage=source(values.cardImage);const img=card.querySelector('img');img.hidden=!cardImage;if(cardImage)img.src=cardImage;
  card.style.setProperty('--preview-width',clamp(values.cardWidth,260,480,420)+'px');
  card.style.setProperty('--preview-zoom',String(clamp(values.cardZoom,100,200,100)/100));
  card.style.setProperty('--preview-position',clamp(values.cardX,0,100,50)+'% '+clamp(values.cardY,0,100,50)+'%');
  card.style.setProperty('--preview-ratio',['16/9','4/3','1/1'].includes(values.cardRatio)?values.cardRatio:'16/9');
  card.style.setProperty('--preview-fit',values.cardFit==='cover'?'cover':'contain');
  const links=hero.querySelectorAll('.hero-actions a');links[0].childNodes[0].textContent=locale==='en'?'Explore mods ':'Modları keşfet ';links[1].textContent=locale==='en'?'Listen to the music →':'Müziğe kulak ver →';
  sendHeight();
 };
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='palmarghe-preview-update'||!event.data.values||typeof event.data.values!=='object')return;update(event.data.values);});
 for(const field of hero.querySelectorAll('[data-preview-field]')){
  field.tabIndex=0;field.setAttribute('role','button');field.setAttribute('aria-label','Bu alanı düzenle');
  const select=()=>parent.postMessage({type:'palmarghe-preview-select',field:field.dataset.previewField},location.origin);
  field.addEventListener('click',event=>{event.preventDefault();select();});field.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});
 }
 document.addEventListener('click',event=>{if(event.target.closest('a'))event.preventDefault();});
 new ResizeObserver(sendHeight).observe(hero);window.addEventListener('load',()=>{parent.postMessage({type:'palmarghe-preview-ready'},location.origin);sendHeight();});
})();
