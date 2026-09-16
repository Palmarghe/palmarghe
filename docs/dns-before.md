# DNS ön kontrolü — 16 Eylül 2026

Bu kayıt, **salt okunur** sorgulardır; tam Turhost zone export'u değildir. Panelde açık eski sekme alan adı yönetimine geçince `/login` sayfasına yönlendirdi. Oturum yenilenmeden tüm kayıtları doğrulamak mümkün olmadı. Hiçbir DNS veya nameserver değişikliği yapılmadı.

- Google Public DNS DoH, `palmarghe.com` için NS/MX/A/TXT/CAA sorgularının tümünde `Status: 2` (SERVFAIL) döndürdü.
- Cloudflare DoH NS sorgusu da `Status: 2` döndürdü: `No Reachable Authority at delegation palmarghe.com`; yetkili olarak sorgulanan `37.230.111.111:53` sunucusu `REFUSED` yanıtladı.
- Yerel resolver da `palmarghe.com` NS/MX/A ve `www.palmarghe.com` CNAME için sunucu hatası verdi.

Bu sonuç mevcut DNS'in sağlıklı çözülmediğini gösteriyor; panel zone verisi, delegasyon ve nameserver durumuyla birlikte doğrulanmalı. Panel erişimi sağlanınca mevcut A/AAAA/CNAME/MX/TXT/CAA/NS kayıtlarının tümünü ve TTL'lerini dışa aktarın; mail kayıtlarını koruyun. Servisler hazır olmadan nameserver değiştirmeyin. Public resolver sonuçları anlık durumdur ve zamanla değişebilir.
