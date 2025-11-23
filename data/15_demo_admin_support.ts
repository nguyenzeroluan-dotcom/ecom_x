
export const DEMO_ADMIN_SUPPORT_SQL = `
-- 17. Demo Admin Support & Data Repair

-- 1. Relax Foreign Key Constraints on Orders
-- This allows orders to be linked to the Demo User (who isn't in auth.users)
alter table public.orders drop constraint if exists orders_user_id_fkey;

-- 2. Relax Foreign Key Constraints on User Library
alter table public.user_library drop constraint if exists user_library_user_id_fkey;

-- 3. Seed Demo Admin Profile
insert into public.profiles (id, email, full_name, role, avatar_url)
values (
  '00000000-0000-0000-0000-000000000000',
  'admin@nexus.ai',
  'Demo Admin',
  'admin',
  'https://i.pravatar.cc/150?u=nexus-admin'
)
on conflict (id) do update
set 
  role = 'admin',
  email = 'admin@nexus.ai',
  full_name = 'Demo Admin';

-- 4. Fix "Orphan" Orders
-- Link any existing orders made by the demo email to the demo UUID
update public.orders
set user_id = '00000000-0000-0000-0000-000000000000'
where customer_email = 'admin@nexus.ai' and user_id is null;

-- 5. Trigger Library Sync for Demo User
-- Insert library items for any delivered/shipped orders belonging to the demo user
insert into public.user_library (user_id, product_id, last_position)
select 
  o.user_id,
  oi.product_id,
  0
from public.orders o
join public.order_items oi on o.id = oi.order_id
join public.products p on oi.product_id = p.id
where 
  o.user_id = '00000000-0000-0000-0000-000000000000'
  and o.status in ('shipped', 'delivered')
  and (p.is_digital = true or p.category ilike '%book%')
on conflict (user_id, product_id) do nothing;
`;
