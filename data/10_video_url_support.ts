
export const VIDEO_URL_SUPPORT_SQL = `
-- 12. Video URL Support

-- Add video_url column to products table
alter table public.products add column if not exists video_url text;

-- Refresh the view to ensure it picks up the new column
drop view if exists public.products_with_gallery;

create or replace view public.products_with_gallery as
select
  p.*,
  (
    select coalesce(
      array_agg(ma.public_url order by cmj.media_id), 
      array[]::text[]
    )
    from public.collection_media_join cmj
    join public.media_assets ma on cmj.media_id = ma.id
    where cmj.collection_id = p.collection_id
  ) as gallery_images
from
  public.products p;

-- Grant access (idempotent)
grant select on public.products_with_gallery to anon, authenticated, service_role;
`;
