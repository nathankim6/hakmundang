-- 영어 오답이 포함된 객관식 문제들의 선지를 한국어로 교체

-- tall 문제 수정 (형용사)
UPDATE exam_questions 
SET choices = ARRAY['키가 큰', '높은', '키가 ~인', '거대한', '섬세한', '우울한', '화려한', '명확한']
WHERE id = '6c6e27b8-4af7-49b1-b72b-fd055c7cfa27';

-- giant 문제 수정 (명사/형용사)
UPDATE exam_questions 
SET choices = ARRAY['거인', '거대한 것', '거대한', '위대한', '지평선', '폭풍', '조각상', '환영']
WHERE id = '66abd9f4-0a2b-427a-903a-2b07311f6a3a';

-- foolish 문제 수정 (형용사)
UPDATE exam_questions 
SET choices = ARRAY['어리석은', '바보 같은', '신비로운', '격렬한', '온화한', '엄격한', '유연한', '견고한']
WHERE id = '18c73ff2-530f-4a93-969b-cb4183d12ddb';

-- serious 문제 수정 (형용사)
UPDATE exam_questions 
SET choices = ARRAY['진지한', '(나쁘거나 위험한 정도가) 심각한', '모호한', '신비로운', '격렬한', '온화한', '엄격한', '유연한']
WHERE id = '589bdaa3-e8f1-4e6d-8972-67b81046cd3d';

-- wonder 문제 수정 (동사/명사)
UPDATE exam_questions 
SET choices = ARRAY['궁금해하다', '의아해하다 놀라움', '경탄', '계산하다', '변형하다', '추측하다', '저장하다', '분석하다', '구성하다']
WHERE id = '125b9a9c-0e76-4f20-88e4-21f5c39ca03e';