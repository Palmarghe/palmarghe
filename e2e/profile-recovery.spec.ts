import { test, expect } from '@playwright/test';
import { verifyProfileRecovery } from './helpers/profile-recovery';

test.use({ serviceWorkers: 'block' });

test('profile errors retain edits, require successful loading and prevent duplicate saves', async ({ page }) => {
  await page.goto('/account/');
  const login = page.locator('form:has(input[value="login"])');
  await login.locator('input[name="email"]').fill('member@example.test');
  await login.locator('input[name="password"]').fill('LocalTest123!');
  await login.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.locator('.profile-card')).toBeVisible();
  await verifyProfileRecovery(page);
});
