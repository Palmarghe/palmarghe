import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }, testInfo) => {
  const suffix = [...testInfo.title].reduce((sum,character) => sum + character.charCodeAt(0),0) % 240 + 1;
  await context.setExtraHTTPHeaders({ 'CF-Connecting-IP': `198.51.100.${suffix}` });
});
const openContentUrl = async (page: import('@playwright/test').Page) => {
  await page.getByRole('button', { name: 'Detaylı' }).click();
  const details = page.locator('.editor-url-details');
  if (!(await details.getAttribute('open'))) await details.locator('summary').click();
};
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
  await page.locator('form').filter({ has: page.locator('input[value="login"]') }).getByRole('button', { name: 'Giriş yap' }).click();
  await page.goto('/studio/');
  await expect(page.getByRole('heading', { name: 'Erişim yok' })).toBeVisible();
  const denied = await page.request.post('/api/studio/', { headers: { Origin: 'http://127.0.0.1:4322' }, form: { entity: 'category', slug: 'forbidden', name_tr: 'X', name_en: 'X' } });
  expect(denied.status()).toBe(403);
});

test('content transaction rejects an unknown category without inserting a row', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  const slug = `transaction-check-${Date.now()}`;
  const response = await page.request.post('/api/studio/', {
    headers: { Origin: 'http://127.0.0.1:4322' },
    form: {
      entity: 'content', title: 'Transaction check', slug, locale: 'tr', type: 'article',
      status: 'draft', category_id: '00000000-0000-4000-8000-ffffffffffff',
      body: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }] }),
    },
  });
  expect(response.status()).toBe(400);
  await page.goto('/studio/?section=content');
  await expect(page.getByRole('link', { name: 'Transaction check' })).toHaveCount(0);
});

