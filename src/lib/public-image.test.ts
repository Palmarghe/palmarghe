import { describe, expect, it } from 'vitest';
import { publicImageSrcSet, publicImageUrl } from './public-image';

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

  it('provides responsive candidates only when matching renditions exist', () => {
    expect(publicImageSrcSet('/visuals/music/anatolian-sub-ritual.png')).toBe('/visuals/music/anatolian-sub-ritual-480.webp 480w, /visuals/music/anatolian-sub-ritual-960.webp 960w, /visuals/music/anatolian-sub-ritual.webp 1440w');
    expect(publicImageSrcSet('/covers/cover.png')).toBeUndefined();
    expect(publicImageSrcSet('https://images.example.test/cover.png')).toBeUndefined();
  });
});
