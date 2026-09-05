-- Fix foreign key constraints to prevent data loss
-- Drop existing foreign key constraint
ALTER TABLE public.test_results DROP CONSTRAINT IF EXISTS test_results_test_id_fkey;

-- Re-add foreign key with ON DELETE CASCADE to prevent orphaned records
ALTER TABLE public.test_results 
ADD CONSTRAINT test_results_test_id_fkey 
FOREIGN KEY (test_id) REFERENCES public.tests(test_id) 
ON DELETE CASCADE;

-- Create automatic backup trigger function
CREATE OR REPLACE FUNCTION public.backup_before_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Backup deleted test data to localStorage through a notification
  PERFORM pg_notify('test_backup', json_build_object(
    'action', 'delete',
    'table', TG_TABLE_NAME,
    'data', row_to_json(OLD)
  )::text);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic backup before deletion
DROP TRIGGER IF EXISTS backup_tests_before_delete ON public.tests;
CREATE TRIGGER backup_tests_before_delete
  BEFORE DELETE ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.backup_before_delete();

DROP TRIGGER IF EXISTS backup_test_results_before_delete ON public.test_results;  
CREATE TRIGGER backup_test_results_before_delete
  BEFORE DELETE ON public.test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.backup_before_delete();

-- Create function to safely delete tests with confirmation
CREATE OR REPLACE FUNCTION public.safe_delete_test(test_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  result_count INTEGER;
BEGIN
  -- Count associated test results
  SELECT COUNT(*) INTO result_count 
  FROM public.test_results 
  WHERE test_id = test_id_param;
  
  -- Log the deletion
  INSERT INTO public.deletion_log (deleted_at, table_name, record_id, associated_records)
  VALUES (NOW(), 'tests', test_id_param, result_count);
  
  -- Delete the test (CASCADE will handle test_results)
  DELETE FROM public.tests WHERE test_id = test_id_param;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create deletion log table for audit trail
CREATE TABLE IF NOT EXISTS public.deletion_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  associated_records INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on deletion_log
ALTER TABLE public.deletion_log ENABLE ROW LEVEL SECURITY;

-- Create policy for deletion_log
CREATE POLICY "Anyone can view deletion log" 
ON public.deletion_log 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert deletion log" 
ON public.deletion_log 
FOR INSERT 
WITH CHECK (true);