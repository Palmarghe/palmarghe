import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'tr';
  const query = (url.searchParams.get('q') ?? '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().slice(0, 100);
  const type = url.searchParams.get('type') ?? '';
  const types = ['article', 'project', 'fm_mod', 'gallery', 'lab_entry'];
  if (query.length === 1) return Response.json({ results: [] }, { headers: { 'cache-control': 'no-store' } });
  const db = supabase(cookies, request);
  if (!db) return Response.json({ results: [] }, { headers: { 'cache-control': 'no-store' } });
  let search = db.from('content_items').select('id,title,slug,type,excerpt,published_at,cover_url,cover_media_id').eq('locale', locale).in('status', ['published', 'scheduled']).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(12);
  if (query) search = search.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
  if (types.includes(type)) search = search.eq('type', type);
  const { data, error } = await search;
  if (error) return Response.json({ results: [] }, { status: 503, headers: { 'cache-control': 'no-store' } });
  return Response.json({ results: data ?? [] }, { headers: { 'cache-control': 'no-store' } });
};
