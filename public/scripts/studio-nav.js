(() => {
  const editorPanel = new URLSearchParams(location.search).get('panel') === 'editor';
  if (editorPanel) document.querySelectorAll('a[href^="/studio/"]').forEach((link) => {
    const url = new URL(link.href, location.origin);
    if (url.pathname === '/studio/' && !url.searchParams.has('panel')) {
      url.searchParams.set('panel', 'editor');
      link.href = `${url.pathname}?${url.searchParams}`;
    }
  });
  const nav = document.querySelector('.admin-side nav');
  if (!nav) return;
  const groups = [...nav.querySelectorAll('.studio-nav-group')];
  const compact = () => matchMedia('(min-width: 901px)').matches;
  groups.forEach((group) => {
    const label = group.querySelector(':scope > span');
    if (!label) return;
    label.tabIndex = 0;
    label.setAttribute('role', 'button');
    const sync = () => label.setAttribute('aria-expanded', String(!group.classList.contains('is-collapsed')));
    const toggle = () => { if (!compact()) return; group.classList.toggle('is-collapsed'); sync(); };
    label.addEventListener('click', toggle);
    label.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
    if (compact() && !group.querySelector('[aria-current="page"]')) group.classList.add('is-collapsed');
    sync();
  });
  addEventListener('resize', () => groups.forEach((group) => { if (!compact()) group.classList.remove('is-collapsed'); }));
})();
