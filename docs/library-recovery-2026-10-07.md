# Library desired-state recovery — 7 October 2026

## Scope

The current client sends an explicit desired like/bookmark/follow state and the rendered authenticated viewer ID. A lost acknowledgement retains exactly that request in memory; manual retry converges on the requested state instead of reversing a committed toggle. Success requires the matching viewer ID/state and a valid like count. Full fetch/JSON consumption is bounded to twelve seconds, controls block duplicate submits, statuses belong to each action, and reconnect never replays writes. Reload reads the server-rendered state; there is no private pending payload in browser storage. Notification acknowledgement is identity-bound and successful read state is confirmed before hiding its control. The Worker derives user_id from Auth and rejects a changed session before writes. Own-row RLS/same-origin checks remain.

Like/bookmark/follow desired=true uses INSERT ON CONFLICT DO NOTHING against the actual composite primary key; desired=false uses authenticated own-row deletion. Created timestamps remain unchanged on repeated true. Legacy requests without desired retain prior toggle behavior and do not claim uncertain replay safety. Competing opposite user intentions still follow server request ordering; this does not promise ordering across independent devices.

## Defects found

The new real-commit/lost-acknowledgement local test detected selected-button contrast3.79 in light mode. Selected labels now use the theme foreground and accent underline, maintaining both visual state and sufficient contrast in all three themes.

Sourcee402eaa Actions37628770008 functional106/106 passed6.3m, visual35/36 failed editor-light-1440; production-smoke skipped. Actual downloaded expected/actual/diff shows all inactive navigation groups expanded because the screenshot preceded deferred navigation setup, plus an uninitialized editor icon. Visual tests now await actual nav expanded states and editable Tiptap/disabled initial Undo; no baseline or tolerance change. The local exact failed case passed1/1 in11.6s.

Production SQL identified missing authenticated permissions on content_follows and content_notifications, despite intact own-record RLS. Likes/bookmarks already have SELECT/INSERT/DELETE without UPDATE. No bulk migration/history repair is appropriate: versions036–040 have schema changes present but history entries absent. Migration202610070043_library_grants was applied and its history recorded in the same transaction. It grants follow SELECT/INSERT/DELETE and notification SELECT/UPDATE(read_at), preserving RLS and withholding message creation/recipient/title changes. Production authenticated replay/removal/foreign-row/notification-column assertions passed and rolled back. Two temporary notification inserts advance the identity sequence; their rows were rolled back. All nine row counts/fingerprints exactly match the captured baseline: library-transaction-baseline-2026-10-07.json. Additional read-only inspection found missing editorial collection privileges, which remains separate applicable work.

## Evidence and current limits

Targeted local library/reading-list3/3 passed21.6s, including actual local commit with lost acknowledgement/manual retry/reload/removal; parallel same desired requests, stale account401, visitor401 and foreign origin403;320/390/1440 and dark/light/Aurora axe. Actual SQL migrations unit proof validates composite keys, preserved timestamps, repeated removal, own RLS and anonymous denial. Complete JSON-body deadline is tested after response headers arrive. Final verify232 files zero diagnostics/210 units/build; full108 E2E passed5.4m;36 unchanged visual references passed35.3s. The actual existing follow-to-publication-to-notification local UI scenario also passed.

Controlled production fixtures intercept every library POST and read anonymous deployed HTML only. They prove deployed client recovery, not an authenticated database transaction. Actual PostgreSQL proof is complete as described above. New Worker deployment, authenticated Chrome add/remove/reload proof, controlled production client cases and green new CI remain pending; none is implied by local or SQL tests.

The authoritative baseline for this slice is test-results/library-before.json: comments4, content15, media15, profiles5, settings4, likes5, bookmarks1, follows0 and notifications0. It differs from earlier historical comment/profile checkpoints; no old counts are substituted for current state and no original record is restored/deleted to match a historical baseline. Content/media/settings fingerprints still match the preceding records. No committed production row mutation has been made by this slice.

## Rollback

Normal source revert/rebuild/redeploy preserves all publication/profile/media data. New desired fields are optional and old clients remain compatible. If043 must be rolled back, first revert dependent UI/Worker and revoke only its newly added permissions against the captured baseline; keep tables, policies and all existing records. Do not replay unrelated migrations or force push.
