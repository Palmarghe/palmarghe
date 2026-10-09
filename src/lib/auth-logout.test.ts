import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const state = vi.hoisted(() => ({ client: null as SupabaseClient | null }));
vi.mock('./supabase', () => ({ supabase: () => state.client, localTestRequest: () => true }));
vi.mock('./local-adapter', () => ({ localAuthAllowed: () => true }));
vi.mock('./runtime-secrets', () => ({ runtimeSecret: () => undefined }));
import { POST } from '../pages/api/auth';

// Real SDK clients with isolated storage and a controlled Auth service; no production credentials.
const user = { id: '00000000-0000-4000-8000-000000000099', aud: 'authenticated', role: 'authenticated', email: 'logout-qa@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-10-09T00:00:00Z' };
const revoked = new Set<string>();
const scopes: string[] = [];
const clients: SupabaseClient[] = [];
let failLogout = false;
const token = (id: string) => [
  Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ sub: user.id, session_id: id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'),
  Buffer.from('controlled-test-signature').toString('base64url'),
].join('.');
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const transport: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  const url = new URL(request.url);
  if (url.pathname.endsWith('/user')) return json(user);
  if (url.pathname.endsWith('/logout')) {
    const scope = url.searchParams.get('scope') ?? 'global';
    scopes.push(scope);
    if (failLogout) return json({ msg: 'Controlled unavailable service' }, 503);
    const jwt = request.headers.get('authorization')!.replace('Bearer ', '');
    const id = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString()).session_id;
    if (scope === 'local') revoked.add(id);
    else for (const session of ['a', 'b', 'c']) revoked.add(session);
    return new Response(null, { status: 204 });
  }
  if (url.pathname.endsWith('/token')) {
    const { refresh_token: id } = await request.json();
    if (revoked.has(id)) return json({ error_code: 'refresh_token_not_found', msg: 'Controlled revoked refresh token' }, 400);
    return json({ access_token: token(id), refresh_token: id, token_type: 'bearer', expires_in: 3600, user });
  }
  throw new Error(`Unexpected controlled Auth endpoint: ${url.pathname}`);
};

async function session(id: string) {
  const values = new Map<string, string>();
  const client = createClient('https://controlled-auth.example.invalid', 'controlled-test-anon', {
    global: { fetch: transport },
    auth: { autoRefreshToken: false, detectSessionInUrl: false, storageKey: `logout-${id}`, storage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); },
      removeItem: key => { values.delete(key); },
    } },
  });
  clients.push(client);
  expect((await client.auth.setSession({ access_token: token(id), refresh_token: id })).error).toBeNull();
  return client;
}
async function logout(action = 'logout', locale = 'tr', origin = 'https://studio.palmarghe.com') {
  const request = new Request('https://studio.palmarghe.com/api/auth/', { method: 'POST', headers: { Origin: origin }, body: new URLSearchParams({ action, locale }) });
  return POST({ request, cookies: {} } as Parameters<typeof POST>[0]);
}

describe('account logout scope with real SDK transport', () => {
  beforeEach(() => { revoked.clear(); scopes.length = 0; failLogout = false; });
  afterEach(() => { for (const client of clients.splice(0)) client.auth.stopAutoRefresh(); state.client = null; });
  it('ordinary logout clears this session and preserves another device refresh; explicit all-session logout revokes it', async () => {
    state.client = await session('a');
    const otherDevice = await session('b');
    expect((await logout()).status).toBe(303);
    expect((await state.client.auth.getSession()).data.session).toBeNull();
    expect((await otherDevice.auth.refreshSession()).error).toBeNull();
    expect(scopes).toEqual(['local']);
    state.client = await session('c');
    expect((await logout('logout_all')).status).toBe(303);
    expect((await otherDevice.auth.refreshSession()).error).not.toBeNull();
    expect(scopes).toEqual(['local', 'global']);
  });
  it.each(['logout', 'logout_all'])('failed %s revocation clears current storage per SDK behavior but communicates uncertainty and leaves the other device valid', async action => {
    state.client = await session('a');
    const otherDevice = await session('b');
    failLogout = true;
    const failed = await logout(action);
    expect(failed.status).toBe(303);
    expect(failed.headers.get('location')).toBe('https://studio.palmarghe.com/account/?notice=logout_unconfirmed');
    expect((await state.client.auth.getSession()).data.session).toBeNull();
    expect((await otherDevice.auth.refreshSession()).error).toBeNull();
    expect(scopes).toEqual([action === 'logout_all' ? 'global' : 'local']);
  });
  it('preserves localized same-host destination and refuses foreign origins before Auth', async () => {
    state.client = await session('a');
    expect((await logout('logout', 'en', 'https://untrusted.example.invalid')).status).toBe(403);
    expect(scopes).toEqual([]);
    expect((await logout('logout', 'en')).headers.get('location')).toBe('https://studio.palmarghe.com/en/account/');
  });
});
