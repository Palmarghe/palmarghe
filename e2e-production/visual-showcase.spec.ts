import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('live curated showcase and visual spotlight load in both themes and sizes',async({page})=>{
 await page.goto('/');await expect(page.locator('h1')).toHaveText('Modlar, müzik ve yeni fikirler.');
 await expect(page.locator('.featured-card')).toHaveCount(3);
 for(const img of await page.locator('.hero-preview img,.featured-card img').all()){
  await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 }
 await expect(page.locator('.spotlight a')).toHaveAttribute('href','/gaming/stranded-alien-dawn/colony-director/');
 const image=page.locator('.spotlight img');await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 for(const width of [320,390,1024,1440])for(const theme of ['dark','light']){
  await page.setViewportSize({width,height:900});await page.evaluate(t=>document.body.dataset.theme=t,theme);
  await expect(page.locator('.category strong').first()).toHaveCSS('color','rgb(243, 241, 234)');
  if(width>900) expect(await page.locator('.latest-section .entry-card').evaluateAll(cards=>cards.length!==4 || Math.abs(cards[0].getBoundingClientRect().top-cards[1].getBoundingClientRect().top)<1 && cards[2].getBoundingClientRect().top>cards[0].getBoundingClientRect().top)).toBe(true);
  await expect(page.locator('.newsletter-consent a')).toHaveCSS('color',theme==='light'?'rgb(32, 29, 39)':'rgb(243, 241, 234)');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 }
});
test('live game subcategories are available from desktop and mobile header',async({page})=>{
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  if(width===390)await page.getByRole('button',{name:'Menüyü aç',exact:true}).click();
  const nav=page.locator(width===390?'#mobile-nav':'.desktop-nav');const detail=nav.locator('.nav-category').filter({has:page.locator('summary[aria-label="Oyunlar — alt kategoriler"]')}).locator('details');
  await detail.locator('summary').click();await expect(detail).toHaveAttribute('open','');await expect(detail.getByRole('link',{name:'Stranded: Alien Dawn',exact:true})).toBeVisible();await expect(detail.getByRole('link',{name:'Stranded: Alien Dawn',exact:true})).toHaveAttribute('href','/gaming/stranded-alien-dawn/');await expect(detail.getByRole('link',{name:'Minecraft',exact:true})).toHaveAttribute('href','/gaming/minecraft/');
  await detail.locator('summary').press('Escape');await expect(detail).not.toHaveAttribute('open','');
 }
});

