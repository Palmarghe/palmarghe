# Production doğrulama kontrol listesi

## Current modal regression — 1 October 2026

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
