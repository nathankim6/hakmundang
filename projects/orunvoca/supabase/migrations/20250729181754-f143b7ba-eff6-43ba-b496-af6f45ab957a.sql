-- 중복된 "나만의 단어장" 카드셋 정리
-- 가장 최신 것 하나만 남기고 나머지 삭제
WITH latest_personal_wordbook AS (
  SELECT id
  FROM card_sets 
  WHERE title = '나만의 단어장' 
    AND created_by = 'personal_wordbook'
  ORDER BY created_at DESC 
  LIMIT 1
)
DELETE FROM card_sets 
WHERE title = '나만의 단어장' 
  AND created_by = 'personal_wordbook'
  AND id NOT IN (SELECT id FROM latest_personal_wordbook);