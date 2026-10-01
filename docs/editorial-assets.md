# FM26 oyuncu incelemesi görselleri

- `public/editorial/lamine-yamal.webp`: Biso, **Lamine Yamal in 2025**, 4 September 2025. Source: https://commons.wikimedia.org/wiki/File:Lamine_Yamal_in_2025.jpg . License: https://creativecommons.org/licenses/by/4.0/ . Resized to 1000 px height and converted to WebP; no synthetic player portrait was used.
- `public/editorial/yamal-right-channel.svg`: original Palmarghe tactical diagram. An illustrative proposed shape, not an FM screenshot or recorded match data. Rasterized PNG is used in the Studio media library.
- Article is an intentional QA publication (`indexable=false`) and can be edited or archived through Studio. Tactical recommendations are editorial hypotheses to test in the reader's own save; numeric FM attributes, fees and simulated match results are not fabricated.

## Optimized public music covers

The original PNG covers under `public/visuals/music/` remain available unchanged. Public rendering and search results use responsive 480, 960 and 1440 px WebP candidates without editing production content rows. All 12 rendition files total 946 KB, compared with about 8.9 MB for the four original PNGs. Production E2E verifies `srcset`, image/webp response types, successful HTTP responses, and per-file ceilings of 120 KB for 480/960 px and 300 KB for 1440 px. The 1 October Lighthouse 12 mobile-profile measurement was taken before the 480/960 px variants: 98 performance, 2.11 s LCP, CLS 0, TBT 0 and about 1.01 MB transferred.
