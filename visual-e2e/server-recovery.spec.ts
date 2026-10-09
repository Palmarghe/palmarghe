import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) for (const theme of ['dark', 'light', 'aurora']) {
  test(`server recovery ${width} ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.setExtraHTTPHeaders({ 'x-pg-test-content-read': 'fail' });
    await page.addInitScript(value => localStorage.setItem('palmarghe-theme', value), theme);
    expect((await page.goto('/archive/?type=project'))?.status()).toBe(503);
    await expect(page.locator('body')).toHaveAttribute('data-theme', theme);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`server-recovery-${width}-${theme}.png`, { fullPage: true });
  });
}
