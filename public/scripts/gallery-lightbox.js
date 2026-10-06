(() => {
 const tr=document.documentElement.lang!=='en';
 // Existing source files stay intact; only the viewing interface changes.
 for(const image of document.querySelectorAll('.content-detail figure img')){
  if(image.closest('a,button'))continue;
  const link=document.createElement('a');link.href=image.currentSrc||image.src;link.dataset.galleryLightbox='';link.dataset.alt=image.alt;link.dataset.caption=image.closest('figure')?.querySelector('figcaption')?.textContent||image.alt;link.className='image-inspector-trigger';image.before(link);link.append(image);
 }
 const cover=document.querySelector('.content-detail>img');
 if(cover&&!document.querySelector('.image-inspector-cover')){const link=document.createElement('a');link.href=cover.currentSrc||cover.src;link.dataset.galleryLightbox='';link.dataset.alt=cover.alt;link.className='image-inspector-cover';link.textContent=tr?'Görseli incele ↗':'Inspect image ↗';cover.after(link);}
 const links=[...document.querySelectorAll('[data-gallery-lightbox]')];if(!links.length)return;
 let dialog=document.querySelector('[data-gallery-dialog]');
 if(!dialog){dialog=document.createElement('dialog');dialog.className='gallery-lightbox';dialog.dataset.galleryDialog='';dialog.setAttribute('aria-label',tr?'Görsel inceleme':'Image inspection');dialog.innerHTML='<button type="button" data-gallery-close>×</button><img data-gallery-image alt=""><p data-gallery-caption></p>';document.body.append(dialog);}
 if(dialog.dataset.inspectorBound)return;dialog.dataset.inspectorBound='';
 const image=dialog.querySelector('[data-gallery-image]'),caption=dialog.querySelector('[data-gallery-caption]'),closeButton=dialog.querySelector('[data-gallery-close]');
 closeButton.setAttribute('aria-label',closeButton.getAttribute('aria-label')||(tr?'Önizlemeyi kapat':'Close preview'));
 const tools=document.createElement('div');tools.className='gallery-inspector-tools';tools.setAttribute('role','toolbar');tools.setAttribute('aria-label',tr?'Görsel araçları':'Image tools');
 const button=(label,text)=>{const el=document.createElement('button');el.type='button';el.setAttribute('aria-label',label);el.textContent=text;tools.append(el);return el;};
 const previous=button(tr?'Önceki görsel':'Previous image','←'),next=button(tr?'Sonraki görsel':'Next image','→'),zoomOut=button(tr?'Uzaklaştır':'Zoom out','−'),zoomIn=button(tr?'Yakınlaştır':'Zoom in','+'),reset=button(tr?'Görseli sığdır':'Fit image','1:1'),full=button(tr?'Tam ekran':'Fullscreen','⛶');
 const count=document.createElement('span');count.className='gallery-position';tools.append(count);dialog.prepend(tools);
 const frame=document.createElement('div');frame.className='gallery-inspector-frame';image.before(frame);frame.append(image);
 const status=document.createElement('p');status.setAttribute('role','status');status.className='gallery-load-status';dialog.append(status);
 const retry=button(tr?'Görseli yeniden yükle':'Retry image','↻');retry.hidden=true;
 let index=0,zoom=1,trigger=null,start=null,backdrop=false;
 const setZoom=value=>{zoom=Math.min(3,Math.max(1,value));image.style.transform=`scale(${zoom})`;frame.classList.toggle('is-zoomed',zoom>1);zoomOut.disabled=zoom===1;zoomIn.disabled=zoom===3;reset.setAttribute('aria-label',(tr?'Görseli sığdır':'Fit image')+' · '+Math.round(zoom*100)+'%');};
 const show=position=>{index=(position+links.length)%links.length;setZoom(1);const link=links[index];frame.classList.add('is-loading');status.textContent=tr?'Görsel yükleniyor…':'Loading image…';retry.hidden=true;image.src=link.href;image.alt=link.dataset.alt||'';caption.textContent=link.dataset.caption||image.alt;count.textContent=(index+1)+' / '+links.length;previous.hidden=next.hidden=links.length<2;};
 image.addEventListener('load',()=>{frame.classList.remove('is-loading');status.textContent='';});image.addEventListener('error',()=>{frame.classList.remove('is-loading');status.textContent=tr?'Görsel yüklenemedi. Yeniden deneyebilirsin.':'Image could not load. You can retry.';retry.hidden=false;});
 retry.addEventListener('click',()=>{const source=image.src;image.removeAttribute('src');image.src=source;status.textContent=tr?'Yeniden yükleniyor…':'Retrying…';});
 links.forEach((link,i)=>link.addEventListener('click',event=>{event.preventDefault();trigger=link;show(i);dialog.showModal();document.documentElement.classList.add('gallery-modal-open');closeButton.focus();}));
 previous.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));zoomOut.addEventListener('click',()=>setZoom(zoom-.5));zoomIn.addEventListener('click',()=>setZoom(zoom+.5));reset.addEventListener('click',()=>setZoom(1));
 full.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(dialog.requestFullscreen)await dialog.requestFullscreen();else dialog.classList.toggle('is-fullscreen');}catch{dialog.classList.toggle('is-fullscreen');}full.setAttribute('aria-pressed',String(Boolean(document.fullscreenElement)||dialog.classList.contains('is-fullscreen')));});
 document.addEventListener('fullscreenchange',()=>full.setAttribute('aria-pressed',String(document.fullscreenElement===dialog||dialog.classList.contains('is-fullscreen'))));
 closeButton.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(document.fullscreenElement===dialog)document.exitFullscreen().catch(()=>{});dialog.classList.remove('is-fullscreen');document.documentElement.classList.remove('gallery-modal-open');trigger?.focus();});
 const outside=event=>{const b=dialog.getBoundingClientRect();return event.target===dialog&&(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom);};
 dialog.addEventListener('pointerdown',event=>{backdrop=outside(event);});dialog.addEventListener('pointerup',event=>{if(backdrop&&outside(event))dialog.close();backdrop=false;});dialog.addEventListener('pointercancel',()=>{backdrop=false;start=null;});
 frame.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'&&zoom===1)start={x:event.clientX,y:event.clientY};});frame.addEventListener('pointerup',event=>{if(start){const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1));start=null;}});
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}else if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}else if(event.key==='+'||event.key==='='){event.preventDefault();setZoom(zoom+.5);}else if(event.key==='-'){event.preventDefault();setZoom(zoom-.5);}else if(event.key==='Tab'){const controls=[closeButton,...tools.querySelectorAll('button')].filter(el=>!el.disabled&&!el.hidden);const i=controls.indexOf(document.activeElement);event.preventDefault();controls[(i+(event.shiftKey?-1:1)+controls.length)%controls.length].focus();}});
})();
