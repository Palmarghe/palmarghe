(() => {
  const cards = document.querySelectorAll('[data-ad-jump]');
  const status = document.querySelector('[data-ad-jump-status]');
  for (const card of cards) {
    card.addEventListener('click', (event) => {
      const target = document.getElementById(card.dataset.adJump || '');
      if (!target) return;
      event.preventDefault();
      document.querySelectorAll('.manual-ad-placement.is-editing').forEach((item) => item.classList.remove('is-editing'));
      target.classList.add('is-editing');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const control = target.querySelector('select, input');
      window.setTimeout(() => control?.focus({ preventScroll: true }), 280);
      history.replaceState(null, '', `#${target.id}`);
      if (status) status.textContent = `${target.querySelector('h3')?.textContent || 'Reklam alanı'} düzenlemeye hazır.`;
    });
  }
})();
