import { test } from '@playwright/test';
import { verifySearchPointers } from './helpers/search-pointer';

test('search keeps native controls and native text caret for mouse and keyboard opening', async ({ page }) => {
  await verifySearchPointers(page);
});

