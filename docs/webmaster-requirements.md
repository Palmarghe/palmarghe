# Webmaster hedefi: gereksinim ve kanıt kaydı

Kaynak: `C:\Users\Palmarghe\.codex\attachments\060efb3f-064b-466b-bac2-cf1bafe94603\goal-objective.md`. Hedef iletisindeki `ac2c` dizini yok; dosya `bac2` dizininde bulundu ve tamamı okundu. Bu kayıt kaynak kapsamını daraltmaz. Her satır kaynak bölümünün tüm maddelerini içerir; örnek/koşullu öneriler mevcut mimariye uygulanabilirlik açısından ayrıca değerlendirilmelidir.

1 Ekim 2026 itibarıyla önceki turn somut ilerlemeydi: imleç kırpılması düzeltildi, deploy edildi ve production/Actions doğrulandı. Bu tur modal etkileşimi ve yeni kanıt kaydı ekler. Ana hedefin tamamlanması henüz kanıtlanmış değildir. Tarihsel rapor, yeşil test veya dosyanın varlığı tek başına geniş kapsamı tamamlamaz.

## Doğrudan doğrulanan son değişiklik

- Worker `ef4359fe-d4c6-4c34-aa22-231ccaca1b63`: arama arka plan scroll kilidi, Tab/Shift+Tab döngüsü, backdrop kapanışı, focus restore.
- `npm run verify`: Astro 0 tanı, Vitest 18/18, build başarılı.
- Yerel `e2e/navigation.spec.ts` ilgili üç test 3/3. Production Chrome `search.spec.ts` ve `cursor.spec.ts` 7/7; açık modal axe taraması 390/1440 px × dark/light kombinasyonlarında ciddi/kritik ihlal bulmadı.
- Güncel Worker tam production paketi 33/33 geçti: 27 sitemap URL'sinin iki tema axe taraması, search/cursor, responsive, console ve güvenlik başlıkları dahil. Önceki yerel tam paket kanıtı 44/44; güncel hedefli local testler 3/3. CI tam yerel paketi ayrıca çalıştırır.

## Kodla doğrulanan kusurlar ve durumları

1. **Kapatıldı — Vimeo gömme:** `src/lib/blocks.ts` HTTPS `player.vimeo.com/video/` kabul eder; `src/middleware.ts` CSP `frame-src` Vimeo içermez. Kabul edilen player production'da tarayıcı tarafından engellenebilir. CSP yalnız güvenilir `player.vimeo.com` ile uyumlu hale getirildi. Canlı Chrome kontrollü player yanıtı gerçek iframe içinde render edildi; production header testi de geçti. Kusur kapatıldı. Gerçek üçüncü taraf videonun erişilebilirliği/erişim durumu bu kontrollü testin kapsamı değildir.
2. **P2 — İmleç takip gecikmesi:** `src/styles/global.css` `.brand-cursor` konum transform'una `--cursor-speed:180ms` transition uygular. RAF koordinat testleri ekrandaki gerçek gecikmeyi kanıtlamaz. Konum takibi ile durum animasyonunu ayırıp gerçek bounding rectangle/frametime doğrulaması gerekir.
3. **P2 — Gizlilik UI:** kayıt formu KVKK aydınlatmasını işleme onayıyla aynı zorunlu checkbox metninde sunar; hedefin 28. maddesi bu ayrımı ister. Hukuki metin değişmeden teknik acknowledgement/consent modeli ve sunucu doğrulaması incelenmeli. İletişim formunun aydınlatma checkbox'ında doğrudan gizlilik bağlantısı yok.

## Tam kapsamın kapanması için gereken kanıt

