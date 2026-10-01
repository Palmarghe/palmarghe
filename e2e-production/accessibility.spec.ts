import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wcag22Tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

for (const path of ['/', '/en/', '/contact/', '/account/', '/archive/']) {
  test(`live ${path} has no serious WCAG violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test('live Studio sign-in has no serious WCAG violations', async ({ page }) => {
  await page.goto('https://studio.palmarghe.com/studio/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([]);
});

for (const path of ['/', '/en/', '/contact/', '/account/', '/archive/']) {
  test(`live light theme ${path} has no serious WCAG 2.2 violations`, async ({ page }) => {
    await page.goto(path);
    await page.locator('[data-theme-toggle]').first().click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
    await page.waitForTimeout(250);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test('live mobile light theme navigation has no serious WCAG 2.2 violations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  await page.getByRole('button', { name: 'Açık mod' }).click();
  await page.waitForTimeout(250);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('every indexable sitemap page passes serious WCAG 2.2 scans in dark and light themes', async ({ page, request }) => {
  test.setTimeout(300000);
  const sitemap = await request.get('https://palmarghe.com/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  const routes = [...xml.matchAll(/<loc>(https:\/\/palmarghe\.com[^<]*)<\/loc>/g)]
    .map(([, url]) => new URL(url).pathname)
    .filter((route, index, all) => all.indexOf(route) === index);
  expect(routes.length).toBeGreaterThan(10);

  const failures: string[] = [];
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const dark = await new AxeBuilder({ page }).withTags(wcag22Tags).analyze();
    failures.push(...dark.violations
      .filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))
      .map((item) => `dark ${route}: ${item.id} (${item.nodes.map((node) => node.target.join(' ')).join(', ')})`));

    await page.locator('[data-theme-toggle]').first().click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
    await page.waitForTimeout(250);
    const light = await new AxeBuilder({ page }).withTags(wcag22Tags).analyze();
    failures.push(...light.violations
      .filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))
      .map((item) => `light ${route}: ${item.id} (${item.nodes.map((node) => node.target.join(' ')).join(', ')})`));
    await page.locator('[data-theme-toggle]').first().click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
    await page.waitForTimeout(250);
  }
  expect(failures, failures.join('\n')).toEqual([]);
});
