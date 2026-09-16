import type { APIRoute } from 'astro';
import { nav, pathFor } from '../lib/site';
import { published } from '../lib/content';
export const GET: APIRoute = async ({ cookies, request }) => {
  const paths = ['', ...nav.map((n) => n.slug), 'fm/fm26','about','contact','privacy'];
  const dynamic = [...await published(cookies, request, 'tr', 1000), ...await published(cookies, request, 'en', 1000)];
  const urls = [...(['tr','en'] as const).flatMap((locale) => paths.map((path) => pathFor(locale,path))), ...dynamic.filter((entry) => entry.indexable !== false).map((entry) => pathFor(entry.locale,entry.slug))];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `<url><loc>https://palmarghe.com${path}</loc></url>`).join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
