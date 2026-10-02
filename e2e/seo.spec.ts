import { test, expect } from '@playwright/test';

test('author landing has a localized heading and useful publication navigation',async({page})=>{
  for(const [url,title] of [['/authors/','Yazarlar'],['/en/authors/','Authors']]){
    const response=await page.goto(url);expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page).toHaveTitle(new RegExp(title));
    await expect(page.locator('main a[href$="/archive/"]')).toBeVisible();
  }
});

const origin = 'http://127.0.0.1:4322';
async function admin(page: import('@playwright/test').Page) {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.getByRole('heading', {name:'Genel bakış'})).toBeVisible();
}

test('older published detail remains public beyond the latest thirty entries; drafts stay private', async ({ page, browser }) => {
  await admin(page);
  const prefix = `seo-archive-${Date.now()}`;
  for (let index=0;index<31;index++) {
    const response = await page.request.post('/api/studio/', {headers:{Origin:origin},maxRedirects:0,form:{entity:'content',locale:'tr',type:'article',title:`Archive QA ${index}`,slug:`${prefix}-${index}`,status:'published',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Archive detail QA.'}]}]})}});
    expect(response.status()).toBe(303);
  }
  const draft = await page.request.post('/api/studio/', {headers:{Origin:origin},maxRedirects:0,form:{entity:'content',locale:'tr',type:'article',title:'Private archive QA',slug:`${prefix}-draft`,status:'draft',body:JSON.stringify({type:'doc',content:[{type:'paragraph'}]})}});
  expect(draft.status()).toBe(303);
  const visitor = await browser.newContext();
  const publicPage = await visitor.newPage();
  const response = await publicPage.goto(`/${prefix}-0/`);
  expect(response?.status()).toBe(200);
  await expect(publicPage.getByRole('heading',{level:1,name:'Archive QA 0'})).toBeVisible();
  await expect(publicPage.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://palmarghe.com/${prefix}-0/`);
  expect((await publicPage.goto(`/${prefix}-draft/`))?.status()).toBe(404);
  await visitor.close();
});

test('nested taxonomy has reciprocal language URLs and is included once in sitemap', async ({ page }) => {
  await admin(page);
  const slug = `seo-nested-${Date.now()}`;
  const created = await page.request.post('/api/studio/',{headers:{Origin:origin},maxRedirects:0,form:{entity:'category',slug,name_tr:'SEO iç kategori',name_en:'SEO nested category',parent_id:'00000000-0000-4000-8000-000000000005',active:'on'}});
  expect(created.status()).toBe(303);
  const path=`fm/fm26/${slug}`;
  for (const locale of ['tr','en']) {
    const url=`/${locale==='en'?'en/':''}${path}/`;
    expect((await page.goto(url))?.status()).toBe(200);
    await expect(page.locator('link[hreflang="tr"]')).toHaveAttribute('href',`https://palmarghe.com/${path}/`);
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href',`https://palmarghe.com/en/${path}/`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/SEO/);
  }
  const xml=await (await page.request.get('/sitemap.xml')).text();
  expect(xml.split(`<loc>https://palmarghe.com/${path}/</loc>`)).toHaveLength(2);
  expect(xml.split('<loc>https://palmarghe.com/fm/fm26/</loc>')).toHaveLength(2);
  expect((await page.goto(`/${slug}/`))?.status()).toBe(404);
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(0);
});
