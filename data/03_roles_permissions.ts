
export const ROLES_PERMISSIONS_SQL = `
-- 6. App Roles Table (RBAC Definitions)
create table if not exists public.app_roles (
  role_name text primary key,
  description text,
  permissions jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.app_roles enable row level security;

-- Policies (Open for Demo Admin UI)
drop policy if exists "Public access roles" on public.app_roles;
create policy "Public access roles" on public.app_roles for select using (true);

drop policy if exists "Public insert roles" on public.app_roles;
create policy "Public insert roles" on public.app_roles for insert with check (true);

drop policy if exists "Public update roles" on public.app_roles;
create policy "Public update roles" on public.app_roles for update using (true);

drop policy if exists "Public delete roles" on public.app_roles;
create policy "Public delete roles" on public.app_roles for delete using (true);

-- Seed Default Roles
insert into public.app_roles (role_name, description, permissions)
values 
  (
    'admin', 
    'Full system administrator with access to all features.', 
    '["product.read", "product.create", "product.edit", "product.delete", "category.manage", "inventory.update", "order.read", "order.manage", "user.read", "user.manage", "settings.view", "database.manage"]'::jsonb
  ),
  (
    'manager', 
    'Store manager. Can handle products and orders but cannot manage users or database.', 
    '["product.read", "product.create", "product.edit", "category.manage", "inventory.update", "order.read", "order.manage"]'::jsonb
  ),
  (
    'customer', 
    'Standard user. Can browse and purchase.', 
    '["product.read", "order.read"]'::jsonb
  )
on conflict (role_name) do nothing;
`;
