-- Delete word_quiz_cache entries where quiz_type is 'meaning' and wrong_choices contain English words
-- This uses a pattern to detect entries with English alphabet sequences (3+ letters)
DELETE FROM word_quiz_cache 
WHERE quiz_type = 'meaning' 
AND wrong_choices::text ~ '[a-zA-Z]{3,}';