| Kaynak | Gereksinim | Mevcut kanıt / henüz gerekli doğrulama |
| --- | --- | --- |
| 1 | Merkezi renk, spacing, container, typography, radius, shadow, transition, z-index, breakpoint sistemi | CSS token'ları var; tekrarlar ve ham değerler sürüyor. Tüm public/Studio varyantları için merkezi kullanım incelemesi açık. |
| 2 | Dark editorial, kontrollü mor, düşük hareket, korunan marka | Önceki görsel denetim mevcut; bütün rotalar ve Studio durumlarında güncel görsel kanıt gerekli. |
| 3 | Ayrı light/dark yüzey ve vurgu, kontrast | Önceki 27 rota iki tema axe; yeni açık search modal dört kombinasyon geçti. Staff/hesap özel durumları ve küçük metinler ayrıca incelenecek. |
| 4 | Typography scale, 60–75 karakter okuma genişliği, Türkçe/font ağırlıkları | Self-hosted font var; gerçek okuma ölçüsü, metadata ve tüm başlık seviyeleri için kanıt gerekli. |
| 5 | Container/grid/hiza/whitespace | Önceki viewport testleri var; görsel hizalar ve uzun metin varyantları ayrıca gerekli. |
| 6 | Header, aktif menüde ikinci işaret, utility hiyerarşisi | Navigation testleri var; TR/EN ve desktop/tablet header görsel/klavye kapsamı eşlenecek. |
| 7 | Mobil hedefler, kapanış, Esc, trap, scroll lock | Mobil navigation testleri mevcut; her araç ve Studio mobil menüsü için güncel kanıt ayrı tutulacak. |
| 8 | Ölçülü hero, satır uzunluğu, CTA ve doğal geçiş | Studio düzenlenebilir vitrin var; farklı modlar, gizli durum ve theme/mobile kanıtı eşlenecek. |
| 9 | Kart varyantları, oran, erişilebilir tam kart, nested links | Kart kodu/testleri mevcut; bütün varyantların markup/hover/odak incelemesi açık. |
| 10 | Ortak primary/secondary/ghost, loading/disabled/active/focus | CSS ve submit davranışları var; tüm button sınıflarının state matrisi gerekli. |
| 11 | Form state'leri, gerçek label, alan hatası, double-submit | Birim/Studio testleri mevcut; public ve Studio form türleri başına hata/başarı/loading kanıtı gerekli. |
| 12 | Bütün modal/dropdown: Esc, backdrop, trap, restore, lock, ARIA | Search son dört kombinasyon doğrulandı. Gallery/editor/mobile-secret modalı ve dropdown'lar ayrı incelenecek. |
| 13 | Search debounce, keyboard, Enter, Esc, clear, loading/no-result | Production arama 4 test geçti; açık clear eylemi/native clear çapraz tarayıcı kapsamı henüz eşlenmedi. |
| 14 | Login/signup/reset/logout/session, password visibility, return URL | Auth UI ve password script var; SMTP/reset dış kapı, güncel return URL ve bütün hata durumları açık. |
| 15 | WCAG 2.2 AA: bütün semantic/keyboard/focus/contrast/motion alanları | Axe ciddi/kritik sonuçları yalnız otomatik alt kapsamı kanıtlar. Manuel klavye, tüm ihlal seviyeleri ve assistive technology incelemesi açık. |
| 16 | On viewport, uzun başlık/URL, form/modal/footer/crop | Önceki on-width home/AI ve temsilî public form kontrolleri var; tüm responsive varyant ve Studio kapsamı eksiksiz eşlenmeli. |
| 17 | 150–250ms sade etkileşim, maliyet/motion uyumu | Animasyon CSS'si mevcut; loop/motion ve runtime maliyet incelemesi gerekli. |
| 18 | Srcset/sizes/WebP/uygun format, ölçüler/lazy/priority/CLS | Responsive music artwork kanıtı var; tüm görsel kaynakları (Storage, reklam, OG, avatar) ayrı değerlendirilecek. |
| 19 | LCP<2.5s, INP<200ms, CLS<0.1, JS/CSS/third-party/API | Son Lighthouse responsive varyantlar/embed ertelemesi öncesi. Güncel profil, bundle/unused kaynak ve interaction ölçümü gerekli; saha INP verisi dış kapı. |
| 20 | Minimal font/weight, display/preload/subset/CLS | Self-hosted font mevcut; yüklenen gerçek dosyalar ve font swap etkisi ölçülecek. |
| 21 | Asset cache, dinamik no-stale, CDN | Middleware HTML/API no-store; fingerprint immutable build kanıtı var. Diğer statik yolların header matrisi gerekli. |
| 22 | Title/description/canonical/hreflang/robots/sitemap/OG/headings | Production smoke kapsar; tüm sitemap URL'leri için uniqueness, language pairing ve indeks kuralları matrisi gerekli. |
| 23 | Doğru schema ve Rich Results uyumu | Organization/WebSite/Article smoke var; uygun sayfa türü/Breadcrumb/Video şemaları ve resmi validator kanıtı açık. |
| 24 | OG/Twitter alanları, oran/çözünürlük/fallback | OG fallback mevcut; tüm önemli sayfa türleri ve gerçek görsel ölçüleri incelenecek. |
| 25 | 404/search/navigation, güvenli 500/API/network mesajı | 404 kodu ve search network tests var; diğer server/API hata senaryoları gerekli. |
| 26 | XSS/CSRF/injection/session/rate/uploads/redirect/headers/cookies | Middleware başlıkları, Zod/RLS ve güvenlik testleri var. Runtime cookie/Origin/endpoints kapsamı açık. Vimeo CSP uyumu kontrollü canlı iframe ve header testiyle kapatıldı. |
| 27 | Spam koruması/validation/honeypot/timing/rate | Turnstile, newsletter honeypot ve rate limit kodu var; her yazma formunun abuse matrisi gerekli. |
| 28 | Aydınlatma/consent ayrımı, minimum veri, link/erişim/silme UX | Mevcut metinler korunacak. Signup checkbox ayrımı ve contact privacy link kusurları açık; hukuki inceleme dış kapı. |
| 29 | Her async işlemde loading/error/success | Search/network kanıtı güçlü; diğer async/save/media/profile/auth işlemleri ayrı eşlenecek. |
| 30 | Empty/error açıklaması ve doğru eylem | Birkaç empty-state testi var; tüm public/Studio listelerinin error/empty varyantları gerekli. |
| 31 | Sade/hizalı/okunur mobile footer | Social icon değişikliği mevcut; iki tema/on-width footer kanıtı eşlenecek. |
| 32 | Tek icon sistemi, tutarlı stroke/ağırlık, labels | SVG/social ve icon-only label'lar mevcut; tüm public/Studio icon inventory gerekli. |
| 33 | Radius/shadow/height/gap/container/hover tutarlılığı | CSS çok sayıda tarihsel override içerir. Token/component bazlı tutarlılık denetimi açık. |
| 34 | Tekrar/dead code/dependency/type/build/console | İki ölü arama dosyası kaldırıldı; verify temiz. Repo genelinde kalan tekrar/dependency incelemesi açık. |
| 35 | Duplicate tracking/privacy/events/maliyet | Mevcut traffic script ve filtreli sayaç var; runtime istek/olay sayısı ve veri minimizasyonu incelenecek. |
| 36 | Desktop/mobile/keyboard/theme/language/auth/form/search/404/network/no-JS/build/console/a11y/perf | Her test dosyasının hangi gereksinimi kapsadığı eşlenmeli; geniş test toplamı bütün durumları kendiliğinden kanıtlamaz. |
| 37 | Her değişiklik için fayda/maliyet/a11y/mobile/theme/SEO/gereklilik | Son modal düzeltmesi doğrudan kullanıcı kusurunu giderir; gelecekteki her değişiklik aynı değerlendirmeye tabidir. |
| 38 | P0/P1 önce, sonra P2/P3 | Vimeo P1 kusuru kapatıldı; cursor takibi ve privacy UI P2. Önce gerçek kullanıcı kusurları kapatılacak. |
| 39 | İstenen kategori başlıklarında kısa final rapor | FINAL_REPORT mevcut; ana hedef tamamlanınca istenen final formatı ve tüm kontrol kanıtları gerekir. |
| 40 | Kimliği koruyarak profesyonel/ölçülü/içerik odaklı sonuç | Görsel/teknik bütün kapsam kapanmadan sonuç iddiası yapılamaz. |

