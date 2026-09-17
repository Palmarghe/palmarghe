# palmarghe.com DNS durum yedeği ve geri dönüş planı

16 Eylül 2026, DNS değişikliği öncesi. Bu dosya panelde görülebilen ayarları ve bağımsız salt okunur sorguları kaydeder. Turhost DNS yönetimi etkin olmadığından mevcut zone export'u yoktur; panelde kayıt tablosu gösterilmiyor.

## Kayıtlı durum

- Registrar: Turhost; alan adı aktif, bitiş 16.09.2027.
- Registrar NS alanları: `cpns1.turhost.com`, `cpns2.turhost.com`.
- Turhost DNS Yönetimi ekranı: “DNS yönetim hizmeti etkinleştirilmemiş.” Kayıt listesi mevcut değil. Panel bu özelliğin `dns1.turhost.com` / `dns2.turhost.com` ile kullanılmasını öneriyor; bu öneri uygulanmadı.
- Turhost Hosting Yönetimi: “Kayıtlı hizmetiniz bulunmuyor.” Bu hesapta barındırma/e-posta hizmeti kaydı görünmüyor; başka sağlayıcıda e-posta kullanımı hakkında kesin kanıt değildir.
- Google Public DNS, `NS` (CD=1): SERVFAIL, “Name servers refused query (lame delegation?) [37.230.110.110, 37.230.111.111].” `DS` (CD=1): NOERROR, yanıt yok; `.com` SOA authority. Bu, parent DS olmadığını gösterir.
- Cloudflare DNS, `NS`: SERVFAIL, “No Reachable Authority at delegation” ve `37.230.111.111:53 returned REFUSED`.
- Google NS normal sorgu: SERVFAIL. Canlı A/AAAA/CNAME/MX/TXT/CAA kayıtları çözümlenemediğinden korunacak kayıtlar panel/hosting sağlayıcısından ayrıca doğrulanmalıdır. Bu bulgu “kayıt yok” anlamına gelmez.
- Cloudflare ücretsiz zone oluşturuldu ve otomatik tarama **0 kayıt** buldu. Atanan NS: `kaiser.ns.cloudflare.com`, `serenity.ns.cloudflare.com`. Registrar delegasyonu henüz değiştirilmedi.
- Worker `palmarghe` dağıtıldı. Cloudflare zone'da `palmarghe.com`, `studio.palmarghe.com`, `www.palmarghe.com` için otomatik oluşturulmuş **3 proxied Worker** kaydı var (TTL Auto). MX/TXT/CAA veya başka kayıt yok. Delegasyon öncesi bu liste panelden doğrulandı.

## Teşhis

Kök neden DNSSEC zinciri değil, lame delegation: parent NS'ler Turhost cpns sunucularını işaret ediyor; yetkili sunucular bu zone için sorguyu reddediyor. DNSSEC/DS ayarı değiştirilmemiştir.

## Değişim ve geri dönüş kapıları

1. Yeni Cloudflare zone'da mevcut e-posta ve diğer servis kayıtları Turhost hosting/e-posta paneli ve alan adı sahibinin bilinen yapılandırmasıyla karşılaştırılmalı; MX, SPF, DKIM, DMARC, CAA ve tüm host kayıtları/TTL'leri kaydedilmeli. Kayıt bulunmuyorsa bunun servis yokluğundan mı yoksa bozuk eski zone'dan mı kaynaklandığı doğrulanmalı.
2. Cloudflare zone'a eşdeğer kayıtları ve Worker custom domain hedeflerini hazırlayıp Cloudflare'ın atanmış NS'lerini kaydet. Yetkili sunuculara doğrudan SOA/NS ve önemli kayıt sorgularını doğrula.
3. Ancak bu noktadan sonra Turhost NS alanlarını Cloudflare'ın **zone için verdiği** iki NS ile değiştir. DS olmadığını tekrar doğrula. Sonra farklı recursive resolver'larla NS, A/AAAA, MX/TXT ve HTTPS/TLS kontrol et.
4. Geri dönüş gerekirse önceden kaydedilmiş `cpns1.turhost.com` ve `cpns2.turhost.com` değerlerine dön; fakat eski yetkili sunucular REFUSED verdiği için bu tek başına hizmeti onarmaz. Önce Turhost zone/hosting DNS hizmetini yeniden etkinleştirmek veya geçerli bir zone sağlamak gerekir. E-posta kayıtlarını Cloudflare zone'da tutmak, gerekmedikçe geri dönüşten daha güvenlidir.

## Uygulanan değişiklik ve doğrulama — 17 Eylül 2026

- Turhost registrar nameserver alanları `kaiser.ns.cloudflare.com` ve `serenity.ns.cloudflare.com` olarak güncellendi. Panel başarı bildirdi; Cloudflare zone “Your domain is now protected by Cloudflare” durumuna geçti.
- Google ve Cloudflare resolver sorguları yeni NS çiftini döndürüyor. Google A yanıtı Cloudflare edge adreslerine çözümleniyor; Cloudflare yetkili SOA doğrudan yanıtlıyor. Parent DS hâlâ yok; DS/DNSSEC değiştirilmedi.
- Cloudflare DNS zone içinde apex, `studio` ve `www` için üç proxied Worker kaydı mevcut. Önceki Turhost zone export'u hizmet kapalı olduğundan mümkün olmadı; eski yetkililer `REFUSED` veriyordu. Bilinmeyen posta kaydı varmış gibi varsayılmadı.
- Chrome'da `https://palmarghe.com/` ve `https://studio.palmarghe.com/studio/` geçerli HTTPS ile açıldı. `www` HTTP 301 ile apex'e yönleniyor. Bu doğrulama sertifika sağlama tamamlandıktan sonra yapıldı.
- Geri dönüş gerekirse önce Turhost DNS hizmeti ve doğru zone yeniden çalışır hale getirilmeli; aksi halde eski NS çiftine dönmek tekrar SERVFAIL üretir. Cloudflare kayıtları ve bu dosya geri dönüş referansıdır.
