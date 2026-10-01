(() => {
  const dialog = document.querySelector('[data-gallery-dialog]');
  const image = dialog?.querySelector('[data-gallery-image]');
  const caption = dialog?.querySelector('[data-gallery-caption]');
  const closeButton = dialog?.querySelector('[data-gallery-close]');
  const links = [...document.querySelectorAll('[data-gallery-lightbox]')];
  if (!dialog || !image || !links.length) return;
  let trigger = null;
  const close = () => { if (dialog.open) dialog.close(); };
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('gallery-modal-open');
    trigger?.focus();
  });
  links.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault(); trigger = link;
    image.src = link.href; image.alt = link.dataset.alt || '';
    if (caption) caption.textContent = link.dataset.caption || image.alt;
    dialog.showModal();
    document.documentElement.classList.add('gallery-modal-open');
    closeButton?.focus();
  }));
  closeButton?.addEventListener('click', close);
  let backdropPress = false;
  const outside = event => {
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
  };
  dialog.addEventListener('pointerdown', event => { backdropPress = outside(event); });
  dialog.addEventListener('pointerup', event => {
    if (backdropPress && outside(event)) close();
    backdropPress = false;
  });
  dialog.addEventListener('pointercancel', () => { backdropPress = false; });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') { event.preventDefault(); closeButton?.focus(); }
  });
})();
