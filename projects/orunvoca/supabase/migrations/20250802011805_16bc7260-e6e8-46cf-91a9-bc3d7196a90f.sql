-- word_quiz_cache 테이블에 UPDATE/DELETE 권한 추가
DROP POLICY IF EXISTS "Allow anyone to update word quiz cache" ON word_quiz_cache;
DROP POLICY IF EXISTS "Allow anyone to delete word quiz cache" ON word_quiz_cache;

CREATE POLICY "Allow anyone to update word quiz cache" 
ON word_quiz_cache 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow anyone to delete word quiz cache" 
ON word_quiz_cache 
FOR DELETE 
USING (true);