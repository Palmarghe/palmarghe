-- One-record maintenance operation, not a schema migration.
-- Reviewed assets must be deployed and reachable before this is executed.
-- Compare-and-swap refuses concurrent Studio changes; the prior value is backed up beside this file.
BEGIN;
DO $operation$
DECLARE affected integer;
BEGIN
 UPDATE public.site_settings SET value=$new${"enabled": false, "placements": {"article": {"cta": "Kanala git", "description": "Müzik, oyunlar ve dijital deneyler. Yeni videolara göz at.", "device": "all", "ends_at": "", "image_url": "/ads/palmarghe-youtube-v1.webp", "mode": "manual", "scope": "all", "starts_at": "", "title": "Palmarghe · YouTube", "url": "https://www.youtube.com/@palmarghe", "visible": true}, "footer": {"cta": "Projeleri gör", "description": "Modlar, araçlar ve açık kaynak projeler. Kodun arkasını keşfet.", "device": "all", "ends_at": "", "image_url": "/ads/palmarghe-github-v1.webp", "mode": "manual", "scope": "all", "starts_at": "", "title": "Palmarghe · GitHub", "url": "https://github.com/Palmarghe", "visible": true}, "header": {"cta": "Resmi site", "description": "Yeni sezon, yeni fikirler. FM27’yi resmi sitesinde keşfet.", "device": "all", "ends_at": "", "image_url": "/ads/fm27-stadium-v1.webp", "mode": "manual", "scope": "all", "starts_at": "", "title": "Football Manager 27", "url": "https://www.footballmanager.com/", "visible": true}}, "publisher_id": "", "slots": {"article": "", "footer": "", "header": ""}}$new$::jsonb,updated_at=now()
 WHERE key='advertising' AND value=$old${"enabled": false, "placements": {"article": {"cta": "İncele", "description": "Yaratıcı teknoloji, oyun dünyaları ve bağımsız yayın.", "device": "all", "ends_at": "", "image_url": "/ads/test-article-neutral.svg", "mode": "manual", "scope": "all", "starts_at": "", "title": "Signal / 26", "url": "https://palmarghe.com/gaming/", "visible": true}, "footer": {"cta": "Aç", "description": "Bir sonraki fikriniz için sakin bir çalışma alanı.", "device": "all", "ends_at": "", "image_url": "/ads/test-footer-neutral.svg", "mode": "manual", "scope": "all", "starts_at": "", "title": "Northframe Studio", "url": "https://palmarghe.com/lab/", "visible": true}, "header": {"cta": "PALMARGHE", "description": "Palmarghe", "device": "all", "ends_at": "", "image_url": "/ads/test-header-neutral.svg", "mode": "manual", "scope": "all", "starts_at": "", "title": "Palmarghe", "url": "https://palmarghe.com/", "visible": true}}, "publisher_id": "", "slots": {"article": "", "footer": "", "header": ""}}$old$::jsonb;
 GET DIAGNOSTICS affected = ROW_COUNT;
 IF affected <> 1 THEN RAISE EXCEPTION 'Advertisement record changed: re-read and reconcile instead of overwriting'; END IF;
END
$operation$;
COMMIT;
