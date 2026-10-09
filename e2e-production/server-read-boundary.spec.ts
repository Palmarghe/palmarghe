import { expect, test } from '@playwright/test';

test('production ignores the loopback-only content failure fixture and serves real archive/feed reads', async ({ request }) => {
  for (const path of ['/archive/?type=project', '/en/archive/?type=project', '/sitemap.xml']) {
    const response = await request.get(path, { headers: { 'x-pg-test-content-read': 'fail' } });
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain('controlled local read failure');
  }
});
