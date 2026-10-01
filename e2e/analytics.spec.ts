import { test, expect } from '@playwright/test';

test('Studio counts pageviews separately from ad clicks and discloses measurement limits', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=traffic');
  const total = page.locator('.admin-stats article').filter({ hasText: 'Filtreli görüntüleme' }).locator('strong');
  const before = Number(await total.innerText());
  for (const path of ['/qa-local-measurement/', '/ad/header/', '/studio/preview/qa-local/']) {
    const result = await page.request.post('/api/traffic/', {
      headers: { origin: 'http://127.0.0.1:4322', 'user-agent': 'Chrome' },
      data: { path, visitor: '11111111-1111-4111-8111-111111111111', source: 'direct' },
    });
    expect(result.status()).toBe(204);
  }
  await page.reload();
  await expect(total).toHaveText(String(before + 1));
  await expect(page.getByText('Reklam tıklaması · Üst alan', { exact: true })).toBeVisible();
  await expect(page.getByText('/studio/preview/qa-local/', { exact: true })).toHaveCount(0);
  await expect(page.locator('.admin-intro')).toContainText('bu, ziyaretçinin insan olduğunun kanıtı değildir');
  await expect(page.locator('.admin-intro')).toContainText('1 Ekim 2026 öncesi');
});
