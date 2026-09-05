-- 기존 exam_questions의 choices에서 괄호 내용 제거하는 함수 생성
CREATE OR REPLACE FUNCTION clean_choice_text(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  cleaned TEXT;
BEGIN
  cleaned := input_text;
  
  -- 품사 마커 제거 [명], [동], [형], [부]
  cleaned := regexp_replace(cleaned, '\[([명동형부])\]\s*', '', 'g');
  cleaned := regexp_replace(cleaned, '\s*\[([명동형부])\]\s*', ' ', 'g');
  
  -- 소괄호와 그 내용 제거 (예: "(상품의) 소매점" -> "소매점")
  cleaned := regexp_replace(cleaned, '\([^)]*\)', '', 'g');
  
  -- 대괄호와 그 내용 제거 (예: "신입 사원[회원]" -> "신입 사원")
  cleaned := regexp_replace(cleaned, '\[[^\]]*\]', '', 'g');
  
  -- 연속된 공백 정리 및 앞뒤 공백 제거
  cleaned := regexp_replace(cleaned, '\s+', ' ', 'g');
  cleaned := trim(cleaned);
  
  RETURN cleaned;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- exam_questions 테이블의 choices 업데이트 (text[] 배열)
UPDATE exam_questions
SET choices = (
  SELECT array_agg(clean_choice_text(choice))
  FROM unnest(choices) AS choice
)
WHERE choices IS NOT NULL
AND cardinality(choices) > 0;

-- word_quiz_cache 테이블의 choices 업데이트 (jsonb 배열)
UPDATE word_quiz_cache
SET choices = (
  SELECT jsonb_agg(clean_choice_text(elem::text))
  FROM jsonb_array_elements_text(choices) AS elem
)
WHERE choices IS NOT NULL
AND jsonb_array_length(choices) > 0;