import { beforeEach, expect, test, vi } from 'vitest';
import type { AstroCookies } from 'astro';
const { client } = vi.hoisted(() => ({ client: vi.fn() }));
vi.mock('./supabase', () => ({ supabase: client }));
import { published, publishedBySlug } from './content';
import { ContentUnavailable, contentUnavailableResponse } from './content-unavailable';
const cookies = {} as AstroCookies;
const request = new Request('https://palmarghe.com/archive/?type=project');
function result(data: unknown, error: unknown = null) {
  const chain: Record<string, unknown> = {};
  for (const name of ['select', 'eq', 'in', 'lte', 'order']) chain[name] = () => chain;
  chain.limit = async () => ({ data, error });
  client.mockReturnValue({ from: () => chain });
}
beforeEach(() => { client.mockReset(); });
test('actual empty reads still mean empty list or missing detail', async () => {
  result([]);
  expect(await published(cookies, request, 'tr')).toEqual([]);
  expect(await publishedBySlug(cookies, request, 'tr', 'missing')).toBeUndefined();
});
test('primary query failures do not become empty lists or false missing content', async () => {
  result(null, { code: 'SERVICE_FAILURE', message: 'private detail' });
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  await expect(published(cookies, request, 'tr')).rejects.toBeInstanceOf(ContentUnavailable);
  await expect(publishedBySlug(cookies, request, 'tr', 'existing')).rejects.toBeInstanceOf(ContentUnavailable);
  expect(log.mock.calls.flat().join(' ')).not.toContain('private detail');
  log.mockRestore();
});
test('recovery preserves GET filters, escapes URLs and refuses stale caching/indexing', async () => {
  const response = contentUnavailableResponse(new Request('https://palmarghe.com/en/archive/?q=%22&type=project&x=%3Cscript%3E'));
  expect(response.status).toBe(503);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('retry-after')).toBe('30');
  expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  const html = await response.text();
  expect(html).toContain('lang="en"');
  expect(html).toContain('/en/archive/?q=%22&amp;type=project&amp;x=%3Cscript%3E');
  expect(html).not.toContain('private detail');
  expect(html).not.toContain('http-equiv="refresh"');
});
test.each(['/sitemap.xml', '/rss.xml', '/api/search/'])('non-page %s gets service status without HTML', async path => {
  const response = contentUnavailableResponse(new Request('https://palmarghe.com' + path));
  expect(response.status).toBe(503);
  expect(response.headers.get('content-type')).toContain('text/plain');
  expect(await response.text()).not.toContain('<html');
});

test('a double-slash request cannot send retry to another origin', async () => {
  const response = contentUnavailableResponse(new Request('https://palmarghe.com//outside.example/path'));
  expect(await response.text()).toContain('href="https://palmarghe.com//outside.example/path"');
});
