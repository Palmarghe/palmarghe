# Independent showcase card editor — 4 October 2026

Worker: `865263e7-937f-4bae-8e54-b3e645d4b0bb`.

Studio → Ana sayfa → Ana sayfa vitrini now includes “Vitrin kartı · görsel ve içerik”. Controls select a published content item, optional existing library image, TR/EN label/title overrides, desktop width260–480px, aspect ratio, contain/cover, image focus and visibility. Live preview uses textContent and existing images. Blank overrides use the publication title and cover; automatic content retains the existing showcase source. The card appears only in compact hero mode.

The card's own submit button merges only hero.preview into the existing homepage setting. Hero copy, curation order and unrelated settings are preserved. The general homepage save also includes these controls. Existing appearance authorization, same-origin guard and RLS remain; publication/media IDs are checked against known records and widths bounded. No migration, new artwork, account or publication edit was required.

## Verification

- Verify: Astro0 diagnostics, unit174/174, build success.
- Initial local card/visual suite3/3 passed. Final independent-card test1/1 passed after scoped-save refinement: saves and reloads, public rendering, original publication title, hide/show, preserved hero title despite unsaved changes,390/1440px field bounds, light-theme axe and invalid width rejection. Test fixtures are local only.
- Actual authenticated production Chrome saved a temporary card title, confirmed it after reload in Studio and on the homepage, then cleared it. Current KaanBuilder title/cover and existing curation remain intact. No QA publication/user was created. Independent settings now contain default visible/automatic/420px/16:9/contain/center values.
- An initial hidden-preview opacity reduced text contrast; only its image now dims and its border becomes dashed. Native select bounds and range/checkbox theme color were corrected after live screenshot review.
- studio-card-editor.png is an actual live Chrome capture. Full CI is checked before closing the request.
- Final Worker production showcase/navigation E2E2/2 passed:320/390/1024/1440px, both themes, loaded covers, existing spotlight, no page overflow and no serious/critical axe findings.

## Rollback

Normal Git revert and Worker deploy removes the new controls. Prior code ignores hero.preview, so existing homepage/content remains usable without database rollback. Card defaults reproduce the current desktop design. Use the Studio general homepage form to reapply chosen preferences; no content/media deletion is involved.
