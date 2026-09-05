-- 기존 정책 삭제 후 새로 생성
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications; 
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow all to insert notifications" ON public.notifications;

-- notifications 테이블의 RLS 활성화
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 알림을 생성할 수 있도록 허용 (태스크 트리거에서 사용)
CREATE POLICY "Allow all to insert notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- 모든 사용자가 알림을 볼 수 있도록 허용 (개발용)
CREATE POLICY "Allow all to view notifications" ON public.notifications
FOR SELECT USING (true);

-- 모든 사용자가 알림을 수정할 수 있도록 허용 (개발용)
CREATE POLICY "Allow all to update notifications" ON public.notifications
FOR UPDATE USING (true);

-- 모든 사용자가 알림을 삭제할 수 있도록 허용 (개발용)  
CREATE POLICY "Allow all to delete notifications" ON public.notifications
FOR DELETE USING (true);