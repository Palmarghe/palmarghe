import { test, expect } from '@playwright/test';

test('public routes, metadata and assets', async ({ page, request }) => {
  for (const route of ['/', '/en/', '/ai/', '/gaming/', '/fm/', '/lab/', '/archive/', '/search/', '/about/', '/contact/', '/account/', '/privacy/']) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`^https://palmarghe\\.com/`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
  }
  for (const asset of ['/visuals/hero-glass.webp', '/sitemap.xml', '/robots.txt', '/rss.xml']) {
    const response = await request.get(asset);
    expect(response.status(), asset).toBe(200);
  }
  const missing = await page.goto('/this-route-does-not-exist/');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Ana sayfa' })).toBeVisible();
});

test('production privacy and security response headers', async ({ request }) => {
  const home = await request.get('/');
  expect(home.headers()['content-security-policy']).toContain('default-src');
  expect(home.headers()['x-content-type-options']).toBe('nosniff');
  const account = await request.get('/account/');
  expect(account.headers()['cache-control']).toContain('no-store');
  expect(await account.text()).toContain('noindex');
  const studio = await request.get('https://studio.palmarghe.com/studio/');
  expect(studio.status()).toBe(200);
  expect(studio.headers()['cache-control']).toContain('no-store');
  expect(await studio.text()).toContain('noindex');
  const preview = await request.get('https://palmarghe.palmarghe.workers.dev/');
  expect(preview.status()).toBe(200);
  expect(preview.headers()['x-robots-tag']).toContain('noindex');
});

test('live mobile navigation and six viewport widths', async ({ page }) => {
  for (const width of [360,390,768,1024,1440,1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `home ${width}`).toBe(true);
    await page.goto('/ai/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `category ${width}`).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobil menü' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Mobil menü' })).toBeHidden();
});

test('critical live routes emit no browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  for (const route of ['/', '/ai/', '/about/', '/contact/', '/account/']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(350);
  }
  expect(errors).toEqual([]);
});
