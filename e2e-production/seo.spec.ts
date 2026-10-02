import { test, expect } from '@playwright/test';

test('live author landing has localized titles and publication navigation',async({page})=>{
  for(const [url,title] of [['/authors/','Yazarlar'],['/en/authors/','Authors']]){
    const response=await page.goto(url);expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page).toHaveTitle(new RegExp(title));
    await expect(page.locator('main a[href$="/archive/"]')).toBeVisible();
  }
});

test('every sitemap URL is canonical, localized and exposes complete metadata with reciprocal alternates', async ({ page, request }) => {
  test.setTimeout(120000);
  const sitemap=await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const urls=[...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
  expect(new Set(urls).size).toBe(urls.length);
  expect(urls).toContain('https://palmarghe.com/music/');
  expect(urls).toContain('https://palmarghe.com/en/music/');
  expect(urls).not.toContain('https://palmarghe.com/fm/lamine-yamal-fm26/');
  const rows: {url:string;lang:string;title:string;description:string;alternates:{lang:string;href:string}[]}[]=[];
  for(const url of urls) {
    const response=await page.goto(url,{waitUntil:'domcontentloaded'});
    expect(response?.status(),url).toBe(200);
    await expect(page.locator('main h1'),url).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]'),url).toHaveAttribute('href',url);
    expect(await page.locator('meta[name="robots"]').count() ? await page.locator('meta[name="robots"]').getAttribute('content') : '').not.toContain('noindex');
    const row=await page.evaluate(()=>({url:location.href,lang:document.documentElement.lang,title:document.title,description:(document.querySelector('meta[name="description"]') as HTMLMetaElement).content,alternates:[...document.querySelectorAll<HTMLLinkElement>('link[hreflang]')].map(e=>({lang:e.hreflang,href:e.href}))}));
    expect(row.description.length,url).toBeGreaterThan(15);
    for(const name of ['title','description','url','image','image:alt']) await expect(page.locator(`meta[property="og:${name}"]`),url).toHaveAttribute('content',/.+/);
    for(const name of ['card','title','description','image','image:alt']) await expect(page.locator(`meta[name="twitter:${name}"]`),url).toHaveAttribute('content',/.+/);
    if(new URL(url).pathname !== '/' && new URL(url).pathname !== '/en/') {
      const schemas=await page.locator('script[type="application/ld+json"]').evaluateAll(scripts=>scripts.flatMap(script=>{const value=JSON.parse(script.textContent ?? '{}');return value['@graph'] ?? [value];}));
      const breadcrumb=schemas.find(schema=>schema['@type']==='BreadcrumbList');
      expect(breadcrumb,url).toBeDefined();
      expect(breadcrumb.itemListElement.at(-1).item,url).toBe(url);
      expect(breadcrumb.itemListElement.map((entry:{position:number})=>entry.position)).toEqual(breadcrumb.itemListElement.map((_:unknown,index:number)=>index+1));
    }
    rows.push(row);
  }
  for(const row of rows) {
    const peerLinks=row.alternates.filter(a=>a.lang!==row.lang&&a.lang!=='x-default');
    for(const link of peerLinks) {
      const peer=rows.find(r=>r.url===link.href);
      expect(peer,`${row.url} alternate ${link.href} must be a matching sitemap page`).toBeDefined();
      expect(peer!.lang).toBe(link.lang);
      expect(peer!.alternates).toContainEqual({lang:row.lang,href:row.url});
    }
    expect(row.alternates).toContainEqual({lang:row.lang,href:row.url});
  }
  for(const locale of ['tr','en']) {
    const localized=rows.filter(r=>r.lang===locale);
    expect(new Set(localized.map(r=>r.title)).size,`${locale} titles`).toBe(localized.length);
    expect(new Set(localized.map(r=>r.description)).size,`${locale} descriptions`).toBe(localized.length);
  }
  await test.info().attach('sitemap-metadata-matrix',{body:JSON.stringify(rows,null,2),contentType:'application/json'});
});
