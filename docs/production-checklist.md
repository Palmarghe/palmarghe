# Production doğrulama kontrol listesi

Son güncelleme: 28 Eylül 2026. FAZ 1 uygulanabilir kapsam tamamlandı; harici/kullanıcı bağımlı kapılar aşağıdadır. Ana kanıt kaydı `FINAL_REPORT.md` içindedir.

## Tamamlanan

- [x] DNS SERVFAIL kök nedeni belirlendi; zone yedeği/geri dönüş kaydı tutuldu. Cloudflare NS, Worker apex/Studio/www, HTTPS ve yönlendirme doğrulandı; DS/DNSSEC değiştirilmedi.
- [x] Supabase production migration `202609160001`–`009`, atomik içerik/ilişki RPC `202609170010`, FAZ 2 gallery/translation/social migrations `202609190011`–`013` ve üyelik/izin/yorum migration'ı `202609210014` ve community/editorial migration'ı `202609270026` uygulandı; yerel ve remote migration geçmişi eşleşiyor.
- [x] Canlı Chrome profil QA'sı hazır avatar, bio ve görünen adı kaydedip tekrar okudu. Authenticated-only yorum üretimde yayınlandı ve bırakıldı; test üyesi Studio içerik yazma sınırında reddedildi.
- [x] Anon, member, editor ve admin erişim sınırları; 20/20 production Auth/RLS/Storage rol testi; ayrı Chrome Studio yetki testi.
- [x] Beş içerik türünde production draft 404, geçici yayın 200, SEO/noindex; gelecekteki scheduled içerik 404. Altı test kaydı silindi.
- [x] Geçici member/editor Auth hesapları yalnız doğrulanan UUID'leriyle silindi. Son SQL: Auth `0`, profile `0`, audit `0`; gerçek owner admin sağlam `1`.
- [x] Admin private Storage yükleme, staff preview/anonymous denial, Turnstile canlı mesaj ve görünüm ayarı turu doğrulandı.
- [x] Search Console domain sahipliği ve sitemap işlendi; 20 sayfa keşfedildi. TXT öncesi DNS yedeği ve geri dönüş planı `docs/dns-search-console-2026-09-19.md` içinde.
- [x] Yerel verify: 0 typecheck hatası/uyarı, 11/11 unit, build. Yerel E2E 25/25. Temizlik sonrası production E2E 10/10; altı canlı axe taramasında ciddi/kritik WCAG bulgusu yok.
- [x] 19 Eylül Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2.2 sn, CLS 0. Production dependency audit high-severity bulgu vermedi.
- [x] Normal Git push ve GitHub Actions Verify geçmişi yeşil; her yeni production commit için çalışma sonucu ayrıca kontrol edilir.
- [x] Bülten kaydı açık rıza, bot tuzağı, Worker taraflı hız sınırı ve anonim e-posta okumasına izin vermeyen `subscribe_newsletter` RPC’siyle doğrulandı; RPC execute izni yalnız `service_role` içindir. Kontrollü production kayıt oluşturuldu, veritabanında görüldü ve silinerek `0` kaldı.
- [x] Tetikleyici ve scheduler yardımcılarının anon execute izinleri kapatıldı. Zamanlanmış takipçi bildirimleri yalnız Worker service-role ile dağıtılır; production fonksiyon yetki sorgusu anon erişimini `false`, scheduler service erişimini `true` doğruladı.
- [x] Supabase Auth minimum parola uzunluğu 12’ye çıkarıldı; büyük/küçük harf, rakam ve simge kuralı ile parola değişiminde yakın oturum doğrulaması etkinleştirildi.

## Harici veya kullanıcı bağımlı kapılar

- [ ] Özel SMTP sağlayıcısı ve gerçek e-posta teslimatı; signup confirmation/reset callback doğrulaması.
- [x] Hesap sayfasında uygulama düzeyinde TOTP MFA kaydı, doğrulama ve faktör kaldırma akışı.
- [ ] Owner ikinci faktörünün gerçek authenticator ile kaydı, zorunlu MFA politikası ve recovery prosedürü.
- [ ] Cloudflare Access için ödeme kartı, Terms/Gizlilik Politikası ve olası overage onayı. 28 Eylül canlı Chrome denetiminde Cloudflare One oturumu açıldı ve Zero Trust Free seçildi; etkinleştirme güvenli ödeme ekranında kart, sözleşme kabulü ve kota aşımı ücretlendirme yetkisi istiyor. Wrangler OAuth tokenı Workers/zone işlemlerinde yetkili ancak Access yönetim izni içermiyor.
- [ ] Search Console field Core Web Vitals ve organik tıklama verisinin olgunlaşması. 28 Eylül denetiminde sitemap görünür, 22 URL dizinde; 0 organik tıklama ve yeterli CWV alan verisi yok.
- [ ] İnsan tarafından ekran okuyucu/assistive technology incelemesi.

Bu maddeler FAZ 2 derin incelemesini başlatmayı engellemez. FAZ 2 yeni P0/P1 bulursa yeniden açılacaktır.
