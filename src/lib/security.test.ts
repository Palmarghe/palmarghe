import { describe, expect, it } from 'vitest';
import { sameOrigin } from './security';

describe('sameOrigin', () => {
  it('requires matching scheme, host and port', () => {
    expect(sameOrigin(new Request('https://palmarghe.com/api/', { headers: { origin: 'https://palmarghe.com' } }))).toBe(true);
    expect(sameOrigin(new Request('https://palmarghe.com/api/', { headers: { origin: 'http://palmarghe.com' } }))).toBe(false);
    expect(sameOrigin(new Request('http://127.0.0.1:4322/api/', { headers: { origin: 'http://127.0.0.1:4323' } }))).toBe(false);
  });
});
