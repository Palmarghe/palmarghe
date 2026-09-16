const type = document.querySelector<HTMLSelectElement>('select[name="type"]');
if (type) {
  const update = () => document.querySelectorAll<HTMLElement>('[data-type-section]').forEach((section) => { section.hidden = section.dataset.typeSection !== type.value; });
  type.addEventListener('change', update);
  update();
}
