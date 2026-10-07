import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('collection directory remains bounded and accessible in all themes without exposing Studio',async({page,request})=>{
 for(const theme of ['dark','light','aurora'])for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});await page.addInitScript(t=>localStorage.setItem('palmarghe-theme',t),theme);
  const response=await page.goto('/collections/');expect(response?.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveCount(1);await expect(page.locator('body')).toHaveAttribute('data-theme',theme);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 }
 const denied=await request.post('https://studio.palmarghe.com/api/studio/',{headers:{Origin:'https://studio.palmarghe.com'},form:{entity:'collection',title:'Never created'}});expect(denied.status()).toBe(401);
});
