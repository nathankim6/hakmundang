
UPDATE tests
SET writing_questions = jsonb_set(
  writing_questions::jsonb,
  '{16}',
  '{
    "korean": "셰익스피어는 온 세상이 무대이고 우리는 그 안의 배우들일 뿐이라고 말했다",
    "english": "Shakespeare said that all the world is a stage and we are just actors in it",
    "arrangeWords": ["Shakespeare", "said", "that", "all", "the", "world", "is", "a", "stage", "and", "we", "are", "just", "actors", "in", "it"]
  }'::jsonb
)
WHERE test_id = '123123123';
