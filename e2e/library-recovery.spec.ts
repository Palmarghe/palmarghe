import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:4322';
const admin='00000000-0000-4000-8000-100000000001',member='00000000-0000-4000-8000-100000000003';
async function publication(context:any){
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);
 const slug='library-recovery-'+Date.now();
 const created=await context.request.post('/api/studio/',{headers:{Origin:origin},form:{entity:'content',title:slug,slug,locale:'tr',type:'article',status:'published',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Local transaction fixture.'}]}]})}});expect(created.ok()).toBe(true);
 const results=await context.request.get('/api/search/?q='+slug);const entry=(await results.json()).results[0];expect(entry).toBeTruthy();
 await context.addCookies([{name:'pg_mock_user',value:member,url:origin}]);return entry;
}
test('explicit desired states converge under parallel replay and reject changed sessions before writes',async({page,context})=>{
 const entry=await publication(context);
 const send=(data:any)=>context.request.post('/api/library/',{headers:{Origin:origin},data});
 for(const action of ['like','bookmark','follow']){
  const payload={action,viewer_id:member,...(action==='follow'?{targetKind:'category',targetId:'00000000-0000-4000-8000-000000000003'}:{contentId:entry.id})};
  const state=action==='like'?'liked':action==='bookmark'?'saved':'following';
  const first=await Promise.all([send({...payload,desired:true}),send({...payload,desired:true})]);
  for(const response of first){expect(response.ok()).toBe(true);expect((await response.json())[state]).toBe(true);}
  if(action==='like'){expect((await (await send({...payload,desired:true})).json()).count).toBe(1);}
  for(let i=0;i<2;i++){const response=await send({...payload,desired:false});expect(response.ok()).toBe(true);const body=await response.json();expect(body[state]).toBe(false);if(action==='like')expect(body.count).toBe(0);}
 }
 expect((await send({action:'like',contentId:entry.id,viewer_id:admin,desired:true})).status()).toBe(401);
 await page.goto('/'+entry.slug+'/');await expect(page.locator('[data-like]')).toHaveAttribute('aria-pressed','false');await expect(page.locator('[data-bookmark]')).toHaveAttribute('aria-pressed','false');
 expect((await context.request.post('/api/library/',{headers:{Origin:'https://foreign.example'},data:{action:'like',contentId:entry.id,desired:true}})).status()).toBe(403);
 await context.clearCookies();expect((await send({action:'like',contentId:entry.id,desired:true})).status()).toBe(401);
});
test('lost acknowledgement after actual commit keeps one desired action, manual retry and reload confirm it',async({page,context})=>{
 test.setTimeout(90000);const entry=await publication(context);await page.clock.install();
 let writes=0;const sent:any[]=[];
 await page.route('**/api/library/',async route=>{
  writes++;const data=route.request().postDataJSON();sent.push(data);
  const response=await route.fetch();expect(response.ok()).toBe(true);
  if(writes===1)return;await route.fulfill({response});
 });
 await page.goto('/'+entry.slug+'/');const bookmark=page.locator('[data-bookmark]');await bookmark.click();await expect.poll(()=>writes).toBe(1);await expect(bookmark).toBeDisabled();
 await page.evaluate(()=>document.querySelector('[data-bookmark]')?.dispatchEvent(new Event('click')));expect(writes).toBe(1);
 await page.clock.fastForward(12001);await expect(bookmark).toBeEnabled();await expect(bookmark).toHaveAttribute('aria-pressed','false');await expect(page.locator('.action-feedback')).toContainText('Sonuç doğrulanamadı');
 await page.evaluate(()=>window.dispatchEvent(new Event('online')));expect(writes).toBe(1);
 await bookmark.click();await expect(bookmark).toHaveAttribute('aria-pressed','true');expect(sent[0]).toEqual(sent[1]);
 await page.locator('[data-like]').click();await expect(page.locator('[data-like]')).toContainText('· 1');
 for(const width of [320,390,1440])for(const theme of ['dark','light','aurora']){
  await page.setViewportSize({width,height:900});await page.evaluate(value=>document.body.dataset.theme=value,theme);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const audit=await new AxeBuilder({page}).include('.content-detail-footer').analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 }
 await page.reload();await expect(bookmark).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-like]')).toContainText('· 1');
 await bookmark.click();await expect(bookmark).toHaveAttribute('aria-pressed','false');await page.locator('[data-like]').click();await expect(page.locator('[data-like]')).toContainText('· 0');
 await page.goto('/account/');await page.getByRole('tab',{name:'Okuma listesi',exact:true}).click();await expect(page.locator('.saved-reading')).not.toContainText(entry.title);
});
