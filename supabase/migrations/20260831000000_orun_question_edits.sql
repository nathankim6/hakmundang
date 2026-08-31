-- 옳은문법(ORUN GRAMMAR) 문항 편집본 저장소
-- Supabase 대시보드 → SQL Editor 에 그대로 붙여 넣고 한 번만 실행하면 됩니다.

create table if not exists public.orun_question_edits (
  key         text primary key,
  payload     jsonb       not null,
  editor      text,
  updated_at  timestamptz not null default now()
);

comment on table public.orun_question_edits is
  '옳은문법 문항 편집본. key 형식: b|<카테고리id>|<번호>  또는  c|<ele|mid>|<시험지id>|<chk|rec>|<번호>';

create index if not exists orun_question_edits_updated_at_idx
  on public.orun_question_edits (updated_at desc);

alter table public.orun_question_edits enable row level security;

drop policy if exists "orun_edits_read"   on public.orun_question_edits;
drop policy if exists "orun_edits_insert" on public.orun_question_edits;
drop policy if exists "orun_edits_update" on public.orun_question_edits;

create policy "orun_edits_read"   on public.orun_question_edits for select using (true);
create policy "orun_edits_insert" on public.orun_question_edits for insert with check (true);
create policy "orun_edits_update" on public.orun_question_edits for update using (true) with check (true);
