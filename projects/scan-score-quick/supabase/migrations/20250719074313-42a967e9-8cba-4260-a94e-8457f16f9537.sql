-- Update all IVY students' test results to merge into 'IVY temp1'
UPDATE test_results 
SET student_name = 'IVY temp1' 
WHERE student_name LIKE 'IVY %' AND student_name != 'IVY temp1';

-- Update the student_test_history for 'IVY temp1' with aggregated data
WITH aggregated_data AS (
  SELECT 
    COUNT(*) as total_test_count,
    SUM(score) as total_score,
    AVG(score) as average_score
  FROM test_results 
  WHERE student_name = 'IVY temp1'
)
UPDATE student_test_history 
SET 
  test_count = (SELECT total_test_count FROM aggregated_data),
  total_score = (SELECT total_score FROM aggregated_data),
  average_score = (SELECT average_score FROM aggregated_data),
  updated_at = NOW()
WHERE student_name = 'IVY temp1';

-- Delete duplicate student history records for merged students
DELETE FROM student_test_history 
WHERE student_name LIKE 'IVY %' AND student_name != 'IVY temp1';