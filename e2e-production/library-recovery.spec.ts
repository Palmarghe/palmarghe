import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.use({serviceWorkers:'block'});
const viewer='00000000-0000-4000-8000-100000000003';
test('deployed library preserves desired state on timeout and rejects malformed receipts without production writes',async({page})=>{
 await page.clock.install();let writes=0;const payloads:any[]=[];
 // Read real anonymous article HTML; only its viewer marker is a controlled fixture.
 // Every mutation is intercepted; this is a client recovery proof, not authenticated DB QA.
 await page.route('**/fm/lamine-yamal-fm26/?verify=library',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replaceAll('data-library-viewer=""',`data-library-viewer="${viewer}"`)});});
 await page.route('**/api/library/',async route=>{
  expect(route.request().method()).toBe('POST');const body=route.request().postDataJSON();payloads.push(body);writes++;
  if(writes===1)return;
  if(writes===2)return route.fulfill({json:{saved:true}});
  const state=body.action==='like'?'liked':'saved';return route.fulfill({json:{[state]:body.desired,viewer_id:viewer,count:1}});
 });
 await page.goto('/fm/lamine-yamal-fm26/?verify=library');const bookmark=page.locator('[data-bookmark]'),like=page.locator('[data-like]');
 await bookmark.click();await expect.poll(()=>writes).toBe(1);await expect(bookmark).toBeDisabled();await page.clock.fastForward(12001);await expect(bookmark).toBeEnabled();await expect(bookmark).toHaveAttribute('aria-pressed','false');await expect(page.locator('.action-feedback')).toContainText('Sonuç doğrulanamadı');
 await page.evaluate(()=>window.dispatchEvent(new Event('online')));expect(writes).toBe(1);
 await bookmark.click();await expect(page.locator('.action-feedback')).toContainText('Sonuç doğrulanamadı');await expect(bookmark).toHaveAttribute('aria-pressed','false');
 await bookmark.click();await expect(bookmark).toHaveAttribute('aria-pressed','true');expect(payloads[0]).toEqual(payloads[1]);expect(payloads[1]).toEqual(payloads[2]);
 await like.click();await expect(like).toHaveAttribute('aria-pressed','true');
 for(const width of [320,390,1440])for(const theme of ['light','dark','aurora']){
  await page.setViewportSize({width,height:900});await page.evaluate(value=>document.body.dataset.theme=value,theme);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const audit=await new AxeBuilder({page}).include('.content-detail-footer').analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 }
 await bookmark.click();await expect(bookmark).toHaveAttribute('aria-pressed','false');expect(payloads.at(-1).desired).toBe(false);
});
test('anonymous deployed controls navigate to account and server mutation remains unauthorized',async({page,request})=>{
 await page.goto('/fm/lamine-yamal-fm26/?verify=library-anonymous');await page.locator('[data-bookmark]').click();await expect(page).toHaveURL(/\/account\/$/);
 const response=await request.post('/api/library/',{headers:{Origin:'https://palmarghe.com'},data:{action:'bookmark',contentId:'00000000-0000-4000-8000-200000000001',desired:true,viewer_id:viewer}});expect(response.status()).toBe(401);
});
