-- Premium, locally served artwork and search-friendly editorial copy for the public music catalogue.
-- Covers are versioned with the site instead of relying on compressed external video thumbnails.
update public.content_items
set
  cover_url = case slug
    when 'music/sevenfold-thunder' then '/visuals/music/sevenfold-thunder.png'
    when 'music/anatolian-sub-ritual' then '/visuals/music/anatolian-sub-ritual.png'
    when 'music/anatolian-velocity' then '/visuals/music/anatolian-velocity.png'
    when 'music/kara-yol' then '/visuals/music/kara-yol.png'
  end,
  featured = (slug = 'music/anatolian-velocity'),
  title = case slug
    when 'music/sevenfold-thunder' then 'Sevenfold Thunder: Karadeniz Horon Ritmi ve Techno'
    when 'music/anatolian-sub-ritual' then 'Anatolian Sub Ritual: Karanlık Anadolu Elektronik Müziği'
    when 'music/anatolian-velocity' then 'Anatolian Velocity: Epik Anadolu Elektronik Müzik'
    when 'music/kara-yol' then 'Kara Yol: Karanlık Anadolu Techno Atmosferi'
  end,
  excerpt = case slug
    when 'music/sevenfold-thunder' then 'Karadeniz horon ritimlerini derin bas, kırık perküsiyon ve gece atmosferiyle birleştiren özgün Palmarghe elektronik müzik yayını.'
    when 'music/anatolian-sub-ritual' then 'Anadolu’nun törensel dokusundan yola çıkan; düşük frekans, boşluk ve ritim üzerine kurulu karanlık elektronik müzik denemesi.'
    when 'music/anatolian-velocity' then 'Epik Anadolu melodik izlerini modern elektronik prodüksiyonla buluşturan; yolculuk, tempo ve geniş sinematik alan hissi taşıyan çalışma.'
    when 'music/kara-yol' then 'Gece yolculuğu hissini koyu baslar, mekanik ritimler ve Anadolu esintili ses dokularıyla kuran özgün techno parçası.'
  end,
  seo_title = case slug
    when 'music/sevenfold-thunder' then 'Sevenfold Thunder | Karadeniz Horon ve Techno | Palmarghe'
    when 'music/anatolian-sub-ritual' then 'Anatolian Sub Ritual | Karanlık Anadolu Elektronik Müziği | Palmarghe'
    when 'music/anatolian-velocity' then 'Anatolian Velocity | Epik Anadolu Elektronik Müzik | Palmarghe'
    when 'music/kara-yol' then 'Kara Yol | Karanlık Anadolu Techno | Palmarghe'
  end,
  seo_description = case slug
    when 'music/sevenfold-thunder' then 'Sevenfold Thunder: Karadeniz horon ritimleri, derin bas ve techno prodüksiyonunu bir araya getiren Palmarghe elektronik müzik çalışması.'
    when 'music/anatolian-sub-ritual' then 'Anatolian Sub Ritual: Anadolu esintili karanlık elektronik müzik, törensel ritim ve düşük frekans dokusunu bir araya getiriyor.'
    when 'music/anatolian-velocity' then 'Anatolian Velocity: epik Anadolu elektronik müziği, sinematik atmosfer ve modern prodüksiyon üzerine Palmarghe yayını.'
    when 'music/kara-yol' then 'Kara Yol: koyu bas, mekanik ritim ve Anadolu ses dokularıyla kurulan Palmarghe karanlık techno parçası.'
  end,
  body = case slug
    when 'music/sevenfold-thunder' then '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Horon ritminden gece kulübü temposuna"}]},{"type":"paragraph","content":[{"type":"text","text":"Sevenfold Thunder, Karadeniz horonunun döngüsel vuruşlarını sert ama boşluklu bir techno düzenine taşıyor. Parça; canlı perküsiyon hissi, koyu bas hattı ve soğuk gece atmosferi arasında hareket ediyor."}]},{"type":"paragraph","content":[{"type":"text","text":"Bu sayfadaki video, çalışmayı üretim bağlamıyla birlikte dinlemek isteyenler için Palmarghe YouTube kanalından yerleştirildi."}]},{"type":"embed","attrs":{"src":"https://www.youtube-nocookie.com/embed/Xhx0sUGotvQ","title":"Sevenfold Thunder — Palmarghe"}}]}'::jsonb
    when 'music/anatolian-sub-ritual' then '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Düşük frekanslı bir Anadolu ritüeli"}]},{"type":"paragraph","content":[{"type":"text","text":"Anatolian Sub Ritual, törensel tekrarları minimal elektronik prodüksiyonla buluşturuyor. Ses dünyası; kuru vurmalılar, uzak yankılar ve sub bas katmanlarıyla ağır ağır açılıyor."}]},{"type":"paragraph","content":[{"type":"text","text":"Parça, Anadolu esintili elektronik müzik arayan dinleyiciler için ritim ile sessizlik arasındaki gerilimi öne çıkarıyor."}]},{"type":"embed","attrs":{"src":"https://www.youtube-nocookie.com/embed/U7riTAngm1g","title":"Anatolian Sub Ritual — Palmarghe"}}]}'::jsonb
    when 'music/anatolian-velocity' then '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Geniş bir coğrafyanın temposu"}]},{"type":"paragraph","content":[{"type":"text","text":"Anatolian Velocity, epik Anadolu elektronik müziği fikrini ilerleyen bir tempo ve sinematik alan duygusuyla yorumluyor. Melodik izler, modern elektronik ritimlerin üzerinde kısa anılar gibi beliriyor."}]},{"type":"paragraph","content":[{"type":"text","text":"Bu çalışma; yolculuk, oyun dünyası ve uzun odak seansları için geniş ama dikkat dağıtmayan bir dinleme alanı kurmayı hedefliyor."}]},{"type":"embed","attrs":{"src":"https://www.youtube-nocookie.com/embed/Hg81hTXqN1w","title":"Anatolian Velocity — Palmarghe"}}]}'::jsonb
    when 'music/kara-yol' then '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Karanlık bir yolun ritmi"}]},{"type":"paragraph","content":[{"type":"text","text":"Kara Yol, gece sürüşünün yalnızlığını mekanik kickler, koyu bas ve kontrollü Anadolu renkleriyle kuruyor. Düzenleme, sürekli hızlanmak yerine mesafeyi ve gölgeleri hissettirmeyi seçiyor."}]},{"type":"paragraph","content":[{"type":"text","text":"Karanlık Anadolu techno arayanlar için parça, melodik işaretlerle endüstriyel ağırlık arasında dengeli bir rota çiziyor."}]},{"type":"embed","attrs":{"src":"https://www.youtube-nocookie.com/embed/2AvphtSRLC8","title":"Kara Yol — Palmarghe"}}]}'::jsonb
  end
where locale = 'tr'
  and slug in ('music/sevenfold-thunder','music/anatolian-sub-ritual','music/anatolian-velocity','music/kara-yol');