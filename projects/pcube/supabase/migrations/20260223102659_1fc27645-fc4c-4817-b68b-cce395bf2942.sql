-- homework 테이블에 그룹 ID 추가 (같은 세트로 출제된 과제들을 묶기 위함)
ALTER TABLE public.homework ADD COLUMN homework_group_id uuid DEFAULT NULL;

-- 인덱스 추가
CREATE INDEX idx_homework_group_id ON public.homework(homework_group_id);

-- 기존 데이터 마이그레이션: 같은 passage 그룹(제목 패턴)으로 생성된 homework들을 그룹화
-- 제목에서 #N 접미사를 제거한 기본 제목이 같고, due_date와 target_grade_id가 같은 homework들을 하나의 그룹으로 묶음
DO $$
DECLARE
  r RECORD;
  new_group_id uuid;
BEGIN
  FOR r IN (
    SELECT 
      regexp_replace(title, '\s*#\d+$', '') AS base_title,
      due_date,
      target_grade_id,
      owner_code_id,
      array_agg(id ORDER BY title) AS hw_ids
    FROM public.homework
    WHERE passage_id IS NOT NULL
      AND title ~ '#\d+$'
    GROUP BY regexp_replace(title, '\s*#\d+$', ''), due_date, target_grade_id, owner_code_id
    HAVING count(*) > 1
  )
  LOOP
    new_group_id := gen_random_uuid();
    UPDATE public.homework SET homework_group_id = new_group_id WHERE id = ANY(r.hw_ids);
  END LOOP;
END $$;