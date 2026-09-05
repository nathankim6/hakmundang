import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  MessageSquare,
  CheckCircle2,
  Clock,
  Mic,
  Star,
  StarHalf
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getMessageTemplates, formatMessage } from "@/components/notifications/MessageTemplateDialog";
import iconSms from "@/assets/icon-sms.png";
import iconKakao from "@/assets/icon-kakao.png";

interface RecordingTimestamp {
  sentenceIndex: number;
  startTime: number;
  endTime: number;
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
}

export function RTRecordingPlayerDialog({
  open,
  onOpenChange,
  studentName,
  studentId,
  homeworkId,
  homeworkTitle,
  passageId,
  submission,
}: RTRecordingPlayerDialogProps) {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  // Fetch ALL RT submissions for this student
  const { data: allStudentSubmissions = [] } = useQuery({
    queryKey: ["student-all-rt-submissions", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homework_submissions")
        .select(`
          id, submitted_at, status, recording_url, recording_timestamps, teacher_note, reviewed_at,
          homework:homework_id(
            id, title, due_date, type, homework_group_id, created_at,
            passage:passage_id(id, title, sentences)
          )
        `)
        .eq("student_id", studentId)
        .not("submitted_at", "is", null);

      if (error) throw error;
      return (data || []).filter((s: any) => s.homework?.type === "rt_review");
    },
    enabled: open && !!studentId,
  });

  // Group submissions by session (차시): all passages assigned on the same date
  // belong to one 차시, so feedback applies to every passage in the session.
  const groups = useMemo(() => {
    const groupMap = new Map<string, any[]>();
    allStudentSubmissions.forEach((sub: any) => {
      // 차시 단위로 그룹화: 배정일(created_at)만 기준 (지문 제목 무관)
      const assignDate = sub.homework?.created_at?.slice(0, 10) || '';
      const groupKey = assignDate;
      if (!groupMap.has(groupKey)) groupMap.set(groupKey, []);
      groupMap.get(groupKey)!.push(sub);
    });
    return Array.from(groupMap.entries()).map(([groupKey, subs]) => ({
      groupKey,
      groupTitle: (() => {
        const bases = Array.from(new Set(subs.map((s: any) => (s.homework?.title || "").replace(/\s*#\d+$/, ""))));
        if (subs.length > 1) return bases.length === 1 ? bases[0] : "녹음과제";
        return subs[0].homework?.passage?.title || subs[0].homework?.title || "과제";
      })(),
      // All submissions in this group are reviewed if all are completed
      allCompleted: subs.every((s: any) => s.status === "completed"),
      passages: subs.map((sub: any) => ({
        submissionId: sub.id,
        homeworkId: sub.homework?.id,
        homeworkTitle: sub.homework?.title || "과제",
        passageId: sub.homework?.passage?.id,
        passageTitle: sub.homework?.passage?.title || sub.homework?.title || "과제",
        sentences: sub.homework?.passage?.sentences || [],
        submission: {
          id: sub.id,
          recording_url: sub.recording_url,
          recording_timestamps: sub.recording_timestamps,
          submitted_at: sub.submitted_at,
          status: sub.status,
          teacher_note: sub.teacher_note,
          reviewed_at: sub.reviewed_at,
        },
      })),
    }));
  }, [allStudentSubmissions]);

  // Active group index and active passage index within group
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activePassageIndex, setActivePassageIndex] = useState(0);

  const activeGroup = groups[activeGroupIndex] || null;
  const tabs = activeGroup?.passages || [];
  const activeTabIndex = activePassageIndex;
  const setActiveTabIndex = (idx: number) => setActivePassageIndex(idx);

  // When groups change or dialog opens, find the matching group/passage
  useEffect(() => {
    if (groups.length > 0 && submission?.id) {
      for (let gi = 0; gi < groups.length; gi++) {
        const pi = groups[gi].passages.findIndex((t: any) => t.submissionId === submission.id);
        if (pi !== -1) {
          setActiveGroupIndex(gi);
          setActivePassageIndex(pi);
          return;
        }
      }
      // Fallback: find first unreviewed group
      const unreviewedGi = groups.findIndex((g: any) => !g.allCompleted);
      setActiveGroupIndex(unreviewedGi !== -1 ? unreviewedGi : 0);
      setActivePassageIndex(0);
    }
  }, [groups.length, submission?.id]);

  const activeTab = tabs[activeTabIndex] || null;
  const activeSub = activeTab?.submission || submission;
  const sentences = activeTab?.sentences || [];
  const timestamps = (activeSub?.recording_timestamps as RecordingTimestamp[] | null) || [];
  const activeHomeworkTitle = activeTab?.homeworkTitle || homeworkTitle;
  const activePassageId = activeTab?.passageId || passageId;
  const activeHomeworkId = activeTab?.homeworkId || homeworkId;

  // --- Per-tab state ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [teacherNote, setTeacherNote] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const RATING_CATEGORIES = [
    "단어", "구문끊어읽기", "속도", "해석/내용파악", "주변소음",
    "한글발음", "말 더듬", "말투", "자신감"
  ] as const;

  // Sync state when active tab changes
  useEffect(() => {
    if (activeSub?.id) {
      const raw = activeSub.teacher_note || "";
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
    }
  }, [activeSub?.id]);

  // Audio source management
  const blobUrlRef = useRef<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [usedBlobFallback, setUsedBlobFallback] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const pendingPlayRef = useRef(false);

  useEffect(() => {
    setAudioReady(false);
    setUsedBlobFallback(false);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    // Reset audio element first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setAudioSrc(null);
    const url = activeSub?.recording_url;
    if (!url || !open) return;
    // Small delay to ensure React has cleared previous state
    const timer = setTimeout(() => {
      setAudioSrc(url);
    }, 50);
    return () => clearTimeout(timer);
  }, [activeSub?.recording_url, activeSub?.id, open]);

  // Magic byte detection
  const detectAudioMimeType = (buffer: ArrayBuffer): string[] => {
    const bytes = new Uint8Array(buffer.slice(0, 12));
    const header = Array.from(bytes);
    if (header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3) return ["audio/webm;codecs=opus", "audio/webm", "video/webm"];
    if (header[0] === 0x4F && header[1] === 0x67 && header[2] === 0x67 && header[3] === 0x53) return ["audio/ogg;codecs=opus", "audio/ogg"];
    if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) return ["audio/mp4", "audio/aac", "audio/x-m4a"];
    if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) return ["audio/wav"];
    if ((header[0] === 0xFF && (header[1] & 0xE0) === 0xE0) || (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33)) return ["audio/mpeg"];
    return [];
  };

  const tryBlobFallback = useCallback(async () => {
    const url = activeSub?.recording_url;
    if (!url || usedBlobFallback) return;
    setUsedBlobFallback(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const detectedTypes = detectAudioMimeType(arrayBuffer);
      const mimeTypesToTry = [...detectedTypes, "audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", ""];
      const uniqueTypes = [...new Set(mimeTypesToTry)];
      for (const mime of uniqueTypes) {
        const testBlob = new Blob([arrayBuffer], mime ? { type: mime } : undefined);
        const testUrl = URL.createObjectURL(testBlob);
        const canPlay = await new Promise<boolean>((resolve) => {
          const testAudio = new Audio();
          testAudio.preload = "auto";
          const timeout = setTimeout(() => resolve(false), 3000);
          testAudio.oncanplay = () => { clearTimeout(timeout); resolve(true); };
          testAudio.onerror = () => { clearTimeout(timeout); resolve(false); };
          testAudio.src = testUrl;
        });
        if (canPlay) {
          blobUrlRef.current = testUrl;
          setAudioSrc(testUrl);
          return;
        } else {
          URL.revokeObjectURL(testUrl);
        }
      }
      toast.error("이 녹음 파일은 현재 브라우저에서 재생할 수 없습니다.");
    } catch {
      toast.error("오디오 파일을 불러올 수 없습니다.");
    }
  }, [activeSub?.recording_url, usedBlobFallback]);

  const handleAudioCanPlay = () => {
    setAudioReady(true);
    if (pendingPlayRef.current && audioRef.current) {
      pendingPlayRef.current = false;
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        if (err.name !== "AbortError") toast.error("오디오 재생에 실패했습니다.");
      });
    }
  };
  const handleAudioError = () => {
    // Ignore errors when no src is set (happens when clearing audio)
    if (!audioSrc) return;
    if (!usedBlobFallback) { tryBlobFallback(); return; }
    toast.error("오디오 파일을 불러올 수 없습니다.");
    setIsPlaying(false);
    setAudioReady(false);
  };
  const handleAudioLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const handleAudioTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = audio.currentTime;
    setCurrentTime(time);
    if (timestamps.length > 0) {
      let foundIdx = -1;
      for (let i = 0; i < timestamps.length; i++) {
        if (time >= timestamps[i].startTime && time < timestamps[i].endTime) { foundIdx = i; break; }
      }
      if (foundIdx === -1) {
        for (let i = timestamps.length - 1; i >= 0; i--) {
          if (time >= timestamps[i].startTime) { foundIdx = i; break; }
        }
      }
      if (foundIdx !== -1 && foundIdx !== currentSentenceIndex) setCurrentSentenceIndex(foundIdx);
    }
  };
  const handleAudioEnded = () => setIsPlaying(false);

  // Cleanup on close
  useEffect(() => {
    if (!open && audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    if (!open && blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    if (!open) setAudioSrc(null);
  }, [open]);

  // Auto-scroll to current sentence
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    sentenceRefs.current[currentSentenceIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentSentenceIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); pendingPlayRef.current = false; }
    else {
      if (!audioReady) { pendingPlayRef.current = true; toast.info("오디오를 로딩 중입니다. 잠시만 기다려주세요."); return; }
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        if (err.name !== "AbortError") toast.error("오디오 재생에 실패했습니다.");
      });
    }
  };

  const jumpToSentence = (index: number) => {
    const audio = audioRef.current;
    if (!audio || !timestamps[index]) return;
    if (!audioReady) { toast.info("오디오를 로딩 중입니다."); return; }
    audio.currentTime = timestamps[index].startTime;
    setCurrentSentenceIndex(index);
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        if (err.name !== "AbortError") toast.error("오디오 재생에 실패했습니다.");
      });
    }
  };

  const skipPrevious = () => { if (currentSentenceIndex > 0) jumpToSentence(currentSentenceIndex - 1); };
  const skipNext = () => { if (currentSentenceIndex < sentences.length - 1) jumpToSentence(currentSentenceIndex + 1); };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Save mutation - marks ALL submissions in the active group as completed
  const updateMutation = useMutation({
    mutationFn: async ({ note, status, notificationType: nType }: { note: string; status: string; notificationType?: "sms" | "kakao" | null }) => {
      if (!activeGroup || tabs.length === 0) throw new Error("제출물이 없습니다.");

      // Get all submission IDs in this group
      const allSubIds = tabs.map((t: any) => t.submission.id);
      const reviewedAt = new Date().toISOString();

      // Update ALL submissions in the group at once
      const { error } = await supabase
        .from("homework_submissions")
        .update({ teacher_note: note, status, reviewed_at: reviewedAt })
        .in("id", allSubIds);
      if (error) throw error;

      if (status === "completed") {
        // Send ONE notification for the whole group
        if (nType) {
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
            let feedbackMsg = formatMessage(templates.reviewTaskReview, { studentName });
            if (ratingText) feedbackMsg += `\n\n[평가]\n${ratingText}`;
            if (teacherNote) feedbackMsg += `\n\n[코멘트]\n${teacherNote}`;
            const response = await supabase.functions.invoke("send-kakao-notification", {
              body: { studentId, studentName, submissionType: "review", messageTemplate: feedbackMsg, brandPrefix: templates.brandPrefix, messageType: nType, ownerCodeId: session?.accessCodeId },
            });
            if (response.data?.success) toast.success(`${nType === "sms" ? "문자" : "카카오톡"} 발송 완료!`);
            else if (response.data?.insufficientBalance) toast.error("💰 솔라피 잔액이 부족합니다.");
            else if (response.data?.needsApiKey) toast.error(response.data.error);
          } catch (e) { console.error("Notification error:", e); }
        }
        // 녹음파일은 검토 후 2주간 보관되며, 서버(cleanup-old-recordings)에서 자동 삭제됩니다.
      }
      return { status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rt-submissions-status"] });
      queryClient.invalidateQueries({ queryKey: ["rt-submissions-only"] });
      queryClient.invalidateQueries({ queryKey: ["student-all-rt-submissions", studentId] });
      queryClient.invalidateQueries({ queryKey: ["as-rt-subs"] });
      queryClient.invalidateQueries({ queryKey: ["rt-homework"] });
      if (data.status === "completed") {
        toast.success("검토 완료! 피드백이 저장되었습니다.");
        // Move to next unreviewed group
        const nextUnreviewedGroup = groups.findIndex((g: any, i: number) => i !== activeGroupIndex && !g.allCompleted);
        if (nextUnreviewedGroup !== -1) {
          setActiveGroupIndex(nextUnreviewedGroup);
          setActivePassageIndex(0);
        } else {
          onOpenChange(false);
        }
      } else {
        toast.success("피드백이 저장되었습니다.");
      }
    },
    onError: () => { toast.error("피드백 저장에 실패했습니다."); },
  });

  const handleSave = (status: "reviewed" | "pending", nType?: "sms" | "kakao" | null) => {
    const dbStatus = status === "reviewed" ? "completed" : status;
    const hasRatings = Object.keys(ratings).length > 0;
    const combinedNote = hasRatings ? `[RATINGS:${JSON.stringify(ratings)}]\n${teacherNote}` : teacherNote;
    updateMutation.mutate({ note: combinedNote, status: dbStatus, notificationType: nType ?? null });
  };

  // No submission at all
  if (!submission?.recording_url && !activeTab) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              녹음 재생
            </DialogTitle>
            <DialogDescription>{studentName} · {homeworkTitle}</DialogDescription>
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
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        {/* ===== 헤더 ===== */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-[15px] tracking-tight">리뷰 녹음 재생</h2>
                <p className="text-[11px] text-white/60 mt-0.5">
                  {studentName} · {tabs.length === 1 ? `#${activeTabIndex + 1} ` : ""}{activeGroup?.groupTitle || homeworkTitle}{tabs.length > 1 ? ` (${activeTabIndex + 1}/${tabs.length}지문)` : ""}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] font-bold border-0 px-2.5 py-1 ${
                activeGroup?.allCompleted
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {activeGroup?.allCompleted ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" />확인완료</>
              ) : (
                <><Clock className="w-3 h-3 mr-1" />검토대기</>
              )}
            </Badge>
          </div>
        </div>

        {/* ===== 그룹 네비게이션 ===== */}
        {groups.length > 1 && (
          <div className="flex-shrink-0 flex gap-1.5 overflow-x-auto px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            {groups.map((group: any, gi: number) => {
              const isActive = gi === activeGroupIndex;
              return (
                <button
                  key={group.groupKey}
                  onClick={() => {
                    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
                    setActiveGroupIndex(gi);
                    setActivePassageIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-slate-800 text-white shadow-md"
                      : group.allCompleted
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {group.allCompleted && <CheckCircle2 className="w-3 h-3" />}
                  {group.groupTitle.length > 18 ? group.groupTitle.substring(0, 18) + "..." : group.groupTitle}
                  {group.passages.length > 1 && <span className="text-[9px] opacity-60">({group.passages.length})</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* ===== 지문 탭 ===== */}
        {tabs.length > 1 && (
          <div className="flex-shrink-0 overflow-x-auto px-4 py-2.5 bg-white border-b border-slate-100">
            <div className="flex gap-2">
              {tabs.map((tab: any, idx: number) => {
                const isActive = idx === activeTabIndex;
                return (
                  <button
                    key={tab.submissionId}
                    onClick={() => {
                      if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
                      setActiveTabIndex(idx);
                    }}
                    className={`group relative flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-xl text-[12px] font-medium transition-all whitespace-nowrap border ${
                      isActive
                        ? "bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200 text-violet-800 shadow-sm"
                        : "bg-slate-50/50 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`${isActive ? "font-bold" : ""}`}>
                      {tab.passageTitle.length > 20 ? tab.passageTitle.substring(0, 20) + "..." : tab.passageTitle}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-3 h-1 rounded-full bg-violet-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio element - always mounted */}
        <audio
          ref={audioRef}
          src={audioSrc || undefined}
          preload="auto"
          onCanPlay={handleAudioCanPlay}
          onError={handleAudioError}
          onLoadedMetadata={handleAudioLoadedMetadata}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          style={{ display: "none" }}
        />

        {/* ===== 문장 목록 ===== */}
        <ScrollArea className="flex-1 min-h-0 max-h-[42vh]">
          <div className="px-4 py-3 space-y-1">
            {/* 지문 제목 배너 */}
            {tabs.length > 1 && activeTab && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 mb-2 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50/50 border border-violet-100">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-[10px] font-black text-white">{activeTabIndex + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-violet-800 truncate">{activeTab.passageTitle}</p>
                </div>
                <span className="text-[10px] font-semibold text-violet-400 bg-violet-100 px-2 py-0.5 rounded-full">
                  {sentences.length}문장
                </span>
              </div>
            )}
            {sentences.length > 0 ? (
              sentences.map((sentence: string, index: number) => {
                const isActive = index === currentSentenceIndex;
                const isPast = index < currentSentenceIndex;
                const hasTiming = timestamps[index] !== undefined;
                return (
                  <div
                    key={index}
                    ref={(el) => (sentenceRefs.current[index] = el)}
                    onClick={() => hasTiming && jumpToSentence(index)}
                    className={`flex items-start gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-primary/90 to-primary/70 text-white shadow-lg shadow-primary/20 ring-1 ring-primary/30"
                        : isPast
                        ? "bg-slate-50/80 hover:bg-slate-100/80"
                        : hasTiming
                        ? "bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100"
                        : "bg-slate-50/30 opacity-40"
                    } ${hasTiming ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                      isActive 
                        ? "bg-white/25 text-white" 
                        : isPast 
                        ? "bg-emerald-100 text-emerald-500" 
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                    </div>
                    <p className={`flex-1 text-[13px] leading-relaxed ${
                      isActive ? "font-medium text-white" : isPast ? "text-slate-400" : "text-slate-700"
                    }`}>{sentence}</p>
                    {hasTiming && (
                      <span className={`text-[10px] font-mono flex-shrink-0 mt-0.5 ${
                        isActive ? "text-white/60" : "text-slate-300"
                      }`}>
                        {formatTime(timestamps[index].startTime)}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mic className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">지문 정보를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* ===== 오디오 컨트롤러 ===== */}
        {audioSrc && (
          <div className="flex-shrink-0 mx-4 mb-3 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* 프로그레스 바 */}
            <div className="space-y-1.5 mb-3">
              <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden group cursor-pointer"
                onClick={(e) => {
                  if (!audioRef.current || !duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const pct = x / rect.width;
                  audioRef.current.currentTime = pct * duration;
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-violet-400 to-primary rounded-full transition-all duration-75"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            {/* 컨트롤 버튼 */}
            <div className="flex items-center justify-center gap-3">
              <Button variant="ghost" size="icon" onClick={skipPrevious} disabled={currentSentenceIndex === 0} className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 h-9 w-9">
                <SkipBack className="w-4 h-4" />
              </Button>
              <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 transition-all flex items-center justify-center active:scale-95">
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>
              <Button variant="ghost" size="icon" onClick={skipNext} disabled={currentSentenceIndex >= sentences.length - 1} className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 h-9 w-9">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 녹음 파일 삭제됨 안내 */}
        {!audioSrc && activeGroup?.allCompleted && (
          <div className="flex-shrink-0 mx-4 mb-3 p-3 rounded-xl bg-slate-50 text-center border border-slate-100">
            <p className="text-[12px] text-slate-400">녹음 파일이 정리되었습니다 (검토 완료)</p>
          </div>
        )}

        {/* ===== 피드백 섹션 ===== */}
        <div className="flex-shrink-0 px-5 pb-5 pt-3 space-y-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-violet-100 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-violet-500" />
            </div>
            <span className="text-[12px] font-bold text-slate-700">선생님 피드백</span>
          </div>

          {/* 별점 평가 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1.5 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
            {RATING_CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap min-w-[72px]">{cat}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const val = ratings[cat] || 0;
                    const isFull = val >= star;
                    const isHalf = !isFull && val === star - 0.5;
                    return (
                      <button
                        key={star}
                        type="button"
                        disabled={activeGroup?.allCompleted}
                        onClick={() => setRatings((prev) => {
                          const cur = prev[cat] || 0;
                          if (cur === star) return { ...prev, [cat]: star - 0.5 };
                          if (cur === star - 0.5) return { ...prev, [cat]: 0 };
                          return { ...prev, [cat]: star };
                        })}
                        className={`p-0.5 transition-colors ${activeGroup?.allCompleted ? "cursor-default" : "hover:scale-110"}`}
                      >
                        {isHalf ? (
                          <span className="relative inline-block w-3.5 h-3.5">
                            <Star className="w-3.5 h-3.5 text-slate-200 absolute inset-0" />
                            <StarHalf className="w-3.5 h-3.5 fill-amber-400 text-amber-400 absolute inset-0" />
                          </span>
                        ) : (
                          <Star className={`w-3.5 h-3.5 ${isFull ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {activeGroup?.allCompleted ? (
            teacherNote ? (
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{teacherNote}</p>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                <p className="text-[12px] text-slate-400">코멘트 없음</p>
              </div>
            )
          ) : (
            <Textarea
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="학생에게 전달할 피드백을 입력하세요..."
              className="min-h-[72px] resize-none rounded-xl border-slate-200 bg-white text-[13px]"
            />
          )}

          {/* 버튼 */}
          {activeGroup?.allCompleted ? (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-[12px]">닫기</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-2.5 sm:justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-[12px]">닫기</Button>
              <Button
                onClick={() => handleSave("reviewed", "sms")}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12px] shadow-sm"
              >
                <img src={iconSms} alt="SMS" className="w-4 h-4 mr-1.5" />
                문자 검토완료
              </Button>
              <Button
                onClick={() => handleSave("reviewed", "kakao")}
                disabled={updateMutation.isPending}
                className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-[12px] shadow-sm"
              >
                <img src={iconKakao} alt="카카오톡" className="w-4 h-4 mr-1.5" />
                카톡 검토완료
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
