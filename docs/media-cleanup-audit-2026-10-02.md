# Durable media cleanup audit — 2 October 2026

Production Worker: `0bf6fda5-3fd1-4b00-972d-0edfe01033e4`. Migration `202610020037_media_cleanup_queue.sql` applied through the authenticated Supabase SQL editor.

Metadata deletion creates a durable receipt in the same transaction. Restrictive reference FKs protect current and revision usage. Storage failures preserve the receipt and return a pending state; Studio offers retry using only the server-recorded path. Completion requires both live metadata and Storage metadata to be absent. Missing RPC support fails closed before deletion. RPCs require existing media permission; direct table access is denied. There is no background scheduler.

## Verification

- Astro: zero diagnostics; build succeeded; unit125/125.
- Full local56/56 plus newly added media pending-state presentation1/1 at 390/1440px in both themes with serious/critical axe checks. This does not claim a full57-test run.
- Real production SQL rollback QA10/10: permission boundaries, referenced deletion rejection, atomic receipt and Storage-presence completion guard.
- Actual Chrome admin Studio media page loads seven records without cleanup-list error; queue is empty. No real production file deletion was performed.
- Latest deployed production browser suite14/14 passed: cursor/search, real anonymous body-media and rejected write boundaries on both domains.
- Source counts remain content12/revisions8/media7/Storage7; four fingerprints match baseline. See baseline, QA and postflight JSON artifacts.

Initial QA encountered Supabase direct Storage-table deletion protection. It was retained. Corrected fixtures use SAVEPOINT rollback to remove temporary Storage metadata; the entire QA transaction is rolled back. No physical file, real content or Auth account changed. PGlite tests the exact migration in a narrow fixture, not all production concurrency scenarios.

## Rollback and limits

If needed, roll back the Worker to `7b9107df-042f-404e-b193-14c26b4c4bbe` while preserving migration037, its trigger and receipts. Do not drop the queue; pending file work must remain recoverable through a forward deployment. No old orphan backfill or guessed paths were deleted.

Failed-upload orphan reservation, byte decoding, actual production physical cleanup, browser retry with a real queued receipt and remaining webmaster gates remain open. Native search pointers/carets and bounded Studio save recovery remain active. The full objective is not closed.
