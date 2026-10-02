# Search pointer and Studio save recovery — 2 October 2026

## Current release

Worker `7b9107df-042f-404e-b193-14c26b4c4bbe` is deployed. Migration036 remains applied; this release needs no migration. No production content, accounts or files were created, edited or deleted.

## Search cursor

The previous implementation moved the branded document cursor into the native modal top layer and then hid it with CSS. Conflicting older `cursor:none` rules remained in the stylesheet. Search now keeps the branded element in the document body and hides it while the modal is open. Every modal control uses the native pointer; inputs use the native text cursor. Closing search restores the branded pointer. The script URL is versioned on public and Studio pages so cached clients request the updated script.

Production Chrome cursor/search suite: **9/9 passed**. Includes both themes, mouse/keyboard opening, touch/reduced motion, mobile search, focus trapping/restoration, backdrop close and controlled search failure/recovery. Local search pointer test passed. Read-only interactive Chrome confirms the versioned script, hidden body cursor, no branded cursor in the dialog, text input cursor and native pointer on every rendered button/link. `search-native-modal-2026-10-02.png` shows the real Lamine search result. Screenshots do not capture the OS pointer; DOM cursor styles and interactive regressions are the pointer evidence. Physical Safari and assistive technology remain separate gates.

## Studio saves

Preserved pending editor/media work was completed and tested. Captured FormData precedes disabling controls. Pending saves block duplicate submits and editing; failed saves restore controls, document editing and entered values. Editor metadata changes now mark the document dirty; failed saves keep the leave-page warning. Media upload errors stay in the form and retain the selected file and alt text.

The shared request helper has a 30-second abort deadline and only calls the operation saved after a redirected response to the expected same-origin Studio section. HTTP/auth/network/conflict/invalid-success outcomes show user-facing feedback without internal response text. An interrupted request may have committed server-side; the UI instructs checking the Studio list before retrying and never automatically retries.

Unit **111/111**, Astro **0 diagnostics**, build succeeded. Two new local browser workflows pass: controlled503 preserves editor values and dirty state, disables editing, blocks a second submit and then performs a real local save; controlled503 preserves the media FileList/alt text and then performs a real local upload. Two older media tests advanced before the asynchronous save redirect, selecting a stale card or opening delete details before reload; they now explicitly wait for navigation and both pass. Local fixtures are disposable test-adapter data, not production mutations.

Final full local regression: **56/56 passed** (2.7 minutes). A local Vite navigation AbortError was printed during the existing content-tags workflow despite passing assertions; no clean-server-log claim is made. Latest GitHub Actions status is checked after push. Production staff save mutations have not been performed in this release. Storage orphan cleanup and byte decoding remain open, as do the other full webmaster requirements.

## Rollback

Deploy the preceding Worker `5a7488ea-cfdd-4536-9337-87b35d16e058` for a runtime rollback. Keep migration036 and all user data. Restore cursor/editor/media source through a normal follow-up commit if needed; never reset Git history or force push.
