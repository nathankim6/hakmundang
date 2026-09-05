UPDATE public.passages p
SET exam_label = '1학년 1학기 기말고사'
FROM public.schools s
WHERE p.school_id = s.id
  AND s.name = '흑석고등학교'
  AND p.title ILIKE '올림포스%'
  AND (p.exam_label IS NULL OR btrim(p.exam_label) = '');