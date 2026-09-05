-- 강다연 학생의 잘못 계산된 점수를 수정
UPDATE test_results 
SET 
  score = 79,
  correct_count = 36
WHERE student_name = '1AD 강다연' AND test_id = '20250726';