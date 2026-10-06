import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('deployed gallery script supports modal dismissal, focus and scroll lock with a controlled fixture', async ({ page }) => {
  await page.goto('/');
  // The published site currently has no gallery item. Exercise the deployed asset
  // and real theme CSS without creating or altering production content.
  await page.evaluate(() => {
    const fixture = document.createElement('section');
    fixture.innerHTML = '<a href="/visuals/og-default.webp" data-gallery-lightbox data-alt="Controlled gallery preview">Preview image</a><dialog class="gallery-lightbox" data-gallery-dialog aria-label="Image preview"><button type="button" data-gallery-close aria-label="Close preview">×</button><img data-gallery-image alt=""><p data-gallery-caption></p></dialog>';
    document.querySelector('main')!.prepend(fixture);
  });
  await page.addScriptTag({ url: '/scripts/gallery-lightbox.js' });
  const trigger = page.locator('[data-gallery-lightbox]');
  const dialog = page.locator('[data-gallery-dialog]');
  const close = dialog.getByRole('button', { name: 'Close preview' });
  for (const width of [390, 1440]) for (const theme of ['dark', 'light']) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(value => document.body.dataset.theme = value, theme);
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    await expect(close).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button',{name:'Yakınlaştır',exact:true})).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    const scroll = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    await dialog.locator('img').click();
    await expect(dialog).toBeVisible();
    const result = await new AxeBuilder({ page }).include('[data-gallery-dialog]').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
    await page.screenshot({ path: `test-results/gallery-fixture-${width}-${theme}.png` });
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    await trigger.click();
    await page.mouse.click(1, 1);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});
