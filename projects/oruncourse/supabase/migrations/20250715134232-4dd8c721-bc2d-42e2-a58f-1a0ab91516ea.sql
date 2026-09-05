-- 강의 정보를 저장할 테이블 생성
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  grade TEXT NOT NULL CHECK (grade IN ('elementary', 'middle', 'high')),
  fee INTEGER NOT NULL,
  schedule TEXT NOT NULL,
  poster TEXT,
  instructor TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  enrolled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 활성화
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 강의를 볼 수 있도록 허용
CREATE POLICY "Anyone can view courses" 
ON public.courses 
FOR SELECT 
USING (true);

-- 관리자만 강의를 생성/수정/삭제할 수 있도록 허용 (일단 모든 사용자에게 허용)
CREATE POLICY "Anyone can create courses" 
ON public.courses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update courses" 
ON public.courses 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete courses" 
ON public.courses 
FOR DELETE 
USING (true);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 초기 샘플 데이터 삽입
INSERT INTO public.courses (title, description, grade, fee, schedule, instructor, capacity, enrolled) VALUES 
('초등 수학 기초반', '초등학생을 위한 기초 수학 수업입니다. 재미있는 활동과 함께 수학의 기본기를 다집니다.', 'elementary', 150000, '월, 수, 금 16:00-17:30', '김선생님', 15, 8),
('중등 영어 회화반', '중학생 대상 영어 회화 수업입니다. 실생활 영어 표현을 중심으로 학습합니다.', 'middle', 200000, '화, 목 18:00-19:30', '이선생님', 12, 5),
('고등 물리 심화반', '고등학생을 위한 물리 심화 과정입니다. 대학 입시를 준비하는 학생들에게 적합합니다.', 'high', 300000, '토, 일 14:00-16:00', '박선생님', 10, 7);