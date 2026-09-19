# Production doğrulama kontrol listesi

Son gözden geçirme: 19 Eylül 2026. Bu belge tamamlanan kanıt ile açık işleri ayırır; `FINAL_REPORT.md` ana durum kaydıdır.

## Kanıtlanan

- [x] DNS delegasyonu, HTTPS, apex ve Studio custom domainleri önceki üretim geçişinde doğrulandı.
- [x] Worker `4db27bcf-151e-4f79-956f-fbaffea19831` dağıtıldı; üç Worker Secret adı yerinde.
- [x] Canlı ana sayfa, boş kategori ve admin Studio yeni görünümü Chrome'da açıldı.
- [x] Yerel typecheck, 11 unit test, build ve 24 Chrome E2E testi geçti.
- [x] Üretim salt okunur Chrome E2E: 12 public rota, asset/sitemap/robots/RSS, 404, güvenlik başlıkları, preview noindex, altı viewport ve mobil menü; 3/3 geçti.
- [x] `npm audit --omit=dev --audit-level=high` bulgu vermedi.
- [x] 19 Eylül production Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2.2 sn, CLS 0.
- [x] Önceki anonim Supabase RLS red/okuma, admin Storage yükleme ve Turnstile temas akışı `FINAL_REPORT.md` içinde kayıtlı.
- [x] Geçici member/editor hesaplarıyla production Auth girişi, profil görünürlüğü, inbox/audit/draft RLS, kategori yazma, görünüm yönetimi ve private Storage matrisi 20/20 geçti. Test kategorisi ve medya dosyası temizlendi. Hesap temizliği ayrıca izleniyor.
- [x] Beş içerik türünde production taslak 404, yayın 200, SEO/noindex ve gelecekteki scheduled 404 doğrulandı; altı test içeriği silindi. `scripts/verify-production-content.mjs`.
- [x] Ayrı Chrome Playwright oturumlarında member Studio dashboard'a alınmadı; editor dashboard/içerik editörünü gördü ve admin üye yönetimine alınmadı. `scripts/verify-production-studio.mjs`.
- [x] Search Console domain sahipliği TXT ile doğrulandı; sitemap başarıyla işlendi ve 20 sayfa keşfedildi. DNS değişikliği öncesi zone yedeği ve geri dönüş planı `docs/dns-search-console-2026-09-19.md` içinde.
- [x] Son yerel verify 0 hata/11 unit, E2E 25/25 ve production salt okunur E2E 4/4.
- [x] Canlı TR/EN home, contact, account, archive ve Studio giriş ekranında WCAG 2 A/AA ve 2.1 A/AA ciddi/kritik axe ihlali yok; genişletilmiş production E2E 10/10.
- [x] GitHub Actions Verify #20–#22 yeşil.

## Açık kapılar

- [ ] Production gerçek member/editor/admin rol matrisinin kalan admin karşılaştırması ve geçici Auth hesaplarının temizliği.
- [ ] Auth kayıt, doğrulama, reset, callback ve SMTP teslimatı.
- [ ] Beş içerik tipinin Studio önizleme, tür alanları ve medya bağları için ek production UI doğrulaması.
- [x] İçerik ve ilişki yazılarını tek transaction içinde kaydeden `save_content_with_relations` RPC migration `202609170010` production SQL Editor'da başarıyla uygulandı. Worker `0c6e5d92-ce3d-4849-967d-99da82cf3490` üzerinde mevcut private QA taslağı, ilişkileri korunarak Studio’dan yeniden kaydedildi.
- [ ] Yeni Search Console mülkünde indeks durumu ve alan Core Web Vitals verisinin oluşması.
- [ ] Supabase TOTP etkin olsa da uygulamada MFA kayıt/zorunluluk akışı ve doğrulaması; Cloudflare Access onboarding ödeme kartı ve Terms kullanıcı müdahalesi gerektiriyor.
- [ ] Manuel klavye/ekran okuyucu taraması ve henüz oluşmamış alan Core Web Vitals verisi.
- [ ] Sonraki kod ve belge commit'inin GitHub Actions Verify sonucu.
