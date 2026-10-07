import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('phone editor preview and more actions stay readable, bounded and keyboard accessible',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:'http://127.0.0.1:4322'}]);
 const title='Mobile action fixture '+Date.now();const result=await context.request.post('/api/studio/',{headers:{Origin:'http://127.0.0.1:4322'},form:{entity:'content',title,slug:'mobile-action-'+Date.now(),locale:'tr',type:'article',status:'draft',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Local mobile action fixture'}]}]})}});expect(result.ok()).toBe(true);
 for(const state of ['new','saved']){
  await page.goto('/studio/?section=content');if(state==='saved')await page.locator('.content-list tbody tr').filter({hasText:title}).getByRole('link',{name:'Düzenle',exact:true}).click();
  for(const width of [320,390,768])for(const theme of ['dark','light','aurora']){
   await page.setViewportSize({width,height:844});await page.evaluate(t=>document.body.dataset.theme=t,theme);
   const preview=page.locator('[data-editor-preview]');await expect(preview).toBeVisible();const box=await preview.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(100);expect(box!.height).toBeLessThanOrEqual(64);
   const summary=page.locator('.editor-more-actions summary');await summary.click();const menu=page.locator('.editor-more-menu');await expect(menu).toBeVisible();const menuBox=await menu.boundingBox();expect(menuBox!.x).toBeGreaterThanOrEqual(0);expect(menuBox!.x+menuBox!.width).toBeLessThanOrEqual(width);
   const command=menu.getByRole('button',{name:'Odak modunu aç',exact:true});expect(await command.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));})).toBe(true);
   if(state==='saved')await expect(menu.getByRole('link',{name:'Kayıtlı içeriği önizle',exact:true})).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const axe=await new AxeBuilder({page}).include('.editor-action-bar').analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
   await menu.getByRole('button',{name:'Odak modunu aç',exact:true}).focus();await page.keyboard.press('Escape');await expect(menu).toBeHidden();await expect(summary).toBeFocused();
   await summary.click();await page.getByRole('heading',{name:'İçerikler',exact:true}).click();await expect(menu).toBeHidden();
  }
 }
});
