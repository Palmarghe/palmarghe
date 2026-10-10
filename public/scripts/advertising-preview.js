(() => {
  const form=document.querySelector('.advertising-form');if(!form)return;
  const render=()=>{
    ['header','article','footer'].forEach(name=>{
      const card=form.querySelector(`[data-preview-placement="${name}"]`);if(!card)return;
      const read=suffix=>form.querySelector(`[name="${name}_${suffix}"]`)?.value?.trim()||'';
      const visible=form.querySelector(`[name="${name}_visible"]`)?.checked;
      const state=form.querySelector(`[data-ad-state="${name}"]`);if(state)state.textContent=visible?'Açık':'Kapalı';
      card.hidden=!visible;card.querySelector('strong').textContent=read('title')||'Başlık bekliyor';
      card.querySelector('small').textContent=read('description');card.querySelector('em').textContent=read('mode')==='manual'?(read('cta')||'İncele'):'';
      const image=card.querySelector('img');const source=read('image_url');image.hidden=true;
      if(source){try{const url=new URL(source,location.origin);if(source.startsWith('/ads/')||url.protocol==='https:'){image.src=url.href;image.hidden=false;}}catch{image.hidden=true;}}
      card.querySelector('.sponsor-arrow').hidden=read('mode')!=='manual';
      if(read('mode')==='google'){image.hidden=true;card.querySelector('strong').textContent='Google AdSense';card.querySelector('small').textContent='Gerçek reklam yayın sırasında yüklenir.';}
    });
  };
  form.addEventListener('invalid',event=>{let parent=event.target.parentElement;while(parent&&parent!==form){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}},true);
  form.addEventListener('input',render);form.addEventListener('change',render);render();
})();
