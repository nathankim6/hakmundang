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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Mic, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Pencil, 
  Trash2,
  MoreHorizontal,
  AlertTriangle
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
}

export function SubmittedRTCard({ submission, onEdit, isLate = false }: SubmittedRTCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
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

  // 과제 제목 간략화
  const shortTitle = submission.homework?.title 
    ? (submission.homework.title.length > 15 
        ? submission.homework.title.substring(0, 15) + "..." 
        : submission.homework.title)
    : "녹음 과제";

  return (
    <>
      {/* 컴팩트한 한 줄 레이아웃 */}
      <div 
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/30 transition-colors cursor-pointer group"
        onClick={() => setShowFeedback(true)}
      >
        {/* 아이콘 */}
        <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Mic className="w-3 h-3 text-accent" />
        </div>

        {/* 과제명 */}
        <span className="text-[12px] font-semibold text-slate-700 break-all" title={submission.homework?.title}>
          {submission.homework?.title}
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
        <div className="flex items-center gap-1">
          {isReviewed ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-600 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />확인완료
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-100 text-blue-600 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />확인대기
            </span>
          )}
        </div>

        {/* 메뉴 버튼 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-28">
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onEdit(); }} 
              className="gap-2 text-xs"
              disabled={isReviewed}
            >
              <Pencil className="w-3.5 h-3.5" />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }} 
              className="gap-2 text-xs text-destructive focus:text-destructive"
              disabled={isReviewed}
            >
              <Trash2 className="w-3.5 h-3.5" />
              취소
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
              <p className="text-sm font-medium">{submission.homework?.title}</p>
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
