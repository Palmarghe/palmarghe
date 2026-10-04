(() => {
  for(const surface of document.querySelectorAll('[data-focus-surface]')) {
    const form=surface.closest('form');if(!form)continue;
    const x=form.querySelector(`[name="${surface.dataset.focusX}"]`),y=form.querySelector(`[name="${surface.dataset.focusY}"]`);if(!x||!y)continue;
    const marker=document.createElement('span');marker.className='media-focus-marker';marker.setAttribute('aria-hidden','true');surface.append(marker);
    const mark=()=>{marker.style.left=x.value+'%';marker.style.top=y.value+'%';};form.addEventListener('input',mark);form.addEventListener('change',mark);mark();
    let pointer;
    const update=event=>{
      const rect=surface.getBoundingClientRect();if(!rect.width||!rect.height)return;
      x.value=String(Math.round(Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100))));
      y.value=String(Math.round(Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))));
      const fit=form.querySelector('[name=preview_fit]'),zoom=form.querySelector('[name=preview_zoom]');if(surface.hasAttribute('data-card-frame')){if(fit)fit.value='cover';if(zoom&&Number(zoom.value)===100)zoom.value='125';}
      x.dispatchEvent(new Event('input',{bubbles:true}));
    };
    surface.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();pointer=event.pointerId;surface.setPointerCapture(pointer);update(event);});
    surface.addEventListener('pointermove',event=>{if(event.pointerId===pointer)update(event);});
    const finish=event=>{if(event.pointerId===pointer)pointer=undefined;};surface.addEventListener('pointerup',finish);surface.addEventListener('pointercancel',finish);
    surface.addEventListener('dragstart',event=>event.preventDefault());
  }
})();
