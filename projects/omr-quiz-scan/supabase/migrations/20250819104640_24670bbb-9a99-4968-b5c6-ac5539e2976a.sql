-- First, let's see what foreign key constraints exist and fix them
-- Drop the existing foreign key constraint that's causing issues
ALTER TABLE test_results DROP CONSTRAINT IF EXISTS test_results_test_id_fkey;

-- Recreate the foreign key constraint with CASCADE options to prevent orphaned data
ALTER TABLE test_results 
ADD CONSTRAINT test_results_test_id_fkey 
FOREIGN KEY (test_id) 
REFERENCES tests(test_id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;