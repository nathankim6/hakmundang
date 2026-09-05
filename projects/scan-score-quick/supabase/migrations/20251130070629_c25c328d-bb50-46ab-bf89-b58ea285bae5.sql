-- Create a function to delete test results by ID without returning data
CREATE OR REPLACE FUNCTION delete_test_result_by_id(result_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM test_results WHERE id = result_id;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;