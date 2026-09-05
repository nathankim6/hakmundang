-- 기존 card_sets 테이블의 include_derivatives 기본값을 false로 변경
ALTER TABLE card_sets ALTER COLUMN include_derivatives SET DEFAULT false;

-- 기존 데이터도 모두 false로 업데이트 (사용자가 명시적으로 변경한 것이 아니라면)
UPDATE card_sets SET include_derivatives = false;