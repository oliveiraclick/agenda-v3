-- STORAGE MIGRATION
-- Create a new bucket called 'images'
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- POLICY: Allow public read access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );

-- POLICY: Allow authenticated users to upload
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'images' and
  auth.role() = 'authenticated'
);

-- POLICY: Allow users to update/delete their own files
-- (For simplicity, we assume the user owns the file if they uploaded it, 
-- but storage policies can be tricky. For MVP, we might just allow authenticated update/delete 
-- or rely on the fact that filenames will be unique/random)
create policy "Authenticated users can update own"
on storage.objects for update
using ( bucket_id = 'images' and auth.uid() = owner );

create policy "Authenticated users can delete own"
on storage.objects for delete
using ( bucket_id = 'images' and auth.uid() = owner );
