
export const EBOOKS_ADVANCED_SQL = `
-- 13. Advanced E-Book Metadata

create table if not exists public.ebook_metadata (
  product_id bigint primary key references public.products(id) on delete cascade,
  format text check (format in ('pdf', 'studio')) default 'studio',
  source_url text, -- For PDF files
  content_html text, -- For Studio written books
  allow_download boolean default false,
  drm_enabled boolean default true,
  preview_percentage integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- Enable RLS
alter table public.ebook_metadata enable row level security;

-- Policies
drop policy if exists "Public read ebook metadata" on public.ebook_metadata;
create policy "Public read ebook metadata" on public.ebook_metadata for select using (true);

-- Allow public insert/update for demo purposes so the Admin UI doesn't crash for non-authenticated demo users
drop policy if exists "Admins manage ebook metadata" on public.ebook_metadata;
drop policy if exists "Public manage ebook metadata" on public.ebook_metadata;
create policy "Public manage ebook metadata" on public.ebook_metadata for all using (true) with check (true);

-- Storage bucket for PDFs
insert into storage.buckets (id, name, public) values ('ebook-files', 'ebook-files', true) on conflict (id) do nothing;

drop policy if exists "Ebook Files Access" on storage.objects;
create policy "Ebook Files Access" on storage.objects for select using ( bucket_id = 'ebook-files' );

drop policy if exists "Admins Upload Ebooks" on storage.objects;
drop policy if exists "Public Upload Ebooks" on storage.objects;

-- Relaxed storage policy for Demo/Admin UI to prevent RLS errors
create policy "Public Upload Ebooks" on storage.objects for insert with check ( bucket_id = 'ebook-files' );
create policy "Public Update Ebooks" on storage.objects for update using ( bucket_id = 'ebook-files' );
create policy "Public Delete Ebooks" on storage.objects for delete using ( bucket_id = 'ebook-files' );
`;
