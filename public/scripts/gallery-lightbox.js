(() => {
  const dialog = document.querySelector('[data-gallery-dialog]');
  const image = dialog?.querySelector('[data-gallery-image]');
  const caption = dialog?.querySelector('[data-gallery-caption]');
  const closeButton = dialog?.querySelector('[data-gallery-close]');
  const links = [...document.querySelectorAll('[data-gallery-lightbox]')];
  if (!dialog || !image || !links.length) return;
  let trigger = null;
  const close = () => { if (dialog.open) dialog.close(); trigger?.focus(); };
  links.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault(); trigger = link;
    image.src = link.href; image.alt = link.dataset.alt || '';
    if (caption) caption.textContent = link.dataset.caption || image.alt;
    dialog.showModal(); closeButton?.focus();
  }));
  closeButton?.addEventListener('click', close);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
})();