import { test } from '@playwright/test';
import { verifyLogoutWarning } from '../e2e/helpers/account-logout';

test('live logout uncertainty page is localized, usable and accessible without changing real sessions', async ({ page }) => {
  // Read-only rendering proof. Real SDK/transport tests cover revocation scope and failures.
  await verifyLogoutWarning(page);
});
