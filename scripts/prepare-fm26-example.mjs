// Produces a reviewable, idempotent SQL transaction. It does not execute SQL.
import { writeFile, stat } from 'node:fs/promises';
const photoId = 'fe750271-0ab5-4d33-9f29-62cd4e78dff9';
const diagramId = 'f9dc3d4a-5724-4eac-a23a-27abc8261aa9';
const articleId = '59f3cfde-7fb5-4b8a-9633-d7b95c4050c6';
const text = value => ({type:'text',text:value});
const p = value => ({type:'paragraph',content:[text(value)]});
const h = value => ({type:'heading',attrs:{level:2},content:[text(value)]});
const list = values => ({type:'bulletList',content:values.map(value => ({type:'listItem',content:[p(value)]}))});
const link = (label,href) => ({type:'paragraph',content:[{...text(label),marks:[{type:'link',attrs:{href}}]}]});
const document = {type:'doc',content:[
  p('Lamine Yamal için bir taktik kurarken ilk soru, kaç gol atacağı değil; topu nerede ve hangi koşullarda alacağı olmalı. Sağ çizgide yüzünü kaleye dönmüş bir oyuncu ile sırtı dönük, iki rakibin arasında top bekleyen aynı oyuncu bambaşka hücumlar üretir. Bu inceleme, FM26 kariyerinde Yamal’ın çevresini düzenlemek için uygulanabilir bir başlangıç planı sunuyor.'),
  h('Oyuncu dosyası: neyi biliyoruz?'),
  p('FC Barcelona’nın resmi oyuncu sayfasına göre Lamine Yamal, 13 Temmuz 2007 doğumlu ve Esplugues de Llobregat kökenli bir hücum oyuncusu. La Masia’ya yedi yaşında katıldı; A takım ilk maçını Nisan 2023’te Real Betis karşısında oynadı. Kulübün profilinde özellikle cesur driplingi öne çıkarılıyor. Bunlar gerçek futbol profiline ilişkin bilgiler; bir FM kayıt dosyasındaki özellik puanlarının yerine geçmez.'),
  {type:'mediaImage',attrs:{media_id:photoId,alt:'Lamine Yamal, İspanya formasıyla maç sırasında top sürerken',caption:'Lamine Yamal, 4 Eylül 2025. Fotoğraf: Biso / Wikimedia Commons, CC BY 4.0. Boyut küçültüldü ve WebP’ye dönüştürüldü.'}},
  h('Kayıt dosyanı açınca bakacağın ilk beş alan'),
  list(['Teknik profil: dripling, ilk kontrol, pas ve teknik özelliklerini birlikte değerlendir. Tek bir yüksek puan oyuncunun her durumda doğru kararı vereceğini göstermez.','Karar kalitesi: karar alma ve soğukkanlılık, baskı altında hangi seçeneği ne zaman kullanacağını anlamana yardımcı olur.','Hareket: hızlanma, çeviklik ve topsuz alan özelliklerini, takımının topu hangi bölgede kazandığıyla birlikte oku.','Rol ve ayak uyumu: kendi veritabanındaki güçlü ayağı, pozisyon alışkanlığı ve oyuncu özelliklerini kontrol et. Rol adını gerçek futbol şöhretinden hareketle otomatik seçme.','Fiziksel durum: kondisyon, maç keskinliği, sakatlık riski ve antrenman yükünü incele. Kariyerin başlangıç tarihi ve veritabanı güncellemesi bu ekranı değiştirebilir.']),
  h('Top sendeyken: genişlik önce, iç koridor sonra'),
  p('Başlangıç denemesi olarak Yamal’ı sağ kanatta konumlandır. Amaç, ilk pası çizgiye yakın bir alanda almasını ve rakip bekin karşısında seçenek bulmasını sağlamak. Topu kazanır kazanmaz bütün oyuncuları ceza sahasına koşturmak, ona alan açmak yerine pas yollarını kapatabilir.'),
  p('Sağ içteki orta saha ile Yamal’ın aynı anda aynı boşluğa hareket etmemesine dikkat et. Orta sahanın öne koşusu rakip savunmacıyı çekebiliyorsa kanat oyuncusunun içeri yönelmesi daha anlamlı olur. İkisi sürekli yan yana top istiyorsa birinin başlangıç yerini veya hareketini değiştir. Taktik görselleştiricideki yerleşimi maç görüntüsüyle karşılaştır; tek bir ekranda düzgün görünmek yeterli değildir.'),
  {type:'mediaImage',attrs:{media_id:diagramId,alt:'Sağ çizgide Yamal, iç koridorda sekiz numara ve geride destek bekini gösteren taktik şeması',caption:'Palmarghe’nin önerdiği örnek yerleşim. Şema, oynanmış maç verisi veya FM ekran görüntüsü değildir.'}},
  h('Bek tercihi: her atağa bindirme zorunluluğu yok'),
  p('Kanadın arkasındaki bek, yalnız hücuma genişlik sağlayan bir oyuncu değildir; kaybedilen topa karşı güvenlik de sağlar. Yamal çizgide kalırken bek de aynı çizgiye koşuyorsa aynı pas açısını iki oyuncuyla dolduruyor olabilirsin. Önce daha ölçülü bir destek ilişkisi dene. Rakip derine yerleştiğinde bindirmeyi artırmak, rakip hızlı geçişlerle çıkıyorsa bekini daha dengeli tutmak mantıklı bir karşılaştırma olur.'),
  p('Merkezde bir geri pas seçeneği bırak. Her top alışında dripling zorlamak yerine kısa bir duvar pası, rakip bekin vücut yönünü değiştirebilir. Yamal’ın ceza sahasına girişi için santrforun sürekli onun koşu yoluna gelmesini de engelle. Hücumdaki üçgenin amacı oyuncuları birbirine yaklaştırmak kadar aralarında kullanılabilir mesafe bırakmaktır.'),
  h('Top rakipteyken: hücum çıkışı mı, geri takip mi?'),
  p('FM26’nın resmi taktik rehberi, topa sahipken ve topsuzken ayrı dizilişlerin kullanılabildiğini, kanat oyuncularının ileride çıkış noktası olarak tutulabildiğini veya geriye takip görevi alabildiğini açıklıyor. Yamal için bu seçimi maçın bağlamına göre yap: rakibin sol beki sürekli öne çıkıyorsa geriye yardım, topu kazanır kazanmaz boş sağ kanadı kullanmak istiyorsan daha ileride bir çıkış noktası değerlendirilebilir.'),
  p('İleride tutma kararının bedelini takımın geri kalanı öder. Sağ bek yalnız kalıyor, sağ iç orta saha çizgiye sürükleniyor ve merkez açılıyorsa sorun yalnız Yamal’ın görevi değildir. Topsuz yerleşimde o tarafı kimin kapattığını açıkça belirle. Rakip seni ikiye birlerle geçiyorsa, hücumdaki kazanımdan önce savunmadaki tekrar eden durumu düzelt.'),
  h('Gelişim planı: az hedef, düzenli dakika'),
  p('Bir anda birden fazla zayıflığı düzeltmeye çalışmak yerine tek bir gelişim hedefi seç. Bu hedefi antrenör raporu, rolün ihtiyacı ve gözlediğin maç davranışıyla ilişkilendir. Örneğin baskı altında top kayıpları görüyorsan yalnız dripling antrenmanına yüklenmek yerine ilk kontrolü, kararları ve takımın pas açılarını birlikte değerlendir.'),
  p('Antrenman yükünü maç takviminden bağımsız artırma. Üst üste maçlarda yorgunluk işareti varsa dinlenme ve rotasyon planla. Maç dakikaları, uygun seviye ve sağlık arasındaki denge; her karşılaşmada doksan dakika oynatma hedefinden daha kullanışlıdır. Yeni oyuncu özelliği öğretirken mevcut alışkanlıklarla çelişip çelişmediğine de bak.'),
  h('Üç maçlık karşılaştırmayı nasıl yaparsın?'),
  list(['Başlangıç: rakip seviyesi ve oyun planı benzer üç karşılaşmada aynı temel yerleşimi koru. Sadece tek bir değişkeni, örneğin bek hareketini değiştir.','İzleme: sağ kanatta topla buluşma yerleri, top kayıpları, ceza sahasına girişler, yaratılan fırsatlar ve maç sonrası fiziksel durumu not et.','Görüntü: top kaybından önceki iki pası tekrar izle. Rakip baskısı mı, kötü destek açısı mı, oyuncu kararı mı belirleyici?','Karar: yalnız gol ve asist toplamına bakma. Daha iyi fırsat üreten ama bitiriciliğin düşük kaldığı bir düzeni hemen bozma.','Sınır: bu sayfadaki öneriler bir deneme planıdır. Burada ölçülmüş kariyer sonuçları, garanti gol sayıları veya gizli potansiyel puanları paylaşılmıyor.']),
  h('Transfer kararı: önce erişilebilirlik'),
  p('Yamal’ı her kariyer için bir transfer hedefi gibi düşünmek doğru olmaz. Önce kulübün görüşmeye açık olup olmadığını ve oyuncunun ilgisini kontrol et. Ardından ücret, maaş, prim ve kadro beklentisini toplam maliyet olarak değerlendir. Sabit bir bonservis tahmini vermek yerine kendi kayıt dosyandaki gözlemci raporunu esas al; güncelleme, başlangıç tarihi ve oyunun ilerleyişi şartları değiştirebilir.'),
  p('Mevcut takımında benzer genişlik ve yaratıcılık sağlayan bir oyuncu varsa, bu yerleşim planını onunla da deneyebilirsin. Oyuncunun adı değişse de sağ kanattaki destek mesafesi, iç koridor paylaşımı ve geçiş güvenliği aynı sorularla sınanır.'),
  h('Kısa karar notu'),
  p('Yamal’ı hücumun tek çözümü yapmak yerine iyi koşullarda top alan bir karar merkezi olarak kullan. Sağ çizgide başlangıç alanı, içeride dengeli bir koşucu ve geride güvenilir bir pas istasyonu kur. Sonra topsuz oyundaki bedeli izle. Değişiklikleri tek tek test et; takımın ürettiği fırsatların kalitesi, rolün doğru çalışıp çalışmadığını yıldız sayısından daha net anlatır.'),
  h('Kaynaklar ve görsel künyesi'),
  link('Oyuncu biyografisi: FC Barcelona resmi Lamine Yamal profili','https://www.fcbarcelona.com/en/football/first-team/jugadores/129404/lamine-yamal'),
  link('FM26 taktik sistemi: Sports Interactive / Mastering Your Rest Attack in FM26','https://www.footballmanager.com/the-dugout/mastering-your-rest-attack-fm26'),
  link('Fotoğraf: Biso / Lamine Yamal in 2025, Wikimedia Commons','https://commons.wikimedia.org/wiki/File:Lamine_Yamal_in_2025.jpg'),
  link('Fotoğraf lisansı: Creative Commons Attribution 4.0','https://creativecommons.org/licenses/by/4.0/'),
  p('Bu içerik, Palmarghe’nin yayın ve arama akışını denemek için hazırlanmış editoryal örnektir. Taktik yorumları öneridir; gerçek maç haberi veya doğrulanmış oyun simülasyonu değildir. Kaynak kontrolü: 1 Ekim 2026.')
]};
const quote = value => `'${String(value).replaceAll("'","''")}'`;
const photoBytes = (await stat('public/editorial/lamine-yamal.webp')).size;
const diagramBytes = (await stat('public/editorial/yamal-right-channel.png')).size;
const sql = `begin;
insert into public.media(id,path,mime,bytes,width,height,alt_tr,alt_en,caption_tr)
values (${quote(photoId)},'editorial-lamine-yamal.webp','image/webp',${photoBytes},655,1000,'Lamine Yamal İspanya formasıyla maç sırasında','Lamine Yamal playing for Spain','Biso / Wikimedia Commons, CC BY 4.0. Resized and converted to WebP.'),
(${quote(diagramId)},'editorial-yamal-right-channel.png','image/png',${diagramBytes},1200,740,'Yamal için örnek sağ kanat yerleşimi','Illustrative right channel setup for Yamal','Palmarghe original tactical diagram; not game footage.') on conflict(id) do nothing;
insert into public.content_items(id,locale,type,status,title,slug,excerpt,body,cover_media_id,cover_url,og_media_id,published_at,seo_title,seo_description,indexable,featured)
values (${quote(articleId)},'tr','article','published','FM26: Lamine Yamal için sağ kanat oyun planı','fm/lamine-yamal-fm26','Lamine Yamal için rol seçimi, sağ kanat dengesi, topsuz yerleşim ve gelişim planı. Gerçek fotoğraf ve taktik şemasıyla ayrıntılı oyuncu incelemesi.',${quote(JSON.stringify(document))}::jsonb,${quote(photoId)},'/editorial/lamine-yamal.webp',${quote(diagramId)},now(),'FM26 Lamine Yamal: rol, taktik ve gelişim rehberi','FM26 kariyerinde Lamine Yamal için sağ kanat yerleşimi, bek ve orta saha ilişkisi, antrenman ve maç analizi rehberi.',false,false) on conflict(id) do nothing;
insert into public.content_categories(content_id,category_id) select ${quote(articleId)},id from public.categories where slug in ('fm','fm26') on conflict do nothing;
commit;
select id,slug,status,indexable from public.content_items where id=${quote(articleId)};
`;
await writeFile('docs/fm26-example-publication.sql',sql);
await writeFile('docs/fm26-example-document.json',JSON.stringify(document,null,2));
console.log('Prepared FM26 example transaction and structured document.');
