
export const ORDER_MANAGEMENT_SQL = `
-- 14. Order Management Upgrades

-- Add Tracking Number Support
alter table public.orders add column if not exists tracking_number text;

-- Add Updated At timestamp for tracking status changes
alter table public.orders add column if not exists updated_at timestamp with time zone;

-- Trigger to auto-update timestamp
drop trigger if exists on_orders_update on public.orders;
create trigger on_orders_update
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

-- Policies update (Ensure Admins/Managers can update orders)
drop policy if exists "Managers update orders" on public.orders;
create policy "Managers update orders" on public.orders 
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'manager'))
  );

drop policy if exists "Managers delete orders" on public.orders;
create policy "Managers delete orders" on public.orders 
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
`;