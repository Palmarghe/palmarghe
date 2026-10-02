with docs as (
  select 'content' as kind,id,body,case when type='gallery' then type_data else '{}'::jsonb end as type_data,cover_media_id,og_media_id from public.content_items
  union all
  select 'revision',id,body,type_data,null::uuid,null::uuid from public.content_revisions
), refs as (
  select d.kind,d.id,v #>> '{}' as candidate from docs d cross join lateral jsonb_path_query(coalesce(d.body,'{}'::jsonb),'$.** ? (@.type == "mediaImage").attrs.media_id') v
  union all
  select d.kind,d.id,v #>> '{}' from docs d cross join lateral jsonb_path_query(coalesce(d.body,'{}'::jsonb),'$.** ? (@.type == "mediaGallery").attrs.media_ids[*]') v
  union all
  select d.kind,d.id,v #>> '{}' from docs d cross join lateral jsonb_path_query(coalesce(d.type_data,'{}'::jsonb),'$.gallery_media_ids[*]') v
  union all select kind,id,cover_media_id::text from docs
  union all select kind,id,og_media_id::text from docs
), distinct_refs as (
  select distinct kind,id,candidate::uuid as media_id from refs
  where candidate ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
)
select kind,count(*) as reference_count,count(*) filter(where m.id is null) as missing_media_count
from distinct_refs r left join public.media m on m.id=r.media_id group by kind order by kind;