## Özel imleç ek kapsamı

Üç konsept ve seçilen crop-mark/P geometrisi `docs/custom-cursor.md` içinde. Semantik state sistemi, touch/reduced-motion initialize engeli, native text/checkbox fallback, tema ve modal testleri mevcut. Aşağıdakiler henüz tamamlanma kanıtı değildir:

- Konum transition gecikmesi ve gerçek 60fps/paint/frame ölçümü.
- Firefox: Windows Playwright executable başlatılamadı. Bu site başarısı olarak sayılamaz; farklı çalışan runtime gerekir.
- Safari engine WebKit sonucu gerçek Safari cihaz/tarayıcı sonucunun yerine kullanılamaz.
- 125% viewport benzetimi gerçek browser zoom matrisi yerine kullanılamaz.
- Init sonrası script hata durumunda native fallback, tüm modal/dropdown ve medya/iframe yüzeyleri.
- Mouse-down süre/ölçek, loading yalnız gerçek işlem sırasında, text selection, high-DPI ve hızlı harekette gerçek render koordinatları.

## Dış kapılar

SMTP gerçek teslimat/reset callback, Search Console saha verisinin olgunlaşması ve manuel assistive-technology/hukuki inceleme dış veya kullanıcı bağımlı kapılardır. Bunların varlığı uygulanabilir kod ve test işlerini durdurmaz. Cloudflare Access aktivasyonu ödeme/terms bağımlı mevcut dış kapıdır; ana hedefte MFA yeniden ekleme isteği yoktur.
