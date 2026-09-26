(() => {
  const form = document.querySelector('form:has(input[value="advertising"])');
  if (!form) return;
  const config = window.__palmargheAdvertising || {};
  const placements = config.placements || {};
  const section = document.createElement('fieldset');
  section.className = 'manual-ad-editor';
  section.innerHTML = '<legend>Yerleşim türü ve manuel reklam</legend><p>Her alanı temalı yer tutucu, Google reklamı, manuel tanıtım veya gizli olarak seçin. Manuel reklamlar güvenli HTTPS bağlantısıyla açılır.</p>';
  for (const [key, label] of [['header','Üst alan'],['article','Yazı içi alan'],['footer','Alt alan']]) {
    const item = placements[key] || {};
    const block = document.createElement('section'); block.className = 'manual-ad-placement';
    block.innerHTML = `<h3>${label}</h3><label class="field">Tür<select name="${key}_mode"><option value="placeholder">Temalı yer tutucu</option><option value="google">Google AdSense</option><option value="manual">Manuel reklam</option><option value="off">Gizle</option></select></label><label class="field">Başlık<input name="${key}_title" maxlength="100"></label><label class="field">Açıklama<input name="${key}_description" maxlength="240"></label><label class="field">Bağlantı<input name="${key}_url" type="url" placeholder="https://"></label><label class="field">Buton metni<input name="${key}_cta" maxlength="40" placeholder="İncele"></label>`;
    block.querySelector(`[name="${key}_mode"]`).value = item.mode || (config.enabled && config.slots?.[key] ? 'google' : 'placeholder');
    for (const name of ['title','description','url','cta']) block.querySelector(`[name="${key}_${name}"]`).value = item[name] || '';
    section.append(block);
  }
  form.querySelector('.button:last-child')?.before(section);
})();
