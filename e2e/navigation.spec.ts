import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }, testInfo) => {
  const suffix = [...testInfo.title].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 240 + 1;
  await context.setExtraHTTPHeaders({ 'CF-Connecting-IP': `203.0.113.${suffix}` });
});

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
  const panel = await page.locator('#mobile-nav').boundingBox();
  expect(panel?.height).toBeLessThan(350);
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
  const signup = page.locator('form').filter({ has: page.locator('input[value="signup"]') });
  await expect(signup.locator('input[name="privacy_consent"]')).toHaveAttribute('required','');
  await expect(signup.locator('input[name="kvkk_consent"]')).toHaveAttribute('required','');
  await expect(signup.getByRole('link', { name: 'Gizlilik Politikasını' })).toHaveAttribute('href','/privacy/');
  await expect(signup.getByRole('link', { name: 'KVKK Aydınlatma Metnini' })).toHaveAttribute('href','/kvkk/');
  await expect(signup.locator('input[name="password"]')).toHaveAttribute('minlength','12');
  await expect(signup.locator('input[name="password"]')).toHaveAttribute('pattern', /\[0-9\]/);
  await page.goto('/kvkk/');
  await expect(page.getByRole('heading', { name: 'KVKK Aydınlatma Metni' })).toBeVisible();
  await page.goto('/account/');
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
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel('Studio bölümü').selectOption({ label: 'Reklam alanları' });
  await expect(page).toHaveURL(/section=advertising/);
  await expect(page.getByLabel('Studio bölümü')).toBeVisible();
  for (const width of [360,390,768,1024,1440,1920]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: window.innerWidth, elements: [...document.querySelectorAll('*')].filter((element) => element.getBoundingClientRect().right > window.innerWidth + 1).slice(0,6).map((element) => `${element.tagName}.${element.className}`) }));
    expect(overflow.page <= overflow.viewport, `Studio at ${width}px: ${JSON.stringify(overflow)}`).toBe(true);
  }
});

test('light theme applies to public search and Studio classic editor', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Açık modu aç' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Ara' }).click();
  await expect(page.locator('#search-overlay')).toHaveCSS('background-color', 'rgb(255, 253, 250)');

  await page.goto('/studio/?section=content');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.getByRole('heading', { name: 'Genel bakış' })).toBeVisible();
  await page.goto('/studio/?section=content');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.classic-menubar')).toHaveCSS('background-color', 'rgb(243, 237, 245)');
  await expect(page.locator('#block-editor')).toHaveCSS('background-color', 'rgb(255, 253, 250)');
  const editor = page.locator('#block-editor [contenteditable="true"]');
  await expect(editor).toBeVisible();
  await editor.fill('Klasik editör denetimi.');
  await expect.poll(() => page.locator('#body-json').evaluate((element) => (element as HTMLTextAreaElement).value)).toContain('Klasik editör denetimi.');
});
test('brand cursor is enabled for fine pointers and keeps text inputs usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-brand-cursor]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('has-brand-cursor'))).toBe(true);
  await page.goto('/account/');
  const email = page.locator('input[name="email"]').first();
  await expect(email).toHaveCSS('cursor', 'auto');
  await email.evaluate((element) => element.dispatchEvent(new PointerEvent('pointerover', { bubbles: true })));
  await expect(page.locator('[data-brand-cursor]')).toHaveAttribute('data-editing', '');
});

test('Studio dashboard exposes current advertising placements and edit shortcuts', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.locator('.advertising-placement-card')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Mevcut reklam alanları' })).toBeVisible();
  await page.goto('/studio/?section=advertising');
  await expect(page.locator('.manual-ad-placement')).toHaveCount(3);
  await page.locator('.advertising-placement-card').nth(1).click();
  await expect(page).toHaveURL(/#ad-article$/);
  await expect(page.locator('#ad-article')).toBeVisible();
  await expect(page.locator('#ad-article')).toHaveClass(/is-editing/);
});
test('homepage category grid and Studio link remain available', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  expect(await page.locator('.categories .category').count()).toBeGreaterThan(0);
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.getByRole('link', { name: '↗ Ana sayfayı aç' })).toHaveAttribute('href', 'https://palmarghe.com/');
});
test('tag directory is reachable and preserves the public layout', async ({ page }) => {
  await page.goto('/tags/');
  await expect(page.getByRole('heading', { name: 'Etiketler' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('newsletter requires consent and records an explicit subscription', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('.newsletter-signup');
  await expect(form.getByRole('checkbox')).toHaveAttribute('required','');
  await expect(form.getByRole('link',{name:'Gizlilik Politikasını'})).toHaveAttribute('href','/privacy/');
  await form.locator('input[name="email"]').fill(`reader-${Date.now()}@example.test`);
  await form.getByRole('checkbox').check();
  await form.getByRole('button',{name:'Kaydol'}).click();
  await expect(page).toHaveURL(/\?newsletter=1$/);
  await expect(page.getByText('Bülten listesine kaydın alındı.')).toBeVisible();
});

test('Studio dashboard reports publication quality and Studio previews update before save', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.getByRole('heading',{name:'Genel bakış'})).toBeVisible({timeout:15000});
  await expect(page.locator('.dashboard-quality-control')).toBeVisible({timeout:15000});
  await expect(page.locator('.dashboard-quality-control')).toContainText(/yayın|hazır/i);

  await page.goto('/studio/?section=homepage');
  const title = page.getByRole('textbox', { name: 'TR başlık' });
  await title.fill('Yerel önizleme başlığı');
  await expect(page.locator('[data-homepage-preview]')).toContainText('Yerel önizleme başlığı');

  await page.goto('/studio/?section=advertising');
  await page.locator('input[name="header_title"]').fill('Yerel reklam önizlemesi');
  await expect(page.locator('[data-ad-preview]')).toContainText('Yerel reklam önizlemesi');
});

test('mobile portal is exclusive to touch devices and closes accessibly', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  const brand = page.locator('.site-header .brand');
  for (let tap = 0; tap < 5; tap++) await brand.tap();
  await expect(page.locator('.mobile-secret')).toBeVisible();
  await page.getByRole('button', { name: 'Dünyaya dön' }).click();
  await expect(page.locator('.mobile-secret')).toBeHidden();
  await context.close();
});

test('mobile action buttons stay within the viewport and logo returns home', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  for (const route of ['/', '/account/', '/contact/', '/search/', '/archive/']) {
    await page.goto(route);
    const outside = await page.locator('button,.button').evaluateAll(elements => elements.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.left < -1 || r.right > innerWidth + 1);
    }).map(el => el.textContent));
    expect(outside, route).toEqual([]);
  }
  await page.goto('/account/');
  await page.locator('.site-header .brand').tap();
  await expect(page).toHaveURL('http://127.0.0.1:4322/');
  await Promise.all([page.waitForEvent('load'), page.locator('.site-header .brand').tap()]);
  await expect(page.locator('.mobile-secret')).toHaveCount(0);
  await context.close();
});
