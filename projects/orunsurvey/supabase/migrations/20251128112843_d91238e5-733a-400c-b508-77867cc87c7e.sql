-- Add columns for each question ID to store responses
ALTER TABLE survey_responses 
  ADD COLUMN "8ded2532-4d0e-4afe-8ad8-bfbb1ec6542c" text,
  ADD COLUMN "e89e505d-027e-4a75-8240-d1ef53ef849a" text,
  ADD COLUMN "7c49fdca-ceb9-4edf-abc3-a43f7d8189a4" jsonb,
  ADD COLUMN "88aec870-d8e9-4a1c-a56b-2891ee23c4c9" text;

-- Migrate existing data to new columns
UPDATE survey_responses 
SET 
  "8ded2532-4d0e-4afe-8ad8-bfbb1ec6542c" = join_class,
  "e89e505d-027e-4a75-8240-d1ef53ef849a" = exam_type,
  "7c49fdca-ceb9-4edf-abc3-a43f7d8189a4" = time_slots,
  "88aec870-d8e9-4a1c-a56b-2891ee23c4c9" = additional_comments
WHERE survey_id = 'f03882b2-2bf8-4381-8750-c3d99d182e2b';