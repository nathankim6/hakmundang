import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AudioLines, BadgeCheck, CheckCheck, ChevronRight, Clock, MessageCircle, MessageSquare, Mic, Send, Star, StarHalf, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { RTRecordingPlayerDialog } from "./RTRecordingPlayerDialog";
import { QuickMessageDialog } from "./QuickMessageDialog";
import { QuickKakaoDialog } from "./QuickKakaoDialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getMessageTemplates, formatMessage } from "@/components/notifications/MessageTemplateDialog";

interface RecordingTimestamp {
  sentenceIndex: number;
  startTime: number;
  endTime: number;
}

interface HomeworkSubmission {
  id: string;
  submitted_at: string | null;
  status: string;
  recording_url?: string | null;
  recording_timestamps?: unknown;
  teacher_note?: string | null;
  reviewed_at?: string | null;
}




interface RTSubmissionStatusProps {
  selectedDate?: Date;
}

interface SelectedStudent {
  studentId: string;
  studentName: string;
  homeworkId: string;
  homeworkTitle: string;
  passageId?: string;
  submission: HomeworkSubmission | null;
  allSetSubmissions?: Array<{
    homeworkId: string;
    homeworkTitle: string;
    passageId?: string;
    submission: HomeworkSubmission;
  }>;
}