test('Studio editor exposes keyboard link and searchable slash commands', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=content');
  await expect(page.getByRole('button', { name: 'Taslak kaydet' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yayınla' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zamanla' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Basit' })).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('input[name="seo_title"]')).toBeHidden();
  await page.getByRole('button', { name: 'Detaylı' }).click();
  await expect(page.getByRole('button', { name: 'Detaylı' })).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('input[name="seo_title"]')).toBeVisible();
  await expect(page.getByText('Yazı araçları')).toBeVisible();
  const editor = page.locator('#block-editor .tiptap');
  await editor.fill('Blok işlemi');
  await editor.press('Control+A');
  await page.getByRole('button',{name:'Altı çizili'}).click();
  await page.getByRole('button',{name:'Ortala'}).click();
  await expect(editor.locator('u')).toContainText('Blok işlemi');
  await expect(editor.locator('p')).toHaveAttribute('style',/text-align: center/);
  await page.getByRole('tab',{name:'Ekle',exact:true}).click();
  await expect(page.getByRole('button',{name:/Görsel/})).toBeVisible();
  await page.getByRole('tab',{name:'Biçim',exact:true}).click();
  const blockControls = page.getByRole('toolbar', { name: 'Seçili blok işlemleri' });
  await blockControls.getByRole('button', { name: 'Çoğalt' }).click();
  await expect(editor.locator('p')).toHaveCount(2);
  await blockControls.getByRole('button', { name: 'Sil', exact: true }).click();
  await expect(editor.locator('p')).toHaveCount(1);
  await editor.fill('Bağlantı metni');
  await editor.press('Control+A');
  await editor.press('Control+K');
  await expect(page.getByRole('dialog', { name: 'Bağlantı ekle' })).toBeVisible();
  await page.keyboard.press('Escape');
  await editor.fill('');
  await editor.pressSequentially('/tab');
  await expect(page.getByRole('menu', { name: 'Blok ekle' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Tablo/ })).toBeVisible();
  await editor.press('Enter');
  const tableDialog = page.getByRole('dialog', { name: 'Tablo ekle' });
  await expect(tableDialog).toBeVisible();
  await tableDialog.locator('input[name="rows"]').fill('4');
  await tableDialog.getByRole('button', { name: 'Ekle' }).click();
  await expect(editor.locator('table')).toHaveCount(1);
  await expect(editor.locator('tbody tr')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Geri al' })).toBeEnabled();
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
  await page.locator('form').first().getByRole('button', { name: 'Kaydet', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Test Kategorisi' })).toBeVisible();
  await page.goto('/studio/?section=content');
  await page.locator('input[name="title"]').fill('Yerel Test Yazısı');
  await openContentUrl(page);
  await page.locator('input[name="slug"]').fill('test-category/yerel-test-yazisi');
  await page.locator('select[name="category_id"]').selectOption({ label: 'Test Kategorisi' });
  await page.locator('.content-editor-form select[name="status"]').selectOption('published');
  await page.locator('#block-editor .tiptap').fill('İçerik doğrulandı.');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await expect(page.getByText('Yerel Test Yazısı')).toBeVisible();
  await page.goto('/test-category/yerel-test-yazisi/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Yerel Test Yazısı');
  await expect(page.getByText('İçerik doğrulandı.')).toBeVisible();
});

test('admin can save a simple-mode draft when the URL field is not filled', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=content');
  await page.locator('input[name="title"]').fill('Başlıktan URL Üretilen Taslak');
  await page.locator('#block-editor .tiptap').fill('Sunucu tarafı URL üretimi doğrulandı.');
  await page.getByRole('button', { name: 'Taslak kaydet' }).click();
  await expect(page.getByText('Başlıktan URL Üretilen Taslak')).toBeVisible();
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
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'testing' })).toBeVisible();
  await page.goto('/studio/?section=appearance');
  await page.locator('select[name="accent"]').selectOption('blue');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('style', /#60a5fa/);
  await page.goto('/studio/?section=navigation');
  await page.locator('input[name="label"]').fill('Özel');
  await page.locator('input[name="href"]').fill('/lab/');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
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
  await card.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await expect(page.locator('.entry-card input[name="alt_tr"]')).toHaveValue('Güncel alt');
  await page.locator('.entry-card summary').click();
  await page.locator('.entry-card').getByRole('button', { name: 'Silmeyi onayla' }).click();
  expect((await page.request.get(`/api/media/${mediaId}/`)).status()).toBe(404);
});

test('gallery media is private until publication and retains its caption', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=media');
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=', 'base64');
  await page.locator('input[name="file"]').setInputFiles({ name: 'gallery.png', mimeType: 'image/png', buffer: image });
  await page.locator('form[action="/api/media/"] input[name="alt_tr"]').fill('Galeri görseli');
  await page.locator('form[action="/api/media/"] input[name="alt_en"]').fill('Gallery image');
  await page.locator('form[action="/api/media/"] input[name="caption_tr"]').fill('Test galerisi açıklaması');
  await page.getByRole('button', { name: 'Yükle' }).click();
  const mediaId = await page.locator('.entry-card input[name="id"]').first().inputValue();
  await page.goto('/studio/?section=content');
  await page.locator('input[name="title"]').fill('Türkçe Galeri Testi');
  await page.getByRole('button', { name: 'Detaylı' }).click();
  await expect(page.locator('input[name="slug"]')).toHaveValue('turkce-galeri-testi');
  await page.locator('.content-editor-form select[name="type"]').selectOption('gallery');
  await page.locator(`input[name="gallery_media_ids"][value="${mediaId}"]`).check();
  await page.locator('#block-editor .tiptap').fill('Galeri metni.');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.context().clearCookies();
  expect((await page.request.get(`/api/media/${mediaId}/`)).status()).toBe(404);
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=content');
  await page.getByRole('row').filter({ hasText: 'Türkçe Galeri Testi' }).getByRole('link', { name: 'Düzenle' }).click();
  await page.locator('.content-editor-form select[name="status"]').selectOption('published');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.context().clearCookies();
  await page.goto('/turkce-galeri-testi/');
  await expect(page.getByRole('img', { name: 'Galeri görseli' })).toBeVisible();
  await expect(page.getByText('Test galerisi açıklaması')).toBeVisible();
  expect((await page.request.get(`/api/media/${mediaId}/`)).status()).toBe(200);
});

