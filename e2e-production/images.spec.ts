import { test, expect } from '@playwright/test';

test('category artwork uses working smaller renditions without changing layout or theme', async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?verify=images');
    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => { document.body.dataset.theme = value; }, theme);
      const images = page.locator('.categories img[src^="/visuals/editorial-"]');
      await expect(images).toHaveCount(4);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
        const dimensions = await image.evaluate((node: HTMLImageElement) => {
          const box = node.getBoundingClientRect();
          return { source: node.currentSrc, natural: node.naturalWidth, width: box.width, height: box.height, left: box.left, right: box.right };
        });
        expect(dimensions.source).toMatch(/editorial-(ai|gaming|fm|lab)-(480|768|960)\.webp$/);
        expect(dimensions.natural).toBeLessThan(1440);
        expect(dimensions.width).toBeGreaterThan(0);
        expect(dimensions.height).toBeGreaterThan(0);
        expect(dimensions.left).toBeGreaterThanOrEqual(0);
        expect(dimensions.right).toBeLessThanOrEqual(width);
      }
    }
  }
});
