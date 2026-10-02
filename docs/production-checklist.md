# Production doğrulama kontrol listesi

## Current production state — 2 October 2026, media reference safety

Worker `5a7488ea-cfdd-4536-9337-87b35d16e058` is live; migration036 is applied to production. Current and revision media references now have restrictive FK guards; publication visibility includes nested body/gallery media. Worker deletion checks fail closed and preserve Storage on FK conflict. Search uses native controls/text caret; branded cursor remains elsewhere.

Verification: Astro0 diagnostics, final unit95/95, build success; local media4/4 and final full local E2E54/54; production Chrome23/23 for images/search/pointer/responsive/forms/console/security/write boundaries, plus published body-media1/1 (anonymous actual Storage loads, mobile/desktop × dark/light, serious/critical axe checks). Real production SQL rollback QA7/7; four source fingerprints unchanged (content12/revisions8/media7/Storage7), derived references8/2 and no missing references. Chrome home ten images loaded. Prior search commit e69cfd8 Actions36989873007 succeeded; current commit CI is checked after push. Evidence/rollback/limits: docs/media-references-audit-2026-10-02.md.

No editorial content, Auth accounts or real files changed. Actual production staff upload/delete and complete file safety are not claimed. Orphan cleanup, byte decoding and other full webmaster gates remain open; the full objective remains active. All following deployment sections are historical snapshots superseded by this state.


## Previous production state — 2 October 2026, media permission audit

Worker `2b94a3f1-208f-4801-a976-a7a1c0acbb59` was live at that historical checkpoint. Media upload/management now requires a successfully read staff profile and explicit boolean media permission for editors; missing or failed permission-group reads deny access. Admin media permissions are preserved. Media redirects retain editor-panel access. Deletion now also protects OG media references and aborts on failed cover/OG usage queries.

Verify: Astro 0 diagnostics, unit 78/78, build success. Final sequential local media/member/gallery suite 4/4 covers admin/editor CRUD, restricted-editor denial and draft OG reference protection. Production 9/9 covers all 11 POST endpoints rejecting absent/foreign Origin on both domains (44 rejected requests), anonymous media writes (4 rejected requests), four profile recovery fixtures and search cursor. Chrome public page renders with no broken images among the two visible images; Studio anonymous login was observed. No production media/profile/content writes occurred. Actual production staff media mutations and a complete upload/deletion safety audit are not claimed.

Previous profile commit 3935381 Actions succeeded: https://github.com/Palmarghe/palmarghe/actions/runs/36984593732 . Current release CI is checked after push. Evidence, remaining media findings and rollback: `docs/media-permission-audit-2026-10-02.md`. Full webmaster goal remains active; body/revision media usage and transactional deletion need further work.

## Previous production state — 2 October 2026, profile recovery audit (historical)

Worker `5ae7c25a-3438-44e1-a79d-c5d97a63c96e` was live at that historical checkpoint. Profile writes now use one canonical profile-row update, normalize an empty private author address to SQL NULL and never claim success after a partial name-only fallback. Duplicate addresses, public profiles without an address and denied writes return explicit errors. Profile loading fails closed with retry; network/save errors retain entries and duplicate submits are guarded. An existing null display name is editable. Auth metadata is preserved. The shared button hover uses deeper violet for adequate white-label contrast.

Verify: Astro 0 diagnostics, 65/65 unit tests, build success; affected local member/profile/comment/follow tests 4/4. Final production profile/cookie/search tests 7/7: deployed profile script with intercepted test transport in TR desktop/EN mobile × dark/light, no horizontal overflow and no serious/critical profile axe findings. Real authenticated Chrome read-only check confirms loaded profile, enabled save and 20 avatars. Production profile writes/conflicts are not exercised by these fixtures; server error handling is covered by unit tests and real local adapter persistence by browser tests. No editorial or real profile data changed.

Previous cursor release 1d5ce92 Actions succeeded: https://github.com/Palmarghe/palmarghe/actions/runs/36983334419 . Current release CI is checked after push. Full 40-section goal and previous performance/external gates remain open. Evidence: `docs/profile-recovery-audit-2026-10-02.md`.

## Previous production state — 2 October 2026, search cursor correction (historical)

Worker `664072c7-da2a-41cc-b3a5-45aa099d18d9` was live at that historical checkpoint. The branded desktop pointer now moves inside the search dialog's browser top layer instead of being hidden behind it. Search controls retain the branded pointer; editable fields retain their native text pointer and violet caret. Closing search returns the pointer to the document body. Touch and reduced-motion behavior are preserved.

