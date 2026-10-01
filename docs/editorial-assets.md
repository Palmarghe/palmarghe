# FM26 oyuncu incelemesi görselleri

- `public/editorial/lamine-yamal.webp`: Biso, **Lamine Yamal in 2025**, 4 September 2025. Source: https://commons.wikimedia.org/wiki/File:Lamine_Yamal_in_2025.jpg . License: https://creativecommons.org/licenses/by/4.0/ . Resized to 1000 px height and converted to WebP; no synthetic player portrait was used.
- `public/editorial/yamal-right-channel.svg`: original Palmarghe tactical diagram. An illustrative proposed shape, not an FM screenshot or recorded match data. Rasterized PNG is used in the Studio media library.
- Article is an intentional QA publication (`indexable=false`) and can be edited or archived through Studio. Tactical recommendations are editorial hypotheses to test in the reader's own save; numeric FM attributes, fees and simulated match results are not fabricated.

## Optimized public music covers

The original PNG covers under `public/visuals/music/` remain available unchanged. Their 1440 px WebP counterparts are served by public cover rendering and search results to reduce transfer size without editing production content rows. The four WebP files total about 573 KB compared with about 8.9 MB for the original PNGs. A production Lighthouse 12 mobile-profile run on 1 October 2026 measured a 98 performance score, 2.11 s LCP, CLS 0 and TBT 0; total page transfer was about 1.01 MB. The production E2E suite checks the rendered WebP type and a 300 KB per-image ceiling.
