-- Private profile avatars with ownership enforced by auth.uid().
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile_avatars_select_own" on storage.objects;
drop policy if exists "profile_avatars_insert_own" on storage.objects;
drop policy if exists "profile_avatars_delete_own" on storage.objects;

create policy "profile_avatars_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "profile_avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "profile_avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create or replace function public.set_my_avatar_url(p_avatar_url text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if p_avatar_url is not null
    and split_part(p_avatar_url, '/', 1) <> caller_id::text then
    raise exception 'Avatar path must belong to the authenticated user';
  end if;

  update public.profiles
  set avatar_url = p_avatar_url
  where id = caller_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

revoke all on function public.set_my_avatar_url(text) from public;
grant execute on function public.set_my_avatar_url(text) to authenticated;