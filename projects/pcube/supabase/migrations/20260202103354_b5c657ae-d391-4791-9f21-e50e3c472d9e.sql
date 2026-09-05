-- 학교 테이블
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 학년 테이블
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 학생 테이블
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_phone TEXT,
  parent_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 지문 테이블
CREATE TABLE public.passages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sentences TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 숙제 테이블
CREATE TABLE public.homework (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('recording', 'photo', 'both')),
  passage_id UUID REFERENCES public.passages(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('grade', 'student')),
  target_grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE,
  target_student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 숙제 제출 테이블
CREATE TABLE public.homework_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  homework_id UUID NOT NULL REFERENCES public.homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  recording_url TEXT,
  recording_timestamps JSONB,
  photo_urls TEXT[] DEFAULT '{}',
  teacher_note TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (접속코드 기반 인증이므로 모든 인증된 사용자가 접근 가능)
CREATE POLICY "Authenticated users can read schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert schools" ON public.schools FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update schools" ON public.schools FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete schools" ON public.schools FOR DELETE USING (true);

CREATE POLICY "Authenticated users can read grades" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert grades" ON public.grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update grades" ON public.grades FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete grades" ON public.grades FOR DELETE USING (true);

CREATE POLICY "Authenticated users can read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete students" ON public.students FOR DELETE USING (true);

CREATE POLICY "Authenticated users can read passages" ON public.passages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert passages" ON public.passages FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update passages" ON public.passages FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete passages" ON public.passages FOR DELETE USING (true);

CREATE POLICY "Authenticated users can read homework" ON public.homework FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert homework" ON public.homework FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update homework" ON public.homework FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete homework" ON public.homework FOR DELETE USING (true);

CREATE POLICY "Authenticated users can read submissions" ON public.homework_submissions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert submissions" ON public.homework_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update submissions" ON public.homework_submissions FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete submissions" ON public.homework_submissions FOR DELETE USING (true);

-- 인덱스 추가
CREATE INDEX idx_grades_school ON public.grades(school_id);
CREATE INDEX idx_students_grade ON public.students(grade_id);
CREATE INDEX idx_homework_passage ON public.homework(passage_id);
CREATE INDEX idx_homework_target_grade ON public.homework(target_grade_id);
CREATE INDEX idx_homework_target_student ON public.homework(target_student_id);
CREATE INDEX idx_submissions_homework ON public.homework_submissions(homework_id);
CREATE INDEX idx_submissions_student ON public.homework_submissions(student_id);
CREATE INDEX idx_submissions_status ON public.homework_submissions(status);