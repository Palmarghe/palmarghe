import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('notice acknowledgements are accessible, unchecked and distinct from newsletter consent', async ({ page }) => {
  test.setTimeout(90000);
  for (const locale of ['tr', 'en']) {
    const prefix = locale === 'en' ? '/en' : '';
    for (const width of [390, 1440]) {
      for (const theme of ['dark', 'light']) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${prefix}/account/`);
        await page.evaluate(value => { document.body.dataset.theme = value; }, theme);
        await page.getByText(locale === 'tr' ? 'Hesap oluştur' : 'Create an account', { exact: true }).click();
        const signup = page.locator('form').filter({ has: page.locator('input[value="signup"]') });
        for (const name of ['privacy_acknowledgement', 'kvkk_acknowledgement']) {
          await expect(signup.locator(`input[name="${name}"]`)).toHaveAttribute('required', '');
          await expect(signup.locator(`input[name="${name}"]`)).not.toBeChecked();
        }
        await expect(signup.getByRole('link').nth(0)).toHaveAttribute('href', `${prefix}/privacy/`);
        await expect(signup.getByRole('link').nth(1)).toHaveAttribute('href', `${prefix}/kvkk/`);
        await expect(signup).not.toContainText(locale === 'tr' ? 'işlenmesini kabul ediyorum' : 'consent to the described processing');
        await expect(page.locator('form[action="/api/newsletter/"] input[type="checkbox"]')).not.toBeChecked();
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(result.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? '')), JSON.stringify({ locale, width, theme, violations: result.violations })).toEqual([]);
        if (locale === 'tr' && width === 390 && theme === 'light') await page.screenshot({ path: 'test-results/signup-notices-mobile-light.png', fullPage: true });
      }
    }
    await page.goto(`${prefix}/contact/`);
    await expect(page.locator('.contact-content input[name="privacy_acknowledgement"]')).not.toBeChecked();
    await expect(page.locator('.contact-content a[href$="/privacy/"]')).toHaveAttribute('href', `${prefix}/privacy/`);
  }
});

test('production signup rejects missing notice acknowledgement before invoking Auth', async ({ request }) => {
  const missing: Record<string, string>[] = [{}, { privacy_acknowledgement: 'on' }, { kvkk_acknowledgement: 'on' }, { privacy_consent: 'on', kvkk_consent: 'on' }];
  for (const locale of ['tr', 'en']) {
    for (const notices of missing) {
      const response = await request.post('/api/auth/', {
        headers: { Origin: 'https://palmarghe.com' }, maxRedirects: 0,
        form: { action: 'signup', locale, email: 'notice-qa@example.invalid', password: 'LocalTest123!', ...notices },
      });
      expect(response.status()).toBe(400);
      expect(await response.text()).toContain(locale === 'tr' ? 'iki kutuyu da onaylayın' : 'acknowledge both');
    }
  }
});
