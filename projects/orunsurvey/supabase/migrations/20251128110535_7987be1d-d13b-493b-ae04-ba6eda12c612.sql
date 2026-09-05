-- Add basic_fields column to surveys table to store customizable basic info fields
ALTER TABLE public.surveys
ADD COLUMN basic_fields jsonb DEFAULT '[
  {"id": "school", "label": "학교", "type": "text", "required": true, "placeholder": "학교명을 입력하세요"},
  {"id": "name", "label": "이름", "type": "text", "required": true, "placeholder": "이름을 입력하세요"}
]'::jsonb;