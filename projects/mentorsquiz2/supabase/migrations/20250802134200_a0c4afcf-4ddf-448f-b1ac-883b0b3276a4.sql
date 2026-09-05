-- 어법워크북용 샘플 데이터 추가
INSERT INTO incorrect_options (correct_text, incorrect_text, usage_count) VALUES
('interested', 'interesting', 15),
('is', 'are', 12),
('summed', 'summing', 10),
('ranks', 'rank', 8),
('which', 'that', 7),
('to deliver', 'delivering', 6),
('increase', 'increasing', 5),
('Although', 'Despite', 4),
('generate', 'generating', 3),
('delicate', 'delicately', 2)
ON CONFLICT (correct_text, incorrect_text) DO UPDATE SET
usage_count = EXCLUDED.usage_count;