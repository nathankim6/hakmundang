
-- Drop all existing permissive write policies and replace with auth-required ones

-- WORKBOOKS
DROP POLICY IF EXISTS "Anyone can create workbooks" ON public.workbooks;
DROP POLICY IF EXISTS "Anyone can update workbooks" ON public.workbooks;
DROP POLICY IF EXISTS "Anyone can delete workbooks" ON public.workbooks;
DROP POLICY IF EXISTS "Anyone can view workbooks" ON public.workbooks;

CREATE POLICY "Authenticated users can create workbooks" ON public.workbooks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update workbooks" ON public.workbooks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete workbooks" ON public.workbooks FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anyone can view workbooks" ON public.workbooks FOR SELECT USING (true);

-- DAY_GROUPS
DROP POLICY IF EXISTS "Anyone can create day_groups" ON public.day_groups;
DROP POLICY IF EXISTS "Anyone can delete day_groups" ON public.day_groups;
DROP POLICY IF EXISTS "Anyone can view day_groups" ON public.day_groups;

CREATE POLICY "Authenticated users can create day_groups" ON public.day_groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update day_groups" ON public.day_groups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete day_groups" ON public.day_groups FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anyone can view day_groups" ON public.day_groups FOR SELECT USING (true);

-- WORDS
DROP POLICY IF EXISTS "Anyone can create words" ON public.words;
DROP POLICY IF EXISTS "Anyone can delete words" ON public.words;
DROP POLICY IF EXISTS "Anyone can view words" ON public.words;

CREATE POLICY "Authenticated users can create words" ON public.words FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update words" ON public.words FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete words" ON public.words FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anyone can view words" ON public.words FOR SELECT USING (true);

-- WORD_EXAMPLES
DROP POLICY IF EXISTS "Anyone can create word_examples" ON public.word_examples;
DROP POLICY IF EXISTS "Anyone can delete word_examples" ON public.word_examples;
DROP POLICY IF EXISTS "Anyone can view word_examples" ON public.word_examples;

CREATE POLICY "Authenticated users can create word_examples" ON public.word_examples FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update word_examples" ON public.word_examples FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete word_examples" ON public.word_examples FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anyone can view word_examples" ON public.word_examples FOR SELECT USING (true);

-- ORGANIZED_VOCAB_PROJECTS
DROP POLICY IF EXISTS "Anyone can create organized_vocab_projects" ON public.organized_vocab_projects;
DROP POLICY IF EXISTS "Anyone can update organized_vocab_projects" ON public.organized_vocab_projects;
DROP POLICY IF EXISTS "Anyone can delete organized_vocab_projects" ON public.organized_vocab_projects;
DROP POLICY IF EXISTS "Anyone can view organized_vocab_projects" ON public.organized_vocab_projects;

CREATE POLICY "Authenticated users can create organized_vocab_projects" ON public.organized_vocab_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update organized_vocab_projects" ON public.organized_vocab_projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete organized_vocab_projects" ON public.organized_vocab_projects FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anyone can view organized_vocab_projects" ON public.organized_vocab_projects FOR SELECT USING (true);

-- ORGANIZED_VOCAB_WORDS
DROP POLICY IF EXISTS "Anyone can create organized_vocab_words" ON public.organized_vocab_words;
DROP POLICY IF EXISTS "Anyone can update organized_vocab_words" ON public.organized_vocab_words;
DROP POLICY IF EXISTS "Anyone can delete organized_vocab_words" ON public.organized_vocab_words;
DROP POLICY IF EXISTS "Anyone can view organized_vocab_words" ON public.organized_vocab_words;

CREATE POLICY "Authenticated users can create organized_vocab_words" ON public.organized_vocab_words FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update organized_vocab_words" ON public.organized_vocab_words FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete organized_vocab_words" ON public.organized_vocab_words FOR DELETE TO authenticated USING (true);
CREATE POLICY "Anyone can view organized_vocab_words" ON public.organized_vocab_words FOR SELECT USING (true);
