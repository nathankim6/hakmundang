-- 시험들의 card_set_id를 실제 단어가 있는 원본으로 변경
UPDATE exams SET card_set_id = '50a3df6b-0b60-4d5c-905c-f1e04af3a91c' WHERE id = '89b3dad8-b6b4-422a-8f4e-d311cdcef49e';
UPDATE exams SET card_set_id = 'f80f5428-0e57-414d-8212-1430ea3b1e7c' WHERE id = 'e1988e79-120e-4781-894a-6c643175630e';
UPDATE exams SET card_set_id = '85c71887-687d-4a32-90f0-819a574677b1' WHERE id = 'db74f0f4-ac20-4b92-ab43-1e0b2b76404f';

-- 빈 card_set 삭제
DELETE FROM card_sets WHERE id IN ('bc385c43-5a7b-4936-9e5a-ddff309d0414', '7871b49a-3a1b-4710-be85-0b7366e3c652', 'a3a7a54c-b4cb-4885-b998-0b8ab585adc4');