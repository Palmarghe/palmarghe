(() => {
  const article = document.querySelector('.content-detail');
  if (!article) return;
  if (document.documentElement.dataset.engagementInstalled) return;
  document.documentElement.dataset.engagementInstalled = 'true';
  const path = location.pathname;
  const automated = navigator.webdriver || /bot\b|crawler|spider|slurp|headless|lighthouse|pagespeed|preview|prerender/i.test(navigator.userAgent) || /[?&](verify|e2e)=/.test(location.search);
  const send = (event) => automated ? Promise.resolve() : fetch('/api/engagement/', {
    method: 'POST', credentials: 'same-origin', keepalive: true,
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, event }),
  }).catch(() => {});
  send('read');
  const stat = article.querySelector('[data-content-engagement]');
  const english = document.documentElement.lang === 'en';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  if (stat) { stat.textContent = english ? 'Loading readership…' : 'Okunma bilgisi yükleniyor…'; stat.setAttribute('aria-busy', 'true'); }
  fetch(`/api/engagement/?path=${encodeURIComponent(path)}`, { credentials: 'same-origin', signal: controller.signal })
    .then((response) => response.ok ? response.json() : null)
    .then((metrics) => {
      if (!stat) return;
      if (!metrics || !Number.isSafeInteger(metrics.reads) || !Number.isSafeInteger(metrics.shares) || metrics.reads < 0 || metrics.shares < 0) throw new Error('Invalid readership');
      const format = new Intl.NumberFormat(english ? 'en' : 'tr');
      stat.textContent = english ? `${format.format(metrics.reads)} reads · ${format.format(metrics.shares)} shares` : `${format.format(metrics.reads)} okunma · ${format.format(metrics.shares)} paylaşım`;
    }).catch(() => { if (stat) stat.textContent = english ? 'Readership unavailable' : 'Okunma bilgisi alınamadı'; })
    .finally(() => { clearTimeout(timeout); if (stat) stat.removeAttribute('aria-busy'); });
  document.querySelectorAll('.content-detail-footer a[href^="mailto:"]').forEach((link) => link.addEventListener('click', () => send('share'), { once: true }));
})();
