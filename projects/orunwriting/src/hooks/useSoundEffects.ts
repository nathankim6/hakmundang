import { useCallback, useRef } from 'react';

// Create audio context lazily to avoid issues
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export function useSoundEffects() {
  const isPlayingRef = useRef(false);

  const playCorrectSound = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Happy ascending arpeggio
      const now = ctx.currentTime;
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
      oscillator.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.4, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      oscillator.start(now);
      oscillator.stop(now + 0.5);

      // Add a second oscillator for harmony
      const oscillator2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();
      oscillator2.connect(gainNode2);
      gainNode2.connect(ctx.destination);

      oscillator2.type = 'triangle';
      oscillator2.frequency.setValueAtTime(392.00, now); // G4
      oscillator2.frequency.setValueAtTime(493.88, now + 0.1); // B4
      oscillator2.frequency.setValueAtTime(587.33, now + 0.2); // D5
      oscillator2.frequency.setValueAtTime(783.99, now + 0.3); // G5

      gainNode2.gain.setValueAtTime(0.2, now);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      oscillator2.start(now);
      oscillator2.stop(now + 0.5);

      setTimeout(() => {
        isPlayingRef.current = false;
      }, 500);
    } catch (e) {
      isPlayingRef.current = false;
      console.log('Audio not available');
    }
  }, []);

  const playWrongSound = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;
      
      // Descending minor second - classic "wrong" sound
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(311.13, now); // Eb4
      oscillator.frequency.setValueAtTime(293.66, now + 0.15); // D4

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);

      setTimeout(() => {
        isPlayingRef.current = false;
      }, 300);
    } catch (e) {
      isPlayingRef.current = false;
      console.log('Audio not available');
    }
  }, []);

  return { playCorrectSound, playWrongSound };
}
