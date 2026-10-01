import { test, expect } from '@playwright/test';

test('Palmarghe pointer has semantic states across reading, links, controls and search', async ({ page }) => {
  await page.goto('/fm/lamine-yamal-fm26/');
  const cursor = page.locator('[data-brand-cursor]');
  await expect(cursor).toHaveCount(1);

  const articleLink = page.locator('.content-detail a[href^="/"]').first();
  await articleLink.scrollIntoViewIfNeeded();
  await articleLink.hover();
  await expect(cursor).toHaveAttribute('data-state', 'link');

  const externalLink = page.locator('.content-detail a[href^="https://"]').first();
  await externalLink.scrollIntoViewIfNeeded();
  await externalLink.hover();
  await expect(cursor).toHaveAttribute('data-state', 'external');

  const paragraph = page.locator('.content-detail p').first();
  await paragraph.scrollIntoViewIfNeeded();
  await paragraph.hover();
  await expect(cursor).toHaveAttribute('data-state', 'text');
  await expect(paragraph).toHaveCSS('cursor', 'text');
  await expect(cursor).toHaveCSS('opacity', '0');

  const image = page.locator('.content-detail > img').first();
  await image.hover();
  await expect(cursor).toHaveAttribute('data-state', 'image');

  const save = page.locator('.content-detail [data-bookmark]');
  await save.hover();
  await expect(cursor).toHaveAttribute('data-state', 'button');
  await page.mouse.down();
  await expect(cursor).toHaveAttribute('data-pressed', '');
  await page.mouse.up();
  await expect(cursor).not.toHaveAttribute('data-pressed', '');

  const search = page.locator('.head-actions [data-search-trigger]');
  await search.scrollIntoViewIfNeeded();
  const box = await search.boundingBox();
  if (!box) throw new Error('Desktop search control is not visible');
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('#search-overlay')).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/search-overlay-open/);
  await expect.poll(() => cursor.evaluate(element => element.parentElement?.id)).toBe('search-overlay');
  await expect(cursor).toHaveCSS('opacity', '1');
  await expect(cursor).not.toHaveAttribute('data-away', '');
  const closeButton = page.locator('#search-overlay [data-search-close]');
  await closeButton.hover();
  await expect(cursor).toHaveAttribute('data-state', 'button');
  await expect(cursor).toHaveCSS('opacity', '1');
  const input = page.locator('#search-overlay input[name="q"]');
  await expect(input).toBeFocused();
  await input.hover();
  await expect(input).toHaveCSS('cursor', 'text');
  await expect(input).toHaveCSS('caret-color', 'rgb(139, 92, 246)');
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).not.toHaveClass(/search-overlay-open/);
  await expect.poll(() => cursor.evaluate(element => element.parentElement === document.body)).toBe(true);
});

test('cursor adapts to theme, device scale, reduced motion and touch input', async ({ browser }) => {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  const page = await desktop.newPage();
  await page.goto('/');
  const cursor = page.locator('[data-brand-cursor]');
  await expect(cursor).toHaveCount(1);
  expect(await page.evaluate(() => devicePixelRatio)).toBe(2);
  await page.mouse.move(720, 400);
  const darkInk = await cursor.evaluate(element => getComputedStyle(element).color);
  await page.locator('.head-actions [data-theme-toggle]').click();
  const lightInk = await cursor.evaluate(element => getComputedStyle(element).color);
  expect(lightInk).not.toBe(darkInk);
  await page.screenshot({ path: 'test-results/palmarghe-cursor-light-2x.png' });
  await page.setViewportSize({ width: 1152, height: 800 }); // 125% browser zoom at a 1440 CSS-pixel desktop width.
  await page.mouse.move(576, 400);
  await expect(cursor).toHaveAttribute('data-state', /^(default|image)$/);
  await page.screenshot({ path: 'test-results/palmarghe-cursor-125-zoom-equivalent.png' });
  await desktop.close();

  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto('/');
  await expect(reducedPage.locator('[data-brand-cursor]')).toHaveCount(0);
  await expect(reducedPage.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await reduced.close();

  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const touchPage = await touch.newPage();
  await touchPage.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = query => query === '(pointer: fine) and (hover: hover)'
      ? ({ matches: false } as MediaQueryList)
      : nativeMatchMedia(query);
  });
  await touchPage.goto('/');
  await expect(touchPage.locator('[data-brand-cursor]')).toHaveCount(0);
  await touch.close();
});

test('forms retain native text and checkbox pointers while rapid mouse moves stay in sync', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/contact/');
  const cursor = page.locator('[data-brand-cursor]');
  const name = page.locator('input[name="name"]');
  await name.hover();
  await expect(name).toHaveCSS('cursor', 'text');
  await expect(cursor).toHaveAttribute('data-state', 'native');
  await expect(cursor).toHaveCSS('opacity', '0');

  const message = page.locator('textarea[name="message"]');
  await message.hover();
  await expect(message).toHaveCSS('cursor', 'text');
  await expect(cursor).toHaveAttribute('data-state', 'native');

  const consent = page.locator('.contact-content input[name="consent"]');
  await consent.hover();
  await expect(consent).toHaveCSS('cursor', 'pointer');
  await expect(cursor).toHaveAttribute('data-state', 'native');

  await page.mouse.move(24, 28);
  await page.mouse.move(380, 260);
  await page.mouse.move(960, 680);
  await page.mouse.move(1280, 120);
  await expect.poll(() => cursor.evaluate(element => element.style.getPropertyValue('--cursor-x'))).toBe('1280px');
  await expect.poll(() => cursor.evaluate(element => element.style.getPropertyValue('--cursor-y'))).toBe('120px');
});
