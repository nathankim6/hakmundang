import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getMessageTemplates, formatMessage } from "@/components/notifications/MessageTemplateDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, CheckCircle2, Loader2, Users } from "lucide-react";
import iconSms from "@/assets/icon-sms.png";
import iconKakao from "@/assets/icon-kakao.png";

interface StudentToReview {
  studentId: string;
  studentName: string;
  submissionIds: string[];
  recordingUrls: (string | null)[];
}

interface BulkRTReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentToReview[];
  sessionLabel: string;
}

const RATING_CATEGORIES = [
  "단어", "구문끊어읽기", "속도", "해석/내용파악", "주변소음",
  "한글발음", "말 더듬", "말투", "자신감"
] as const;

export function BulkRTReviewDialog({ open, onOpenChange, students, sessionLabel }: BulkRTReviewDialogProps) {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [teacherNote, setTeacherNote] = useState("");

  const handleRatingClick = (category: string, value: number) => {
    setRatings(prev => {
      const current = prev[category] || 0;
      // If clicking same star, toggle half
      if (current === value) return { ...prev, [category]: value - 0.5 };
      if (current === value - 0.5) return { ...prev, [category]: 0 };
      return { ...prev, [category]: value };
    });
  };

  const bulkMutation = useMutation({
    mutationFn: async (notificationType: "sms" | "kakao" | null) => {
      const hasRatings = Object.keys(ratings).some(k => ratings[k] > 0);
      const combinedNote = hasRatings ? `[RATINGS:${JSON.stringify(ratings)}]\n${teacherNote}` : teacherNote;
      const reviewedAt = new Date().toISOString();

      // Collect all submission IDs
      const allSubIds = students.flatMap(s => s.submissionIds);

      // Update all submissions at once
      const { error } = await supabase
        .from("homework_submissions")
        .update({ teacher_note: combinedNote, status: "completed", reviewed_at: reviewedAt })
        .in("id", allSubIds);
      if (error) throw error;

      // 녹음파일은 검토 후 2주간 보관되며, 서버(cleanup-old-recordings)에서 자동 삭제됩니다.

      // Send notifications
      if (notificationType) {
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

        let successCount = 0;
        for (const student of students) {
          try {
            let feedbackMsg = formatMessage(templates.reviewTaskReview, { studentName: student.studentName });
            if (ratingText) feedbackMsg += `\n\n[평가]\n${ratingText}`;
            if (teacherNote) feedbackMsg += `\n\n[코멘트]\n${teacherNote}`;

            const response = await supabase.functions.invoke("send-kakao-notification", {
              body: {
                studentId: student.studentId,
                studentName: student.studentName,
                submissionType: "review",
                messageTemplate: feedbackMsg,
                brandPrefix: templates.brandPrefix,
                messageType: notificationType,
                ownerCodeId: session?.accessCodeId,
              },
            });
            if (response.data?.success) successCount++;
            else if (response.data?.insufficientBalance) {
              toast.error("💰 솔라피 잔액이 부족합니다.");
              break;
            }
          } catch (e) { console.error("Notification error for", student.studentName, e); }
        }
        if (successCount > 0) {
          toast.success(`${notificationType === "sms" ? "문자" : "카카오톡"} ${successCount}명 발송 완료!`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rt-submissions-only"] });
      queryClient.invalidateQueries({ queryKey: ["rt-submissions-status"] });
      queryClient.invalidateQueries({ queryKey: ["rt-homework"] });
      queryClient.invalidateQueries({ queryKey: ["as-rt-subs"] });
      toast.success(`${students.length}명 전체 확인처리 완료!`);
      onOpenChange(false);
      setRatings({});
      setTeacherNote("");
    },
    onError: () => { toast.error("전체 확인처리에 실패했습니다."); },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5" />
              전체 확인처리
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs">
              {sessionLabel} · {students.length}명에게 동일한 피드백을 발송합니다
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-5">
          {/* Target students */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">대상 학생 ({students.length}명)</p>
            <div className="flex flex-wrap gap-1.5">
              {students.map(s => (
                <span key={s.studentId} className="text-[11px] px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/50">
                  {s.studentName}
                </span>
              ))}
            </div>
          </div>

          {/* Rating categories */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">별점 평가</p>
            <div className="space-y-1.5">
              {RATING_CATEGORIES.map(cat => {
                const currentRating = ratings[cat] || 0;
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-[11px] text-foreground w-24 flex-shrink-0">{cat}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button
                          key={v}
                          onClick={() => handleRatingClick(cat, v)}
                          className="p-0 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              v <= Math.floor(currentRating)
                                ? "fill-amber-400 text-amber-400"
                                : v - 0.5 === currentRating
                                ? "fill-amber-400/50 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                      {currentRating > 0 && (
                        <span className="text-[10px] text-muted-foreground ml-1">{currentRating}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher note */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">코멘트</p>
            <Textarea
              value={teacherNote}
              onChange={e => setTeacherNote(e.target.value)}
              placeholder="모든 학생에게 동일하게 전달할 코멘트를 입력하세요..."
              className="text-sm min-h-[80px]"
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2 border-t">
            <p className="text-[11px] font-semibold text-muted-foreground">확인처리 + 피드백 발송</p>
            <div className="flex gap-2">
              <Button
                onClick={() => bulkMutation.mutate("sms")}
                disabled={bulkMutation.isPending}
                className="flex-1 gap-2"
                variant="outline"
              >
                {bulkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <img src={iconSms} alt="SMS" className="w-5 h-5" />}
                문자 발송
              </Button>
              <Button
                onClick={() => bulkMutation.mutate("kakao")}
                disabled={bulkMutation.isPending}
                className="flex-1 gap-2"
                variant="outline"
              >
                {bulkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <img src={iconKakao} alt="카톡" className="w-5 h-5 rounded" />}
                카톡 발송
              </Button>
            </div>
            <Button
              onClick={() => bulkMutation.mutate(null)}
              disabled={bulkMutation.isPending}
              variant="secondary"
              className="w-full gap-2"
            >
              {bulkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              발송 없이 확인처리만
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
