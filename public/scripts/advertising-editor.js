(() => {
  const form = document.querySelector('form:has(input[value="advertising"])');
  if (!form) return;
  const config = window.__palmargheAdvertising || {};
  const placements = config.placements || {};
  [...form.children].forEach((child) => {
    if (!child.matches('input[type="hidden"], .button')) child.classList.add('advertising-legacy');
  });
  const section = document.createElement('fieldset');
  section.className = 'manual-ad-editor';
  section.innerHTML = '<legend>Reklam yerleşimleri</legend><p>Reklam eklemediğinizde alanlar Palmarghe temasıyla görünür. Her kartı Google AdSense veya güvenli HTTPS bağlantılı manuel tanıtım için kullanabilirsiniz.</p><label class="field advertising-publisher">AdSense yayıncı kimliği <input name="publisher_id" pattern="ca-pub-[0-9]{10,20}" placeholder="ca-pub-1234567890123456"></label>';
  section.querySelector('[name="publisher_id"]').value = config.publisher_id || '';
  for (const [key, label] of [['header','Üst alan'],['article','Yazı içi alan'],['footer','Alt alan']]) {
    const item = placements[key] || {};
    const block = document.createElement('section'); block.className = 'manual-ad-placement';
    block.innerHTML = `<h3>${label}</h3><label class="field">Gösterim türü<select name="${key}_mode"><option value="placeholder">Temalı reklam alanı</option><option value="google">Google AdSense</option><option value="manual">Manuel tanıtım</option></select></label><label class="field">AdSense slotu<input name="${key}_slot" inputmode="numeric" pattern="[0-9]{6,20}" placeholder="1234567890"></label><label class="field">Başlık<input name="${key}_title" maxlength="100" placeholder="İş ortağınızın başlığı"></label><label class="field">Açıklama<input name="${key}_description" maxlength="240" placeholder="Kısa açıklama"></label><label class="field">Bağlantı<input name="${key}_url" type="url" placeholder="https://"></label><label class="field">Buton metni<input name="${key}_cta" maxlength="40" placeholder="İncele"></label>`;
    block.querySelector(`[name="${key}_mode"]`).value = item.mode === 'off' ? 'placeholder' : (item.mode || (config.enabled && config.slots?.[key] ? 'google' : 'placeholder'));
    block.querySelector(`[name="${key}_slot"]`).value = config.slots?.[key] || '';
    for (const name of ['title','description','url','cta']) block.querySelector(`[name="${key}_${name}"]`).value = item[name] || '';
    section.append(block);
  }
  form.querySelector('.button:last-child')?.before(section);
})();
