
-- 문제별 코멘트 + 사진을 저장하는 테이블
CREATE TABLE public.problem_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.report_cards(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  comment TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (report_id, problem_id)
);

CREATE INDEX idx_problem_comments_report_id ON public.problem_comments(report_id);

ALTER TABLE public.problem_comments ENABLE ROW LEVEL SECURITY;

-- 기존 리포트 테이블 정책과 동일하게 누구나 접근 가능
CREATE POLICY "Anyone can view problem comments"
ON public.problem_comments FOR SELECT USING (true);

CREATE POLICY "Anyone can insert problem comments"
ON public.problem_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update problem comments"
ON public.problem_comments FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete problem comments"
ON public.problem_comments FOR DELETE USING (true);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_problem_comments_updated_at
BEFORE UPDATE ON public.problem_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 사진 업로드용 스토리지 버킷 (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('problem-comment-photos', 'problem-comment-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view problem comment photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'problem-comment-photos');

CREATE POLICY "Anyone can upload problem comment photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'problem-comment-photos');

CREATE POLICY "Anyone can update problem comment photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'problem-comment-photos');

CREATE POLICY "Anyone can delete problem comment photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'problem-comment-photos');
