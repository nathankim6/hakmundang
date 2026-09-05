-- Fix incorrect total_score for 정서영9519
-- Correct calculation: 49 + 28 + 48 + 23 = 148

UPDATE level_test_results 
SET total_score = 148
WHERE id = '4a675611-e160-48e4-8a8b-6f106d2beee1';