
-- Admin role function based on email
create or replace function public.is_admin(_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from auth.users
    where id = _uid
      and lower(email) = '5554ksj2@gmail.com'
  );
$$;

-- Allow authenticated to write to exam_periods (admin will be gated by RLS)
grant insert, update, delete on public.exam_periods to authenticated;

-- Admin policies on study_photos (update/delete any)
create policy "Admin update any photo"
on public.study_photos for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin delete any photo"
on public.study_photos for delete to authenticated
using (public.is_admin(auth.uid()));

-- Admin policies on photo_comments
create policy "Admin update any comment"
on public.photo_comments for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin delete any comment"
on public.photo_comments for delete to authenticated
using (public.is_admin(auth.uid()));

-- Admin can manage exam_periods (seasons)
create policy "Admin insert periods"
on public.exam_periods for insert to authenticated
with check (public.is_admin(auth.uid()));

create policy "Admin update periods"
on public.exam_periods for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin delete periods"
on public.exam_periods for delete to authenticated
using (public.is_admin(auth.uid()));

-- Admin can update/delete profiles (member management)
create policy "Admin update any profile"
on public.profiles for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Admin delete any profile"
on public.profiles for delete to authenticated
using (public.is_admin(auth.uid()));
