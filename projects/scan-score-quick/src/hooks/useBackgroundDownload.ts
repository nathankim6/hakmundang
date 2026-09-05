import { useCallback, useEffect, useRef } from 'react';

/**
 * 백그라운드 일괄 다운로드를 위한 훅:
 * - Screen Wake Lock 으로 화면 잠금/스로틀링 최소화
 * - 브라우저 알림 권한 사전 요청
 * - 다운로드 완료시 데스크톱 알림 발송
 */
export function useBackgroundDownload() {
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    // 알림 권한 미리 요청 (사용자 액션 없이도 일부 브라우저에서 동작)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // 사용자에게 부담 없이 첫 마운트시 한번 요청
        try { Notification.requestPermission().catch(() => {}); } catch {}
      }
    }
  }, []);

  const acquireWakeLock = useCallback(async () => {
    try {
      // @ts-ignore
      if (navigator.wakeLock?.request) {
        // @ts-ignore
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current?.addEventListener?.('release', () => {
          wakeLockRef.current = null;
        });
      }
    } catch (e) {
      console.warn('WakeLock unavailable', e);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release?.();
        wakeLockRef.current = null;
      }
    } catch {}
  }, []);

  // 탭이 다시 활성화될 때 wake lock 재획득
  useEffect(() => {
    const onVisibility = async () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
        // 외부에서 다운로드 진행 중이면 다시 잡도록 호출자가 결정
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const notify = useCallback((title: string, body: string) => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const n = new Notification(title, { body, icon: '/favicon.ico' });
          n.onclick = () => { window.focus(); n.close(); };
          return;
        }
        if (Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              const n = new Notification(title, { body, icon: '/favicon.ico' });
              n.onclick = () => { window.focus(); n.close(); };
            }
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Notification failed', e);
    }
  }, []);

  return { acquireWakeLock, releaseWakeLock, notify };
}