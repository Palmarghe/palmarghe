# SEO, public routing and Studio login audit — 1 October 2026

## Observed defects

Live capture `seo-live-before-2026-10-01.json` covered 28 sitemap URLs plus two Music routes. Music was absent from the sitemap; its Turkish page advertised the English homepage as its translation. Eight Turkish and eight English base pages reused the site description. Detail lookup searched only the latest 30 publications. Blank category SEO titles took precedence over category names.

Stronger local role QA also exposed a login defect: an editor was sent to /studio/, showing access denied. The previous test manually visited the editor entry point, masking the initial destination defect.

## Implementation

- Exact locale/slug publication lookup preserves published/scheduled status, due-date boundaries and RLS; drafts are not exposed.
- A shared cycle-safe category resolver handles nested detail URLs, category links and sitemap paths. Missing/inactive ancestors do not create paths.
- Category/tag/author equivalents use the same localized resource. Collections advertise another language only when that published counterpart exists. Unknown pages no longer advertise homepage translations.
- Sitemap includes active categories and published collections, deduplicates paths, XML-escapes URLs and excludes noindex content or content canonicalized elsewhere.
- Localized page-specific metadata is a fallback; editorial metadata and legal body text are preserved. Blank category SEO fields no longer suppress titles. Removed a duplicate theme-color tag.
- Valid list/detail pages have BreadcrumbList with actual ancestors and consecutive positions. Content schemas use real cover URLs, page/publisher information and opt-in public author data. No identity, upload date or modified date is fabricated.
- Studio login uses the authenticated user's existing role to route editors through /studio/editor/. Other destinations stay guarded; arbitrary next values do not become redirects. Local sign-in returns the SDK-shaped user payload.
- Local/production Playwright output directories are separated to prevent concurrent trace deletion.

## Verification

Final Worker: `14c7f7e5-ea26-432b-868c-00855db99a00`. Astro 0 diagnostics, unit 55/55, build successful.

Controlled local QA publishes 31 entries and retrieves the oldest anonymously; draft remains 404. Three-level categories work in TR/EN with reciprocal links and one sitemap entry. Custom-editor QA verifies the immediate login destination, allowed messages link, absent content link, forbidden content write and local test-account cleanup.

Final full local run passed 49/50; the remaining case failed during trace cleanup due to concurrent use of the old artifact directory. No product assertion failed in that final run. After separating outputs, gallery QA passed 1/1. Earlier obsolete schema expectations, aborted navigation and incorrect intermediate role expectations were investigated and corrected, not counted as passes.

Final live Chrome suite passed 5/5: all 32 sitemap pages, reciprocal alternates, localized title/description uniqueness, canonical/index rules, OG/Twitter fields, breadcrumb positions, route/assets/schema smoke, headers and critical-route console. `seo-live-after-2026-10-01.json` shows 32 sitemap URLs, Music included, 32 distinct descriptions and no wrong English-homepage alternates. Real logged-in Chrome confirmed Music TR→EN navigation.

[Google Music test](https://search.google.com/test/rich-results/result?id=dDsOGGvMzn8Ouvqrmm52YA) fetched the page successfully and found one valid breadcrumb.

[Google FM26 QA test](https://search.google.com/test/rich-results/result?id=ZWdLKGkUvq78eGoJexaS3g) fetched the page successfully and found valid Article/BreadcrumbList. Existing noindex correctly disallows indexing. There is one noncritical optional-author warning: this QA item has no opt-in public byline; a private identity was not exposed or invented. This is not an indexing-success claim.

No production content or account was created/deleted in this pass. Real production editor login was not exercised with a new Auth account; its exact routing branch is covered by unit tests and controlled local QA. Prior production role matrix remains historical.

## Remaining audit scope

Full webmaster goal remains active. The current matrix proves 32 live sitemap pages, not arbitrary future editorial data or every staff/auth state. Directory/sitemap query caps, public-author sitemap discovery, canonical-translation combinations, OG dimensions/crops, video/profile schema applicability, performance profiling, rate-ledger retention and other form/network/accessibility requirements still need work.

## Primary guidance

[Localized pages](https://developers.google.com/search/docs/specialty/international/localized-versions), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Article schema](https://developers.google.com/search/docs/appearance/structured-data/article), [Breadcrumb schema](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).


## GitHub verification

Implementation commit 9726f19: GitHub Actions Verify succeeded, including npm run verify and the full local E2E suite: https://github.com/Palmarghe/palmarghe/actions/runs/36925792440 . Current Windows product coverage is 50 cases across the full run and isolated artifact-cleanup rerun; the clean CI run executes the full suite. The broader audit remains active.
