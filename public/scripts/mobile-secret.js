(() => {
  const brand = document.querySelector('.site-header .brand');
  if (!brand) return;
  let taps = 0;
  let lastTap = 0;
  let homeTimer;
  brand.addEventListener('click', (event) => {
    if (!matchMedia('(max-width: 900px) and (pointer: coarse)').matches || location.pathname !== '/') return;
    const now = Date.now();
    taps = now - lastTap < 600 ? taps + 1 : 1;
    lastTap = now;
    event.preventDefault();
    clearTimeout(homeTimer);
    if (taps < 5) {
      homeTimer = setTimeout(() => { location.href = brand.href; }, 450);
      return;
    }
    taps = 0;
    let dialog = document.querySelector('.mobile-secret');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'mobile-secret';
      dialog.setAttribute('aria-labelledby', 'secret-title');
      dialog.innerHTML = '<div class="secret-portal" aria-hidden="true"><span></span></div><h2 id="secret-title">Cep boyutunda bir evren.</h2><p>Palmarghe’nin gizli portalını buldun. Büyük fikirler bazen küçük ekranlarda başlar.</p><form method="dialog"><button class="button">Dünyaya dön</button></form>';
      document.body.append(dialog);
      dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('secret-modal-open');
        brand.focus();
      });
      dialog.addEventListener('keydown', event => {
        if (event.key === 'Tab') { event.preventDefault(); dialog.querySelector('button').focus(); }
      });
      let backdropPress = false;
      const outside = event => {
        const bounds = dialog.getBoundingClientRect();
        return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
      };
      dialog.addEventListener('pointerdown', event => { backdropPress = outside(event); });
      dialog.addEventListener('pointerup', event => {
        if (backdropPress && outside(event)) dialog.close();
        backdropPress = false;
      });
      dialog.addEventListener('pointercancel', () => { backdropPress = false; });
    }
    dialog.showModal();
    document.documentElement.classList.add('secret-modal-open');
  });
})();
