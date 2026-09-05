
CREATE TABLE public.photo_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES public.study_photos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (photo_id, user_id)
);
CREATE INDEX idx_photo_likes_photo ON public.photo_likes(photo_id);
GRANT SELECT, INSERT, DELETE ON public.photo_likes TO authenticated;
GRANT ALL ON public.photo_likes TO service_role;
ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes viewable by authenticated" ON public.photo_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own likes" ON public.photo_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own likes" ON public.photo_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.photo_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES public.study_photos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_photo_comments_photo ON public.photo_comments(photo_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photo_comments TO authenticated;
GRANT ALL ON public.photo_comments TO service_role;
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by authenticated" ON public.photo_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own comments" ON public.photo_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own comments" ON public.photo_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Delete own comments" ON public.photo_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
