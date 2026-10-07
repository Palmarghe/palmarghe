# Collection recovery — local implementation checkpoint

Production release is clean source75b073a / Worker576d7669-9f34-4f9d-be2a-5afbcf9fdb6e. Migration044 is applied and history-registered atomically. Full production80/80 gates passed6.3m. Actions37672169967 completed verify, visual and production-smoke successfully.

The collection repair now uses one SECURITY INVOKER transaction for collection metadata and ordered relations. Staff role and explicit content capability are required. Anonymous reads are limited to published collections and due published content. Missing boolean/object input is rejected. Original creator is preserved and update time comes from the database.

Studio collection forms use the bounded save helper and retain input on errors. Editor success redirects preserve panel=editor, preventing successful saves from sending an editor to the inaccessible admin view. The local adapter mirrors validation, permissions, atomic validation-before-write and collection-item cascade.

Verified: actual migration SQL in PGlite, two tests covering atomic replacement, duplicate-item rejection, missing published value, creator preservation, capability denial, member denial, anonymous published/private filtering. Studio save plus collection unit scope24 passed. Astro234 files had zero errors/warnings/hints before the final redirect-only repair. Actual local Chrome E2E1/1 passed, demonstrating editor failed-save retained input, retry, saved-list visibility and reload persistence.

Full local109/109 E2E passed5.5m; 36/36 unchanged visual references passed34.2s.

Release gates complete for the collection checkpoint; full fourteen-item scope remains active. Post-cleanup all nine baseline fingerprints match exactly; collections/links remain0/0. Production preflight confirmed zero collections/links and missing anon/authenticated privileges on both tables. The migration was first exercised inside a rolled-back production transaction, then applied and registered atomically, and its rolled-back transaction/anonymous privacy/member denial proof passed again. No collection records were retained in rolled-back SQL QA. Full verify234 files/212 units/build passed. Existing commits7d9557c and32381f7 were normally pushed after the transient GitHub500 cleared. Full fourteen-item scope remains active.

## Rollback

Rollback the Worker to80cecf11 if runtime verification fails. Retain additive RPC/grants/policies044: older collection requests remain compatible, and the stricter staff capability and public due-item boundaries must not be weakened. No bulk migration replay/history repair. Production preflight and proof were executed through the official linked Supabase CLI.

## Actual production Chrome

Private QA collectionc0231ea6-78a4-48a1-94bd-207fdb82c8ca was created from the existing signed-in admin form, listed as draft, edited, and retained the selected Colony Director relation and new description on reload. Stored saved time advanced18:38:21→18:38:48. Fresh tab warnings/errors were empty. The attempted semantic KaanBuilder check selected the adjacent Colony Director control; the actual snapshot was inspected and the selected original content used intentionally for QA, without a fabricated KaanBuilder claim. A guarded terminal cleanup matched exact id/slug/title/description/private status and required one relation before removing only that QA collection. FK cleanup confirmed collections0/links0, matching preflight. Existing original content was not changed. Native screenshotcollection-live-edit-2026-10-07.jpg records the private QA editing proof.

Source75b073a was normally committed/pushed and clean rebuilt/deployed after234 zero-diagnostic files,212 units/build,109/109 local5.5m and36/36 unchanged visuals34.2s. Initial production77/80 exposed stale fixtures; corrected full80/80 passed6.3m.

Full production80-case audit initially77 passed/3 failed6.4m. Two reservation cases were intercepting obsolete staticcover URL while the actual original cover is now served through the protected media endpoint; passing dark cases did not prove delay interception. The repaired fixture discovers the actual high-priority cover from server HTML, requires a held request, persists the intended theme before navigation, and keeps the exact655×1000/under1px reservation assertions. Search recovery had an obsolete error-message expectation; retained suggestion/result visibility is now asserted along with the real retained-results message. Corrected production reservation/search8/8 passed34.6s. Final full production80/80 passed6.3m onWorker576d7669/source75b073a with the corrected fixtures.

Actions37644683026 completed all jobs successfully for32381f7. Collection source Actions37645393334 unit212 and visual36 passed, functional108/109 failed hero-theme contrast during an immediate direct theme mutation; production was skipped. Add explicit body/brand foreground readiness before the unchanged axe scan, with three local repeats6/6 passed27.2s. Repair commit5382ee6 CI37672169967 passed verify109 local, visual36 and scoped production smoke; original75b CI remains historical failure. Post-Chrome-cleanup all nine row fingerprints match committed library baseline exactly.
