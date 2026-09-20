import { test, expect } from '@playwright/test';

test('editorial imagery loads and mobile menu remains keyboard accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.hero-art')).toBeVisible();
  await expect(page.locator('.category img')).toHaveCount(4);
  const menu = page.getByRole('button', { name: 'Menüyü aç' });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole('button', { name: 'Menüyü kapat' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Mobil menü' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menüyü aç' })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('navigation', { name: 'Mobil menü' })).toBeHidden();
});

test('empty publication presents areas without placeholder work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Keşfet' })).toBeVisible();
  await expect(page.locator('.home-sections .empty')).toHaveCount(0);
  await page.goto('/ai/');
  await expect(page.getByText('Bu alanda henüz yayımlanmış bir çalışma yok.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Tüm alanları keşfet/ })).toHaveAttribute('href','/archive/');
  await page.goto('/about/');
  await expect(page.getByRole('heading', { name: 'Üretim, oyun ve deney için bir alan.' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Çalışmaları keşfet/ })).toHaveAttribute('href','/archive/');
});

test('social metadata and account disclosure are localized', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://palmarghe.com/visuals/og-default.webp');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content','summary_large_image');
  await expect(page.getByText('PALMARGHE — BAĞIMSIZ DİJİTAL YAYIN')).toBeVisible();
  await page.goto('/account/');
  await expect(page.getByRole('heading', { name: 'Giriş' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kayıt ol' })).toBeHidden();
  await page.getByText('Hesap oluştur', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Kayıt ol' })).toBeVisible();
  const password = page.locator('form').filter({ has: page.locator('input[value="login"]') }).locator('input[name="password"]');
  await expect(password).toHaveAttribute('type','password');
  await page.getByRole('button', { name: 'Şifreyi göster' }).first().click();
  await expect(password).toHaveAttribute('type','text');
});

test('six public widths and Studio dashboard have no horizontal overflow', async ({ page }) => {
  for (const width of [360,390,768,1024,1440,1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `home at ${width}px`).toBe(true);
    await page.goto('/ai/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `category at ${width}px`).toBe(true);
  }
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.getByRole('heading', { name: 'Genel bakış' })).toBeVisible();
  await expect(page.getByRole('link', { name: /İçerik oluştur/ })).toBeVisible();
  for (const width of [360,390,768,1024,1440,1920]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: window.innerWidth, elements: [...document.querySelectorAll('*')].filter((element) => element.getBoundingClientRect().right > window.innerWidth + 1).slice(0,6).map((element) => `${element.tagName}.${element.className}`) }));
    expect(overflow.page <= overflow.viewport, `Studio at ${width}px: ${JSON.stringify(overflow)}`).toBe(true);
  }
});
