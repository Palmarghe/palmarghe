import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('live phone archive discovery is compact, accessible and works without JavaScript',async({page,browser})=>{
 test.setTimeout(60000);
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});await page.goto('/archive/?verify=e2e');
  for(const theme of ['dark','light','aurora']){
   await page.evaluate(value=>document.body.dataset.theme=value,theme);
   const geometry=await page.locator('.archive-filters').evaluate(form=>{const controls=[...form.querySelectorAll('select,button')].map(el=>el.getBoundingClientRect());return {height:form.getBoundingClientRect().height,first:controls[0].top,second:controls[1].top,targets:controls.map(box=>({left:box.left,right:box.right,height:box.height})),width:innerWidth};});
   expect(geometry.height).toBeLessThanOrEqual(250);expect(Math.abs(geometry.first-geometry.second)).toBeLessThan(1);
   for(const box of geometry.targets){expect(box.height).toBeGreaterThanOrEqual(44);expect(box.left).toBeGreaterThanOrEqual(0);expect(box.right).toBeLessThanOrEqual(geometry.width);}
   await expect(page.locator('.entry-card h3').first()).toBeVisible();expect(await page.locator('.entry-card h3').first().evaluate(el=>el.getBoundingClientRect().top)).toBeLessThan(844);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const axe=await new AxeBuilder({page}).include('.archive-section').analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
  }
 }
 const native=await browser.newContext({baseURL:'https://palmarghe.com',javaScriptEnabled:false,viewport:{width:320,height:844}});
 try{const view=await native.newPage();await view.goto('/archive/?verify=e2e');await expect(view.locator('#mobile-nav')).toBeVisible();await expect(view.locator('.menu-toggle')).toBeHidden();expect(await view.evaluate(()=>document.querySelector('#mobile-nav')!.getBoundingClientRect().bottom<=document.querySelector('main')!.getBoundingClientRect().top)).toBe(true);await view.getByRole('combobox',{name:'Tür',exact:true}).selectOption('project');await view.getByRole('button',{name:'Filtrele',exact:true}).click();await expect(view).toHaveURL(/type=project/);await expect(view.locator('.entry-card').first()).toBeVisible();await expect(view.locator('.entry-card .eyebrow').first()).toHaveText('Proje');expect(await view.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}finally{await native.close();}
});
