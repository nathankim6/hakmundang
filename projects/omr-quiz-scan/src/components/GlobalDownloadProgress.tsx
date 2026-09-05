import React, { useEffect, useState } from 'react';
import DownloadProgressOverlay from './DownloadProgressOverlay';
import { DOWNLOAD_PROGRESS_EVENT, DownloadProgressEvent } from '@/utils/backgroundTask';

const GlobalDownloadProgress: React.FC = () => {
  const [state, setState] = useState<DownloadProgressEvent>({
    visible: false, current: 0, total: 0,
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<DownloadProgressEvent>).detail;
      setState(detail);
      if (detail.done) {
        // 자동 4초 후 숨김
        setTimeout(() => setState((s) => ({ ...s, visible: false, done: false })), 4000);
      }
    };
    window.addEventListener(DOWNLOAD_PROGRESS_EVENT, handler as EventListener);
    return () => window.removeEventListener(DOWNLOAD_PROGRESS_EVENT, handler as EventListener);
  }, []);

  return (
    <DownloadProgressOverlay
      visible={state.visible}
      current={state.current}
      total={state.total}
      title={state.title}
      subtitle={state.subtitle}
      onAbort={state.onAbort}
      done={state.done}
    />
  );
};

export default GlobalDownloadProgress;