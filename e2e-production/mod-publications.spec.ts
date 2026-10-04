import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
const publications=JSON.parse(readFileSync('docs/mod-publications-2026-10-04/publications.json','utf8')) as {key:string;slug:string;source:string}[];
for(const work of publications){
 test(`${work.key}: public project, cover, source and responsive themes`,async({page})=>{
  await page.goto(`/${work.slug}/`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://palmarghe.com/${work.slug}/`);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.content-detail')).toContainText('Kaynak kontrol tarihi: 4 Ekim 2026');
  await expect(page.locator('.content-detail a[href="'+work.source+'"]').first()).toBeVisible();
  await expect(page.getByRole('link',{name:'Projeyi aç ↗',exact:true})).toHaveAttribute('href',work.source);
  const cover=page.locator('.content-detail > img');
  await expect(cover).toBeVisible();await expect.poll(()=>cover.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(cover).toHaveCSS('object-position','50% 50%');
  for(const width of [390,1440])for(const theme of ['dark','light']){
   await page.setViewportSize({width,height:900});await page.evaluate(value=>document.body.dataset.theme=value,theme);
   // Link colors animate on theme switches; audit the completed theme, not intermediate colors.
   await expect(page.locator('.newsletter-consent a')).toHaveCSS('color',theme==='light'?'rgb(32, 29, 39)':'rgb(243, 241, 234)');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   expect(result.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
  }
 });
}
test('all three projects are linked in Gaming and the sitemap',async({page,request})=>{
 await page.goto('/gaming/');
 for(const work of publications)await expect(page.locator(`main a[href="/${work.slug}/"]`).first()).toBeVisible();
 const sitemap=await (await request.get('/sitemap.xml')).text();
 for(const work of publications)expect(sitemap).toContain(`https://palmarghe.com/${work.slug}/`);
});
