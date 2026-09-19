# Search Console DNS değişikliği öncesi durum ve geri dönüş

19 Eylül 2026. Cloudflare DNS panelindeki zone, değişiklik öncesinde `docs/dns-zone-backup-2026-09-19.txt` dosyasına BIND biçiminde dışa aktarıldı. Export SOA ve NS içeriyor; Cloudflare'ın otomatik Worker kayıtlarını **içermiyor**. Panelde ayrıca üç kayıt doğrulandı: `palmarghe.com`, `studio.palmarghe.com` ve `www.palmarghe.com` → Worker `palmarghe`, proxied, TTL Auto. Başka DNS kaydı listelenmedi. Önceki zone ve delegasyon geçmişi `docs/dns-backup-2026-09-16.md` içinde.

Planlanan tek değişiklik: apex `palmarghe.com` için Google Search Console sahiplik TXT kaydı eklemek. NS, DS, DNSSEC, Worker kayıtları ve proxy durumları değiştirilmeyecek. Değişiklikten sonra yetkili ve recursive DNS'te TXT görünürlüğü, mevcut NS çifti ve canlı apex/Studio HTTPS doğrulanacak.

Geri dönüş: Eklenen Google TXT kaydını Cloudflare DNS panelinde yalnız kendisi seçilerek kaldır; bu dosyadaki NS ve üç Worker kaydının yerinde kaldığını, apex ve Studio HTTPS'in çalıştığını tekrar doğrula. Export dosyasını doğrudan import ederek mevcut Worker kayıtlarını ezme; export yalnız arşiv referansıdır.

## Uygulama ve doğrulama

- Apex TXT `google-site-verification=yqJonD7E2cMAFJASj9tWPyKQHMyVfJ1VAaC58zAGDt4` Cloudflare'a DNS only / TTL Auto ile eklendi. `1.1.1.1` resolver kaydı döndürdü.
- Google Search Console `palmarghe.com` domain mülkü için “Sahiplik doğrulandı” gösterdi. Kayıt, sahiplik devam etsin diye korunmalı.
- `https://palmarghe.com/sitemap.xml` HTTP 200 / `application/xml` döndü, Search Console sitemap'i başarıyla işledi ve 20 sayfa keşfetti. İlk listede geçici “Getirilemedi” görünümü ayrıntı sayfasında başarılı sonuca güncellendi.
- Değişiklik sonrası `palmarghe.com` ve `studio.palmarghe.com` HTTPS 200; NS çifti `kaiser.ns.cloudflare.com` / `serenity.ns.cloudflare.com` olarak kaldı.
