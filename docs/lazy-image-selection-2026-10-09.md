# Lazy image selection follow-up — 9 October 2026

## Verified issue and implementation

Connected Edge inspection of the live archive on Worker eabe551c confirmed all eight visible publication covers lacked both `srcset` and `sizes`. This was a real public-renderer omission, including four original-media proxy images. The existing RLS-bound batch already supplies ready derivative descriptors; the archive/category card renderer now consumes that same source function.

Seven lazy public card groups retain their existing size fallback list and add `auto` so supporting browsers select against actual rendered width. Body images and galleries use the same approach. Original `src`, image inspector URLs, dimensions, eager hero/LCP loading and original files are preserved. No database migration, Storage mutation, production content or account change is involved.

Primary reference: [WHATWG responsive images](https://html.spec.whatwg.org/dev/images.html). Auto sizes applies to lazy images; the explicit fallback list preserves behavior where auto is unsupported. Browser support is not claimed universal.

## Meaningful local evidence

The existing real-generation/privacy/cleanup test was extended to publish a controlled local article, view its archive card anonymously at390px/DPR1.75, read actual `currentSrc`, decode the downloaded bytes with Sharp and compare bytes with the960px candidate. It selected a640px WebP, its rendered width times DPR fit640, and bytes were smaller than960. The original SHA remained unchanged; unpublished derivative access and cleanup remained covered. This test initially failed because the archive lacked responsive attributes; fixing that renderer made it pass. Scoped result1/1 in10.0s.

Verify passed249 files with zero diagnostics,221 unit tests and build. Full local121-case regression passed121/121 in5.3m. Unchanged visual comparison passed36/36 in35.0s, covering public/Studio phone/desktop dark/light/Aurora. Production deployment/live checks remain required. A dedicated production archive test now checks the same actual source selection, decoded width, original byte comparison and bounds without production writes.

## Release status

Deployed from clean committed sourceb7d0682 after normal main push/build. Worker485bb85d-8ddd-4fbf-804a-86852d1663f4; scoped live media3/3 passed11.3s, including actual640px phone source/decoded bytes and original byte reduction. Connected Edge archive confirms all eight images now have responsive sources; visible225.55px cards selected320px ready WebPs, completed loading and remained within the viewport. Screenshot: archive-responsive-release-2026-10-09.png. Native Studio session still denies access, so this is public proof only.

Native390px/DPR1 dark/light archive proof is saved as archive-responsive-mobile-2026-10-09.png and archive-responsive-mobile-light-2026-10-09.png. Its293.29px original-media card selected320px, loaded successfully and remained within bounds. The temporary viewport and original dark preference were restored. This distinct real-DPR proof is not confused with the dedicated Chrome390px/DPR1.75 test's640px selection.

New full production83/83 passed5.9m. Source Actions37856721050 is Success: verify7m41s (121 E2E6.4m), visual2m1s, production-smoke3m3s; total10m52s, inspected in connected Edge. This follow-up is part of performance requirement3; it does not close the entire fourteen-item scope or establish field Core Web Vitals.

## Comparable sequential mobile lab follow-up

Both Lighthouse13.5.0 samples used mobile defaults and the previous headless flags/four categories, after local and full production suites ended. QA URLs use verify=lighthouse to exclude measurement from organic traffic. Compact settings/network evidence: lazy-image-performance-2026-10-09.json. Raw ignored reports: test-results/performance/lazy-home-20261009.json and lazy-article-20261009.json.

| Page | Performance | Simulated LCP | CLS | TBT | Transfer | Observed document response |
|---|---:|---:|---:|---:|---:|---:|
| Home |98|2102ms|0|0|678316 bytes|273ms|
| KaanBuilder |97|2402ms|0|0|286562 bytes|394ms|

Automated accessibility/best practices/SEO100 in both. Prior2759c92 single samples were home97/LCP2458ms/680674 bytes and article94/LCP3062ms/368060 bytes. These are single samples, not medians, field CWV or causal speed claims. The article transfer fell81498 bytes (22.1%), but network inspection shows the previously fetched offscreen related960px cover absent from the new capture; it is not proof that the same fetched image became smaller. The two eager/visible image requests still use960px. A separate native390px keyboard navigation check brought both related cards into view: they completed loading320px candidates at actual293–306px width/DPR1, with no overflow or console warnings/errors. The archive DPR1.75 test separately proves actual640px selection and byte reduction.

Current native archive review also identifies a remaining mobile-density improvement: stacked filters and the section gap push the first card title beyond the initial screen. This remains a shared-design follow-up, not a completed requirement hidden by passing performance tests.
