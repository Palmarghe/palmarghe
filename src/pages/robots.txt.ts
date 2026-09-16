import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ url }) => new Response(`User-agent: *\n${url.hostname === 'palmarghe.com' ? 'Allow: /' : 'Disallow: /'}\nDisallow: /studio/\nDisallow: /account/\nDisallow: /en/account/\nDisallow: /api/\nSitemap: https://palmarghe.com/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
