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

test('homepage serves optimized WebP music covers', async ({ page, request }) => {
  await page.goto('/');
  const musicCovers = page.locator('img[src*="/visuals/music/"]');
  await expect(musicCovers.first()).toBeAttached();
  const sources = await musicCovers.evaluateAll((images) => [...new Set(images.map((image) => (image as HTMLImageElement).getAttribute('src') ?? ''))]);
  expect(sources.length).toBeGreaterThan(0);
  expect(sources.every((source) => source.endsWith('.webp'))).toBe(true);
  const srcsets = await musicCovers.evaluateAll((images) => images.map((image) => (image as HTMLImageElement).srcset));
  expect(srcsets.every((srcset) => /480w/.test(srcset) && /960w/.test(srcset) && /1440w/.test(srcset))).toBe(true);
  for (const source of sources) {
    const response = await request.get(source);
    expect(response.status(), source).toBe(200);
    expect(response.headers()['content-type']).toContain('image/webp');
    expect(Number(response.headers()['content-length'])).toBeLessThan(300_000);
  }
  for (const stem of ['anatolian-sub-ritual', 'anatolian-velocity', 'kara-yol', 'sevenfold-thunder']) {
    for (const width of [480, 960]) {
      const source = `/visuals/music/${stem}-${width}.webp`;
      const response = await request.get(source);
      expect(response.status(), source).toBe(200);
      expect(response.headers()['content-type']).toContain('image/webp');
      expect(Number(response.headers()['content-length'])).toBeLessThan(120_000);
    }
  }
});

test('homepage identifies the Palmarghe publisher and website in structured data', async ({ page }) => {
  for (const route of ['/', '/en/']) {
    await page.goto(route);
    const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? '{}')));
    const graph = schemas.flatMap((schema) => Array.isArray(schema['@graph']) ? schema['@graph'] : [schema]);
    expect(graph.find((schema) => schema['@type'] === 'Organization')).toMatchObject({ '@id': 'https://palmarghe.com/#organization', name: 'Palmarghe' });
    expect(graph.find((schema) => schema['@type'] === 'WebSite')).toMatchObject({ '@id': 'https://palmarghe.com/#website', inLanguage: ['tr', 'en'] });
  }
  await page.goto('/fm/lamine-yamal-fm26/');
  const article = await page.locator('script[type="application/ld+json"]').evaluate((script) => JSON.parse(script.textContent ?? '{}'));
  expect(article).toMatchObject({ '@type': 'Article', headline: 'FM26: Lamine Yamal için sağ kanat oyun planı', url: 'https://palmarghe.com/fm/lamine-yamal-fm26/' });
});

test('video embeds connect only after an explicit accessible action', async ({ page }) => {
  await page.goto('/music/sevenfold-thunder/');
  const trigger = page.getByRole('button', { name: 'Videoyu yükle: Sevenfold Thunder — Palmarghe' });
  await expect(trigger).toBeVisible();
  await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(0);
  await trigger.click();
  await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveAttribute('title', 'Sevenfold Thunder — Palmarghe');
});

test('production privacy and security response headers', async ({ request }) => {
  const home = await request.get('/');
  expect(home.headers()['content-security-policy']).toContain('default-src');
  expect(home.headers()['content-security-policy'].split(';').find(directive => directive.trim().startsWith('frame-src '))).toContain('https://player.vimeo.com');
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

test('trusted Vimeo embeds are permitted by the live CSP using a controlled player response', async ({ page }) => {
  const playerUrl = 'https://player.vimeo.com/video/123456789';
  await page.route(playerUrl, route => route.fulfill({ contentType: 'text/html', body: '<h1>Controlled Vimeo player response</h1>' }));
  await page.goto('/music/sevenfold-thunder/');
  await page.locator('[data-content-embed]').evaluate((element, source) => { (element as HTMLElement).dataset.embedSrc = source; }, playerUrl);
  await page.getByRole('button', { name: /Videoyu yükle:/ }).click();
  await expect(page.frameLocator('.content-embed iframe').getByRole('heading', { name: 'Controlled Vimeo player response' })).toBeVisible();
});

test('live layouts fit all target widths and key form routes', async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [320,360,375,390,430,768,1024,1280,1440,1920]) {
    await page.setViewportSize({ width, height: 900 });
    const routes = ['/', '/ai/'];
    if ([320,390,768,1440].includes(width)) routes.push('/archive/', '/search/', '/contact/', '/account/');
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
    }
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
    const source = message.location().url;
    // Cloudflare Turnstile emits this diagnostic from its own challenge frame.
    const turnstileDiagnostic = source.startsWith('https://challenges.cloudflare.com/cdn-cgi/challenge-platform/') && message.text() === '%c%d font-size:0;color:transparent NaN';
    if (message.type() === 'error' && !turnstileDiagnostic) errors.push(`console: ${message.text()}`);
  });
  for (const route of ['/', '/ai/', '/about/', '/contact/', '/account/']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(350);
  }
  expect(errors).toEqual([]);
});

test('light theme toggle persists and remains usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  await page.getByRole('button', { name: 'Açık mod' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
