# Current production mobile lab — 7 October 2026

Measured clean source40bbe9b, Worker d13d5a3c-2cf6-4fe4-98a0-f3bf24e6b7f6. Lighthouse13.5.0 mobile defaults, headless installed Chrome. Homepage and original KaanBuilder article were measured sequentially after E2E completed; no competing local tests. Raw JSON is ignored under test-results; bounded version/settings/results are preserved in performance-lab-2026-10-07.json.

| Page | Performance | Accessibility / practices / SEO | LCP | CLS | TBT | Transfer |
|---|---:|---|---:|---:|---:|---:|
| Homepage |96|100 /100 /100|2.629s|0|0ms|855629 bytes|
| KaanBuilder |87|100 /100 /100|3.833s|0|0ms|479945 bytes|

These are one lab sample per page, not field Core Web Vitals, real-user INP, organic traffic, or a before/after median. Homepage LCP is the existing30KB hero artwork and already has eager HTML discovery/high priority. The article sample records829ms document response and oversized original body images: Lighthouse estimates293462 bytes savings through responsive delivery. Original image source quality must be preserved; derived display renditions and reducing independent request serialization are the next concrete performance work. Private media RLS and authorization must remain enforced. No completion claim for the full performance requirement.

Command pattern: `npx lighthouse <public-url>?verify=lighthouse --only-categories=performance,accessibility,best-practices,seo --chrome-flags='--headless=new --disable-gpu' --output=json --output-path=<ignored-test-results-file> --quiet`. The verify marker avoids counting QA measurement as organic traffic.
