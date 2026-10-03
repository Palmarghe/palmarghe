import {test,expect} from '@playwright/test';
test('Studio header entry is restricted to admin/editor at desktop and mobile sizes',async({page,context})=>{
 for(const [role,id] of [['anonymous',''],['member','00000000-0000-4000-8000-100000000003'],['editor','00000000-0000-4000-8000-100000000002'],['admin','00000000-0000-4000-8000-100000000001']]){
  await context.clearCookies();
  if(id)await context.addCookies([{name:'pg_mock_user',value:id,url:'http://127.0.0.1:4322'}]);
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});await page.goto('/');
   expect(await page.locator('.studio-entry-link').count()).toBe(['admin','editor'].includes(role)?2:0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.goto('/account/');
  await expect(page.locator('.account-content a[href^="https://studio.palmarghe.com/"]')).toHaveCount(0);
 }
});
