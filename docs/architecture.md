# Mimari

Tek Astro SSR uygulaması public ve Studio rotalarını ayırır. Public sayfalar server tarafında Supabase anon istemcisi ve RLS ile yalnız yayınlanmış içeriği okur. Studio her istekte `auth.getUser()` ve veritabanındaki rolü denetler. Yazma işlemleri aynı kullanıcı oturumuyla yapılır; RLS ikinci sınırdır. Hiçbir hizmet anahtarı browser'a gönderilmez.

Bu yapı, boş depoda monorepo yükünü azaltır. İleride Studio ayrı host/Worker'a ayrılabilir.
