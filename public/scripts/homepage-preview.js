(() => {
  const form = document.querySelector('.homepage-editor');
  const preview = document.querySelector('[data-homepage-preview]');
  if (!form || !preview) return;
  const field = (name) => form.querySelector(`[name="${name}"]`);
  const render = () => {
    const title = field('hero_title_tr')?.value.trim() || 'Dijital işler için bir yayın alanı.';
    const eyebrow = field('hero_eyebrow_tr')?.value.trim() || 'PALMARGHE — BAĞIMSIZ DİJİTAL YAYIN';
    const desc = field('hero_descriptor_tr')?.value.trim() || 'Yapay zekâ, oyunlar, Football Manager ve dijital deneyler.';
    const visible = field('hero_visible')?.checked;
    const mode = field('hero_mode')?.value || 'compact';
    preview.className = `homepage-live-preview mode-${mode}${visible ? '' : ' is-hidden'}`;
    preview.querySelector('[data-preview-eyebrow]').textContent = eyebrow;
    preview.querySelector('[data-preview-title]').textContent = title;
    preview.querySelector('[data-preview-desc]').textContent = desc;
    preview.querySelector('[data-preview-state]').textContent = visible ? 'Canlı önizleme' : 'Vitrin gizli';
  };
  form.addEventListener('input', render); form.addEventListener('change', render); render();
})();
