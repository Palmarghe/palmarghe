import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('production category search and relevant suggestions work with live publications',async({page,request})=>{
 test.setTimeout(90000);
 const response=await request.get('/api/search/?locale=tr&q=KaanBuilder&category=gaming');expect(response.ok()).toBe(true);
 const data=await response.json();expect(data.results.some((entry:any)=>entry.slug==='gaming/minecraft/kaanbuilder')).toBe(true);
 const missing=await request.get('/api/search/?locale=tr&q=nomatchingqaentry&category=gaming');const empty=await missing.json();expect(empty.results).toEqual([]);expect(empty.suggestions.length).toBeGreaterThan(0);
 for(const width of [320,1440])for(const theme of ['dark','light']){
  await page.setViewportSize({width,height:900});await page.goto('/search/?q=KaanBuilder&category=gaming');await page.evaluate(t=>document.body.dataset.theme=t,theme);
  const root=page.locator('main [data-live-search]');await expect(root.locator('[data-search-result]')).toHaveCount(1);await expect(root.locator('[data-search-result]')).toContainText('KaanBuilder');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const axe=await new AxeBuilder({page}).include('main').analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 }
});

test('production hero, featured and spotlight publications are distinct',async({page})=>{
 await page.goto('/');const paths=await page.locator('.hero-preview,.featured-card,.spotlight a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));expect(paths.length).toBeGreaterThan(3);expect(new Set(paths).size).toBe(paths.length);
 for(const image of await page.locator('.hero-preview img,.featured-card img,.spotlight img').all()){
  await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 }
});
