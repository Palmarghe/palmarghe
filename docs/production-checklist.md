# Production doğrulama kontrol listesi

Son gözden geçirme: 17 Eylül 2026. Bu belge tamamlanan kanıt ile açık işleri ayırır; `FINAL_REPORT.md` ana durum kaydıdır.

## Kanıtlanan

- [x] DNS delegasyonu, HTTPS, apex ve Studio custom domainleri önceki üretim geçişinde doğrulandı.
- [x] Worker `4db27bcf-151e-4f79-956f-fbaffea19831` dağıtıldı; üç Worker Secret adı yerinde.
- [x] Canlı ana sayfa, boş kategori ve admin Studio yeni görünümü Chrome'da açıldı.
- [x] Yerel typecheck, 11 unit test, build ve 24 Chrome E2E testi geçti.
- [x] Üretim salt okunur Chrome E2E: 12 public rota, asset/sitemap/robots/RSS, 404, güvenlik başlıkları, preview noindex, altı viewport ve mobil menü; 3/3 geçti.
- [x] `npm audit --omit=dev --audit-level=high` bulgu vermedi.
- [x] 19 Eylül production Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2.2 sn, CLS 0.
- [x] Önceki anonim Supabase RLS red/okuma, admin Storage yükleme ve Turnstile temas akışı `FINAL_REPORT.md` içinde kayıtlı.

## Açık kapılar

- [ ] Production gerçek member/editor/admin rol matrisi; Auth, RLS ve Storage için kontrollü hesaplarla olumsuz ve olumlu test.
- [ ] Auth kayıt, doğrulama, reset, callback ve SMTP teslimatı.
- [ ] Beş içerik tipi için gerçek production yayın/önizleme/SEO/medya/scheduled doğrulaması; test kayıtları sonradan temizlenecek.
- [x] İçerik ve ilişki yazılarını tek transaction içinde kaydeden `save_content_with_relations` RPC migration `202609170010` production SQL Editor'da başarıyla uygulandı. Worker `0c6e5d92-ce3d-4849-967d-99da82cf3490` üzerinde mevcut private QA taslağı, ilişkileri korunarak Studio’dan yeniden kaydedildi.
- [ ] Search Console doğrulaması, sitemap sunumu ve indeks durumu.
- [ ] MFA ve Cloudflare Access; Access onboarding ödeme kartı ve Terms kullanıcı müdahalesi gerektiriyor.
- [ ] Güncel Lighthouse/axe ve manuel klavye/ekran okuyucu taraması, alan Core Web Vitals.
- [ ] GitHub Actions Verify #17 ve sonraki commit'in yeşil sonucu.
