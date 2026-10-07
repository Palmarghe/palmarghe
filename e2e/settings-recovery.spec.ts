import {test,expect} from '@playwright/test';
const origin='http://127.0.0.1:4322';
for(const section of ['appearance','settings'])test(section+' settings retain edits after failure and confirm real retry',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 await page.setViewportSize({width:390,height:844});await page.goto('/studio/?section='+section);
 const form=page.locator(section==='appearance'?'.appearance-editor':'.social-editor');
 const original=await form.evaluate(f=>[...new FormData(f as HTMLFormElement).entries()].map(([k,v])=>[k,String(v)]));
 try{
  if(section==='appearance')await form.locator('[name=accent]').selectOption('blue');else await form.locator('[name=youtube]').fill('https://www.youtube.com/@palmarghe');
  await page.route('**/api/studio/',route=>route.fulfill({status:503,body:'Unavailable'}));
  await form.getByRole('button',{name:'Kaydet',exact:true}).click();await expect(form.locator('.studio-settings-status')).toContainText('Girdileriniz korunuyor');
  await expect(form.locator('.studio-change-summary')).toContainText('alan değişti');
  if(section==='appearance')await expect(form.locator('[name=accent]')).toHaveValue('blue');else await expect(form.locator('[name=youtube]')).toHaveValue('https://www.youtube.com/@palmarghe');
  await page.unroute('**/api/studio/');const loaded=page.waitForEvent('domcontentloaded');const confirmed=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/studio/');await form.getByRole('button',{name:'Kaydet',exact:true}).click();expect((await confirmed).status()).toBe(303);await loaded;await expect(page).toHaveURL(new RegExp('section='+section));await page.reload();
  if(section==='appearance')await expect(form.locator('[name=accent]')).toHaveValue('blue');else await expect(form.locator('[name=youtube]')).toHaveValue('https://www.youtube.com/@palmarghe');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await page.unroute('**/api/studio/');expect((await context.request.post('/api/studio/',{headers:{Origin:origin},form:Object.fromEntries(original)})).ok()).toBe(true);}
});
