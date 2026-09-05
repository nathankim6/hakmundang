CREATE OR REPLACE FUNCTION public.auto_assign_rt_homework_on_student_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 해당 학년의 모든 활성 RT 리뷰 과제 (due_date가 오늘 이후)에 대해 submission 생성
  INSERT INTO public.homework_submissions (homework_id, student_id, status)
  SELECT h.id, NEW.id, 'pending'
  FROM public.homework h
  WHERE h.type = 'rt_review'
    AND h.target_type = 'grade'
    AND h.target_grade_id = NEW.grade_id
    AND h.due_date >= (now() AT TIME ZONE 'Asia/Seoul')::date
  ON CONFLICT (homework_id, student_id) DO NOTHING;

  RETURN NEW;
END;
$$;