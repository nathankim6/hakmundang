-- Add available_test_modes column to card_sets table
ALTER TABLE card_sets 
ADD COLUMN available_test_modes text[] DEFAULT ARRAY['meaning', 'spelling', 'definition', 'reverse', 'example', 'sentence']::text[];

-- Update existing records to have all test modes available by default
UPDATE card_sets 
SET available_test_modes = ARRAY['meaning', 'spelling', 'definition', 'reverse', 'example', 'sentence']::text[]
WHERE available_test_modes IS NULL;