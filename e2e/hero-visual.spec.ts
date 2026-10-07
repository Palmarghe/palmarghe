import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:4322';
const admin='00000000-0000-4000-8000-100000000001';

test('hero appearance previews, persists, respects reduced motion and restores without changing publications',async({page,context})=>{
 test.setTimeout(60000);
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);
 await page.setViewportSize({width:1440,height:900});await page.goto('/studio/?section=homepage');
 const original=await page.locator('.homepage-editor').evaluate(form=>[...new FormData(form as HTMLFormElement).entries()].map(([key,value])=>[key,String(value)]));
 try {
 await page.locator('.hero-visual-controls summary').click();
 await page.locator('[name=hero_visual_ratio]').selectOption('balanced');
 for(const name of ['depth','light','intensity'])await page.locator(`[name=hero_visual_${name}]`).press('End');
 await page.locator('[name=hero_visual_motion]').selectOption('ambient');
 await expect(page.locator('[data-hero-visual-output=hero_visual_depth]')).toHaveText('20');
 const live=page.frameLocator('[data-device-frame]');
 await expect(live.locator('.hero')).toHaveAttribute('data-hero-ratio','balanced');
 await expect(live.locator('.hero-art')).toHaveCSS('opacity','0.45');
 await expect(live.locator('.hero-art')).toHaveCSS('animation-name','hero-ambient');
 await page.emulateMedia({reducedMotion:'reduce'});await expect(live.locator('.hero-art')).toHaveCSS('animation-name','none');
 const saved=page.waitForResponse(response=>response.request().method()==='POST'&&new URL(response.url()).pathname==='/api/studio/');
 await page.getByRole('button',{name:'Ana sayfayı kaydet',exact:true}).click();const response=await saved;expect(response.status()).toBe(303);await page.reload();
 await expect(page.locator('[name=hero_visual_depth]')).toHaveValue('20');
 await page.goto('/');await expect(page.locator('.hero')).toHaveAttribute('data-hero-ratio','balanced');
 await expect(page.locator('.hero-art')).toHaveCSS('opacity','0.45');
 await expect(page.locator('.hero-art')).toHaveCSS('animation-name','none');
 for(const theme of ['dark','light','aurora'])for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
  const foreground=theme==='light'?'rgb(32, 29, 39)':theme==='aurora'?'rgb(245, 241, 232)':'rgb(243, 241, 234)';
  await expect(page.locator('body')).toHaveCSS('color',foreground);
  await expect(page.locator('.brand > span')).toHaveCSS('color',foreground);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 }
 } finally {
 const restored=await context.request.post('/api/studio/',{headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},data:new URLSearchParams(original as [string,string][]).toString()});expect(restored.ok()).toBe(true);
 }
 await page.goto('/');await expect(page.locator('.hero')).toHaveAttribute('data-hero-ratio',original.find(([key])=>key==='hero_visual_ratio')?.[1]??'auto');
});

test('hero appearance rejects out-of-range input and unauthorized actors',async({context})=>{
 const form={entity:'homepage',hero_mode:'compact',hero_visual_depth:'21'};
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);
 const invalid=await context.request.post('/api/studio/',{headers:{Origin:origin},form});expect(invalid.status()).toBe(400);
 for(const actor of ['00000000-0000-4000-8000-100000000002','00000000-0000-4000-8000-100000000003']){
  await context.clearCookies();await context.addCookies([{name:'pg_mock_user',value:actor,url:origin}]);
  const denied=await context.request.post('/api/studio/',{headers:{Origin:origin},form:{...form,hero_visual_depth:'10'}});expect(denied.status()).toBe(403);
 }
 await context.clearCookies();const visitor=await context.request.post('/api/studio/',{headers:{Origin:origin},form});expect(visitor.status()).toBe(401);
});
