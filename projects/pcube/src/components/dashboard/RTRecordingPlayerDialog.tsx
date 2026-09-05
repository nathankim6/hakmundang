import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCheck, CheckCircle2, Clock, MessageCircle, MessageSquare, Mic, Pause, Play, SkipBack, SkipForward, Star, StarHalf, Volume2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getMessageTemplates, formatMessage } from "@/components/notifications/MessageTemplateDialog";
import { cn } from "@/lib/utils";

interface RecordingTimestamp {
  sentenceIndex: number;
  startTime: number;
  endTime: number;
}

interface SetSubmissionItem {
  homeworkId: string;
  homeworkTitle: string;
  passageId?: string;
  submission: {
    id: string;
    recording_url?: string | null;
    recording_timestamps?: RecordingTimestamp[] | null;
    submitted_at: string | null;
    status: string;
    teacher_note?: string | null;
    reviewed_at?: string | null;
  };
}

interface RTRecordingPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentId: string;
  homeworkId: string;
  homeworkTitle: string;
  passageId?: string;
  submission?: {
    id: string;
    recording_url?: string | null;
    recording_timestamps?: RecordingTimestamp[] | null;
    submitted_at: string | null;
    status: string;
    teacher_note?: string | null;
    reviewed_at?: string | null;
  } | null;
  allSetSubmissions?: SetSubmissionItem[];
}

