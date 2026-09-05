
-- 태그(그룹) 테이블
CREATE TABLE public.student_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  owner_code_id UUID REFERENCES public.access_codes(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 학생-태그 매핑 테이블
CREATE TABLE public.student_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.student_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, tag_id)
);

-- RLS 활성화
ALTER TABLE public.student_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_tag_assignments ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Anyone can read student_tags" ON public.student_tags FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert student_tags" ON public.student_tags FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update student_tags" ON public.student_tags FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete student_tags" ON public.student_tags FOR DELETE TO public USING (true);

CREATE POLICY "Anyone can read student_tag_assignments" ON public.student_tag_assignments FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert student_tag_assignments" ON public.student_tag_assignments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can delete student_tag_assignments" ON public.student_tag_assignments FOR DELETE TO public USING (true);
