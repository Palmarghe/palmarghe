import {test,expect} from '@playwright/test';
const origin='http://127.0.0.1:4322';
for(const section of ['categories','tags','navigation','redirects'])test(section+' preserves input across failure and rejects duplicate pending submits',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 await page.setViewportSize({width:320,height:640});await page.goto('/studio/?section='+section);
 const form=page.locator('form[action="/api/studio/"]').filter({has:page.locator('input[name=operation][value=create]')}).first();
 const fields=form.locator('input:not([type=hidden]):not([type=checkbox])');
 for(const field of await fields.all()){const type=await field.getAttribute('type');if(type!=='number'&&await field.isVisible())await field.fill((await field.getAttribute('name'))?.includes('path')?'/qa-retained/':'qa-retained');}
 const before=await form.evaluate(f=>[...new FormData(f as HTMLFormElement).entries()].map(([k,v])=>[k,String(v)]));let posts=0;
 let release!:()=>void;const pending=new Promise<void>(resolve=>release=resolve);
 await page.route('**/api/studio/',async route=>{posts++;await pending;await route.fulfill({status:503,body:'Unavailable'});});
 const button=form.locator('button[type=submit],button:not([type])').first();await button.click();await expect(form).toHaveAttribute('aria-busy','true');await expect(button).toBeDisabled();
 await form.evaluate(f=>f.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true})));expect(posts).toBe(1);release();
 await expect(form.locator('.studio-settings-status')).toContainText('Girdileriniz korunuyor');await expect(button).toBeEnabled();
 expect(await form.evaluate(f=>[...new FormData(f as HTMLFormElement).entries()].map(([k,v])=>[k,String(v)]))).toEqual(before);
 await page.unroute('**/api/studio/');await page.route('**/api/studio/',route=>route.abort());await button.click();await expect(form.locator('.studio-settings-status')).toContainText('Bağlantı kurulamadı');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(posts).toBe(1);
});
test('an open taxonomy form rejects a different staff session before any write',async({page,context})=>{
 const admin='00000000-0000-4000-8000-100000000001',editor='00000000-0000-4000-8000-100000000002';
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);await page.goto('/studio/?section=tags');
 const form=page.locator('form[action="/api/studio/"]').filter({has:page.locator('input[name=operation][value=create]')}).first();const unique='session-guard-'+Date.now();
 await form.locator('[name=slug]').fill(unique);await form.locator('[name=name_tr]').fill(unique);await form.locator('[name=name_en]').fill(unique);
 await context.addCookies([{name:'pg_mock_user',value:editor,url:origin}]);
 const receipt=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/studio/');await form.getByRole('button',{name:'Kaydet',exact:true}).click();const response=await receipt;
 expect(response.status()).toBe(409);expect(await response.json()).toEqual({error:'actor_session'});await expect(form.locator('.studio-settings-status')).toContainText('Oturum başka bir hesaba geçti');await expect(form.locator('[name=slug]')).toHaveValue(unique);
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);expect(await (await context.request.get('/studio/?section=tags')).text()).not.toContain(unique);
});
