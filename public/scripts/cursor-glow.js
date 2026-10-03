(() => {
  const fineHover = matchMedia('(pointer: fine) and (hover: hover)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!fineHover.matches || reducedMotion.matches || document.querySelector('[data-brand-cursor]')) return;

  const cursor = document.createElement('div');
  cursor.className = 'brand-cursor';
  cursor.dataset.brandCursor = '';
  cursor.dataset.state = 'default';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<svg viewBox="0 0 22 22" focusable="false"><path class="cursor-arrow" d="M11 11L23 21L17 22L14 28Z"/><path class="cursor-tick" d="M21 26L24 29"/></svg>';
  document.body.append(cursor);
  document.documentElement.classList.add('has-brand-cursor');

  const searchDialog = document.querySelector('#search-overlay');
  const syncCursorLayer = () => {
    // Place the same pointer inside the modal's top layer so it stays visible.
    cursor.hidden = false;
    const parent = searchDialog?.open ? searchDialog : document.body;
    if (cursor.parentElement !== parent) parent.append(cursor);
  };
  searchDialog?.addEventListener('search-open', () => {
    syncCursorLayer();
    cursor.removeAttribute('data-away');
    cursor.removeAttribute('data-pressed');
    cursor.removeAttribute('data-keyboard-nav');
  });
  if (searchDialog) new MutationObserver(syncCursorLayer).observe(searchDialog, { attributes: true, attributeFilter: ['open'] });
  new MutationObserver(syncCursorLayer).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  searchDialog?.addEventListener('close', syncCursorLayer);

  let frame = 0;
  let x = -80;
  let y = -80;
  const stateValues = new Set(['default', 'link', 'button', 'image', 'external', 'text', 'native', 'loading', 'drag']);
  const setState = state => {
    const value = stateValues.has(state) ? state : 'default';
    cursor.dataset.state = value;
    document.documentElement.dataset.cursorState = value;
  };
  const stateFor = target => {
    const override = target.closest('[data-cursor]')?.dataset.cursor;
    if (override && stateValues.has(override)) return override;
    if (target.closest('input:not([type="hidden"]), textarea, select, [contenteditable="true"], iframe, video, audio')) return 'native';

    const link = target.closest('a[href]');
    if (link) {
      try {
        const url = new URL(link.href, location.href);
        if (url.protocol === 'https:' || url.protocol === 'http:') {
          if (url.origin !== location.origin) return 'external';
        } else if (url.protocol !== 'mailto:' && url.protocol !== 'tel:') return 'native';
      } catch { return 'native'; }
      return 'link';
    }
    if (target.closest('button, summary, [role="button"]')) return 'button';
    if (target.closest('[aria-busy="true"], [data-loading="true"]')) return 'loading';
    if (target.closest('[data-dragging="true"]')) return 'drag';
    if (target.closest('img, picture, video')) return 'image';
    if (target.closest('.content-detail p, .content-detail li, .content-detail blockquote, .page-content p, .page-content li, .page-content blockquote, .page-content h1, .page-content h2, .page-content h3')) return 'text';
    return 'default';
  };
  const updatePosition = () => {
    cursor.style.setProperty('--cursor-x', `${x}px`);
    cursor.style.setProperty('--cursor-y', `${y}px`);
    frame = 0;
  };

  addEventListener('pointermove', event => {
    x = event.clientX;
    y = event.clientY;
    cursor.removeAttribute('data-keyboard-nav');
    cursor.removeAttribute('data-away');
    if (!frame) frame = requestAnimationFrame(updatePosition);
  }, { passive: true });

  addEventListener('pointerover', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    setState(stateFor(target));
  }, { passive: true });

  addEventListener('pointerout', event => {
    if (event.relatedTarget == null) cursor.setAttribute('data-away', '');
  }, { passive: true });

  addEventListener('pointerdown', () => cursor.setAttribute('data-pressed', ''), { passive: true });
  addEventListener('pointerup', () => cursor.removeAttribute('data-pressed'), { passive: true });
  addEventListener('blur', () => {
    cursor.removeAttribute('data-pressed');
    cursor.setAttribute('data-away', '');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      cursor.setAttribute('data-keyboard-nav', '');
      cursor.removeAttribute('data-pressed');
    }
  });
})();
