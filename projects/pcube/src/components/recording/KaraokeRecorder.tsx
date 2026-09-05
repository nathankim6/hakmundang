import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Pause,
  Play,
  RotateCcw,
  Save,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LiveWaveform } from "./LiveWaveform";
import { AudioWaveform } from "./AudioWaveform";

interface Sentence {
  text: string;
  startTime?: number;
  endTime?: number;
}

interface KaraokeRecorderProps {
  title: string;
  sentences: string[];
  onSave?: (audioBlob: Blob, sentenceTimestamps: Sentence[]) => void;
  onClose?: () => void;
}

export function KaraokeRecorder({ title, sentences, onSave, onClose }: KaraokeRecorderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sentenceData, setSentenceData] = useState<Sentence[]>(
    sentences.map((text) => ({ text }))
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordingStartRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);

  // 녹음에 사용할 MIME 타입 결정
  const recorderMimeTypeRef = useRef<string>("audio/webm");

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 오디오 분석 설정
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setAnalyserNode(analyser);

      // 지원되는 MIME 타입을 명시적으로 선택
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      let selectedMime = "";
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }
      console.log("[Recording] Selected MIME type:", selectedMime || "browser default");
      recorderMimeTypeRef.current = selectedMime || "audio/webm";

      const recorderOptions: MediaRecorderOptions = {};
      if (selectedMime) {
        recorderOptions.mimeType = selectedMime;
      }

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setShowPreview(false);
      setRecordedBlob(null);

      // 첫 문장 시작 시간 기록
      setSentenceData((prev) => {
        const updated = [...prev];
        updated[0] = { ...updated[0], startTime: 0 };
        return updated;
      });

      // 타이머 시작 (정수 기반, ms 단위 추적)
      const startTs = Date.now();
      recordingStartRef.current = startTs;
      pausedElapsedRef.current = 0;
      timerRef.current = setInterval(() => {
        const elapsed = pausedElapsedRef.current + (Date.now() - recordingStartRef.current);
        setRecordingTime(Math.floor(elapsed / 1000));
      }, 200);
    } catch (error: any) {
      console.error("마이크 접근 오류:", error);
      if (error.name === "NotFoundError") {
        alert("마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.");
      } else if (error.name === "NotAllowedError") {
        alert("마이크 접근 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.");
      } else {
        alert("마이크 접근에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 일시정지/재개
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      recordingStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = pausedElapsedRef.current + (Date.now() - recordingStartRef.current);
        setRecordingTime(Math.floor(elapsed / 1000));
      }, 200);
    } else {
      mediaRecorderRef.current.pause();
      pausedElapsedRef.current += Date.now() - recordingStartRef.current;
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setIsPaused(!isPaused);
  };

  // 다음 문장으로
  const nextSentence = () => {
    if (currentIndex >= sentences.length - 1) return;

    // 현재 문장 종료 시간 기록
    setSentenceData((prev) => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], endTime: recordingTime };
      updated[currentIndex + 1] = { ...updated[currentIndex + 1], startTime: recordingTime };
      return updated;
    });

    setCurrentIndex((prev) => prev + 1);
  };

  // 녹음 완료 (미리듣기용)
  const finishRecording = () => {
    if (!mediaRecorderRef.current) return;

    // 마지막 문장 종료 시간 기록
    setSentenceData((prev) => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], endTime: recordingTime };
      return updated;
    });

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());

    if (timerRef.current) clearInterval(timerRef.current);

    // 녹음 완료 후 Blob 생성 (raw 포맷 그대로 - WAV 변환은 백엔드에서 처리)
    setTimeout(() => {
      const rawBlob = new Blob(audioChunksRef.current, { type: recorderMimeTypeRef.current });
      console.log("[Recording] Raw blob created, type:", recorderMimeTypeRef.current, "size:", rawBlob.size);
      setRecordedBlob(rawBlob);
      setShowPreview(true);
    }, 100);

    setIsRecording(false);
    setIsPaused(false);
    setAnalyserNode(null);
  };

  // 녹음 저장 (제출)
  const saveRecording = () => {
    if (!recordedBlob) return;
    onSave?.(recordedBlob, sentenceData);
  };

  // 다시 녹음
  const resetRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setCurrentIndex(0);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setSentenceData(sentences.map((text) => ({ text })));
    setAnalyserNode(null);
    setRecordedBlob(null);
    setShowPreview(false);
    setIsPlayingPreview(false);
    audioChunksRef.current = [];
  };

  // 시간 포맷 (정수 초)
  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-karaoke-bg text-karaoke-text flex flex-col"
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-karaoke-text/10">
        <div className="flex items-center gap-4">
          <div className="text-2xl">📖</div>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm text-karaoke-text/60">
              {currentIndex + 1} / {sentences.length} 문장
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-karaoke-text hover:bg-karaoke-text/10"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-karaoke-text hover:bg-karaoke-text/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* 문장 표시 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-hidden">
        <div className="max-w-4xl w-full space-y-6 text-center">
          {/* 이전 문장 */}
          {currentIndex > 0 && (
            <div className="text-lg text-karaoke-done opacity-60 transition-all duration-500">
              {sentences[currentIndex - 1]}
            </div>
          )}

          {/* 현재 문장 - 하이라이트 */}
          <div className="relative py-6">
            <div className="absolute inset-0 bg-karaoke-highlight/10 rounded-2xl blur-xl" />
            <div
              className={cn(
                "relative text-xl md:text-2xl lg:text-3xl font-bold leading-snug transition-all duration-300",
                "text-karaoke-current drop-shadow-lg"
              )}
            >
              🔆 {sentences[currentIndex]} 🔆
            </div>
          </div>

          {/* 다음 문장 */}
          {currentIndex < sentences.length - 1 && (
            <div className="text-lg text-karaoke-next opacity-70 transition-all duration-500">
              {sentences[currentIndex + 1]}
            </div>
          )}
        </div>
      </div>

      {/* 녹음 컨트롤 - Premium Minimal Design */}
      <div className="bg-gradient-to-t from-black/40 to-transparent backdrop-blur-xl border-t border-white/5 px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 파형 시각화 */}
          <div className="flex justify-center items-center h-16">
            {showPreview && recordedBlob ? (
              <div className="w-full max-w-md">
                <AudioWaveform
                  audioBlob={recordedBlob}
                  isPlaying={isPlayingPreview}
                  onPlayPause={() => setIsPlayingPreview(!isPlayingPreview)}
                />
              </div>
            ) : (
              <LiveWaveform
                analyser={analyserNode}
                isRecording={isRecording}
                isPaused={isPaused}
              />
            )}
          </div>

          {/* 상태 표시 - 심플한 뱃지 스타일 */}
          <div className="flex items-center justify-center gap-4">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              showPreview 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : isRecording 
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                  : "bg-white/10 text-white/60 border border-white/10"
            )}>
              {showPreview ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  완료됨
                </>
              ) : isRecording ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  녹음중
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  준비
                </>
              )}
            </div>
            <span className="font-mono text-2xl font-light tracking-wider text-white/90">
              {formatTime(recordingTime)}
            </span>
          </div>

          {/* 버튼 영역 - 미니멀 디자인 */}
          <div className="flex items-center justify-center gap-4">
            {showPreview ? (
              // 미리듣기 모드
              <>
                <button
                  onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                  className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300"
                >
                  {isPlayingPreview ? (
                    <Pause className="w-6 h-6 text-white/80 group-hover:text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white/80 group-hover:text-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={resetRecording}
                  className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-all duration-300"
                >
                  <RotateCcw className="w-5 h-5 text-white/60 group-hover:text-red-400" />
                </button>

                <button
                  onClick={saveRecording}
                  className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
                >
                  <Save className="w-5 h-5" />
                  제출하기
                </button>
              </>
            ) : !isRecording ? (
              // 대기 모드 - 큰 녹음 버튼
              <button
                onClick={startRecording}
                className="group relative flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-ping" />
                <Mic className="w-6 h-6 relative z-10" />
                <span className="relative z-10 text-lg">녹음 시작</span>
              </button>
            ) : (
              // 녹음 중 모드
              <>
                <button
                  onClick={togglePause}
                  className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300"
                >
                  {isPaused ? (
                    <Play className="w-6 h-6 text-white/80 group-hover:text-white ml-0.5" />
                  ) : (
                    <Pause className="w-6 h-6 text-white/80 group-hover:text-white" />
                  )}
                </button>

                {currentIndex < sentences.length - 1 ? (
                  <button
                    onClick={nextSentence}
                    className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                  >
                    다음 문장
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={finishRecording}
                    className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
                  >
                    녹음 완료
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={resetRecording}
                  className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-all duration-300"
                >
                  <RotateCcw className="w-5 h-5 text-white/60 group-hover:text-red-400" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
