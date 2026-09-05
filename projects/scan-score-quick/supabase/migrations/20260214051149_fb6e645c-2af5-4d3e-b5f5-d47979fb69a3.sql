-- Fix SECURITY DEFINER functions: add SET search_path for security

-- 1. Fix delete_test_result_by_id
CREATE OR REPLACE FUNCTION public.delete_test_result_by_id(result_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM test_results WHERE id = result_id;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 2. Fix restore_test_result
CREATE OR REPLACE FUNCTION public.restore_test_result(backup_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  backup_record RECORD;
BEGIN
  SELECT * INTO backup_record FROM public.deleted_test_results_backup WHERE id = backup_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '백업 데이터를 찾을 수 없습니다.';
  END IF;
  
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
  
  UPDATE public.deleted_test_results_backup 
  SET deleted_by = CONCAT(deleted_by, ' [RESTORED]')
  WHERE id = backup_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 3. Fix delete_old_generated_questions
CREATE OR REPLACE FUNCTION public.delete_old_generated_questions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM generated_questions_storage
  WHERE created_at < NOW() - INTERVAL '3 days';
END;
$$;

-- 4. Fix handle_new_user 
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  INSERT INTO public.user_subscriptions (user_id, subscription_name, expiry_date)
  VALUES (
    NEW.id,
    'Trial',
    NOW() + INTERVAL '30 days'
  );
  
  RETURN NEW;
END;
$$;

-- 5. Fix get_current_employee_id
CREATE OR REPLACE FUNCTION public.get_current_employee_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM employees 
    WHERE access_code = ((current_setting('request.jwt.claims'::text, true))::json ->> 'access_code'::text)
    LIMIT 1
  );
END;
$$;

-- 6. Fix safe_delete_test - convert to SECURITY INVOKER since it doesn't need elevated privileges
CREATE OR REPLACE FUNCTION public.safe_delete_test(test_id_param text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  result_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO result_count 
  FROM public.test_results 
  WHERE test_id = test_id_param;
  
  INSERT INTO public.deletion_log (deleted_at, table_name, record_id, associated_records)
  VALUES (NOW(), 'tests', test_id_param, result_count);
  
  DELETE FROM public.tests WHERE test_id = test_id_param;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;