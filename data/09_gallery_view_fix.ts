
export const GALLERY_VIEW_FIX_SQL = `
-- 11. Gallery View Fix (Critical for Gallery Persistence)

-- Drop view if exists to ensure clean slate
drop view if exists public.products_with_gallery;

-- Create View that aggregates gallery images from the collection
-- This allows the frontend to fetch 'gallery_images' as a simple array of strings
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

-- Grant access to the view
grant select on public.products_with_gallery to anon, authenticated, service_role;
`;
