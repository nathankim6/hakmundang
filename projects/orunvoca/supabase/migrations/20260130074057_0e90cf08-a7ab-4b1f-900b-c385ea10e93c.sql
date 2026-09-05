-- negative 문제의 선지를 다른 문제들과 동일하게 5개로 수정 (정답 2개 + 오답 3개)
UPDATE exam_questions 
SET choices = ARRAY['부정의', '소극적인', '엄격한', '밝은', '거친']
WHERE id = 'a693c03e-61df-4ff3-ab85-0cd8219aadd0';