Validation: Astro 0 diagnostics, unit 57/57, build success, local search regression 1/1 and production cursor/search suite 9/9, including mobile, both themes, keyboard, focus trapping and network recovery. Real Chrome confirms the cursor's modal parent, input caret and return to body. No content or production data changed. In-progress profile recovery work is preserved separately and is not part of this release. Previous session-cookie commit f982c01 Actions succeeded: https://github.com/Palmarghe/palmarghe/actions/runs/36981849520 . Full webmaster scope and earlier performance limits remain open.

## Previous production state — 2 October 2026, session cookie audit (historical)

Worker `a9f7f102-e50a-463e-8b37-ee87a27d87d3` was live at that historical checkpoint. Server-only Auth cookie writes now enforce HttpOnly while preserving Secure, SameSite=Lax, root path, SDK lifetime and chunks. A controlled invalid expired session demonstrated the missing attribute before deploy; apex and Studio clearing responses now pass. Real SDK controlled-transport tests cover chunked login, logout and refresh. Existing authenticated real Chrome admin dashboard remains accessible.

Verify: Astro 0 diagnostics, Vitest 57/57, build success. Affected local browser tests 4/4; live cookie/privacy/native-search-pointer tests 5/5. No real account was created/deleted and no content was changed. Fresh real production login/logout and SMTP callback delivery are not claimed. Scope and rollback: `docs/session-cookie-audit-2026-10-02.md`.

Responsive image/read-batching, SEO/login, measurement migration 202610010035 and native search-pointer fixes remain active. Performance implementation commit d4dc0ce Actions succeeded: https://github.com/Palmarghe/palmarghe/actions/runs/36928098805 . Its current lab evidence is historical measurement of that same performance code: final mobile home LCP 2.531 s and article 2.892 s, so performance gates remain open. Cache/font sample evidence is in `docs/cache-font-2026-10-02.json`. Current release Actions is checked after push. The full 40-section goal remains active.


## Previous production state — 2 October 2026, performance audit (historical)

Worker `9cea5697-c203-415f-8fc0-c5eaeab9846c` was live at that historical checkpoint. Existing category artwork now has smaller responsive WebP renditions; five independent public page reads run together without changing RLS, publication filters, cookies or no-store HTML. Four category downloads fell about 80% in the captured mobile profile. Editorial content and originals are preserved.

Verify: Astro 0 diagnostics, unit 55/55, build successful; affected local E2E 6/6; final production E2E 6/6, including 32 sitemap URLs, two-theme category checks, assets, schema, headers and console. Image-only production smoke previously passed 10/10 including all ten viewport widths. Real Chrome confirmed loaded images and final page reload. Native search-pointer regression passed.

Final lab samples: mobile home 96 / LCP 2.531 s / CLS 0 / TBT 0; mobile QA article 94 / LCP 2.892 s / CLS 0.0113 / TBT 0. Earlier image-only home measured 98 / 2.106 s and desktop 98 / 0.963 s. These are individual lab observations, not field INP or a broad performance pass. Mobile LCP remains open. Evidence, methods, timing variance and rollback: `docs/performance-audit-2026-10-02.md` and `docs/performance-lab-2026-10-02.json`.

Previous docs commit 26e56cb Actions succeeded: https://github.com/Palmarghe/palmarghe/actions/runs/36926330194 . Current release Actions is checked after push. Migration 202610010035, SEO/login and native search-pointer fixes remain active. The complete 40-section audit remains active.


## Previous production state — 2 October 2026, SEO and Studio login audit (historical)

Worker `14c7f7e5-ea26-432b-868c-00855db99a00` was live at that historical checkpoint. Exact publication lookup fixes older-entry 404s while preserving draft/schedule boundaries. Nested taxonomy URLs, reciprocal language links, blank metadata fallback, sitemap category/collection coverage, deduplication and canonical exclusion are corrected. Base pages have localized descriptions; BreadcrumbList and real content cover/public-author data are present. Studio editor login reaches its existing editor entry point. Role/write permissions are preserved.

Astro 0 diagnostics, unit 55/55, build successful. Final local full run 49/50 with one artifact-directory collision; gallery rerun 1/1 passed after output directories were separated. Final live Chrome 5/5 includes all 32 sitemap URLs, metadata/language/breadcrumb matrix, schema/route/assets/headers/console. Real Chrome confirmed Music language switching. Google validates the Music breadcrumb and FM26 Article/Breadcrumb; QA noindex and optional-author warning remain intentional. No production content/account was created or deleted. Exact evidence and remaining limits: `docs/seo-routing-audit-2026-10-01.md`.