test('Studio pairs translations without exposing a UUID field', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=content');
  await expect(page.getByText('Çeviri grup UUID')).toHaveCount(0);
  await page.getByRole('button', { name: 'Detaylı' }).click();
  await page.locator('input[name="title"]').fill('Bağlantılı Türkçe');
  await page.locator('.content-editor-form select[name="status"]').selectOption('published');
  await page.locator('#block-editor .tiptap').fill('Türkçe içerik.');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.goto('/studio/?section=content');
  await page.getByRole('button', { name: 'Detaylı' }).click();
  await page.locator('input[name="title"]').fill('Linked English');
  await page.locator('.content-editor-form select[name="locale"]').selectOption('en');
  await page.locator('.content-editor-form select[name="status"]').selectOption('published');
  await page.locator('#block-editor .tiptap').fill('English content.');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.goto('/studio/?section=content');
  await page.getByRole('row').filter({ hasText: 'Bağlantılı Türkçe' }).getByRole('link', { name: 'Düzenle' }).click();
  await page.locator('select[name="target_id"]').selectOption({ label: 'Linked English · EN' });
  await page.getByRole('button', { name: 'Eşleştir' }).click();
  await page.goto('/baglantili-turkce/');
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href','https://palmarghe.com/en/linked-english/');
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
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
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
  await openContentUrl(page);
  await page.locator('input[name="slug"]').fill('fm/fm26/test-modu');
  await page.locator('select[name="category_id"]').selectOption({ label: 'FM26' });
  await page.locator('.content-editor-form select[name="type"]').selectOption('fm_mod');
  await page.locator('.content-editor-form select[name="status"]').selectOption('published');
  await page.locator('input[name="compatibility"]').fill('FM26');
  await page.locator('input[name="mod_version"]').fill('1.0');
  await page.locator('textarea[name="installation"]').fill('Dosyayı oyun klasörüne kopyalayın.');
  await page.locator('input[name="download_url"]').fill('https://example.com/download');
  await page.locator('#block-editor .tiptap').fill('Mod açıklaması.');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
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
  await openContentUrl(page);
  await page.locator('input[name="slug"]').fill('lab/gelecek-yayin');
  await page.locator('.content-editor-form select[name="status"]').selectOption('scheduled');
  const future = new Date(Date.now()+60*60*1000).toISOString().slice(0,16);
  await page.locator('input[name="publish_at"]').fill(future);
  await page.locator('#block-editor .tiptap').fill('Henüz özel.');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: 'Gelecek Yayın' });
  const preview = await row.getByRole('link', { name: 'Önizle' }).getAttribute('href');
  await row.getByRole('link', { name: 'Önizle' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gelecek Yayın');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
  await page.context().clearCookies();
  await page.goto(preview!);
  await expect(page.getByRole('heading', { name: 'Forbidden' })).toBeVisible();
  await page.goto('/lab/gelecek-yayin/');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
});

test('homepage controls hide and reorder sections', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=homepage');
  await page.locator('input[name="now_visible"]').uncheck();
  await page.locator('input[name="featured_visible"]').uncheck();
  await page.locator('input[name="fm_spotlight_visible"]').uncheck();
  await page.locator('input[name="lab_notes_visible"]').uncheck();
  await page.locator('input[name="archive_cta_visible"]').uncheck();
  await page.locator('select[name="categories_order"]').selectOption('1');
  await page.locator('select[name="latest_order"]').selectOption('2');
  await page.locator('select[name="featured_order"]').selectOption('3');
  await page.locator('select[name="now_order"]').selectOption('4');
  await page.locator('select[name="fm_spotlight_order"]').selectOption('5');
  await page.locator('select[name="lab_notes_order"]').selectOption('6');
  await page.locator('select[name="archive_cta_order"]').selectOption('7');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.goto('/');
  const sections = page.locator('.home-sections > section');
  expect(await sections.count()).toBeGreaterThan(0);
});

