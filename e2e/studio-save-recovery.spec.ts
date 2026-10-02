import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function login(page: Page) {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await expect(page.getByRole('heading', { name: 'Genel bakış' })).toBeVisible();
}
test.beforeEach(async ({ context }, info) => {
  await context.setExtraHTTPHeaders({ 'CF-Connecting-IP': `192.0.2.${info.title.includes('editor') ? 241 : 242}` });
});

test('editor retains metadata and body after a failed save, blocks duplicates and allows a real retry', async ({ page }) => {
  await login(page);
  await page.goto('/studio/?section=content');
  const title = `Recovery draft ${Date.now()}`;
  const form = page.locator('.content-editor-form');
  await form.locator('[name="title"]').fill(title);
  await page.locator('#block-editor .tiptap').fill('Retained document text.');
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  let calls = 0;
  await page.route('**/api/studio/', async route => {
    calls++;
    if (calls === 1) { await pending; await route.fulfill({ status: 503, body: 'INTERNAL-DETAIL-MUST-NOT-LEAK' }); }
    else await route.continue();
  });
  await page.getByRole('button', { name: 'Taslak kaydet' }).click();
  await expect(form).toHaveAttribute('aria-busy', 'true');
  await expect(form.locator('[name="title"]')).toBeDisabled();
  await expect(page.locator('#block-editor .tiptap')).toHaveAttribute('contenteditable', 'false');
  await form.evaluate(element => element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(calls).toBe(1);
  release();
  await expect(form).toHaveAttribute('aria-busy', 'false');
  await expect(form.locator('[name="title"]')).toHaveValue(title);
  await expect(page.locator('#block-editor .tiptap')).toHaveText('Retained document text.');
  await expect(page.locator('#block-editor .tiptap')).toHaveAttribute('contenteditable', 'true');
  await expect(page.locator('.editor-status')).toContainText('Girdileriniz korunuyor');
  await expect(page.locator('body')).not.toContainText('INTERNAL-DETAIL-MUST-NOT-LEAK');
  expect(await page.evaluate(() => !dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true);
  await page.getByRole('button', { name: 'Taslak kaydet' }).click();
  await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();
  expect(calls).toBe(2);
});

test('media upload retains file and alt text after server failure and retries successfully', async ({ page }) => {
  await login(page);
  await page.goto('/studio/?section=media');
  const form = page.locator('form[action="/api/media/"]');
  const alt = `Recovery image ${Date.now()}`;
  await form.locator('[name="file"]').setInputFiles({ name: 'recovery.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=', 'base64') });
  await form.locator('[name="alt_tr"]').fill(alt);
  let calls = 0;
  await page.route('**/api/media/', async route => {
    if (route.request().method() !== 'POST') { await route.continue(); return; }
    calls++;
    if (calls === 1) await route.fulfill({ status: 503, body: 'INTERNAL-DETAIL-MUST-NOT-LEAK' });
    else await route.continue();
  });
  await form.getByRole('button', { name: 'Yükle' }).click();
  await expect(form.locator('[data-studio-form-status]')).toContainText('Girdileriniz korunuyor');
  await expect(form.locator('[name="alt_tr"]')).toHaveValue(alt);
  await expect(form.getByRole('button', { name: 'Yükle' })).toBeEnabled();
  expect(await form.locator('[name="file"]').evaluate(element => (element as HTMLInputElement).files?.[0].name)).toBe('recovery.png');
  await expect(page.locator('body')).not.toContainText('INTERNAL-DETAIL-MUST-NOT-LEAK');
  await form.getByRole('button', { name: 'Yükle' }).click();
  await expect(page.locator('.entry-card input[name="alt_tr"]').filter({ visible: true }).first()).toHaveValue(alt);
  expect(calls).toBe(2);
});

test('media pending-cleanup feedback is readable in both themes on phone and desktop', async ({ page }) => {
  await login(page);
  // Presentation of the server redirect state, not a simulated Storage deletion.
  for (const width of [390,1440]) for (const theme of ['dark','light']) {
    await page.setViewportSize({width,height:900});
    await page.goto('/studio/?section=media&cleanup=pending');
    await page.evaluate(value => { document.body.dataset.theme=value; },theme);
    const notice=page.getByText('Medya kaydı kaldırıldı; dosya temizliği henüz tamamlanmadı.',{exact:false});
    await expect(notice).toBeVisible();
    await expect(notice).toHaveAttribute('role','status');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const results=await new AxeBuilder({page}).include('.admin-main').analyze();
    expect(results.violations.filter(item=>['serious','critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});
