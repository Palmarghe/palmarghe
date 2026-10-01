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
  await page.screenshot({ path: 'test-results/mobile-menu-production.png' });
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Menüyü kapat' }).click();
  for (let i = 0; i < 5; i++) await page.locator('.site-header .brand').tap();
  await expect(page.locator('.mobile-secret')).toBeVisible();
  await page.getByRole('button', { name: 'Dünyaya dön' }).click();
  await expect(page.locator('.mobile-secret')).toBeHidden();
  await context.close();
});

test('desktop logo does not activate mobile secret', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 5; i++) await page.locator('.site-header .brand').click();
  await expect(page.locator('.mobile-secret')).toHaveCount(0);
});
