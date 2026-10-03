import { test } from '@playwright/test';
import { verifySearchPointers } from './helpers/search-pointer';

test('search keeps custom control pointer and native text caret for mouse and keyboard opening', async ({ page }) => {
  await verifySearchPointers(page);
});

