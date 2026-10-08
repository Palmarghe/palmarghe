import {test,expect} from '@playwright/test';

test('editing caret stays below sticky actions after a short viewport resize without changing content or focus',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:'http://127.0.0.1:4322'}]);
 await page.goto('/studio/?section=content');
 const editor=page.getByRole('textbox',{name:'İçerik blok editörü',exact:true});
 for(const theme of ['dark','light','aurora']){
  await page.evaluate(value=>document.body.dataset.theme=value,theme);
  await page.setViewportSize({width:320,height:844});await editor.click();
  await editor.press('ControlOrMeta+A');await page.keyboard.insertText('Local short viewport QA');
  for(const height of [420,320,844]){
   await page.setViewportSize({width:320,height});
   await expect(editor).toBeFocused();await expect(editor).toHaveText('Local short viewport QA');
   await expect.poll(()=>editor.evaluate(element=>{
    const selection=window.getSelection();if(!selection?.rangeCount)return false;
    const caret=selection.getRangeAt(0).getBoundingClientRect(),bar=document.querySelector('.editor-action-bar')!.getBoundingClientRect();
    return caret.top>=bar.bottom+8&&caret.bottom<=innerHeight-8&&element===document.activeElement;
   })).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
 expect(await context.request.get('/api/search/?q=Local%20short%20viewport%20QA&locale=tr').then(response=>response.json()).then(data=>data.results)).toEqual([]);
 const title='Short viewport saved QA '+Date.now();
 const saved=await context.request.post('/api/studio/',{headers:{origin:'http://127.0.0.1:4322'},form:{entity:'content',title,slug:'short-viewport-qa-'+Date.now(),locale:'tr',type:'article',status:'draft',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Private local QA'}]}]})}});
 expect(saved.ok()).toBe(true);await page.goto('/studio/?section=content');
 await page.locator('.content-list tbody tr').filter({hasText:title}).getByRole('link',{name:'Düzenle',exact:true}).click();
 await page.setViewportSize({width:320,height:320});
 const summary=page.locator('.editor-more-actions summary');await summary.click();
 const menu=page.locator('.editor-more-menu'),preview=menu.getByRole('link',{name:'Kayıtlı içeriği önizle',exact:true});
 await preview.scrollIntoViewIfNeeded();
 expect(await preview.evaluate(element=>{const box=element.getBoundingClientRect();return box.top>=0&&box.bottom<=innerHeight&&element.contains(document.elementFromPoint(box.left+box.width/2,box.top+box.height/2));})).toBe(true);
 await preview.focus();await page.keyboard.press('Escape');await expect(menu).toBeHidden();await expect(summary).toBeFocused();
});

test('visual-only keyboard resize preserves the caret when the layout viewport does not shrink',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:'http://127.0.0.1:4322'}]);
 await page.setViewportSize({width:320,height:844});
 // Controlled keyboard contract: mobile browsers can shrink/pan only the
 // visual viewport, while innerHeight and the layout remain unchanged.
 await page.addInitScript(()=>{
  const fixture=Object.assign(new EventTarget(),{width:320,height:844,offsetTop:0,offsetLeft:0,scale:1,pageTop:0,pageLeft:0});
  Object.defineProperty(window,'visualViewport',{configurable:true,get:()=>fixture});
  (window as any).__qaVisualViewport=fixture;
 });
 await page.goto('/studio/?section=content');
 const editor=page.getByRole('textbox',{name:'İçerik blok editörü',exact:true});
 await editor.click();await page.keyboard.insertText('Visual only keyboard QA');
 for(const keyboard of [{height:320,offsetTop:40},{height:260,offsetTop:90},{height:844,offsetTop:0}]){
  await page.evaluate(value=>{const fixture=(window as any).__qaVisualViewport;Object.assign(fixture,value);fixture.dispatchEvent(new Event('resize'));},keyboard);
  expect(await page.evaluate(()=>innerHeight)).toBe(844);
  await expect(editor).toBeFocused();await expect(editor).toHaveText('Visual only keyboard QA');
  await expect.poll(()=>editor.evaluate(()=>{
   const caret=window.getSelection()!.getRangeAt(0).getBoundingClientRect(),bar=document.querySelector('.editor-action-bar')!.getBoundingClientRect(),viewport=window.visualViewport!;
   return caret.top>=Math.max(bar.bottom,viewport.offsetTop)+8&&caret.bottom<=viewport.offsetTop+viewport.height-8;
  })).toBe(true);
 }
 await page.evaluate(()=>{
  window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
  window.scrollBy({top:96,behavior:'instant'});
  Object.assign((window as any).__qaVisualViewport,{height:320,offsetTop:0});
  window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
 });
 await expect.poll(()=>editor.evaluate(()=>{
  const caret=window.getSelection()!.getRangeAt(0).getBoundingClientRect(),bar=document.querySelector('.editor-action-bar')!.getBoundingClientRect();
  return caret.top>=bar.bottom+8&&caret.bottom<=window.visualViewport!.height-8;
 })).toBe(true);
 await expect(editor).toBeFocused();await expect(editor).toHaveText('Visual only keyboard QA');
});
