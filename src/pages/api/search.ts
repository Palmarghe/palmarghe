import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { publicImageSrcSet, publicImageUrl } from '../../lib/public-image';
import {categoryDescendantIds} from '../../lib/seo';

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'tr';
  const query = (url.searchParams.get('q') ?? '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().slice(0, 100);
  const type = url.searchParams.get('type') ?? '';
  const category=url.searchParams.get('category')??'';
  const types = ['article', 'project', 'fm_mod', 'gallery', 'lab_entry'];
  if (query.length === 1) return Response.json({ results: [] }, { headers: { 'cache-control': 'no-store' } });
  const db = supabase(cookies, request);
  if (!db) return Response.json({ results: [] }, { headers: { 'cache-control': 'no-store' } });
  const {data:categories,error:categoryError}=await db.from('categories').select('id,parent_id,name_tr,name_en,slug').eq('active',true).order('sort_order').limit(100);
  if(categoryError)return Response.json({results:[]},{status:503,headers:{'cache-control':'no-store'}});
  const chosen=categories?.find((c:{id:string;slug:string})=>c.id===category||c.slug===category);
  if(category&&!chosen)return Response.json({results:[],categories:categories??[]},{headers:{'cache-control':'no-store'}});
  let ids:string[]|null=null;
  if(chosen){const {data:links,error}=await db.from('content_categories').select('content_id').in('category_id',categoryDescendantIds(chosen.id,categories??[]));if(error)return Response.json({results:[]},{status:503,headers:{'cache-control':'no-store'}});ids=[...new Set<string>((links??[]).map((row:{content_id:string})=>row.content_id))];}
  let search = db.from('content_items').select('id,title,slug,type,excerpt,published_at,cover_url,cover_media_id').eq('locale', locale).in('status', ['published', 'scheduled']).lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(12);
  if (query) search = search.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
  if (types.includes(type)) search = search.eq('type', type);
  if(ids?.length)search=search.in('id',ids);
  const { data, error } = ids?.length===0?{data:[],error:null}:await search;
  if (error) return Response.json({ results: [] }, { status: 503, headers: { 'cache-control': 'no-store' } });
  let suggestions:typeof data=[];
  if(query&&!data?.length&&ids?.length!==0){let fallback=db.from('content_items').select('id,title,slug,type,excerpt,published_at,cover_url,cover_media_id').eq('locale',locale).in('status',['published','scheduled']).lte('published_at',new Date().toISOString()).order('published_at',{ascending:false}).limit(3);if(types.includes(type))fallback=fallback.eq('type',type);if(ids?.length)fallback=fallback.in('id',ids);const result=await fallback;if(!result.error)suggestions=result.data;}
  const image=(entry: { cover_url: string | null; [key: string]: unknown })=>({ ...entry, cover_url: publicImageUrl(entry.cover_url) ?? null, cover_srcset: publicImageSrcSet(entry.cover_url) });
  return Response.json({ results: (data ?? []).map(image),suggestions:(suggestions??[]).map(image),categories:categories??[] }, { headers: { 'cache-control': 'no-store' } });
};
