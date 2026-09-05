-- Exam periods: 4 per year (1학기 중간/기말, 2학기 중간/기말)
create table public.exam_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.exam_periods enable row level security;

-- Anyone authenticated can read periods
create policy "Exam periods viewable by authenticated"
  on public.exam_periods for select
  to authenticated
  using (true);

-- Only DB admin manages (no INSERT/UPDATE/DELETE policy = blocked for app users)

-- Seed 4 default periods for 2026 (admin can edit dates anytime in DB)
insert into public.exam_periods (name, start_date, end_date, sort_order) values
  ('1학기 중간고사', '2026-03-02', '2026-04-30', 1),
  ('1학기 기말고사', '2026-05-01', '2026-07-15', 2),
  ('2학기 중간고사', '2026-08-16', '2026-10-15', 3),
  ('2학기 기말고사', '2026-10-16', '2027-02-28', 4);

-- Helper: returns the period covering a given date (or null)
create or replace function public.exam_period_for_date(d date)
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.exam_periods
  where d between start_date and end_date
  order by sort_order asc
  limit 1;
$$;

-- Tag every study_session with its period for fast filtering + archival
alter table public.study_sessions
  add column if not exists period_id uuid references public.exam_periods(id);

create or replace function public.set_study_session_period()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.period_id is null then
    new.period_id := public.exam_period_for_date((new.started_at at time zone 'Asia/Seoul')::date);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_study_session_period on public.study_sessions;
create trigger trg_set_study_session_period
before insert on public.study_sessions
for each row execute function public.set_study_session_period();

-- Backfill existing rows
update public.study_sessions
set period_id = public.exam_period_for_date((started_at at time zone 'Asia/Seoul')::date)
where period_id is null;

create index if not exists idx_study_sessions_period on public.study_sessions(period_id);
create index if not exists idx_study_sessions_user_period on public.study_sessions(user_id, period_id);