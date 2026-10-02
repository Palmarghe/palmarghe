# Search cursor correction

The previous native-pointer workaround explicitly hid the brand cursor whenever search opened. The user reported that it disappeared. The correction reparents it into the open native dialog so the top layer no longer obscures it, then returns it to body on close. Inputs remain native for accurate text selection. Other dialogs keep their native controls.

Worker: 664072c7-da2a-41cc-b3a5-45aa099d18d9. Verify: Astro 0 diagnostics, 57 unit tests, build success. Local search: 1 passed. Production cursor/search: 9 passed. Real Chrome read-only DOM evidence: open=true, cursorInModal=true, textPointer=text, caret=rgb(139,92,246); after close returnedToBody=true and hidden=false.

No Auth, RLS, data or editorial changes. Rollback: revert the cursor JS/CSS commit and rebuild/deploy. Unfinished profile changes were stashed before build and are restored after the release, so they are neither lost nor accidentally published.
