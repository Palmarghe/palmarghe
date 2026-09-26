(() => {
  const form = document.querySelector('.advertising-form');
  const panel = document.querySelector('[data-ad-preview]');
  if (!form || !panel) return;
  const render = () => {
    ['header','article','footer'].forEach((name) => {
      const card = panel.querySelector(`[data-preview-placement="${name}"]`); if (!card) return;
      const read = (suffix) => form.querySelector(`[name="${name}_${suffix}"]`)?.value?.trim() || '';
      const visible = form.querySelector(`[name="${name}_visible"]`)?.checked;
      card.classList.toggle('is-hidden', !visible);
      card.querySelector('strong').textContent = read('title') || 'Başlık bekliyor';
      card.querySelector('small').textContent = read('description') || 'Kısa açıklama';
      card.querySelector('em').textContent = read('cta') || 'İncele';
    });
  };
  form.addEventListener('input', render); form.addEventListener('change', render); render();
})();
