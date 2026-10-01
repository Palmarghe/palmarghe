const optimizedImageVariants: Record<string, string> = {
  '/visuals/music/anatolian-sub-ritual.png': '/visuals/music/anatolian-sub-ritual.webp',
  '/visuals/music/anatolian-velocity.png': '/visuals/music/anatolian-velocity.webp',
  '/visuals/music/kara-yol.png': '/visuals/music/kara-yol.webp',
  '/visuals/music/sevenfold-thunder.png': '/visuals/music/sevenfold-thunder.webp',
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
