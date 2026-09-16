# Studio kısa kılavuz

`/studio/` adresinde yetkili hesapla giriş yapın. Admin görünüm, homepage, navigasyon, sosyal bağlantılar, yönlendirme ve üyeleri yönetir; editör içerik, kategori, etiket, medya ve iletişim kutusunu yönetir.

İçerikte başlık, benzersiz slug, dil, tür ve blokları girin. Taslak kaydedip satırdaki **Önizle** ile kontrol edin. Yayın için `published`, UTC ileri tarihli yayın için `scheduled` seçin. TR/EN eşleşen iki içerikte aynı çeviri grup UUID'sini kullanın; yalnız yayında olan karşılığın hreflang bağı görünür. Kategori tek seçimli, etiket çoklu seçimlidir. FM mod, proje ve Lab türlerinin ek alanları tür seçimine göre açılır. İndirme URL'si yalnız güvenli HTTPS bağlantısı olarak kaydedilir.

Medya kütüphanesi PNG/JPEG/WebP ve 10 MB sınırını uygular. Alt metni düzenleyin; kapak olarak kullanılan dosyanın silinmesi engellenir. Kategoriler hiyerarşiktir ve ilişkili kategori/etiket veritabanı kısıtları nedeniyle silinemez. Homepage bölümünde görünürlük ve sıra, Appearance bölümünde renk ve köşe ayarlanır. Settings bölümündeki sosyal bağlantılar footer'a yansır.

Users bölümünde admin başka üyelerin rollerini günceller, hesap silme taleplerini inceler. Talebi `completed` işaretlemek kimlik sağlayıcıdaki hesabı silmez; doğrulanmış talep ayrıca Supabase Auth yönetiminde işlenmelidir. Kendi rolünüzü panelden değiştiremezsiniz.

İlk admin ataması migration yetkisiyle kontrollü bakım işlemidir. `prevent_profile_role_change` trigger'ını tek bir transaction içinde geçici devre dışı bırakıp doğrulanmış owner UUID'sini admin yapın ve trigger'ı yeniden açın; işlemden sonra rolü ve trigger durumunu doğrulayın. Kimlik veya şifreyi repoya yazmayın.
