import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['/', '/en/', '/contact/', '/account/', '/archive/']) {
  test(`live ${path} has no serious WCAG violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test('live Studio sign-in has no serious WCAG violations', async ({ page }) => {
  await page.goto('https://studio.palmarghe.com/studio/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([]);
});
