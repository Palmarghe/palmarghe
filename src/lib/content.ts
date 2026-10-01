import type { AstroCookies } from 'astro';
import { supabase } from './supabase';
import type { Locale } from './site';

export interface ContentItem {
  id: string; author_id: string | null; locale: Locale; title: string; slug: string; excerpt: string | null;
  type: 'article' | 'project' | 'fm_mod' | 'gallery' | 'lab_entry';
  body: unknown; cover_url: string | null; cover_media_id: string | null; published_at: string | null; featured: boolean;
  type_data: Record<string, unknown>;
  seo_title: string | null; seo_description: string | null; canonical_override: string | null; og_media_id: string | null; translation_group: string | null; indexable: boolean;
}

export async function publishedBySlug(cookies: AstroCookies, request: Request, locale: Locale, slug: string): Promise<ContentItem | undefined> {
  const db = supabase(cookies, request);
  if (!db) return undefined;
  const { data, error } = await db.from('content_items').select('*').eq('locale', locale).eq('slug', slug).in('status', ['published', 'scheduled']).lte('published_at', new Date().toISOString()).limit(1);
  if (error) { console.error('Published detail query failed:', error.code); return undefined; }
  return data?.[0] as ContentItem | undefined;
}

export async function published(cookies: AstroCookies, request: Request, locale: Locale, limit = 30): Promise<ContentItem[]> {
  const db = supabase(cookies, request);
  if (!db) return [];
  const { data, error } = await db.from('content_items').select('id,author_id,locale,title,slug,excerpt,type,body,type_data,cover_url,cover_media_id,published_at,featured,indexable,seo_title,seo_description,canonical_override,og_media_id,translation_group').eq('locale', locale).in('status', ['published','scheduled']).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(limit);
  if (error) { console.error('Published content query failed:', error.code); return []; }
  return (data ?? []) as ContentItem[];
}
