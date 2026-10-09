import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { contentUnavailableResponse } from '../src/lib/content-unavailable';

test('actual local server failure returns secure 503 and retry restores the requested archive', async ({ page, request }) => {
  await page.setExtraHTTPHeaders({ 'x-pg-test-content-read': 'fail' });
  const failed = await page.goto('/archive/?type=project');
  expect(failed?.status()).toBe(503);
  expect(failed?.headers()['cache-control']).toBe('private, no-store');
  expect(failed?.headers()['x-content-type-options']).toBe('nosniff');
  expect(failed?.headers()['content-security-policy']).toContain("default-src 'self'");
  await expect(page.getByRole('heading', { name: 'Kısa bir ara' })).toBeVisible();
  await page.setExtraHTTPHeaders({});
  await page.getByRole('link', { name: 'Yeniden dene', exact: true }).click();
  await expect(page).toHaveURL(/\/archive\/\?type=project$/);
  await expect(page.getByRole('heading', { name: 'Kısa bir ara' })).toHaveCount(0);
  const feed = await request.get('/sitemap.xml', { headers: { 'x-pg-test-content-read': 'fail' } });
  expect(feed.status()).toBe(503);
  expect(feed.headers()['content-type']).toContain('text/plain');
  expect(await feed.text()).not.toContain('<html');
});

test('server recovery renderer retains retry URL and fits all themes/phone widths without scripted refresh', async ({ page }) => {
  for (const locale of ['tr', 'en']) {
    const path = locale === 'en' ? '/en/archive/?type=project' : '/archive/?type=project';
    const rendered = contentUnavailableResponse(new Request('https://palmarghe.com' + path));
    const html = await rendered.text();
    await page.route('**' + path, route => route.fulfill({ status: 503, contentType: 'text/html', body: html }));
    for (const width of [320, 390, 921]) for (const theme of ['dark', 'light', 'aurora']) {
      await page.setViewportSize({ width, height: 700 });
      await page.addInitScript(value => localStorage.setItem('palmarghe-theme', value), theme);
      const response = await page.goto(path);
      expect(response?.status()).toBe(503);
      await expect(page.locator('body')).toHaveAttribute('data-theme', theme);
      await expect(page.getByRole('link', { name: locale === 'en' ? 'Try again' : 'Yeniden dene', exact: true })).toHaveAttribute('href', path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations.filter(violation => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
    }
    await page.unroute('**' + path);
  }
});
