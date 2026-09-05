-- 1. homework 테이블의 passage_id에 ON DELETE CASCADE 추가
ALTER TABLE homework 
DROP CONSTRAINT IF EXISTS homework_passage_id_fkey;

ALTER TABLE homework 
ADD CONSTRAINT homework_passage_id_fkey 
FOREIGN KEY (passage_id) 
REFERENCES passages(id) 
ON DELETE CASCADE;

-- 2. homework_submissions 테이블의 homework_id에 ON DELETE CASCADE 추가
ALTER TABLE homework_submissions 
DROP CONSTRAINT IF EXISTS homework_submissions_homework_id_fkey;

ALTER TABLE homework_submissions 
ADD CONSTRAINT homework_submissions_homework_id_fkey 
FOREIGN KEY (homework_id) 
REFERENCES homework(id) 
ON DELETE CASCADE;

-- 3. deadline_extensions 테이블의 homework_id에 ON DELETE CASCADE 추가
ALTER TABLE deadline_extensions 
DROP CONSTRAINT IF EXISTS deadline_extensions_homework_id_fkey;

ALTER TABLE deadline_extensions 
ADD CONSTRAINT deadline_extensions_homework_id_fkey 
FOREIGN KEY (homework_id) 
REFERENCES homework(id) 
ON DELETE CASCADE;