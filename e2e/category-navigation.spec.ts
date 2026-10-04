import {test,expect} from '@playwright/test';
test('desktop and mobile category disclosures support keyboard and child navigation',async({page})=>{
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  if(width===390)await page.getByRole('button',{name:'Menüyü aç',exact:true}).click();
  const nav=page.locator(width===390?'#mobile-nav':'.desktop-nav');
  const detail=nav.locator('.nav-category').filter({hasText:'Football Manager'}).locator('details');
  await detail.locator('summary').press('Enter');await expect(detail).toHaveAttribute('open','');
  await expect(detail.getByRole('link',{name:'FM26',exact:true})).toHaveAttribute('href','/fm/fm26/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await detail.locator('summary').press('Escape');await expect(detail).not.toHaveAttribute('open','');
 }
});
test('subcategory navigation remains available without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});
 const page=await context.newPage();await page.goto('http://127.0.0.1:4322/');
 const detail=page.locator('.desktop-nav .nav-category').filter({hasText:'Football Manager'}).locator('details');
 await detail.locator('summary').click();await detail.getByRole('link',{name:'FM26',exact:true}).click();await expect(page).toHaveURL(/\/fm\/fm26\/$/);await context.close();
});
