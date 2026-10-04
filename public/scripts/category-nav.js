(() => {
  const menus = [...document.querySelectorAll('.nav-category details')];
  menus.forEach(menu => menu.addEventListener('toggle', () => {
    if (menu.open) menus.forEach(other => { if (other !== menu) other.open = false; });
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') menus.forEach(menu => {
      if (menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); }
    });
  });
  document.addEventListener('click', event => menus.forEach(menu => {
    if (!menu.parentElement.contains(event.target)) menu.open = false;
  }));
})();
