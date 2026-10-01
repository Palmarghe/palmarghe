# Görsel ve ürün denetimi — 21 Eylül 2026

## Arama modal gereksinimleri — 1 Ekim 2026

- Hedefin 12. maddesine karşı incelemede arama açıkken arka plan scroll kilidi ve kart dışına tıklayarak kapanma eksikti. `search-overlay-open` sırasında viewport scroll kilitlenir; yalnız kart dışında başlayan ve biten pointer hareketi modalı kapatır. Kart içinde başlayıp dışarı taşan seçim hareketi kapanma tetiklemez.
- Native dialog tek başına Shift+Tab odağını kartta tutmadı; ilk/son görünür kontrol arasında açık bir Tab döngüsü eklendi. Kapanınca desktop arama düğmesine veya mobil menü açma düğmesine odak geri döner.
- Yerel hedefli test 3/3, build/18 birim testi ve production Chrome arama/imleç testleri 7/7 geçti. Modalın açık hali 390/1440 px ve dark/light kombinasyonlarında ciddi/kritik axe ihlali olmadan doğrulandı. Worker `5bedffcc-72a7-4e7d-af5a-0dc964a5edfa` yayında. Önceki tam paket sayıları önceki sürümün kanıtıdır.

## Arama açılışında imleç — 1 Ekim 2026

- Canlı sitede arama simgesine tıklanınca özel imleç kaybolabiliyordu: imleç küçük dialog kutusuna taşınıyor, kutunun dışındaki viewport koordinatlarında kırpılıyordu. Tam ekran, şeffaf native dialog yüzeyi ve ayrı kaydırılabilir arama kartı kullanıldı. Input modal açılınca odaklanır; metin alanında tarayıcının I-beam imleci ve tema vurgulu caret kullanılır.
- Modal `display:flex` ile viewport kapladığı için kapalı durum açıkça `display:none` yapıldı; aksi durumda kapalı dialog da sayfa tıklamalarını engelliyordu. Açık temada renk denetimi görünür panel üzerinden yapılır.
- Doğrulama: yerel Playwright 44/44, `npm run verify` ve canlı production Playwright 31/31 geçti. Canlı Chrome özel imleç, masaüstü/mobil arama, 27 indekslenebilir sayfanın iki temadaki axe taraması ve console kontrolleri geçti. Worker `65461809-11c3-43df-bd0c-42d88e52f9e1` yayında.

## Tam site erişilebilirlik ve gömülü medya denetimi — 1 Ekim 2026

- Canlı sitemap'in 27 indekslenebilir URL'si production axe ile koyu ve açık temada ayrı ayrı tarandı; ciddi/kritik WCAG 2.2 bulgusu kalmadı. Tarama müzik detayları ve yorum alanlarını da kapsıyor.
- Müzik sayfalarında YouTube player ilk sayfa yüklemesinde üçüncü taraf iframe ve erişilebilirlik ağacı ihlalleri oluşturuyordu. Video artık sayfa içinde yerel, klavyeyle etkinleştirilebilen bir yükleme düğmesiyle gösterilir; okuyucu seçince güvenli YouTube/Vimeo iframe'i oluşturulur. JavaScript kapalıysa açıkça etiketli dış bağlantı kalır. Böylece ilk yüklemede üçüncü taraf player çalıştırılmaz.
- Yorum gövdesi açık temada koyu yüzey için tanımlanan açık gri rengi kullanıyordu; yorum giriş bağlantısı da iki temada aynı moru kullanıyordu. Gövde metni ve bağlantı artık tema metin token'ını, bağlantı ayrımı için mor alt çizgiyi kullanıyor.
- Doğrulama: `npm run verify` (Astro 0 tanı, Vitest 18/18, build), yerel E2E 44/44, production E2E 31/31 ve özel imleç matrisi Chrome/Edge/WebKit 9/9 geçti. Firefox mevcut Windows Playwright sürecinde başlatılamadığı için dış tarayıcı matrisi açığı sürüyor.

## FAZ 2 yayın doğrulaması

20 Eylül'de canlı `https://palmarghe.com/` Chrome'da tekrar incelendi. Yeni hero görseli, kategori kartları, mobil menü ve tipografik hiyerarşi doğru yüklendi. Worker sürümü `02653ebf-1315-4569-8f95-41b9b9014a27` üzerindeki production Playwright paketi 10/10 geçti; yerel regresyon 28/28 geçti. Önceki tablodaki FAZ 1 production role matrix ve atomik transaction maddeleri tarihsel bulgudur; ikisi de 19 Eylül production doğrulamasıyla kapanmıştır.

