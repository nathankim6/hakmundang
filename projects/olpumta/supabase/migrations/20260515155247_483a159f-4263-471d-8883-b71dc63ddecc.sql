
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_emoji text not null default '🐻',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles viewable by authenticated" on public.profiles for select to authenticated using (true);
create policy "Insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default 'pink' check (color in ('pink','blue','green','yellow')),
  created_at timestamptz not null default now()
);
alter table public.subjects enable row level security;
create index subjects_user_id_idx on public.subjects(user_id);
create policy "Manage own subjects" on public.subjects for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);
alter table public.friendships enable row level security;
create index friendships_user_id_idx on public.friendships(user_id);
create policy "View own friendships" on public.friendships for select to authenticated using (auth.uid() = user_id);
create policy "Add own friendships" on public.friendships for insert to authenticated with check (auth.uid() = user_id);
create policy "Remove own friendships" on public.friendships for delete to authenticated using (auth.uid() = user_id);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null default now(),
  duration_seconds integer not null check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);
alter table public.study_sessions enable row level security;
create index study_sessions_user_id_idx on public.study_sessions(user_id);
create index study_sessions_started_at_idx on public.study_sessions(started_at);
create policy "View own sessions" on public.study_sessions for select to authenticated using (auth.uid() = user_id);
create policy "Insert own sessions" on public.study_sessions for insert to authenticated with check (auth.uid() = user_id);
create policy "Delete own sessions" on public.study_sessions for delete to authenticated using (auth.uid() = user_id);
create policy "View friend sessions" on public.study_sessions for select to authenticated
  using (exists(select 1 from public.friendships f where f.user_id = auth.uid() and f.friend_id = study_sessions.user_id));

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_minutes integer not null check (target_minutes > 0),
  period text not null default 'daily' check (period in ('daily','weekly')),
  created_at timestamptz not null default now()
);
alter table public.goals enable row level security;
create index goals_user_id_idx on public.goals(user_id);
create policy "Manage own goals" on public.goals for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare fallback_name text;
begin
  fallback_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    nullif(split_part(new.email, '@', 1), ''),
    '공부친구'
  );
  insert into public.profiles (id, display_name, avatar_emoji)
  values (new.id, fallback_name, coalesce(new.raw_user_meta_data->>'avatar_emoji', '🐻'));
  insert into public.subjects (user_id, name, color) values
    (new.id, '수학', 'pink'),
    (new.id, '영어', 'blue'),
    (new.id, '한국사', 'green'),
    (new.id, '물리', 'yellow');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
