export class ContentUnavailable extends Error {
  constructor() { super('Published content unavailable'); this.name = 'ContentUnavailable'; }
}

const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));

/** A database-independent recovery page: no private errors, identities or service calls. */
export function contentUnavailableResponse(request: Request): Response {
  const url = new URL(request.url);
  const en = url.pathname === '/en' || url.pathname.startsWith('/en/');
  const title = en ? 'A brief pause' : 'Kısa bir ara';
  const message = en ? 'Publications could not be loaded. Your requested page is still here; please try again shortly.' : 'Yayınlar şu anda yüklenemedi. İstediğin sayfa kaybolmadı; biraz sonra yeniden deneyebilirsin.';
  const headers = { 'cache-control': 'private, no-store', 'retry-after': '30', 'x-robots-tag': 'noindex, nofollow' };
  if (/\.(?:xml|json)$/.test(url.pathname) || url.pathname.startsWith('/api/')) return new Response(message, { status: 503, headers: { ...headers, 'content-type': 'text/plain; charset=utf-8' } });
  // A double-slash path must not become a protocol-relative link to another host.
  const retry = escape((url.pathname.startsWith('//') ? url.origin : '') + url.pathname + url.search);
  return new Response(`<!doctype html><html lang="${en ? 'en' : 'tr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#0B0B0D"><title>${title} — Palmarghe</title><link rel="icon" href="/favicon.svg"><style>
  @font-face{font-family:Manrope;src:url('/fonts/manrope-latin.woff2') format('woff2');font-display:swap}
  *{box-sizing:border-box}body{--bg:#0b0b0d;--surface:#141417;--text:#f3f1ea;--muted:#b4b4bb;--accent:#ac8aff;--border:#36343c;margin:0;background:var(--bg);color:var(--text);font:16px/1.6 Manrope,Arial,sans-serif}
  body[data-theme=light]{--bg:#f5f2ee;--surface:#fffdfa;--text:#201d27;--muted:#625c6c;--accent:#6741a5;--border:#d4ccd9}body[data-theme=aurora]{--bg:#10262a;--surface:#19343a;--text:#f5f1e8;--muted:#b6c9c6;--accent:#ffbe98;--border:#426365}
  header,main,footer{width:min(100% - 40px,960px);margin-inline:auto}header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:24px;border-bottom:1px solid var(--border)}a{color:inherit}header a{font-size:13px;letter-spacing:.18em;text-decoration:none;font-weight:700}button{font:inherit;min-width:44px;min-height:44px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:6px;cursor:pointer}main{padding-block:clamp(48px,12vh,120px)}section{max-width:640px;border:1px solid var(--border);border-radius:12px;background:var(--surface);padding:clamp(24px,5vw,48px)}small{color:var(--accent);letter-spacing:.18em}h1{font-size:clamp(32px,6vw,52px);line-height:1.15;letter-spacing:-.04em;font-weight:500;margin:20px 0}p{color:var(--muted);max-width:52ch}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.actions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 18px;border:1px solid var(--border);border-radius:6px;text-decoration:none}.actions a:first-child{background:var(--text);color:var(--bg)}:focus-visible{outline:2px solid var(--accent);outline-offset:4px}footer{padding-bottom:24px;color:var(--muted);font-size:12px}.aurora-notice{position:fixed;bottom:20px;left:20px;right:20px;padding:16px;background:var(--surface);border:1px solid var(--border)}
  </style></head><body><header><a href="${en ? '/en/' : '/'}">PALMARGHE</a><button type="button" data-theme-toggle aria-label="${en ? 'Enable light mode' : 'Açık modu aç'}">◐</button></header><main id="main"><section aria-labelledby="recovery-title"><small>503 / PALMARGHE</small><h1 id="recovery-title">${title}</h1><p>${message}</p><div class="actions"><a href="${retry}">${en ? 'Try again' : 'Yeniden dene'}</a><a href="${en ? '/en/' : '/'}">${en ? 'Home' : 'Ana sayfa'}</a></div></section></main><footer>${en ? 'No automatic refresh. You decide when to retry.' : 'Otomatik yenileme yok. Yeniden denemeye sen karar ver.'}</footer><script src="/scripts/theme-toggle.js" defer></script></body></html>`, { status: 503, headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } });
}