export function RTRecordingPlayerDialog({
  open,
  onOpenChange,
  studentName,
  studentId,
  homeworkId: propHomeworkId,
  homeworkTitle: propHomeworkTitle,
  passageId: propPassageId,
  submission: propSubmission,
  allSetSubmissions,
}: RTRecordingPlayerDialogProps) {
  // 세트 탭 상태
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [selectedForBulk, setSelectedForBulk] = useState<Set<number>>(new Set());

  const hasMultiple = (allSetSubmissions?.length ?? 0) > 1;
  const activeItem = hasMultiple ? allSetSubmissions![activeSetIndex] : null;
  const submission = activeItem?.submission ?? propSubmission;
  const passageId = activeItem?.passageId ?? propPassageId;
  const homeworkId = activeItem?.homeworkId ?? propHomeworkId;
  const homeworkTitle = activeItem?.homeworkTitle ?? propHomeworkTitle;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [teacherNote, setTeacherNote] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notificationType, setNotificationType] = useState<"sms" | "kakao" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const RATING_CATEGORIES = [
    "단어", "구문끊어읽기", "속도", "해석/내용파악", "주변소음",
    "한글발음", "말 더듬", "말투", "자신감"
  ] as const;

  // 지문 문장 조회
  const { data: passage } = useQuery({
    queryKey: ["passage-sentences", passageId],
    queryFn: async () => {
      if (!passageId) return null;
      const { data, error } = await supabase
        .from("passages")
        .select("title, sentences")
        .eq("id", passageId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!passageId && open,
  });

  const sentences = passage?.sentences || [];
  const timestamps = (submission?.recording_timestamps as RecordingTimestamp[] | null) || [];

  // audioReady: canplay 이벤트로 재생 가능 여부 추적
  const [audioReady, setAudioReady] = useState(false);
  const pendingPlayRef = useRef(false);
  

  // Dialog open 시점에만 피드백 초기화 (탭 전환 시에는 피드백 유지)
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const firstSub = allSetSubmissions?.[0]?.submission ?? propSubmission;
      const raw = firstSub?.teacher_note || "";
      const ratingMatch = raw.match(/^\[RATINGS:(.*?)\]\n?/);
      if (ratingMatch) {
        try { setRatings(JSON.parse(ratingMatch[1])); } catch { setRatings({}); }
        setTeacherNote(raw.replace(/^\[RATINGS:.*?\]\n?/, ""));
      } else {
        setRatings({});
        setTeacherNote(raw);
      }
      setCurrentSentenceIndex(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setActiveSetIndex(0);

      if (allSetSubmissions && allSetSubmissions.length > 1) {
        const submitted = new Set<number>();
        allSetSubmissions.forEach((s, i) => {
          if (s.submission?.submitted_at && s.submission.status !== 'completed') {
            submitted.add(i);
          }
        });
        setSelectedForBulk(submitted);
      } else {
        setSelectedForBulk(new Set());
      }
    }
    prevOpenRef.current = open;
  }, [open]);

  // 탭 전환 시 오디오만 리셋 (피드백은 유지)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentSentenceIndex(0);
    setCurrentTime(0);
    setDuration(0);
  }, [activeSetIndex]);

  // 오디오 소스 URL 관리 (직접 URL 우선, 실패 시 Blob fallback)
  const blobUrlRef = useRef<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [usedBlobFallback, setUsedBlobFallback] = useState(false);

  useEffect(() => {
    setAudioReady(false);
    setAudioSrc(null);
    setUsedBlobFallback(false);

    // 이전 blob URL 정리
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    const url = submission?.recording_url;
    if (!url || !open) return;

    // 직접 URL을 먼저 사용
    console.log("[AudioDebug] Using direct URL:", url);
    setAudioSrc(url);

    return () => {
      // cleanup
    };
  }, [submission?.recording_url, open]);

  // 직접 URL 실패 시 Blob fallback
  // 파일 매직 바이트로 실제 오디오 포맷 감지
  const detectAudioMimeType = (buffer: ArrayBuffer): string[] => {
    const bytes = new Uint8Array(buffer.slice(0, 12));
    const header = Array.from(bytes);
    
    // WebM/MKV: starts with 0x1A 0x45 0xDF 0xA3 (EBML)
    if (header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3) {
      return ["audio/webm;codecs=opus", "audio/webm", "video/webm"];
    }
    // OGG: starts with "OggS"
    if (header[0] === 0x4F && header[1] === 0x67 && header[2] === 0x67 && header[3] === 0x53) {
      return ["audio/ogg;codecs=opus", "audio/ogg"];
    }
    // MP4/M4A: has "ftyp" at offset 4
    if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
      return ["audio/mp4", "audio/aac", "audio/x-m4a"];
    }
    // RIFF/WAV: starts with "RIFF"
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
      return ["audio/wav"];
    }
    // MP3: starts with 0xFF 0xFB/0xF3/0xF2 or "ID3"
    if ((header[0] === 0xFF && (header[1] & 0xE0) === 0xE0) || 
        (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33)) {
      return ["audio/mpeg"];
    }
    
    console.log("[AudioDebug] Unknown format, header bytes:", header.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join(' '));
    return [];
  };

  const tryBlobFallback = useCallback(async () => {
    const url = submission?.recording_url;
    if (!url || usedBlobFallback) return;
    
    setUsedBlobFallback(true);
    console.log("[AudioDebug] Direct URL failed, trying blob fallback...");
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      
      // 매직 바이트로 실제 포맷 감지
      const detectedTypes = detectAudioMimeType(arrayBuffer);
      console.log("[AudioDebug] Detected format from magic bytes:", detectedTypes);
      
      // 감지된 타입 + 일반적인 타입 모두 시도
      const mimeTypesToTry = [
        ...detectedTypes,
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
        "",  // 타입 없이 (브라우저 자동 감지)
      ];
      
      // 중복 제거
      const uniqueTypes = [...new Set(mimeTypesToTry)];
      
      for (const mime of uniqueTypes) {
        const testBlob = new Blob([arrayBuffer], mime ? { type: mime } : undefined);
        const testUrl = URL.createObjectURL(testBlob);
        
        const canPlay = await new Promise<boolean>((resolve) => {
          const testAudio = new Audio();
          testAudio.preload = "auto";
          const timeout = setTimeout(() => { resolve(false); }, 3000);
          testAudio.oncanplay = () => { clearTimeout(timeout); resolve(true); };
          testAudio.onerror = () => { clearTimeout(timeout); resolve(false); };
          testAudio.src = testUrl;
        });
        
        if (canPlay) {
          console.log("[AudioDebug] ✅ Playable with MIME:", mime || "(auto)");
          blobUrlRef.current = testUrl;
          setAudioSrc(testUrl);
          return;
        } else {
          URL.revokeObjectURL(testUrl);
          console.log("[AudioDebug] ❌ Failed with MIME:", mime || "(auto)");
        }
      }
      
      console.error("[AudioDebug] No MIME type worked for this file");
      toast.error("이 녹음 파일은 현재 브라우저에서 재생할 수 없습니다. 녹음한 기기의 브라우저에서 시도해보세요.");
    } catch (err) {
      console.error("[AudioDebug] Blob fallback failed:", err);
      toast.error("오디오 파일을 불러올 수 없습니다.");
    }
  }, [submission?.recording_url, usedBlobFallback]);

  // React 이벤트 핸들러 — useEffect가 아닌 JSX에서 직접 처리
  const handleAudioCanPlay = () => {
    console.log("[Audio] canplay, duration:", audioRef.current?.duration);
    setAudioReady(true);
    if (pendingPlayRef.current && audioRef.current) {
      pendingPlayRef.current = false;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Audio play failed:", err.name, err.message);
            if (err.name !== "AbortError") {
              toast.error("오디오 재생에 실패했습니다.");
            }
          });
      }
    }
  };

  const handleAudioError = () => {
    const audio = audioRef.current;
    console.error("[Audio] error:", audio?.error?.code, audio?.error?.message);
    
    // 직접 URL 실패 시 blob fallback 시도
    if (!usedBlobFallback) {
      tryBlobFallback();
      return;
    }
    
    toast.error("오디오 파일을 불러올 수 없습니다.");
    setIsPlaying(false);
    setAudioReady(false);
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = audio.currentTime;
    setCurrentTime(time);

    // Find current sentence based on timestamps
    if (timestamps.length > 0) {
      let foundIdx = -1;
      for (let i = 0; i < timestamps.length; i++) {
        const t = timestamps[i];
        if (time >= t.startTime && time < t.endTime) {
          foundIdx = i;
          break;
        }
      }
      if (foundIdx === -1) {
        for (let i = timestamps.length - 1; i >= 0; i--) {
          if (time >= timestamps[i].startTime) {
            foundIdx = i;
            break;
          }
        }
      }
      if (foundIdx !== -1 && foundIdx !== currentSentenceIndex) {
        setCurrentSentenceIndex(foundIdx);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Dialog가 닫힐 때 오디오 정지
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    if (!open && blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (!open) {
      setAudioSrc(null);
    }
  }, [open]);

  // 현재 문장으로 자동 스크롤
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    if (sentenceRefs.current[currentSentenceIndex]) {
      sentenceRefs.current[currentSentenceIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentSentenceIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // 항상 직접 play 시도 (audioReady 상태와 무관하게)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAudioReady(true);
          })
          .catch((err) => {
            console.error("Audio play failed:", err.name, err.message);
            if (err.name === "NotAllowedError" || err.name === "AbortError") {
              // 아직 로딩 중일 수 있음
              pendingPlayRef.current = true;
              toast.info("오디오를 로딩 중입니다. 곧 자동 재생됩니다.");
            } else {
              toast.error("오디오 재생에 실패했습니다.");
            }
          });
      }
    }
  };

  const jumpToSentence = (index: number) => {
    const audio = audioRef.current;
    if (!audio || !timestamps[index]) return;

    setCurrentSentenceIndex(index);
    audio.currentTime = timestamps[index].startTime;
    if (!isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAudioReady(true);
          })
          .catch((err) => {
            console.error("Audio play failed:", err);
            if (err.name === "NotAllowedError" || err.name === "AbortError") {
              pendingPlayRef.current = true;
              toast.info("오디오를 로딩 중입니다. 곧 자동 재생됩니다.");
            } else {
              toast.error("오디오 재생에 실패했습니다.");
            }
          });
      }
    }
  };

  const skipPrevious = () => {
    if (currentSentenceIndex > 0) {
      jumpToSentence(currentSentenceIndex - 1);
    }
  };

  const skipNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      jumpToSentence(currentSentenceIndex + 1);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 피드백 저장 mutation (일괄 확인 지원) — 낙관적 UI
  const updateMutation = useMutation({
    mutationFn: async ({ note, status, notificationType: nType, bulkIds }: { note: string; status: string; notificationType?: "sms" | "kakao" | null; bulkIds?: string[] }) => {
      if (bulkIds && bulkIds.length > 0) {
        const { error } = await supabase
          .from("homework_submissions")
          .update({
            teacher_note: note,
            status: status,
            reviewed_at: new Date().toISOString(),
          })
          .in("id", bulkIds);
        if (error) throw error;
      } else {
        if (!submission?.id) throw new Error("제출물이 없습니다.");
        const { error } = await supabase
          .from("homework_submissions")
          .update({
            teacher_note: note,
            status: status,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", submission.id);
        if (error) throw error;
      }

      // 알림 발송 (비동기 fire-and-forget)
      if (status === "completed" && nType) {
        try {
          const templates = await getMessageTemplates(session?.accessCodeId);
          const ratingText = Object.entries(ratings)
            .filter(([, v]) => v > 0)
            .map(([cat, val]) => {
              const full = Math.floor(val);
              const half = val % 1 !== 0;
              const empty = 5 - full - (half ? 1 : 0);
              return `${cat}: ${"★".repeat(full)}${"☆".repeat(half ? 1 + empty : empty)} (${val}점)`;
            })
            .join("\n");
          
          let feedbackMsg = formatMessage(templates.reviewTaskReview, {
            studentName,
          });
          if (ratingText) feedbackMsg += `\n\n[평가]\n${ratingText}`;
          if (teacherNote) feedbackMsg += `\n\n[코멘트]\n${teacherNote}`;
          
          const response = await supabase.functions.invoke("send-kakao-notification", {
            body: {
              studentId,
              studentName,
              submissionType: "review",
              messageTemplate: feedbackMsg,
              brandPrefix: templates.brandPrefix,
              messageType: nType,
              ownerCodeId: session?.accessCodeId,
            },
          });
          if (response.data?.insufficientBalance) {
            toast.error("💰 솔라피 잔액이 부족합니다.\n솔라피 콘솔에서 잔액을 충전해주세요.");
          } else if (response.data?.needsApiKey) {
            toast.error(response.data.error);
          }
        } catch (e) {
          console.error("Notification error:", e);
        }
      }
    },
    onMutate: (variables) => {
      // 낙관적 UI: 즉시 다이얼로그 닫고 토스트 표시
      const count = variables.bulkIds?.length || 1;
      if (variables.status === "completed") {
        if (variables.notificationType) {
          toast.success(`${count}건 검토 완료! ${variables.notificationType === "sms" ? "문자" : "카카오톡"} 발송 중...`);
        } else {
          toast.success(`${count}건 검토 완료! 피드백이 저장되었습니다.`);
        }
      } else {
        toast.success("피드백이 저장되었습니다.");
      }
      onOpenChange(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rt-submissions-status"] });
      queryClient.invalidateQueries({ queryKey: ["rt-submissions-only"] });
    },
    onError: () => {
      toast.error("피드백 저장에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleSave = (status: "reviewed" | "pending", overrideNotificationType?: "sms" | "kakao" | null) => {
    const dbStatus = status === "reviewed" ? "completed" : status;
    if (overrideNotificationType !== undefined) {
      setNotificationType(overrideNotificationType);
    }
    const hasRatingsData = Object.keys(ratings).length > 0;
    const combinedNote = hasRatingsData
      ? `[RATINGS:${JSON.stringify(ratings)}]\n${teacherNote}`
      : teacherNote;
    const effectiveType = overrideNotificationType !== undefined ? overrideNotificationType : notificationType;
    
    const bulkIds = hasMultiple && selectedForBulk.size > 0
      ? Array.from(selectedForBulk).map(i => allSetSubmissions![i]?.submission?.id).filter(Boolean) as string[]
      : undefined;
    
    updateMutation.mutate({ note: combinedNote, status: dbStatus, notificationType: effectiveType, bulkIds });
  };

  if (!submission?.recording_url) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              녹음 재생
            </DialogTitle>
            <DialogDescription>
              {studentName} · {homeworkTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="py-12 text-center text-muted-foreground">
            <Mic className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>제출된 녹음이 없습니다.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-2xl w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl p-3 sm:p-6 gap-2 sm:gap-4 flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            녹음 재생
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="break-all">{studentName} · {homeworkTitle}</span>
            <Badge
              variant={submission.status === "reviewed" ? "default" : "secondary"}
              className={submission.status === "reviewed" 
                ? "bg-success/20 text-success border-success/30 shrink-0" 
                : "bg-warning/20 text-warning border-warning/30 shrink-0"
              }
            >
              {submission.status === "reviewed" ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  검토완료
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  검토대기
                </>
              )}
            </Badge>
          </DialogDescription>
        </DialogHeader>


        {/* 세트 탭 바 */}
        {hasMultiple && allSetSubmissions && (
          <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-2 border-b border-border/50 bg-muted/30 rounded-lg mx-1">
            <div className="flex items-center gap-1 flex-1 overflow-x-auto">
              {allSetSubmissions.map((item, i) => {
                const num = item.homeworkTitle.match(/#(\d+)$/)?.[1] || String(i + 1);
                const isActive = i === activeSetIndex;
                const isSelected = selectedForBulk.has(i);
                const isSubmitted = !!item.submission?.submitted_at;
                const isReviewed = item.submission?.status === 'completed';
                
                return (
                  <button
                    key={i}
                    onClick={() => { if (isSubmitted) setActiveSetIndex(i); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : isReviewed
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        : isSubmitted
                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                    )}
                    disabled={!isSubmitted}
                  >
                    {isSubmitted && !isReviewed && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedForBulk(prev => {
                            const next = new Set(prev);
                            if (next.has(i)) next.delete(i);
                            else next.add(i);
                            return next;
                          });
                        }}
                        className="w-3 h-3 rounded accent-primary cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    #{num}
                    {isReviewed && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                    {!isSubmitted && <span className="text-[9px]">미제출</span>}
                  </button>
                );
              })}
            </div>
            {allSetSubmissions.some(s => s.submission?.submitted_at && s.submission.status !== 'completed') && (
              <button
                onClick={() => {
                  const unreviewed = allSetSubmissions
                    .map((s, i) => (s.submission?.submitted_at && s.submission.status !== 'completed') ? i : -1)
                    .filter(i => i >= 0);
                  setSelectedForBulk(prev => {
                    if (prev.size === unreviewed.length) return new Set();
                    return new Set(unreviewed);
                  });
                }}
                className="text-[10px] text-primary hover:underline whitespace-nowrap px-2 font-medium"
              >
                {selectedForBulk.size === allSetSubmissions.filter(s => s.submission?.submitted_at && s.submission.status !== 'completed').length ? '선택해제' : '전체선택'}
              </button>
            )}
          </div>
        )}

        {/* Audio element — 직접 URL 우선, 실패 시 Blob fallback */}
        {audioSrc && (
          <audio
            ref={audioRef}
            src={audioSrc}
            preload="auto"
            onCanPlay={handleAudioCanPlay}
            onError={handleAudioError}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={handleAudioEnded}
          />
        )}

        {/* 스크롤 영역: 문장 목록 + 피드백 입력 */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain -mx-1 px-1 space-y-3">
          {/* 문장 목록 */}
          <div className="space-y-2">
            {sentences.length > 0 ? (
              sentences.map((sentence, index) => {
                const isActive = index === currentSentenceIndex;
                const isPast = index < currentSentenceIndex;
                const hasTiming = timestamps[index] !== undefined;

                return (
                  <div
                    key={index}
                    ref={(el) => (sentenceRefs.current[index] = el)}
                    onClick={() => jumpToSentence(index)}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 cursor-pointer active:scale-[0.99] ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                        : isPast
                        ? "bg-muted/50 text-muted-foreground"
                        : hasTiming
                        ? "bg-card hover:bg-muted/50 border border-border/50"
                        : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                    } ${!hasTiming ? "pointer-events-none" : ""}`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold ${
                        isActive 
                          ? "bg-white/20 text-white" 
                          : isPast 
                          ? "bg-success/20 text-success" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {isPast ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : index + 1}
                      </div>
                      <p className={`flex-1 text-[13px] sm:text-sm leading-relaxed ${isActive ? "font-medium" : ""}`}>
                        {sentence}
                      </p>
                      {hasTiming && (
                        <span className={`text-[10px] sm:text-xs flex-shrink-0 tabular-nums ${isActive ? "text-white/70" : "text-muted-foreground"}`}>
                          {formatTime(timestamps[index].startTime)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>지문 정보를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>

          {/* 피드백 입력 */}
          <div className="space-y-2 pt-3 border-t border-border/50">
            <label className="text-[13px] sm:text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              선생님 피드백
              <span className="text-[9px] text-muted-foreground font-normal">· 더블탭 시 별 반개</span>
            </label>

            {/* 별점 평가 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 p-2.5 sm:p-3 bg-muted/50 rounded-xl">
              {RATING_CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground font-medium whitespace-nowrap min-w-[80px]">{cat}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const val = ratings[cat] || 0;
                      const isFull = val >= star;
                      const isHalf = !isFull && val === star - 0.5;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatings((prev) => {
                            const cur = prev[cat] || 0;
                            if (cur === star) return { ...prev, [cat]: 0 };
                            if (cur === star - 0.5) return { ...prev, [cat]: 0 };
                            return { ...prev, [cat]: star };
                          })}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setRatings((prev) => ({ ...prev, [cat]: star - 0.5 }));
                          }}
                          className="p-1.5 sm:p-0.5 transition-colors relative"
                        >
                          {isHalf ? (
                            <span className="relative inline-block w-5 h-5 sm:w-4 sm:h-4">
                              <Star className="w-5 h-5 sm:w-4 sm:h-4 text-muted-foreground/30 absolute inset-0" />
                              <StarHalf className="w-5 h-5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 absolute inset-0" />
                            </span>
                          ) : (
                            <Star
                              className={`w-5 h-5 sm:w-4 sm:h-4 ${
                                isFull
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <Textarea
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="학생에게 전달할 피드백을 입력하세요..."
              className="min-h-[56px] sm:min-h-[80px] resize-none text-[13px] sm:text-sm"
            />
          </div>
        </div>

        {/* 하단 고정 영역: 현재 문장 + 플레이어 + 액션 */}
        <div className="flex-shrink-0 space-y-2 pt-1 pb-[env(safe-area-inset-bottom)]">
          {/* 현재 문장 표시 (모바일에서 항상 보이도록) */}
          {sentences.length > 0 && currentSentenceIndex >= 0 && currentSentenceIndex < sentences.length && (
            <div className="sm:hidden px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-[11px] text-primary font-medium truncate">
                <span className="text-primary/60 mr-1">{currentSentenceIndex + 1}.</span>
                {sentences[currentSentenceIndex]}
              </p>
            </div>
          )}

          {/* 컨트롤러 */}
          <div className="p-2.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white space-y-2 sm:space-y-4">
            {/* 진행 바 (탭하여 이동) */}
            <div className="space-y-1.5">
              <div
                className="py-2 -my-1 cursor-pointer"
                onClick={(e) => {
                  const audio = audioRef.current;
                  if (!audio || !duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                  audio.currentTime = ratio * duration;
                }}
              >
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-100"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs text-white/60 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex items-center justify-center gap-5 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={skipPrevious}
                disabled={currentSentenceIndex === 0}
                className="w-12 h-12 text-white hover:bg-white/10 disabled:opacity-30"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipNext}
                disabled={currentSentenceIndex >= sentences.length - 1}
                className="w-12 h-12 text-white hover:bg-white/10 disabled:opacity-30"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 버튼 */}
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 sm:justify-end">
            <Button
              onClick={() => handleSave("reviewed", null)}
              disabled={updateMutation.isPending}
              variant="outline"
              className="h-11 col-span-2 sm:h-10 border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[13px] sm:text-sm font-semibold sm:order-3"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              확인처리만{hasMultiple && selectedForBulk.size > 1 ? ` (${selectedForBulk.size}건)` : ''}
            </Button>
            <Button
              onClick={() => handleSave("reviewed", "sms")}
              disabled={updateMutation.isPending}
              className="h-11 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white text-[13px] sm:text-sm sm:order-1"
            >
              <MessageSquare className="w-4 h-4 mr-1 shrink-0" strokeWidth={1.75} />
              문자 검토{hasMultiple && selectedForBulk.size > 1 ? ` (${selectedForBulk.size})` : ''}
            </Button>
            <Button
              onClick={() => handleSave("reviewed", "kakao")}
              disabled={updateMutation.isPending}
              className="h-11 sm:h-10 bg-yellow-500 hover:bg-yellow-600 text-black text-[13px] sm:text-sm sm:order-2"
            >
              <MessageCircle className="w-4 h-4 mr-1 shrink-0" strokeWidth={1.75} />
              카톡 검토{hasMultiple && selectedForBulk.size > 1 ? ` (${selectedForBulk.size})` : ''}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-11 col-span-2 sm:h-10 text-muted-foreground text-[13px] sm:text-sm sm:order-0"
            >
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

