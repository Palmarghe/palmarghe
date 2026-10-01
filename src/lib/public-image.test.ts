import { describe, expect, it } from 'vitest';
import { publicImageUrl } from './public-image';

describe('publicImageUrl', () => {
  it('uses the optimized local WebP rendition for known music artwork', () => {
    expect(publicImageUrl('/visuals/music/anatolian-velocity.png')).toBe('/visuals/music/anatolian-velocity.webp');
    expect(publicImageUrl('https://palmarghe.com/visuals/music/kara-yol.png')).toBe('https://palmarghe.com/visuals/music/kara-yol.webp');
  });

  it('preserves query and fragment when selecting an optimized rendition', () => {
    expect(publicImageUrl('/visuals/music/kara-yol.png?width=1200#cover')).toBe('/visuals/music/kara-yol.webp?width=1200#cover');
  });

  it('keeps the original source for unknown or external media', () => {
    expect(publicImageUrl('/covers/cover.png')).toBe('/covers/cover.png');
    expect(publicImageUrl('https://images.example.test/cover.png')).toBe('https://images.example.test/cover.png');
  });
});
