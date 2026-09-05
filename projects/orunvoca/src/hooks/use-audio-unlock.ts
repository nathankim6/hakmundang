import { useEffect } from 'react';
import { initializeAudioContext } from '@/utils/sound-effects';

export function useAudioUnlock() {
  useEffect(() => {
    const unlock = () => {
      try {
        const ctx = initializeAudioContext();
        if (!ctx) return;
        // Play a tiny silent buffer to unlock iOS audio
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch {}
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('click', unlock, { once: true });
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
  }, []);
}
