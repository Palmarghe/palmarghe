import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('authoring modes use each theme foreground and stay touch accessible at phone widths',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:'http://127.0.0.1:4322'}]);
 for(const theme of ['dark','light','aurora'])for(const width of [320,390,1440]){
  await page.addInitScript(t=>localStorage.setItem('palmarghe-theme',t),theme);await page.setViewportSize({width,height:900});await page.goto('/studio/?section=content');
  await expect(page.locator('body')).toHaveAttribute('data-theme',theme);
  for(const name of ['Detaylı','Basit']){
   const control=page.getByRole('button',{name,exact:true});await control.click();await expect(control).toHaveAttribute('aria-pressed','true');
   const box=await control.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);
  }
  const selected=page.locator('.editor-mode-switch [aria-pressed=true]');const expected=await page.locator('body').evaluate(body=>({foreground:getComputedStyle(body).getPropertyValue('--text').trim(),background:getComputedStyle(body).getPropertyValue('--bg').trim()}));
  expect(expected.foreground).toBeTruthy();await expect(selected).toHaveCSS('background-color',theme==='light'?'rgb(32, 29, 39)':theme==='aurora'?'rgb(245, 241, 232)':'rgb(243, 241, 234)');
  expect((await new AxeBuilder({page}).include('.editor-mode-switch').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
