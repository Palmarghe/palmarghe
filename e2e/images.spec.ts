import { test, expect } from '@playwright/test';

test('local category cards serve responsive artwork at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const images = page.locator('.categories img[src^="/visuals/editorial-"]');
  await expect(images).toHaveCount(4);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.currentSrc)).toMatch(/editorial-(ai|gaming|fm|lab)-(480|768|960)\.webp$/);
  }
});
