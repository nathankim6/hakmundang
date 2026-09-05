-- Enable delete operations on student_test_history table
DROP POLICY IF EXISTS "No delete allowed for student_test_history" ON student_test_history;

-- Create a new policy that allows delete for all users
CREATE POLICY "Enable delete for all users on student_test_history"
ON student_test_history
FOR DELETE
TO public
USING (true);