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
  const card = page.locator('.entry-card').first();
  await expect(card.locator('input[name="alt_tr"]')).toHaveValue('Test görseli');
  const mediaId = await card.locator('input[name="id"]').first().inputValue();
  await card.locator('input[name="alt_tr"]').fill('Güncel alt');
  await card.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.locator('.entry-card input[name="alt_tr"]')).toHaveValue('Güncel alt');
  await page.locator('.entry-card summary').click();
  await page.locator('.entry-card').getByRole('button', { name: 'Silmeyi onayla' }).click();
  expect((await page.request.get(`/api/media/${mediaId}/`)).status()).toBe(404);
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

test('redirect manager rejects loops and serves 301', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=redirects');
  await page.locator('input[name="source_path"]').fill('/old-location/');
  await page.locator('input[name="target_path"]').fill('/lab/');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  const redirect = await page.request.get('/old-location/', { maxRedirects: 0 });
  expect(redirect.status()).toBe(301);
  expect(redirect.headers().location).toContain('/lab/');
  const loop = await page.request.post('/api/studio/', { headers: { Origin: 'http://127.0.0.1:4322' }, form: { entity: 'redirect', source_path: '/lab/', target_path: '/old-location/' }, maxRedirects: 0 });
  expect(loop.status()).toBe(400);
});

test('FM mod has dedicated fields and safe external download', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=content');
  await page.locator('input[name="title"]').fill('FM26 Test Modu');
  await page.locator('input[name="slug"]').fill('fm/fm26/test-modu');
  await page.locator('select[name="category_id"]').selectOption({ label: 'FM26' });
  await page.locator('select[name="type"]').selectOption('fm_mod');
  await page.locator('select[name="status"]').selectOption('published');
  await page.locator('input[name="compatibility"]').fill('FM26');
  await page.locator('input[name="mod_version"]').fill('1.0');
  await page.locator('textarea[name="installation"]').fill('Dosyayı oyun klasörüne kopyalayın.');
  await page.locator('input[name="download_url"]').fill('https://example.com/download');
  await page.locator('#block-editor .tiptap').fill('Mod açıklaması.');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await page.goto('/fm/fm26/test-modu/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('FM26 Test Modu');
  await expect(page.getByText('Dosyayı oyun klasörüne kopyalayın.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Harici indirme/ })).toHaveAttribute('rel', 'noopener noreferrer');
});

test('scheduled content stays private and staff preview is noindex', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=content');
  await page.locator('input[name="title"]').fill('Gelecek Yayın');
  await page.locator('input[name="slug"]').fill('lab/gelecek-yayin');
  await page.locator('select[name="status"]').selectOption('scheduled');
  const future = new Date(Date.now()+60*60*1000).toISOString().slice(0,16);
  await page.locator('input[name="publish_at"]').fill(future);
  await page.locator('#block-editor .tiptap').fill('Henüz özel.');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  const row = page.getByRole('row').filter({ hasText: 'Gelecek Yayın' });
  const preview = await row.getByRole('link', { name: 'Önizle' }).getAttribute('href');
  await row.getByRole('link', { name: 'Önizle' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gelecek Yayın');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
  await page.context().clearCookies();
  await page.goto(preview!);
  await expect(page.getByRole('heading', { name: 'Forbidden' })).toBeVisible();
  await page.goto('/lab/gelecek-yayin/');
  await expect(page.getByText('Sayfa bulunamadı.')).toBeVisible();
});

test('homepage controls hide and reorder sections', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=homepage');
  await page.locator('input[name="featured_visible"]').uncheck();
  await page.locator('select[name="categories_order"]').selectOption('1');
  await page.locator('select[name="latest_order"]').selectOption('2');
  await page.locator('select[name="featured_order"]').selectOption('3');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await page.goto('/');
  const sections = page.locator('.home-sections > section');
  await expect(sections).toHaveCount(2);
  await expect(sections.first()).toHaveAttribute('style', 'order:1');
  await expect(sections.last()).toHaveAttribute('style', 'order:2');
});

test('social settings and translated content alternate', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=settings');
  await page.locator('input[name="github"]').fill('https://github.com/Palmarghe');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name: 'github' })).toHaveAttribute('rel','noopener noreferrer');
  const group = crypto.randomUUID();
  for (const [locale,slug,title] of [['tr','lab/ceviri-test','Türkçe Deneme'],['en','lab/translation-test','English Test']]) {
    const response = await page.request.post('/api/studio/', { headers: { Origin: 'http://127.0.0.1:4322' }, form: { entity: 'content', title, slug, locale, translation_group: group, type: 'article', status: 'published', body: JSON.stringify({ type: 'doc', content: [{ type:'paragraph', content:[{ type:'text', text:title }] }] }) }, maxRedirects: 0 });
    expect(response.status()).toBe(303);
  }
  await page.goto('/lab/ceviri-test/');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href','https://palmarghe.com/en/lab/translation-test/');
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('English Test');
});

