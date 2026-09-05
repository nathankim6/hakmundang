
INSERT INTO public.dismissed_daily_words (student_id, dismissed_date)
SELECT s.id, d::date
FROM students s
CROSS JOIN generate_series('2026-03-01'::date, '2026-03-08'::date, '1 day'::interval) d
WHERE s.grade_id IN ('e62e3d32-a5e0-4057-90db-76df35c0117c', 'faaaca5b-8f2c-4c9e-8ff4-82e7b31230b3')
ON CONFLICT DO NOTHING;
