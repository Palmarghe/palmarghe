import { beforeEach, expect, it, vi } from 'vitest';
const { rpc, createClient, secret } = vi.hoisted(() => {
  const rpc = vi.fn();
  return { rpc, createClient: vi.fn(() => ({ rpc })), secret: vi.fn((name: string): string | undefined => name === 'SUPABASE_SERVICE_ROLE_KEY' ? 'test-server-key' : 'test-pepper') };
});
vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('./supabase', () => ({ localTestRequest: () => false, supabase: vi.fn() }));
vi.mock('./runtime-secrets', () => ({ runtimeSecret: secret }));
import { measurementWriter } from './measurement';
beforeEach(() => {
  rpc.mockReset(); createClient.mockClear(); secret.mockClear();
  vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
  secret.mockImplementation(name => name === 'SUPABASE_SERVICE_ROLE_KEY' ? 'test-server-key' : 'test-pepper');
});
const request = () => new Request('https://palmarghe.com/api/traffic/', { headers: { 'cf-connecting-ip': '192.0.2.10' } });
it('uses a sessionless server client and a hashed, endpoint-scoped rate identity', async () => {
  rpc.mockResolvedValue({ data: true, error: null });
  const result = await measurementWriter({} as never, request(), 'traffic');
  expect(result.status).toBe(200);
  expect(createClient).toHaveBeenCalledWith('https://test.supabase.co', 'test-server-key', { auth: { persistSession: false, autoRefreshToken: false } });
  expect(rpc).toHaveBeenCalledWith('allow_auth_attempt', { p_key_hash: expect.stringMatching(/^[a-f0-9]{64}$/), p_max: 30, p_window_seconds: 60 });
  expect(JSON.stringify(rpc.mock.calls)).not.toContain('192.0.2.10');
  const firstHash = rpc.mock.calls[0][1].p_key_hash;
  await measurementWriter({} as never, request(), 'engagement');
  expect(rpc.mock.calls[1][1].p_key_hash).not.toBe(firstHash);
});
it('fails closed when rate allowance is exhausted', async () => {
  rpc.mockResolvedValue({ data: false, error: null });
  expect((await measurementWriter({} as never, request(), 'traffic')).status).toBe(429);
});
it('fails closed when the rate database is unavailable', async () => {
  rpc.mockResolvedValue({ data: null, error: { message: 'offline' } });
  expect((await measurementWriter({} as never, request(), 'traffic')).status).toBe(503);
});
it('does not create a client when its private configuration is missing', async () => {
  secret.mockReturnValue(undefined);
  const result = await measurementWriter({} as never, request(), 'traffic');
  expect(result.status).toBe(503);
  expect(result.db).toBeNull();
  expect(createClient).not.toHaveBeenCalled();
});
