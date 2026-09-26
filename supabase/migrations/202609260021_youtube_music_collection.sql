-- Public Palmarghe YouTube catalogue. Official thumbnails remain hosted by YouTube;
-- embeds use the privacy-enhanced youtube-nocookie domain.
insert into public.categories(slug,name_tr,name_en,description_tr,description_en,active,sort_order)
values ('music','Müzik','Music','Palmarghe imzalı elektronik ve Anadolu esintili ses denemeleri.','Palmarghe electronic and Anatolian-influenced sound experiments.',true,4)
on conflict (slug) do update set name_tr=excluded.name_tr,name_en=excluded.name_en,description_tr=excluded.description_tr,description_en=excluded.description_en,active=true;

insert into public.content_items(locale,type,status,title,slug,excerpt,body,type_data,cover_url,featured,published_at,seo_title,seo_description,indexable)
values
('tr','lab_entry','published','Sevenfold Thunder | Turkish Black Sea Horon x Techno (Instrumental)','music/sevenfold-thunder','Karadeniz horon ritimlerini techno dokusuyla buluşturan enstrümantal Palmarghe yayını.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Palmarghe YouTube kanalındaki enstrümantal yayın."}]},{"type":"embed","attrs":{"src":"https://www.youtube-nocookie.com/embed/Xhx0sUGotvQ","title":"Sevenfold Thunder"}}]}'::jsonb,
 '{"experiment_note":"YouTube yayını","experiment_url":"https://www.youtube.com/watch?v=Xhx0sUGotvQ"}'::jsonb,'https://i.ytimg.com/vi/Xhx0sUGotvQ/hqdefault.jpg',false,now(),'Sevenfold Thunder | Palmarghe','Turkish Black Sea Horon x Techno instrumental.',true),
('tr','lab_entry','published','Anatolian Sub Ritual | Dark Anatolian Electronic Music','music/anatolian-sub-ritual','Karanlık Anadolu elektronik müziği ekseninde Palmarghe ses denemesi.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Palmarghe YouTube kanalındaki müzik yayını."}]},{"type":"embed","attrs":{"src":"https://www.youtube-nocookie.com/embed/U7riTAngm1g","title":"Anatolian Sub Ritual"}}]}'::jsonb,
 '{"experiment_note":"YouTube yayını","experiment_url":"https://www.youtube.com/watch?v=U7riTAngm1g"}'::jsonb,'https://i.ytimg.com/vi/U7riTAngm1g/hqdefault.jpg',false,now(),'Anatolian Sub Ritual | Palmarghe','Dark Anatolian electronic music by Palmarghe.',true),
('tr','lab_entry','published','Anatolian Velocity | Epic Anatolian Electronic Music','music/anatolian-velocity','Epik Anadolu elektronik müziği için ritim ve atmosfer denemesi.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Palmarghe YouTube kanalındaki müzik yayını."}]},{"type":"embed","attrs":{"src":"https://www.youtube-nocookie.com/embed/Hg81hTXqN1w","title":"Anatolian Velocity"}}]}'::jsonb,
 '{"experiment_note":"YouTube yayını","experiment_url":"https://www.youtube.com/watch?v=Hg81hTXqN1w"}'::jsonb,'https://i.ytimg.com/vi/Hg81hTXqN1w/hqdefault.jpg',false,now(),'Anatolian Velocity | Palmarghe','Epic Anatolian electronic music by Palmarghe.',true),
('tr','lab_entry','published','Kara Yol – Dark Anatolian Techno | Suno AI Music','music/kara-yol','Karanlık Anadolu techno atmosferi üzerine Palmarghe müzik denemesi.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Palmarghe YouTube kanalındaki müzik yayını."}]},{"type":"embed","attrs":{"src":"https://www.youtube-nocookie.com/embed/2AvphtSRLC8","title":"Kara Yol"}}]}'::jsonb,
 '{"experiment_note":"YouTube yayını","experiment_url":"https://www.youtube.com/watch?v=2AvphtSRLC8"}'::jsonb,'https://i.ytimg.com/vi/2AvphtSRLC8/hqdefault.jpg',false,now(),'Kara Yol | Palmarghe','Dark Anatolian techno music by Palmarghe.',true)
on conflict (locale,slug) do nothing;

insert into public.content_categories(content_id,category_id)
select i.id,c.id from public.content_items i cross join public.categories c
where i.locale='tr' and i.slug in ('music/sevenfold-thunder','music/anatolian-sub-ritual','music/anatolian-velocity','music/kara-yol') and c.slug='music'
on conflict do nothing;
