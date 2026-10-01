const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');

if (toggle && menu) {
  menu.setAttribute('inert', '');
  const focusable = () => [...menu.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    .filter(element => !element.hasAttribute('inert') && element.getClientRects().length > 0);
  let scrollY = 0;
  let previousBodyPosition = '';
  let previousBodyTop = '';
  let previousBodyWidth = '';

  const setOpen = (open, restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    const tr = document.documentElement.lang === 'tr';
    toggle.setAttribute('aria-label', open ? (tr ? 'Menüyü kapat' : 'Close menu') : (tr ? 'Menüyü aç' : 'Open menu'));
    menu.toggleAttribute('inert', !open);
    menu.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('mobile-navigation-open', open);

    if (open) {
      scrollY = window.scrollY;
      previousBodyPosition = document.body.style.position;
      previousBodyTop = document.body.style.top;
      previousBodyWidth = document.body.style.width;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        (focusable()[0] ?? menu.querySelector('a[href],button:not([disabled])'))?.focus({ preventScroll: true });
      }));
    } else {
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
      if (restoreFocus) toggle.focus();
    }
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      setOpen(false, true);
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = focusable();
    if (!controls.length) {
      event.preventDefault();
      toggle.focus();
      return;
    }
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === toggle)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener('focusin', event => {
    if (toggle.getAttribute('aria-expanded') === 'true' && !menu.contains(event.target) && event.target !== toggle) {
      focusable()[0]?.focus();
    }
  });
  document.addEventListener('pointerdown', event => {
    const target = event.target;
    if (target instanceof Node && !(target instanceof Element && target.closest('.mobile-menu')) && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
    }
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  matchMedia('(min-width: 901px)').addEventListener('change', event => {
    if (event.matches && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
  });
}
