# Dağıtım

Astro SSR uygulaması Cloudflare Worker `palmarghe` üzerinde çalışır. Zone `palmarghe.com` aktiftir; apex, `studio` ve `www` Worker custom domainleridir. `www` apex'e 301 yönlenir. DNS teşhisi, eski/yeni NS ve geri dönüş planı için `docs/dns-backup-2026-09-16.md` dosyasına bakın.

Supabase production proje referansı `ozztqhiqzchlbxscbwhy` (West EU). Migration dosyaları `202609160001`–`202609160009` sırasıyla SQL Editor'da uygulanmıştır. `009` API grants için gereklidir; RLS policy tek başına REST erişimi vermez. Auth site URL ve callback allowlist production URL'lerindedir. Chrome'da bir admin Studio oturumu doğrulandı. Gelecekteki rol atamaları doğrulanmış Auth UUID'si ile kontrollü `postgres` işleminde yapılmalı; rol koruma trigger'ı etkin tutulmalıdır.

Worker için public build değerleri `.env.production` içinde tutulur ve Git tarafından yok sayılır: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `TURNSTILE_SITE_KEY`, `APP_URL`, `STUDIO_URL`. Bunlar build öncesinde hazır olmalıdır. `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_RATE_PEPPER` Cloudflare Worker **Secret** olarak tutulur; `.env.production` veya Git'e yazılmaz. API endpointleri bunları runtime'da `cloudflare:workers` env üzerinden okur. Üç secret Wrangler secret list ile doğrulanmıştır.

```powershell
npm run verify
npm run test:e2e
npx wrangler deploy --config dist/server/wrangler.json
npx wrangler secret list --name palmarghe
```

`wrangler deploy` uzaktaki Worker config'ini yerel üretilen config ile karşılaştırabilir. Deploy sonrasında üç custom domain, Worker Secret'ları, apex/Studio HTTPS ve `www` yönlendirmesini tekrar kontrol edin. `LOCAL_TEST_MODE` yalnız geliştirme ortamında ve loopback test isteğinde etkindir.

Turnstile ile gerçek iletişim gönderimi ve Studio gelen kutusuna kaydı doğrulandı. SMTP/Auth e-posta callback ve reset, production member/editor rol matrisi, Cloudflare Access, Search Console ve ayrı preview Supabase projesi hâlâ kontrol edilmelidir. Cloudflare Zero Trust Free onboarding ödeme kartı, Terms kabulü ve aylık aşım tahsilatı yetkisi istediği için Access aktivasyonu otomatik yapılmadı.
