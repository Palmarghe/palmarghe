import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {operationTrends} from '../src/lib/operation-trends';

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

for(const width of [390,768,1440])for(const theme of ['dark','light','aurora'])for(const surface of ['home','search','archive','dashboard','editor','homepage','health','advertising','categories','media']){
 test(`${surface} ${theme} ${width}`,async({page,context})=>{
  await page.setViewportSize({width,height:900});
  if(['home','search','archive'].includes(surface))await page.clock.setFixedTime(new Date('2026-10-09T12:05:00Z'));
  await page.addInitScript(theme=>localStorage.setItem('palmarghe-theme',theme),theme);
  if(['dashboard','editor','homepage','health','advertising','categories','media'].includes(surface))await context.addCookies([admin]);
  if(surface==='health'){
   // Fixed local screenshot fixture, never a claimed production measurement.
   const observations=[{status:303,duration_ms:100,time:'2026-10-07T10:00:00Z',failed:false},{status:400,duration_ms:500,time:'2026-10-07T11:00:00Z',failed:true}];
   await page.route('**/api/studio-health/',route=>route.fulfill({json:{checked_at:'2026-10-07T12:00:00Z',release:'visual-fixture',built_at:'2026-10-07T09:00:00Z',services:{auth:'ok',database:'ok',media_catalog:'ok'},database_ms:20,observations,observations_available:true,trends:operationTrends(observations,Date.parse('2026-10-07T12:00:00Z')),note:'Son 50 örneklenmiş Studio isteği; yalnız yerel görsel test verisi.'}}));
  }
  const path=surface==='home'?'/':surface==='search'?'/search/?q=Dijital':surface==='archive'?'/archive/':`/studio/?section=${surface==='editor'?'content':surface}`;
  await page.goto(path);await expect(page.locator('body')).toHaveAttribute('data-theme',theme);
  await page.evaluate(()=>document.fonts.ready);
  // Deferred navigation/editor code must finish before photographing the surface.
  // CI previously captured the expanded server fallback before nav initialization.
  if(['dashboard','editor','homepage','health'].includes(surface)){
   await expect(page.locator('.studio-nav-group>span[role=button]')).toHaveCount(4);
   if(width>900)for(const group of await page.locator('.studio-nav-group').all()){
    const active=await group.locator('[aria-current=page]').count()>0;
    await expect(group.locator(':scope>span')).toHaveAttribute('aria-expanded',String(active));
   }
  }
  if(surface==='editor'){await expect(page.locator('#block-editor .tiptap')).toHaveAttribute('contenteditable','true');await expect(page.locator('.classic-ribbon [data-editor=undo]')).toBeDisabled();}
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
  if(surface==='health')await expect(page.locator('[data-health-metrics] .health-metric')).toHaveCount(4);
  if(surface==='media'){await expect(page.locator('.media-storage-path')).toHaveText(/^[a-f0-9-]{36}\.webp$/);await expect(page.locator('.media-storage-path').locator('..')).toContainText('image/webp · 29 KB · 1600×900');}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page).toHaveScreenshot(`${surface}-${theme}-${width}.png`,{fullPage:true,mask:[page.locator('time:not([data-site-clock] time)'),page.locator('.media-storage-path'),page.locator('.content-list .admin-table tbody tr td:nth-child(5)')]});
 });
}
