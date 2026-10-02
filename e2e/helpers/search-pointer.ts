import { expect, type Page } from '@playwright/test';

export async function verifySearchPointers(page: Page) {
  await page.goto('/');
  const cursor = page.locator('[data-brand-cursor]');
  const dialog = page.locator('#search-overlay');
  for (const theme of ['dark', 'light']) {
    await page.evaluate(value => document.body.dataset.theme = value, theme);
    for (const method of ['click', 'keyboard']) {
      if (method === 'click') await page.locator('.head-actions [data-search-trigger]').click();
      else await page.keyboard.press('Control+k');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('[data-brand-cursor]')).toHaveCount(1);
      const input = dialog.locator('input[name="q"]');
      await expect(input).toBeFocused();
      await expect(input).toHaveCSS('cursor', 'text');
      await expect(input).toHaveCSS('caret-color', 'rgb(139, 92, 246)');
      await input.fill('a');
      const close = dialog.locator('[data-search-close]');
      await close.hover();
      await expect(close).toHaveCSS('cursor', 'pointer');
      await expect(cursor).toBeHidden();
      await input.hover();
      await expect(cursor).toHaveCSS('opacity', '0');
      await expect(input).toHaveCSS('cursor', 'text');
      await expect(dialog).toHaveCSS('cursor', 'auto');
      await input.fill('');
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await page.locator('.head-actions [data-search-trigger]').hover();
      await expect(cursor).toBeVisible();
      await expect(cursor).toHaveCSS('opacity', '1');
    }
  }
}



