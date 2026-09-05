UPDATE vocabulary_distractors 
SET 
  correct_answer = '상호작용하다, 소통하다',
  distractors = ARRAY['배반하다', '기다리다'],
  updated_at = now()
WHERE question_id = 120;