import { expect, type Page } from '@playwright/test';

export async function verifyProfileRecovery(page: Page, locale = 'tr') {
  let loads = 0, saves = 0;
  let releaseSave: () => void = () => {};
  await page.route('**/api/profile/', async route => {
    if (route.request().method() === 'GET') {
      loads++;
      return route.fulfill(loads === 1 ? { status: 503, body: 'Unavailable' } : { json: { viewer_id:'00000000-0000-4000-8000-100000000003',display_name: 'Controlled QA', bio: 'Existing bio', avatar_key: 'avatar-05', author_slug: 'qa-profile', public_profile: false } });
    }
    saves++;
    if (saves === 1) return route.abort('failed');
    if (saves === 2) return route.fulfill({ status: 409, json: { error: 'author_slug_taken', field: 'author_slug' } });
    await new Promise<void>(resolve => { releaseSave = resolve; });
    return route.fulfill({ json: { ok: true,viewer_id:'00000000-0000-4000-8000-100000000003' } });
  });
  await page.goto(`${locale === 'en' ? '/en' : ''}/account/?verify=profile`);
  const message = (tr: string, en: string) => locale === 'en' ? en : tr;
  const form = page.locator('.profile-card form');
  const save = form.getByRole('button', { name: message('Profili kaydet', 'Save profile') });
  const status = form.locator('[data-profile-status]');
  await expect(status).toContainText(message('Profil yüklenemedi', 'Profile could not load'));
  await expect(save).toBeDisabled();
  await expect(form.locator('[name="display_name"]')).toBeDisabled();
  await form.getByRole('button', { name: message('Yeniden dene', 'Try again') }).click();
  await expect(save).toBeEnabled();
  await expect(form.locator('[name="display_name"]')).toHaveValue('Controlled QA');
  const bio = form.locator('[name="bio"]');
  await bio.fill('Keep this edit');
  await save.click();
  await expect(status).toContainText(message('Bağlantı kurulamadı', 'Connection failed'));
  await expect(bio).toHaveValue('Keep this edit');
  await expect(save).toBeEnabled();
  await save.click();
  await expect(status).toContainText(message('Bu profil adresi kullanılıyor', 'This profile address is taken'));
  await expect(form.locator('[name="author_slug"]')).toHaveAttribute('aria-invalid', 'true');
  await expect(bio).toHaveValue('Keep this edit');
  await save.click();
  await expect.poll(() => saves).toBe(3);
  await expect(save).toBeDisabled();
  // A second submit event must also be guarded, not just a disabled button.
  await form.evaluate(element => element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  releaseSave();
  await expect(status).toContainText(message('Profil kaydedildi', 'Profile saved'));
  await expect(save).toBeEnabled();
  expect(saves).toBe(3);
}
