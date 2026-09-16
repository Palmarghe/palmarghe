# Palmarghe

Türkçe/İngilizce creator journal ve Studio başlangıcı. Astro SSR, Supabase ve Cloudflare Workers hedeflenir. Üretim durumu ve eksikler için [FINAL_REPORT.md](FINAL_REPORT.md) dosyasına bakın.

## Yerel kurulum

1. Node 20+ ve npm kurun.
2. `npm ci`
3. `.env.example` dosyasını `.env` olarak kopyalayıp kendi Supabase/Turnstile değerlerinizi girin.
4. Supabase migration'ı uygulayın: `supabase db push` veya SQL Editor.
5. `npm run dev`; test için `npm run verify`.

Boş env ile public tasarım ve boş durumlar görülebilir. Veri, hesap ve iletişim işlevleri bağlı servis gerektirir.

## Yapı

- `src/pages/[...path].astro`: public iki dil ve içerik rotaları
- `src/pages/studio/`: role gated Studio
- `src/pages/api/`: server işlemleri
- `src/lib/`: veri ve yol yardımcıları
- `supabase/migrations/`: şema ve RLS
- `docs/`: mimari, güvenlik ve kurulum notları

## Komutlar

- `npm run dev`: local server
- `npm run typecheck`: Astro/TypeScript
- `npm run test`: Vitest
- `npm run build`: Workers build
- `npm run verify`: typecheck, test, build
