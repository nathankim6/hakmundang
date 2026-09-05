
CREATE OR REPLACE FUNCTION public.load_workbook_data(p_workbook_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'workbook', (
      SELECT row_to_json(wb.*)
      FROM workbooks wb
      WHERE wb.id = p_workbook_id
    ),
    'day_groups', COALESCE((
      SELECT json_agg(dg_row ORDER BY dg_row.sort_order)
      FROM (
        SELECT dg.id, dg.day_name, dg.sort_order,
          COALESCE((
            SELECT json_agg(w_row ORDER BY w_row.sort_order)
            FROM (
              SELECT w.id, w.word, w.meaning, w.pronunciation, w.part_of_speech,
                     w.sort_order, w.synonyms, w.antonyms, w.synonyms_korean, w.antonyms_korean,
                     w.english_definition, w.etymology, w.image_url,
                     COALESCE((
                       SELECT json_agg(ex_row ORDER BY ex_row.sort_order)
                       FROM (
                         SELECT we.english, we.korean, we.sort_order
                         FROM word_examples we
                         WHERE we.word_id = w.id
                         ORDER BY we.sort_order
                       ) ex_row
                     ), '[]'::json) AS examples
              FROM words w
              WHERE w.day_group_id = dg.id
              ORDER BY w.sort_order
            ) w_row
          ), '[]'::json) AS words
        FROM day_groups dg
        WHERE dg.workbook_id = p_workbook_id
        ORDER BY dg.sort_order
      ) dg_row
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;
