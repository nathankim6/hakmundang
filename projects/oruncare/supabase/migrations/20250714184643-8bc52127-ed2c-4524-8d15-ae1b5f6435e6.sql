-- Update the delete_old_test_schedules function to delete records older than 180 days instead of 14 days
CREATE OR REPLACE FUNCTION public.delete_old_test_schedules()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  DELETE FROM test_schedules
  WHERE created_at < NOW() - INTERVAL '180 days';
END;
$function$;