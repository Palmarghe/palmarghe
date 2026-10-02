import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { verifyProfileRecovery } from '../e2e/helpers/profile-recovery';

test.use({ serviceWorkers: 'block' });
for (const locale of ['tr', 'en']) for (const theme of ['dark', 'light']) {
  test('deployed profile recovery fixture: ' + locale + '/' + theme, async ({ page }) => {
    await page.setViewportSize({ width: locale === 'en' ? 390 : 1440, height: 900 });
    await page.addInitScript(value => localStorage.setItem('palmarghe-theme', value), theme);
    // Anonymous deployed HTML/script with a controlled login marker. Profile
    // requests are intercepted; no Auth or production profile write occurs.
    await page.route('**/account/?verify=profile', async route => {
      const response = await route.fetch();
      const html = await response.text();
      await route.fulfill({ response, body: html.replace('<section class="page-content account-content">', '<section class="page-content account-content"><input type="hidden" value="logout">') });
    });
    await verifyProfileRecovery(page, locale);
    await expect(page.locator('body')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).include('.profile-card').analyze();
    expect(axe.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  });
}
