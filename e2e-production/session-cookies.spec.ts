import { test, expect } from '@playwright/test';

for (const origin of ['https://palmarghe.com/account/', 'https://studio.palmarghe.com/studio/']) {
test(`expired invalid QA session is rejected and removed with protected cookie attributes: ${origin}`, async ({ request }) => {
  // Synthetic invalid tokens only. Never signs in, creates users or reads a real session.
  const fixture = { access_token: 'controlled-invalid-access', refresh_token: 'controlled-invalid-refresh', token_type: 'bearer', expires_at: 1, expires_in: 3600, user: { id: '00000000-0000-4000-8000-000000000000', email: 'cookie-qa@example.invalid' } };
  const encoded = `base64-${Buffer.from(JSON.stringify(fixture)).toString('base64url')}`;
  const response = await request.get(`${origin}?verify=session-cookie`, { headers: { cookie: `sb-ozztqhiqzchlbxscbwhy-auth-token=${encoded}` } });
  expect(response.status()).toBe(200);
  const cookies = response.headersArray().filter(header => header.name.toLowerCase() === 'set-cookie' && header.value.startsWith('sb-ozztqhiqzchlbxscbwhy-auth-token'));
  expect(cookies.length).toBeGreaterThan(0);
  for (const cookie of cookies) {
    // Inspect only attributes, not token data, in failure output.
    const flags = cookie.value.split(';').slice(1).map(value => value.trim().toLowerCase());
    expect(flags).toContain('httponly');
    expect(flags).toContain('secure');
    expect(flags).toContain('samesite=lax');
    expect(flags).toContain('path=/');
    expect(flags).toContain('max-age=0');
  }
  const page = await response.text();
  expect(page).not.toContain('controlled-invalid-access');
  expect(page).not.toContain('controlled-invalid-refresh');
});
}
