(() => {
  const article = document.querySelector('.content-detail');
  if (!article) return;
  const path = location.pathname;
  const send = (event) => fetch('/api/engagement/', {
    method: 'POST', credentials: 'same-origin', keepalive: true,
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, event }),
  }).catch(() => {});
  send('read');
  fetch(`/api/engagement/?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' })
    .then((response) => response.ok ? response.json() : null)
    .then((metrics) => {
      if (!metrics) return;
      const meta = article.querySelector('.content-meta');
      if (!meta) return;
      const stat = document.createElement('span');
      stat.className = 'content-engagement';
      stat.textContent = `${metrics.reads} okunma · ${metrics.shares} paylaşım`;
      meta.append(stat);
    }).catch(() => {});
  document.querySelectorAll('.content-detail-footer a[href^="mailto:"]').forEach((link) => link.addEventListener('click', () => send('share'), { once: true }));
})();
