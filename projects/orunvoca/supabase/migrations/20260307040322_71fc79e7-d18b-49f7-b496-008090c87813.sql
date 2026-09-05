-- Delete cached entries that have comma-separated combined meanings in choices or correct_answers
-- These will be regenerated with proper splitting
DELETE FROM word_quiz_cache 
WHERE id IN (
  SELECT wqc.id FROM word_quiz_cache wqc,
  LATERAL jsonb_array_elements_text(wqc.correct_answers) AS ca
  WHERE ca LIKE '%, %' 
    AND ca NOT LIKE '~%'
    AND ca NOT LIKE '%(%)%'
);