export function RTSubmissionStatus({ selectedDate }: RTSubmissionStatusProps = {}) {
  const queryClient = useQueryClient();
  const { ownerCodeId, shouldFilter } = useOwnerFilter();
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkRatings, setBulkRatings] = useState<Record<string, number>>({});
  const [bulkNote, setBulkNote] = useState("");
  const { session } = useAuth();

  const RATING_CATEGORIES = [
    "단어", "구문끊어읽기", "속도", "해석/내용파악", "주변소음",
    "한글발음", "말 더듬", "말투", "자신감"
  ] as const;

  const [messageChoiceStudent, setMessageChoiceStudent] = useState<{ id: string; name: string; student_phone?: string | null; parent_phone?: string | null; incompleteAssignments?: { title: string; passageTitle?: string; dueDate: string }[] } | null>(null);
  const [messageStudent, setMessageStudent] = useState<{ id: string; name: string; student_phone?: string | null; parent_phone?: string | null } | null>(null);
  const [messageType, setMessageType] = useState<"sms" | "kakao" | null>(null);
  const [filterUnreviewed, setFilterUnreviewed] = useState(false);
  const [titleListDialog, setTitleListDialog] = useState<{ studentName: string; titles: string[] } | null>(null);
  
  // 실시간 구독
  useEffect(() => {
    const channel = supabase
      .channel('rt-submissions-admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homework_submissions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["rt-submitted-recordings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // 제출된 녹음 과제 조회 (submitted_at이 있는 것만)
  const { data: submittedRecordings = [], isLoading } = useQuery({
    queryKey: ["rt-submitted-recordings", ownerCodeId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from("homework_submissions")
        .select(`
          id, student_id, homework_id, submitted_at, status, recording_url, recording_timestamps, teacher_note, reviewed_at,
          homework:homework_id(
            id, title, type, round, passage_id, target_grade_id, owner_code_id, homework_group_id, due_date,
            passage:passage_id(id, title),
            grade:target_grade_id(id, name, school:school_id(id, name, logo_url))
          ),
          student:student_id(id, name, student_phone, parent_phone, grade:grade_id(id, name, school:school_id(id, name, logo_url)))
        `)
        .not("submitted_at", "is", null)
        .not("recording_url", "is", null)
        .order("submitted_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter to rt_review type and apply owner filter
      let filtered = (data || []).filter((s: any) => s.homework?.type === "rt_review");
      
      if (shouldFilter && ownerCodeId) {
        filtered = filtered.filter((s: any) => s.homework?.owner_code_id === ownerCodeId);
      }
      
      return filtered;
    },
    staleTime: 10000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });

  // 과 번호 추출 헬퍼 (예: "2과-1" → "2과", "1과 Further Reading" → "1과")
  const extractLesson = (title: string): string => {
    const match = title.match(/(\d+과)/);
    return match ? match[1] : title;
  };

  // 같은 학생이 제출한 녹음은 모두 하나의 카드로 묶기
  const groupedRecordings = useMemo(() => {
    const groups: { key: string; recs: any[]; latestSubmittedAt: string }[] = [];

    // student_id로 분류
    const byStudent = new Map<string, any[]>();
    submittedRecordings.forEach((rec: any) => {
      const list = byStudent.get(rec.student_id) || [];
      list.push(rec);
      byStudent.set(rec.student_id, list);
    });

    byStudent.forEach((recs, studentId) => {
      const sorted = [...recs].sort((a, b) =>
        new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
      );
      groups.push({
        key: `student-${studentId}`,
        recs: sorted,
        latestSubmittedAt: sorted[sorted.length - 1].submitted_at,
      });
    });

    // 최신 제출 순 정렬
    groups.sort((a, b) => new Date(b.latestSubmittedAt).getTime() - new Date(a.latestSubmittedAt).getTime());
    return groups;
  }, [submittedRecordings]);


  const unreviewedGroups = useMemo(() => 
    groupedRecordings.filter(g => g.recs.some((r: any) => !r.reviewed_at && !r.teacher_note)),
    [groupedRecordings]
  );

  const unreviewedRecordings = useMemo(() => 
    submittedRecordings.filter((s: any) => !s.reviewed_at && !s.teacher_note),
    [submittedRecordings]
  );

  const displayGroups = filterUnreviewed ? unreviewedGroups : groupedRecordings;

  // 전체 확인처리 mutation
  const bulkConfirmAllMutation = useMutation({
    mutationFn: async ({ nType }: { nType: "sms" | "kakao" | "none" }) => {
      // 학생당 1개 그룹만 처리 (여러 그룹이 있으면 첫 번째만)
      const seenStudents = new Set<string>();
      const groupsToProcess: any[] = [];
      for (const group of unreviewedGroups) {
        const studentId = group.recs[0]?.student_id;
        if (!studentId || seenStudents.has(studentId)) continue;
        seenStudents.add(studentId);
        groupsToProcess.push(group);
      }
      const allUnreviewed = groupsToProcess.flatMap((g) => g.recs.filter((r: any) => !r.reviewed_at && !r.teacher_note));
      if (allUnreviewed.length === 0) throw new Error("미확인 과제가 없습니다.");
      
      const hasRatingsData = Object.keys(bulkRatings).length > 0;
      const combinedNote = hasRatingsData
        ? `[RATINGS:${JSON.stringify(bulkRatings)}]\n${bulkNote}`
        : bulkNote;
      
      const ids = allUnreviewed.map((r: any) => r.id);
      
      // 일괄 DB 업데이트
      const { error } = await supabase
        .from("homework_submissions")
        .update({
          teacher_note: combinedNote,
          status: "completed",
          reviewed_at: new Date().toISOString(),
        })
        .in("id", ids);
      if (error) throw error;
      
      // 발송 없이 확인처리만 하는 경우
      if (nType === "none") {
        return { count: ids.length, studentCount: 0, noSend: true };
      }
      
      // 학생별로 알림 1건씩 발송
      const byStudent = new Map<string, any>();
      allUnreviewed.forEach((r: any) => {
        if (!byStudent.has(r.student_id)) {
          byStudent.set(r.student_id, r);
        }
      });
      
      const templates = await getMessageTemplates(session?.accessCodeId);
      const ratingText = Object.entries(bulkRatings)
        .filter(([, v]) => v > 0)
        .map(([cat, val]) => {
          const full = Math.floor(val);
          const half = val % 1 !== 0;
          const empty = 5 - full - (half ? 1 : 0);
          return `${cat}: ${"★".repeat(full)}${"☆".repeat(half ? 1 + empty : empty)} (${val}점)`;
        })
        .join("\n");
      
      const sendPromises = Array.from(byStudent.entries()).map(async ([, rec]) => {
        const studentName = (rec.student as any)?.name || "학생";
        const studentId = rec.student_id;
        let feedbackMsg = formatMessage(templates.reviewTaskReview, { studentName });
        if (ratingText) feedbackMsg += `\n\n[평가]\n${ratingText}`;
        if (bulkNote) feedbackMsg += `\n\n[코멘트]\n${bulkNote}`;
        
        try {
          await supabase.functions.invoke("send-kakao-notification", {
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
        } catch (e) {
          console.error("Notification error for", studentName, e);
        }
      });
      
      await Promise.all(sendPromises);
      return { count: ids.length, studentCount: byStudent.size, noSend: false };
    },
    onSuccess: (data) => {
      if (data.noSend) {
        toast.success(`${data.count}건 확인처리 완료! (발송 없음, 학생 앱에서 피드백 확인 가능)`);
      } else {
        toast.success(`${data.count}건 전체 확인 완료! ${data.studentCount}명에게 피드백 발송 중...`);
      }
      setBulkConfirmOpen(false);
      setBulkRatings({});
      setBulkNote("");
      queryClient.invalidateQueries({ queryKey: ["rt-submitted-recordings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "전체 확인처리에 실패했습니다.");
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderGroupCard = (group: { key: string; recs: any[]; latestSubmittedAt: string }) => {
    const firstRec = group.recs[0];
    const groupCount = group.recs.length;
    const allReviewed = group.recs.every((r: any) => r.reviewed_at || r.teacher_note);
    const someReviewed = group.recs.some((r: any) => r.reviewed_at || r.teacher_note);
    const studentName = (firstRec.student as any)?.name || "알 수 없음";
    const schoolName = (firstRec.student as any)?.grade?.school?.name || "";
    const schoolLogo = (firstRec.student as any)?.grade?.school?.logo_url || "";
    const gradeName = (firstRec.student as any)?.grade?.name || "";
    const titles = group.recs.map((r: any) => {
      const title = (r.homework as any)?.title?.replace("녹음 과제: ", "") || "";
      const round = (r.homework as any)?.round || 1;
      return `${title} (${round}차시)`;
    });

    return (
      <button
        key={group.key}
        onClick={() => {
          if (groupCount > 1) {
            const allSubs = group.recs.map((r: any) => ({
              homeworkId: r.homework_id,
              homeworkTitle: (r.homework as any)?.title || "",
              passageId: (r.homework as any)?.passage?.id,
              submission: {
                id: r.id,
                submitted_at: r.submitted_at,
                status: r.status,
                recording_url: r.recording_url,
                recording_timestamps: r.recording_timestamps,
                teacher_note: r.teacher_note,
                reviewed_at: r.reviewed_at,
              },
            }));
            setSelectedStudent({
              studentId: firstRec.student_id,
              studentName,
              homeworkId: firstRec.homework_id,
              homeworkTitle: (firstRec.homework as any)?.title || "",
              passageId: (firstRec.homework as any)?.passage?.id,
              submission: allSubs[0].submission,
              allSetSubmissions: allSubs,
            });
          } else {
            setSelectedStudent({
              studentId: firstRec.student_id,
              studentName,
              homeworkId: firstRec.homework_id,
              homeworkTitle: (firstRec.homework as any)?.title || "",
              passageId: (firstRec.homework as any)?.passage?.id,
              submission: {
                id: firstRec.id,
                submitted_at: firstRec.submitted_at,
                status: firstRec.status,
                recording_url: firstRec.recording_url,
                recording_timestamps: firstRec.recording_timestamps,
                teacher_note: firstRec.teacher_note,
                reviewed_at: firstRec.reviewed_at,
              },
            });
          }
          setDialogOpen(true);
        }}
        className={cn(
          "group w-full flex flex-col items-start gap-1.5 p-2.5 rounded-xl border transition-all text-left relative overflow-hidden",
          allReviewed
            ? "bg-card border-border/60 hover:shadow-md hover:border-primary/20 opacity-70"
            : "bg-card border-amber-200/60 hover:shadow-md hover:border-amber-300"
        )}
      >
        <div className="flex items-center gap-2 w-full">
          {schoolLogo ? (
            <img src={schoolLogo} alt="" className="w-6 h-6 rounded-md object-contain bg-muted/50 flex-shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0">
              <Mic className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-foreground leading-tight truncate">{studentName}</span>
              {groupCount > 1 && (
                <span className="flex-shrink-0 w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
                  {groupCount}
                </span>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground leading-tight truncate">{schoolName} {gradeName}</p>
          </div>
        </div>
        <div className="w-full flex flex-wrap gap-1 py-0.5 pl-0 sm:pl-8">
          {titles.slice(0, 6).map((t: string, i: number) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 max-w-full text-[10px] leading-tight px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/50 text-muted-foreground"
            >
              <span className="font-bold text-foreground/70">{i + 1}</span>
              <span className="truncate">{t}</span>
            </span>
          ))}
          {titles.length > 6 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setTitleListDialog({ studentName, titles }); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setTitleListDialog({ studentName, titles }); } }}
              className="inline-flex items-center text-[10px] leading-tight px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-semibold hover:bg-primary/20 cursor-pointer"
            >
              +{titles.length - 6}개
            </span>
          )}
        </div>

        <div className="flex items-center justify-between w-full pl-0 sm:pl-8 pt-0.5">
          <span className="text-[9px] text-muted-foreground/60">
            {firstRec.submitted_at ? format(new Date(firstRec.submitted_at), "M/d HH:mm") : ""}
          </span>
          <span className={cn(
            "text-[8px] font-semibold px-1.5 py-0.5 rounded-full",
            allReviewed
              ? "bg-primary/10 text-primary"
              : someReviewed
                ? "bg-amber-100 text-amber-700"
                : "bg-amber-50 text-amber-600"
          )}>
            {allReviewed ? "확인완료" : someReviewed ? "일부확인" : "확인대기"}
          </span>
        </div>
        {groupCount === 1 && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (!window.confirm(`${studentName}의 이 녹음 제출을 삭제하시겠습니까?`)) return;
              try {
                if (firstRec.recording_url) {
                  const path = firstRec.recording_url.split("/rt-recordings/")[1];
                  if (path) {
                    await supabase.storage.from("rt-recordings").remove([decodeURIComponent(path)]);
                  }
                }
                const { error } = await supabase
                  .from("homework_submissions")
                  .update({
                    status: "pending",
                    submitted_at: null,
                    recording_url: null,
                    recording_timestamps: null,
                    teacher_note: null,
                    reviewed_at: null,
                  })
                  .eq("id", firstRec.id);
                if (error) throw error;
                toast.success("제출이 삭제되었습니다.");
                queryClient.invalidateQueries({ queryKey: ["rt-submitted-recordings"] });
              } catch (err) {
                console.error("Delete failed:", err);
                toast.error("삭제에 실패했습니다.");
              }
            }}
            className="p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
            title="제출 삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </button>
    );
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="relative sec-copper sec-header py-1.5 px-3.5 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.05]" style={{
          background: 'radial-gradient(ellipse at center, white 0%, transparent 70%)',
        }} />
        <div className="relative flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <AudioLines className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-[10px] font-medium text-white/60 uppercase tracking-wide leading-none">
                녹음 과제
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight">
                  제출 현황
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {unreviewedRecordings.length > 0 && (
              <button
                onClick={() => setBulkConfirmOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/50 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                전체 확인 처리
              </button>
            )}
            <button
              onClick={() => setFilterUnreviewed(prev => !prev)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors",
                filterUnreviewed
                  ? "bg-amber-500/30 text-amber-200 border border-amber-400/30"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              <Clock className="w-3 h-3" />
              미확인 과제 
            </button>
            <div className="text-right">
              <div className="text-xl font-bold">
                {unreviewedRecordings.length}<span className="text-white/50 font-normal">건</span>
              </div>
              <div className="text-[10px] text-white/50">
                미확인
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3 px-3">
        {displayGroups.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{filterUnreviewed ? "미확인 녹음 과제가 없습니다." : "제출된 녹음 과제가 없습니다."}</p>
          </div>
        ) : (
          <>
            {/* 미확인 과제 */}
            {(() => {
              const unreviewed = displayGroups.filter(g => g.recs.some((r: any) => !r.reviewed_at && !r.teacher_note));
              if (unreviewed.length === 0) return null;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {unreviewed.map((group) => renderGroupCard(group))}
                </div>
              );
            })()}

            {/* 확인완료 과제 */}
            {!filterUnreviewed && (() => {
              const reviewed = displayGroups.filter(g => g.recs.every((r: any) => r.reviewed_at || r.teacher_note));
              if (reviewed.length === 0) return null;
              return (
                <>
                  <div className="flex items-center gap-2 my-3">
                    <div className="h-px flex-1 bg-border/50" />
                    <span className="text-[10px] font-medium text-muted-foreground/60 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      확인완료 {reviewed.length}건
                    </span>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {reviewed.map((group) => renderGroupCard(group))}
                  </div>
                </>
              );
            })()}
          </>
        )}
      </CardContent>




      {/* 녹음 재생 다이얼로그 */}
      {selectedStudent && (
        <RTRecordingPlayerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          studentName={selectedStudent.studentName}
          studentId={selectedStudent.studentId}
          homeworkId={selectedStudent.homeworkId}
          homeworkTitle={selectedStudent.homeworkTitle}
          passageId={selectedStudent.passageId}
          allSetSubmissions={selectedStudent.allSetSubmissions?.map(s => ({
            homeworkId: s.homeworkId,
            homeworkTitle: s.homeworkTitle,
            passageId: s.passageId,
            submission: {
              id: s.submission.id,
              recording_url: s.submission.recording_url,
              recording_timestamps: s.submission.recording_timestamps as RecordingTimestamp[] | null,
              submitted_at: s.submission.submitted_at,
              status: s.submission.status,
              teacher_note: s.submission.teacher_note,
              reviewed_at: s.submission.reviewed_at,
            },
          }))}
          submission={selectedStudent.submission ? {
            id: selectedStudent.submission.id,
            recording_url: selectedStudent.submission.recording_url,
            recording_timestamps: selectedStudent.submission.recording_timestamps as RecordingTimestamp[] | null,
            submitted_at: selectedStudent.submission.submitted_at,
            status: selectedStudent.submission.status,
            teacher_note: selectedStudent.submission.teacher_note,
            reviewed_at: selectedStudent.submission.reviewed_at,
          } : null}
        />
      )}

      {/* 미제출 학생 메시지 발송 선택 팝업 */}
      <Dialog open={!!messageChoiceStudent} onOpenChange={(open) => !open && setMessageChoiceStudent(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="sec-copper sec-header p-4">
            <DialogHeader>
              <DialogTitle className="text-white text-sm flex items-center gap-2">
                <Send className="w-4 h-4" />
                {messageChoiceStudent?.name}에게 알림 발송
              </DialogTitle>
              <DialogDescription className="text-white/60 text-xs">
                미완료 과제 확인 및 알림 발송
              </DialogDescription>
            </DialogHeader>
          </div>
          {/* 미완료 과제 리스트 */}
          {messageChoiceStudent?.incompleteAssignments && messageChoiceStudent.incompleteAssignments.length > 0 && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-destructive" />
                미완료 과제 ({messageChoiceStudent.incompleteAssignments.length}건)
              </p>
              <div className="space-y-1">
                {messageChoiceStudent.incompleteAssignments.map((hw, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-destructive/5 border border-destructive/10">
                    <span className="text-[11px] font-semibold text-destructive/70 flex-shrink-0">#{idx + 1}</span>
                    <span className="text-[11px] text-foreground truncate flex-1">
                      {hw.passageTitle || hw.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      ~{format(new Date(hw.dueDate + "T00:00:00"), "M/d")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 발송 버튼 */}
          <div className="p-4 pt-2 flex gap-3">
            <button
              className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-blue-400 hover:bg-blue-50 transition-all"
              onClick={() => {
                setMessageStudent(messageChoiceStudent);
                setMessageType("sms");
                setMessageChoiceStudent(null);
              }}
            >
              <MessageSquare className="w-8 h-8 shrink-0" strokeWidth={1.75} />
              <span className="text-xs font-semibold">문자 발송</span>
            </button>
            <button
              className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-yellow-400 hover:bg-yellow-50 transition-all"
              onClick={() => {
                setMessageStudent(messageChoiceStudent);
                setMessageType("kakao");
                setMessageChoiceStudent(null);
              }}
            >
              <MessageCircle className="w-8 h-8 shrink-0" strokeWidth={1.75} />
              <span className="text-xs font-semibold">카톡 발송</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS 발송 */}
      {messageStudent && messageType === "sms" && (
        <QuickMessageDialog
          open={true}
          onOpenChange={(open) => { if (!open) { setMessageStudent(null); setMessageType(null); }}}
          studentId={messageStudent.id}
          studentName={messageStudent.name}
          studentPhone={messageStudent.student_phone}
          parentPhone={messageStudent.parent_phone}
        />
      )}

      {/* 카톡 발송 */}
      {messageStudent && messageType === "kakao" && (
        <QuickKakaoDialog
          open={true}
          onOpenChange={(open) => { if (!open) { setMessageStudent(null); setMessageType(null); }}}
          studentId={messageStudent.id}
          studentName={messageStudent.name}
          studentPhone={messageStudent.student_phone}
          parentPhone={messageStudent.parent_phone}
        />
      )}

      {/* 전체 확인처리 다이얼로그 */}
      <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-600" />
              전체 확인처리
            </DialogTitle>
            <DialogDescription>
              {(() => {
                const seen = new Set<string>();
                let processCount = 0;
                for (const g of unreviewedGroups) {
                  const sid = g.recs[0]?.student_id;
                  if (!sid || seen.has(sid)) continue;
                  seen.add(sid);
                  processCount += g.recs.filter((r: any) => !r.reviewed_at && !r.teacher_note).length;
                }
                const remaining = unreviewedRecordings.length - processCount;
                return remaining > 0
                  ? `학생당 1개 그룹씩 ${processCount}건을 확인처리합니다. (${remaining}건은 다음 처리에 남김)`
                  : `미확인 녹음 과제 ${processCount}건을 일괄 확인처리하고 피드백을 발송합니다.`;
              })()}
            </DialogDescription>
          </DialogHeader>

          {/* 대상 학생 목록 */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">대상 학생</p>
            <div className="flex flex-wrap gap-1.5">
              {(() => {
                const studentSet = new Map<string, { name: string; count: number }>();
                unreviewedRecordings.forEach((r: any) => {
                  const name = (r.student as any)?.name || "알 수 없음";
                  const existing = studentSet.get(r.student_id);
                  if (existing) {
                    existing.count++;
                  } else {
                    studentSet.set(r.student_id, { name, count: 1 });
                  }
                });
                return Array.from(studentSet.values()).map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px]">
                    {s.name} ({s.count}건)
                  </Badge>
                ));
              })()}
            </div>
          </div>

          {/* 별점 평가 */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">평가 (선택사항)</p>
            <div className="grid grid-cols-2 gap-2">
              {RATING_CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-muted/30">
                  <span className="text-[11px] text-muted-foreground">{cat}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const current = bulkRatings[cat] || 0;
                      const isFull = val <= Math.floor(current);
                      const isHalf = !isFull && val === Math.ceil(current) && current % 1 !== 0;
                      return (
                        <button
                          key={val}
                          onClick={() => {
                            setBulkRatings(prev => {
                              const cur = prev[cat] || 0;
                              if (cur === val) return { ...prev, [cat]: val - 0.5 };
                              if (cur === val - 0.5) return { ...prev, [cat]: 0 };
                              return { ...prev, [cat]: val };
                            });
                          }}
                          className="p-0"
                        >
                          {isFull ? (
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ) : isHalf ? (
                            <StarHalf className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ) : (
                            <Star className="w-3.5 h-3.5 text-muted-foreground/30" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 코멘트 */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">코멘트 (선택사항)</p>
            <Textarea
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              placeholder="모든 학생에게 동일하게 전송될 피드백을 입력하세요..."
              className="min-h-[80px] text-sm"
            />
          </div>

          {/* 발송 버튼 */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3">
              <button
                disabled={bulkConfirmAllMutation.isPending}
                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50"
                onClick={() => bulkConfirmAllMutation.mutate({ nType: "sms" })}
              >
                <MessageSquare className="w-8 h-8 shrink-0" strokeWidth={1.75} />
                <span className="text-xs font-semibold">문자로 전체 발송</span>
              </button>
              <button
                disabled={bulkConfirmAllMutation.isPending}
                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-yellow-400 hover:bg-yellow-50 transition-all disabled:opacity-50"
                onClick={() => bulkConfirmAllMutation.mutate({ nType: "kakao" })}
              >
                <MessageCircle className="w-8 h-8 shrink-0" strokeWidth={1.75} />
                <span className="text-xs font-semibold">카톡으로 전체 발송</span>
              </button>
            </div>
            <button
              disabled={bulkConfirmAllMutation.isPending}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-emerald-400 hover:bg-emerald-50 transition-all disabled:opacity-50"
              onClick={() => bulkConfirmAllMutation.mutate({ nType: "none" })}
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">발송 없이 확인처리만</span>
              <span className="text-[10px] text-muted-foreground">(학생 앱에서 피드백 확인 가능)</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 전체 과제 목록 팝업 */}
      <Dialog open={!!titleListDialog} onOpenChange={(o) => !o && setTitleListDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{titleListDialog?.studentName} 제출 과제 전체</DialogTitle>
            <DialogDescription className="text-xs">
              총 {titleListDialog?.titles.length ?? 0}개
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-1 pr-1">
            {titleListDialog?.titles.map((t, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-[11px] font-bold text-primary w-5 shrink-0 text-right">{i + 1}</span>
                <span className="text-[12px] text-foreground leading-snug">{t}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
