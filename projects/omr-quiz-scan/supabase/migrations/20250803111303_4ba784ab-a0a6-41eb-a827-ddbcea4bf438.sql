-- 모든 학생의 test-1, test-2 데이터 영구 삭제

-- 1. test_results 테이블에서 test-1, test-2 관련 모든 결과 삭제
DELETE FROM test_results 
WHERE test_id IN ('test-1', 'test-2');

-- 2. tests 테이블에서 test-1, test-2 시험 데이터 삭제
DELETE FROM tests 
WHERE test_id IN ('test-1', 'test-2');

-- 3. student_test_history 테이블의 통계 재계산
-- 각 학생별로 남은 test_results를 기반으로 통계 업데이트
WITH updated_stats AS (
  SELECT 
    student_name,
    COUNT(*) as new_test_count,
    SUM(score) as new_total_score,
    AVG(score) as new_average_score
  FROM test_results
  GROUP BY student_name
)
UPDATE student_test_history 
SET 
  test_count = COALESCE(updated_stats.new_test_count, 0),
  total_score = COALESCE(updated_stats.new_total_score, 0),
  average_score = COALESCE(updated_stats.new_average_score, 0),
  updated_at = NOW()
FROM updated_stats
WHERE student_test_history.student_name = updated_stats.student_name;

-- 4. test_results가 없는 학생의 history 레코드 삭제
DELETE FROM student_test_history 
WHERE student_name NOT IN (
  SELECT DISTINCT student_name 
  FROM test_results 
  WHERE student_name IS NOT NULL
);

-- 삭제 완료 확인
SELECT 
  'test_results' as table_name,
  COUNT(*) as remaining_records
FROM test_results 
WHERE test_id IN ('test-1', 'test-2')
UNION ALL
SELECT 
  'tests' as table_name,
  COUNT(*) as remaining_records  
FROM tests
WHERE test_id IN ('test-1', 'test-2');