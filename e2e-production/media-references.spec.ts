import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('published body media loads through the real anonymous RLS and Storage path', async ({ page, request }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/fm/lamine-yamal-fm26/');
    for (const theme of ['dark','light']) {
      await page.evaluate(value => { document.body.dataset.theme=value; },theme);
      const images=page.locator('.content-media img[src^="/api/media/"]');
      await expect(images).toHaveCount(2);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(()=>image.evaluate((node: HTMLImageElement)=>node.complete && node.naturalWidth>0)).toBe(true);
        const src=await image.getAttribute('src');
        if (!src) throw new Error('Body media URL missing');
        const response=await request.get(src);
        expect(response.ok()).toBe(true);
        expect(response.headers()['content-type']).toMatch(/^image\/(png|jpeg|webp)/);
        expect(response.headers()['x-content-type-options']).toBe('nosniff');
        expect((await response.body()).length).toBeGreaterThan(12);
        const bounds=await image.boundingBox();
        expect(bounds?.width).toBeGreaterThan(0);
        expect(bounds?.x).toBeGreaterThanOrEqual(0);
        expect((bounds?.x ?? width)+(bounds?.width ?? width)).toBeLessThanOrEqual(width);
      }
      const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
      expect(accessibility.violations.filter(v=>['serious','critical'].includes(v.impact ?? ''))).toEqual([]);
    }
  }
  expect((await request.get('/api/media/00000000-0000-4000-8000-000000000000/')).status()).toBe(404);
});

