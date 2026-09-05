-- student_test_history 테이블의 RLS 정책을 모든 사용자가 읽기/쓰기 가능하도록 수정
DROP POLICY IF EXISTS "No delete allowed for student_test_history" ON public.student_test_history;

-- 모든 사용자가 student_test_history를 읽을 수 있도록 허용
CREATE POLICY "Enable read access for all users" 
ON public.student_test_history 
FOR SELECT 
USING (true);

-- 모든 사용자가 student_test_history를 삽입할 수 있도록 허용
CREATE POLICY "Enable insert for all users" 
ON public.student_test_history 
FOR INSERT 
WITH CHECK (true);

-- 모든 사용자가 student_test_history를 업데이트할 수 있도록 허용
CREATE POLICY "Enable update for all users" 
ON public.student_test_history 
FOR UPDATE 
USING (true);

-- 삭제는 여전히 제한 (기존 정책 유지)
CREATE POLICY "No delete allowed for student_test_history" 
ON public.student_test_history 
FOR DELETE 
USING (false);