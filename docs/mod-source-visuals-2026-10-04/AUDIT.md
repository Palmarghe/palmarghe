# Original source media and homepage — 4 October 2026

## Deployed result

Final Worker: `2d093575-1d82-4565-8809-af7619bbea66`. Normal Git commit/push preserves the existing history. This release supersedes the geometric publication covers from the earlier same-day audit; those assets are retained.

Sources inspected in actual Chrome:

- Colony Director: https://www.nexusmods.com/strandedaliendawn/mods/70 — original promotional cover, also included in the article gallery.
- PalmargheTR: https://www.nexusmods.com/strandedaliendawn/mods/68 — original promotional cover and genuine Turkish main-menu screenshot.
- KaanBuilder: https://www.curseforge.com/minecraft/mc-mods/kaanbuilder — original Modern House/Japanese House cover and a second source house promotional image.

Five source assets were downloaded through Chrome and uploaded through the authenticated Studio media UI. `media.json` records each media URL/ID, alt text and caption. WebP conversion/resizing bounds assets to 1600×1200 without cropping or changing composition. No cover was generated or replaced by invented artwork. The source galleries themselves contain AI promotional imagery; captions explicitly distinguish those from verified gameplay screenshots. Gameplay execution/version compatibility was not independently tested.

The existing three Project records and official source buttons are preserved. Each body now has eight distinct sections, including “Projeden görseller”; gallery counts are 1/2/2. All three original covers use the original ratio and centered framing. Project card/detail/spotlight rendering uses contain so embedded source lettering is preserved. During verification the Turkish article temporarily contained duplicate pasted material; production E2E detected it, and the original body plus two image nodes was restored through Studio. Final tests confirm eight sections and two images.

## Navigation and homepage

- Existing category data powers separate native disclosure controls beside parent links on desktop and mobile. Oyunlar exposes Stranded: Alien Dawn and Minecraft; Football Manager exposes its existing subcategories. Root links still navigate. Keyboard Enter/Escape, one open menu, outside click and no-JS native details work.
- Hero remains compact and editable in Studio. New title: “Modlar, müzik ve yeni fikirler.” Discovery links and a small preview use existing content, rather than invented artwork.
- Featured choices: KaanBuilder, PalmargheTR, Anatolian Velocity. Balanced three-column image/text cards avoid writing over the source artwork. Phone layout stacks cards.
- Spotlight: Colony Director (`5fa778c5-d3ee-4e1d-86b2-7748faded201`), with complete source cover and text/action.
- Four latest records form a full 2×2 desktop grid. Category image headings remain light over dark artwork in both themes.

`homepage-before.json` backs up the prior Studio homepage inputs; visibility and section order were preserved. Content IDs are recorded in the earlier `../mod-publications-2026-10-04/production-records.json`; its cover IDs are historical, superseded by `media.json` here.

## Verification

- `npm run verify`: Astro0 errors/warnings/hints, 174/174 units, build passed (08:20 Istanbul).
- Local category navigation: 2/2, including JavaScript disabled.
- Final deployed production: 6/6 (28.0s), publication covers/media/source/canonical/sitemap, unique section counts, homepage preview/featured/spotlight loaded images, 320/390/1024/1440 widths, dark/light, keyboard disclosure and no serious/critical WCAG axe findings.
- Actual Chrome: authenticated Studio publishes, original-source public images, desktop/mobile category disclosure, homepage and theme checks. Screenshots in this folder. `home-chrome-mobile.png` shows the compact phone preview; desktop screenshots show the homepage. Category contrast and latest two-column layout were additionally confirmed from live computed styles.
- Chrome log history contained two `ViewTransition opt-in disabled` aborts at 08:09/08:12 during earlier navigation. No clean-console claim is made; navigation and final automated checks passed.

## Safe rollback

Revert the release code with an ordinary Git revert and deploy the resulting build. Restore the prior homepage fields from `homepage-before.json` using Studio. Restore the three content revisions/previous covers through Studio if required; neither the original nor geometric media was deleted. Uploaded source media are intentional publication assets. No Auth/RLS/Storage policy or migration change occurred. No production accounts were created or removed.

The wider webmaster objective and previously documented external service dependencies remain open; this audit closes this source-media/navigation/showcase request only.
