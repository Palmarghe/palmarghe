(() => {
  const finePointer = matchMedia('(pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reducedMotion.matches || document.querySelector('[data-brand-cursor]')) return;
  const cursor = document.createElement('div');
  cursor.className = 'brand-cursor';
  cursor.dataset.brandCursor = '';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span></span><i></i>';
  document.body.append(cursor);
  document.documentElement.classList.add('has-brand-cursor');
  let frame = 0;
  let x = -80;
  let y = -80;
  const interactive = 'a, button, summary, [role="button"], input:not([type="hidden"]), select, textarea, [contenteditable="true"]';
  const editable = 'input:not([type="hidden"]), select, textarea, [contenteditable="true"]';
  const update = () => {
    cursor.style.setProperty('--cursor-x', `${x}px`);
    cursor.style.setProperty('--cursor-y', `${y}px`);
    document.body.style.setProperty('--pointer-x', `${x}px`);
    document.body.style.setProperty('--pointer-y', `${y}px`);
    frame = 0;
  };
  addEventListener('pointermove', (event) => {
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  addEventListener('pointerover', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    cursor.toggleAttribute('data-active', Boolean(target?.closest(interactive)));
    cursor.toggleAttribute('data-editing', Boolean(target?.closest(editable)));
  }, { passive: true });
  addEventListener('pointerdown', () => cursor.setAttribute('data-pressed', ''), { passive: true });
  addEventListener('pointerup', () => cursor.removeAttribute('data-pressed'), { passive: true });
  addEventListener('blur', () => cursor.removeAttribute('data-pressed'));
})();
