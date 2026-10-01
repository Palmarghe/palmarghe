import { test, expect } from '@playwright/test';

test('deployed measurement script emits minimized attribution and valid placement paths without touching counters', async ({ page }) => {
  const events: Record<string, unknown>[] = [];
  // Every write is intercepted before the controlled non-automated client runs.
  await page.route('**/api/traffic/', async route => {
    events.push(route.request().postDataJSON());
    await route.fulfill({ status: 204 });
  });
  await page.route('**/api/engagement/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"reads":0,"shares":0}' }));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(document, 'referrer', { get: () => 'https://www.google.com/search?q=private-test-query' });
  });
  await page.goto('/');
  await expect.poll(() => events.length).toBe(1);
  expect(events[0]).toMatchObject({ path: '/', source: 'organic_search' });
  expect(Object.keys(events[0]).sort()).toEqual(['path', 'source', 'visitor']);
  await page.addScriptTag({ url: '/scripts/traffic.js' });
  await page.evaluate(() => {
    const fixture = document.createElement('section');
    for (const placement of ['header', 'article', 'footer']) {
      const button = document.createElement('button');
      button.dataset.promotionClick = placement;
      button.textContent = `Controlled ${placement} placement`;
      fixture.append(button);
    }
    document.querySelector('main')!.prepend(fixture);
  });
  for (const placement of ['header', 'article', 'footer']) await page.getByRole('button', { name: `Controlled ${placement} placement` }).click();
  await expect.poll(() => events.length).toBe(4);
  expect(events.map(event => event.path)).toEqual(['/', '/ad/header/', '/ad/article/', '/ad/footer/']);
  expect(events.every(event => event.source === 'organic_search')).toBe(true);
  expect(JSON.stringify(events)).not.toContain('private-test-query');
  expect(JSON.stringify(events)).not.toContain('google.com');
});

test('normal automated audit navigation does not emit traffic or engagement writes', async ({ page }) => {
  const writes: string[] = [];
  await page.route('**/api/traffic/', route => { writes.push('traffic'); return route.fulfill({ status: 204 }); });
  await page.route('**/api/engagement/**', route => {
    if (route.request().method() === 'POST') writes.push('engagement');
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"reads":0,"shares":0}' });
  });
  await page.goto('/fm/lamine-yamal-fm26/');
  await expect(page.locator('.content-engagement')).toBeVisible();
  expect(writes).toEqual([]);
  const response = await page.request.post('/api/traffic/', {
    headers: { origin: 'https://palmarghe.com', 'user-agent': 'Lighthouse QA' },
    data: { path: '/', visitor: '11111111-1111-4111-8111-111111111111', source: 'organic_search' },
  });
  expect(response.status()).toBe(204); // Live bot rejection, with no RPC writes.
});
