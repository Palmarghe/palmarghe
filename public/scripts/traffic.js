(() => {
  const path = location.pathname;
  if (path.startsWith('/studio/')) return;
  if (!/^\/[a-z0-9/-]*$/.test(path) || !crypto?.randomUUID || navigator.webdriver || location.search.includes('verify=') || location.search.includes('e2e=')) return;
  if (document.documentElement.dataset.trafficInstalled) return;
  document.documentElement.dataset.trafficInstalled = 'true';
  const key = 'palmarghe_visitor_id';
  let visitor;
  try { visitor = localStorage.getItem(key); } catch {}
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitor || '')) {
    visitor = crypto.randomUUID();
    try { localStorage.setItem(key, visitor); } catch {}
  }
  const sessionKey = 'palmarghe_acquisition';
  const sessionLifetime = 30 * 60 * 1000;
  const sources = ['organic_search', 'referral', 'direct'];
  const searchHosts = ['google.com', 'google.com.tr', 'google.co.uk', 'google.de', 'google.fr', 'bing.com', 'duckduckgo.com', 'yandex.com', 'yandex.ru', 'baidu.com', 'search.yahoo.com'];
  let source = 'direct';
  let externalEntry = false;
  try {
    const referrer = new URL(document.referrer);
    if (['http:', 'https:'].includes(referrer.protocol) && !['palmarghe.com', 'studio.palmarghe.com', location.hostname].includes(referrer.hostname)) {
      externalEntry = true;
      source = searchHosts.some(host => referrer.hostname === host || referrer.hostname.endsWith(`.${host}`)) ? 'organic_search' : 'referral';
    }
  } catch {}
  try {
    const saved = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
    if (!externalEntry && sources.includes(saved?.source) && Date.now() - saved.at >= 0 && Date.now() - saved.at < sessionLifetime) source = saved.source;
    sessionStorage.setItem(sessionKey, JSON.stringify({ source, at: Date.now() }));
  } catch {}
  const record = (eventPath) => fetch('/api/traffic/', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: eventPath, visitor, source }), keepalive: true }).catch(() => {});
  record(path);
  document.addEventListener('click', (event) => { const link = event.target instanceof Element ? event.target.closest('[data-promotion-click]') : null; const placement = link?.getAttribute('data-promotion-click'); if (placement && ['header','article','footer'].includes(placement)) record(`/ad/${placement}/`); });
})();
