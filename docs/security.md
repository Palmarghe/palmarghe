# Güvenlik durumu

- Supabase RLS açık, yayın durumu ve rol politikaları migration'da.
- Studio sunucuda kullanıcı ve rol kontrolü yapar.
- Yazma API'leri Origin kontrolü yapar; input Zod ile doğrulanır.
- İletişim formu Turnstile doğrulaması olmadan kayıt yapmaz.
- Yanıt başlıklarında CSP, frame yasağı, nosniff, Referrer ve Permissions politikaları var.
- Hesap/Studio/API no-store ve noindex.

## Henüz tamamlanmayanlar

Login rate limit, MFA zorunluluğu, kapsamlı audit event yazımı, Storage policy, RLS entegrasyon testleri ve güvenlik taraması. Canlı yayına geçmeden önce tamamlanmalıdır.
