
-- 학생이 추가되면 해당 학년의 모든 활성 RT 리뷰 과제에 대해 homework_submissions 자동 생성
CREATE OR REPLACE FUNCTION public.auto_assign_rt_homework_on_student_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 해당 학년을 대상으로 하는 모든 활성 RT 리뷰 과제 찾기 (due_date가 오늘 이후)
  INSERT INTO public.homework_submissions (homework_id, student_id, status)
  SELECT h.id, NEW.id, 'pending'
  FROM public.homework h
  WHERE h.type = 'rt_review'
    AND h.target_type = 'grade'
    AND h.target_grade_id = NEW.grade_id
    AND h.due_date >= CURRENT_DATE
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- 트리거 생성
CREATE TRIGGER trg_auto_assign_rt_homework
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_rt_homework_on_student_insert();
