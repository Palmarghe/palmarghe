import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function verifyLogoutWarning(page: Page) {
  for (const locale of ['tr', 'en']) {
    await page.goto(`${locale === 'en' ? '/en' : ''}/account/?notice=logout_unconfirmed&verify=e2e`);
    const warning = page.locator('.account-content .alert[role="alert"]');
    await expect(warning).toContainText(locale === 'tr' ? 'oturum iptali doğrulanamadı' : 'revocation could not be confirmed');
    await expect(warning).not.toContainText(locale === 'tr' ? 'E-postanızı kontrol' : 'Check your email');
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['dark', 'light', 'aurora']) {
        await page.evaluate(value => { document.body.dataset.theme = value; }, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        await expect(page.locator('form:has(input[value="login"])')).toBeVisible();
        const axe = await new AxeBuilder({ page }).analyze();
        expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
      }
    }
  }
}
