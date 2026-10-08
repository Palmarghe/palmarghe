# Lazy image selection follow-up — 9 October 2026

## Verified issue and implementation

Connected Edge inspection of the live archive on Worker eabe551c confirmed all eight visible publication covers lacked both `srcset` and `sizes`. This was a real public-renderer omission, including four original-media proxy images. The existing RLS-bound batch already supplies ready derivative descriptors; the archive/category card renderer now consumes that same source function.

Seven lazy public card groups retain their existing size fallback list and add `auto` so supporting browsers select against actual rendered width. Body images and galleries use the same approach. Original `src`, image inspector URLs, dimensions, eager hero/LCP loading and original files are preserved. No database migration, Storage mutation, production content or account change is involved.

Primary reference: [WHATWG responsive images](https://html.spec.whatwg.org/dev/images.html). Auto sizes applies to lazy images; the explicit fallback list preserves behavior where auto is unsupported. Browser support is not claimed universal.

## Meaningful local evidence

The existing real-generation/privacy/cleanup test was extended to publish a controlled local article, view its archive card anonymously at390px/DPR1.75, read actual `currentSrc`, decode the downloaded bytes with Sharp and compare bytes with the960px candidate. It selected a640px WebP, its rendered width times DPR fit640, and bytes were smaller than960. The original SHA remained unchanged; unpublished derivative access and cleanup remained covered. This test initially failed because the archive lacked responsive attributes; fixing that renderer made it pass. Scoped result1/1 in10.0s.

Verify passed249 files with zero diagnostics,221 unit tests and build. Full local121-case regression passed121/121 in5.3m. Unchanged visual comparison passed36/36 in35.0s, covering public/Studio phone/desktop dark/light/Aurora. Production deployment/live checks remain required. A dedicated production archive test now checks the same actual source selection, decoded width, original byte comparison and bounds without production writes.

## Release status

Local implementation, not deployed yet. Current production remains source1fb9eb1/Worker eabe551c. Its full production82/82 passed5.8m and source Actions37854993962 passed all three jobs in8m36s. This follow-up is part of performance requirement3; it does not close the entire fourteen-item scope or establish field Core Web Vitals.
