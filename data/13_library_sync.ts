
export const LIBRARY_SYNC_SQL = `
-- 15. Library Sync & Order Integrity

-- Add product_id to order_items to reliably link back to the product for digital delivery
-- This enables the system to know exactly which product was bought even if names change
alter table public.order_items add column if not exists product_id bigint references public.products(id) on delete set null;

-- Index for performance
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- Add missing RLS for user_library updates if not already present
drop policy if exists "Users can insert own library items" on public.user_library;
create policy "Users can insert own library items" on public.user_library 
  for insert with check (auth.uid() = user_id);
`;
