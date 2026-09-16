# Güvenlik durumu

- Supabase RLS açık, yayın durumu ve rol politikaları migration'da.
- Studio sunucuda kullanıcı ve rol kontrolü yapar.
- Yazma API'leri Origin kontrolü yapar; input Zod ile doğrulanır.
- İletişim formu Turnstile doğrulaması olmadan kayıt yapmaz. Production contact kayıtları `submit_contact` RPC ile 15 dakikada 5 istek sınırına tabidir.
- Yanıt başlıklarında CSP, frame yasağı, nosniff, Referrer ve Permissions politikaları var.
- Hesap/Studio/API no-store ve noindex.

## Henüz tamamlanmayanlar

Login rate limit, MFA zorunluluğu, kapsamlı audit event yazımı, RLS/Storage entegrasyon testleri ve güvenlik taraması. Canlı yayına geçmeden önce tamamlanmalıdır.
