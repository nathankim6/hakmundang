import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RTRecordingPlayerDialog } from "@/components/dashboard/RTRecordingPlayerDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { QuickMessageDialog } from "@/components/dashboard/QuickMessageDialog";
import { QuickKakaoDialog } from "@/components/dashboard/QuickKakaoDialog";
import iconSms from "@/assets/icon-sms.png";
import iconKakao from "@/assets/icon-kakao.png";

interface RTSubmissionStatusProps {
  passageId: string;
  passageTitle: string;
  gradeId?: string;
}

interface Student {
  id: string;
  name: string;
  student_phone: string | null;
  parent_phone: string | null;
  grade_id: string | null;
  grade: { id: string; name: string } | null;
}


interface Submission {
  id: string;
  status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  teacher_note: string | null;
  recording_url: string | null;
  recording_timestamps: unknown;
  student_id: string;
  homework_id: string;
}

interface HomeworkWithSubmissions {
  id: string;
  title: string;
  due_date: string;
  created_at: string;
  target_grade_id: string;
  homework_submissions: Submission[];
}

interface SessionData {
  sessionNumber: number;
  assignDate: string;
  homeworkEntries: HomeworkWithSubmissions[];
  submissions: Submission[];
  submittedStudents: Student[];
  pendingStudents: Student[];
  reviewedStudents: Student[];
  unreviewedSubmissions: Submission[];
}