Migration 202610010035 and native search pointers remain active. Previous commits 6cd8261/bc96d20 Actions both passed: https://github.com/Palmarghe/palmarghe/actions/runs/36922407546. Implementation commit 9726f19: GitHub Actions Verify succeeded, including npm run verify and the full local E2E suite: https://github.com/Palmarghe/palmarghe/actions/runs/36925792440 . Current Windows product coverage is 50 cases across the full run and isolated artifact-cleanup rerun; the clean CI run executes the full suite. The broader audit remains active. Full 40-section objective remains active.

Earlier releases and counts below are historical evidence.


## Previous production state — 1 October 2026, search pointer follow-up (historical)

Worker `fb1a8e0d-63ae-4147-bc3e-9efb75dd0b55` was live at that historical checkpoint. Search now uses native pointers throughout its modal: text/caret in the input, pointer on buttons and links, auto on the backdrop. The decorative brand cursor is hidden only while search is open and restored on close. This supersedes the earlier top-layer reparenting implementation below. Mouse and Ctrl+K opening, repeated close/reopen and both themes are covered; real Chrome confirmed input focus, text pointer, accent caret and a live Lamine result.

Production migration `202610010035_measurement_worker_boundary` is applied and journalled. All three measurement RPCs deny anon/authenticated execution and allow the private Worker service role. Worker writes use a peppered IP hash and a 30-request/60-second endpoint rate window; missing configuration or rate-provider errors fail closed. Controlled anonymous RPC calls returned 42501; Worker traffic returned 204, absent-content engagement 404. The reserved QA path was verified 0→1→0 in all four traffic tables. A 31-request absent-content burst returned 30×404 and 1×429, without engagement rows. See `docs/measurement-boundary-2026-10-01.md` for initial fail-closed verification issues and rollback.

Studio pageview totals exclude ad clicks and Studio paths. Daily/path visits are no longer presented as global unique visitors. Attribution and historical-data limitations are displayed; historical rows are preserved. Authenticated Chrome confirmed the deployed labels. Metrics are not certified organic or human traffic.

Verification: Astro 0 diagnostics, unit 46/46, build successful. Full local suite before the pointer follow-up 47/47; added local pointer regression 1/1. Live Chrome search/cursor 8/9 initially, with one obsolete top-layer expectation; the corrected semantic test passed on rerun. Analytics, semantic cursor, security headers and console rerun passed 5/5. The other eight initial search/cursor cases passed, including mobile search, keyboard navigation, network recovery, modal focus/scroll, device/theme and rendered pointer tracking. Previous commit 9870bf0 Actions succeeded: https://github.com/Palmarghe/palmarghe/actions/runs/36918416447. Current CI is checked after push. The broader audit remains active.

Earlier deployment and test counts below are historical evidence, not the current production state.


## Previous measurement correction (historical) — 1 October 2026

Worker `88cfc28d-95da-4cfe-a605-468d49cdba97`. Reklam tıklaması artık RegExp nesnesi yerine /ad/header/, /ad/article/ ve /ad/footer/ string yollarını gönderiyor. Kaynak, API isteğinin kendi Referer başlığından değil ziyaretin giriş referrer bilgisinden tarayıcıda sınıflandırılır. Sunucu yalnız organic_search/referral/direct enum kabul eder; eski istemciler direct olarak işlenir. Ham referrer URL veya arama sorgusu gönderilmez/saklanmaz. 30 dakika hareketsizlik süresi olan sekme içi coarse source, iç gezinmede korunur. Engellenmiş storage kullanımında script çökmez; çift yüklemede dinleyici/ziyaret tekrarlanmaz. Bilinen bot ve webdriver denetimleri engagement yazımlarından da çıkarılır.

Kanıt: Astro 0 tanı, unit 39/39, build başarılı; önceki tam local E2E 46/46. Yeni production Chrome analytics paketi 2/2 geçti. Kontrollü non-automated fixture testinin tüm yazmaları route interception ile sunucudan önce durduruldu; hiçbir test tıklaması gerçek sayaca eklenmedi. Gerçek live bot request 204 döndü; mocked provider unit sınır testi bu durumda RPC çağrılmadığını kanıtlar. Kaynak spoofing, referrer gizleme, ad blockers ve doğrudan anon RPC çağrıları nedeniyle bu metrikler doğrulanmış insan trafiği veya kesin organik trafik değildir. Mevcut tarihsel sayaçlar değiştirilmedi; eski attribution/automated-read verisi geriye dönük güvenilir şekilde düzeltildi iddia edilmez.

