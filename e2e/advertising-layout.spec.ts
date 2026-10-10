import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('partner bands share public alignment, readable themed copy and no hidden space',async({page,context})=>{
 test.setTimeout(120000);
 const origin='http://127.0.0.1:4322';await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 await page.goto('/studio/?section=advertising');const original=await page.locator('.advertising-form').evaluate(form=>Object.fromEntries(new FormData(form as HTMLFormElement)) as Record<string,string>);
 const form:Record<string,string>={entity:'advertising'};
 for(const placement of ['header','article','footer'])Object.assign(form,{[placement+'_mode']:'manual',[placement+'_visible']:'on',[placement+'_device']:'all',[placement+'_scope']:'all',[placement+'_title']:'Palmarghe partner',[placement+'_description']:'A calm space for creative work.',[placement+'_cta']:'Explore',[placement+'_url']:'https://palmarghe.com/',[placement+'_image_url']:'/ads/test-'+placement+'-neutral.svg'});
 try{
  await page.goto('/');for(const theme of ['dark','light','aurora']){await page.evaluate(theme=>document.body.dataset.theme=theme,theme);const audit=await new AxeBuilder({page}).include('.promotion-slot').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']).analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);}
  const saved=await context.request.post('/api/studio/',{headers:{origin},form});expect(saved.ok()).toBe(true);expect(saved.url()).not.toContain('error=');
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});await page.goto('/');await expect(page.locator('.promotion-slot')).toHaveCount(3);
   for(const theme of ['dark','light','aurora']){
    await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
    const boxes=await page.locator('.promotion-slot').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();const shell=document.querySelector('.site-header')!.getBoundingClientRect();const text=node.querySelector('.promotion-copy')!.getBoundingClientRect();const image=node.querySelector('.promotion-image')!.getBoundingClientRect();return {left:box.left,right:box.right,height:box.height,shellLeft:shell.left,shellRight:shell.right,textLeft:text.left,textRight:text.right,imageLeft:image.left};}));
    for(const box of boxes){expect(Math.abs(box.left-box.shellLeft)).toBeLessThan(1);expect(Math.abs(box.right-box.shellRight)).toBeLessThan(1);expect(Math.abs(box.textLeft-box.left-1)).toBeLessThan(1);expect(box.textRight).toBeLessThanOrEqual(box.imageLeft+1);expect(box.height).toBeLessThan(230);}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    const audit=await new AxeBuilder({page}).include('.promotion-slot').include('.site-footer').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']).analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
   }
  }
  await page.screenshot({path:'test-results/partner-layout-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/partner-layout-phone.png',fullPage:true});
  form.header_title='A longer partner title that must stay readable on a narrow phone';form.header_description='An informative description that wraps without covering the artwork or leaving the visible text outside the card.';delete form.header_image_url;
  expect((await context.request.post('/api/studio/',{headers:{origin},form})).ok()).toBe(true);await page.goto('/en/');await expect(page.locator('[data-promotion-placement=header] .promotion-image')).toHaveCount(0);await expect(page.locator('[data-promotion-placement=header] strong')).toHaveText(form.header_title);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);await expect(page.locator('.footer-discovery a[href="/en/rss.xml"]')).toBeVisible();expect((await context.request.get('/en/rss.xml')).ok()).toBe(true);
  for(const placement of ['header','article','footer'])delete form[placement+'_visible'];
  expect((await context.request.post('/api/studio/',{headers:{origin},form})).ok()).toBe(true);await page.goto('/');await expect(page.locator('.promotion-slot')).toHaveCount(0);await expect(page.locator('.footer-discovery')).toBeVisible();
  for(const href of ['/archive/','/collections/','/rss.xml'])await expect(page.locator('.footer-discovery a[href="'+href+'"]')).toBeVisible();
  expect((await context.request.get('/rss.xml')).ok()).toBe(true);
  for(const path of ['/','/search/?q=Digital','/archive/']){await page.goto(path);await expect(page.locator('.footer-discovery h2')).toBeVisible();}
 }finally{expect((await context.request.post('/api/studio/',{headers:{origin},form:original})).ok()).toBe(true);}
});