export function RTSubmissionStatus({ passageId, passageTitle, gradeId }: RTSubmissionStatusProps) {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<{ student: Student; submission: Submission; homeworkId: string; homeworkTitle: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageStudent, setMessageStudent] = useState<Student | null>(null);
  const [messageType, setMessageType] = useState<"sms" | "kakao" | null>(null);
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0);
  const [isBulkConfirming, setIsBulkConfirming] = useState(false);

  const { data: homeworkData, isLoading: isLoadingHomework } = useQuery({
    queryKey: ["rt-homework", passageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homework")
        .select(`
          id, title, due_date, created_at, target_grade_id,
          homework_submissions(id, status, submitted_at, reviewed_at, teacher_note, recording_url, recording_timestamps, student_id, homework_id)
        `)
        .eq("passage_id", passageId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as HomeworkWithSubmissions[];
    },
  });

  // Fetch all session dates for global session numbering (same logic as dashboard)
  const baseTitle = useMemo(() => {
    if (!homeworkData || homeworkData.length === 0) return "";
    return homeworkData[0].title.replace(/\s*#\d+$/, '');
  }, [homeworkData]);

  const firstGradeId = useMemo(() => {
    return homeworkData?.[0]?.target_grade_id || gradeId || "";
  }, [homeworkData, gradeId]);

  // 같은 학년에 같은 날 배정된 모든 리뷰과제는 동일 차시로 처리
  const { data: allSessionDatesForGrade = [] } = useQuery({
    queryKey: ["rt-session-dates-for-grade", firstGradeId],
    queryFn: async () => {
      if (!firstGradeId) return [];
      const { data, error } = await supabase
        .from("homework")
        .select("created_at, target_grade_id")
        .eq("type", "rt_review")
        .eq("target_grade_id", firstGradeId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!firstGradeId,
    staleTime: 60 * 1000,
  });

  // Build global session number map: same date (KST) in same grade = same 차시
  const globalSessionMap = useMemo(() => {
    const dates = new Set<string>();
    allSessionDatesForGrade.forEach(hw => {
      dates.add(hw.created_at.slice(0, 10));
    });
    const sorted = Array.from(dates).sort();
    const map = new Map<string, number>();
    sorted.forEach((date, idx) => map.set(date, idx + 1));
    return map;
  }, [allSessionDatesForGrade]);

  // Collect all unique grade IDs from homework data
  const allGradeIds = Array.from(
    new Set(
      (homeworkData || [])
        .map(h => h.target_grade_id)
        .filter(Boolean)
    )
  );
  const targetGradeIds = allGradeIds.length > 0 ? allGradeIds : (gradeId ? [gradeId] : []);
  const targetGradeId = targetGradeIds[0] || gradeId;

  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["grade-students-multi", targetGradeIds],
    queryFn: async () => {
      if (targetGradeIds.length === 0) return [];
      const { data, error } = await supabase
        .from("students")
        .select("id, name, student_phone, parent_phone, grade_id, grade:grade_id(id, name)")
        .in("grade_id", targetGradeIds)
        .order("name");
      if (error) throw error;
      return data as Student[];
    },
    enabled: targetGradeIds.length > 0,
  });

  const { data: schoolInfo } = useQuery({
    queryKey: ["grade-school-logo", targetGradeId],
    queryFn: async () => {
      if (!targetGradeId) return null;
      const { data, error } = await supabase
        .from("grades")
        .select("name, school:school_id(name, logo_url)")
        .eq("id", targetGradeId)
        .maybeSingle();
      if (error) throw error;
      return data as { name: string; school: { name: string; logo_url: string | null } } | null;
    },
    enabled: !!targetGradeId,
  });

  // 실시간 구독
  useEffect(() => {
    if (!homeworkData || homeworkData.length === 0) return;
    const homeworkIds = homeworkData.map(h => h.id);
    const channel = supabase
      .channel(`rt-sub-${passageId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homework_submissions' },
        (payload) => {
          const row = payload.new as any;
          if (row && homeworkIds.includes(row.homework_id)) {
            queryClient.invalidateQueries({ queryKey: ["rt-homework", passageId] });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [passageId, homeworkData, queryClient]);

  // Group homework by session (created_at date)
  const sessions: SessionData[] = useMemo(() => {
    if (!homeworkData || homeworkData.length === 0) return [];

    // Group by created_at date
    const sessionMap = new Map<string, HomeworkWithSubmissions[]>();
    homeworkData.forEach(hw => {
      const assignDate = hw.created_at.slice(0, 10);
      if (!sessionMap.has(assignDate)) sessionMap.set(assignDate, []);
      sessionMap.get(assignDate)!.push(hw);
    });

    // Sort by date ascending
    const sortedDates = Array.from(sessionMap.keys()).sort();

    return sortedDates.map(assignDate => {
      const entries = sessionMap.get(assignDate)!;
      const submissions = entries.flatMap(h => h.homework_submissions || []).filter(Boolean);
      
      const submitted = students.filter(student =>
        submissions.some(s => s.student_id === student.id && s.submitted_at)
      );
      const pending = students.filter(student =>
        !submissions.some(s => s.student_id === student.id && s.submitted_at)
      );
      const reviewed = students.filter(student =>
        submissions.some(s => s.student_id === student.id && s.reviewed_at)
      );
      const unreviewed = submissions.filter(s => s.submitted_at && !s.reviewed_at);

      const sessionNumber = globalSessionMap.get(assignDate) || 1;

      return {
        sessionNumber,
        assignDate,
        homeworkEntries: entries,
        submissions,
        submittedStudents: submitted,
        pendingStudents: pending,
        reviewedStudents: reviewed,
        unreviewedSubmissions: unreviewed,
      };
    });
  }, [homeworkData, students, globalSessionMap]);

  // Use latest session as the "current" for backward compat
  const latestSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  const getSubmissionForStudentInSession = (studentId: string, session: SessionData): Submission | null => {
    return session.submissions.find(s => s.student_id === studentId) || null;
  };

  const handleOpenFeedback = (student: Student, session: SessionData) => {
    const submission = getSubmissionForStudentInSession(student.id, session);
    if (submission && submission.submitted_at) {
      const hw = session.homeworkEntries.find(h => h.homework_submissions.some(s => s.id === submission.id));
      setSelectedStudent({
        student,
        submission,
        homeworkId: hw?.id || "",
        homeworkTitle: hw?.title || "",
      });
      setDialogOpen(true);
    }
  };

  const handleBulkConfirm = async (session: SessionData) => {
    if (session.unreviewedSubmissions.length === 0) return;
    if (!confirm(`미검토 ${session.unreviewedSubmissions.length}건을 전체 확인처리하시겠습니까?\n(문자 발송 없이 확인처리만 됩니다)`)) return;

    setIsBulkConfirming(true);
    try {
      const now = new Date().toISOString();
      const submissionIds = session.unreviewedSubmissions.map(s => s.id);

      const { error: updateError } = await supabase
        .from("homework_submissions")
        .update({ status: "completed", reviewed_at: now })
        .in("id", submissionIds);
      if (updateError) throw updateError;

      // 녹음파일은 검토 후 2주간 보관되며, 서버(cleanup-old-recordings)에서 자동 삭제됩니다.


      queryClient.invalidateQueries({ queryKey: ["rt-homework", passageId] });
      toast.success(`${session.unreviewedSubmissions.length}건 확인처리 완료`);
      setShowStudentList(false);
    } catch (err) {
      console.error(err);
      toast.error("확인처리 중 오류가 발생했습니다");
    } finally {
      setIsBulkConfirming(false);
    }
  };

  const groupByGrade = (
    pendingList: Student[],
    submittedList: Student[]
  ) => {
    const groups = new Map<string, { gradeId: string; gradeName: string; pending: Student[]; submitted: Student[] }>();
    [...pendingList, ...submittedList].forEach(student => {
      const grade = student.grade;
      const gradeId = grade?.id || 'unknown';
      const gradeName = grade?.name || '미지정';
      if (!groups.has(gradeId)) {
        groups.set(gradeId, { gradeId, gradeName, pending: [], submitted: [] });
      }
      const group = groups.get(gradeId)!;
      if (pendingList.some(p => p.id === student.id)) group.pending.push(student);
      else group.submitted.push(student);
    });
    return Array.from(groups.values()).sort((a, b) => a.gradeName.localeCompare(b.gradeName, 'ko'));
  };

  const isLoading = isLoadingHomework || isLoadingStudents;

  if (!isLoadingHomework && (!homeworkData || homeworkData.length === 0)) return null;

  const schoolLogo = cacheBustUrl(schoolInfo?.school?.logo_url);
  const schoolInitial = schoolInfo?.school?.name?.[0] || "?";

  // Currently displayed session for dialog
  const currentDialogSession = sessions[selectedSessionIdx] || latestSession;

  return (
    <>
      {/* Per-session inline cards */}
      <div className="flex flex-col gap-1 w-full">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          sessions.map((session, sIdx) => {
            const { submittedStudents: submitted, pendingStudents: pending, reviewedStudents: reviewed, sessionNumber } = session;
            const totalStudents = students.length;

            return (
              <div
                key={session.assignDate}
                className={cn(
                  "flex flex-col gap-2.5 px-3 py-3 sm:px-2.5 sm:py-2 rounded-xl sm:rounded-lg border text-xs w-full min-w-0",
                  pending.length === 0 && submitted.length > 0
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : pending.length > 0
                    ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                    : "bg-muted/50 border-border"
                )}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 min-w-0">
                  {/* Session badge */}
                  <span className="text-[11px] sm:text-[9px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
                    {sessionNumber}차시
                  </span>
                  {passageTitle && (
                    <span className="text-[12px] sm:text-[10px] font-semibold text-foreground/80 truncate max-w-[55%] sm:max-w-[180px]" title={passageTitle}>
                      {passageTitle}
                    </span>
                  )}

                  {/* Stats */}
                  <button
                    onClick={() => { setSelectedSessionIdx(sIdx); setShowStudentList(true); }}
                    className="ml-auto flex items-center gap-1.5 shrink-0 hover:bg-muted/50 active:bg-muted rounded-md px-2 py-1 min-h-[32px] transition-colors cursor-pointer"
                    title="학생 명단 보기"
                  >
                    <div className="flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="font-semibold text-[12px] sm:text-xs">{submitted.length}</span>
                    </div>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-semibold text-foreground text-[12px] sm:text-xs">{totalStudents}</span>
                    {reviewed.length > 0 && (
                      <span className="text-blue-600 dark:text-blue-400 text-[10px] sm:text-[9px]">({reviewed.length}검토)</span>
                    )}
                  </button>
                </div>

                {/* 반별 명단 */}
                <div className="flex flex-col gap-2 w-full min-w-0">
                  {groupByGrade(pending, submitted).map(group => (
                    <div key={group.gradeId} className="flex flex-col gap-1.5 min-w-0">
                      <span className="text-[11px] sm:text-[10px] font-semibold text-muted-foreground">{group.gradeName}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {group.pending.map(s => (
                          <button
                            key={s.id}
                            onClick={() => { setMessageStudent(s); setMessageType(null); }}
                            className="inline-flex items-center text-[12px] sm:text-[9px] px-2 py-1 sm:px-1.5 sm:py-0.5 min-h-[30px] sm:min-h-0 rounded-md bg-pink-100/80 text-pink-800 border border-pink-200/60 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700/50 active:scale-95 hover:ring-1 hover:ring-pink-400/50 transition-all cursor-pointer"
                          >
                            {s.name}
                          </button>
                        ))}
                        {group.submitted.map(s => {
                          const sub = getSubmissionForStudentInSession(s.id, session);
                          const isReviewed = !!sub?.reviewed_at;
                          return (
                            <button
                              key={s.id}
                              onClick={() => handleOpenFeedback(s, session)}
                              className={cn(
                                "inline-flex items-center text-[12px] sm:text-[9px] px-2 py-1 sm:px-1.5 sm:py-0.5 min-h-[30px] sm:min-h-0 rounded-md border transition-all active:scale-95 hover:ring-1 hover:ring-primary/30",
                                isReviewed
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50"
                                  : "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50"
                              )}
                            >
                              {s.name}
                              {isReviewed && <CheckCircle className="w-2.5 h-2.5 inline ml-0.5 text-emerald-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {pending.length === 0 && submitted.length === 0 && (
                    <span className="text-[11px] sm:text-[9px] text-muted-foreground">학생 없음</span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 학생 명단 다이얼로그 */}
      {currentDialogSession && (
        <Dialog open={showStudentList} onOpenChange={setShowStudentList}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <DialogTitle className="text-base flex items-center gap-2">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {currentDialogSession.sessionNumber}차시
                  </span>
                  제출 현황 ({currentDialogSession.submittedStudents.length}/{students.length})
                </DialogTitle>
                {currentDialogSession.unreviewedSubmissions.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkConfirm(currentDialogSession)}
                    disabled={isBulkConfirming}
                    className="text-xs h-8 px-2 gap-1 w-full sm:w-auto border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  >
                    {isBulkConfirming ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCheck className="w-3 h-3" />
                    )}
                    전체 확인처리 ({currentDialogSession.unreviewedSubmissions.length})
                  </Button>
                )}
              </div>
            </DialogHeader>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {currentDialogSession.pendingStudents.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    미제출 ({currentDialogSession.pendingStudents.length}명)
                  </p>
                  <div className="space-y-1.5">
                    {currentDialogSession.pendingStudents.map(s => (
                      <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-800/50">
                        <span className="text-sm font-medium">{s.name}</span>
                        <button
                          onClick={() => { setShowStudentList(false); setMessageStudent(s); setMessageType(null); }}
                          className="text-[11px] px-2.5 py-1.5 min-h-[32px] rounded-md bg-muted hover:bg-muted/80 active:scale-95 transition-all"
                        >
                          알림 보내기
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentDialogSession.submittedStudents.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    제출 완료 ({currentDialogSession.submittedStudents.length}명)
                  </p>
                  <div className="space-y-1.5">
                    {currentDialogSession.submittedStudents.map(s => {
                      const sub = getSubmissionForStudentInSession(s.id, currentDialogSession);
                      const isReviewed = !!sub?.reviewed_at;
                      return (
                        <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{s.name}</span>
                            {isReviewed && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">검토완료</span>
                            )}
                          </div>
                          <button
                            onClick={() => { setShowStudentList(false); handleOpenFeedback(s, currentDialogSession); }}
                            className="text-[11px] px-2.5 py-1.5 min-h-[32px] rounded-md bg-muted hover:bg-muted/80 active:scale-95 transition-all"
                          >
                            피드백
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 녹음 재생 다이얼로그 */}
      {selectedStudent && (
        <RTRecordingPlayerDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedStudent(null);
          }}
          studentName={selectedStudent.student.name}
          studentId={selectedStudent.student.id}
          homeworkId={selectedStudent.homeworkId}
          homeworkTitle={selectedStudent.homeworkTitle}
          passageId={passageId}
          submission={{
            id: selectedStudent.submission.id,
            recording_url: selectedStudent.submission.recording_url,
            recording_timestamps: selectedStudent.submission.recording_timestamps as any,
            submitted_at: selectedStudent.submission.submitted_at,
            status: selectedStudent.submission.status,
            teacher_note: selectedStudent.submission.teacher_note,
            reviewed_at: selectedStudent.submission.reviewed_at,
          }}
        />
      )}

      {/* 메시지 타입 선택 다이얼로그 */}
      <Dialog open={!!messageStudent && !messageType} onOpenChange={(open) => { if (!open) { setMessageStudent(null); setMessageType(null); } }}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {messageStudent?.name}님에게 알림 보내기
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setMessageType("sms")}
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-all"
            >
              <img src={iconSms} alt="SMS" className="w-8 h-8" />
              <div className="text-left">
                <p className="font-semibold text-sm">문자 메시지</p>
                <p className="text-xs text-muted-foreground">SMS/LMS로 발송합니다</p>
              </div>
            </button>
            <button
              onClick={() => setMessageType("kakao")}
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-all"
            >
              <img src={iconKakao} alt="카톡" className="w-8 h-8" />
              <div className="text-left">
                <p className="font-semibold text-sm">카카오톡</p>
                <p className="text-xs text-muted-foreground">알림톡으로 발송합니다</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS 발송 */}
      {messageStudent && messageType === "sms" && (
        <QuickMessageDialog
          open={true}
          onOpenChange={(open) => { if (!open) { setMessageStudent(null); setMessageType(null); } }}
          studentName={messageStudent.name}
          studentId={messageStudent.id}
          studentPhone={messageStudent.student_phone || undefined}
          parentPhone={messageStudent.parent_phone || undefined}
        />
      )}

      {/* 카톡 발송 */}
      {messageStudent && messageType === "kakao" && (
        <QuickKakaoDialog
          open={true}
          onOpenChange={(open) => { if (!open) { setMessageStudent(null); setMessageType(null); } }}
          studentName={messageStudent.name}
          studentId={messageStudent.id}
          studentPhone={messageStudent.student_phone || undefined}
          parentPhone={messageStudent.parent_phone || undefined}
        />
      )}
    </>
  );
}
