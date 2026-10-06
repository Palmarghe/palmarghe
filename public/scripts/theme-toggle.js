(() => {
 const key='palmarghe-theme',body=document.body,buttons=[...document.querySelectorAll('[data-theme-toggle]')];
 const apply=theme=>{
  body.dataset.theme=theme;
  const light=theme==='light',aurora=theme==='aurora';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',light?'#f5f2ee':aurora?'#10262A':'#0B0B0D');
  buttons.forEach(button=>{button.setAttribute('aria-pressed',String(light));button.setAttribute('aria-label',light?'Koyu modu aç':'Açık modu aç');});
 };
 const save=theme=>{try{localStorage.setItem(key,theme);}catch{}apply(theme);};
 try{const stored=localStorage.getItem(key);apply(['light','aurora'].includes(stored)?stored:'dark');}catch{apply('dark');}
 const awaken=()=>{
  save('aurora');let notice=document.querySelector('[data-aurora-notice]');
  if(!notice){notice=document.createElement('div');notice.dataset.auroraNotice='';notice.className='aurora-notice';notice.setAttribute('role','status');document.body.append(notice);}
  notice.textContent=document.documentElement.lang==='en'?'Aurora discovered. A warmer corner of the universe.':'Aurora keşfedildi. Evrenin daha sıcak bir köşesi.';
  notice.hidden=false;clearTimeout(notice.hideTimer);notice.hideTimer=setTimeout(()=>notice.hidden=true,4500);
 };
 buttons.forEach(button=>{
  let timer=null,origin=null,suppressUntil=0;
  const cancel=()=>{clearTimeout(timer);timer=null;origin=null;};
  button.addEventListener('pointerdown',event=>{if(event.button!==0)return;origin={x:event.clientX,y:event.clientY};timer=setTimeout(()=>{suppressUntil=Date.now()+1500;awaken();cancel();},1400);});
  button.addEventListener('pointermove',event=>{if(origin&&Math.hypot(event.clientX-origin.x,event.clientY-origin.y)>12)cancel();});
  for(const type of ['pointerup','pointercancel','pointerleave','blur'])button.addEventListener(type,cancel);
  button.addEventListener('contextmenu',event=>{if(timer||Date.now()<suppressUntil)event.preventDefault();});
  button.addEventListener('click',event=>{if(Date.now()<suppressUntil){event.preventDefault();return;}save(body.dataset.theme==='light'?'dark':'light');});
 });
 document.addEventListener('keydown',event=>{if(event.altKey&&event.shiftKey&&event.code==='KeyA'&&!event.repeat&&!event.defaultPrevented&&!event.target?.closest?.('input,textarea,select,[contenteditable]')&&!document.querySelector('dialog[open]')){event.preventDefault();awaken();}});
 window.addEventListener('storage',event=>{if(event.key===key)apply(['light','aurora'].includes(event.newValue)?event.newValue:'dark');});
})();
