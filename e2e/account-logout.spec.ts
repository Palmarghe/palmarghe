import { test, expect } from '@playwright/test';
import { verifyLogoutWarning } from './helpers/account-logout';

test('ordinary account sign-out returns to the usable account login', async ({ page, context }) => {
  await context.addCookies([{ name: 'pg_mock_user', value: '00000000-0000-4000-8000-100000000003', url: 'http://127.0.0.1:4322' }]);
  await page.goto('/account/#settings');
  await page.getByRole('tab', { name: 'Hesap', exact: true }).click();
  const response = page.waitForResponse(r => r.url().endsWith('/api/auth/') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Çıkış yap', exact: true }).click();
  expect((await response).status()).toBe(303);
  await expect(page.locator('form:has(input[value="login"])')).toBeVisible();
  expect((await context.cookies()).some(cookie => cookie.name === 'pg_mock_user')).toBe(false);
  await expect(page.locator('.account-tabs')).toHaveCount(0);
});

test('unconfirmed server logout warns accessibly instead of claiming success or asking to check email', async ({ page }) => {
  await verifyLogoutWarning(page);
});
