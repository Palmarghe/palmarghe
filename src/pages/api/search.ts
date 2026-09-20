import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'tr';
  const query = (url.searchParams.get('q') ?? '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().slice(0, 100);
  if (query.length < 2) return Response.json({ results: [] }, { headers: { 'cache-control': 'no-store' } });
  const db = supabase(cookies, request);
  if (!db) return Response.json({ results: [] }, { headers: { 'cache-control': 'no-store' } });
  const { data } = await db.from('content_items').select('id,title,slug,type,excerpt,published_at,cover_url,cover_media_id').eq('locale', locale).in('status', ['published', 'scheduled']).lte('published_at', new Date().toISOString()).or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`).order('published_at', { ascending: false }).limit(6);
  return Response.json({ results: data ?? [] }, { headers: { 'cache-control': 'no-store' } });
};