Önceki modal commit df3c0b8 Actions success: https://github.com/Palmarghe/palmarghe/actions/runs/36917567481. Ana 40 bölümlük denetim devam ediyor; yeni commit Actions sonucu ayrıca kontrol edilecek.


## Previous modal regression (historical) — 1 October 2026

Worker `c6b42a8f-8a2a-42e7-882b-3a9e0b5a5fda`. Gallery, mobile secret and Studio editor dialogs now lock background scrolling, contain Tab/Shift+Tab, restore focus for all close paths and dismiss only on a genuine backdrop press/release. Clicking gallery content does not dismiss it. Editor close is a non-submitting button: empty required fields no longer prevent cancellation or accidentally insert content. Native Escape and theme behavior are preserved.

Verify: Astro 0 diagnostics, Vitest 23/23, build success; complete local E2E 46/46. Relevant production modal/navigation/cursor tests passed 10/10. The real local gallery publication flow passed; the deployed gallery asset and CSS were tested at 390/1440 px in both themes with a controlled DOM fixture, because no gallery item is currently published. Fixture does not write production content. Mobile portal live tests cover wheel scroll, keyboard loop, backdrop/Escape, focus restore and serious/critical axe in both themes. Authenticated live Chrome Studio verified empty-link cancellation, focus loop and restore, scroll lock, desktop dark and 390 px mobile light (dialog bounds 19–371 px). No content was saved.

Previous commit 82b730a Actions succeeded: https://github.com/Palmarghe/palmarghe/actions/runs/36916288533. The current commit Actions result is checked after push. The full webmaster objective is still active; this closes concrete modal defects, not every form/dropdown/SEO/performance requirement.


Son güncelleme: 1 Ekim 2026. FAZ 1 uygulanabilir kapsam tamamlandı; harici/kullanıcı bağımlı kapılar aşağıdadır. Ana kanıt kaydı `FINAL_REPORT.md` içindedir.

## Tamamlanan

- [x] DNS SERVFAIL kök nedeni belirlendi; zone yedeği/geri dönüş kaydı tutuldu. Cloudflare NS, Worker apex/Studio/www, HTTPS ve yönlendirme doğrulandı; DS/DNSSEC değiştirilmedi.
- [x] Supabase production migration `202609160001`–`009`, atomik içerik/ilişki RPC `202609170010`, FAZ 2 gallery/translation/social migrations `202609190011`–`013` ve üyelik/izin/yorum migration'ı `202609210014` ve community/editorial migration'ı `202609270026` uygulandı; yerel ve remote migration geçmişi eşleşiyor.
- [x] Canlı Chrome profil QA'sı hazır avatar, bio ve görünen adı kaydedip tekrar okudu. Authenticated-only yorum üretimde yayınlandı ve bırakıldı; test üyesi Studio içerik yazma sınırında reddedildi.
- [x] Anon, member, editor ve admin erişim sınırları; 20/20 production Auth/RLS/Storage rol testi; ayrı Chrome Studio yetki testi.
- [x] Beş içerik türünde production draft 404, geçici yayın 200, SEO/noindex; gelecekteki scheduled içerik 404. Altı test kaydı silindi.
- [x] Geçici member/editor Auth hesapları yalnız doğrulanan UUID'leriyle silindi. Son SQL: Auth `0`, profile `0`, audit `0`; gerçek owner admin sağlam `1`.
- [x] Admin private Storage yükleme, staff preview/anonymous denial, Turnstile canlı mesaj ve görünüm ayarı turu doğrulandı.
- [x] Search Console domain sahipliği ve sitemap işlendi; 20 sayfa keşfedildi. TXT öncesi DNS yedeği ve geri dönüş planı `docs/dns-search-console-2026-09-19.md` içinde.
- [x] 1 Ekim doğrulaması: Astro 0 tanı, Vitest 18/18, build başarılı; güncel hedefli yerel E2E 3/3; önceki tam yerel E2E 44/44; güncel production E2E 33/33. Sitemap'teki 27 indekslenebilir rota, koyu ve açık tema kombinasyonlarının tümünde ciddi/kritik WCAG 2.2 axe bulgusu olmadan geçti. Önceki Chrome/Edge/WebKit özel imleç matrisi 9/9; güncel production Chrome arama/imleç kontrolleri geçti. Arama açılışında kırpılan imleç, viewport boyutlu dialog ve ayrı arama kartıyla düzeltildi; kapalı dialog'un sayfa tıklamalarını yakalaması engellendi. Cloudflare Worker `ef4359fe-d4c6-4c34-aa22-231ccaca1b63` canlı ve production doğrulaması tamam.
- [x] 19 Eylül Lighthouse (tarihli tarihsel ölçüm): Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2.2 sn, CLS 0. 1 Ekim Lighthouse 12 mobil profilinde responsive WebP varyantları öncesi Performance 98, Accessibility 100, Best Practices 100, SEO 100; LCP 2.11 sn, CLS 0, TBT 0 kaydedildi. Yeni varyantlar ve embed ertelemesi sonrası saha CWV ölçümü bekleniyor. `npm audit --omit=dev --audit-level=high` yüksek önem düzeyli bulgu vermedi.
- [x] Normal Git push ve GitHub Actions Verify geçmişi yeşil; her yeni production commit için çalışma sonucu ayrıca kontrol edilir.
- [x] Bülten kaydı açık rıza, bot tuzağı, Worker taraflı hız sınırı ve anonim e-posta okumasına izin vermeyen `subscribe_newsletter` RPC’siyle doğrulandı; RPC execute izni yalnız `service_role` içindir. Kontrollü production kayıt oluşturuldu, veritabanında görüldü ve silinerek `0` kaldı.
- [x] Tetikleyici ve scheduler yardımcılarının anon execute izinleri kapatıldı. Zamanlanmış takipçi bildirimleri yalnız Worker service-role ile dağıtılır; production fonksiyon yetki sorgusu anon erişimini `false`, scheduler service erişimini `true` doğruladı.
- [x] Supabase Auth minimum parola uzunluğu 12’ye çıkarıldı; büyük/küçük harf, rakam ve simge kuralı ile parola değişiminde yakın oturum doğrulaması etkinleştirildi.

