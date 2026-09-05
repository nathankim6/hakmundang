
-- 1. Update trigger to assign ALL rt_review homework regardless of due_date
CREATE OR REPLACE FUNCTION public.auto_assign_rt_homework_on_student_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.homework_submissions (homework_id, student_id, status)
  SELECT h.id, NEW.id, 'pending'
  FROM public.homework h
  WHERE h.type = 'rt_review'
    AND h.target_type = 'grade'
    AND h.target_grade_id = NEW.grade_id
  ON CONFLICT (homework_id, student_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 2. Backfill missing submissions for all existing students
INSERT INTO public.homework_submissions (homework_id, student_id, status)
SELECT h.id, s.id, 'pending'
FROM public.homework h
JOIN public.students s ON s.grade_id = h.target_grade_id
WHERE h.type = 'rt_review'
  AND h.target_type = 'grade'
  AND NOT EXISTS (
    SELECT 1 FROM public.homework_submissions hs
    WHERE hs.homework_id = h.id AND hs.student_id = s.id
  )
ON CONFLICT (homework_id, student_id) DO NOTHING;
