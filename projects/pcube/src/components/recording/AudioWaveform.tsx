import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

interface AudioWaveformProps {
  audioBlob: Blob | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReady?: () => void;
}

export function AudioWaveform({ audioBlob, isPlaying, onPlayPause, onReady }: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !audioBlob) return;

    // 기존 인스턴스 정리
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#f97316",
      progressColor: "#ea580c",
      cursorColor: "#fff",
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 60,
      normalize: true,
    });

    wavesurfer.on("ready", () => {
      onReady?.();
    });

    wavesurfer.on("finish", () => {
      onPlayPause();
    });

    // Blob을 로드
    const url = URL.createObjectURL(audioBlob);
    wavesurfer.load(url);

    wavesurferRef.current = wavesurfer;

    return () => {
      URL.revokeObjectURL(url);
      wavesurfer.destroy();
    };
  }, [audioBlob]);

  useEffect(() => {
    if (!wavesurferRef.current) return;

    if (isPlaying) {
      wavesurferRef.current.play();
    } else {
      wavesurferRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div 
      ref={containerRef} 
      className="w-full bg-karaoke-text/10 rounded-xl p-2 cursor-pointer"
      onClick={onPlayPause}
    />
  );
}
