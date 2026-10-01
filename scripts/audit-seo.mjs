import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext();
const page = await context.newPage();
const sitemap = await (await context.request.get('https://palmarghe.com/sitemap.xml')).text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const rows = [];
for (const url of [...new Set([...urls, 'https://palmarghe.com/music/', 'https://palmarghe.com/en/music/'])]) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  rows.push({ requestedUrl: url, status: response.status(), ...await page.evaluate(() => ({
    url:location.href, lang:document.documentElement.lang, title:document.title,
    description:document.querySelector('meta[name="description"]')?.content,
    canonical:document.querySelector('link[rel="canonical"]')?.href,
    robots:document.querySelector('meta[name="robots"]')?.content,
    headings:[...document.querySelectorAll('main h1')].map(e=>e.textContent.trim()),
    alternates:[...document.querySelectorAll('link[hreflang]')].map(e=>({lang:e.hreflang,href:e.href})),
    ogImage:document.querySelector('meta[property="og:image"]')?.content,
    schema:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent))
  })) });
}
const result={capturedAt:new Date().toISOString(),sitemapUrls:urls,rows};
await writeFile(process.argv[2] ?? 'docs/seo-live-audit.json', JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({pages:rows.length,sitemapUrls:urls.length,musicInSitemap:urls.includes('https://palmarghe.com/music/'),descriptions:new Set(rows.map(r=>r.description)).size,wrongAlternates:rows.flatMap(r=>r.alternates.filter(a=>a.lang!==r.lang&&a.lang!=='x-default'&&new URL(a.href).pathname==='/en/'&&new URL(r.url).pathname!=='/').map(a=>({url:r.url,alternate:a.href})))},null,2));
await browser.close();
