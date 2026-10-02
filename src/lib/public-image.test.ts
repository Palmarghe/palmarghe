import { describe, expect, it } from 'vitest';
import { mediaImageDimensions, publicImageDimensions, publicImageSrcSet, publicImageUrl } from './public-image';
import dimensions from './public-image-dimensions.json';
import sharp from 'sharp';

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

describe('image dimension reservation', () => {
  it('resolves measured portrait and optimized music sources without confusing external hosts', () => {
    expect(publicImageDimensions('/editorial/lamine-yamal.webp')).toEqual({ width: 655, height: 1000 });
    expect(publicImageDimensions('/visuals/music/kara-yol.png?x=1')).toEqual(dimensions['/visuals/music/kara-yol.webp']);
    expect(publicImageDimensions('https://other.example/editorial/lamine-yamal.webp')).toBeUndefined();
    expect(publicImageDimensions('/unknown.png')).toBeUndefined();
  });
  it('does not invent dimensions from absent or invalid media metadata', () => {
    for (const value of [null, {}, {width:0,height:20}, {width:20,height:-1}, {width:'20',height:30}, {width:1.5,height:30}, {width:Infinity,height:30}]) {
      expect(mediaImageDimensions(value)).toBeUndefined();
    }
    expect(mediaImageDimensions({ width:655,height:1000 })).toEqual({ width:655,height:1000 });
  });
  it('keeps the checked-in manifest equal to every original local asset', async () => {
    for (const [path, expected] of Object.entries(dimensions)) {
      const actual = await sharp(`public${path}`).metadata();
      expect({ width:actual.width,height:actual.height }, path).toEqual(expected);
    }
  });
});
