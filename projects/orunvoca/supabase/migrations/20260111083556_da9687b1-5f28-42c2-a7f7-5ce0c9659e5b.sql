-- 복합 의미가 하나의 선지에 들어간 문제들 수정

-- mean 문제 수정: "심술궂은 의미하다" → "심술궂은", "의미하다" 분리
UPDATE exam_questions 
SET choices = ARRAY['미세한', '명확한', '못된', '심술궂은', '의미하다', '물리적인', '우아한', '조악한'],
    correct_answer = '["못된","심술궂은","의미하다"]'
WHERE id = '81f9061b-0579-426b-ab63-de2e5b327cc1';

-- big 문제 수정: "큰 크게" → "큰", "크게" 분리
UPDATE exam_questions 
SET choices = ARRAY['원시적인', '비극적인', '가벼운', '큰', '크게', '매끄러운', '차가운', '넓은'],
    correct_answer = '["큰","크게"]'
WHERE id = 'ab8c6dba-d58d-4c96-ac14-3f20f24d5912';

-- wonder 문제 수정: "의아해하다 놀라움" → "의아해하다", "놀라움" 분리
UPDATE exam_questions 
SET choices = ARRAY['궁금해하다', '의아해하다', '놀라움', '경탄', '계산하다', '변형하다', '추측하다', '저장하다'],
    correct_answer = '["궁금해하다","의아해하다","놀라움","경탄"]'
WHERE id = '125b9a9c-0e76-4f20-88e4-21f5c39ca03e';