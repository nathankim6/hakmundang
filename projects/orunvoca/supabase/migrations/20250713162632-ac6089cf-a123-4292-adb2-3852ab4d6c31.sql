-- 누락된 학생들에게 액세스 코드 생성
INSERT INTO public.student_access_codes (student_id, access_code, is_active)
SELECT 
  s.id,
  public.generate_random_access_code(8),
  true
FROM students s
LEFT JOIN student_access_codes sac ON s.id = sac.student_id
WHERE sac.student_id IS NULL;