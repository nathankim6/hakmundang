-- Swap day_groups between ORUN VOCA 7 and ORUN VOCA 8
-- Temporarily disable FK constraint, use temp workbook approach
DO $$
DECLARE
  voca7_id uuid := '67fdf381-c57c-4a4b-ac4c-1168bf525ea9';
  voca8_id uuid := '77acfda8-11b2-40b1-9a1b-878e34fe6fa8';
  temp_id uuid;
BEGIN
  -- Create a temporary workbook to hold data
  INSERT INTO workbooks (id, title) VALUES (gen_random_uuid(), '_temp_swap') RETURNING id INTO temp_id;
  
  -- Move VOCA 7 day_groups to temp
  UPDATE day_groups SET workbook_id = temp_id WHERE workbook_id = voca7_id;
  -- Move VOCA 8 day_groups to VOCA 7
  UPDATE day_groups SET workbook_id = voca7_id WHERE workbook_id = voca8_id;
  -- Move temp (original VOCA 7) to VOCA 8
  UPDATE day_groups SET workbook_id = voca8_id WHERE workbook_id = temp_id;
  
  -- Delete temp workbook
  DELETE FROM workbooks WHERE id = temp_id;
END $$;