-- 옳은보카 Ultimate Day41-50 시험의 객관식 문제들 정답 수정
-- 정답을 선지와 매칭되도록 업데이트

-- 1번 문제: council - 선지에 '의회', '회의', '협의'가 있음
UPDATE exam_questions SET correct_answer = '["의회", "회의", "협의"]'
WHERE id = '1c0a4826-d86b-4c0d-99ee-376396d75846';

-- 2번 문제: obey - 선지에 '지키다', '복종하다'가 있음 (이미 올바름)
UPDATE exam_questions SET correct_answer = '["지키다", "복종하다"]'
WHERE id = 'cd6b8212-31ba-4cf7-a9ef-6b7d55e3cb37';

-- 3번 문제: worth - 선지에 '가치가 있는', '가치'가 있음
UPDATE exam_questions SET correct_answer = '["가치가 있는", "가치"]'
WHERE id = 'd66c4535-985c-4ca7-8350-461e1ae5468d';

-- 4번 문제: argue - 선지에 '다투다', '논쟁하다', '주장하다'가 있음
UPDATE exam_questions SET correct_answer = '["다투다", "논쟁하다", "주장하다"]'
WHERE id = 'dabb0d91-12c8-4240-8155-ecbe20e15840';

-- 5번 문제: apologize - 이미 올바름
UPDATE exam_questions SET correct_answer = '["사과하다"]'
WHERE id = '22dbfb60-1155-4567-80ee-aaf283b29c36';

-- 6번 문제: fiction - 선지에 '소설', '허구'가 있음
UPDATE exam_questions SET correct_answer = '["소설", "허구"]'
WHERE id = '581761ee-6f60-4bb3-9e78-c19072da5c90';

-- 7번 문제: wreck - 선지에 '파괴하다', '망가뜨리다', '난파시키다'가 있음
UPDATE exam_questions SET correct_answer = '["파괴하다", "망가뜨리다", "난파시키다"]'
WHERE id = '59f85800-b8d9-4485-9055-aeb9c2790671';

-- 8번 문제: amateur - 선지에 '아마추어의', '비전문가의', '아마추어', '비전문가'가 있음
UPDATE exam_questions SET correct_answer = '["아마추어의", "비전문가의", "아마추어", "비전문가"]'
WHERE id = '51df1788-f25b-4bab-860b-57e4ead674f6';

-- 9번 문제: nod - 선지에 '끄덕임', '끄덕이다'가 있음
UPDATE exam_questions SET correct_answer = '["끄덕임", "끄덕이다"]'
WHERE id = '7a046297-1742-4683-a53a-71d6818e387c';

-- 10번 문제: genetic - 선지에 '유전의', '유전학의'가 있음 (이미 올바름)
UPDATE exam_questions SET correct_answer = '["유전의", "유전학의"]'
WHERE id = '45a3fac2-26b4-466f-a379-9541b577c9f9';

-- 11번 문제: forecast - 선지에 '예측하다', '예보하다', '예보', '예측'가 있음
UPDATE exam_questions SET correct_answer = '["예측하다", "예보하다", "예보", "예측"]'
WHERE id = '956b6940-eb34-4611-a863-07d0a96ca6a6';

-- 12번 문제: besides - 선지에 '외에', '게다가'가 있음
UPDATE exam_questions SET correct_answer = '["외에", "게다가"]'
WHERE id = '6a95f578-3bb0-4c8a-84b0-d90595c3e08b';

-- 13번 문제: realistic - 선지에 '현실적인', '실제적인'가 있음 (이미 올바름)
UPDATE exam_questions SET correct_answer = '["현실적인", "실제적인"]'
WHERE id = '7000c8ce-17ba-4bb0-9b96-90060591532e';

-- 14번 문제: skeleton - 선지에 '골격', '뼈대'가 있음 (이미 올바름)
UPDATE exam_questions SET correct_answer = '["골격", "뼈대"]'
WHERE id = '3b755d25-09ed-40a8-8f82-07f2f5247f20';

-- 15번 문제: debt - 선지에 '빚', '부채'가 있음 (이미 올바름)
UPDATE exam_questions SET correct_answer = '["빚", "부채"]'
WHERE id = '882924f1-a412-452d-8559-2ff319647de5';

-- 16번 문제: recall - 선지에 '기억해내다', '상기하다'가 있음 (이미 올바름)
UPDATE exam_questions SET correct_answer = '["기억해내다", "상기하다"]'
WHERE id = '2816d3ee-3339-4d49-8156-9e79bdff7255';

-- 17번 문제: suppose - 선지에 '가정하다', '추측하다'가 있음
UPDATE exam_questions SET correct_answer = '["가정하다", "추측하다"]'
WHERE id = '3d35e6f7-8c37-4aa8-bb42-8050700bbe3a';

-- 18번 문제: moral - 선지에 '도덕적인', '도덕의'가 있음 (이미 올바름)
UPDATE exam_questions SET correct_answer = '["도덕적인", "도덕의"]'
WHERE id = 'dd6bbabe-3f50-4dbd-98d5-184d40624e4c';

-- 19번 문제: prospect - 선지에 '전망', '가망', '경치', '조망'가 있음
UPDATE exam_questions SET correct_answer = '["전망", "가망", "경치", "조망"]'
WHERE id = '7069aa2e-ffa1-4cf9-b291-8e4adbc1ea57';

-- 20번 문제: assume - 선지에 '추측하다', '가정하다'가 있음 (이미 올바름)
UPDATE exam_questions SET correct_answer = '["추측하다", "가정하다"]'
WHERE id = '775d145c-662a-4e41-9676-300e6b916dea';

-- 21번 문제: exact - 선지에 '정확한', '정밀한', '꼼꼼한'가 있음
UPDATE exam_questions SET correct_answer = '["정확한", "정밀한", "꼼꼼한"]'
WHERE id = '77040623-f5b4-471a-b2d1-eb26329afc54';

-- 22번 문제: metal - 선지에 '금속', '금속의'가 있음
UPDATE exam_questions SET correct_answer = '["금속", "금속의"]'
WHERE id = 'a2fe8a40-6f00-48f3-9ba7-8b939b2d71e9';