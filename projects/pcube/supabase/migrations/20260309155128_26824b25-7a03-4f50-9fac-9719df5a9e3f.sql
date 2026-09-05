-- 기존 지문 중 homework가 없는 것들에 대해 homework + submissions 일괄 생성
DO $$
DECLARE
  p RECORD;
  hw_id uuid;
  s RECORD;
BEGIN
  FOR p IN 
    SELECT id, title, grade_id, owner_code_id 
    FROM passages 
    WHERE NOT EXISTS (SELECT 1 FROM homework h WHERE h.passage_id = passages.id)
  LOOP
    -- homework 생성
    INSERT INTO homework (title, type, target_type, target_grade_id, passage_id, due_date, owner_code_id)
    VALUES ('녹음 과제: ' || p.title, 'rt_review', 'grade', p.grade_id, p.id, NULL, p.owner_code_id)
    RETURNING id INTO hw_id;
    
    -- 해당 학년의 모든 학생에게 submissions 생성
    FOR s IN SELECT id FROM students WHERE grade_id = p.grade_id
    LOOP
      INSERT INTO homework_submissions (homework_id, student_id, status)
      VALUES (hw_id, s.id, 'pending');
    END LOOP;
  END LOOP;
END $$;