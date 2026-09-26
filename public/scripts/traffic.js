(() => {
  const path = location.pathname;
  if (!/^\/[a-z0-9/-]*$/.test(path) || !crypto?.randomUUID || navigator.webdriver || location.search.includes('verify=') || location.search.includes('e2e=')) return;
  const key = 'palmarghe_visitor_id';
  let visitor = localStorage.getItem(key);
  if (!visitor) { visitor = crypto.randomUUID(); localStorage.setItem(key, visitor); }
  const record = (eventPath) => fetch('/api/traffic/', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: eventPath, visitor }), keepalive: true }).catch(() => {});
  record(path);
  document.addEventListener('click', (event) => { const link = event.target.closest('[data-promotion-click]'); const placement = link?.getAttribute('data-promotion-click'); if (placement && ['header','article','footer'].includes(placement)) record(/ad/); });
})();
