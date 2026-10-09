(() => {
 const dialog=document.querySelector('[data-command-dialog]');if(!dialog)return;
 const input=dialog.querySelector('[data-command-query]'),list=dialog.querySelector('[data-command-results]'),status=dialog.querySelector('[data-command-status]');
 const base=[...list.querySelectorAll('a')].map(a=>({title:a.childNodes[0].textContent,kind:a.querySelector('small').textContent,href:a.getAttribute('href')}));
 let active=0,trigger=null,timer,controller,serial=0;
 const links=()=>[...list.querySelectorAll('a')];
 const highlight=()=>links().forEach((link,index)=>{link.classList.toggle('is-selected',index===active);link.setAttribute('aria-current',index===active?'true':'false');});
 const render=items=>{list.replaceChildren();for(const item of items){const link=document.createElement('a'),kind=document.createElement('small');link.href=item.href;link.textContent=item.title;kind.textContent=item.kind;link.append(kind);list.append(link);}active=0;highlight();};
 const search=async()=>{const n=++serial;controller?.abort();const q=input.value.trim();const staticItems=base.filter(item=>item.title.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr')));render(staticItems);if(q.length<2){status.textContent=staticItems.length+' seçenek';return;}controller=new AbortController();const cancel=setTimeout(()=>controller.abort(),8000);status.textContent='Aranıyor…';try{const response=await fetch('/api/studio-discovery/?q='+encodeURIComponent(q),{credentials:'same-origin',signal:controller.signal});if(!response.ok)throw new Error();const data=await response.json();if(n!==serial)return;render([...staticItems,...data.results]);status.textContent=links().length?links().length+' seçenek':'Eşleşme yok. Başka bir isim dene.';}catch(error){if(n===serial)status.textContent='Arama tamamlanamadı. Bölümlere yukarıdan erişebilir veya yeniden yazabilirsin.';}finally{clearTimeout(cancel);}};
 const open=button=>{if(dialog.open)return;trigger=button||document.activeElement;input.value='';render(base);status.textContent='';dialog.showModal();document.documentElement.classList.add('studio-command-open');input.focus();};
 document.querySelector('[data-command-open]').addEventListener('click',event=>open(event.currentTarget));
 dialog.querySelector('[data-command-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.isComposing&&!event.defaultPrevented){event.preventDefault();dialog.close();}});
 dialog.addEventListener('close',()=>{++serial;controller?.abort();clearTimeout(timer);document.documentElement.classList.remove('studio-command-open');trigger?.focus();});
 input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(search,180);});
 input.addEventListener('keydown',event=>{const items=links();if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(items.length){active=(active+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;highlight();items[active].scrollIntoView({block:'nearest'});}}else if(event.key==='Enter'){event.preventDefault();items[active]?.click();}});
 document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'&&!event.altKey){if(event.defaultPrevented||(!dialog.open&&(event.target?.closest?.('[contenteditable],input,textarea,select')||document.querySelector('dialog[open]'))))return;event.preventDefault();dialog.open?dialog.close():open();}});
})();
