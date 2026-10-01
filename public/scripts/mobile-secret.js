(() => {
  const brand = document.querySelector('.site-header .brand');
  if (!brand) return;
  brand.addEventListener('click', (event) => {
    if (!matchMedia('(max-width: 900px) and (pointer: coarse)').matches || location.pathname !== '/') return;
    const now = Date.now();
    let previous = {};
    try { previous = JSON.parse(sessionStorage.getItem('palmarghe-portal-taps') || '{}'); } catch {}
    const taps = now - (previous.time || 0) < 2500 ? (previous.count || 0) + 1 : 1;
    try { sessionStorage.setItem('palmarghe-portal-taps', JSON.stringify({ count: taps < 5 ? taps : 0, time: now })); } catch {}
    if (taps < 5) return;
    event.preventDefault();
    let dialog = document.querySelector('.mobile-secret');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'mobile-secret';
      dialog.setAttribute('aria-labelledby', 'secret-title');
      dialog.innerHTML = '<div class="secret-portal" aria-hidden="true"><span></span></div><h2 id="secret-title">Cep boyutunda bir evren.</h2><p>Palmarghe’nin gizli portalını buldun. Büyük fikirler bazen küçük ekranlarda başlar.</p><form method="dialog"><button class="button">Dünyaya dön</button></form>';
      document.body.append(dialog);
      dialog.addEventListener('close', () => brand.focus());
    }
    dialog.showModal();
  });
})();
