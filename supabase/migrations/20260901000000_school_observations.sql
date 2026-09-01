-- 학교 관측층 저장소
--
-- 현재 앱은 관측 입력을 브라우저(localStorage)에 저장한다.
-- 서버로 옮기려면 아래를 Supabase SQL Editor에서 실행한 뒤,
-- src/lib/schools/store.ts 의 read/write를 이 테이블로 바꾸면 된다.
--
-- 주의 — 그냥 실행하면 안 된다.
-- 이 앱은 Supabase 인증을 쓰지 않고 접근코드(localStorage)로만 로그인한다.
-- 즉 auth.uid()가 없어서 "본인 데이터만" 같은 RLS를 걸 수 없고,
-- anon 키는 빌드 결과물에 그대로 노출되므로 anon에 write를 열면
-- 링크를 아는 누구나 관측 데이터를 고칠 수 있다.
--
-- 먼저 아래 중 하나를 정해야 한다.
--   (a) Supabase Auth로 원장·강사 계정을 만들고 authenticated 에만 write 허용
--   (b) 쓰기를 Edge Function으로만 받고 테이블은 anon read-only

create table if not exists public.school_observations (
  school_code   text primary key,
  school_name   text not null,
  character     text not null default '',
  difficulty    jsonb not null default '{}'::jsonb,
  exam_scope    jsonb not null default '[]'::jsonb,
  cutoff        jsonb not null default '{}'::jsonb,
  features      jsonb not null default '[]'::jsonb,
  signatures    jsonb not null default '[]'::jsonb,
  fit           jsonb not null default '[]'::jsonb,
  observed_at   date,
  updated_at    timestamptz not null default now(),
  updated_by    text
);

comment on table public.school_observations is
  '옳은영어가 직접 관측한 학교별 내신 정보. 공시데이터에는 없다.';
comment on column public.school_observations.difficulty is
  '{국어,영어,수학,사회,과학: 기초|보통|상|최상, comment: text}';
comment on column public.school_observations.fit is
  '맞는 학생 유형. 사실이 아니라 학원의 견해다.';

create index if not exists school_observations_updated_at_idx
  on public.school_observations (updated_at desc);

-- 갱신 시각 자동 기록
create or replace function public.touch_school_observations()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists school_observations_touch on public.school_observations;
create trigger school_observations_touch
  before update on public.school_observations
  for each row execute function public.touch_school_observations();

-- RLS는 켜두고 정책은 비워 둔다.
-- 위 (a)/(b) 중 하나를 정한 뒤 정책을 추가할 것.
-- 정책이 없으면 anon·authenticated 모두 접근할 수 없다 — 의도된 기본값이다.
alter table public.school_observations enable row level security;

-- (a)를 택한 경우의 예시:
-- create policy "authenticated can read"  on public.school_observations
--   for select to authenticated using (true);
-- create policy "authenticated can write" on public.school_observations
--   for all    to authenticated using (true) with check (true);
