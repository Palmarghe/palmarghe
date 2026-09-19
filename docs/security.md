# Güvenlik durumu

- Supabase RLS açık, yayın durumu ve rol politikaları migration'da.
- Studio sunucuda kullanıcı ve rol kontrolü yapar.
- Yazma API'leri Origin kontrolü yapar; input Zod ile doğrulanır.
- İletişim formu Turnstile doğrulaması olmadan kayıt yapmaz. Production contact kayıtları `submit_contact` RPC ile 15 dakikada 5 istek sınırına tabidir.
- Yanıt başlıklarında CSP, frame yasağı, nosniff, Referrer ve Permissions politikaları var.
- Giriş, kayıt ve sıfırlama girişimleri 15 dakikalık pencerede IP/eylem başına 30 ve IP/eylem/e-posta başına 10 (giriş) veya 5 (diğerleri) ile sınırlıdır. Production, `allow_auth_attempt` RPC ve pepper ile hashlenmiş anahtar kullanır; RPC yalnız service role'a açıktır.
- Rol değişimi admin RPC'si ile yapılır; öz rol değişimi ve son admin'i düşürme engellenir. İçerik/kategori/etiket/medya/navigasyon/yönlendirme ve rol değişimi audit kayıtları üretir.
- İçerik, kategori ve etiket ilişkileri `save_content_with_relations` SECURITY INVOKER RPC'sinde tek transaction içinde yazılır. Fonksiyon yalnız authenticated kullanıcılara açıktır; içeride editor/admin rolü doğrulanır ve RLS etkin kalır.
- Hesap/Studio/API no-store ve noindex.

## Henüz tamamlanmayanlar

MFA sağlayıcıda yapılandırılmadı. Production Supabase migration 001–010, anonim RLS erişim/red kontrolleri ve admin Storage yüklemesi doğrulandı; ayrıntı `FINAL_REPORT.md` dosyasındadır. Gerçek member/editor rol matrisi, Auth e-posta akışı, şifre sıfırlama callback'i ve geniş kapsamlı üretim E2E hâlâ açıktır. Local adapter politika ve RPC davranışını yaklaşıklar; bu roller için üretim yetki kanıtı değildir.
