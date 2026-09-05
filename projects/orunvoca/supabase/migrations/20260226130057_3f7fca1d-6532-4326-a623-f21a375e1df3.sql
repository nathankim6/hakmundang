
-- Fix ORUN VOCA 5: swap word/meaning for 4 entries where word field contains Korean
UPDATE card_sets
SET word_data = (
  SELECT jsonb_agg(
    CASE 
      WHEN (elem->>'number')::int = 1185 
        THEN jsonb_set(jsonb_set(elem, '{word}', '"issue"'), '{meaning}', '"발행하다, 발급하다, 나오다"')
      WHEN (elem->>'number')::int = 1186 
        THEN jsonb_set(jsonb_set(elem, '{word}', '"meditate"'), '{meaning}', '"명상하다, 묵상하다"')
      WHEN (elem->>'number')::int = 1187 
        THEN jsonb_set(jsonb_set(elem, '{word}', '"reason"'), '{meaning}', '"이유, 변명, 이성, 추론하다, 생각하다"')
      WHEN (elem->>'number')::int = 1188 
        THEN jsonb_set(jsonb_set(elem, '{word}', '"even"'), '{meaning}', '"평평한, 수평의, 짝수의, 공정한, 공평한, 심지어, ~조차, 훨씬"')
      ELSE elem
    END
    ORDER BY (elem->>'number')::int
  )
  FROM jsonb_array_elements(word_data) elem
),
updated_at = now()
WHERE id = 'f80f5428-0e57-414d-8212-1430ea3b1e7c';
