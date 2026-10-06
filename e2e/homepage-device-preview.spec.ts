import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:4322';
const admin='00000000-0000-4000-8000-100000000001',editor='00000000-0000-4000-8000-100000000002',member='00000000-0000-4000-8000-100000000003';

test('actual device viewport renders unsaved bilingual fields, direct selection and bounded themes',async({page,context})=>{
 test.setTimeout(60000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));const writes:string[]=[];page.on('request',request=>{if(request.method()==='POST')writes.push(request.url());});await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);
 await page.setViewportSize({width:1440,height:900});await page.goto('/studio/?section=homepage');
 const panel=page.locator('[data-device-preview]'),live=page.frameLocator('[data-device-frame]');
 await expect(panel.locator('[data-device-status]')).toContainText('1440px');
 await page.locator('[name=hero_title_tr]').fill('Canlı cihaz vitrin başlığı');
 await expect(live.locator('.hero-copy>h1')).toHaveText('Canlı cihaz vitrin başlığı');
 await expect.poll(()=>live.locator('.hero-art').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 const fields=await page.locator('.homepage-hero-editor>.homepage-hero-fields').boundingBox(),preview=await panel.boundingBox();
 expect(preview!.x).toBeGreaterThan(fields!.x+fields!.width);
 for(const [name,width]of [['Masaüstü',1440],['Tablet',768],['Mobil',390]] as const){
  await panel.getByRole('button',{name,exact:true}).click();await expect.poll(()=>live.locator('html').evaluate(()=>innerWidth)).toBe(width);
  expect(await live.locator('html').evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await live.locator('.hero-copy>h1').click();await expect(page.locator('[name=hero_title_tr]')).toBeFocused();
 const imageField=page.locator('[name=hero_image_url]');await imageField.focus();await page.evaluate(()=>window.postMessage({type:'palmarghe-preview-select',field:'hero_title_tr'},location.origin));await expect(imageField).toBeFocused();
 await live.locator('html').evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://untrusted.invalid',source:parent,data:{type:'palmarghe-preview-update',values:{title:'Untrusted'}}})));await expect(live.locator('.hero-copy>h1')).toHaveText('Canlı cihaz vitrin başlığı');
 await page.locator('[name=hero_title_en]').fill('Live English showcase');await panel.locator('[data-device-locale]').selectOption('en');
 await expect(live.locator('.hero-copy>h1')).toHaveText('Live English showcase');
 await live.locator('.hero-copy>h1').press('Enter');await expect(page.locator('[name=hero_title_en]')).toBeFocused();
 for(const theme of ['dark','light','aurora']){
  await page.evaluate(value=>document.body.dataset.theme=value,theme);await expect(live.locator('body')).toHaveAttribute('data-theme',theme);
  const findings=await new AxeBuilder({page}).include('[data-device-preview]').include({fromFrames:['[data-device-frame]','main']}).analyze();expect(findings.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 }
 await page.locator('[name=hero_visible]').uncheck();await expect(live.locator('[data-hero-editable]')).not.toBeVisible();
 await page.getByRole('button',{name:'Değişiklikleri geri al',exact:true}).click();await expect(page.locator('.studio-change-summary')).toHaveText('');
 await panel.locator('[data-device-locale]').selectOption('tr');await expect(page.locator('.studio-change-summary')).toHaveText('');
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);expect(writes).toEqual([]);
});

test('preview is private and only its same-origin framing exception is exposed',async({browser})=>{
 for(const [identity,status]of [[null,401],[member,403],[editor,403],[admin,200]] as const){
  const context=await browser.newContext();if(identity)await context.addCookies([{name:'pg_mock_user',value:identity,url:origin}]);
  const response=await context.request.get(origin+'/studio/preview/homepage/');expect(response.status()).toBe(status);
  expect(response.headers()['cache-control']).toContain('no-store');expect(response.headers()['x-robots-tag']).toContain('noindex');
  expect(response.headers()['x-frame-options']).toBe('SAMEORIGIN');expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'self'");
  const publicPage=await context.request.get(origin+'/');expect(publicPage.headers()['x-frame-options']).toBe('DENY');expect(publicPage.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  await context.close();
 }
});

test('preview load failure retains edits and explicit retry restores the real frame',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);
 await page.route('**/studio/preview/homepage/',route=>route.fulfill({status:503,contentType:'text/plain',body:'Temporarily unavailable'}));
 await page.goto('/studio/?section=homepage');await page.locator('[name=hero_title_tr]').fill('Retained preview fields');
 await expect(page.locator('[data-device-status]')).toContainText('Alanların korunuyor');
 await page.unroute('**/studio/preview/homepage/');await page.getByRole('button',{name:'Önizlemeyi yeniden yükle',exact:true}).click();
 await expect(page.frameLocator('[data-device-frame]').locator('.hero-copy>h1')).toHaveText('Retained preview fields');
 await expect(page.locator('[name=hero_title_tr]')).toHaveValue('Retained preview fields');await expect(page.locator('[data-device-retry]')).not.toBeVisible();
});

test('a stalled preview stops waiting without discarding form values',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);await page.clock.install();
 await page.route('**/studio/preview/homepage/',()=>{});
 await page.goto('/studio/?section=homepage',{waitUntil:'domcontentloaded'});await page.locator('[name=hero_title_tr]').fill('Stalled preview input');
 await page.clock.fastForward(15001);await expect(page.locator('[data-device-status]')).toContainText('Alanların korunuyor');
 await expect(page.locator('[name=hero_title_tr]')).toHaveValue('Stalled preview input');await expect(page.locator('[data-device-retry]')).toBeVisible();
});
