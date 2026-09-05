import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { CheckCircle, Loader2, MessageCircle, MessageSquare, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { QuickMessageDialog } from "@/components/dashboard/QuickMessageDialog";
import { QuickKakaoDialog } from "@/components/dashboard/QuickKakaoDialog";

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
  target_grade_id: string;
  round: number;
  homework_submissions: Submission[];
}

export function RTSubmissionStatus({ passageId, passageTitle, gradeId }: RTSubmissionStatusProps) {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<{ student: Student; submission: Submission; homeworkId: string; homeworkTitle: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageStudent, setMessageStudent] = useState<Student | null>(null);
  const [messageType, setMessageType] = useState<"sms" | "kakao" | null>(null);
  const [showStudentList, setShowStudentList] = useState(false);

  const { data: homeworkData, isLoading: isLoadingHomework } = useQuery({
    queryKey: ["rt-homework", passageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homework")
        .select(`
          id, title, due_date, target_grade_id, round,
          homework_submissions(id, status, submitted_at, reviewed_at, teacher_note, recording_url, recording_timestamps, student_id, homework_id)
        `)
        .eq("passage_id", passageId)
        .order("round", { ascending: true });
      if (error) throw error;
      return data as unknown as HomeworkWithSubmissions[];
    },
  });

  const targetGradeId = homeworkData?.[0]?.target_grade_id || gradeId;

  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["grade-students", targetGradeId],
    queryFn: async () => {
      if (!targetGradeId) return [];
      const { data, error } = await supabase
        .from("students")
        .select("id, name, student_phone, parent_phone")
        .eq("grade_id", targetGradeId)
        .order("name");
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!targetGradeId,
  });

  // Fetch school logo for this grade
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

  // 실시간 구독: homework_submissions 변경 시 자동 갱신
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

  // Group by round
  const roundData = useMemo(() => {
    if (!homeworkData) return [];
    const rounds: { round: number; hw: HomeworkWithSubmissions[] }[] = [];
    const byRound = new Map<number, HomeworkWithSubmissions[]>();
    homeworkData.forEach(h => {
      const r = h.round || 1;
      if (!byRound.has(r)) byRound.set(r, []);
      byRound.get(r)!.push(h);
    });
    byRound.forEach((hw, round) => rounds.push({ round, hw }));
    rounds.sort((a, b) => a.round - b.round);
    return rounds;
  }, [homeworkData]);

  const maxRound = Math.max(3, ...(roundData.length > 0 ? roundData.map(r => r.round) : [3]));

  // For the latest/active round, compute submitted/pending
  const activeRoundHw = roundData.length > 0 ? roundData[roundData.length - 1] : null;
  const allSubmissions = activeRoundHw?.hw.flatMap(h => h.homework_submissions || []).filter(Boolean) || [];
  
  const submittedStudents = students.filter(student => 
    allSubmissions.some(s => s?.student_id === student.id && s?.submitted_at)
  );
  const pendingStudents = students.filter(student => 
    allSubmissions.some(s => s?.student_id === student.id) && !allSubmissions.some(s => s?.student_id === student.id && s?.submitted_at)
  );
  const reviewedStudents = students.filter(student =>
    allSubmissions.some(s => s?.student_id === student.id && s?.reviewed_at)
  );

  // Per-round completion stats
  const roundStats = useMemo(() => {
    return roundData.map(({ round, hw }) => {
      const subs = hw.flatMap(h => h.homework_submissions || []);
      const submitted = subs.filter(s => s.submitted_at).length;
      const total = subs.length;
      return { round, submitted, total };
    });
  }, [roundData]);

  // Per-student, per-round submission status
  const getStudentRoundStatus = (studentId: string, round: number): { submitted: boolean; reviewed: boolean; submission: Submission | null } => {
    const roundHw = roundData.find(r => r.round === round);
    if (!roundHw) return { submitted: false, reviewed: false, submission: null };
    const subs = roundHw.hw.flatMap(h => h.homework_submissions || []);
    const sub = subs.find(s => s.student_id === studentId);
    if (!sub) return { submitted: false, reviewed: false, submission: null };
    return { submitted: !!sub.submitted_at, reviewed: !!sub.reviewed_at, submission: sub };
  };

  const getSubmissionForStudent = (studentId: string): Submission | null => {
    const allSubs = homeworkData?.flatMap(h => h.homework_submissions || []).filter(Boolean) || [];
    return allSubs.find(s => s.student_id === studentId && s.submitted_at) || allSubs.find(s => s.student_id === studentId) || null;
  };

  const handleOpenFeedback = (student: Student) => {
    const submission = getSubmissionForStudent(student.id);
    if (submission && submission.submitted_at) {
      const hw = homeworkData?.find(h => h.homework_submissions.some(s => s.id === submission.id));
      setSelectedStudent({ 
        student, 
        submission, 
        homeworkId: hw?.id || "", 
        homeworkTitle: hw?.title || "" 
      });
      setDialogOpen(true);
    }
  };

  // Click a specific round's submission
  const handleOpenRoundFeedback = (student: Student, round: number) => {
    const { submission } = getStudentRoundStatus(student.id, round);
    if (submission && submission.submitted_at) {
      const hw = homeworkData?.find(h => h.homework_submissions.some(s => s.id === submission.id));
      setSelectedStudent({ 
        student, 
        submission, 
        homeworkId: hw?.id || "", 
        homeworkTitle: hw?.title || "" 
      });
      setDialogOpen(true);
    }
  };

  const isLoading = isLoadingHomework || isLoadingStudents;

  if (!isLoadingHomework && (!homeworkData || homeworkData.length === 0)) return null;

  const totalStudents = students.length;
  const submitted = submittedStudents.length;
  const reviewed = reviewedStudents.length;
  const pending = pendingStudents.length;

  const schoolLogo = cacheBustUrl(schoolInfo?.school?.logo_url);
  const schoolInitial = schoolInfo?.school?.name?.[0] || "?";

  // Count how many rounds each student has submitted
  const getStudentSubmittedRounds = (studentId: string) => {
    let count = 0;
    for (const rd of roundData) {
      const { submitted } = getStudentRoundStatus(studentId, rd.round);
      if (submitted) count++;
    }
    return count;
  };

  return (
    <>
      {/* Student grid card */}
      <div className="rounded-lg border border-border/50 bg-muted/30 text-xs w-full max-w-full overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/30 bg-muted/50">
              <span className="text-muted-foreground">제출</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{submitted}</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-bold">{totalStudents}명</span>
              {reviewed > 0 && (
                <span className="text-blue-600 dark:text-blue-400 text-[10px] ml-1">({reviewed}명 검토완료)</span>
              )}
              <div className="flex-1" />
              {maxRound > 1 && (
                <span className="text-[10px] text-muted-foreground">최대 {maxRound}회차</span>
              )}
            </div>

            {/* Student list */}
            <div className="divide-y divide-border/20">
              {students.map(student => {
                const submittedRounds = getStudentSubmittedRounds(student.id);
                const hasAnySubmission = submittedRounds > 0;
                
                return (
                  <div 
                    key={student.id}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/40 transition-colors"
                  >
                    {/* Student name */}
                    <span className={cn(
                      "font-medium w-12 sm:w-16 truncate flex-shrink-0",
                      !hasAnySubmission && "text-muted-foreground"
                    )}>
                      {student.name}
                    </span>

                    {/* Round status dots */}
                    <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto no-scrollbar">
                      {Array.from({ length: maxRound }, (_, i) => i + 1).map((round) => {
                        const status = getStudentRoundStatus(student.id, round);
                        return (
                          <button
                            key={round}
                            onClick={() => status.submitted ? handleOpenRoundFeedback(student, round) : undefined}
                            disabled={!status.submitted}
                            className={cn(
                              "inline-flex items-center justify-center min-w-[28px] h-5 rounded text-[10px] font-bold border transition-all",
                              status.reviewed
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700 cursor-pointer hover:ring-1 hover:ring-emerald-400/50"
                                : status.submitted
                                ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 cursor-pointer hover:ring-1 hover:ring-amber-400/50"
                                : "bg-muted/60 text-muted-foreground/40 border-border/30 cursor-default"
                            )}
                            title={
                              status.reviewed ? `${round}회차 - 검토완료 (클릭하여 피드백)` :
                              status.submitted ? `${round}회차 - 제출됨 (클릭하여 피드백)` :
                              `${round}회차 - 미제출`
                            }
                          >
                            {status.reviewed ? "✓" : status.submitted ? round : "—"}
                          </button>
                        );
                      })}
                    </div>

                    {/* Total & action */}
                    <span className={cn(
                      "text-[10px] w-10 text-right flex-shrink-0",
                      submittedRounds === maxRound 
                        ? "text-emerald-600 dark:text-emerald-400 font-bold" 
                        : submittedRounds > 0 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                    )}>
                      {submittedRounds}/{maxRound}회
                    </span>

                    {/* Message button for non-submitted */}
                    {!hasAnySubmission && (
                      <button
                        onClick={() => { setMessageStudent(student); setMessageType(null); }}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700 hover:ring-1 hover:ring-pink-400/50 transition-all flex-shrink-0"
                      >
                        알림
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 학생 명단 다이얼로그 */}
      <Dialog open={showStudentList} onOpenChange={setShowStudentList}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              제출 현황 ({submitted}/{totalStudents})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* 미제출 학생 */}
            {pendingStudents.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  미제출 ({pendingStudents.length}명)
                </p>
                <div className="space-y-1.5">
                  {pendingStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-800/50">
                      <span className="text-sm font-medium">{s.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setShowStudentList(false); setMessageStudent(s); setMessageType(null); }}
                          className="text-[10px] px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                        >
                          알림 보내기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* 제출 완료 학생 */}
            {submittedStudents.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  제출 완료 ({submittedStudents.length}명)
                </p>
                <div className="space-y-1.5">
                  {submittedStudents.map(s => {
                    const sub = getSubmissionForStudent(s.id);
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
                          onClick={() => { setShowStudentList(false); handleOpenFeedback(s); }}
                          className="text-[10px] px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
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

      {/* 녹음 재생 다이얼로그 (대시보드와 동일) */}
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
        <DialogContent className="max-w-xs">
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
              <MessageSquare className="w-8 h-8 shrink-0" strokeWidth={1.75} />
              <div className="text-left">
                <p className="font-semibold text-sm">문자 메시지</p>
                <p className="text-xs text-muted-foreground">SMS/LMS로 발송합니다</p>
              </div>
            </button>
            <button
              onClick={() => setMessageType("kakao")}
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-all"
            >
              <MessageCircle className="w-8 h-8 shrink-0" strokeWidth={1.75} />
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