| Öncelik | Rota / alan | FAZ 2 düzeltmesi | Doğrulama |
| --- | --- | --- | --- |
| P1 | `/` masaüstü/mobil | Paket görseliyle güçlü, ölçülü portal hero; TR/EN eyebrow; dinamik konu başlıkları ve yumuşak gezinme geçişleri. | Canlı Chrome, altı genişlik E2E, axe. |
| P1 | Tüm public rotalar | Self-hosted Manrope, aktif menü durumu, erişilebilir arama simgesi, paylaşım için OG/Twitter fallback görseli. | Yerel typecheck, metadata E2E, production smoke. |
| P1 | İçerik ayrıntısı ve Studio | Galeri seçimi/sırası, iki dilde alt metin ve başlık, FM mod bilgisi, güvenli harici bağlantılar, slug üretimi, filtreler, UUID'siz çeviri eşleştirme ve kontrollü medya/not/CTA/gömme/tablo blokları. | Yerel Studio E2E 28/28; Chrome'da canlı admin Studio araç çubuğu ve hata konsolu doğrulandı. |
| P1 | Supabase | Yalnız yayımlanmış galerilerin medya erişimi, staff çeviri eşleme RPC'leri ve canonical/OG metadata RPC desteği production'a uygulandı. | Chrome SQL katalog sorgusu beş varlığı doğruladı; canlı Studio admin içerik ekranı doğrulandı. |

## Yöntem

Canlı `palmarghe.com/`, `/ai/` ve oturum açık `studio.palmarghe.com/studio/` Chrome'da görsel ve erişilebilirlik ağacıyla incelendi. Yerel Chrome Playwright testleri 360, 390, 768, 1024, 1440 ve 1920 piksel genişliklerde ana sayfa, kategori ve Studio yatay taşmasını kontrol etti. Kritik sayfalarda axe taramaları koştu. Bulgular yayındaki içerik sayısının sıfır, Studio içerik sayısının bir olduğu mevcut durumu yansıtır.

| Öncelik | Rota / durum | Gözlem | Düzeltme / durum |
| --- | --- | --- | --- |
| P1 | `/` masaüstü ve mobil | Vitrin ve son yayınlar, içerik olmadığı halde iki büyük boş panel üretiyordu. | İçerik yokken bu bölümler gizlendi; konu alanları görünür kaldı. Yerel test ve canlı Chrome doğrulaması geçti. |
| P1 | `/ai/` ve diğer boş kategori rotaları | Büyük başlığın altında tek satırlık boş mesaj sayfayı bitmemiş gösteriyordu. | Açıklayıcı TR/EN metin ve arşive dönüş bağlantısı eklendi. Yerel test ve canlı `/ai/` Chrome doğrulaması geçti. |
| P1 | `/studio/` admin | İngilizce, düz kenar menü ve boş dashboard araçların önceliğini göstermiyordu. | Türkçe bölüm adları, aktif durum, içerik/mesaj/medya sayıları, hızlı eylem ve son içerikler eklendi. Yerel test ve canlı Chrome doğrulaması geçti. |
| P1 | `/studio/` 768 px | Studio yan menüsünün min-content genişliği sayfayı 1189 px'e taşıyordu. | Grid `minmax(0,1fr)` ve menü iç kaydırmasıyla giderildi; altı genişlikte test geçti. |
| P1 | `/about/` masaüstü | Sayfa tek satır açıklamadan oluşuyor, alanın amacı ve sonraki eylem belirsiz kalıyordu. | TR/EN editoryal açıklama ve arşiv/iletişim bağlantıları eklendi; yerel E2E ve canlı Chrome geçti. |
| P2 | Studio giriş ve listeler | Formlar ve tablolar henüz kapsamlı klavye/ekran okuyucu incelemesinden geçmedi. | Otomatik axe kritik ihlal bulmadı; manuel inceleme açık. |
| P1 | Production auth/roles | Member/editor/admin ve Storage sınırları gerçek hesaplarla uçtan uca kanıtlandı. | Production rol betiği 20/20 geçti; kontrollü hesaplar ve ilişkili profile/audit kayıtları temizlendi. |
| P1 | Studio content persistence | İçerik, kategori ve etiket bağları birden fazla istekle güncelleniyor; ara hata kısmi veri bırakabilirdi. | `202609170010` ile atomik RPC eklendi; private QA taslağı production Studio’da başarıyla kaydedildi. Role matrix doğrulaması açık. |

