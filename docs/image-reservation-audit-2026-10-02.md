# Article image and readership reservation — 2 October 2026

## Production and changes

Worker `12e14605-beb3-4040-b765-5433108b2be3` is the current release. Migrations036/037 and existing content/Auth/Storage are preserved. Intermediate Worker6202c3cd applied image metadata only; the final release also reserves readership.

- The actual local portrait is655×1000; the article previously declared1200×750. Article covers now use measured local dimensions or valid dimensions from their own media proxy row. Unknown dimensions are not invented. Gallery markup uses valid existing media dimensions; its existing CSS3:2 crop reserves space when metadata is absent.
- The existing cover query includes exact older detail items beyond the latest30 and selects already-existing width/height fields; no schema migration or additional request is introduced.
- `scripts/prepare-image-dimensions.mjs` records62 local raster assets using Sharp metadata. Original pixels are untouched. Sharp0.35.4 is explicitly pinned as a development dependency; this metadata inspection is not runtime upload decoding. Unit checks compare every recorded asset with its source metadata. Regenerate the manifest after replacing assets.
- A real delayed-cover regression first caught25.109375px mobile displacement. The cause was asynchronous insertion of readership into wrapping metadata. A server-rendered reserved row now exists before JavaScript and receives actual counts. Loading/error text is TR/EN; invalid numbers do not become fake zeros; read fetching aborts after10s. Automated-navigation write suppression is retained. Script URL is versioned.
- Public CSS72773bytes and Studio115534bytes retain the previous build-only isolation. Both receive the small shared readership rule; previous exact Studio-byte-equality evidence belongs to the historical CSS release, not this new stylesheet.

## Verification and failed observations

- Final verify: Astro0 diagnostics,136/136 unit tests, successful build. Dependency audit0 vulnerabilities.
- Full local browser59/59. Earlier targeted media/permission2/2 and gallery1/1 also passed. The existing Vite navigation AbortError in the tags test remains a development-log finding; clean development logs are not claimed.
- Final Worker:25 production cases passed for all indexable sitemap pages in both themes, ten widths/form routes, images, console/security, embeds and minimized analytics. The combined26-case run also contained a fixture failure because a reused page had an already decoded cover. This did not exercise delayed delivery for its second combination.
- The fixture was corrected to use a fresh browser context for each combination. All4 delayed-image and delayed-readership regressions passed at390/1440px × dark/light, requiring an incomplete real image before release, real655px decoded width after release and less than1px change in x/y/width/height after each response. Coverage is25 passed cases plus4 corrected cases across runs; no single29-case green run is claimed. Metrics are intercepted before all writes; production counters are not populated by these tests.
- Real Chrome confirms655×1000 source metadata, existing object-fit:cover, the reserved row and actual counts in light theme. Screenshot: `image-reservation-chrome-2026-10-02.png`.
- Before the release, documentation commit780a7dc Actions37050123673 completed successfully. This release's Actions result is verified after push.

## Performance evidence

`image-reservation-lab-2026-10-02.json` contains the final serial Lighthouse13.5.0 simulated-mobile sample, Worker, fetch time, settings, original-image hash and limits. No build/repository browser test ran concurrently. Performance97, LCP2279.78ms, CLS0, TBT0, server response404ms, transfer326008bytes.

Previous CSS-release article sample had LCP3009.473ms/CLS0.0113 and server response651ms. These are single serial observations on different releases; latency variation prevents a causal speedup claim. The deterministic delayed-response test proves the specific reservation correction. TBT is not INP, and one passing sample is not a field percentile or completion of the full performance gate.

## Scope and rollback

Revert this release's code and redeploy or roll back Worker to b5fd38ce. Keep migrations036/037 and cleanup receipts; no database rollback is needed. Original images/content are untouched.

Requirements18/19/29/36 advance; the full40-section goal remains active. Unknown uploaded-image metadata/decoding, failed-upload orphans, other card/body/OG intrinsic dimensions, Studio state/keyboard coverage, field INP/CWV and manual AT/cross-browser work remain open. Source inspection also found two h1 elements on the dynamic public-author branch; existing sitemap scans do not establish coverage of a real public-author page. Track this in requirements15/22.

Tooling incident: a Python alias unexpectedly invoked its install manager while attempting a text edit. It was interrupted; all edits used PowerShell afterward. No Python dependency was added to this project.
