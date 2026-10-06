import {test,expect} from '@playwright/test';

test('reduced motion disables page animations and smooth scrolling',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 for(const pseudo of ['::view-transition-old(root)','::view-transition-new(root)']){
  expect(await page.evaluate(p=>getComputedStyle(document.documentElement,p).animationName,pseudo)).toBe('none');
 }
 await expect(page.locator('html')).toHaveCSS('scroll-behavior','auto');
 await page.emulateMedia({reducedMotion:'no-preference'});
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement,'::view-transition-new(root)').animationName)).toBe('palmarghe-page-in');
});

test('returning from a footer destination restores the reading position',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 const about=page.locator('.footer-bottom nav a').first();await about.scrollIntoViewIfNeeded();
 const position=await page.evaluate(()=>scrollY);expect(position).toBeGreaterThan(500);
 await about.click();await expect(page).toHaveURL(/\/about\/$/);await page.goBack();
 await expect(page).toHaveURL('http://127.0.0.1:4322/');
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(position-10);
 expect(await page.evaluate(()=>scrollY)).toBeLessThan(position+10);
});
