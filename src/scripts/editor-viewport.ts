// Keep an editing caret clear of the real sticky action bar and visual viewport.
// No content, focus, selection or server state is changed by this helper.
const viewportForm=document.querySelector<HTMLFormElement>('.content-editor-form');
const viewportBar=viewportForm?.querySelector<HTMLElement>('.editor-action-bar');
if(viewportForm&&viewportBar){
 let frame=0;
 const keepVisible=()=>{
  frame=0;
  document.documentElement.style.setProperty('--studio-sticky-height',`${viewportBar.getBoundingClientRect().height}px`);
  document.documentElement.style.setProperty('--studio-visual-height',`${window.visualViewport?.height??innerHeight}px`);
  const active=document.activeElement;
  if(!(active instanceof HTMLElement)||!viewportForm.contains(active)||document.querySelector('dialog[open]'))return;
  let rect:DOMRect|undefined;
  if(active.isContentEditable){
   const selection=window.getSelection();
   if(!selection?.isCollapsed||!selection.rangeCount||!active.contains(selection.anchorNode))return;
   const range=selection.getRangeAt(0);
   rect=range.getClientRects()[0];
   if(!rect||!rect.height){
    const anchor=selection.anchorNode instanceof Element?selection.anchorNode:selection.anchorNode?.parentElement;
    rect=anchor?.closest('p,h1,h2,h3,li,blockquote')?.getBoundingClientRect();
   }
  }else if(active.matches('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),textarea'))rect=active.getBoundingClientRect();
  if(!rect)return;
  const viewport=window.visualViewport,top=viewport?.offsetTop??0,bottom=top+(viewport?.height??innerHeight);
  const bar=viewportBar.getBoundingClientRect();
  const visibleTop=Math.max(top,bar.top<=top+1?bar.bottom:top)+12,visibleBottom=bottom-12;
  if(visibleBottom<=visibleTop)return;
  // Large native textareas scroll their own caret; reserve their first line,
  // rather than oscillating between an impossible full-height fit.
  const targetBottom=Math.min(rect.bottom,rect.top+Math.min(rect.height,40));
  const delta=rect.top<visibleTop?rect.top-visibleTop:targetBottom>visibleBottom?targetBottom-visibleBottom:0;
  if(Math.abs(delta)>1)window.scrollBy({top:delta,behavior:'instant'});
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(keepVisible);};
 const observer=new ResizeObserver(schedule);let listening=false;
 const start=()=>{
  if(listening)return;listening=true;observer.observe(viewportBar);
  viewportForm.addEventListener('focusin',schedule);viewportForm.addEventListener('input',schedule);
  viewportForm.addEventListener('keydown',schedule);
  window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
  schedule();
 };
 window.addEventListener('pagehide',()=>{
  listening=false;observer.disconnect();cancelAnimationFrame(frame);frame=0;
  viewportForm.removeEventListener('focusin',schedule);viewportForm.removeEventListener('input',schedule);
  viewportForm.removeEventListener('keydown',schedule);window.removeEventListener('resize',schedule);
  window.visualViewport?.removeEventListener('resize',schedule);
 });
 window.addEventListener('pageshow',start);start();
}
