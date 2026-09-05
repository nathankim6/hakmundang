ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS campus text,
  ADD COLUMN IF NOT EXISTS class_name text,
  ADD COLUMN IF NOT EXISTS full_name text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare fallback_name text;
begin
  fallback_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    nullif(split_part(new.email, '@', 1), ''),
    '공부친구'
  );
  insert into public.profiles (id, display_name, avatar_emoji, campus, class_name, full_name)
  values (
    new.id,
    fallback_name,
    coalesce(new.raw_user_meta_data->>'avatar_emoji', '🐻'),
    new.raw_user_meta_data->>'campus',
    new.raw_user_meta_data->>'class_name',
    new.raw_user_meta_data->>'full_name'
  );
  insert into public.subjects (user_id, name, color) values
    (new.id, '수학', 'pink'),
    (new.id, '영어', 'blue'),
    (new.id, '한국사', 'green'),
    (new.id, '물리', 'yellow');
  return new;
end;
$function$;