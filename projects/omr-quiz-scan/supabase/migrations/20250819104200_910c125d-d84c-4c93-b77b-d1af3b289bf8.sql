-- Enable RLS on tests table (if not already enabled)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Check and create policies for tests table (drop existing if needed)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can view tests" ON tests;
    DROP POLICY IF EXISTS "Anyone can insert tests" ON tests;
    DROP POLICY IF EXISTS "Anyone can update tests" ON tests;
    DROP POLICY IF EXISTS "Anyone can delete tests" ON tests;
    
    -- Create new policies
    CREATE POLICY "Anyone can view tests" ON tests FOR SELECT USING (true);
    CREATE POLICY "Anyone can insert tests" ON tests FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anyone can update tests" ON tests FOR UPDATE USING (true);
    CREATE POLICY "Anyone can delete tests" ON tests FOR DELETE USING (true);
END$$;

-- Enable RLS on test_results table (already has policies, just enable RLS)
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Enable RLS on student_test_history table (already has some existing setup)
ALTER TABLE student_test_history ENABLE ROW LEVEL SECURITY;