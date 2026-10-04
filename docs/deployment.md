# Dağıtım

Astro SSR uygulaması Cloudflare Worker `palmarghe` üzerinde çalışır. Zone `palmarghe.com` aktiftir; apex, `studio` ve `www` Worker custom domainleridir. `www` apex'e 301 yönlenir. DNS teşhisi, eski/yeni NS ve geri dönüş planı için `docs/dns-backup-2026-09-16.md` dosyasına bakın.

Supabase production proje referansı `ozztqhiqzchlbxscbwhy` (West EU). Migration dosyaları `202609160001`–`202609170010`, `202609190011`–`202609190013`, `202609210014`, `202609260015`–`202609260025` ve `202609270026`–`202609280034` ve `202610010035`–`202610020036` uygulanmıştır. `009` API grants için gereklidir; RLS policy tek başına REST erişimi vermez. `010`, personel RLS yetkisini koruyan `save_content_with_relations` RPC'si ile içerik satırı, kategori ve etiket değişikliklerini tek transaction içinde kaydeder. `027` içerik sürümlerini, `028`–`029` opt-in public yazar profili/byline RPC’lerini ve `030` doğrudan yayınlanan yazar içerikleri için takipçi bildirim tetikleyicisini; `031` ise yayın saati gelmiş zamanlanmış içerikler için idempotent bildirim dağıtımını sağlar. `032`, rızalı bülten kaydını ekler. `033` tetikleyici ve scheduler yardımcılarını public execute kapsamından çıkarır; `034` ise bülten RPC’sini yalnız Worker service-role için sınırlar. Kayıt akışı açık rıza, bot tuzağı ve veritabanı tabanlı hız sınırıyla Worker üzerinden çalışır. Auth site URL ve callback allowlist production URL'lerindedir. Chrome'da bir admin Studio oturumu doğrulandı. Gelecekteki rol atamaları doğrulanmış Auth UUID'si ile kontrollü `postgres` işleminde yapılmalı; rol koruma trigger'ı etkin tutulmalıdır.

Worker için public build değerleri `.env.production` içinde tutulur ve Git tarafından yok sayılır: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `TURNSTILE_SITE_KEY`, `APP_URL`, `STUDIO_URL`. Bunlar build öncesinde hazır olmalıdır. `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_RATE_PEPPER` Cloudflare Worker **Secret** olarak tutulur; `.env.production` veya Git'e yazılmaz. API endpointleri bunları runtime'da `cloudflare:workers` env üzerinden okur. Üç secret Wrangler secret list ile doğrulanmıştır.

```powershell
npm run verify
npm run test:e2e
npx wrangler deploy --config dist/server/wrangler.json
npx wrangler secret list --name palmarghe
```

`wrangler deploy` uzaktaki Worker config'ini yerel üretilen config ile karşılaştırabilir. Deploy sonrasında üç custom domain, Worker Secret'ları, apex/Studio HTTPS ve `www` yönlendirmesini tekrar kontrol edin. `LOCAL_TEST_MODE` yalnız geliştirme ortamında ve loopback test isteğinde etkindir. Service Worker yalnız statik dosyaları önbellekler; SSR sayfaları ve Studio ayarları her gezinmede güncel Worker yanıtından gelir.

Turnstile ile gerçek iletişim gönderimi ve Studio gelen kutusuna kaydı doğrulandı. Production member/editor rol matrisi doğrulandı. SMTP/Auth e-posta callback ve reset, gerçek newsletter teslimat sağlayıcısı, Cloudflare Access, Search Console field verileri ve ayrı preview Supabase projesi hâlâ kontrol edilmelidir. Cloudflare Zero Trust Free onboarding ödeme kartı, Terms kabulü ve aylık aşım tahsilatı yetkisi istediği için Access aktivasyonu otomatik yapılmadı.

Migration 202610010035 confines measurement RPC writes to the private Worker service role. Live grants, API checks, controlled QA cleanup and rollback are documented in docs/measurement-boundary-2026-10-01.md. Historical Worker at that checkpoint was 7b9107df-042f-404e-b193-14c26b4c4bbe; the 1–2 October SEO/login audit is in docs/seo-routing-audit-2026-10-01.md. Production verification uses its own test-results/production directory; local uses test-results/local.

Migration036 derives private body/gallery/cover/OG/revision references and guards metadata deletion with restrictive FKs. Apply before a Worker using media_has_references. Source data fingerprints were unchanged. Evidence/rollback: docs/media-references-audit-2026-10-02.md.

Current Worker (4 October 2026): c2dee5b1-b931-42f7-89f1-d5e95ed022b9. Focus repair: docs/hero-card-focus-2026-10-04/AUDIT.md. Independent card editor: docs/hero-card-editor-2026-10-04/AUDIT.md. Visual polish audit: docs/visual-polish-2026-10-04/AUDIT.md. Original source covers/gallery, header subcategories and curated showcase audit: docs/mod-source-visuals-2026-10-04/AUDIT.md. Initial mod publication/category audit (historical): docs/mod-publications-2026-10-04/AUDIT.md. Production migrations038/039/040 remain applied as documented in FINAL_REPORT.md.

