
-- Enable RLS on all tables that currently have it disabled
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descriptive_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veritas_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_contents ENABLE ROW LEVEL SECURITY;

-- Add permissive policies for these tables (app uses anon key without Supabase auth)
-- SELECT policies - allow read access (app needs this to function)
CREATE POLICY "Allow read access" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.chat_participants FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.chat_rooms FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.descriptive_scores FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.manual_classes FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.mock_test_scores FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.report_cards FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.school_logos FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.section_titles FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.teacher_comments FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.teacher_photos FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.veritas_access_codes FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.weekly_contents FOR SELECT USING (true);

-- INSERT policies
CREATE POLICY "Allow insert" ON public.attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.chat_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.chat_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.descriptive_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.manual_classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.mock_test_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.report_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.school_logos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.section_titles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.teacher_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.teacher_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.veritas_access_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.weekly_contents FOR INSERT WITH CHECK (true);

-- UPDATE policies
CREATE POLICY "Allow update" ON public.attendance_records FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.chat_participants FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.chat_rooms FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.descriptive_scores FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.manual_classes FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.mock_test_scores FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.report_cards FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.school_logos FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.section_titles FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.teacher_comments FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.teacher_photos FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.veritas_access_codes FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON public.weekly_contents FOR UPDATE USING (true);

-- DELETE policies
CREATE POLICY "Allow delete" ON public.attendance_records FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.chat_participants FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.chat_rooms FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.descriptive_scores FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.events FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.manual_classes FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.messages FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.mock_test_scores FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.report_cards FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.school_logos FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.section_titles FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.teacher_comments FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.teacher_photos FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.veritas_access_codes FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON public.weekly_contents FOR DELETE USING (true);
