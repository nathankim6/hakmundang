-- test_results 테이블에서 삭제 제한 트리거 제거
DROP TRIGGER IF EXISTS prevent_deletion_trigger ON public.test_results;

-- tests 테이블에서 삭제 제한 트리거 제거  
DROP TRIGGER IF EXISTS prevent_deletion_trigger ON public.tests;

-- student_test_history 테이블에서 삭제 제한 트리거 제거
DROP TRIGGER IF EXISTS prevent_deletion_trigger ON public.student_test_history;

-- 삭제 로그는 유지하되 권한 검사 없이 진행하도록 함수 수정
CREATE OR REPLACE FUNCTION public.log_deletion_only()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- 삭제 로그에 상세 정보만 기록
  INSERT INTO public.deletion_log (
    table_name, 
    record_id, 
    associated_records,
    deleted_at
  ) VALUES (
    TG_TABLE_NAME,
    CASE 
      WHEN TG_TABLE_NAME = 'tests' THEN OLD.test_id
      WHEN TG_TABLE_NAME = 'test_results' THEN OLD.id::text
      WHEN TG_TABLE_NAME = 'student_test_history' THEN OLD.id::text
      ELSE 'unknown'
    END,
    1,
    NOW()
  );
  
  RETURN OLD;
END;
$function$;

-- 새 트리거 생성 (권한 검사 없음)
CREATE TRIGGER log_deletion_trigger
  BEFORE DELETE ON public.test_results
  FOR EACH ROW
  EXECUTE FUNCTION log_deletion_only();

CREATE TRIGGER log_deletion_trigger
  BEFORE DELETE ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION log_deletion_only();

CREATE TRIGGER log_deletion_trigger
  BEFORE DELETE ON public.student_test_history
  FOR EACH ROW
  EXECUTE FUNCTION log_deletion_only();