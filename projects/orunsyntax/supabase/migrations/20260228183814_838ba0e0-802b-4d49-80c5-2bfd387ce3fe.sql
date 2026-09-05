UPDATE exam_questions 
SET question_prompt = '글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?||But, as the earth''s surface is curved, there is a path that looks curved and hence longer on a flat map, but which is actually shorter.'
WHERE workbook_id = 'weekly-g10' AND question_id = 4;