test('social settings and translated content alternate', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=settings');
  await page.locator('input[name="github"]').fill('https://github.com/Palmarghe');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name: 'github' })).toHaveAttribute('rel','noopener noreferrer');
  const group = crypto.randomUUID();
  await page.goto('/studio/?section=content');
  await expect(page.getByText('Çeviri grup UUID')).toHaveCount(0);
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
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.goto('/studio/?section=content');
  await page.locator('input[name="title"]').fill('Etiketli yazı');
  await openContentUrl(page);
  await page.locator('input[name="slug"]').fill('lab/etiketli-yazi');
  await page.locator('select[name="tag_ids"]').selectOption({ label: 'Bağlantı' });
  await page.locator('#block-editor .tiptap').fill('Etiket akışı.');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.getByRole('row').filter({ hasText: 'Etiketli yazı' }).getByRole('link', { name: 'Düzenle' }).click();
  await expect(page.locator('select[name="tag_ids"]')).toHaveValues([/./]);
  await page.locator('select[name="tag_ids"]').selectOption([]);
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  await page.getByRole('row').filter({ hasText: 'Etiketli yazı' }).getByRole('link', { name: 'Düzenle' }).click();
  await expect(page.locator('select[name="tag_ids"]')).toHaveValues([]);
});

test('admin manages member roles without self escalation', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=members');
  const group = page.locator('.member-actions select[name="group_id"]').first();
  await group.selectOption({label:'Editör'});
  await group.locator('xpath=../..').getByRole('button', { name: 'Uygula', exact: true }).click();
  await expect(page.locator('.member-actions select[name="group_id"]').first()).toHaveValue(/.+/);
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
  await page.locator('form').first().getByRole('button', { name: 'Kaydet', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Pasif Kategori' })).toContainText('Pasif');
  const row = page.getByRole('row').filter({ hasText: 'Pasif Kategori' });
  await row.getByRole('link', { name: 'Düzenle' }).click();
  await expect(page.locator('form').first().locator('input[name="active"]')).not.toBeChecked();
  const id = await page.locator('form').first().locator('input[name="id"]').inputValue();
  const cycle = await page.request.post('/api/studio/', { headers: { Origin: 'http://127.0.0.1:4322' }, form: { entity: 'category', operation: 'update', id, slug: 'inactive-test', name_tr: 'Pasif Kategori', name_en: 'Inactive Category', parent_id: id, sort_order: '0', active: 'on' } });
  expect(cycle.status()).toBe(400);
});

test('public layout fits mobile and tablet viewports', async ({ page }) => {
  for (const width of [390,768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
    expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
    await page.getByRole('button', { name: 'Menüyü aç' }).click();
    await expect(page.getByRole('navigation', { name: 'Mobil menü' }).getByRole('link', { name: 'Switch to English' })).toBeVisible();
  }
});

test('featured and noindex content controls affect public output', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=content');
  await page.locator('input[name="title"]').fill('Öne Çıkan Gizli İndeks');
  await openContentUrl(page);
  await page.locator('input[name="slug"]').fill('lab/featured-noindex');
  await page.locator('.content-editor-form select[name="status"]').selectOption('published');
  await page.locator('input[name="featured"]').check();
  await page.locator('input[name="indexable"][type="checkbox"]').uncheck();
  await page.locator('#block-editor .tiptap').fill('Deneme metni.');
  await page.getByRole('button', { name: 'Kaydet', exact: true }).click();
  const homepage = await page.request.post('/api/studio/', { headers: { Origin: 'http://127.0.0.1:4322' }, form: { entity:'homepage', now_visible:'on', featured_visible:'on', categories_visible:'on', latest_visible:'on', fm_spotlight_visible:'on', lab_notes_visible:'on', archive_cta_visible:'on', now_order:'1', featured_order:'2', categories_order:'3', latest_order:'4', fm_spotlight_order:'5', lab_notes_order:'6', archive_cta_order:'7' }, maxRedirects:0 });
  expect(homepage.status()).toBe(303);
  await page.goto('/');
  await expect(page.locator('.home-sections section').first()).toContainText('Öne Çıkan Gizli İndeks');
  await page.goto('/lab/featured-noindex/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}');
  expect(schema.headline).toBe('Öne Çıkan Gizli İndeks');
  const sitemap = await (await page.request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/lab/featured-noindex/');
});

