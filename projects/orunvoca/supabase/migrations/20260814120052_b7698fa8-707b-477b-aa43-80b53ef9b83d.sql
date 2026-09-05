UPDATE public.card_sets SET title = '성남고1 단어장 (파생어포함)', include_derivatives = true, updated_at = now() WHERE id = 'a6d3c66b-e833-455e-95c2-ae9b648b9ccc';

INSERT INTO public.card_sets (title, description, created_by, test_type, include_derivatives, selected_days, available_test_modes, image_url, word_data)
SELECT '성남고1 단어장 (표제어만)', c.description, c.created_by, c.test_type, false, c.selected_days, c.available_test_modes, c.image_url,
  (
    SELECT COALESCE(jsonb_agg(jsonb_set(e, '{number}', to_jsonb(rn)) ORDER BY d_ord, rn), '[]'::jsonb)
    FROM (
      SELECT e,
             row_number() OVER (PARTITION BY e->>'day' ORDER BY (e->>'number')::int) AS rn,
             (e->>'day') AS d_ord
      FROM jsonb_array_elements(c.word_data) e
      WHERE e ? 'example'
    ) s
  )
FROM public.card_sets c WHERE c.id = 'a6d3c66b-e833-455e-95c2-ae9b648b9ccc';