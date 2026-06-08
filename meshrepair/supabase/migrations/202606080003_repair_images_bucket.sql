insert into storage.buckets (id, name, public)
values ('repair-images', 'repair-images', true)
on conflict (id) do nothing;

create policy "Public can read repair image objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'repair-images');

create policy "Admins can upload repair image objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'repair-images'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
);

create policy "Admins can update repair image objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'repair-images'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
)
with check (
  bucket_id = 'repair-images'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
);

create policy "Admins can delete repair image objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'repair-images'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
);
