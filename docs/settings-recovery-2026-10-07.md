# Appearance/social settings and editor mode polish — production release

Shared30-second save helper now covers appearance, social, collections, homepage and advertising. Failed submissions retain fields, restore controls and show readable status; dirty summaries, undo and beforeunload protection also cover the newly included forms. No automatic write replay.

Editor Basit/Detaylı mode selection now uses theme foreground/background and accent underline, rather than hardcoded purple. Buttons have44px minimum height, including320px phone layouts. Geometry/axe/two-mode state verified across dark/light/Aurora and320/390/1440.

Meaningful local failed503→real retry→confirmed303→new-document load→reload persistence tests restore original local settings after each case. An initial test called reload before the same-URL save navigation finished; fixture now waits actualPOST confirmation and DOMContentLoaded. Three repeats6/6 passed16.6s. Mode matrix1/1 passed8.9s.236 files zero diagnostics/212 units/build passed before the final extra test file. Full112/112 local5.0m and36/36 visual35.5s passed before the final editor redirect repair. Final redirect/staff/collection/settings scope6/6 passed15.9s; final238-file zero-diagnostic/212-unit/build verify passed. Final113-case CI remains required.

Only six editor references intentionally regenerated for visible mode color/44px touch changes; Aurora390 and light1440 native outputs visually inspected. Other30 references and tolerance/masks are unchanged. Clean source6f9aea3 is normally pushed and deployed on Worker b8ea2739-bb1b-44ca-b6df-1ec75a0492ba. Final local113/113 passed7.3m,36/36 visual comparisons passed38.9s and full production80/80 passed7.1m. Source Actions37674111973 completed successfully across verify, visual and production-smoke, confirmed in actual Chrome. The earlier Ubuntu dependency-installation delay is historical. Earlier collection release80/80 passed6.3m. Full fourteen-item scope remains active.

## Editor return navigation defect

A real local mobile editor publication submitted successfully but lost panel=editor on the return URL, confirmed by a deliberately failing test (expected editor, received null). Existing staff-entry tests only opened the portal and did not publish, so their pass did not cover this defect. Studio API now preserves the authenticated editor panel on all successful Studio redirects; admin destinations are unchanged and authorization occurs before any write. The corrected test publishes, confirms303, waits the new document, sees the saved list after reload and verifies the publication in the real local search API. No production editorial QA record was created for this navigation repair.

## Actual production Chrome proof and cleanup

Existing admin saved the unchanged appearance values violet/sharp through the real form. Busy feedback was visible, the confirmed redirect showed the new persisted server time, and independent SQL confirmed the new timestamp and unchanged JSON value. An exact value/timestamp guard restored only the original timestamp. All nine original-table row fingerprints matched afterward; the genuine operation audit was retained. Fresh console warnings/errors were empty. Native proof: settings-live-confirmed-2026-10-07.jpg.

Actual390px Studio Aurora has no horizontal overflow and both mode buttons measure44px. Native proof: editor-mode-live-mobile-2026-10-07.jpg. Original dark theme and viewport were restored; no production content was submitted. Social failure/retry is covered through the real local API, not claimed as a production mutation test.
