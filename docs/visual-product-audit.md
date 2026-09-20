# Görsel ve ürün denetimi — 20 Eylül 2026

## FAZ 2 yayın doğrulaması

20 Eylül'de canlı `https://palmarghe.com/` Chrome'da tekrar incelendi. Yeni hero görseli, kategori kartları, mobil menü ve tipografik hiyerarşi doğru yüklendi. Worker sürümü `2be3e57e-e694-4298-a13c-914b9c5422e3` üzerindeki production Playwright paketi 10/10 geçti; yerel regresyon 28/28 geçti. Önceki tablodaki FAZ 1 production role matrix ve atomik transaction maddeleri tarihsel bulgudur; ikisi de 19 Eylül production doğrulamasıyla kapanmıştır.

| Öncelik | Rota / alan | FAZ 2 düzeltmesi | Doğrulama |
| --- | --- | --- | --- |
| P1 | `/` masaüstü/mobil | Paket görseliyle güçlü, ölçülü portal hero; TR/EN eyebrow; dinamik konu başlıkları ve yumuşak gezinme geçişleri. | Canlı Chrome, altı genişlik E2E, axe. |
| P1 | Tüm public rotalar | Self-hosted Manrope, aktif menü durumu, erişilebilir arama simgesi, paylaşım için OG/Twitter fallback görseli. | Yerel typecheck, metadata E2E, production smoke. |
| P1 | İçerik ayrıntısı ve Studio | Galeri seçimi/sırası, iki dilde alt metin ve başlık, FM mod bilgisi, güvenli harici bağlantılar, slug üretimi, filtreler ve UUID'siz çeviri eşleştirme. | Yerel Studio E2E 28/28. Production DB migration'ı bekliyor. |
| P1 | Supabase | Yalnız yayımlanmış galerilerin medya erişimi ve iki staff RPC için migration hazır. | SQL uygulanması, Auth/RLS/Storage doğrulaması oturum geri geldiğinde yapılacak. |

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
| P1 | Production auth/roles | Member/editor/admin ve Storage matrisi gerçek hesaplarla uçtan uca kanıtlanmadı. | Yerel adapter testleri var; production doğrulaması açık. |
| P1 | Studio content persistence | İçerik, kategori ve etiket bağları birden fazla istekle güncelleniyor; ara hata kısmi veri bırakabilirdi. | `202609170010` ile atomik RPC eklendi; private QA taslağı production Studio’da başarıyla kaydedildi. Role matrix doğrulaması açık. |

## Ölçümler ve sınırlar

- Önceki canlı Lighthouse mobile sonucu 99/100/100/100, LCP 2.1 s ve CLS 0 idi. Bu değişiklikler sonrası tekrar ölçüm gereklidir.
- `npm run verify` 0 typecheck hatası, 11 unit test ve build geçti. 24/24 E2E testi ve `npm audit --omit=dev --audit-level=high` geçti.
- Salt okunur production Chrome Playwright paketi 12 rota, assetler, güvenlik başlıkları, 404, altı genişlik ve menüyü kapsıyor; 3/3 geçti.
- Üretimde gerçek TR/EN içerik örnekleri, rol matrisi, SMTP ve alan performans verisi henüz doğrulanmadı. Bu bulgular kapanana kadar nihai durum tamamlanmış sayılmaz.
