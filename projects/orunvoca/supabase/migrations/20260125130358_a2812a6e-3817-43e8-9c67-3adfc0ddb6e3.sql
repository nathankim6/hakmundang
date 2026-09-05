-- 정규화 함수 재생성 (이미 있으면 덮어씀)
CREATE OR REPLACE FUNCTION normalize_for_comparison(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  IF text_input IS NULL THEN
    RETURN '';
  END IF;
  
  RETURN LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(text_input, '\s+', ' ', 'g'),
          '^\d+\.\s*', '', 'g'),
        '\[([명동형부])\]\s*', '', 'g')
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 재채점 함수 생성 (변수명 충돌 수정)
CREATE OR REPLACE FUNCTION regrade_exam_submissions()
RETURNS TABLE(submission_id UUID, old_score NUMERIC, new_score NUMERIC, old_correct INT, new_correct INT) AS $$
DECLARE
  sub RECORD;
  ans RECORD;
  question RECORD;
  correct_answers TEXT[];
  student_answers TEXT[];
  normalized_correct TEXT[];
  normalized_student TEXT[];
  is_correct BOOLEAN;
  v_correct_count INT;
  v_total_count INT;
  new_score_val NUMERIC;
  updated_answers JSONB;
BEGIN
  FOR sub IN SELECT * FROM exam_submissions LOOP
    v_correct_count := 0;
    v_total_count := 0;
    updated_answers := '[]'::JSONB;
    
    FOR ans IN SELECT * FROM jsonb_array_elements(sub.answers::JSONB) LOOP
      v_total_count := v_total_count + 1;
      is_correct := FALSE;
      
      SELECT eq.* INTO question 
      FROM exam_questions eq 
      WHERE eq.exam_id = sub.exam_id 
        AND eq.question_number = (ans.value->>'question_number')::INT;
      
      IF question IS NOT NULL THEN
        BEGIN
          SELECT ARRAY(SELECT jsonb_array_elements_text(question.correct_answer::JSONB)) INTO correct_answers;
        EXCEPTION WHEN OTHERS THEN
          correct_answers := ARRAY[question.correct_answer];
        END;
        
        SELECT ARRAY(SELECT normalize_for_comparison(unnest) FROM unnest(correct_answers)) INTO normalized_correct;
        
        IF jsonb_typeof(ans.value->'student_answer') = 'array' THEN
          SELECT ARRAY(SELECT jsonb_array_elements_text(ans.value->'student_answer')) INTO student_answers;
        ELSE
          student_answers := ARRAY[ans.value->>'student_answer'];
        END IF;
        
        SELECT ARRAY(SELECT normalize_for_comparison(unnest) FROM unnest(student_answers)) INTO normalized_student;
        
        IF question.question_type = 'multiple_choice' AND array_length(correct_answers, 1) > 1 THEN
          is_correct := (
            normalized_student @> normalized_correct AND 
            normalized_correct @> normalized_student AND
            array_length(normalized_student, 1) = array_length(normalized_correct, 1)
          );
        ELSIF question.question_type IN ('spelling', 'example') THEN
          is_correct := LOWER(TRIM(COALESCE(student_answers[1], ''))) = LOWER(TRIM(question.correct_answer));
        ELSE
          is_correct := normalize_for_comparison(COALESCE(student_answers[1], '')) = normalize_for_comparison(question.correct_answer);
        END IF;
        
        IF is_correct THEN
          v_correct_count := v_correct_count + 1;
        END IF;
      END IF;
      
      updated_answers := updated_answers || jsonb_build_object(
        'question_number', ans.value->>'question_number',
        'question_type', ans.value->>'question_type',
        'word', ans.value->>'word',
        'meaning', ans.value->>'meaning',
        'student_answer', ans.value->'student_answer',
        'correct_answer', ans.value->'correct_answer',
        'is_correct', is_correct
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
SELECT * FROM regrade_exam_submissions();