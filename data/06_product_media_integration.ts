
export const PRODUCT_MEDIA_INTEGRATION_SQL = `
-- 9. Product & Media Integration

-- Add collection_id to products table for gallery link
-- This links a product to a specific collection in the media_collections table.
alter table public.products add column if not exists collection_id bigint references public.media_collections(id) on delete set null;

-- Create a View for easier querying of products with their galleries
-- This view joins products with their assigned collection and aggregates all associated image URLs into an array.
-- Using this view simplifies frontend queries and improves performance.
create or replace view public.products_with_gallery as
select
  p.*,
  (
    select array_agg(ma.public_url order by cmj.media_id) -- Ordering by media_id for consistency
    from public.collection_media_join cmj
    join public.media_assets ma on cmj.media_id = ma.id
    where cmj.collection_id = p.collection_id
  ) as gallery_images
from
  public.products p;
`;
