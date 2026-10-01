import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('live compact mobile menu and secret portal', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('https://palmarghe.com/');
  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  const menu = page.getByRole('navigation', { name: 'Mobil menü' });
  await expect(menu).toBeVisible();
  expect((await menu.boundingBox())?.height).toBeLessThan(350);
  const menuLinks = menu.getByRole('link');
  await expect(menuLinks.first()).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('position', 'fixed');
  await page.keyboard.press('Shift+Tab');
  await expect(menu.getByRole('button', { name: 'Açık mod' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(menuLinks.first()).toBeFocused();
  await page.screenshot({ path: 'test-results/mobile-menu-production.png' });
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menüyü aç' })).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('position', 'fixed');
  for (const theme of ['dark', 'light']) {
    await page.evaluate(value => document.body.dataset.theme = value, theme);
    for (let i = 0; i < 5; i++) await page.locator('.site-header .brand').tap();
    await expect(page.locator('.mobile-secret')).toBeVisible();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    const close = page.getByRole('button', { name: 'Dünyaya dön' });
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    const scroll = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.locator('.mobile-secret')).toBeHidden();
    await expect(page.locator('.site-header .brand')).toBeFocused();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    for (let i = 0; i < 5; i++) await page.locator('.site-header .brand').tap();
    await page.mouse.click(1, 1);
    await expect(page.locator('.mobile-secret')).toBeHidden();
  }
  await context.close();
});

test('desktop logo does not activate mobile secret', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 5; i++) await page.locator('.site-header .brand').click();
  await expect(page.locator('.mobile-secret')).toHaveCount(0);
});

test('narrow mobile buttons remain on screen and brand navigates home', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  for (const route of ['/', '/account/', '/contact/', '/search/', '/archive/']) {
    await page.goto(`https://palmarghe.com${route}`);
    const outside = await page.locator('button,.button').evaluateAll(elements => elements.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.left < -1 || r.right > innerWidth + 1);
    }).map(el => el.textContent));
    expect(outside, route).toEqual([]);
  }
  await page.goto('https://palmarghe.com/account/');
  await page.locator('.site-header .brand').tap();
  await expect(page).toHaveURL('https://palmarghe.com/');
  await context.close();
});

test('mobile navigation remains available with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('https://palmarghe.com/');
  const menu = page.getByRole('navigation', { name: 'Mobil menü' });
  await expect(menu).toBeVisible();
  await expect(menu.locator('a[href="/search/"]')).toBeVisible();
  await expect(menu.locator('a[href="/archive/"]')).toBeVisible();
  await expect(menu).not.toHaveAttribute('inert', '');
  await menu.locator('a[href="/archive/"]').click();
  await expect(page).toHaveURL('https://palmarghe.com/archive/');
  await expect(page.getByRole('heading', { name: 'Arşiv' })).toBeVisible();
  await context.close();
});
