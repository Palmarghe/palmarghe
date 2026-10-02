import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AstroCookies } from 'astro';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules(); });

describe('server Auth cookie boundary with the real Supabase SSR SDK', () => {
  it('protects every session chunk on password login and cookie removal on logout', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', false);
    vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://session-cookie-test.supabase.co');
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-public-key');
    const transport = vi.fn(async (url: string | URL | Request) => {
      if (String(url).includes('/logout')) return new Response('{}', { status: 200 });
      return Response.json({
        access_token: 'fake-access-token', refresh_token: 'fake-refresh-token', token_type: 'bearer',
        expires_in: 3600, user: { id: 'local-cookie-qa', email: 'qa@example.invalid', user_metadata: { padding: 'x'.repeat(8000) } },
      });
    });
    vi.stubGlobal('fetch', transport);
    const set = vi.fn();
    const { supabase } = await import('./supabase');
    const client = supabase({ set } as unknown as AstroCookies, new Request('https://palmarghe.com/api/auth/'))!;
    const login = await client.auth.signInWithPassword({ email: 'qa@example.invalid', password: 'controlled-local-test' });
    expect(login.error).toBeNull();
    expect(set.mock.calls.length).toBeGreaterThan(1); // Exercise chunked session storage, not just one token.
    for (const [name, , options] of set.mock.calls) {
      expect(name).toMatch(/^sb-session-cookie-test-auth-token/);
      expect(options).toMatchObject({ path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
      expect(options.maxAge).toBeGreaterThan(0);
    }
    // Logout is a new HTTP request carrying the cookies emitted by login.
    const cookieHeader = set.mock.calls.map(([name, value]) => `${name}=${value}`).join('; ');
    set.mockClear();
    const logoutClient = supabase({ set } as unknown as AstroCookies, new Request('https://palmarghe.com/api/auth/', { headers: { cookie: cookieHeader } }))!;
    const logout = await logoutClient.auth.signOut();
    expect(logout.error).toBeNull();
    expect(set).toHaveBeenCalled();
    for (const [, value, options] of set.mock.calls) {
      expect(value).toBe('');
      expect(options).toMatchObject({ httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
    }
  });

  it('keeps a refreshed session protected when an expired cookie reaches the server', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', false);
    vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://session-cookie-test.supabase.co');
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-public-key');
    const user = { id: 'local-cookie-qa', email: 'qa@example.invalid' };
    const transport = vi.fn(async (url: string | URL | Request) => {
      const target = String(url);
      if (target.endsWith('/user')) return Response.json(user);
      const refresh = target.includes('grant_type=refresh_token');
      return Response.json({ access_token: refresh ? 'renewed-access' : 'expired-access', refresh_token: refresh ? 'renewed-refresh' : 'old-refresh', token_type: 'bearer', expires_in: refresh ? 3600 : -60, user });
    });
    vi.stubGlobal('fetch', transport);
    const set = vi.fn();
    const { supabase } = await import('./supabase');
    const cookieJar = { set } as unknown as AstroCookies;
    const loginClient = supabase(cookieJar, new Request('https://palmarghe.com/api/auth/'))!;
    await loginClient.auth.signInWithPassword({ email: 'qa@example.invalid', password: 'controlled-local-test' });
    const cookieHeader = set.mock.calls.map(([name, value]) => `${name}=${value}`).join('; ');
    set.mockClear();
    const renewedClient = supabase(cookieJar, new Request('https://palmarghe.com/account/', { headers: { cookie: cookieHeader } }))!;
    const result = await renewedClient.auth.getUser();
    expect(result.error).toBeNull();
    expect(result.data.user?.id).toBe(user.id);
    expect(transport.mock.calls.some(([url]) => String(url).includes('grant_type=refresh_token'))).toBe(true);
    expect(set).toHaveBeenCalled();
    for (const [, , options] of set.mock.calls) expect(options).toMatchObject({ httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
  });
});
