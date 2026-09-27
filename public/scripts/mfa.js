(() => {
  const root = document.querySelector('[data-mfa]');
  if (!root) return;
  const status = root.querySelector('[data-mfa-status]');
  const factors = root.querySelector('[data-mfa-factors]');
  const dialog = root.querySelector('[data-mfa-dialog]');
  const form = root.querySelector('[data-mfa-verify]');
  const setStatus = (message, error = false) => { status.textContent = message; status.dataset.error = error ? 'true' : 'false'; };
  const request = async (payload, method = 'POST') => {
    const response = await fetch('/api/mfa/', { method, headers: method === 'POST' ? { 'content-type': 'application/json' } : undefined, body: method === 'POST' ? JSON.stringify(payload) : undefined, credentials: 'same-origin' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'İşlem tamamlanamadı.');
    return data;
  };
  const render = (items) => {
    factors.replaceChildren();
    if (!items.length) { factors.textContent = 'Henüz doğrulanmış bir doğrulayıcı uygulama yok.'; return; }
    for (const factor of items) {
      const row = document.createElement('div');
      const label = document.createElement('span'); label.textContent = factor.name;
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'text-link'; remove.textContent = 'Kaldır';
      remove.addEventListener('click', async () => { if (!confirm('Bu doğrulayıcı uygulama kaldırılsın mı?')) return; try { await request({ action: 'unenroll', factorId: factor.id }); await load(); setStatus('Doğrulayıcı kaldırıldı.'); } catch (error) { setStatus(error.message, true); } });
      row.append(label, remove); factors.append(row);
    }
  };
  const load = async () => { try { const data = await request(null, 'GET'); render(data.factors || []); } catch { factors.textContent = 'Doğrulayıcı durumu şu anda yüklenemedi.'; } };
  root.querySelector('[data-mfa-enroll]').addEventListener('click', async () => {
    try {
      setStatus('Güvenli kurulum kodu hazırlanıyor…');
      const data = await request({ action: 'enroll' });
      form.elements.factorId.value = data.factorId;
      root.querySelector('[data-mfa-qr]').src = data.qrCode;
      root.querySelector('[data-mfa-secret]').textContent = data.secret;
      dialog.showModal(); setStatus('Authenticator uygulamanızla QR kodu tarayın.');
    } catch (error) { setStatus(error.message, true); }
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const fields = new FormData(form);
      await request({ action: 'verify', factorId: fields.get('factorId'), code: fields.get('code') });
      dialog.close(); form.reset(); await load(); setStatus('İki adımlı doğrulama etkin. Diğer oturumlar güvenlik için kapatıldı.');
    } catch (error) { setStatus(error.message, true); }
  });
  dialog.querySelector('[data-mfa-cancel]').addEventListener('click', () => dialog.close());
  load();
})();
