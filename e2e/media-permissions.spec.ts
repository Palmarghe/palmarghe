import { test, expect } from '@playwright/test';

test('editor with explicit media permission uploads, edits and removes local media', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('editor@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.getByRole('heading', { name: 'Genel bakış' })).toBeVisible();
  await page.goto('/studio/?panel=editor&section=media');
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=', 'base64');
  const upload = page.locator('form[action="/api/media/"]');
  await upload.locator('input[name="file"]').setInputFiles({ name: 'editor-permission.png', mimeType: 'image/png', buffer: image });
  await upload.locator('input[name="alt_tr"]').fill('Yetkili editör QA');
  await upload.getByRole('button', { name: 'Yükle' }).click();
  const card = page.locator('.entry-card').filter({ has: page.locator('input[value="Yetkili editör QA"]') });
  await expect(card).toBeVisible();
  const id = await card.locator('input[name="id"]').first().inputValue();
  await card.locator('input[name="alt_tr"]').fill('Güncel editör QA');
  await card.getByRole('button', { name: 'Kaydet', exact: true }).click();
  const updated = page.locator('.entry-card').filter({ has: page.locator('input[value="Güncel editör QA"]') });
  await expect(updated).toBeVisible();
  // A draft's social image is still in use and must survive deletion attempts.
  const origin = 'http://127.0.0.1:4322';
  const slug = 'media-social-qa-' + Date.now();
  const content = await page.request.post('/api/studio/', { headers: { Origin: origin }, form: {
    entity: 'content', title: 'Medya social QA', slug, locale: 'tr', type: 'article', status: 'draft', og_media_id: id,
    body: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Local QA' }] }] }),
  } });
  expect(content.status()).toBe(200);
  const inUse = await page.request.post('/api/media/manage/', { headers: { Origin: origin }, form: { id, operation: 'delete' } });
  expect(inUse.status()).toBe(409);
  expect((await page.request.get('/api/media/' + id + '/')).status()).toBe(200);
  await page.goto('/studio/?panel=editor&section=content');
  const editHref = await page.getByRole('row').filter({ hasText: 'Medya social QA' }).getByRole('link', { name: 'Düzenle' }).getAttribute('href');
  const contentId = new URL(editHref!, origin).searchParams.get('edit')!;
  const cleared = await page.request.post('/api/studio/', { headers: { Origin: origin }, form: {
    entity: 'content', id: contentId, title: 'Medya social QA', slug, locale: 'tr', type: 'article', status: 'draft',
    body: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Local QA' }] }] }),
  } });
  expect(cleared.status()).toBe(200);
  await page.goto('/studio/?panel=editor&section=media');
  await updated.locator('summary').click();
  await updated.getByRole('button', { name: 'Silmeyi onayla' }).click();
  expect((await page.request.get('/api/media/' + id + '/')).status()).toBe(404);
});
