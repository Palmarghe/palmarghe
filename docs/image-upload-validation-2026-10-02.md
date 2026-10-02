# Görsel yükleme doğrulaması — çalışma kaydı

## Durum

Değişiklikler Worker `591ab0aa-99d1-4c29-ba53-a3ddee154b21` olarak deploy edildi. Önceki doğrulanan Worker `12e14605-beb3-4040-b765-5433108b2be3` tarihsel release'dir. Authenticated Chrome preflight geçti. Tam production E2E 59 passed/1 failed; aynı medya testi değişmeden ayrı koşuda 1/1 geçti. Ana webmaster hedefi tamamlanmış değildir.

## Uygulanan sınırlar

- PNG/JPEG/WebP tam piksel decode; yalnız magic-byte kabulü kaldırıldı.
- Decode öncesi container/dimension sınırı: 3 milyon piksel, kenar başına 4096 px, dosya başına 10 MB. Animasyon reddedilir. Normal profil metadata kabul edilir; sıkıştırılmış PNG metadata çıktısı ayrıca sınırlandırılır.
- EXIF yönüne göre görüntülenen genişlik/yükseklik hesaplanır ve yeni medya metadata kaydına yazılır. Kaynak görsel byte'ları değiştirilmez.
- Multipart gerçek stream uzunluğu sınırlandırılır; 10 saniye body deadline, isolate başına bir etkin görsel işlemi bulunur. Bu deadline Storage/database ağ çağrılarını kapsamıyor.
- Studio “Dosyayı kontrol et” aynı yetki/decoder sınırını kullanır. `operation=validate` Storage ve metadata mutation'dan önce döner. Girdiler korunur; “Henüz yüklenmedi” mesajı gerçek yükleme ile karıştırılmasını önler.
- Decoder WASM yalnız sunucu CompiledWasm modülleridir; tarayıcı decoder yüklemez.

## Mevcut kanıt

- Son `npm run verify`: Astro 0 error/warning/hint, 160 unit test geçti, build başarılı.
- Tam local E2E 60/60 geçti (3.2 dakika). Tags testi sırasında Vite `AbortError: Transition was skipped. Navigation aborted` unhandled rejection çıktısı görüldü; temiz dev logları iddia edilmez.
- Hedefli Studio recovery/preflight gerçek yerel Worker E2E: 4/4 geçti. JPEG/PNG/WebP 1600×1200 ve normal metadata/yön bilgisi; bozuk PNG, form korunması ve kütüphane sayısının değişmemesi doğrulandı.
- Multipart/decoder testleri 16/16: gerçek body uzunluğu, declared length, idle stream cancel, stale release ve codec negatif/pozitif örnekleri.
- `wrangler deploy --dry-run` başarılı: üç codec compiled-wasm olarak paketlendi; toplam Worker upload 2280.33 KiB, gzip 610.83 KiB. Dry-run deploy veya production CPU/bellek kanıtı değildir.
- Eski 1px PNG fixture tam decoder tarafından reddedildi. Bozuk fixture negatif test olarak korundu; E2E fixture'ları Sharp ile üretilen geçerli PNG ile değiştirildi.
- Gerçek Chrome admin oturumunda 2000×1500 (3 MP) JPEG/PNG/WebP, normal profil/EXIF orientation=6 ile ayrı ayrı doğrulandı; üçü de 1500×2000 gösterildi. Rastgele yoğun piksel verili 3 MP JPEG (2421 KB) ayrıca geçti. Bu örneklerde gözlenen CPU/bellek limit hatası yoktur; her olası dosya için limit ölçümü iddiası değildir. Yeni server-rendered medya ekranında sayının hâlâ 7 olması kontrol edildi. Hiçbir Storage/Auth/content test kaydı oluşturulmadı. Chrome gözlenen error/warn listesi boş. Ekran kanıtı: `image-upload-chrome-2026-10-02.png`.
- Production medya testinde trace bir görsel için status -1/incomplete gösterdi (5 saniye predicate timeout); sonradan gerçek Chrome aynı görseli 655px decoded olarak gösterdi. Public GET ayrı ölçümde HTTP200, 70980 bytes, TTFB0.506s, total0.572s. Bu sonraki kanıt ilk başarısız koşuyu silmez; ilgili test tekrarından önce ana koşunun terminal sonucu bekleniyor.

## Henüz açık

İlk production medya timeout'unun kesin kök nedeni hâlâ kanıtlanmadı; değişmeyen testin ayrı tekrarında 1/1 geçmesi, ilk koşunun 60/60 olduğu anlamına gelmez. Commit `56fc776` normal push ile main'e gönderildi. Actions `37058265623` completed/success: verify ve tam local E2E dahil yeşil. https://github.com/Palmarghe/palmarghe/actions/runs/37058265623 Local mock Storage upload testi gerçek production Storage yazısı değildir. Deploy startup 16 ms değeri decode CPU ölçümü değildir.

Metadata INSERT başarısızlığı sonrası mevcut Storage remove akışının geç tamamlanan INSERT ile yarışması ve local orphan temizliği bu değişikliklerle çözülmedi. Ayrı güvenli transaction/recovery çalışması gerektirir. Bu kayda dayanarak tüm medya yaşam döngüsü tamamlandı sayılamaz.
