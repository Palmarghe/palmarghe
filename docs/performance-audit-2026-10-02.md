# Production performance audit — 2 October 2026

Current Worker: `9cea5697-c203-415f-8fc0-c5eaeab9846c`. Intermediate image-only deployment: `9458062d-afe9-41a3-8614-760af2bef511`.

## Method and limits

Lighthouse 13.5.0 CLI, installed Node 24.19.0, headless Chrome, fresh default navigation profiles. Mobile default throttling and desktop preset are recorded in `performance-lab-2026-10-02.json`. URLs include `?verify=lighthouse` so measurement clients exclude QA writes; this query does not change rendered content. Error-report upload was disabled. Raw reports remain under ignored `test-results/performance/`; `scripts/summarize-performance.mjs` records metrics/settings/network evidence without screenshots or traces in Git.

These are individual laboratory observations, not field percentiles, medians, device guarantees or INP measurements. Final runs overlapped a Chrome E2E run, so CPU/network competition and observed run variance limit timing comparisons. TBT is not INP. Automated accessibility 100 does not prove WCAG conformance. The QA article is intentionally noindex, explaining its SEO score 69; indexing it merely to raise a score would violate its publication intent.

## Observations

| Sample | Worker | Performance | LCP | CLS | TBT | Transfer bytes | Server response |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile home before | 14c7f7e5 | 96 | 2.505 s | 0 | 0 ms | 774,318 | 731 ms |
| Mobile home, image change | 9458062d | 98 | 2.106 s | 0 | 0 ms | 502,684 | 773 ms |
| Desktop home, image change | 9458062d | 98 | 0.963 s | 0 | 0 ms | 337,689 | 631 ms |
| Mobile QA article before read batching | 9458062d | 93 | 2.993 s | 0.0113 | 0 ms | 335,735 | 997 ms |
| Mobile home final | 9cea5697 | 96 | 2.531 s | 0 | 0 ms | 505,082 | 499 ms |
| Mobile QA article final | 9cea5697 | 94 | 2.892 s | 0.0113 | 0 ms | 335,765 | 480 ms |

## Changes and justification

- Four category thumbnails downloaded their 1440×900 originals despite narrow cards. Added 480/768/960 WebP renditions from the existing images, preserving originals, composition and editorial content. `scripts/prepare-editorial-renditions.mjs` reproduces them with existing Sharp. No new browser dependency.
- Category `srcset` now lists real renditions. Lazy images use `sizes="auto"` with explicit fallback sizes. The browser can use the actual card width; fallback supports browsers without auto sizes. The four category requests fell from 359,058 to 71,649 transferred bytes in the captured mobile runs (about 80% less). Whole-page transfer fell about 35%. This reduction is direct network evidence; LCP variance is not attributed wholly to it.
- Five independent taxonomy/advertising/collection/tag/home-setting reads now execute together through the same request client. Publication lookup remains first; filters, RLS, request cookies, limits, no-store HTML and all dependent reads are preserved. No cross-user cache or service-role content query was introduced. This removes serial network waits but does not guarantee every server response time.

## Verification

- Final verify: Astro 0 errors/warnings/hints, Vitest 55/55, build successful.
- Final local affected E2E: 6/6; mobile artwork, old publication/draft boundary, nested multilingual taxonomy, membership permissions/comments and author notifications.
- Image-only production smoke/SEO: 10/10, including ten viewport widths and theme persistence.
- Final production affected E2E: 6/6, including category images at 390/768/1440 px in both themes, all 32 sitemap URLs and reciprocal metadata, public assets/routes, schema, security headers and console.
- Native search pointer production regression passed separately. Real Chrome inspected the loaded category images and reloaded the final deployment successfully. Production content, users and historical metrics were not edited.

## Still open

Mobile LCP <2.5 seconds is **not achieved across representative pages**. Both final mobile samples exceed it; further resource/render analysis is required. Studio CSS sharing, render blocking, server request waterfalls, actual font usage/swap, all asset-cache headers and responsive Storage/cover/OG variants remain to audit. Do not introduce HTML caching that hides Studio changes or personalized data. Field INP/CWV and physical device tests remain unproven. The full 40-section goal is active.

References: [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse), [MDN image sizes](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes), [MDN img fallback rules](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img).

Rollback: revert this release normally, build and deploy the previous code. Original image URLs remain valid. No database migration or data rollback is needed.
