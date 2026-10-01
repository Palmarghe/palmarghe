import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn(async () => ({ error: null })) }));
vi.mock('./supabase', () => ({ supabase: () => ({ rpc }) }));
import { POST as trafficPost } from '../pages/api/traffic';
import { POST as engagementPost } from '../pages/api/engagement';

const visitor = '11111111-1111-4111-8111-111111111111';
const trafficScript = readFileSync(new URL('../../public/scripts/traffic.js', import.meta.url), 'utf8');
const engagementScript = readFileSync(new URL('../../public/scripts/engagement.js', import.meta.url), 'utf8');
function client(referrer = '', options: { automated?: boolean; blockedStorage?: boolean; savedSource?: string; savedAt?: number } = {}) {
  const events: Record<string, (event: unknown) => void> = {};
  const requests: { url: string; body?: string }[] = [];
  const storage = new Map<string, string>();
  if (options.savedSource) storage.set('palmarghe_acquisition', JSON.stringify({ source: options.savedSource, at: options.savedAt ?? Date.now() }));
  const adapter = {
    getItem: (key: string) => { if (options.blockedStorage) throw Error('blocked'); return storage.get(key) ?? null; },
    setItem: (key: string, value: string) => { if (options.blockedStorage) throw Error('blocked'); storage.set(key, value); },
  };
  class Element {
    constructor(public placement: string) {}
    closest() { return this; }
    getAttribute() { return this.placement; }
  }
  const context = {
    Element, URL, Date, crypto: { randomUUID: () => visitor },
    navigator: { webdriver: options.automated ?? false, userAgent: 'Chrome' },
    location: { pathname: '/', search: '', hostname: 'palmarghe.com' },
    localStorage: adapter, sessionStorage: adapter,
    document: {
      referrer, documentElement: { dataset: {} },
      addEventListener: (name: string, handler: (event: unknown) => void) => { events[name] = handler; },
      querySelector: () => ({}), querySelectorAll: () => [],
    },
    fetch: async (url: string, init?: { body?: string }) => { requests.push({ url, body: init?.body }); return { ok: false }; },
  };
  return { context, requests, storage, click: (placement: string) => events.click?.({ target: new Element(placement) }) };
}
describe('privacy-minimized measurement scripts', () => {
  it.each([
    ['https://www.google.com/search?q=private-query', 'organic_search'],
    ['https://www.google.com.tr/search?q=private-query', 'organic_search'],
    ['https://www.bing.com/search?q=private-query', 'organic_search'],
    ['https://google.com.evil.example/', 'referral'],
    ['https://example.com/private/path', 'referral'],
    ['https://palmarghe.com/music/', 'direct'],
    ['https://studio.palmarghe.com/studio/', 'direct'],
    ['', 'direct'],
  ])('classifies entry %s without transmitting its URL', (referrer, expected) => {
    const harness = client(referrer);
    runInNewContext(trafficScript, harness.context);
    expect(harness.requests).toHaveLength(1);
    expect(JSON.parse(harness.requests[0].body!)).toEqual({ path: '/', visitor, source: expected });
    expect(harness.requests[0].body).not.toContain('private');
  });
  it('preserves the coarse source during internal navigation and expires inactive sessions', () => {
    for (const [savedAt, expected] of [[Date.now(), 'organic_search'], [Date.now() - 31 * 60 * 1000, 'direct']] as const) {
      const harness = client('https://palmarghe.com/music/', { savedSource: 'organic_search', savedAt });
      runInNewContext(trafficScript, harness.context);
      expect(JSON.parse(harness.requests[0].body!).source).toBe(expected);
    }
  });
  it('records all three ad placements as valid string paths, once per script installation', () => {
    const harness = client();
    runInNewContext(trafficScript, harness.context);
    runInNewContext(trafficScript, harness.context);
    ['header', 'article', 'footer'].forEach(harness.click);
    expect(harness.requests.map(request => JSON.parse(request.body!).path)).toEqual(['/', '/ad/header/', '/ad/article/', '/ad/footer/']);
  });
  it('handles blocked storage without breaking page behavior', () => {
    const harness = client('', { blockedStorage: true });
    expect(() => runInNewContext(trafficScript, harness.context)).not.toThrow();
    expect(harness.requests).toHaveLength(1);
  });
  it('does not write traffic or engagement for automated browsers', () => {
    const harness = client('', { automated: true });
    runInNewContext(trafficScript, harness.context);
    runInNewContext(engagementScript, harness.context);
    expect(harness.requests.filter(request => request.body)).toEqual([]);
  });
});

async function post(handler: typeof trafficPost, body: object, userAgent = 'Chrome', origin = 'https://palmarghe.com') {
  const request = new Request('https://palmarghe.com/api/traffic/', { method: 'POST', headers: { origin, 'user-agent': userAgent, 'content-type': 'application/json', referer: 'https://palmarghe.com/' }, body: JSON.stringify(body) });
  return handler({ request, cookies: {} } as Parameters<typeof trafficPost>[0]);
}
describe('measurement endpoint boundary', () => {
  beforeEach(() => rpc.mockClear());
  it('forwards validated entry source rather than classifying the same-site API referrer', async () => {
    expect((await post(trafficPost, { path: '/', visitor, source: 'organic_search' })).status).toBe(204);
    expect(rpc).toHaveBeenCalledWith('record_qualified_traffic_visit', { p_path: '/', p_visitor_id: visitor, p_source: 'organic_search' });
  });
  it('keeps legacy clients compatible with a conservative direct source', async () => {
    expect((await post(trafficPost, { path: '/', visitor })).status).toBe(204);
    expect(rpc).toHaveBeenCalledWith('record_qualified_traffic_visit', { p_path: '/', p_visitor_id: visitor, p_source: 'direct' });
  });
  it('rejects invalid sources, paths and cross-origin writes before RPC', async () => {
    expect((await post(trafficPost, { path: '/', visitor, source: 'certified-human' })).status).toBe(400);
    expect((await post(trafficPost, { path: {}, visitor })).status).toBe(400);
    expect((await post(trafficPost, { path: '/', visitor }, 'Chrome', 'https://evil.example')).status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });
  it('excludes known bot clients from both writing endpoints', async () => {
    expect((await post(trafficPost, { path: '/', visitor }, 'HeadlessChrome')).status).toBe(204);
    expect((await post(engagementPost, { path: '/article/', event: 'read' }, 'Lighthouse')).status).toBe(204);
    expect(rpc).not.toHaveBeenCalled();
  });
});
