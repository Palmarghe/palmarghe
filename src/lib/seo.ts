import { copy, pathFor, type Locale } from './site';

export const publicPageSlugs = ['', 'ai', 'gaming', 'fm', 'fm/fm26', 'lab', 'archive', 'about', 'contact', 'privacy', 'kvkk', 'collections', 'tags'] as const;

const descriptions: Record<string, { tr: string; en: string }> = {
  archive: { tr: 'Palmarghe yayın arşivi: yazıları, projeleri, FM modlarını ve dijital deneyleri tür, kategori ve yıla göre keşfet.', en: 'Explore the Palmarghe publication archive: articles, projects, FM mods and digital experiments by type, category and year.' },
  about: { tr: 'Palmarghe hakkında: yapay zekâ, oyunlar, Football Manager ve dijital üretim üzerine bağımsız yayın alanı.', en: 'About Palmarghe, an independent publication covering AI, games, Football Manager and digital making.' },
  contact: { tr: 'Palmarghe ile iletişime geç: sorularını, önerilerini ve iş birliği mesajlarını güvenli iletişim formundan ilet.', en: 'Contact Palmarghe with questions, suggestions and collaboration enquiries through the secure contact form.' },
  privacy: { tr: 'Palmarghe gizlilik politikası: kişisel verilerin işlenmesi ve web sitesinin veri uygulamaları hakkında bilgi.', en: 'Palmarghe privacy policy: information about personal data processing and the website’s data practices.' },
  kvkk: { tr: 'Palmarghe kişisel veri aydınlatma metni: veri işleme ve ilgili kişi hakları hakkında mevcut bilgilendirme.', en: 'Palmarghe personal data notice: existing information about data processing and data subject rights.' },
  collections: { tr: 'Palmarghe editoryal koleksiyonları: ortak bir bağlamda bir araya getirilen yayınları keşfet.', en: 'Explore Palmarghe editorial collections: publications brought together around a shared context.' },
  tags: { tr: 'Palmarghe konu etiketleri: ilgilendiğin başlıklarla bağlantılı yazılara ve çalışmalara ulaş.', en: 'Browse Palmarghe topic tags to find related articles and work.' },
  'fm/fm26': { tr: 'Football Manager 26 için Palmarghe yayınları, modları ve taktik çalışmalarını keşfet.', en: 'Explore Palmarghe publications, mods and tactical work for Football Manager 26.' },
  search: { tr: 'Palmarghe yayınlarında yazı, proje, FM modu ve dijital deney ara.', en: 'Search Palmarghe publications for articles, projects, FM mods and digital experiments.' },
  account: { tr: 'Palmarghe hesabına giriş yap, profilini ve kaydettiğin yayınları yönet.', en: 'Sign in to your Palmarghe account and manage your profile and saved publications.' },
};

export function pageDescription(locale: Locale, slug: string, title?: string) {
  return descriptions[slug]?.[locale] ?? (slug && title
    ? locale === 'tr' ? `${title}: Palmarghe üzerindeki ilgili yayınları ve çalışmaları keşfet.` : `${title}: explore related publications and work on Palmarghe.`
    : copy[locale].descriptor);
}

export interface CategoryPath { id: string; slug: string; parent_id: string | null; }
/** Include nested categories without looping on malformed category graphs. */
export function categoryDescendantIds(id: string, categories: CategoryPath[]): string[] {
  const ids = new Set([id]);
  for (const parent of ids) {
    for (const category of categories) if (category.parent_id === parent) ids.add(category.id);
  }
  return [...ids];
}
/** Inactive/missing ancestors and cycles do not yield public category URLs. */
export function categoryPath(category: CategoryPath, categories: CategoryPath[]): string | undefined {
  const parts: string[] = [], seen = new Set<string>();
  let current: CategoryPath | undefined = category;
  while (current) {
    if (seen.has(current.id)) return undefined;
    seen.add(current.id);
    parts.unshift(current.slug);
    if (!current.parent_id) return parts.join('/');
    current = categories.find(entry => entry.id === current!.parent_id);
  }
  return undefined;
}

export function indexableContentPath(item: { locale: Locale; slug: string; indexable?: boolean; canonical_override?: string | null }) {
  const path = pathFor(item.locale, item.slug);
  if (item.indexable === false || item.canonical_override && item.canonical_override !== new URL(path, 'https://palmarghe.com').href) return undefined;
  return path;
}

export function sitemapXml(paths: string[]) {
  const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map(path => `<url><loc>${escape(new URL(path, 'https://palmarghe.com').href)}</loc></url>`).join('')}</urlset>`;
}
