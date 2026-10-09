import {test,expect,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:4322',admin='00000000-0000-4000-8000-100000000001';
const cases=[['members','member_account'],['members','member_group'],['access','permission_group'],['messages','message'],['comments','comment']] as const;
const values=(form:Locator)=>form.evaluate(f=>[...new FormData(f as HTMLFormElement)].map(([k,v])=>[k,String(v)]));

for(const [section,entity] of cases)test(`${entity} retains inputs and usable controls during pending, failure and retry`,async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);
 if(entity==='message'){
  const saved=await context.request.post('/api/contact/',{headers:{Origin:origin,'cf-connecting-ip':'community-recovery-fixture'},form:{name:'Local recovery fixture',email:'recovery@example.test',message:'Local controlled message recovery fixture.',locale:'tr',privacy_acknowledgement:'on','cf-turnstile-response':'local-test-token'}});
  expect(saved.ok()).toBe(true);
 }
 let contentId:string|undefined;
 if(entity==='comment'){
  const slug='community-recovery-'+Date.now();
  const saved=await context.request.post('/api/studio/',{headers:{Origin:origin},form:{entity:'content',title:'Local comment recovery fixture',slug,locale:'tr',type:'article',status:'published',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Controlled local fixture.'}]}]})}});
  expect(saved.ok()).toBe(true);
  const comment=await context.request.post('/api/comments/',{headers:{Origin:origin},form:{path:`/${slug}/`,body:'Controlled moderation recovery fixture.'}});expect(comment.ok()).toBe(true);
  const read=await context.request.get(`/api/comments/?path=/${slug}/`);expect(read.ok()).toBe(true);contentId=(await read.json()).contentId;expect(contentId).toMatch(/^[0-9a-f-]{36}$/);
 }
 await page.goto('/studio/?section='+section);
 const form=entity==='comment'?page.locator('.comment-moderation-list article').filter({hasText:'Controlled moderation recovery fixture.'}).locator('form').first():entity==='message'?page.locator('.admin-table tr').filter({hasText:'Local recovery fixture'}).locator('form').first():page.locator(`form:has(input[name=entity][value="${entity}"])`).first();
 if(entity==='member_account'){
  await form.locator('[name=display_name]').fill('Local retained member');await form.locator('[name=email]').fill('retained@example.test');await form.locator('[name=password]').fill('abcdefgh');
 }else if(entity==='permission_group'){
  await form.locator('[name=name]').fill('Local retained group');await form.locator('[name=description]').fill('Retain this description after failure.');
  await form.locator('[name=permission_messages]').check();
 }
 for(const width of [320,390,921])for(const theme of ['dark','light','aurora']){
  await page.setViewportSize({width,height:640});await page.evaluate(t=>document.body.dataset.theme=t,theme);
  const bounds=await form.evaluate(f=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,controls:[...f.querySelectorAll('button,select,input:not([type=hidden]):not([type=checkbox]),textarea')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({right:e.getBoundingClientRect().right,height:e.getBoundingClientRect().height}))}));
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.client);expect(bounds.controls.every(c=>c.right<=bounds.client+1)).toBe(true);expect(bounds.controls.every(c=>c.height>=44)).toBe(true);
  const audit=await new AxeBuilder({page}).include('main').analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 }
 const before=await values(form);let posts=0;let release!:()=>void;const pending=new Promise<void>(resolve=>release=resolve);
 await page.route('**/api/studio/',async route=>{posts++;await pending;await route.fulfill({status:503,body:'Controlled failure'});});
 const button=form.locator('button').first();await button.click();await expect(form).toHaveAttribute('aria-busy','true');await expect(button).toBeDisabled();
 await form.evaluate(f=>f.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true})));expect(posts).toBe(1);
 release();await expect(form.locator('.studio-settings-status')).toContainText('Girdileriniz korunuyor');await expect(button).toBeEnabled();expect(await values(form)).toEqual(before);
 await page.unroute('**/api/studio/');await page.route('**/api/studio/',route=>route.abort());await button.click();await expect(form.locator('.studio-settings-status')).toContainText('Bağlantı kurulamadı');expect(await values(form)).toEqual(before);
 const axe=await new AxeBuilder({page}).include('main').analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 await page.unroute('**/api/studio/');
 if(entity==='member_account'){
  await page.clock.install();let releaseTimeout!:()=>void;const held=new Promise<void>(resolve=>releaseTimeout=resolve);let timeoutPosts=0;
  await page.route('**/api/studio/',async route=>{timeoutPosts++;await held;await route.abort().catch(()=>{});});
  await button.click();await expect(form).toHaveAttribute('aria-busy','true');await page.clock.fastForward(31_000);
  await expect(form.locator('.studio-settings-status')).toContainText('İşlemin sonucu doğrulanamadı');await expect(button).toBeEnabled();expect(await values(form)).toEqual(before);expect(timeoutPosts).toBe(1);
  releaseTimeout();await page.unroute('**/api/studio/');
 }
 if(entity==='comment'){
  let submitted='';await page.route('**/api/studio/',async route=>{submitted=route.request().postData()??'';await route.fulfill({status:503,body:'Controlled delete failure'});});
  await form.getByRole('button',{name:'Sil',exact:true}).click();await expect(form.locator('.studio-settings-status')).toContainText('Girdileriniz korunuyor');expect(submitted).toMatch(/name="operation"\r\n\r\ndelete/);expect(await values(form)).toEqual(before);
  await page.unroute('**/api/studio/');
 }
 // All submissions above are intercepted. Only this test's disposable local article is removed.
 if(contentId){const removed=await context.request.post('/api/studio/',{headers:{Origin:origin},form:{entity:'content',operation:'delete',id:contentId}});expect(removed.ok()).toBe(true);}
});
