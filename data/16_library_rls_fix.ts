
export const LIBRARY_RLS_FIX_SQL = `
-- 18. Fix Library RLS for Demo User
-- The default policy requires a valid auth.uid(). The Demo User relies on a hardcoded UUID without a Supabase session.
-- We must explicitly allow public reads for this specific UUID.

drop policy if exists "Users can view their own library" on public.user_library;

create policy "Users can view their own library" on public.user_library 
  for select using (
    auth.uid() = user_id 
    OR 
    user_id = '00000000-0000-0000-0000-000000000000'
  );

-- Ensure the Demo User can also update their reading progress (last_position)
drop policy if exists "Users update their progress" on public.user_library;

create policy "Users update their progress" on public.user_library 
  for update using (
    auth.uid() = user_id 
    OR 
    user_id = '00000000-0000-0000-0000-000000000000'
  );
`;
