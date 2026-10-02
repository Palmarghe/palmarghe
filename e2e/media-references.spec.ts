import { test, expect, type Page } from '@playwright/test';

// Isolate this multi-login workflow from the shared suite rate-limit bucket.
test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ 'CF-Connecting-IP': '198.51.100.250' });
});

async function login(page: Page) {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.getByRole('heading', { name: 'Genel bakış' })).toBeVisible();
}
test('body media is private until published and survives removal while a revision still references it', async ({ page }) => {
  await login(page);
  await page.goto('/studio/?section=media');
  const upload = page.locator('form[action="/api/media/"]');
  await upload.locator('[name="file"]').setInputFiles({ name: 'body-reference.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWOYVLgGAANIAbAPnu7IAAAAAElFTkSuQmCC', 'base64') });
  await upload.locator('[name="alt_tr"]').fill('Body reference QA');
  await upload.getByRole('button', { name: 'Yükle' }).click();
  const card = page.locator('.entry-card').filter({ has: page.locator('input[value="Body reference QA"]') });
  const mediaId = await card.locator('input[name="id"]').first().inputValue();
  const slug = 'body-reference-qa-' + Date.now();
  const body = JSON.stringify({ type: 'doc', content: [{ type: 'blockquote', content: [{ type: 'mediaImage', attrs: { media_id: mediaId, alt: 'Body reference QA' } }] }] });
  const fields = { entity: 'content', title: 'Body reference QA', slug, locale: 'tr', type: 'article', body };
  const headers = { Origin: 'http://127.0.0.1:4322' };
  expect((await page.request.post('/api/studio/', { headers, form: { ...fields, status: 'draft' } })).status()).toBe(200);
  await page.goto('/studio/?section=content');
  const href = await page.getByRole('row').filter({ hasText: 'Body reference QA' }).getByRole('link', { name: 'Düzenle' }).getAttribute('href');
  const id = new URL(href!, 'http://127.0.0.1:4322').searchParams.get('edit')!;
  await page.context().clearCookies();
  expect((await page.request.get('/api/media/' + mediaId + '/')).status()).toBe(404);
  await login(page);
  expect((await page.request.post('/api/studio/', { headers, form: { ...fields, id, status: 'published' } })).status()).toBe(200);
  await page.context().clearCookies();
  await page.goto('/' + slug + '/');
  const image = page.locator('.content-media img[alt="Body reference QA"]');
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1);
  expect((await page.request.get('/api/media/' + mediaId + '/')).status()).toBe(200);
  await login(page);
  expect((await page.request.post('/api/studio/', { headers, form: { ...fields, id, status: 'published', body: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Image removed from current body.' }] }] }) } })).status()).toBe(200);
  const denied = await page.request.post('/api/media/manage/', { headers, form: { id: mediaId, operation: 'delete' } });
  expect(denied.status()).toBe(409); expect(await denied.text()).toContain('revisions');
  // Local-only permanent deletion of this test content removes its revisions.
  expect((await page.request.post('/api/studio/', { headers, form: { entity: 'content', id, operation: 'delete' } })).status()).toBe(200);
  expect((await page.request.post('/api/media/manage/', { headers, form: { id: mediaId, operation: 'delete' } })).status()).toBe(200);
  expect((await page.request.get('/api/media/' + mediaId + '/')).status()).toBe(404);
});
