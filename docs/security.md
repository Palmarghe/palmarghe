# Güvenlik durumu

- Supabase RLS açık, yayın durumu ve rol politikaları migration'da.
- Studio sunucuda kullanıcı ve rol kontrolü yapar. İçerik blokları yalnız izinli şema türlerini işler; medya UUID'si, iç bağlantı/HTTPS URL, gömme başlığı ve tablo yapısı doğrulanır. Gömme yalnız YouTube veya Vimeo'nun doğrudan HTTPS player alan adlarına izin verir. Gömülü çerçeveler sandbox ve sıkı referrer policy ile render edilir.
- Yazma API'leri Origin kontrolü yapar; input Zod ile doğrulanır.
- İletişim formu Turnstile doğrulaması olmadan kayıt yapmaz. Production contact kayıtları `submit_contact` RPC ile 15 dakikada 5 istek sınırına tabidir.
- Yanıt başlıklarında CSP, frame yasağı, nosniff, Referrer ve Permissions politikaları var.
- Giriş, kayıt ve sıfırlama girişimleri 15 dakikalık pencerede IP/eylem başına 30 ve IP/eylem/e-posta başına 10 (giriş) veya 5 (diğerleri) ile sınırlıdır. Production, `allow_auth_attempt` RPC ve pepper ile hashlenmiş anahtar kullanır; RPC yalnız service role'a açıktır.
- Rol değişimi admin RPC'si ile yapılır; öz rol değişimi ve son admin'i düşürme engellenir. İçerik/kategori/etiket/medya/navigasyon/yönlendirme ve rol değişimi audit kayıtları üretir.
- İçerik, kategori ve etiket ilişkileri `save_content_with_relations` SECURITY INVOKER RPC'sinde tek transaction içinde yazılır. Fonksiyon yalnız authenticated kullanıcılara açıktır; içeride editor/admin rolü doğrulanır ve RLS etkin kalır.
- Hesap/Studio/API no-store ve noindex.

## Henüz tamamlanmayanlar

Supabase Auth TOTP faktörü etkin; uygulama MFA kayıt ve zorunluluk akışını henüz uygulamıyor. Özel SMTP kapalı; gerçek e-posta teslimatı ve reset callback'i doğrulanmadı. Production migration geçmişi `202609160001`–`202609210014` ile eşleşir. 19 Eylül'de geçici member/editor hesaplarıyla Auth, profil, inbox, audit, private draft, kategori yazma, appearance yazma ve Storage için 20 olumlu/olumsuz production kontrolü geçti; iki hesap ve ilişkili kayıtlar temizlendi. 26 Eylül'de ayrı bir confirmed member ile profil bio/avatar kaydı, authenticated-only yorum ve member Studio yazma engeli canlı doğrulandı; bu test hesabı ve açıkça işaretli yorum tekrarlanabilir topluluk QA kanıtı olarak tutuldu. Ayrıntı `FINAL_REPORT.md` dosyasındadır.
