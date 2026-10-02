# Media permissions and write boundaries — 2 October 2026

## Defects corrected

Both media POST endpoints previously fell back to role-only profiles and allowed editors when a group read returned no data. The new shared permission resolver requires a successful full profile read, permits admins and permits editors only when their group successfully supplies boolean media=true. Missing group, member role, stale data with an error and malformed permission values deny access. No RLS/Storage policy or migration changed.

Media redirects previously omitted panel=editor, leading authorized editors to an access-denied Studio page after upload/update/delete. The panel flag is now retained; admin permissions remain independent of that UI flag.

The deletion guard checked cover references but omitted OG references and ignored cover query errors. It now returns 409 for a linked social image and 503 for failed cover/OG checks. Existing gallery guard is preserved.

## Verification

Worker 2b94a3f1-208f-4801-a976-a7a1c0acbb59. Verify: zero Astro diagnostics, 78 unit tests/16 files, build success. Thirteen new unit cases cover allowed/denied profile/group states and both endpoints rejecting before body parsing or Storage access. Final sequential local E2E 4/4: restricted moderator denied both media endpoints; admin CRUD; gallery privacy/caption; explicit-media editor CRUD with draft OG deletion denied until reference removed. Local adapter only, no production data.

A concurrent verify/build + local browser run produced one editor-bundle initialization timeout in the gallery test. Final verification and the four affected browser tests were run sequentially and passed. The concurrency failure is retained as a test-environment observation, not erased or counted as success.

Source inventory has eleven POST routes: auth/comments/contact/engagement/library/media/media-manage/newsletter/profile/studio/traffic. On apex and Studio, absent and foreign Origin each returned 403 Invalid origin/no-store (44 requests). Four same-origin anonymous media requests returned 401 Unauthorized before malformed-body parsing. This tests pre-Auth boundaries, not every authenticated CSRF or role/RLS path. Post-deploy combined production suite 9/9 also includes profile fixtures in both languages/themes and search cursor.

Real Chrome: anonymous Studio login visible, public home rendered; both viewport-visible images were complete with nonzero natural width. No real staff mutation or production media upload/deletion was attempted.

## Remaining findings — goal remains open

- Body mediaImage/mediaGallery references and content revisions are not included in deletion guards. Do not call full media deletion safety complete.
- Existing gallery usage query is bounded by the database response cap; growth/pagination needs examination.
- Reference checks and deletion are separate requests; concurrency/transaction protection remains open.
- Storage removal errors after metadata deletion can leave an orphan; retry/recovery needs review.
- File validation checks signatures and size, not a complete decoded-image validation. Full upload abuse/performance requirements remain open.
- Actual production editor custom-group mutations and allowed staff uploads remain unclaimed.

## Rollback

Revert code commit, rebuild and redeploy. No migration/data rollback needed. Existing media and content are preserved. Do not reintroduce the permission fallback merely to support unassigned editor profiles; assign a verified group instead.
