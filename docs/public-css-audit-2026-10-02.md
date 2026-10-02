# Public stylesheet isolation audit — 2 October 2026

Current Worker: `b5fd38ce-e31d-4f72-848e-e581050a4caa`. Baseline: `90ef6f57-c845-4f40-aa5d-25992490019f`. Migrations036/037 and existing security/recovery behavior remain active. No editorial text, Auth account or physical file was changed.

## Justification and implementation

Public pages previously loaded the full 115,424-byte stylesheet, including Studio editor/ribbon/workspace rules. A build-only public variant now removes 424 rules requiring positive top-level Studio namespace selectors. One source stylesheet remains authoritative. Studio imports the original file; public pages import its `?public` variant. Original order of retained rules is preserved. Mixed selector groups, negative/alternative pseudo scopes, unknown selectors, nested rules, keyframes and font declarations remain untouched.

This avoids manually duplicating source styles or moving cascade-sensitive Studio overrides. Namespace ownership must be preserved: public components must not reuse admin-/studio-/editor-/content-editor-/classic-/ribbon-/media-cleanup- classes or #block-editor. Unit fixtures cover mixed cascade, negative/alternative scopes, nested CSS, keyframes and unknown rules. The build-only hook uses the existing [Vite plugin API](https://vite.dev/guide/api-plugin.html) and [PostCSS selector AST](https://github.com/postcss/postcss-selector-parser). No parser or extra runtime script is shipped to browsers or Worker code.

## Resource evidence

| CSS | Resource bytes | Local gzip equivalent | Lighthouse transfer |
| --- | ---: | ---: | ---: |
| Previous public / preserved Studio | 115,424 | 22,014 | 25,425 before public sample |
| New public | 72,663 | 14,598 | 17,147 after public sample |

Raw public CSS is about37% smaller; observed stylesheet transfer is about33% smaller. gzip equivalent is a local compression comparison, not the CDN wire encoding. Both deployed files match the build and have one-year immutable cache headers. Studio SHA256 exactly matches the measured original stylesheet: `353368eef2b474405c772d161072351e2823ac811409e7335985ad0893febf4e`.

## Timing and remaining performance gate

Lighthouse13.5.0 mobile simulated defaults, serial samples with no concurrent local build/browser tests. An initial overlapping sample was excluded. Reproduce the summary with `node scripts/summarize-public-styles.mjs` after generating the named raw reports under ignored test-results/performance.

| Sample | Performance | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| Home before | 98 | 2.108s | 0 | 0ms |
| Home after | 98 | 2.324s | 0 | 0ms |
| QA article after | 93 | 3.009s | 0.0113 | 0ms |

These are individual observations, not medians/field percentiles or causal timing proof. Home LCP increased in the paired samples despite reduced CSS bytes; no timing speedup is claimed. Article has no fresh paired baseline and still fails LCP<2.5s. TBT is not INP. Full performance gates remain open. Source asset metadata also confirms article portrait655×1000 differs from hardcoded cover attributes1200×750; investigate reservation/cropping before correcting dimensions, without attributing measured CLS to this finding.

## Verification

- Astro0 diagnostics; unit129/129; build success; npm dependency audit0 findings.
- Full local browser59/59, including Studio editor, role/CRUD, theme, mobile, modal and save recovery. Existing development Vite navigation-abort diagnostic still occurs in content-tag test; do not claim clean development logs.
- Production39/39: all sitemap pages in both themes through serious/critical WCAG scans, ten widths, forms/profile fixtures, images, cursor/search, no-JS search and security/console smoke.
- Removed-selector regression scans every sitemap URL plus QA article/TR/EN account and real search results; no removed selector matches public DOM. This is route/state coverage, not proof of every possible future component state.
- Actual Chrome public page loads Site.B5V9fJNn.css; existing authenticated admin Studio loads index.BP5JUn22.css and its light-theme dashboard. Screenshots: public-css-home-2026-10-02.png and public-css-studio-2026-10-02.png.
- Previous fc69e67 Actions37046639598 succeeded. Current release CI is checked after push.

## Rollback and scope

Revert Site's stylesheet import and the config plugin, build and deploy, or roll back Worker to90ef6f57. Keep all database migrations and durable media receipts. No database rollback is required.

This advances requirements19/21/34/36 without closing the full40-section goal. Source CSS historical overrides/token consolidation, upload orphan/decoding safety, complete Studio state/keyboard coverage, article performance, field INP/CWV and manual assistive technology/cross-browser review remain open.
