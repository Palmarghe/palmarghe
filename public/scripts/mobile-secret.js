(() => {
  const brand = document.querySelector('.site-header .brand');
  if (!brand) return;
  let taps = 0;
  let lastTap = 0;
  brand.addEventListener('click', (event) => {
    if (!matchMedia('(max-width: 900px) and (pointer: coarse)').matches || location.pathname !== '/') return;
    event.preventDefault();
    const now = Date.now();
    taps = now - lastTap < 900 ? taps + 1 : 1;
    lastTap = now;
    if (taps < 5) return;
    taps = 0;
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
