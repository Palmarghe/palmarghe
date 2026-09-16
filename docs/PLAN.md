# Palmarghe V1 Plan

## Başlangıç durumu

16 Eylül 2026: Depo `master` dalında boş ve henüz commit yok. Git remote tanımlı değil. Paket marka yönü ve görev tanımından oluşuyor. Sağlayıcı credential'ları henüz doğrulanmadı.

## Mimari

Astro SSR + Cloudflare Workers; public ve studio route'ları tek uygulamada ayrı güvenlik sınırlarıyla. Supabase Auth/Postgres/Storage, server tarafı oturum doğrulaması ve RLS. Türkçe kök, İngilizce `/en/`. İçerik ve navigasyon veritabanından gelir; yayın verisi yoksa dürüst empty state gösterilir.

## Aşamalar

1. Marka, tasarım sistemi, public rota ve i18n.
2. Migration, RLS, auth ve Studio CRUD.
3. İçerik detayları, arama, iletişim, medya ve site ayarları.
4. SEO, güvenlik, test, CI ve dokümantasyon.
5. Erişim varsa deployment, DNS ve gerçek tarayıcı doğrulaması.

## Riskler

- Supabase, Cloudflare ve GitHub erişimi/anahtarları mevcut olmayabilir.
- E-posta, Turnstile, owner kimliği ve domain DNS'i dış ayara bağlı.
- Bu bağımlılıkların yokluğu canlı akışların tamamlanmasını engeller; kod ve manuel adımlar yine hazırlanır.
