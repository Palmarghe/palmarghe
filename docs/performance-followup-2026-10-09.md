# Sequential mobile performance follow-up — 9 October 2026

Current measured deployment:2759c92 / Worker dab52194-2cfd-4ed5-a883-d03b10a44034. Both samples used Lighthouse13.5.0 mobile defaults and the same four categories/headless flags as7 October. Local/production regression and verify processes had ended before measuring; pages were measured sequentially. The verify=lighthouse marker excludes QA measurement from normal organic traffic.

| Page | Performance | LCP (simulated) | CLS | TBT | Transfer | Observed document response |
|---|---:|---:|---:|---:|---:|---:|
| Home |97|2458 ms|0|0|680674 bytes|1034 ms|
| KaanBuilder |94|3062 ms|0|0|368060 bytes|524 ms|

Accessibility/best practices/SEO automated scores100 for both. These are single laboratory samples, not medians, field Core Web Vitals, organic traffic or causal proof. Prior e00 samples were home95/LCP2701ms/document370ms and article96/LCP2415ms/document1174ms. Home simulated LCP improved in this pair while article simulated LCP did not; article observed document and image load improved. Do not claim a universal performance improvement from this comparison.

Actual article LCP discovery remains correct: high priority, initial-document discovery, eager load. Its observed breakdown changed from TTFB1507/image541ms to740/image232ms, with render delay~23ms in both, while simulated mobile LCP increased. Render blocking CSS is22690 transfer bytes; Lighthouse estimated417ms blocking in this sample. Image delivery still reports candidate-size savings. Remaining work: bounded CSS/candidate review and repeated comparable samples only to resolve these concrete remaining performance risks, without changing original media or bypassing private RLS.

Compact reproducible settings/resource metrics: performance-followup-2026-10-09.json. Raw ignored reports: test-results/performance/followup-home-20261009.json and followup-article-20261009.json. New actor/password worktree was not deployed or measured.

Concrete candidate-selection follow-up located by source/report inspection: lazy related cards declare100vw at phone width while Lighthouse measured330px card width inside a412px viewport. At the lab DPR the declared source size can select960px where the real rendered width fits640px. The WHATWG standard supports auto sizes for lazy images with an explicit fallback list (https://html.spec.whatwg.org/dev/images.html); retain real width/height layout reservation. This is a pending separate change, not deployed and not a claim that every browser has identical support. Inspect actual currentSrc/decoded dimensions/bytes and unchanged geometry after implementation; keep eager LCP priority and original inspector URLs. No new migration/Storage object is required.
