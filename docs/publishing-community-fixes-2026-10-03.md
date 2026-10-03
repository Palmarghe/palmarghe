# Publishing and community fixes — 3 October 2026

## Production diagnosis and repairs

- Actual authenticated Chrome publishing failed with SQLSTATE42501. Read-only Supabase catalog inspection showed content_revisions SELECT/INSERT absent for authenticated. Existing read/insert RLS requires has_permission('content'). Migration038 restores only those operations. Controlled existing Production QA taslağı was published through Studio, produced revision2, then restored to archived with revision3. No original text/assets or real accounts were removed.
- Reading-list public JavaScript contained a TypeScript generic in an uncompiled .js file. Removed it and added an actual-script runtime regression. Actual Chrome then exposed a second production issue: content_bookmarks SELECT/INSERT/DELETE were all false for authenticated. Own-record bookmarks_own RLS was verified and retained; migration040 restores the existing API operations. Actual Chrome save appeared in the account reading list; the QA bookmark was removed and the refreshed button returned to its unsaved state.
- Migration039 adds one authenticated like per content/user, own-row SELECT/DELETE, published-only INSERT, and a public aggregate-count RPC. Anonymous users cannot read liker identities. Actual Chrome like count/state persisted through reload; the test user's like was removed. Other users' likes remain untouched. PostgreSQL WASM tests check uniqueness, identity spoofing, row privacy and archive count suppression.
- All three migration SQL bodies were applied through the logged-in production Supabase SQL Editor, with success responses. They are recorded as source migrations038–040; no claim that the dashboard migration history automatically registered manual SQL.
- New/reset application passwords require8 characters, with no composition pattern. The user explicitly confirmed the production provider change at action time; Supabase Email saved8/no required characters. Email confirmation and secure email/password change remain enabled. No real account password was changed or new production signup created for QA. KVKK/privacy acknowledgement gates remain required.

## Interface changes

- Studio entry lives in desktop/mobile header, only for authenticated admin/editor roles. Removed both former account panel entry variants. Local role/viewport matrix checks anonymous/member absence and admin/editor presence at390/1440px, plus account-entry absence. Actual production admin Chrome shows the entry.
- Blank reading surfaces hide the native pointer when the custom pointer is active. Text controls/search retain their native caret; reduced-motion/touch behavior remains conditional. Actual Chrome body/main computed cursor:none; local cursor and production semantic/native-search checks passed.
- Portrait cards use a face-preserving18% vertical crop. Actual Yamal homepage card retains the head and upper body; original655×1000photo remains unchanged.
- Optional media insertion tool provides live width,16:9/4:3/square framing and horizontal/vertical focus preview. Changes are document attributes, never destructive edits of original media. Server validates numbers/ranges/ratio whitelist. Local E2E checks preview and serialized document. Actual production Chrome desktop and390px light-theme modal verified; modal left19/right371/client335/scroll335. Dialog was cancelled without changing QA content.
- Metadata-write ambiguity after Storage upload returns a bounded static upload_uncertain error and does not blindly delete a potentially committed original asset. Local known-failure cleanup remains. Durable orphan reconciliation is still open; this safeguard alone does not close the full upload pipeline.

## Verification and limits

- Latest verify: Astro0 errors/warnings/hints,170/170 units, production build succeeds.
- Local full run:62/63 passed; search-pointer failed with execution context destroyed during active development/navigation. The unchanged search-pointer separately passed1/1. Earlier full run60/61 failed only obsolete12-character expectation; corrected to the user's8-character requirement and localized account test passed. Do not combine these into a full63/63 claim.
- Targeted local checks passed publishing/bookmark/like2/2, cursor/role/media-framing3/3, final account/role2/2.
- Production theme/search/accessibility set16/17 passed. Cursor pressed-state test unintentionally activated an anonymous bookmark, whose delayed account navigation interrupted the modal. Changed test to release the mouse outside the bookmark; affected production test passed1/1. Separate production public routes/assets/media RLS/anonymous write boundaries4/4. Public sitemap dark/light serious WCAG scans passed in the16-test set.
- Actual Chrome console had no observed error/warning in the checked article flow. This is not proof every session/browser is error-free.
- Evidence: publishing-restored-chrome-2026-10-03.png, password-policy-chrome-2026-10-03.png, article-actions-chrome-2026-10-03.png, media-framing-chrome-2026-10-03.png, media-framing-mobile-light-2026-10-03.png, home-portrait-chrome-2026-10-03.png.
- The broader webmaster objective remains active. Historical media timeout, upload reconciliation, field performance and external/manual audit gaps are not claimed complete.

## Release verification

Final Worker: `3ac361c9-b737-4fac-91dc-89c78b659037`. Normal main commit/push: ad07a9a. GitHub Actions https://github.com/Palmarghe/palmarghe/actions/runs/37145519544 completed success, including verify and full local E2E; actual Chrome repository and Actions Success verified. The code CI gate passed after the documented local development-context failure. A fresh Supabase reload confirmed8/no required characters; the screenshot was refreshed after opening the persisted settings. Latest role/account targeted2/2 confirms neither staff role has a Studio entry inside account content.
