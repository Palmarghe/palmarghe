import { test, expect } from '@playwright/test';

// All POST routes from the source inventory. Invalid origins are rejected before
// body parsing, Auth, Storage or mutation, so these requests create no test data.
const endpoints = ['/api/auth/', '/api/comments/', '/api/contact/', '/api/engagement/', '/api/library/', '/api/media/', '/api/media/manage/', '/api/newsletter/', '/api/profile/', '/api/studio/', '/api/traffic/'];
for (const host of ['https://palmarghe.com', 'https://studio.palmarghe.com']) {
  test('write routes reject absent and foreign origins: ' + host, async ({ request }) => {
    for (const endpoint of endpoints) for (const origin of [undefined, 'https://foreign.example.invalid']) {
      const response = await request.post(host + endpoint, {
        headers: origin ? { Origin: origin } : {}, data: 'controlled-invalid-body',
      });
      expect(response.status(), endpoint + ' origin=' + String(origin)).toBe(403);
      expect(await response.text()).toBe('Invalid origin');
      expect(response.headers()['cache-control']).toContain('no-store');
    }
  });
  test('anonymous media writes are rejected before parsing: ' + host, async ({ request }) => {
    for (const endpoint of ['/api/media/', '/api/media/manage/']) {
      const response = await request.post(host + endpoint, { headers: { Origin: host }, data: 'controlled-invalid-body' });
      expect(response.status()).toBe(401); expect(await response.text()).toBe('Unauthorized');
    }
  });
}
