import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const origin='http://127.0.0.1:4322';
const admin={name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin};
test.beforeAll(async({browser})=>{
 const context=await browser.newContext();await context.addCookies([admin]);
 const page=await context.newPage();await page.goto(`${origin}/studio/?section=content`);
 const existingTitles=await page.locator('.content-list tbody tr td:first-child strong').allTextContents();
 await page.goto(`${origin}/studio/?section=media`);
 const mediaCard=page.locator('.entry-card').filter({has:page.locator('input[value="Yerel görsel regresyon örneği"]')});
 if(await mediaCard.count()===0){
  const upload=await context.request.post(`${origin}/api/media/`,{headers:{Origin:origin},multipart:{file:{name:'visual-fixture.webp',mimeType:'image/webp',buffer:await readFile('public/visuals/hero-glass.webp')},alt_tr:'Yerel görsel regresyon örneği'}});expect(upload.ok(),await upload.text()).toBe(true);await page.reload();
 }
 const mediaId=await mediaCard.locator('input[name=id]').first().inputValue();
 for(const [index,title]of ['Oyunlar için yeni bir bakış','Bağımsız seslerin günlüğü','Dijital üretim ve tasarım'].entries()){
  if(existingTitles.includes(title))continue;
  const result=await context.request.post(`${origin}/api/studio/`,{headers:{Origin:origin},form:{entity:'content',title,slug:`visual-fixture-${index}`,locale:'tr',type:'article',status:'published',excerpt:'Sabit yerel örnek: görsel, tipografi ve kart hizalaması için.',cover_media_id:mediaId,body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Yalnız yerel görsel test verisi.'}]}]})}});expect(result.ok(),await result.text()).toBe(true);
 }
 await context.close();
});

for(const width of [390,1440])for(const theme of ['dark','light','aurora'])for(const surface of ['home','search','dashboard','editor','homepage']){
 test(`${surface} ${theme} ${width}`,async({page,context})=>{
  await page.setViewportSize({width,height:900});
  await page.addInitScript(theme=>localStorage.setItem('palmarghe-theme',theme),theme);
  if(['dashboard','editor','homepage'].includes(surface))await context.addCookies([admin]);
  const path=surface==='home'?'/':surface==='search'?'/search/?q=Dijital':`/studio/?section=${surface==='editor'?'content':surface}`;
  await page.goto(path);await expect(page.locator('body')).toHaveAttribute('data-theme',theme);
  await page.evaluate(()=>document.fonts.ready);
  if(surface==='search')await expect(page.locator('main [data-search-result]').first()).toBeVisible();
  // Bring each displayed lazy image into view; hidden menu/modal assets are not photographed.
  for(const image of await page.locator('img:visible').all()){
   await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0)).toBe(true);
  }
  await page.evaluate(()=>scrollTo(0,0));
  if(surface==='search'){
   await page.locator('main input[name=q]').press('Tab');await page.keyboard.press('Shift+Tab');
   await expect(page.locator('main input[name=q]')).toBeFocused();
  }
  if(surface==='homepage')await expect(page.locator('[data-device-preview]>[role=status]')).toContainText('1440px');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page).toHaveScreenshot(`${surface}-${theme}-${width}.png`,{fullPage:true,mask:[page.locator('time'),page.locator('.content-list .admin-table tbody tr td:nth-child(5)')]});
 });
}
