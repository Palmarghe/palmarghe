import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('live search is interactive, image-led and filterable on mobile', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  await page.getByRole('navigation', { name: 'Mobil menü' }).getByRole('link', { name: 'Ara' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/search-overlay-open/);
  const input = dialog.getByRole('searchbox');
  await expect(input).toBeFocused();
  await expect(input).toHaveCSS('cursor', 'text');
  await input.fill('Lamine Yamal');
  const result = dialog.getByRole('link', { name: /FM26: Lamine Yamal için sağ kanat oyun planı/ });
  await expect(result).toBeVisible({ timeout: 10000 });
  await expect(result.locator('img')).toHaveJSProperty('complete', true);
  await page.screenshot({ path: 'test-results/search-mobile-production.png' });
  await expect(dialog.getByRole('button', { name: 'FM Mod', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await dialog.getByRole('button', { name: 'FM Mod', exact: true }).click();
  await expect(result).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Tümü', exact: true }).click();
  await expect(dialog.getByRole('link', { name: /FM26: Lamine Yamal/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('html')).not.toHaveClass(/search-overlay-open/);
  await context.close();
});

test('desktop command key, arrow navigation and full search page work', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/search-overlay-open/);
  const input = dialog.getByRole('searchbox');
  await expect(input).toBeFocused();
  await expect(input).toHaveCSS('cursor', 'text');
  await expect(input).toHaveCSS('caret-color', 'rgb(139, 92, 246)');
  await input.fill('Lamine Yamal');
  const result = dialog.getByRole('link', { name: /FM26: Lamine Yamal için sağ kanat oyun planı/ });
  await expect(result).toBeVisible({ timeout: 10000 });
  await input.press('ArrowDown');
  await expect(result).toBeFocused();
  await dialog.getByRole('link', { name: 'Tüm sonuçları görüntüle →' }).click();
  await expect(page).toHaveURL(/\/search\/\?q=Lamine(?:\+|%20)Yamal/);
  await expect(page.getByRole('heading', { name: /FM26: Lamine Yamal için sağ kanat oyun planı/ })).toBeVisible();
  const liveResult = page.locator('.instant-search-result').first();
  await expect(liveResult).toBeVisible();
  await expect(liveResult.locator('img')).toBeVisible();
  await liveResult.click();
  await expect(page).toHaveURL(/\/fm\/lamine-yamal-fm26\/$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const articleImages = page.locator('.content-detail .content-media img');
  await expect(articleImages).toHaveCount(2);
  for (const image of await articleImages.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  }
});

test('search locks the page, traps focus and restores it after backdrop dismissal in both themes and layouts', async ({ page }) => {
  test.setTimeout(60000);
  for (const width of [390, 1440]) {
    for (const theme of ['dark', 'light']) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.evaluate(value => { document.body.dataset.theme = value; }, theme);
      if (width < 900) await page.getByRole('button', { name: 'Menüyü aç' }).click();
      const trigger = width < 900
        ? page.getByRole('navigation', { name: 'Mobil menü' }).getByRole('link', { name: 'Ara', exact: true })
        : page.locator('.head-actions [data-search-trigger]');
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('searchbox')).toBeFocused();
      const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(accessibility.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? '')), JSON.stringify(accessibility.violations)).toEqual([]);
      await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
      await page.keyboard.press('Shift+Tab');
      await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
      const initialScroll = await page.evaluate(() => scrollY);
      await page.mouse.move(5, 5);
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(200);
      expect(await page.evaluate(() => scrollY)).toBe(initialScroll);
      await page.mouse.click(5, 5);
      await expect(dialog).toBeHidden();
      await expect(width < 900 ? page.getByRole('button', { name: 'Menüyü aç' }) : trigger).toBeFocused();
      await expect(page.locator('html')).not.toHaveClass(/search-overlay-open/);
    }
  }
});

test('search communicates slow, failed, empty and recovered network states', async ({ page }) => {
  let delayed = false;
  await page.route('**/api/search/**', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('q');
    if (!delayed && query === 'Lamine Yamal') {
      delayed = true;
      await new Promise((resolve) => setTimeout(resolve, 900));
    }
    await route.continue();
  });
  await page.goto('/');
  await page.locator('[data-search-trigger]').first().click();
  const dialog = page.getByRole('dialog');
  const input = dialog.getByRole('searchbox');
  const status = dialog.locator('[data-search-status]');

  await input.fill('Lamine Yamal');
  await expect(status).toContainText('Aranıyor');
  await expect(dialog.getByRole('link', { name: /FM26: Lamine Yamal/ })).toBeVisible({ timeout: 12000 });
  await page.unroute('**/api/search/**');

  await input.fill('zzqxv-nomatch-2026');
  await expect(status).toContainText('Sonuç yok.', { timeout: 12000 });
  await expect(dialog.getByRole('link', { name: 'Arşivi keşfet →' })).toBeVisible();

  await page.context().setOffline(true);
  await input.fill('Yamal offline recovery');
  await expect(status).toContainText('Aramaya ulaşılamadı. Yeniden dene.', { timeout: 12000 });
  await page.context().setOffline(false);

  await input.fill('Lamine Yamal');
  await expect(dialog.getByRole('link', { name: /FM26: Lamine Yamal/ })).toBeVisible({ timeout: 12000 });
});
