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
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LiveWaveform } from "./LiveWaveform";
import { AudioWaveform } from "./AudioWaveform";
import karaokeIcon from "@/assets/karaoke-icon.png";

interface Sentence {
  text: string;
  startTime?: number;
  endTime?: number;
}

interface KaraokeRecorderProps {
  title: string;
  sentences: string[];
  onSave?: (audioBlob: Blob, sentenceTimestamps: Sentence[]) => void | Promise<void>;
  onClose?: () => void;
}

export function KaraokeRecorder({ title, sentences, onSave, onClose }: KaraokeRecorderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingStartTsRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const [sentenceData, setSentenceData] = useState<Sentence[]>(
    sentences.map((text) => ({ text }))
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

      mediaRecorder.onstop = () => {
        const rawBlob = new Blob(audioChunksRef.current, { type: recorderMimeTypeRef.current });
        console.log("[Recording] onstop - Raw blob created, type:", recorderMimeTypeRef.current, "size:", rawBlob.size);
        if (rawBlob.size > 0) {
          setRecordedBlob(rawBlob);
          setShowPreview(true);
        } else {
          console.error("[Recording] Empty blob created!");
          alert("녹음 데이터가 비어있습니다. 다시 녹음해주세요.");
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

      // 타이머 시작
      recordingStartTsRef.current = Date.now();
      accumulatedTimeRef.current = 0;
      timerRef.current = setInterval(() => {
        const elapsed = accumulatedTimeRef.current + (Date.now() - recordingStartTsRef.current) / 1000;
        setRecordingTime(Math.floor(elapsed));
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
      recordingStartTsRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = accumulatedTimeRef.current + (Date.now() - recordingStartTsRef.current) / 1000;
        setRecordingTime(Math.floor(elapsed));
      }, 200);
    } else {
      mediaRecorderRef.current.pause();
      accumulatedTimeRef.current += (Date.now() - recordingStartTsRef.current) / 1000;
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

    // Blob은 onstop 핸들러에서 생성됨

    setIsRecording(false);
    setIsPaused(false);
    setAnalyserNode(null);
  };

  // 녹음 저장 (제출)
  const saveRecording = async () => {
    if (!recordedBlob || isSaving) return;
    console.log("[Recording] saveRecording called, blob size:", recordedBlob.size);
    setIsSaving(true);
    try {
      await onSave?.(recordedBlob, sentenceData);
    } catch (e) {
      console.error("[Recording] save failed:", e);
    } finally {
      // 실패하거나 지연되어도 버튼이 영구히 잠기지 않도록 항상 해제
      setIsSaving(false);
    }
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
    recordingStartTsRef.current = 0;
    accumulatedTimeRef.current = 0;
    setSentenceData(sentences.map((text) => ({ text })));
    setAnalyserNode(null);
    setRecordedBlob(null);
    setShowPreview(false);
    setIsPlayingPreview(false);
    audioChunksRef.current = [];
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
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

  const progressPct = sentences.length > 0 ? ((currentIndex + (showPreview ? 1 : 0)) / sentences.length) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col text-white overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -10%, #16233d 0%, #101828 38%, #0a0d16 76%, #06070c 100%)",
      }}
    >
      {/* 배경 글로우 오브 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-blue-500/20 blur-[130px]" />
        <div className="absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full bg-sky-400/12 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-[480px] h-[480px] rounded-full bg-indigo-500/14 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 30%, rgba(255,255,255,0.8) 0px, transparent 40%), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.6) 0px, transparent 45%)",
          }}
        />
      </div>

      {/* 헤더 - 글래스 카드 */}
      <header className="relative z-10 px-3 sm:px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <div className="relative rounded-[1.5rem] glass-onyx overflow-hidden">
          {/* 상단 글로우 라인 */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />


          <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-11 h-11 flex-shrink-0 drop-shadow-[0_8px_22px_rgba(56,189,248,0.4)]">
                <img
                  src={karaokeIcon}
                  alt="녹음 아이콘"
                  width={88}
                  height={88}
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-300 ring-2 ring-[#0f172a] animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-[14px] sm:text-[15px] font-semibold tracking-tight leading-tight truncate text-white">
                  {title}
                </h1>

              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="inline-flex items-center gap-1 mr-1 px-2 py-1 rounded-lg bg-white/[0.06] ring-1 ring-white/10 text-[10px] font-black tabular-nums text-white/80">
                <span className="text-white/45">문장</span>
                {currentIndex + 1}
                <span className="text-white/30">/</span>
                <span className="text-white/45">{sentences.length}</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* 인라인 진행률 바 */}
          <div className="relative h-[3px] bg-white/[0.06]">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-500 shadow-[0_0_12px_rgba(96,165,250,0.7)] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />

          </div>
        </div>
      </header>

      {/* 문장 표시 영역 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-6 overflow-y-auto">
        <div className="max-w-3xl w-full space-y-5 text-center">
          {/* 이전 문장 */}
          {currentIndex > 0 && (
            <div key={`prev-${currentIndex}`} className="text-[13px] sm:text-sm text-white/35 italic leading-relaxed line-clamp-2">
              {sentences[currentIndex - 1]}
            </div>
          )}

          {/* 현재 문장 - 프리미엄 카드 */}
          <div className="relative py-4">
            {/* 글로우 오라 */}
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/18 via-blue-500/18 to-indigo-500/18 rounded-[36px] blur-2xl" />
            <div className="relative rounded-[2rem] glass-onyx px-6 py-8">
              {/* 코너 글리프 */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 text-slate-900 text-[10px] font-semibold tracking-[0.08em] shadow-[0_10px_24px_-10px_rgba(0,0,0,0.8)] whitespace-nowrap">
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                우리말로 해석하세요 · #{currentIndex + 1}
              </div>

              <p
                key={`current-${currentIndex}`}
                className={cn(
                  "text-[19px] sm:text-2xl lg:text-[28px] font-bold leading-[1.45] tracking-tight",
                  "bg-gradient-to-b from-white via-white to-white/85 bg-clip-text text-transparent",
                  "[text-shadow:0_2px_30px_rgba(255,255,255,0.15)]"
                )}
              >
                {sentences[currentIndex]}
              </p>
            </div>
          </div>

          {/* 다음 문장 */}
          {currentIndex < sentences.length - 1 && (
            <div key={`next-${currentIndex}`} className="text-[13px] sm:text-sm text-white/45 leading-relaxed line-clamp-2">
              <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded text-[9px] font-black tracking-normal bg-white/10 text-white/60 align-middle">
                다음문장
              </span>
              {sentences[currentIndex + 1]}
            </div>
          )}
        </div>
      </div>

      {/* 녹음 컨트롤 - Liquid Glass */}
      <div className="relative z-10 mx-3 sm:mx-4 mb-[max(env(safe-area-inset-bottom),14px)] rounded-[1.75rem] glass-onyx px-5 sm:px-6 pt-5 pb-6">
        <div className="max-w-2xl mx-auto space-y-5">

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

          {/* 상태 표시 - 정제된 글래스 필 */}
          <div className="flex items-center justify-center gap-4">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium tracking-tight backdrop-blur-xl transition-all duration-300",
              showPreview
                ? "bg-white/[0.08] text-sky-200 ring-1 ring-sky-300/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                : isRecording
                  ? "bg-rose-500/[0.14] text-rose-200 ring-1 ring-rose-300/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "bg-white/[0.06] text-white/55 ring-1 ring-white/10"
            )}>
              {showPreview ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.9)]" />
                  완료됨
                </>
              ) : isRecording ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)] animate-pulse" />
                  녹음중
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/35" />
                  준비
                </>
              )}
            </div>
            <span className="font-mono text-2xl font-extralight tracking-[0.12em] text-white/85 tabular-nums">
              {formatTime(recordingTime)}
            </span>
          </div>

          {/* 버튼 영역 - Liquid Glass */}
          <div className="flex items-center justify-center gap-3.5">
            {showPreview ? (
              // 미리듣기 모드
              <>
                <button
                  onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                  aria-label="미리듣기 재생/일시정지"
                  className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.08] hover:bg-white/[0.16] ring-1 ring-white/15 backdrop-blur-xl transition-all duration-300 active:scale-95"
                >
                  {isPlayingPreview ? (
                    <Pause className="w-6 h-6 text-white/85 group-hover:text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white/85 group-hover:text-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={resetRecording}
                  aria-label="다시 녹음"
                  className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.05] hover:bg-rose-500/20 ring-1 ring-white/12 hover:ring-rose-400/40 backdrop-blur-xl transition-all duration-300 active:scale-95"
                >
                  <RotateCcw className="w-5 h-5 text-white/60 group-hover:text-rose-300" />
                </button>

                <button
                  onClick={saveRecording}
                  disabled={isSaving || !recordedBlob}
                  className={cn(
                    "glass-sheen flex items-center gap-2.5 px-8 h-14 rounded-full font-semibold tracking-tight transition-all duration-300 active:scale-[0.97]",
                    isSaving || !recordedBlob
                      ? "bg-white/10 text-white/50 opacity-50 cursor-not-allowed"
                      : "bg-gradient-to-b from-white to-slate-200 text-slate-900 shadow-[0_18px_36px_-14px_rgba(255,255,255,0.45),0_2px_8px_rgba(0,0,0,0.4)]"
                  )}
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? "제출 중..." : "제출하기"}
                </button>
              </>
            ) : !isRecording ? (
              // 대기 모드 - 큰 녹음 버튼
              <button
                onClick={startRecording}
                className="glass-sheen group relative flex items-center gap-3 px-10 h-16 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 text-white font-semibold tracking-tight shadow-[0_22px_44px_-18px_rgba(59,130,246,0.95)] transition-all duration-300 active:scale-[0.97]"
              >
                <span className="absolute inset-0 rounded-full bg-blue-400/25 animate-ping" />
                <Mic className="w-6 h-6 relative z-10" />
                <span className="relative z-10 text-[17px]">녹음 시작</span>
              </button>
            ) : (
              // 녹음 중 모드
              <>
                <button
                  onClick={togglePause}
                  aria-label="일시정지/재개"
                  className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.08] hover:bg-white/[0.16] ring-1 ring-white/15 backdrop-blur-xl transition-all duration-300 active:scale-95"
                >
                  {isPaused ? (
                    <Play className="w-6 h-6 text-white/85 group-hover:text-white ml-0.5" />
                  ) : (
                    <Pause className="w-6 h-6 text-white/85 group-hover:text-white" />
                  )}
                </button>

                {currentIndex < sentences.length - 1 ? (
                  <button
                    onClick={nextSentence}
                    className="glass-sheen flex items-center gap-2.5 px-8 h-14 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 text-white font-semibold tracking-tight shadow-[0_18px_36px_-16px_rgba(59,130,246,0.9)] transition-all duration-300 active:scale-[0.97]"
                  >
                    다음 문장
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                <button
                  onClick={finishRecording}
                  className="glass-sheen flex items-center gap-2.5 px-8 h-14 rounded-full bg-gradient-to-b from-white to-slate-200 text-slate-900 font-semibold tracking-tight shadow-[0_18px_36px_-14px_rgba(255,255,255,0.45),0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-300 active:scale-[0.97]"
                >
                  녹음 완료
                  <ChevronRight className="w-5 h-5" />
                </button>
                )}

                <button
                  onClick={resetRecording}
                  aria-label="다시 녹음"
                  className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.05] hover:bg-rose-500/20 ring-1 ring-white/12 hover:ring-rose-400/40 backdrop-blur-xl transition-all duration-300 active:scale-95"
                >
                  <RotateCcw className="w-5 h-5 text-white/60 group-hover:text-rose-300" />
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
