
export const ADMIN_LIBRARY_ACCESS_SQL = `
-- 16. Admin Library Access
-- Allow Admins and Managers to fulfill digital orders by inserting into user libraries

drop policy if exists "Admins can manage all library items" on public.user_library;

create policy "Admins can manage all library items" on public.user_library
  for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'manager'))
  );
`;
