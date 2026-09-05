
CREATE OR REPLACE FUNCTION public.auto_create_rt_submissions_for_new_student()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For each rt_review homework targeting the new student's grade (round 1 only),
  -- create a pending homework_submission if one doesn't already exist
  INSERT INTO public.homework_submissions (homework_id, student_id, status)
  SELECT h.id, NEW.id, 'pending'
  FROM public.homework h
  WHERE h.type = 'rt_review'
    AND h.target_type = 'grade'
    AND h.target_grade_id = NEW.grade_id
    AND h.round = 1
    AND NOT EXISTS (
      SELECT 1 FROM public.homework_submissions hs
      WHERE hs.homework_id = h.id AND hs.student_id = NEW.id
    );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_student_insert_create_rt_submissions
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_rt_submissions_for_new_student();
