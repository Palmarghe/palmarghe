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
  const switcher = document.createElement('label');
  switcher.className = 'studio-mobile-switcher';
  switcher.append(document.createTextNode('Studio bölümü'));
  const select = document.createElement('select');
  nav.querySelectorAll('.studio-nav-group').forEach((group) => {
    const options = document.createElement('optgroup');
    options.label = group.querySelector(':scope > span')?.textContent ?? '';
    group.querySelectorAll('a').forEach((link) => {
      const option = document.createElement('option');
      option.value = link.href;
      option.textContent = link.textContent;
      option.selected = link.getAttribute('aria-current') === 'page';
      options.append(option);
    });
    select.append(options);
  });
  select.addEventListener('change', () => { location.href = select.value; });
  switcher.append(select);
  nav.after(switcher);
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
