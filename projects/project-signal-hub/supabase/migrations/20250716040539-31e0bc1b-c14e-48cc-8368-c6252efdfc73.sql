-- notifications 테이블의 RLS 활성화 및 정책 설정
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 알림을 생성할 수 있도록 허용 (태스크 트리거에서 사용)
CREATE POLICY "Allow all to insert notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- 알림 수신자만 자신의 알림을 볼 수 있도록 허용
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (
  recipient_id IS NULL OR 
  recipient_id::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);

-- 알림 소유자만 자신의 알림을 수정할 수 있도록 허용
CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (
  recipient_id IS NULL OR 
  recipient_id::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);

-- 알림 소유자만 자신의 알림을 삭제할 수 있도록 허용
CREATE POLICY "Users can delete their own notifications" ON public.notifications
FOR DELETE USING (
  recipient_id IS NULL OR 
  recipient_id::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
);