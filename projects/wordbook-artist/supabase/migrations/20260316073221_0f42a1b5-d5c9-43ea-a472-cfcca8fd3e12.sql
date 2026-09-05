
-- Move humble from eventually's group to proud's group in DAY 02
-- Step 1: Shift words at sort_order 55-88 up by 1 to make room
UPDATE words SET sort_order = sort_order + 1
WHERE day_group_id = (
  SELECT dg.id FROM day_groups dg 
  WHERE dg.workbook_id = '2ba8fb56-c7b0-4fe5-af65-3f63dcf20a9a' AND dg.day_name = 'DAY 02'
)
AND sort_order >= 55 AND sort_order < 89
AND id != 'f5ced8b8-41f3-4743-9927-de41dc758957';

-- Step 2: Move humble to sort_order 55 (right after pride at 54)
UPDATE words SET sort_order = 55
WHERE id = 'f5ced8b8-41f3-4743-9927-de41dc758957';
