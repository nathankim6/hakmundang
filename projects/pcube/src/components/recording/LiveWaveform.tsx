import { useEffect, useRef } from "react";

interface LiveWaveformProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  isPaused: boolean;
}

export function LiveWaveform({ analyser, isRecording, isPaused }: LiveWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !analyser || !isRecording || isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording || isPaused) return;

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // 캔버스 크기 설정
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // 배경 클리어
      ctx.clearRect(0, 0, rect.width, rect.height);

      // 막대 그리기
      const barCount = 40;
      const barWidth = rect.width / barCount - 2;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const barHeight = Math.max(4, (value / 255) * rect.height * 0.9);
        
        const x = i * (barWidth + 2);
        const y = (rect.height - barHeight) / 2;

        // 그라데이션 색상
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, "#f97316");
        gradient.addColorStop(1, "#ea580c");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isRecording, isPaused]);

  if (!isRecording) {
    return (
      <div className="w-full h-16 flex items-center justify-center">
        <p className="text-karaoke-text/40 text-sm">녹음을 시작하세요</p>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="w-full h-16 flex items-center justify-center">
        <p className="text-karaoke-text/40 text-sm">일시정지됨</p>
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-16"
      style={{ display: "block" }}
    />
  );
}
