const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');

if (toggle && menu) {
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    const tr = document.documentElement.lang === 'tr';
    toggle.setAttribute('aria-label', open ? (tr ? 'Menüyü kapat' : 'Close menu') : (tr ? 'Menüyü aç' : 'Open menu'));
    menu.toggleAttribute('inert', !open);
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (event.target instanceof Node && !event.target.parentElement?.closest('.mobile-menu') && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
}
