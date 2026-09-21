const editorForm = document.querySelector<HTMLFormElement>('.content-editor-form');

if (editorForm) {
  const replacements = new Map([
    ['Etiketler (çoklu seçim)', 'Etiketler'],
    ['Kapak görseli', 'Kapak resmi'],
    ['Zamanlı yayın (UTC)', 'Yayın tarihi ve saati'],
    ['Arama motoruna açık', 'Google ve site aramasında göster'],
    ['SEO başlığı', 'Google başlığı'],
    ['SEO açıklaması', 'Google açıklaması'],
    ['Canonical URL', 'Yazının asıl adresi (varsa)'],
    ['Sosyal paylaşım görseli', 'Paylaşım resmi'],
    ['Uyumluluk', 'Çalıştığı sürüm'],
    ['Mod sürümü', 'Paket sürümü'],
    ['Değişiklikler', 'Bu sürümde neler değişti?'],
    ['Kurulum', 'Nasıl kurulur?'],
    ['İndirme URL', 'İndirme bağlantısı'],
    ['Kaynak URL', 'Kaynak bağlantısı'],
    ['Dosya boyutu bilgisi', 'Dosya boyutu'],
    ['Uyumluluk notu', 'Kullanım notu'],
    ['Proje URL', 'Proje bağlantısı'],
    ['Video/Prototip URL', 'Video veya prototip bağlantısı'],
  ]);

  editorForm.querySelectorAll<HTMLLabelElement>('label').forEach((label) => {
    const firstText = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
    if (!firstText) return;
    const current = firstText.textContent?.trim() ?? '';
    const next = replacements.get(current);
    if (next) firstText.textContent = `${next} `;
  });

  const advanced = editorForm.querySelector<HTMLElement>('.advanced-content summary');
  if (advanced) advanced.textContent = 'Google ve paylaşım ayarları';
}
