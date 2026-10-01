import { test } from '@playwright/test';
import { verifySearchPointers } from './helpers/search-pointer';

test('search retains native pointers and caret for mouse and keyboard opening', async ({ page }) => {
  await verifySearchPointers(page);
});
