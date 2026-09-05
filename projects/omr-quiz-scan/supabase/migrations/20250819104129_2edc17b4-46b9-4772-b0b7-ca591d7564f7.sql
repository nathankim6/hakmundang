-- Enable RLS on tests and test_results tables
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for tests table
CREATE POLICY "Anyone can view tests" ON tests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tests" ON tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tests" ON tests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tests" ON tests FOR DELETE USING (true);

-- Create policies for test_results table  
CREATE POLICY "Anyone can view test results" ON test_results FOR SELECT USING (true);
CREATE POLICY "Anyone can insert test results" ON test_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update test results" ON test_results FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete test results" ON test_results FOR DELETE USING (true);

-- Enable RLS on student_test_history table
ALTER TABLE student_test_history ENABLE ROW LEVEL SECURITY;

-- Create policies for student_test_history table
CREATE POLICY "Anyone can view student history" ON student_test_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert student history" ON student_test_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update student history" ON student_test_history FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete student history" ON student_test_history FOR DELETE USING (true);