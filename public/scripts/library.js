(() => {
  const button = document.querySelector<HTMLButtonElement>('[data-bookmark]');
  if (!button) return;
  const contentId = button.dataset.bookmark;
  button.addEventListener('click', async () => {
    if (!contentId) return;
    button.disabled = true;
    try {
      const response = await fetch('/api/library/', { method:'POST', headers:{'content-type':'application/json'}, credentials:'same-origin', body:JSON.stringify({action:'bookmark',contentId}) });
      if (response.status === 401) { window.location.assign('/account/'); return; }
      const data = await response.json();
      button.setAttribute('aria-pressed', String(Boolean(data.saved)));
      button.textContent = data.saved ? 'Okuma listesinde' : 'Okuma listesine ekle';
    } catch { button.textContent = 'Tekrar dene'; }
    finally { button.disabled = false; }
  });
})();