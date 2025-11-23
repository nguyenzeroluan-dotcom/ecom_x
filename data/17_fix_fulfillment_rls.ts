
export const FIX_FULFILLMENT_RLS_SQL = `
-- 19. Fix Fulfillment RLS (Critical for Demo Admin)

-- The Demo Admin runs in the browser without a real Supabase Auth session (role: anon).
-- When they try to fulfill an order, they insert a record into 'user_library'.
-- We must allow public inserts/updates to this table for the demo to function completely.

-- Drop conflicting policies to ensure a clean slate
drop policy if exists "Users can view their own library" on public.user_library;
drop policy if exists "Users can insert own library items" on public.user_library;
drop policy if exists "Public insert library" on public.user_library;
drop policy if exists "Users update their progress" on public.user_library;
drop policy if exists "Admins can manage all library items" on public.user_library;
drop policy if exists "Enable full access for all users (Demo Mode)" on public.user_library;

-- Create a permissive policy for the Demo environment
create policy "Enable full access for all users (Demo Mode)" on public.user_library
  for all
  using (true)
  with check (true);
`;
