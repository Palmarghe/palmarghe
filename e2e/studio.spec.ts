import { test, expect } from '@playwright/test';

test('public language and metadata', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Dijital işler');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://palmarghe.com/');
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A space for digital work');
});

test('member is denied Studio', async ({ page }) => {
  await page.goto('/account/');
  await page.locator('form').filter({ has: page.locator('input[value="login"]') }).getByRole('textbox', { name: 'Email' }).fill('member@example.test');
  await page.locator('form').filter({ has: page.locator('input[value="login"]') }).locator('input[name="password"]').fill('LocalTest123!');
  await page.locator('form').filter({ has: page.locator('input[value="login"]') }).getByRole('button').click();
  await page.goto('/studio/');
  await expect(page.getByRole('heading', { name: 'Erişim yok' })).toBeVisible();
  const denied = await page.request.post('/api/studio/', { headers: { Origin: 'http://127.0.0.1:4322' }, form: { entity: 'category', slug: 'forbidden', name_tr: 'X', name_en: 'X' } });
  expect(denied.status()).toBe(403);
});

test('admin creates a category and publishes content', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=categories');
  await page.locator('form').first().locator('input[name="slug"]').fill('test-category');
  await page.locator('form').first().locator('input[name="name_tr"]').fill('Test Kategorisi');
  await page.locator('form').first().locator('input[name="name_en"]').fill('Test Category');
  await page.locator('form').first().getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByRole('cell', { name: 'Test Kategorisi' })).toBeVisible();
  await page.goto('/studio/?section=content');
  await page.locator('input[name="title"]').fill('Yerel Test Yazısı');
  await page.locator('input[name="slug"]').fill('test-category/yerel-test-yazisi');
  await page.locator('select[name="category_id"]').selectOption({ label: 'Test Kategorisi' });
  await page.locator('select[name="status"]').selectOption('published');
  await page.locator('#block-editor .tiptap').fill('İçerik doğrulandı.');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByText('Yerel Test Yazısı')).toBeVisible();
  await page.goto('/test-category/yerel-test-yazisi/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Yerel Test Yazısı');
  await expect(page.getByText('İçerik doğrulandı.')).toBeVisible();
});

test('admin manages tags, appearance, navigation and media', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=tags');
  await page.locator('input[name="slug"]').fill('testing');
  await page.locator('input[name="name_tr"]').fill('Test');
  await page.locator('input[name="name_en"]').fill('Test');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByRole('cell', { name: 'testing' })).toBeVisible();
  await page.goto('/studio/?section=appearance');
  await page.locator('select[name="accent"]').selectOption('blue');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('style', /#60a5fa/);
  await page.goto('/studio/?section=navigation');
  await page.locator('input[name="label"]').fill('Özel');
  await page.locator('input[name="href"]').fill('/lab/');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Ana menü' }).getByRole('link', { name: 'Özel' })).toBeVisible();
  await page.goto('/studio/?section=media');
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=', 'base64');
  await page.locator('input[name="file"]').setInputFiles({ name: 'pixel.png', mimeType: 'image/png', buffer: image });
  await page.locator('input[name="alt_tr"]').fill('Test görseli');
  await page.getByRole('button', { name: 'Yükle' }).click();
  await expect(page.getByText('Test görseli')).toBeVisible();
});

test('contact validation, bot check and rate limit', async ({ page }) => {
  await page.goto('/contact/');
  await page.locator('input[name="name"]').fill('Test User');
  await page.locator('input[name="email"]').fill('test@example.test');
  await page.locator('textarea[name="message"]').fill('This is a local test message.');
  await page.locator('input[name="consent"]').check();
  await page.getByRole('button', { name: 'Gönder' }).click();
  await expect(page.getByText('Mesaj alındı.')).toBeVisible();
  const base = { name: 'Test', email: 'test@example.test', message: 'Long enough message', locale: 'tr', consent: 'on' };
  const headers = { Origin: 'http://127.0.0.1:4322', 'CF-Connecting-IP': '192.0.2.1' };
  const bot = await page.request.post('/api/contact/', { headers, form: { ...base, 'cf-turnstile-response': 'bad' }, maxRedirects: 0 });
  expect(bot.status()).toBe(403);
  for (let i=0;i<5;i++) {
    const response = await page.request.post('/api/contact/', { headers, form: { ...base, 'cf-turnstile-response': 'local-test-token' }, maxRedirects: 0 });
    expect(response.status()).toBe(303);
  }
  const limited = await page.request.post('/api/contact/', { headers, form: { ...base, 'cf-turnstile-response': 'local-test-token' }, maxRedirects: 0 });
  expect(limited.status()).toBe(429);
});
