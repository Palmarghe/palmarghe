(() => {
  const path = location.pathname;
  if (!/^\/[a-z0-9/-]*$/.test(path) || !crypto?.randomUUID || navigator.webdriver || location.search.includes('verify=') || location.search.includes('e2e=')) return;
  const key = 'palmarghe_visitor_id';
  let visitor = localStorage.getItem(key);
  if (!visitor) { visitor = crypto.randomUUID(); localStorage.setItem(key, visitor); }
  fetch('/api/traffic/', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, visitor }), keepalive: true }).catch(() => {});
})();