test('login attempts are rate limited', async ({ page }) => {
  const headers = { Origin: 'http://127.0.0.1:4322', 'CF-Connecting-IP': '192.0.2.44' };
  for (let index=0;index<10;index++) {
    const result = await page.request.post('/api/auth/', { headers, form: { action: 'login', email: 'unknown@example.test', password: 'Incorrect123!' }, maxRedirects: 0 });
    expect(result.status()).toBe(400);
  }
  const limited = await page.request.post('/api/auth/', { headers, form: { action: 'login', email: 'unknown@example.test', password: 'Incorrect123!' }, maxRedirects: 0 });
  expect(limited.status()).toBe(429);
});

test('content tags can be assigned and cleared', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=tags');
  await page.locator('input[name="slug"]').fill('tag-connection');
  await page.locator('input[name="name_tr"]').fill('Bağlantı');
  await page.locator('input[name="name_en"]').fill('Connection');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await page.goto('/studio/?section=content');
  await page.locator('input[name="title"]').fill('Etiketli yazı');
  await page.locator('input[name="slug"]').fill('lab/etiketli-yazi');
  await page.locator('select[name="tag_ids"]').selectOption({ label: 'Bağlantı' });
  await page.locator('#block-editor .tiptap').fill('Etiket akışı.');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await page.getByRole('row').filter({ hasText: 'Etiketli yazı' }).getByRole('link', { name: 'Düzenle' }).click();
  await expect(page.locator('select[name="tag_ids"]')).toHaveValues([/./]);
  await page.locator('select[name="tag_ids"]').selectOption([]);
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await page.getByRole('row').filter({ hasText: 'Etiketli yazı' }).getByRole('link', { name: 'Düzenle' }).click();
  await expect(page.locator('select[name="tag_ids"]')).toHaveValues([]);
});

test('admin manages member roles without self escalation', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=users');
  const memberId = '00000000-0000-4000-8000-100000000003';
  const row = page.getByRole('row').filter({ hasText: memberId });
  await row.locator('select[name="role"]').selectOption('editor');
  await row.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByRole('row').filter({ hasText: memberId }).locator('select[name="role"]')).toHaveValue('editor');
  const self = await page.request.post('/api/studio/', { headers: { Origin: 'http://127.0.0.1:4322' }, form: { entity: 'member_role', id: '00000000-0000-4000-8000-100000000001', role: 'member' } });
  expect(self.status()).toBe(400);
});

test('category hierarchy rejects cycles and supports inactive state', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=categories');
  await page.locator('form').first().locator('input[name="slug"]').fill('inactive-test');
  await page.locator('form').first().locator('input[name="name_tr"]').fill('Pasif Kategori');
  await page.locator('form').first().locator('input[name="name_en"]').fill('Inactive Category');
  await page.locator('form').first().locator('input[name="active"]').uncheck();
  await page.locator('form').first().getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Pasif Kategori' })).toContainText('Pasif');
  const row = page.getByRole('row').filter({ hasText: 'Pasif Kategori' });
  await row.getByRole('link', { name: 'Düzenle' }).click();
  await expect(page.locator('form').first().locator('input[name="active"]')).not.toBeChecked();
  const id = await page.locator('form').first().locator('input[name="id"]').inputValue();
  const cycle = await page.request.post('/api/studio/', { headers: { Origin: 'http://127.0.0.1:4322' }, form: { entity: 'category', operation: 'update', id, slug: 'inactive-test', name_tr: 'Pasif Kategori', name_en: 'Inactive Category', parent_id: id, sort_order: '0', active: 'on' } });
  expect(cycle.status()).toBe(400);
});