## Harici veya kullanıcı bağımlı kapılar

- [ ] Özel SMTP sağlayıcısı ve gerçek e-posta teslimatı; signup confirmation/reset callback doğrulaması.
- [ ] Cloudflare Access için ödeme kartı, Terms/Gizlilik Politikası ve olası overage onayı. 28 Eylül canlı Chrome denetiminde Cloudflare One oturumu açıldı ve Zero Trust Free seçildi; etkinleştirme güvenli ödeme ekranında kart, sözleşme kabulü ve kota aşımı ücretlendirme yetkisi istiyor. Wrangler OAuth tokenı Workers/zone işlemlerinde yetkili ancak Access yönetim izni içermiyor.
- [ ] Search Console field Core Web Vitals ve organik tıklama verisinin olgunlaşması. 28 Eylül denetiminde sitemap görünür, 22 URL dizinde; 0 organik tıklama ve yeterli CWV alan verisi yok.
- [ ] İnsan tarafından ekran okuyucu/assistive technology incelemesi.

Bu maddeler FAZ 2 derin incelemesini başlatmayı engellemez. FAZ 2 yeni P0/P1 bulursa yeniden açılacaktır.


## Latest follow-up — 1 October 2026

Current Worker: `32e04843-2abd-43d1-9ba3-710e1d6afe9d`. Search pointer top-layer synchronization is explicit on opening. Cursor position transition lag and privacy UI conflation are fixed: rendered geometry is checked, mandatory legal notice reading acknowledgements are distinct from newsletter opt-in, and localized contact notice links are present. Legal text and production content are unchanged. Verify: Astro 0 diagnostics, unit 23/23, build passed; full local E2E 46/46 and final local cursor regression passed. Preceding Worker production 36/36. Current pointer matrix: Chrome/Edge 10/10 and WebKit 5/5 passed against production. WebKit was installed after its initial executable-missing result; its successful rerun used a separate output directory. This does not close the full webmaster scope or physical Safari/zoom/assistive-technology/SMTP gates.

Final live pointer matrix: Chrome 5/5, Edge 5/5, WebKit 5/5. Both themes retain visible search controls and native text cursor/caret. Screenshot inspection confirmed the pointer on the search close control. Full production run passed 36 cases; one layout case hit a test-artifact directory collision during parallel runs and passed 1/1 when rerun alone. All 37 production cases therefore passed across the full run and isolated rerun. No product assertion failed in that run.
