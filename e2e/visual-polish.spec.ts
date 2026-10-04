import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.setTimeout(120000);

test('Studio surfaces keep compact headings, theme contrast and bounded phone layouts',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:'http://127.0.0.1:4322'}]);
 for(const width of [390,1440])for(const section of ['dashboard','content','media','advertising','members','homepage']){
  await page.setViewportSize({width,height:900});await page.goto(`/studio/?section=${section}`);
  for(const theme of ['dark','light']){
   await page.evaluate(t=>document.body.dataset.theme=t,theme);
   await expect(page.locator('body')).toHaveCSS('color',theme==='light'?'rgb(32, 29, 39)':'rgb(243, 241, 234)');
   if(await page.locator('.admin-side nav a[aria-current=page]').count())await expect(page.locator('.admin-side nav a[aria-current=page]')).toHaveCSS('color',theme==='light'?'rgb(32, 29, 39)':'rgb(243, 241, 234)');
   if(await page.locator('.footer-bottom').count())await expect(page.locator('.footer-bottom')).toHaveCSS('color',theme==='light'?'rgb(78, 72, 87)':'rgb(156, 156, 163)');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??'')).map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  }
  if(section==='dashboard')expect(await page.locator('.admin-main h2').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeLessThanOrEqual(32);
  if(section==='content'&&width===390){
   const rects=await page.evaluate(()=>['.editor-action-bar','.editor-title-field','.cover-editor','.content-editor-form>.field:has(#block-editor)'].map(s=>document.querySelector(s)!.getBoundingClientRect().top));
   expect(rects.every((top,index)=>index===0||top>rects[index-1])).toBe(true);
   await expect(page.locator('input[name="title"]')).toHaveAttribute('placeholder','İçeriğin başlığını yaz…');
  }
 }
});

test('public pages retain restrained typography and responsive cards',async({page})=>{
 for(const width of [320,1024,1440])for(const path of ['/','/gaming/','/account/','/search/']){
  await page.setViewportSize({width,height:900});await page.goto(path);
  for(const theme of ['dark','light']){
   await page.evaluate(t=>document.body.dataset.theme=t,theme);
   await expect(page.locator('body')).toHaveCSS('color',theme==='light'?'rgb(32, 29, 39)':'rgb(243, 241, 234)');
   if(await page.locator('.admin-side nav a[aria-current=page]').count())await expect(page.locator('.admin-side nav a[aria-current=page]')).toHaveCSS('color',theme==='light'?'rgb(32, 29, 39)':'rgb(243, 241, 234)');
   if(await page.locator('.footer-bottom').count())await expect(page.locator('.footer-bottom')).toHaveCSS('color',theme==='light'?'rgb(78, 72, 87)':'rgb(156, 156, 163)');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??'')).map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  }
 }
});
