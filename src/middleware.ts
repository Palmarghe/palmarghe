import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase';
import { ContentUnavailable, contentUnavailableResponse } from './lib/content-unavailable';

export const onRequest = defineMiddleware(async (context, next) => {
  if (import.meta.env.PROD && context.url.hostname === 'www.palmarghe.com') {
    const canonical = new URL(context.url);
    canonical.hostname = 'palmarghe.com';
    return Response.redirect(canonical,301);
  }
  if (import.meta.env.PROD && context.url.hostname === 'palmarghe.com' && context.url.pathname.startsWith('/studio/')) {
    return Response.redirect(new URL(context.url.pathname + context.url.search, import.meta.env.STUDIO_URL || 'https://studio.palmarghe.com'), 302);
  }
  if (context.url.hostname === 'studio.palmarghe.com' && context.url.pathname === '/') return Response.redirect(new URL('/studio/', context.url),302);
  let original: Response;
  try { original = await next(); }
  catch (error) {
    if (!(error instanceof ContentUnavailable)) throw error;
    original = contentUnavailableResponse(context.request);
  }
  if (original.status === 404 && !context.url.pathname.startsWith('/api/')) {
    const db = supabase(context.cookies, context.request);
    if (db) {
      const { data } = await db.from('redirects').select('target_path,status_code').eq('source_path',context.url.pathname).single();
      if (data?.target_path?.startsWith('/') && !data.target_path.startsWith('//')) return Response.redirect(new URL(data.target_path, context.url), data.status_code === 302 ? 302 : 301);
    }
  }
  const response = new Response(original.body, original);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  const heroPreview=context.url.pathname==='/studio/preview/homepage/';
  response.headers.set('X-Frame-Options', heroPreview?'SAMEORIGIN':'DENY');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://*.supabase.co https://cloudflareinsights.com https://pagead2.googlesyndication.com; frame-src https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  if(context.url.pathname.startsWith('/studio/')){
    let policy=response.headers.get('Content-Security-Policy')!;
    policy=policy.replace('frame-src ','frame-src \'self\' ');
    if(heroPreview)policy=policy.replace("frame-ancestors 'none'","frame-ancestors 'self'");
    response.headers.set('Content-Security-Policy',policy);
  }
  // Published pages read editable Studio settings at request time; never serve an old HTML render after a save.
  if ((response.headers.get('Content-Type') ?? '').startsWith('text/html')) response.headers.set('Cache-Control', 'private, no-store');
  if (context.url.hostname !== 'localhost' && context.url.protocol === 'https:') response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  if (context.url.pathname.startsWith('/studio') || context.url.pathname.includes('/account') || context.url.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  if (import.meta.env.PROD && context.url.hostname !== 'palmarghe.com') response.headers.set('X-Robots-Tag','noindex, nofollow');
  return response;
});
