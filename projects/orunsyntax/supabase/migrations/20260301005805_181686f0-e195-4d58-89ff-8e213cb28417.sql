UPDATE public.exam_questions 
SET 
  answer = '⑤',
  translation = '내가 어린 소녀였을 때, 내 방은 항상 엉망이었다. 어머니는 "가서 방 치워!"라고 나에게 말씀하시며 내가 방을 정돈하게 하려고 항상 노력하셨다. 나는 그때마다 어머니에게 저항했다. 나는 무엇을 하라고 말을 듣는 것이 싫었다. 나는 단호히 내가 원하는 방식으로 방을 두었다. 내가 어질러진 방에서 지내는 것을 좋아하느냐 아니냐는 전적으로 다른 문제였다. 나는 깨끗한 방을 갖는 것의 이점들에 대해 멈추어서 생각해본 적이 결코 없었다. 나에게는, 내 방식대로 하는 것이 더 중요했다. 그리고 대부분의 다른 부모님들처럼, 어머니는 내가 그 이점들을 혼자 힘으로 깨닫도록 하지 않았다. 대신에 그녀는 잔소리를 선택했다.',
  vocabulary = '[{"word":"straighten it up","meaning":"정돈하다"},{"word":"at every opportunity","meaning":"그때마다"},{"word":"resist","meaning":"저항하다"},{"word":"determined","meaning":"단호한"},{"word":"the way","meaning":"~한 방식으로"},{"word":"benefit","meaning":"혜택"},{"word":"get my own way","meaning":"내방식대로 하다"},{"word":"for oneself","meaning":"혼자서"},{"word":"lecture","meaning":"잔소리하다"}]'::jsonb,
  updated_at = now()
WHERE workbook_id = 'weekly-g10' AND question_id = 6;