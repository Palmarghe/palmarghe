# Dağıtım

Cloudflare Workers Astro adapter kullanılır. Önce Supabase projesi oluşturup migration'ı uygulayın. Supabase Auth site/redirect URL'lerini, SMTP sağlayıcısını ve Turnstile widget'ını yapılandırın. Worker secret'ları `.env.example` ile eşleyin. Preview ayrı Supabase projesiyle ve noindex kuralıyla yayınlanmalıdır.

Migration dosyalarını ad sırasıyla uygulayın (`202609160001`–`202609160008`). `SUPABASE_SERVICE_ROLE_KEY` ve `CONTACT_RATE_PEPPER` yalnız sunucuda secret olmalı. `LOCAL_TEST_MODE` production'da kullanılmaz. İlk admin için doğrulanmış auth UUID'sini migration sahibi `postgres` yetkisiyle güncelleyin; rol ve trigger durumunu kontrol edin. Trigger'ı devre dışı bırakmayın. Auth rate limit, contact RPC, RLS ve Storage policy'lerini gerçek projede anon/member/editor/admin oturumlarıyla test edin. Preview ve production için ayrı secret setleri kullanın.

DNS değişikliğinden önce Turhost'taki tüm kayıtları dışa aktarın; MX/SPF/DKIM ve diğer mevcut kayıtları inceleyin. Cloudflare zone'da eşdeğer kayıtları doğrulamadan nameserver değiştirmeyin. Bu depoda henüz DNS işlemi yapılmamıştır.
