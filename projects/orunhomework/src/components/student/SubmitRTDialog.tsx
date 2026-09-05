import { useMemo, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { KaraokeRecorder } from "@/components/recording/KaraokeRecorder";
import {
  Mic,
  CheckCircle2,
  Clock,
  ChevronRight,
  BookOpen,
  ListMusic,
  Layers,
} from "lucide-react";

interface SubmitRTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: any;
  groupItems?: any[];
  allRTSubmissions?: any[];
  onSwitchAssignment?: (submission: any, groupItems: any[]) => void;
  onSuccess: () => void;
}
interface Sentence {
  text: string;
  startTime?: number;
  endTime?: number;
}

// 지문 번호 추출: 제목 끝의 -N 또는 #N
function extractPassageNumber(item: any): number {
  const t = item?.homework?.passages?.title || item?.homework?.title || "";
  const dash = t.match(/-(\d+)\s*$/);
  if (dash) return parseInt(dash[1], 10);
  const hash = t.match(/#(\d+)/);
  if (hash) return parseInt(hash[1], 10);
  return Number.MAX_SAFE_INTEGER;
}

export function SubmitRTDialog({
  open,
  onOpenChange,
  submission,
  groupItems,
  allRTSubmissions,
  onSwitchAssignment,
  onSuccess,
}: SubmitRTDialogProps) {
  const sortedItems = useMemo(() => {
    const list = groupItems && groupItems.length ? groupItems : submission ? [submission] : [];
    return [...list].sort((a, b) => extractPassageNumber(a) - extractPassageNumber(b));
  }, [groupItems, submission]);

  const defaultActive = useMemo(() => {
    return sortedItems.find((s) => !s.submitted_at) || sortedItems[0] || submission;
  }, [sortedItems, submission]);

  const [activeId, setActiveId] = useState<string | undefined>(defaultActive?.id);
  const [showKaraoke, setShowKaraoke] = useState(false);
  const [showAllList, setShowAllList] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveId(defaultActive?.id);
      setShowKaraoke(false);
      setShowAllList(false);
    }
  }, [open, defaultActive?.id]);

  const active = sortedItems.find((s) => s.id === activeId) || defaultActive;
  const passage = active?.homework?.passages;
  const sentences: string[] = passage?.sentences || [];
  const title = passage?.title || active?.homework?.title || "리뷰 과제";

  const submitMutation = useMutation({
    mutationFn: async (data: { audioBlob: Blob; timestamps: Sentence[] }) => {
      const mimeType = data.audioBlob.type || "audio/webm";
      const ext = mimeType.includes("wav")
        ? "wav"
        : mimeType.includes("ogg")
        ? "ogg"
        : mimeType.includes("mp4")
        ? "mp4"
        : "webm";
      const fileName = `${active.id}-${Date.now()}.${ext}`;
      const filePath = `recordings/${fileName}`;

      // 모바일 네트워크에서 업로드가 멈추는 경우를 대비해 타임아웃 + 재시도
      const uploadWithRetry = async () => {
        let lastError: any = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const result = await Promise.race([
              supabase.storage
                .from("rt-recordings")
                .upload(filePath, data.audioBlob, { contentType: mimeType, upsert: true }),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("업로드 시간이 초과되었습니다.")), 90000)
              ),
            ]);
            if ((result as any)?.error) throw (result as any).error;
            return;
          } catch (e) {
            lastError = e;
            console.error(`[RT Upload] attempt ${attempt} failed:`, e);
            if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
          }
        }
        throw new Error(
          `녹음 파일 업로드에 실패했습니다. 네트워크 상태를 확인 후 다시 제출해주세요. (${lastError?.message || "unknown"})`
        );
      };

      await uploadWithRetry();

      const { data: urlData } = supabase.storage.from("rt-recordings").getPublicUrl(filePath);
      const recordingUrl = urlData.publicUrl;


      const { error } = await supabase
        .from("homework_submissions")
        .update({
          submitted_at: new Date().toISOString(),
          recording_timestamps: data.timestamps as any,
          recording_url: recordingUrl,
        })
        .eq("id", active.id);
      if (error) throw error;

      supabase.functions
        .invoke("convert-recording-to-wav", { body: { filePath, bucket: "rt-recordings" } })
        .catch((err) => console.error("[WAV Convert] trigger failed:", err));
    },
    onSuccess: () => {
      toast.success("리뷰 과제가 제출되었습니다! 🎙️");
      setShowKaraoke(false);
      // 다음 미제출 과제로 자동 이동
      const nextPending = sortedItems.find((s) => !s.submitted_at && s.id !== active?.id);
      if (nextPending) setActiveId(nextPending.id);
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "제출에 실패했습니다.");
    },
  });

  const handleSave = async (audioBlob: Blob, sentenceTimestamps: Sentence[]) => {
    await submitMutation.mutateAsync({ audioBlob, timestamps: sentenceTimestamps }).catch(() => {});
  };

  const handleClose = () => {
    setShowKaraoke(false);
    onOpenChange(false);
  };

  const baseTitle = (active?.homework?.title || "")
    .replace(/\s*#\d+$/, "")
    .replace(/^리뷰 과제:\s*/, "")
    .replace(/-\d+\s*$/, "")
    .trim();

  const totalCount = sortedItems.length;
  const doneCount = sortedItems.filter((s) => s.submitted_at).length;
  const pendingCount = totalCount - doneCount;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const isDoneActive = !!active?.submitted_at;

  // 전체 리뷰과제 목록을 그룹(차시) 단위로 묶기
  const allGroups = useMemo(() => {
    const list = (allRTSubmissions && allRTSubmissions.length ? allRTSubmissions : sortedItems) as any[];
    const map = new Map<string, { key: string; baseTitle: string; dueDate: string | null; items: any[] }>();
    list.forEach((s: any) => {
      const t = s?.homework?.title || "";
      const baseTitle = t.replace(/\s*#\d+$/, "").replace(/^리뷰 과제:\s*/, "").replace(/-\d+\s*$/, "").trim();
      const key = s?.homework?.homework_group_id || `${s?.homework?.due_date || "-"}::${baseTitle}`;
      if (!map.has(key)) {
        map.set(key, { key, baseTitle: baseTitle || "리뷰 과제", dueDate: s?.homework?.due_date || null, items: [] });
      }
      map.get(key)!.items.push(s);
    });
    const groups = Array.from(map.values()).map((g) => ({
      ...g,
      items: [...g.items].sort((a, b) => extractPassageNumber(a) - extractPassageNumber(b)),
    }));
    groups.sort((a, b) => {
      const ta = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const tb = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return tb - ta;
    });
    return groups;
  }, [allRTSubmissions, sortedItems]);

  const currentGroupKey = useMemo(() => {
    const s = active || sortedItems[0];
    if (!s) return null;
    const t = s?.homework?.title || "";
    const baseTitle = t.replace(/\s*#\d+$/, "").replace(/^리뷰 과제:\s*/, "").replace(/-\d+\s*$/, "").trim();
    return s?.homework?.homework_group_id || `${s?.homework?.due_date || "-"}::${baseTitle}`;
  }, [active, sortedItems]);

  const handlePickFromAllList = (item: any, groupKey: string) => {
    const sameGroup = groupKey === currentGroupKey;
    if (sameGroup) {
      setActiveId(item.id);
      setShowAllList(false);
      return;
    }
    const targetGroup = allGroups.find((g) => g.key === groupKey)?.items || [item];
    setShowAllList(false);
    if (onSwitchAssignment) {
      onSwitchAssignment(item, targetGroup);
    } else {
      setActiveId(item.id);
    }
  };

  if (showKaraoke && sentences.length > 0) {
    return <KaraokeRecorder title={title} sentences={sentences} onSave={handleSave} onClose={handleClose} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          p-0 border-0 overflow-hidden glass-panel
          w-screen max-w-none h-[100dvh] max-h-[100dvh] rounded-none
          sm:w-full sm:max-w-md sm:h-auto sm:max-h-[92vh] sm:rounded-[2rem]
          flex flex-col font-['Noto_Sans_KR',sans-serif]
        "
      >
        {/* 앰비언트 오브 */}
        <div className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full bg-blue-400/20 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-violet-400/15 blur-[90px]" />

        {/* 헤더 — Liquid Glass */}
        <div className="relative z-10 px-6 pt-[max(env(safe-area-inset-top),22px)] pb-6 glass-hairline border-b border-white/60 flex-shrink-0">
          {/* 모바일 드래그 핸들 */}
          <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-300/70" />

          <div className="relative">
            {/* 상단 타이틀 + 원형 진행 인디케이터 */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-400 mb-1">녹음 과제</p>
                <h2 className="text-slate-900 font-semibold text-[22px] leading-tight tracking-[-0.01em] truncate">
                  {baseTitle || "리뷰 과제"}
                </h2>
                <p className="text-[12px] text-slate-500 mt-1">지문 {totalCount}개</p>
              </div>

              {/* 원형 진행 인디케이터 — 단색 */}
              <div className="relative w-[58px] h-[58px] flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="rgb(226 232 240)"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#0a84ff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress / 100) * 97.39} 97.39`}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-900 text-[14px] font-semibold tabular-nums leading-none">
                    {progress}
                    <span className="text-slate-400 text-[10px] font-medium">%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 메트릭 — 인라인 디바이더 */}
            <div className="flex items-stretch rounded-2xl glass-tile overflow-hidden">
              {[
                { label: "전체", value: totalCount, color: "text-slate-900" },
                { label: "완료", value: doneCount, color: "text-emerald-600" },
                { label: "남음", value: pendingCount, color: "text-amber-600" },
              ].map((m, i) => (
                <div
                  key={m.label}
                  className={`flex-1 px-3 py-2.5 text-center ${i > 0 ? "border-l border-slate-200/60" : ""}`}
                >
                  <p className="text-[11px] text-slate-500 leading-none">{m.label}</p>
                  <p className={`font-semibold text-[19px] leading-none mt-1.5 tabular-nums ${m.color}`}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            {/* 프로그레스 바 */}
            <div className="mt-4 h-[3px] rounded-full bg-slate-200/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0a84ff] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 본문 (스크롤) */}
        <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 pt-5 pb-3">
            {/* 섹션 라벨 */}
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <span className="text-[12px] font-semibold text-slate-700">녹음 순서</span>
              <button
                type="button"
                onClick={() => setShowAllList(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-slate-600 text-[11px] font-medium ring-1 ring-slate-200 hover:bg-slate-50 active:scale-95 transition"
              >
                <Layers className="w-3 h-3" />
                전체 보기
              </button>
            </div>

            {/* 과제 리스트 */}
            <div className="rounded-[1.25rem] glass-tile overflow-hidden divide-y divide-white/60">
              {sortedItems.map((item, idx) => {
                const isActive = item.id === active?.id;
                const isDone = !!item.submitted_at;
                const itemTitle =
                  item?.homework?.passages?.title || item?.homework?.title || "리뷰 과제";
                const numLabel = idx + 1;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveId(item.id);
                      setShowAllList(true);
                    }}
                    className={[
                      "group relative w-full text-left px-4 py-3 transition-colors duration-200 flex items-center gap-3 active:bg-white/70",
                      isActive ? "bg-white/70" : "bg-white/20 hover:bg-white/50",
                    ].join(" ")}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
                    )}


                    {/* 번호 뱃지 — 모노크롬 */}
                    <div
                      className={[
                        "relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-[#0a84ff] text-white"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-[18px] h-[18px]" strokeWidth={2.25} />
                      ) : (
                        <span className="text-[13px] font-semibold tabular-nums leading-none">
                          {numLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={[
                          "text-[13.5px] font-medium leading-tight truncate tracking-tight",
                          isDone ? "text-slate-400" : "text-slate-900",
                        ].join(" ")}
                      >
                        {itemTitle}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[10.5px] text-slate-400 font-normal">
                          ~
                          {item.homework?.due_date
                            ? new Date(item.homework.due_date).toLocaleDateString("ko-KR", {
                                month: "numeric",
                                day: "numeric",
                              })
                            : "-"}
                        </span>
                        {isDone && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-medium bg-emerald-50 text-emerald-600">
                            완료
                          </span>
                        )}
                        {isActive && !isDone && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-[#0a84ff]">
                            선택
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className={[
                        "w-4 h-4 transition-transform flex-shrink-0",
                        isActive ? "text-slate-700 translate-x-0.5" : "text-slate-300",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 선택된 지문 미리보기 — Apple 다크 카드 */}
          {sentences.length > 0 && (
            <div className="px-5 pb-5">
              <div className="rounded-[1.25rem] glass-onyx text-white overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08]">
                  <BookOpen className="w-3.5 h-3.5 text-white/60" strokeWidth={2} />
                  <span className="font-medium text-[12.5px] tracking-tight truncate flex-1">
                    {title}
                  </span>
                  <span className="text-[10px] text-white/50 font-medium tabular-nums">
                    {sentences.length}문장
                  </span>
                </div>
                <div className="px-4 py-3.5 space-y-2.5">
                  {sentences.slice(0, 3).map((sentence, i) => (
                    <p
                      key={i}
                      className="text-[12.5px] text-white/80 leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-white/40 text-[10.5px] font-medium tabular-nums flex-shrink-0 mt-px">
                        {i + 1}
                      </span>
                      <span className="flex-1 line-clamp-2">{sentence}</span>
                    </p>
                  ))}
                  {sentences.length > 3 && (
                    <p className="text-[10.5px] text-white/35 pl-7">
                      외 {sentences.length - 3}개 문장
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 스티키 CTA 푸터 — Liquid Glass */}
        <div className="relative z-10 flex-shrink-0 px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] bg-white/55 backdrop-blur-2xl border-t border-white/70">
          <button
            onClick={() => setShowKaraoke(true)}
            disabled={!sentences.length}
            className="glass-sheen relative w-full h-[54px] rounded-full overflow-hidden bg-gradient-to-b from-sky-400 to-blue-600 text-white font-semibold text-[15px] tracking-tight shadow-[0_18px_36px_-14px_rgba(59,130,246,0.7)] transition-all active:scale-[0.985] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Mic className="w-4 h-4" strokeWidth={2} />
            <span>{isDoneActive ? "다시 녹음하기" : "녹음 시작하기"}</span>
            {!isDoneActive && active && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white/15 text-[10.5px] font-medium tabular-nums">
                #{(sortedItems.findIndex((s) => s.id === active.id) + 1) || 1}
              </span>
            )}
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full mt-1 py-2.5 text-slate-500 text-[13px] font-normal hover:text-slate-700 transition-colors"
          >
            다음에 할게요
          </button>
        </div>

        {/* 전체 리뷰과제 목록 시트 */}
        <Sheet open={showAllList} onOpenChange={setShowAllList}>
          <SheetContent
            side="bottom"
            className="p-0 h-[85dvh] rounded-t-[2rem] border-0 overflow-hidden glass-panel"
          >
            <SheetHeader className="px-5 pt-5 pb-4 bg-white/50 backdrop-blur-xl border-b border-white/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center shadow-[0_10px_20px_-10px_rgba(59,130,246,0.8)]">
                  <ListMusic className="w-4 h-4 text-white" strokeWidth={2} />
                </div>

                <div className="text-left">
                  <SheetTitle className="text-slate-900 text-[16px] font-semibold tracking-tight">
                    전체 리뷰과제 목록
                  </SheetTitle>
                  <p className="text-[10.5px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                    {allGroups.length}개 차시 · 총 {allGroups.reduce((n, g) => n + g.items.length, 0)}문항
                  </p>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 h-[calc(85dvh-92px)]">
              {allGroups.map((g) => {
                const isCurrent = g.key === currentGroupKey;
                const groupDone = g.items.filter((i: any) => i.submitted_at).length;
                return (
                  <div
                    key={g.key}
                    className={[
                      "rounded-[1.25rem] overflow-hidden glass-tile transition-shadow",
                      isCurrent
                        ? "ring-1 ring-primary/40 shadow-[0_18px_40px_-22px_hsl(var(--primary)/0.55)]"
                        : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/50 border-b border-white/70">
                      <div className="min-w-0 flex items-center gap-2">
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-primary/10 text-primary ring-1 ring-primary/20">
                            진행중
                          </span>
                        )}
                        <p className="text-[12.5px] font-semibold text-slate-900 truncate tracking-tight">
                          {g.baseTitle}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 tabular-nums flex-shrink-0">
                        {groupDone}/{g.items.length}
                      </span>
                    </div>
                    <div className="p-2 space-y-1.5">
                      {g.items.map((item: any, idx: number) => {
                        const isItemActive = isCurrent && item.id === active?.id;
                        const isItemDone = !!item.submitted_at;
                        const itemTitle =
                          item?.homework?.passages?.title || item?.homework?.title || "리뷰 과제";
                        return (
                          <button
                            key={item.id}
                            onClick={() => handlePickFromAllList(item, g.key)}
                            className={[
                              "w-full text-left rounded-xl px-2.5 py-2 flex items-center gap-2.5 border transition active:scale-[0.99]",
                              isItemActive
                                ? "bg-primary/10 border-primary/30"
                                : isItemDone
                                ? "bg-white/60 border-white/70 hover:border-emerald-200"
                                : "bg-white/60 border-white/70 hover:border-primary/30 hover:bg-white/80",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                                isItemDone
                                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_8px_16px_-8px_rgba(16,185,129,0.8)]"
                                  : isItemActive
                                  ? "bg-gradient-to-br from-primary to-blue-600 text-white shadow-[0_8px_16px_-8px_hsl(var(--primary))]"
                                  : "bg-white/70 text-slate-500 ring-1 ring-white/80",
                              ].join(" ")}
                            >

                              {isItemDone ? (
                                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                              ) : (
                                <span className="text-[11px] font-black tabular-nums">
                                  {idx + 1}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold text-slate-800 truncate">
                                {itemTitle}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5 text-slate-400" />
                                <span className="text-[9.5px] text-slate-400 font-medium">
                                  ~
                                  {item.homework?.due_date
                                    ? new Date(item.homework.due_date).toLocaleDateString("ko-KR", {
                                        month: "numeric",
                                        day: "numeric",
                                      })
                                    : "-"}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {allGroups.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-[12px] font-semibold">
                  표시할 리뷰과제가 없습니다
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </DialogContent>
    </Dialog>
  );
}
