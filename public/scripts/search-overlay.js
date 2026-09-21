(() => {
  const trigger = document.querySelector('[data-search-trigger]');
  const dialog = document.querySelector('#search-overlay');
  if (!trigger || !dialog) return;
  const input = dialog.querySelector('input[name="q"]');
  const results = dialog.querySelector('[data-search-results]');
  const status = dialog.querySelector('[data-search-status]');
  const locale = dialog.dataset.locale === 'en' ? 'en' : 'tr';
  let timer = 0; let controller; let selected = -1;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
  const close = () => { if (dialog.open) dialog.close(); trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); };
  const focusResult = (index) => { const links = [...results.querySelectorAll('a')]; if (!links.length) return; selected = (index + links.length) % links.length; links[selected].focus(); };
  const render = (items) => {
    selected = -1;
    results.innerHTML = items.map((item) => `<a href="${locale === 'en' ? '/en/' : '/'}${encodeURIComponent(item.slug).replace(/%2F/g, '/')}/" data-search-result><span>${escapeHtml(item.type.replace('_',' '))}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.excerpt)}</small></a>`).join('');
    status.textContent = items.length ? `${items.length} ${locale === 'tr' ? 'sonuç' : 'results'}` : (locale === 'tr' ? 'Sonuç bulunamadı.' : 'No results found.');
  };
  const search = () => {
    const q = input.value.trim(); clearTimeout(timer);
    if (q.length < 2) { results.innerHTML = ''; selected = -1; status.textContent = locale === 'tr' ? 'En az iki karakter yazın.' : 'Enter at least two characters.'; return; }
    timer = setTimeout(async () => {
      if (controller) controller.abort(); controller = new AbortController(); status.textContent = locale === 'tr' ? 'Aranıyor…' : 'Searching…';
      try { const response = await fetch(`/api/search/?locale=${locale}&q=${encodeURIComponent(q)}`, { signal: controller.signal }); if (!response.ok) throw new Error('search failed'); render((await response.json()).results || []); }
      catch { if (!controller.signal.aborted) status.textContent = locale === 'tr' ? 'Arama şu anda kullanılamıyor.' : 'Search is unavailable.'; }
    }, 250);
  };
  trigger.addEventListener('click', () => { if (!dialog.open) dialog.showModal(); trigger.setAttribute('aria-expanded', 'true'); input.focus(); });
  dialog.querySelector('[data-search-close]').addEventListener('click', close);
  input.addEventListener('input', search);
  dialog.addEventListener('close', () => { trigger.setAttribute('aria-expanded', 'false'); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); focusResult(selected + 1); }
    if (event.key === 'ArrowUp') { event.preventDefault(); focusResult(selected - 1); }
  });
  document.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target?.isContentEditable)) { event.preventDefault(); trigger.click(); } });
})();