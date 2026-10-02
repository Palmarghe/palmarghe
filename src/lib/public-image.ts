import localDimensions from './public-image-dimensions.json';

const optimizedImageVariants: Record<string, string> = {
  '/visuals/music/anatolian-sub-ritual.png': '/visuals/music/anatolian-sub-ritual.webp',
  '/visuals/music/anatolian-velocity.png': '/visuals/music/anatolian-velocity.webp',
  '/visuals/music/kara-yol.png': '/visuals/music/kara-yol.webp',
  '/visuals/music/sevenfold-thunder.png': '/visuals/music/sevenfold-thunder.webp',
};

const responsiveImageSets: Record<string, string> = {
  '/visuals/music/anatolian-sub-ritual.png': '/visuals/music/anatolian-sub-ritual',
  '/visuals/music/anatolian-velocity.png': '/visuals/music/anatolian-velocity',
  '/visuals/music/kara-yol.png': '/visuals/music/kara-yol',
  '/visuals/music/sevenfold-thunder.png': '/visuals/music/sevenfold-thunder',
};

/** Point public music artwork at its visually equivalent, smaller WebP rendition. */
export function publicImageUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const source = new URL(value, 'https://palmarghe.com');
    if (source.origin !== 'https://palmarghe.com') return value;

    const optimizedPath = optimizedImageVariants[source.pathname];
    if (!optimizedPath) return value;

    if (value.startsWith('/')) return `${optimizedPath}${source.search}${source.hash}`;
    source.pathname = optimizedPath;
    return source.href;
  } catch {
    return value;
  }
}

/** Return responsive candidates only for local assets with generated renditions. */
export function publicImageSrcSet(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const source = new URL(value, 'https://palmarghe.com');
    if (source.origin !== 'https://palmarghe.com') return undefined;
    if (/^\/visuals\/editorial-(ai|gaming|fm|lab)\.webp$/.test(source.pathname)) {
      const base = source.pathname.slice(0, -5);
      return `${base}-480.webp 480w, ${base}-768.webp 768w, ${base}-960.webp 960w, ${base}.webp 1440w`;
    }
    const base = responsiveImageSets[source.pathname];
    if (!base) return undefined;
    return `${base}-480.webp 480w, ${base}-960.webp 960w, ${base}.webp 1440w`;
  } catch {
    return undefined;
  }
}

export function mediaImageDimensions(value: { width?: unknown; height?: unknown } | null | undefined): { width: number; height: number } | undefined {
  const width = value?.width, height = value?.height;
  return typeof width === 'number' && typeof height === 'number' && Number.isSafeInteger(width) && Number.isSafeInteger(height) && width > 0 && height > 0
    ? { width, height } : undefined;
}

/** Measured local asset dimensions; external images never inherit same-path metadata. */
export function publicImageDimensions(value: string | null | undefined): { width: number; height: number } | undefined {
  if (!value) return undefined;
  try {
    const source = new URL(publicImageUrl(value) ?? value, 'https://palmarghe.com');
    if (source.origin !== 'https://palmarghe.com') return undefined;
    return (localDimensions as Record<string, { width: number; height: number }>)[source.pathname];
  } catch { return undefined; }
}
