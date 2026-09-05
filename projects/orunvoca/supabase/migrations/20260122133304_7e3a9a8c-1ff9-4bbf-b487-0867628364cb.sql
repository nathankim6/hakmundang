-- 세미콜론(;)이 포함된 캐시 레코드 삭제 (재생성 필요)
DELETE FROM word_quiz_cache
WHERE meaning LIKE '%;%' OR correct_answers::text LIKE '%;%';