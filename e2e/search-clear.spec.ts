import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('search clear preserves type and focus across languages, themes and sizes', async ({ page }) => {
  test.setTimeout(90000);
  for (const locale of ['tr', 'en']) for (const width of [320, 1440]) for (const theme of ['dark', 'light']) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto((locale === 'en' ? '/en' : '') + '/search/?q=abcd&type=article');
    await page.evaluate(value => { document.body.dataset.theme = value; }, theme);
    const root = page.locator('main [data-live-search]');
    const input = root.locator('input[name="q"]');
    const clearName = locale === 'en' ? 'Clear search' : 'Aramayı temizle';
    const clear = root.getByRole('button', { name: clearName });
    await clear.focus(); await page.keyboard.press('Enter');
    await expect(input).toHaveValue(''); await expect(input).toBeFocused();
    await expect(clear).toBeHidden();
    await expect(root.locator('select[name=type]')).toHaveValue('article');
    await expect(page).not.toHaveURL(/q=abcd/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (width === 320) {
      await page.locator('.menu-toggle').click();
      await page.locator('#mobile-nav [data-search-trigger]').click();
    } else await page.locator('.head-actions [data-search-trigger]').click();
    const modal = page.getByRole('dialog');
    const modalInput = modal.getByRole('searchbox');
    const modalClear = modal.getByRole('button', { name: clearName });
    await modalInput.fill('abcd'); await expect(modalClear).toBeVisible();
    await modalClear.click(); await expect(modalInput).toHaveValue(''); await expect(modalInput).toBeFocused();
    await expect(modalClear).toBeHidden();
    const findings = await new AxeBuilder({ page }).include('#search-overlay').analyze();
    expect(findings.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
    expect(await modal.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
  }
});

test('search remains a working GET form without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/en/search/');
  const form = page.locator('main .search-form');
  await form.locator('input[name="q"]').fill('abcd');
  await form.locator('select[name=type]').selectOption('article');
  await form.getByRole('button').click();
  await expect(page).toHaveURL(/q=abcd/);
  await expect(form.locator('input[name="q"]')).toHaveValue('abcd');
  await expect(form.locator('select[name=type]')).toHaveValue('article');
  await expect(page.getByRole('button', { name: 'Clear search' })).toHaveCount(0);
  await context.close();
});
