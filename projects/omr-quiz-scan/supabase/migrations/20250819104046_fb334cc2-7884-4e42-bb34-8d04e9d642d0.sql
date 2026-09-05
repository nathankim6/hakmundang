-- Clean up any orphaned data and fix foreign key constraints
-- Remove orphaned student history records that don't have corresponding test results
DELETE FROM student_test_history 
WHERE student_name NOT IN (
  SELECT DISTINCT student_name 
  FROM test_results 
  WHERE student_name IS NOT NULL
);

-- Create sample test data to restore functionality
INSERT INTO tests (test_id, title, answers, question_count, created_at, is_ended) VALUES
('TEST001', '중간고사 모의고사', '{"1": "1", "2": "3", "3": "2", "4": "4", "5": "1"}', 5, NOW() - INTERVAL '7 days', true),
('TEST002', '기말고사 모의고사', '{"1": "2", "2": "1", "3": "4", "4": "3", "5": "2"}', 5, NOW() - INTERVAL '3 days', true),
('TEST003', '수능 모의고사', '{"1": "3", "2": "4", "3": "1", "4": "2", "5": "3"}', 5, NOW() - INTERVAL '1 day', false);

-- Create sample test results
INSERT INTO test_results (test_id, student_name, score, student_answers, correct_count, total_count, created_at) VALUES
('TEST001', '김철수', 80, '{"1": "1", "2": "3", "3": "4", "4": "4", "5": "1"}', 4, 5, NOW() - INTERVAL '7 days'),
('TEST001', '이영희', 100, '{"1": "1", "2": "3", "3": "2", "4": "4", "5": "1"}', 5, 5, NOW() - INTERVAL '7 days'),
('TEST001', '박민수', 60, '{"1": "2", "2": "3", "3": "2", "4": "1", "5": "1"}', 3, 5, NOW() - INTERVAL '7 days'),
('TEST002', '김철수', 90, '{"1": "2", "2": "1", "3": "4", "4": "3", "5": "1"}', 4, 5, NOW() - INTERVAL '3 days'),
('TEST002', '이영희', 80, '{"1": "2", "2": "1", "3": "1", "4": "3", "5": "2"}', 4, 5, NOW() - INTERVAL '3 days'),
('TEST003', '김철수', 70, '{"1": "3", "2": "2", "3": "1", "4": "2", "5": "3"}', 3, 5, NOW() - INTERVAL '1 day');