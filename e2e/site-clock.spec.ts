import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for(const [width,theme] of [[320,'dark'],[768,'light'],[1440,'aurora']] as const){
 test(`footer clock ${width} ${theme}`,async({page})=>{
  const policyErrors:string[]=[];
  page.on('console',message=>{if(message.type()==='error'&&/Content Security Policy/.test(message.text()))policyErrors.push(message.text());});
  await page.setViewportSize({width,height:900});
  await page.clock.install({time:new Date('2026-10-09T20:59:30Z')});
  await page.addInitScript(theme=>localStorage.setItem('palmarghe-theme',theme),theme);
  await page.goto('/');
  const clock=page.locator('[data-site-clock]');
  await expect(page.locator('script[src="/scripts/site-clock.js"]')).toHaveAttribute('type','module');
  await clock.scrollIntoViewIfNeeded();
  await expect(clock.locator('[data-clock-hour]')).toHaveText('23:59');
  await expect(clock.locator('[data-clock-date]')).toHaveText('9 Ekim 2026');
  await page.clock.fastForward(31000);
  await expect(clock.locator('[data-clock-hour]')).toHaveText('00:00');
  await expect(clock.locator('[data-clock-date]')).toHaveText('10 Ekim 2026');
  await expect(page.locator('body')).toHaveAttribute('data-theme',theme);
  expect(await clock.evaluate(node=>{const r=node.getBoundingClientRect();return r.left>=0&&r.right<=document.documentElement.clientWidth&&node.scrollWidth<=node.clientWidth;})).toBe(true);
  expect((await new AxeBuilder({page}).include('[data-site-clock]').analyze()).violations).toEqual([]);
  expect(policyErrors).toEqual([]);
 });
}
test('English clock and server-rendered no-script fallback',async({page,browser,baseURL})=>{
 await page.clock.install({time:new Date('2026-10-09T12:05:00Z')});
 await page.goto('/en/');
 await expect(page.locator('[data-clock-date]')).toHaveText('9 October 2026');
 await expect(page.locator('[data-clock-hour]')).toHaveText('15:05');
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});
 const fallback=await context.newPage();await fallback.goto('/');
 await expect(fallback.locator('[data-clock-hour]')).toHaveText(/^\d{2}:\d{2}$/);
 await expect(fallback.locator('[data-site-clock] time')).toHaveAttribute('datetime',/^\d{4}-\d{2}-\d{2}T/);
 await context.close();
});
