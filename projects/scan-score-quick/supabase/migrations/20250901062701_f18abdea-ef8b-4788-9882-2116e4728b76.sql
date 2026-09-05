-- prevent_accidental_deletion 함수 완전 제거
DROP FUNCTION IF EXISTS public.prevent_accidental_deletion() CASCADE;

-- 혹시 남아있을 수 있는 관련 트리거들도 모두 제거
DROP TRIGGER IF EXISTS prevent_accidental_deletion_trigger ON public.test_results;
DROP TRIGGER IF EXISTS prevent_accidental_deletion_trigger ON public.tests;
DROP TRIGGER IF EXISTS prevent_accidental_deletion_trigger ON public.student_test_history;