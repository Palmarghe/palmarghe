import type { APIRoute } from 'astro';
import { published } from '../../lib/content';
import { pathFor } from '../../lib/site';
const escape = (text: string) => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const GET: APIRoute = async ({ cookies, request }) => {
  const items = await published(cookies,request,'en',50);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Palmarghe</title><link>https://palmarghe.com/en/</link><description>Digital journal</description>${items.map((entry) => `<item><title>${escape(entry.title)}</title><link>https://palmarghe.com${pathFor('en',entry.slug)}</link><guid>https://palmarghe.com${pathFor('en',entry.slug)}</guid><description>${escape(entry.excerpt ?? '')}</description></item>`).join('')}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
