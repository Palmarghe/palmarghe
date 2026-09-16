export type Locale = 'tr' | 'en';
export const nav = [
  { slug: 'ai', tr: 'AI', en: 'AI' },
  { slug: 'gaming', tr: 'Gaming', en: 'Gaming' },
  { slug: 'fm', tr: 'FM', en: 'FM' },
  { slug: 'lab', tr: 'Lab', en: 'Lab' },
  { slug: 'archive', tr: 'Arşiv', en: 'Archive' },
] as const;
export const copy = {
  tr: {
    descriptor: 'Yapay zekâ, oyunlar, Football Manager ve dijital deneyler.',
    latest: 'Son yayınlar', selected: 'Seçilenler', explore: 'Keşfet', empty: 'Henüz yayın yok.',
    search: 'Ara', account: 'Hesap', about: 'Hakkında', contact: 'İletişim', privacy: 'Gizlilik',
    searchPlaceholder: 'İçerik ara', searchButton: 'Ara', noResults: 'Sonuç bulunamadı.',
    fm26: 'FM26', title: 'Dijital işler için bir yayın alanı.',
  },
  en: {
    descriptor: 'AI, games, Football Manager, and digital experiments.',
    latest: 'Latest entries', selected: 'Selected', explore: 'Explore', empty: 'Nothing published yet.',
    search: 'Search', account: 'Account', about: 'About', contact: 'Contact', privacy: 'Privacy',
    searchPlaceholder: 'Search content', searchButton: 'Search', noResults: 'No results found.',
    fm26: 'FM26', title: 'A space for digital work.',
  },
} as const;
export function pathFor(locale: Locale, slug = '') {
  return `/${locale === 'en' ? 'en/' : ''}${slug ? `${slug.replace(/^\/+|\/+$/g, '')}/` : ''}`;
}
export function parsePath(pathname: string): { locale: Locale; slug: string } {
  const bits = pathname.split('/').filter(Boolean);
  const locale = bits[0] === 'en' ? 'en' : 'tr';
  return { locale, slug: bits.slice(locale === 'en' ? 1 : 0).join('/') };
}
export function safeExternalUrl(value: string): boolean {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol); }
  catch { return false; }
}
