import { afterEach, expect, test, vi } from 'vitest';
import { serverReadFetch } from './server-read-fetch';
import { createClient } from '@supabase/supabase-js';

afterEach(() => vi.useRealTimers());
const url = 'https://example.supabase.co/rest/v1/content_items';

test('successful complete JSON reads preserve status, headers and body', async () => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(new Response('[{"id":"one"}]', { headers: { 'content-range': '0-0/1' } }));
  const result = await serverReadFetch(transport)(url);
  expect(await result.json()).toEqual([{ id: 'one' }]);
  expect(result.headers.get('content-range')).toBe('0-0/1');
});

test('bounds stalled headers even when transport ignores cancellation, without retry', async () => {
  vi.useFakeTimers();
  const transport = vi.fn<typeof fetch>(() => new Promise(() => {}));
  const result = serverReadFetch(transport, 100)(url);
  const assertion = expect(result).rejects.toMatchObject({ name: 'AbortError' });
  await vi.advanceTimersByTimeAsync(101);
  await assertion;
  expect(transport).toHaveBeenCalledTimes(1);
  expect(transport.mock.calls[0][1]?.signal?.aborted).toBe(true);
});

test('deadline includes stalled response body and propagates abort to its stream', async () => {
  vi.useFakeTimers();
  let signal: AbortSignal | null | undefined;
  const transport = vi.fn<typeof fetch>(async (_, init) => {
    signal = init?.signal;
    return new Response(new ReadableStream({ start(controller) {
      signal?.addEventListener('abort', () => controller.error(signal?.reason), { once: true });
    } }));
  });
  const result = serverReadFetch(transport, 100)(url);
  const assertion = expect(result).rejects.toMatchObject({ name: 'AbortError' });
  await vi.advanceTimersByTimeAsync(101);
  await assertion;
  expect(signal?.aborted).toBe(true);
});

test('caller cancellation is preserved', async () => {
  const caller = new AbortController();
  const transport = vi.fn<typeof fetch>(async (_, init) => new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
  }));
  const result = serverReadFetch(transport)(url, { signal: caller.signal });
  caller.abort(new DOMException('Cancelled', 'AbortError'));
  await expect(result).rejects.toMatchObject({ name: 'AbortError' });
});

test('already cancelled reads never start transport', async () => {
  const caller = new AbortController();
  caller.abort(new DOMException('Cancelled', 'AbortError'));
  const transport = vi.fn<typeof fetch>();
  await expect(serverReadFetch(transport)(url, { signal: caller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  expect(transport).not.toHaveBeenCalled();
});

test('real PostgREST client receives successful rows and bounded failures', async () => {
  vi.useFakeTimers();
  const transport = vi.fn<typeof fetch>()
    .mockResolvedValueOnce(new Response('[{"id":"one"}]', { headers: { 'content-type': 'application/json' } }))
    .mockImplementationOnce(() => new Promise(() => {}));
  const client = createClient('https://example.supabase.co', 'public-test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: serverReadFetch(transport, 100) },
  });
  expect((await client.from('content_items').select('id')).data).toEqual([{ id: 'one' }]);
  const read = Promise.resolve(client.from('content_items').select('id'));
  await vi.advanceTimersByTimeAsync(101);
  const failed = await read;
  expect(failed.data).toBeNull();
  expect(failed.error).not.toBeNull();
  expect(failed.error?.message).toContain('Database read deadline exceeded');
  expect(transport).toHaveBeenCalledTimes(2);
});

test.each([['POST', url], ['PATCH', url], ['DELETE', url], ['GET', 'https://example.supabase.co/auth/v1/user']])('leaves %s %s transport unchanged', async (method, target) => {
  const response = new Response('{}');
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const init = { method };
  expect(await serverReadFetch(transport)(target, init)).toBe(response);
  expect(transport).toHaveBeenCalledWith(target, init);
});
