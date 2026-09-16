# Dağıtım

Cloudflare Workers Astro adapter kullanılır. Önce Supabase projesi oluşturup migration'ı uygulayın. Supabase Auth site/redirect URL'lerini, SMTP sağlayıcısını ve Turnstile widget'ını yapılandırın. Worker secret'ları `.env.example` ile eşleyin. Preview ayrı Supabase projesiyle ve noindex kuralıyla yayınlanmalıdır.

DNS değişikliğinden önce Turhost'taki tüm kayıtları dışa aktarın; MX/SPF/DKIM ve diğer mevcut kayıtları inceleyin. Cloudflare zone'da eşdeğer kayıtları doğrulamadan nameserver değiştirmeyin. Bu depoda henüz DNS işlemi yapılmamıştır.
