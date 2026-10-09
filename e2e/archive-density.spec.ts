import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('phone archive filters stay compact, accessible and functional in every palette',async({page,context})=>{
 const origin='http://127.0.0.1:4322';await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 const title='Archive density QA '+Date.now(),slug='archive-density-'+Date.now();
 expect((await context.request.post('/api/studio/',{headers:{origin},form:{entity:'content',title,slug,locale:'tr',type:'article',status:'published',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Controlled local archive filter QA.'}]}]})}})).ok()).toBe(true);
 const found=(await (await context.request.get('/api/search/?q='+encodeURIComponent(title))).json()).results.find((entry:any)=>entry.slug===slug);expect(found?.id).toBeTruthy();
 try{
  for(const width of [320,390]){
   await page.setViewportSize({width,height:844});await page.goto('/archive/');
   for(const theme of ['dark','light','aurora']){
    await page.evaluate(value=>document.body.dataset.theme=value,theme);
    const geometry=await page.locator('.archive-filters').evaluate(form=>{
     const controls=[...form.querySelectorAll('select,button')].map(el=>el.getBoundingClientRect());
     return {height:form.getBoundingClientRect().height,first:controls[0].top,second:controls[1].top,targets:controls.map(box=>({height:box.height,left:box.left,right:box.right})),viewport:innerWidth};
    });
    expect(geometry.height).toBeLessThanOrEqual(250);expect(Math.abs(geometry.first-geometry.second)).toBeLessThan(1);
    for(const box of geometry.targets){expect(box.height).toBeGreaterThanOrEqual(44);expect(box.left).toBeGreaterThanOrEqual(0);expect(box.right).toBeLessThanOrEqual(geometry.viewport);}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const audit=await new AxeBuilder({page}).include('.archive-section').analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
   }
  }
  await page.getByRole('combobox',{name:'Tür',exact:true}).selectOption('article');await page.getByRole('button',{name:'Filtrele',exact:true}).click();
  await expect(page).toHaveURL(/type=article/);await expect(page.locator(`.entry-card[href="/${slug}/"]`)).toBeVisible();
  await page.getByRole('link',{name:'Sıfırla',exact:true}).click();await expect(page).toHaveURL('/archive/');
  const visitor=await context.browser()!.newContext({baseURL:origin,javaScriptEnabled:false,viewport:{width:320,height:844}});
  try{const native=await visitor.newPage();await native.goto('/archive/');await expect(native.locator('#mobile-nav')).toBeVisible();await expect(native.locator('.menu-toggle')).toBeHidden();expect(await native.evaluate(()=>document.querySelector('#mobile-nav')!.getBoundingClientRect().bottom<=document.querySelector('main')!.getBoundingClientRect().top)).toBe(true);await native.getByRole('combobox',{name:'Tür',exact:true}).selectOption('article');await native.getByRole('button',{name:'Filtrele',exact:true}).click();await expect(native).toHaveURL(/type=article/);await expect(native.locator(`.entry-card[href="/${slug}/"]`)).toBeVisible();expect(await native.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}finally{await visitor.close();}
 }finally{expect((await context.request.post('/api/studio/',{headers:{origin},form:{entity:'content',operation:'delete',id:found.id}})).ok()).toBe(true);}
});
