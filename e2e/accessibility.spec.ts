import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['/', '/en/', '/contact/', '/account/']) {
  test(`critical page has no serious accessibility violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    expect(results.violations.filter((item) => ['serious','critical'].includes(item.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test('Studio content form has no serious accessibility violations', async ({ page }) => {
  await page.goto('/studio/');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.test');
  await page.locator('input[name="password"]').fill('LocalTest123!');
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.goto('/studio/?section=content');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(results.violations.filter((item) => ['serious','critical'].includes(item.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([]);
});
