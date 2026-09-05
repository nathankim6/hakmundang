-- 학생이 추가될 때 자동으로 액세스 코드 생성하는 함수
CREATE OR REPLACE FUNCTION public.auto_create_student_access_code()
RETURNS TRIGGER AS $$
DECLARE
  new_access_code TEXT;
BEGIN
  -- 8자리 랜덤 액세스 코드 생성
  new_access_code := public.generate_random_access_code(8);
  
  -- 학생 액세스 코드 생성
  INSERT INTO public.student_access_codes (
    student_id,
    access_code,
    is_active
  ) VALUES (
    NEW.id,
    new_access_code,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 학생이 삭제될 때 자동으로 액세스 코드 삭제하는 함수
CREATE OR REPLACE FUNCTION public.auto_delete_student_access_code()
RETURNS TRIGGER AS $$
BEGIN
  -- 해당 학생의 액세스 코드 삭제
  DELETE FROM public.student_access_codes 
  WHERE student_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 학생 추가 시 액세스 코드 자동 생성 트리거
CREATE TRIGGER trigger_auto_create_access_code
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_student_access_code();

-- 학생 삭제 시 액세스 코드 자동 삭제 트리거
CREATE TRIGGER trigger_auto_delete_access_code
  BEFORE DELETE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_delete_student_access_code();