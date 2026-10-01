import type { APIRoute } from 'astro';
import { pathFor } from '../lib/site';
import { categoryPath, indexableContentPath, publicPageSlugs, sitemapXml, type CategoryPath } from '../lib/seo';
import { published } from '../lib/content';
import { supabase } from '../lib/supabase';
export const GET: APIRoute = async ({ cookies, request }) => {
  const dynamic = [...await published(cookies, request, 'tr', 1000), ...await published(cookies, request, 'en', 1000)];
  const db = supabase(cookies, request);
  const [{ data: tags }, { data: categories }, { data: collections }] = db ? await Promise.all([
    db.from('tags').select('slug').limit(200),
    db.from('categories').select('id,slug,parent_id').eq('active',true).limit(100),
    db.from('editorial_collections').select('slug,locale').eq('published',true).limit(100),
  ]) : [{ data: null }, { data: null }, { data: null }];
  const taxonomyPaths = (categories ?? []).map((category: CategoryPath) => categoryPath(category, categories ?? [])).filter((path: string | undefined): path is string => Boolean(path));
  const urls = [...(['tr','en'] as const).flatMap(locale => [...publicPageSlugs, ...taxonomyPaths, ...(tags ?? []).map((tag:{slug:string}) => `tags/${tag.slug}`)].map(path => pathFor(locale,path))), ...dynamic.map(indexableContentPath).filter((path):path is string => Boolean(path)), ...(collections ?? []).map((entry:{slug:string;locale:'tr'|'en'}) => pathFor(entry.locale,`collections/${entry.slug}`))];
  const xml = sitemapXml(urls);
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
