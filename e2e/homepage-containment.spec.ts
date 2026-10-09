import { test, expect } from '@playwright/test';
const origin='http://127.0.0.1:4322';
test('live-length homepage selections stay inside the Studio viewport at intermediate widths',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 await page.goto('/studio/?section=homepage');
 // Real option text has intrinsic sizing unlike the empty adapter catalog.
 await page.locator('select[name=spotlight_id]').evaluate(select=>{const option=document.createElement('option');option.value='layout-only';option.textContent='Palmarghe Colony Director — Koloni yönetimi ve isteğe bağlı hile araçları';select.append(option);});
 for(const width of [901,921,1024,1100]){
  await page.setViewportSize({width,height:900});
  for(const theme of ['dark','light','aurora']){
   await page.evaluate(t=>document.body.dataset.theme=t,theme);
   const bounds=await page.evaluate(()=>{const width=document.documentElement.clientWidth;return {width,scroll:document.documentElement.scrollWidth,fields:[...document.querySelectorAll('.homepage-editor>.studio-panel,.homepage-editor>.studio-change-bar,.homepage-editor select')].map(e=>e.getBoundingClientRect().right)};});
   expect(bounds.scroll).toBeLessThanOrEqual(bounds.width);
   expect(bounds.fields.every(right=>right<=bounds.width+1)).toBe(true);
  }
 }
 await page.locator('[name=hero_title_tr]').focus();await expect(page.locator('[name=hero_title_tr]')).toBeFocused();
 await page.locator('[name=hero_title_tr]').press('Tab');await expect(page.locator('[name=hero_title_en]')).toBeFocused();
 await page.locator('[data-device-preview]').getByRole('button',{name:'Mobil',exact:true}).click();
 await expect.poll(()=>page.frameLocator('[data-device-frame]').locator('html').evaluate(()=>innerWidth)).toBe(390);
});
