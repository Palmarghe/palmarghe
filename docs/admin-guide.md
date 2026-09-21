# Studio kısa kılavuz

`/studio/` adresinde yetkili hesapla giriş yapın. Admin görünüm, homepage, navigasyon, sosyal bağlantılar, yönlendirme ve üyeleri yönetir; editör içerik, kategori, etiket, medya ve iletişim kutusunu yönetir.

İçerikte başlık, benzersiz slug, dil, tür ve blokları girin. Taslak kaydedip satırdaki **Önizle** ile kontrol edin. Yayın için `published`, UTC ileri tarihli yayın için `scheduled` seçin. TR/EN eşleşen içerikleri düzenleme ekranındaki **Çeviri eşleştir** seçicisinden bağlayın; UUID girilmez. Kategori tek seçimli, etiket çoklu seçimlidir. FM mod, proje ve Lab türlerinin ek alanları tür seçimine göre açılır. İndirme URL'si yalnız güvenli HTTPS bağlantısı olarak kaydedilir.

## İçerik blokları

İçerik çalışma alanında üst çubuktan taslak kaydedebilir, yayımlayabilir, zamanlayabilir ve önizleme açabilirsiniz. Başlık ve kısa açıklama yazı tuvalinde kalır; URL alanı **URL / gelişmiş** altında otomatik Türkçe slug ile başlar ve manuel düzenleme korunur. Araç çubuğu başlık, liste, alıntı, kod, geri al/yinele ile **Görsel**, **Galeri**, **Not**, **Buton**, **Göm** ve **Tablo** denetimlerini sunar. `/` ile blok arayın; Enter ilk eşleşeni ekler, Escape kapatır. Seçili metinde veya Ctrl/Cmd+K ile bağlantı penceresi açılır. Seçili üst düzey bloğu ayrı blok çubuğundan üste/alta ekleyebilir, yukarı/aşağı taşıyabilir, çoğaltabilir veya silebilirsiniz. Görsel seçici küçük önizleme, arama ve seçili durum içeren bir medya ızgarası kullanır; UUID yazılması gerekmez. Galeri birden çok medya seçer. Tablo eklerken 1–10 satır ve 1–8 sütun seçilir; ilk satır başlık satırıdır. Gömme yalnız YouTube veya Vimeo'nun HTTPS gömme URL'lerini kabul eder. Buton bağlantısı site içi `/...` yolu veya HTTPS adresi olmalıdır; vurgu, ikincil veya metin stilini seçebilirsiniz. Kaydetmeden önce önizlemeyi açın; kontrol edilen blok şeması geçersiz veya güvenli olmayan veriyi reddeder.

Medya kütüphanesi PNG/JPEG/WebP ve 10 MB sınırını uygular. Alt metni düzenleyin; kapak olarak kullanılan dosyanın silinmesi engellenir. Kategoriler hiyerarşiktir ve ilişkili kategori/etiket veritabanı kısıtları nedeniyle silinemez. Homepage bölümünde görünürlük ve sıra, Appearance bölümünde renk ve köşe ayarlanır. Settings bölümündeki sosyal bağlantılar footer'a yansır.

Users bölümünde admin başka üyelerin rollerini günceller, hesap silme taleplerini inceler. Talebi `completed` işaretlemek kimlik sağlayıcıdaki hesabı silmez; doğrulanmış talep ayrıca Supabase Auth yönetiminde işlenmelidir. Kendi rolünüzü panelden değiştiremezsiniz.

İlk admin ataması yalnız migration sahibi `postgres` yetkisiyle kontrollü SQL işlemidir. Doğrulanmış owner UUID'si için `public.profiles.role` alanını `admin` yapın ve sonucu doğrulayın. `prevent_profile_role_change` trigger'ını devre dışı bırakmayın; normal oturumlarda rol değişimini engeller. Kimlik veya şifreyi repoya yazmayın.