## Ölçümler ve sınırlar

- Önceki canlı Lighthouse mobile sonucu 99/100/100/100, LCP 2.1 s ve CLS 0 idi. Bu değişiklikler sonrası tekrar ölçüm gereklidir.
- 28 Eylül 2026 denetiminde yerel Playwright paketi 40/40 geçti. Bu paket ciddi/ kritik axe denetimleri, Studio içerik alanı, üyelik/yorum yetkileri, bildirimler, mobil menü ve reklam yönetimi kısayollarını kapsar.
- Production Playwright paketi 11/11 geçti: public rotalar, metadata, varlıklar, güvenlik başlıkları, console denetimi, `/`, `/en/`, `/contact/`, `/account/`, `/archive/` ve Studio girişinde axe kontrolleri başarılıdır.
- Production içerik tipi örnekleri ve role matrix doğrulandı; custom SMTP ile alan performans verisi dış bağımlılık olarak açık kalır.


## V3 devam denetimi — 21 Eylül 2026

- Canlı Chrome: tam arama tür filtresi, Ctrl/Cmd+K arama penceresi, yedi sıralı Studio ana sayfa modülü ve authenticated blok editörü denetlendi.
- Arama sonucu metni güvenli biçimde oluşturulur; klavyede yukarı/aşağı seçim, Escape ve odak dönüşü vardır.
- Galeri detayları klavye ile kapatılabilen lightbox'a sahiptir; normal görsel bağlantısı geri dönüş olarak korunur.
- npm run verify 14/14 test ile geçti; production console-error testi ayrıca geçti ve npm audit --omit=dev --audit-level=high sıfır açık buldu.


## Studio writing workspace — 21 Eylül 2026

- Yapışkan işlem çubuğu, kaydetme durumu, güçlü başlık/deck alanı, odak modu ve sağ ayar rayı production'a alındı.
- Seçili metinde bağlam araç çubuğu; güvenli link, slash komutları ve erişilebilir blok diyaloglarıyla birlikte çalışır.
- Ana sayfa visual reel yalnız gerçek kapak görsellerinden oluşur; dar ekranlarda üç ve iki sütuna iner.

### Studio editör derinleştirmesi — 21 Eylül 2026

- Üst çalışma çubuğu taslak, yayın, zamanlama, önizleme ve odak eylemlerini görünür biçimde bir araya getirir; başlık, kısa açıklama ve URL açıklaması yazı hiyerarşisine göre düzenlendi.
- Araç çubuğunda geri al/yinele, aktif durumlar, ipuçları ve Ctrl/Cmd+K bağlantı akışı vardır. Slash menüsü arama, ok tuşları, Enter ve Escape ile denetlendi.
- Medya seçici küçük önizlemeli, aranabilir seçim ızgarasına; içerik içi galeri ise doğrulanmış çoklu medya bloğuna dönüştürüldü. CTA blokları kontrollü vurgu/ikincil/metin stili taşır. Tablo ekleme diyaloğu güvenli sınırlar içinde satır ve sütun sayısını seçtirir. Seçili üst düzey blok için ekle, taşı, çoğalt ve sil denetimleri klavye erişimli bir araç çubuğunda sunulur.

## Referans uyumu ve gerçek yayın verisi — 21 Eylül 2026

- Ana sayfa lead/support vitrini, yoğun NOW şeridi, görsel konu portalları, dört sütunlu son yayınlar, FM odağı, Lab notları ve görsel akış ile referanstaki editoryal ritme yaklaştırıldı.
- AI, oyun, FM26 ve Lab için dört özgün WebP kapak üretildi. Bunlar production Storage'a iki dilli alt metinlerle kaydedildi ve her kategoriye ait gerçek, yapılandırılmış bir örnek yayında kullanıldı.
- Studio ayar rayındaki teknik etiketler ilk kez içerik girecek kullanıcı için sadeleştirildi. Gizli slash menüsünün görünmesi, uzun medya adlarının yatay taşması ve 360 px dolu ana sayfa taşması canlı Chrome denetimlerinde bulundu ve kapatıldı.
- Son Worker sürümü `2d7742d9-8c0d-476c-a8c6-2568489c3144`; production Playwright 10/10 geçti. Altı genişlikte yatay taşma yok, canlı axe taramalarında ciddi veya kritik bulgu yok ve kritik rotalarda tarayıcı konsol hatası yok.
