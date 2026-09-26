-- Use a fixed past publication time for the imported catalogue so it is never
-- held back by deployment clock skew while the Worker and database converge.
update public.content_items
set published_at = '2026-09-01T12:00:00Z'::timestamptz, updated_at = now()
where locale='tr' and slug in ('music/sevenfold-thunder','music/anatolian-sub-ritual','music/anatolian-velocity','music/kara-yol') and status='published';
