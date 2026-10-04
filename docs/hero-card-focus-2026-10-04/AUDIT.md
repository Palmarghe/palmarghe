# Showcase card focus repair — 4 October 2026

## Cause and repair
Object-position alone was applied to an auto-height image. Full-image contain rendering or matching aspect ratios left no visible space for the focus to move. The image now fills a fixed-ratio clipped frame. Selecting focus switches to cover and adds125% zoom when at100%. Zoom is adjustable100–200%; transform origin follows focus. Coverless entries use the existing fallback artwork. Server validates the saved integer zoom range. The independent card Save still merges only preview settings.

## Verification
- Astro zero diagnostics;174 unit tests; build passed.
- Local card E2E1/1: left/right screenshots differ, crop/zoom persistence, scoped save, original publication preservation, hide/show, responsive and axe checks.
- Final production showcase/header2/2 passed on Worker c2dee5b1-b931-42f7-89f1-d5e95ed022b9, both themes and320/390/1024/1440px.
- Authenticated Chrome saved right/cover/125%, confirmed public matrix1.25 and cover. Then original center/contain/100%,16:9,420px were restored and verified after reload. Existing KaanBuilder content/library image and all labels retained.
- Screenshot: studio-focus.png. No production QA users or publications created.

## Rollback
Normal revert and rebuild/deploy the prior release (Worker865263e7-937f-4bae-8e54-b3e645d4b0bb). Existing saved preview settings remain compatible; no migration required. Never force push.
