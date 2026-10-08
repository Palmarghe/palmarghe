# Short Studio viewport and media-query follow-up

## Current checkpoint: local, not deployed

Actual Chrome320×420 revealed the empty editing paragraph could sit beneath a177px sticky action bar after focus. The DOM focus was correct, but the writing line was obscured. Earlier full-height mobile checks did not cover this condition. Native before image: editor-short-viewport-before-2026-10-07.png.

The new private editor helper measures the actual action bar and visual viewport. It keeps a collapsed writing caret clear of both while retaining focus, selection and content. It only responds to editing/focus/keyboard/resize; ordinary manual reading scroll is left alone. Open dialogs and noncollapsed selections are excluded. Short More menus now scroll within the remaining visual height. Pagehide detaches listeners/observation, and pageshow resumes them without replaying a write.

Meaningful local tests pass:320px layout heights420/320/844 across dark/light/Aurora, text/focus unchanged and caret within the visible region; a saved-record menu's preview link is actually hit-testable and Escape restores summary focus. A controlled visual-only keyboard fixture leaves innerHeight844 while visual height/offset changes, and a persisted pagehide/pageshow contract replay resumes caret protection. This is browser geometry and lifecycle evidence, not a physical iOS keyboard claim. Final scoped2/2 passed10.4s. Full116-case local regression is now running, not yet counted as passed.

The same local follow-up combines cover/gallery/body metadata into one RLS-bound media query, starting it alongside the ready-rendition query. Original alt text, gallery order/captions, body dimensions, candidate readiness and original inspector URLs are preserved. It removes up to two sequential metadata requests; it does not introduce a service key, public cache or detached work. Media/reference regression3/3 passed22.6s before the last viewport lifecycle improvement. Initial verify248 checked files zero diagnostics/221 units/build passed; final verify must be repeated after the lifecycle change.

Current production remains e00f47b / Worker1b59e023, with migration045 and29 prepared files, full82/82 production6.4m and green sourceCI37680371649. Expanded documentation/testCI37682339676 verify/visual passed; production-smoke is still running at this checkpoint. No original production record was edited during the native focus audit.

Remaining gates: final verify/full116 local/36 visual, normal commit/push, clean deploy, native Chrome short-viewport verification, relevant production regression, measured follow-up and CI. Wider fourteen-item scope remains active.

Final functional116/116 passed5.8m; final verify248 files zero diagnostics/221 units/build passed after lifecycle changes. An attempted parallel visual-server/verify start failed before tests because both touched Vite's dependency optimizer; the visual process was terminal, no server was restarted on a timeout. The gates are now run sequentially. Expanded8350078 CI37682339676 is fully green in actual Chrome: verify8m39s, visual1m58s, production-smoke5m3s, total13m51s. This does not deploy the local keyboard/query follow-up.

Final sequential visual gate passed36/36 unchanged comparisons44.4s. All local release gates are terminal and passed; deployment and native production verification remain next.

9 October deployment supersedes the local-only checkpoint: clean9d35c33 normally pushed, clean build passed, Worker cd7758b2-db22-4458-b2f9-4a8c3ade3c6b deployed. Live Aurora/media3/3 passed14.6s. Actual connected Edge desktop hidden Aurora/background/no overflow passed; native proof aurora-live-2026-10-09.png, dark preference restored. Native short Studio viewport, new source CI and full production follow-up remain outstanding.

9 October fresh full production regression passed82/82 in6.1m on Worker cd7758b2. This supersedes the outstanding full-production gate above. Source Actions37851697788 and docs Actions37851886936 are confirmed live in progress; native short Studio viewport/CI/performance remain outstanding.
