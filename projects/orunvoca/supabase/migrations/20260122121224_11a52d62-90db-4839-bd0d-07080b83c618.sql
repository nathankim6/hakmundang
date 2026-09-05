
-- 잘못된 선지 데이터 삭제 (품사 분리 오류가 있는 데이터)
-- 이 데이터들은 새 로직으로 다시 생성됨

DELETE FROM word_quiz_cache 
WHERE quiz_type = 'meaning'
AND (
  -- 공백으로 잘못 합쳐진 패턴 (품사 분리 실패)
  correct_answers::text ~ '"[가-힣]+\s[가-힣]+"'
  -- 명시적으로 잘못된 패턴들
  OR correct_answers::text LIKE '%물속의 물속에서%'
  OR correct_answers::text LIKE '%증가하다 증가%'
  OR correct_answers::text LIKE '%더 심한 더%'
  OR correct_answers::text LIKE '%더 이상의 더%'
  OR correct_answers::text LIKE '%추상물 추상적인%'
  OR correct_answers::text LIKE '%중독자 중독시키다%'
  OR correct_answers::text LIKE '%공격하다 공격%'
  OR correct_answers::text LIKE '%외계의 외국의%'
  OR correct_answers::text LIKE '%동료 연상하다%'
  OR correct_answers::text LIKE '%체포하다 검거하다 체포%'
  OR correct_answers::text LIKE '%대안적인 대안%'
  OR correct_answers::text LIKE '%아마추어 비전문가%'
)
