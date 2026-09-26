(() => {
  const key = 'palmarghe-theme';
  const body = document.body;
  const buttons = [...document.querySelectorAll('[data-theme-toggle]')];
  const apply = (theme) => {
    body.dataset.theme = theme;
    const light = theme === 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f5f2ee' : '#0B0B0D');
    buttons.forEach((button) => { button.setAttribute('aria-pressed', String(light)); button.setAttribute('aria-label', light ? 'Koyu modu aç' : 'Açık modu aç'); });
  };
  try { apply(localStorage.getItem(key) === 'light' ? 'light' : 'dark'); } catch { apply('dark'); }
  buttons.forEach((button) => button.addEventListener('click', () => { const next = body.dataset.theme === 'light' ? 'dark' : 'light'; try { localStorage.setItem(key, next); } catch {} apply(next); }));
})();
