import { test, expect } from '@playwright/test';

test('editorial imagery loads and mobile menu remains keyboard accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.hero-art')).toBeVisible();
  await expect(page.locator('.category img')).toHaveCount(4);
  const menu = page.getByRole('button', { name: 'Menüyü aç' });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole('button', { name: 'Menüyü kapat' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Mobil menü' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menüyü aç' })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('navigation', { name: 'Mobil menü' })).toBeHidden();
});
