(() => {
  const trigger = document.querySelector('[data-search-trigger]');
  const dialog = document.querySelector('#search-overlay');
  if (!trigger || !dialog) return;
  const input = dialog.querySelector('input[name="q"]');
  const results = dialog.querySelector('[data-search-results]');
  const status = dialog.querySelector('[data-search-status]');
  const locale = dialog.dataset.locale === 'en' ? 'en' : 'tr';
  let timer = 0; let controller;
  const close = () => { dialog.close(); trigger.focus(); };
  const render = (items) => { results.innerHTML = items.map((item) => `<a href="${locale === 'en' ? '/en/' : '/'}${item.slug}/"><span>${item.type.replace('_',' ')}</span><strong>${item.title}</strong><small>${item.excerpt || ''}</small></a>`).join(''); status.textContent = items.length ? `${items.length} ${locale === 'tr' ? 'sonuç' : 'results'}` : (locale === 'tr' ? 'Sonuç bulunamadı.' : 'No results found.'); };
  const search = () => { const q = input.value.trim(); clearTimeout(timer); if (q.length < 2) { results.innerHTML = ''; status.textContent = locale === 'tr' ? 'En az iki karakter yazın.' : 'Enter at least two characters.'; return; } timer = setTimeout(async () => { if (controller) controller.abort(); controller = new AbortController(); status.textContent = locale === 'tr' ? 'Aranıyor…' : 'Searching…'; try { const response = await fetch(`/api/search/?locale=${locale}&q=${encodeURIComponent(q)}`, { signal: controller.signal }); render((await response.json()).results || []); } catch { if (!controller.signal.aborted) status.textContent = locale === 'tr' ? 'Arama şu anda kullanılamıyor.' : 'Search is unavailable.'; } }, 250); };
  trigger.addEventListener('click', () => { dialog.showModal(); input.focus(); });
  dialog.querySelector('[data-search-close]').addEventListener('click', close);
  input.addEventListener('input', search);
  dialog.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target?.isContentEditable)) { event.preventDefault(); trigger.click(); } });
})();