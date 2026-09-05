-- 시험 결과 데이터 보호를 위한 보안 강화
-- 1. 삭제 권한을 제한하는 새로운 RLS 정책 추가
-- 2. 삭제 전 백업을 강제하는 트리거 추가
-- 3. 의도하지 않은 삭제를 방지하는 보안 장치 추가

-- 시험 데이터 삭제 보안 정책 (tests 테이블)
DROP POLICY IF EXISTS "Anyone can delete tests" ON public.tests;
CREATE POLICY "Restricted delete for tests" 
ON public.tests 
FOR DELETE 
USING (
  -- 삭제는 관리자만 가능하도록 제한
  EXISTS (
    SELECT 1 FROM public.access_codes 
    WHERE code = current_setting('request.jwt.claims', true)::json->>'access_code' 
    AND is_admin = true
  )
);

-- 시험 결과 데이터 삭제 보안 정책 (test_results 테이블)
CREATE POLICY "Highly restricted delete for test_results" 
ON public.test_results 
FOR DELETE 
USING (false); -- 완전히 삭제 금지

-- 학생 기록 삭제 보안 정책 (student_test_history 테이블)
CREATE POLICY "No delete allowed for student_test_history" 
ON public.student_test_history 
FOR DELETE 
USING (false); -- 완전히 삭제 금지

-- 삭제 전 자동 백업 트리거 함수 강화
CREATE OR REPLACE FUNCTION public.prevent_accidental_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- 삭제 로그에 상세 정보 기록
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
  
  -- 관리자가 아닌 경우 삭제 차단
  IF NOT EXISTS (
    SELECT 1 FROM public.access_codes 
    WHERE code = current_setting('request.jwt.claims', true)::json->>'access_code' 
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION '권한이 없습니다. 관리자만 삭제할 수 있습니다.';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (기존 트리거가 있다면 교체)
DROP TRIGGER IF EXISTS prevent_test_deletion ON public.tests;
CREATE TRIGGER prevent_test_deletion
  BEFORE DELETE ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_accidental_deletion();

DROP TRIGGER IF EXISTS prevent_test_results_deletion ON public.test_results;
CREATE TRIGGER prevent_test_results_deletion
  BEFORE DELETE ON public.test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_accidental_deletion();

DROP TRIGGER IF EXISTS prevent_student_history_deletion ON public.student_test_history;
CREATE TRIGGER prevent_student_history_deletion
  BEFORE DELETE ON public.student_test_history
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_accidental_deletion();

-- 데이터 복구를 위한 백업 테이블 생성
CREATE TABLE IF NOT EXISTS public.deleted_test_results_backup (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  original_id text NOT NULL,
  test_id text NOT NULL,
  student_name text NOT NULL,
  score numeric NOT NULL,
  student_answers jsonb NOT NULL,
  correct_count integer NOT NULL,
  total_count integer NOT NULL,
  original_created_at timestamp with time zone NOT NULL,
  deleted_at timestamp with time zone DEFAULT now(),
  deleted_by text
);

-- 백업 테이블 RLS 정책
ALTER TABLE public.deleted_test_results_backup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only access to backup" 
ON public.deleted_test_results_backup 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.access_codes 
    WHERE code = current_setting('request.jwt.claims', true)::json->>'access_code' 
    AND is_admin = true
  )
);

-- 데이터 복구 함수
CREATE OR REPLACE FUNCTION public.restore_test_result(backup_id uuid)
RETURNS boolean AS $$
DECLARE
  backup_record RECORD;
BEGIN
  -- 백업 데이터 조회
  SELECT * INTO backup_record FROM public.deleted_test_results_backup WHERE id = backup_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '백업 데이터를 찾을 수 없습니다.';
  END IF;
  
  -- 원본 데이터 복구
  INSERT INTO public.test_results (
    id, test_id, student_name, score, student_answers, 
    correct_count, total_count, created_at
  ) VALUES (
    backup_record.original_id::uuid,
    backup_record.test_id,
    backup_record.student_name,
    backup_record.score,
    backup_record.student_answers,
    backup_record.correct_count,
    backup_record.total_count,
    backup_record.original_created_at
  );
  
  -- 백업에서 복구 완료 표시
  UPDATE public.deleted_test_results_backup 
  SET deleted_by = CONCAT(deleted_by, ' [RESTORED]')
  WHERE id = backup_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;