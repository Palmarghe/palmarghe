import { describe, expect, it } from 'vitest';
import { parsePath, pathFor, safeExternalUrl } from './site';
describe('localized paths', () => {
  it('keeps Turkish at the root', () => expect(pathFor('tr','fm/fm26')).toBe('/fm/fm26/'));
  it('parses English routes', () => expect(parsePath('/en/fm/fm26/')).toEqual({ locale: 'en', slug: 'fm/fm26' }));
  it('rejects script URLs', () => expect(safeExternalUrl('javascript:alert(1)')).toBe(false));
  it('requires HTTPS for external links', () => {
    expect(safeExternalUrl('https://example.com/download')).toBe(true);
    expect(safeExternalUrl('http://example.com/download')).toBe(false);
  });
});
