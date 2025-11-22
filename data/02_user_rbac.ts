
export const USER_RBAC_SQL = `
-- 5. Profiles Table (User Management)

-- CRITICAL FIX: Drop the Foreign Key constraint if it exists.
-- This allows creating "Demo" users in the Admin UI who don't have real Supabase Auth accounts.
do $$
begin
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'profiles_id_fkey' and table_name = 'profiles') then
    alter table public.profiles drop constraint profiles_id_fkey;
  end if;
end $$;

-- Create table if it doesn't exist (Flexible definition)
create table if not exists public.profiles (
  id uuid not null primary key,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  address text,
  city text,
  ai_style_preference text,
  role text default 'customer',
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MIGRATION: Add columns if they do not exist (Idempotent)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
    alter table public.profiles add column role text default 'customer';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'created_at') then
    alter table public.profiles add column created_at timestamp with time zone default timezone('utc'::text, now()) not null;
  end if;
end $$;

-- Enable RLS
alter table public.profiles enable row level security;

-- ---------------------------------------------------------
-- PERMISSIVE POLICIES (For Demo/Portfolio Functionality)
-- ---------------------------------------------------------
-- These policies allow the Frontend Admin UI to fully manage users without hitting RLS blocks.

-- 1. Select: Everyone can view profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

-- 2. Insert: Allow everyone to insert (Fixes "Can't create user" error)
drop policy if exists "Authenticated users can insert profiles." on public.profiles;
drop policy if exists "Public can insert profiles." on public.profiles;
create policy "Public can insert profiles." on public.profiles for insert with check (true);

-- 3. Update: Allow everyone to update (Fixes "Can't edit role" error)
drop policy if exists "Users can update own profile." on public.profiles;
drop policy if exists "Admins can update all profiles." on public.profiles;
drop policy if exists "Public can update profiles." on public.profiles;
create policy "Public can update profiles." on public.profiles for update using (true);

-- 4. Delete: Allow everyone to delete (Fixes "Can't delete user" error)
drop policy if exists "Admins can delete profiles." on public.profiles;
drop policy if exists "Public can delete profiles." on public.profiles;
create policy "Public can delete profiles." on public.profiles for delete using (true);
`;
