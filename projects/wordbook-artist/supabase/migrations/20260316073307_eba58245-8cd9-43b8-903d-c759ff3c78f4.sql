
-- Move supply from benefit's group (sort_order 9) to demand's group (after demanding at 42)
-- Step 1: Shift words at sort_order 10-42 down by 1 (fill the gap left by supply)
UPDATE words SET sort_order = sort_order - 1
WHERE day_group_id = (
  SELECT dg.id FROM day_groups dg 
  WHERE dg.workbook_id = '2ba8fb56-c7b0-4fe5-af65-3f63dcf20a9a' AND dg.day_name = 'DAY 02'
)
AND sort_order > 9 AND sort_order <= 42
AND id != '611e3b13-8259-4cf7-aa42-ffc76744d705';

-- Step 2: Move supply to sort_order 42 (after demanding which is now at 41)
UPDATE words SET sort_order = 42
WHERE id = '611e3b13-8259-4cf7-aa42-ffc76744d705';
