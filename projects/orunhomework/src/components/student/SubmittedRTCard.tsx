import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Mic, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface SubmittedRTCardProps {
  submission: {
    id: string;
    submitted_at: string | null;
    status: string;
    reviewed_at: string | null;
    teacher_note: string | null;
    homework: {
      id: string;
      title: string;
      due_date: string;
    } | null;
  };
  onEdit: () => void;
  isLate?: boolean;
  displayTitle?: string;
}

export function SubmittedRTCard({ submission, onEdit, isLate = false, displayTitle }: SubmittedRTCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // 스토리지에서 녹음 파일 삭제
      const { data: currentSub } = await supabase
        .from("homework_submissions")
        .select("recording_url")
        .eq("id", submission.id)
        .single();
      
      if (currentSub?.recording_url) {
        try {
          const url = new URL(currentSub.recording_url);
          const pathMatch = url.pathname.match(/\/object\/public\/rt-recordings\/(.+)/);
          if (pathMatch) {
            await supabase.storage.from("rt-recordings").remove([decodeURIComponent(pathMatch[1])]);
          }
        } catch (e) {
          console.warn("녹음 파일 삭제 실패:", e);
        }
      }

      const { error } = await supabase
        .from("homework_submissions")
        .update({ 
          submitted_at: null, 
          recording_url: null,
          recording_timestamps: null,
          status: "pending" 
        })
        .eq("id", submission.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("제출이 취소되었습니다. 다시 제출할 수 있습니다.");
      queryClient.invalidateQueries({ queryKey: ["student-rt-submissions"] });
    },
    onError: () => {
      toast.error("취소에 실패했습니다.");
    },
  });

  const isReviewed = submission.status === "completed";
  const submittedDate = submission.submitted_at ? new Date(submission.submitted_at) : null;

  const shortTitle = displayTitle || (submission.homework?.title || "리뷰 과제").replace("리뷰 과제: ", "");

  return (
    <>
      {/* 컴팩트한 한 줄 레이아웃 */}
      <div 
        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors cursor-pointer group overflow-x-auto"
        onClick={() => setShowFeedback(true)}
      >
        {/* 아이콘 */}
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Mic className="w-4 h-4 text-accent" />
        </div>

        {/* 과제명 */}
        <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">
          {shortTitle}
        </span>

        {/* 제출 시간 */}
        {submittedDate && (
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {format(submittedDate, 'M/d HH:mm')}
          </span>
        )}

        {/* 스페이서 */}
        <div className="flex-1" />

        {/* 상태 배지들 */}
        <div className="flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
          {isLate && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-600 whitespace-nowrap">
              지각
            </span>
          )}
          {isReviewed ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-600 flex items-center gap-0.5 whitespace-nowrap">
              <CheckCircle2 className="w-2.5 h-2.5" />확인완료
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-100 text-blue-600 flex items-center gap-0.5 whitespace-nowrap">
              <Clock className="w-2.5 h-2.5" />대기
            </span>
          )}
        </div>

        {/* 제출 취소 버튼 */}
        {!isReviewed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        )}
      </div>

      {/* 피드백 보기 다이얼로그 */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              선생님 피드백
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">과제</p>
              <p className="text-sm font-semibold text-blue-600">{submission.homework?.title?.replace("리뷰 과제: ", "")}</p>
            </div>
            {submission.teacher_note ? (
              (() => {
                const ratingsMatch = submission.teacher_note!.match(/\[RATINGS:(.*?)\]/);
                const textPart = submission.teacher_note!.replace(/\[RATINGS:.*?\]\n?/, "").trim();
                let ratings: Record<string, number> = {};
                if (ratingsMatch) {
                  try { ratings = JSON.parse(ratingsMatch[1]); } catch {}
                }
                const hasRatings = Object.keys(ratings).length > 0;
                
                return (
                  <div className="space-y-3">
                    {hasRatings && (
                      <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100/60">
                        <p className="text-[11px] font-semibold text-purple-400 mb-2 tracking-wide">평가 항목</p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {Object.entries(ratings).map(([cat, val]) => {
                            const full = Math.floor(val as number);
                            const half = (val as number) % 1 >= 0.5;
                            const empty = 5 - full - (half ? 1 : 0);
                            return (
                              <div key={cat} className="flex items-center gap-2">
                                <span className="text-[11px] text-muted-foreground w-[72px] truncate text-right" title={cat}>{cat}</span>
                                <div className="flex items-center gap-px">
                                  {Array.from({ length: full }).map((_, i) => (
                                    <span key={`f${i}`} className="text-amber-400 text-[11px]">★</span>
                                  ))}
                                  {half && <span className="text-amber-400 text-[11px] opacity-60">★</span>}
                                  {Array.from({ length: empty }).map((_, i) => (
                                    <span key={`e${i}`} className="text-muted-foreground/20 text-[11px]">★</span>
                                  ))}
                                </div>
                                <span className="text-[10px] text-muted-foreground/60 font-mono">{val as number}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {textPart && (
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100/40">
                        <p className="text-sm text-foreground leading-relaxed">{textPart}</p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="p-4 bg-muted/30 rounded-xl border border-border text-center">
                <p className="text-sm text-muted-foreground">아직 피드백이 없습니다</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>제출을 취소하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              제출이 취소되면 다시 녹음하여 제출해야 합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              제출 취소
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
