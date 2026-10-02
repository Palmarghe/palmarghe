import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { publicStyles } from '../scripts/public-styles.mjs';

test('removed Studio selectors match no public page or search/auth state', async ({ page, request }) => {
  test.setTimeout(180000);
  const source = readFileSync('src/styles/global.css', 'utf8');
  const kept = new Set<string>();
  postcss.parse(publicStyles(source)).walkRules(rule => { kept.add(rule.selector); });
  const removed: string[] = [];
  postcss.parse(source).walkRules(rule => { if (!kept.has(rule.selector)) removed.push(rule.selector); });
  expect(removed.length).toBeGreaterThan(100);
  const urls = [...(await (await request.get('/sitemap.xml')).text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  urls.push('https://palmarghe.com/fm/lamine-yamal-fm26/', 'https://palmarghe.com/account/', 'https://palmarghe.com/en/account/');
  const check = async () => {
    const matches = await page.evaluate(selectors => selectors.filter(selector => document.querySelector(selector)), removed);
    expect(matches, page.url()).toEqual([]);
  };
  for (const url of urls) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await check();
    await page.evaluate(() => { document.body.dataset.theme = 'light'; });
    await check();
  }
  await page.goto('/');
  await page.locator('.head-actions [data-search-trigger]').click();
  await page.getByRole('searchbox').fill('yamal');
  await expect(page.getByText('1 sonuç', { exact: true })).toBeVisible();
  await check();
});
