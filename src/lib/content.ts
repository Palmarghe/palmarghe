import type { AstroCookies } from 'astro';
import { supabase } from './supabase';
import type { Locale } from './site';

export interface ContentItem {
  id: string; locale: Locale; title: string; slug: string; excerpt: string | null;
  type: 'article' | 'project' | 'fm_mod' | 'gallery' | 'lab_entry';
  body: unknown; cover_url: string | null; published_at: string | null; featured: boolean;
  type_data: Record<string, unknown>;
  seo_title: string | null; seo_description: string | null; translation_group: string | null;
}

export async function published(cookies: AstroCookies, request: Request, locale: Locale, limit = 30): Promise<ContentItem[]> {
  const db = supabase(cookies, request);
  if (!db) return [];
  const { data, error } = await db.from('content_items').select('id,locale,title,slug,excerpt,type,body,type_data,cover_url,published_at,featured,seo_title,seo_description,translation_group').eq('locale', locale).in('status', ['published','scheduled']).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(limit);
  if (error) { console.error('Published content query failed:', error.code); return []; }
  return (data ?? []) as ContentItem[];
}
