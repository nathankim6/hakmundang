-- 개선된 재채점 함수
CREATE OR REPLACE FUNCTION regrade_all_submissions()
RETURNS TABLE(submission_id UUID, old_score NUMERIC, new_score NUMERIC, old_correct INT, new_correct INT) AS $$
DECLARE
  sub RECORD;
  ans_element JSONB;
  question RECORD;
  correct_arr TEXT[];
  student_arr TEXT[];
  norm_correct TEXT[];
  norm_student TEXT[];
  is_ans_correct BOOLEAN;
  v_correct_count INT;
  v_total_count INT;
  new_score_val NUMERIC;
  updated_answers JSONB;
  q_num INT;
  s_answer_text TEXT;
  s_answer_arr TEXT[];
BEGIN
  FOR sub IN SELECT * FROM exam_submissions LOOP
    v_correct_count := 0;
    v_total_count := 0;
    updated_answers := '[]'::JSONB;
    
    FOR ans_element IN SELECT * FROM jsonb_array_elements(sub.answers::JSONB) LOOP
      v_total_count := v_total_count + 1;
      is_ans_correct := FALSE;
      
      q_num := (ans_element->>'question_number')::INT;
      
      SELECT eq.* INTO question 
      FROM exam_questions eq 
      WHERE eq.exam_id = sub.exam_id 
        AND eq.question_number = q_num;
      
      IF question IS NOT NULL THEN
        -- correct_answer 파싱 (JSON 배열 또는 단순 문자열)
        BEGIN
          SELECT ARRAY(SELECT jsonb_array_elements_text(question.correct_answer::JSONB)) INTO correct_arr;
        EXCEPTION WHEN OTHERS THEN
          correct_arr := ARRAY[question.correct_answer];
        END;
        
        -- student_answer 파싱
        IF jsonb_typeof(ans_element->'student_answer') = 'array' THEN
          SELECT ARRAY(SELECT jsonb_array_elements_text(ans_element->'student_answer')) INTO student_arr;
        ELSIF ans_element->>'student_answer' IS NOT NULL AND ans_element->>'student_answer' != '' THEN
          student_arr := ARRAY[ans_element->>'student_answer'];
        ELSE
          student_arr := ARRAY[]::TEXT[];
        END IF;
        
        -- 정규화
        SELECT ARRAY(SELECT LOWER(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(unnest, '\s+', ' ', 'g'), '\[([명동형부])\]\s*', '', 'g'))) FROM unnest(correct_arr)) INTO norm_correct;
        SELECT ARRAY(SELECT LOWER(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(unnest, '\s+', ' ', 'g'), '\[([명동형부])\]\s*', '', 'g'))) FROM unnest(student_arr)) INTO norm_student;
        
        -- 비교 로직
        IF question.question_type = 'multiple_choice' AND array_length(correct_arr, 1) > 1 THEN
          -- 복수 정답: 순서 무관하게 모든 정답 포함 확인
          IF array_length(norm_student, 1) = array_length(norm_correct, 1) THEN
            is_ans_correct := (
              (SELECT COUNT(*) FROM unnest(norm_student) s WHERE s = ANY(norm_correct)) = array_length(norm_correct, 1)
            );
          END IF;
        ELSIF question.question_type IN ('spelling', 'example') THEN
          -- 철자/예문: 대소문자 무시
          is_ans_correct := LOWER(TRIM(COALESCE(student_arr[1], ''))) = LOWER(TRIM(question.correct_answer));
        ELSE
          -- 단일 정답
          IF array_length(norm_student, 1) >= 1 THEN
            is_ans_correct := norm_student[1] = norm_correct[1];
          END IF;
        END IF;
        
        IF is_ans_correct THEN
          v_correct_count := v_correct_count + 1;
        END IF;
      END IF;
      
      updated_answers := updated_answers || jsonb_build_object(
        'question_number', ans_element->>'question_number',
        'question_type', ans_element->>'question_type',
        'word', ans_element->>'word',
        'meaning', ans_element->>'meaning',
        'student_answer', ans_element->'student_answer',
        'correct_answer', ans_element->'correct_answer',
        'is_correct', is_ans_correct
      );
    END LOOP;
    
    IF v_total_count > 0 THEN
      new_score_val := ROUND((v_correct_count::NUMERIC / v_total_count::NUMERIC) * 100, 1);
    ELSE
      new_score_val := 0;
    END IF;
    
    submission_id := sub.id;
    old_score := sub.score;
    new_score := new_score_val;
    old_correct := sub.correct_count;
    new_correct := v_correct_count;
    
    UPDATE exam_submissions es
    SET score = new_score_val, 
        correct_count = v_correct_count,
        answers = updated_answers
    WHERE es.id = sub.id;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 재채점 실행
SELECT * FROM regrade_all_submissions();