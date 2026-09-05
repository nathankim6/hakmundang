import { useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { fetchDailyWordPauseState } from "@/hooks/useDailyWordPause";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";
import { Camera, Mic, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, LogOut, Sparkles, Calendar, Heart, X, PenLine, BookOpen, Headphones, ListChecks } from "lucide-react";
import { SubmitDailyWordDialog } from "@/components/student/SubmitDailyWordDialog";
import { SubmitRTDialog } from "@/components/student/SubmitRTDialog";
import { SubmittedDailyWordCard } from "@/components/student/SubmittedDailyWordCard";
import { DailyWordPaginatedList } from "@/components/student/DailyWordPaginatedList";
import { SubmittedRTCard } from "@/components/student/SubmittedRTCard";
import { CommitDeadlineDialog } from "@/components/student/CommitDeadlineDialog";
import { WritingPractice } from "@/components/student/WritingPractice";
import { getTodayQuote } from "@/constants/englishQuotes";
import { SubmissionCalendar } from "@/components/student/SubmissionCalendar";
import orunCharacter from "@/assets/orun-character.png";

function RTGroupCollapsible({ baseTitle, items, onOpen, getStatusBadge, getSessionLabel
}: {baseTitle: string;items: any[];onOpen: (s: any, groupItems?: any[]) => void;getStatusBadge: (s: any) => ReactNode;getSessionLabel: (s: any) => string;}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center gap-2.5 bg-slate-100/90 hover:bg-slate-200/90 transition-all duration-200 border-l-2 border-slate-400">

        <div className="w-5 h-5 rounded-md bg-slate-200/70 flex items-center justify-center">
          {expanded ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
        </div>
        <span className="text-[11px] font-bold text-slate-700 tracking-tight">{baseTitle}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">{items.length}개</span>
        </div>
      </button>
      {expanded && items.map((submission: any) => {
        const label = getSessionLabel(submission);
        return (
          <button
            key={submission.id}
            onClick={() => onOpen(submission, items)}
            className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors duration-150 active:bg-slate-100 pl-7">

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-4 h-4 text-slate-500" strokeWidth={2} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <span className={`font-bold text-[12px] block truncate ${submission.submitted_at ? "text-blue-600" : "text-rose-600"}`}>{label}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">마감 ~{new Date(submission.homework?.due_date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}</span>
                </div>
              </div>
              {getStatusBadge(submission)}
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
          </button>);

      })}
    </div>);

}

export default function StudentDashboard() {
  const {
    session,
    logout
  } = useAuth();
  const queryClient = useQueryClient();
  const [showDailyWordSubmit, setShowDailyWordSubmit] = useState(false);
  const [dailyWordDefaultDate, setDailyWordDefaultDate] = useState<Date | undefined>(undefined);
  const [showRTSubmit, setShowRTSubmit] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [selectedRTGroup, setSelectedRTGroup] = useState<any[]>([]);
  const [showWritingPractice, setShowWritingPractice] = useState(false);
  const [dismissConfirm, setDismissConfirm] = useState<{show: boolean;date: string;}>({ show: false, date: "" });
  const [rtPage, setRtPage] = useState(0);

  // 오늘의 영어 명언
  const todayQuote = getTodayQuote();

  // 학생 정보 조회 (이름, 학교, 학년)
  const {
    data: studentInfo
  } = useQuery({
    queryKey: ["student-info", session?.studentId],
    queryFn: async () => {
      if (!session?.studentId) return null;
      const {
        data,
        error
      } = await supabase.from("students").select(`
          id,
          name,
          grade_id,
          created_at,
          grade:grade_id(
            id,
            name,
            school_id,
            school:school_id(name, logo_url, exam_date)
          )
        `).eq("id", session.studentId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.studentId
  });

  // 실시간 구독 - 학생 정보 업데이트 수신
  useEffect(() => {
    if (!session?.studentId) return;
    const channel = supabase.channel('student-info-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'students',
      filter: `id=eq.${session.studentId}`
    }, (payload) => {
      console.log('Student info realtime update:', payload);
      queryClient.invalidateQueries({
        queryKey: ["student-info", session.studentId]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.studentId, queryClient]);

  // 실시간 구독 - 일일 단어과제 업데이트 수신
  useEffect(() => {
    if (!session?.studentId) return;
    const channel = supabase.channel('daily-word-submissions-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'daily_word_submissions',
      filter: `student_id=eq.${session.studentId}`
    }, (payload) => {
      console.log('Realtime update received:', payload);
      // 데이터 변경 시 자동 리패치
      queryClient.invalidateQueries({
        queryKey: ["today-daily-word", session.studentId]
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-daily-words", session.studentId]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.studentId, queryClient]);

  // 실시간 구독 - 리뷰 과제(homework_submissions) 업데이트 수신
  useEffect(() => {
    if (!session?.studentId) return;
    const channel = supabase.channel('homework-submissions-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'homework_submissions',
      filter: `student_id=eq.${session.studentId}`
    }, (payload) => {
      console.log('Homework submissions realtime update:', payload);
      queryClient.invalidateQueries({
        queryKey: ["student-rt-submissions", session.studentId]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.studentId, queryClient]);

  // 실시간 구독 - 숙제(homework) 삭제/수정 감지
  useEffect(() => {
    if (!session?.studentId) return;
    const channel = supabase.channel('homework-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'homework'
    }, (payload) => {
      console.log('Homework realtime update:', payload);
      // 숙제가 삭제/수정되면 학생의 과제 목록 리패치
      queryClient.invalidateQueries({
        queryKey: ["student-rt-submissions", session.studentId]
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.studentId, queryClient]);

  // 실시간 구독 - dismissed_daily_words (관리자 일괄 삭제 반영)
  useEffect(() => {
    if (!session?.studentId) return;
    const channel = supabase.channel('dismissed-daily-words-realtime').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'dismissed_daily_words',
      filter: `student_id=eq.${session.studentId}`,
    }, () => {
      queryClient.invalidateQueries({ queryKey: ["dismissed-daily-words", session.studentId] });
      queryClient.invalidateQueries({ queryKey: ["missed-daily-words", session.studentId] });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.studentId, queryClient]);

  // 오늘 일일 단어과제 제출 여부 확인
  const {
    data: todayDailyWord,
    refetch: refetchDailyWord
  } = useQuery({
    queryKey: ["today-daily-word", session?.studentId],
    queryFn: async () => {
      if (!session?.studentId) return null;
      // KST 기준 오늘 날짜 (UTC가 아닌 로컬 시간 기준)
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const {
        data,
        error
      } = await supabase.from("daily_word_submissions").select("*").eq("student_id", session.studentId).eq("submission_date", today).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.studentId
  });

  // 최근 일일 단어과제 제출 내역 (최근 7일)
  const {
    data: recentDailyWords = [],
    refetch: refetchRecentDaily
  } = useQuery({
    queryKey: ["recent-daily-words", session?.studentId],
    queryFn: async () => {
      if (!session?.studentId) return [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const {
        data,
        error
      } = await supabase.from("daily_word_submissions").select("*").eq("student_id", session.studentId).gte("submission_date", sevenDaysAgo.toISOString().split('T')[0]).order("submission_date", {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.studentId
  });

  // 전체 일일 단어과제 제출 내역 (캘린더용 — 월 탐색 지원)
  const { data: allDailyWordSubmissions = [] } = useQuery({
    queryKey: ["all-daily-word-submissions", session?.studentId],
    queryFn: async () => {
      if (!session?.studentId) return [];
      const { data, error } = await supabase
        .from("daily_word_submissions")
        .select("submission_date, submitted_at")
        .eq("student_id", session.studentId)
        .order("submission_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.studentId
  });

  // 삭제(무시)된 일일 단어과제 날짜 조회
  const { data: dismissedDates = [], refetch: refetchDismissed } = useQuery({
    queryKey: ["dismissed-daily-words", session?.studentId],
    queryFn: async () => {
      if (!session?.studentId) return [];
      const { data, error } = await supabase.
      from("dismissed_daily_words").
      select("dismissed_date").
      eq("student_id", session.studentId);

      if (error) throw error;
      return (data || []).map((d: any) => d.dismissed_date);
    },
    enabled: !!session?.studentId
  });

  // 일일 단어과제 중단 상태 확인
  const { data: dailyWordPauseState } = useQuery({
    queryKey: ["daily-word-paused-student", studentInfo?.grade_id],
    queryFn: async () => {
      if (!studentInfo?.grade_id) return { isPaused: false, pauseStartedAt: null };
      const { data: gradeData } = await supabase.from("grades").select("school_id").eq("id", studentInfo.grade_id).maybeSingle();
      if (!gradeData?.school_id) return { isPaused: false, pauseStartedAt: null };
      const { data: schoolData } = await supabase.from("schools").select("owner_code_id").eq("id", gradeData.school_id).maybeSingle();
      return fetchDailyWordPauseState(schoolData?.owner_code_id);
    },
    enabled: !!studentInfo?.grade_id,
    staleTime: 60000,
  });

  const isDailyWordPaused = dailyWordPauseState?.isPaused ?? false;

  // 밀린 일일 단어과제 조회 (시작일 이후, 오늘 이전, 미제출된 날짜들)
  const DAILY_WORD_START_DATE = '2026-02-08';

  const { data: missedDailyWords = [], refetch: refetchMissed } = useQuery({
    queryKey: ["missed-daily-words", session?.studentId, [...dismissedDates].sort().join(","), studentInfo?.created_at],
    queryFn: async () => {
      if (!session?.studentId) return [];

      // Check if daily word is paused for this student's school owner
      const gradeId = studentInfo?.grade_id;
      if (gradeId) {
        const { data: gradeData } = await supabase.from("grades").select("school_id").eq("id", gradeId).maybeSingle();
        if (gradeData?.school_id) {
          const { data: schoolData } = await supabase.from("schools").select("owner_code_id").eq("id", gradeData.school_id).maybeSingle();
          const pauseState = await fetchDailyWordPauseState(schoolData?.owner_code_id);
          if (pauseState.isPaused) return [];
          // Use resume date if available
          if (pauseState.resumeDate && pauseState.resumeDate > DAILY_WORD_START_DATE) {
            // Will be handled below via effectiveStart
          }
        }
      }

      // KST 기준 날짜 포맷 함수
      const formatDateKST = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Fetch pause state for resume date
      let effectiveStartDateStr = DAILY_WORD_START_DATE;
      if (studentInfo?.grade_id) {
        const { data: gradeData } = await supabase.from("grades").select("school_id").eq("id", studentInfo.grade_id).maybeSingle();
        if (gradeData?.school_id) {
          const { data: schoolData } = await supabase.from("schools").select("owner_code_id").eq("id", gradeData.school_id).maybeSingle();
          const pauseState = await fetchDailyWordPauseState(schoolData?.owner_code_id);
          if (pauseState.resumeDate && pauseState.resumeDate > effectiveStartDateStr) {
            effectiveStartDateStr = pauseState.resumeDate;
          }
        }
      }

      // 학생별 시작일: 글로벌 시작일, 재개일, 학생 등록일(KST) 중 가장 늦은 날짜
      const globalStart = new Date(effectiveStartDateStr);
      globalStart.setHours(0, 0, 0, 0);
      let startDate = new Date(globalStart);
      if (studentInfo?.created_at) {
        const createdKST = new Date(new Date(studentInfo.created_at).getTime() + 9 * 60 * 60 * 1000);
        const createdDate = new Date(createdKST.getUTCFullYear(), createdKST.getUTCMonth(), createdKST.getUTCDate());
        if (createdDate > startDate) startDate = createdDate;
      }
      startDate.setHours(0, 0, 0, 0);

      // 오늘 날짜 (로컬 타임존 기준)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 시작일이 오늘 이후면 밀린 과제 없음
      if (startDate >= today) return [];

      // 제출한 날짜들 가져오기
      const { data: submissions, error } = await supabase.
      from("daily_word_submissions").
      select("submission_date").
      eq("student_id", session.studentId);

      if (error) throw error;

      const submittedDates = new Set((submissions || []).map((s: any) => s.submission_date));
      const dismissedSet = new Set(dismissedDates);

      // 시작일부터 어제까지 미제출 날짜 찾기 (삭제된 날짜 제외)
      const missedDates: string[] = [];
      const current = new Date(startDate);
      while (current < today) {
        const dateStr = formatDateKST(current);
        if (!submittedDates.has(dateStr) && !dismissedSet.has(dateStr)) {
          missedDates.push(dateStr);
        }
        current.setDate(current.getDate() + 1);
      }

      return missedDates;
    },
    enabled: !!session?.studentId
  });

  // 밀린 과제 삭제 핸들러
  const handleDismissOverdue = (date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissConfirm({ show: true, date });
  };

  // 밀린 과제 삭제 확인 핸들러
  const handleConfirmDismiss = async () => {
    if (!session?.studentId) return;

    try {
      const { error } = await supabase.
      from("dismissed_daily_words").
      insert({
        student_id: session.studentId,
        dismissed_date: dismissConfirm.date
      });

      if (error) throw error;

      setDismissConfirm({ show: false, date: "" });
      refetchDismissed();
      refetchMissed();
    } catch (err) {
      console.error("Failed to dismiss overdue:", err);
      setDismissConfirm({ show: false, date: "" });
    }
  };

  // 기한 연장 승인된 과제 조회
  const { data: extendedDeadlines = [] } = useQuery({
    queryKey: ["extended-deadlines", session?.studentId],
    queryFn: async () => {
      if (!session?.studentId) return [];
      const { data, error } = await supabase.
      from("deadline_extensions").
      select("*").
      eq("student_id", session.studentId).
      eq("status", "approved");

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.studentId
  });

  // 리뷰 과제 목록 조회 (관리자가 배정한 것)
  const {
    data: rtSubmissions = [],
    isLoading,
    refetch: refetchRT
  } = useQuery({
    queryKey: ["student-rt-submissions", session?.studentId],
    queryFn: async () => {
      if (!session?.studentId) return [];
      const {
        data,
        error
       } = await supabase.from("homework_submissions").select(`
           *,
           homework:homework_id(
             id,
             title,
             description,
             type,
             due_date,
             created_at,
             target_grade_id,
             passage_id,
             homework_group_id,
             passages:passage_id(title, content, sentences)
           )
         `).eq("student_id", session.studentId).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      // 리뷰 과제만 필터링
      return data.filter((s: any) => s.homework?.type === "rt_review");
    },
    enabled: !!session?.studentId
  });
  // 차시 번호 계산: 학생에게 배정된 모든 리뷰과제의 배정일(created_at, YYYY-MM-DD)을
  // 오름차순 정렬하여 첫 날짜부터 1차시, 2차시... (관리자 페이지 차시 산정과 동일)
  const sessionByHomeworkId = (() => {
    const dateSet = new Set<string>();
    rtSubmissions.forEach((s: any) => {
      const hw = s.homework;
      if (!hw?.created_at) return;
      dateSet.add(String(hw.created_at).slice(0, 10));
    });
    const dateToSession = new Map<string, number>();
    Array.from(dateSet).sort().forEach((d, i) => {
      dateToSession.set(d, i + 1);
    });
    const map = new Map<string, number>();
    rtSubmissions.forEach((s: any) => {
      const hw = s.homework;
      if (!hw?.created_at) return;
      const dateKey = String(hw.created_at).slice(0, 10);
      const num = dateToSession.get(dateKey);
      if (num) map.set(hw.id, num);
    });
    return map;
  })();

  const getSessionLabel = (submission: any): string => {
    const hwId = submission?.homework?.id;
    const num = hwId ? sessionByHomeworkId.get(hwId) : undefined;
    const passageTitle = submission?.homework?.passages?.title || "";
    if (num && passageTitle) return `${num}차시 · ${passageTitle}`;
    if (num) return `${num}차시`;
    return passageTitle || submission?.homework?.title || "";
  };

  // 차시 내림차순, 같은 차시 내에서는 지문번호(#N) 내림차순
  const sortBySessionDescThenNumberDesc = (a: any, b: any) => {
    const sa = sessionByHomeworkId.get(a.homework?.id) ?? 0;
    const sb = sessionByHomeworkId.get(b.homework?.id) ?? 0;
    if (sb !== sa) return sb - sa;
    const numA = parseInt(a.homework?.title?.match(/#(\d+)/)?.[1] || "0");
    const numB = parseInt(b.homework?.title?.match(/#(\d+)/)?.[1] || "0");
    return numB - numA;
  };
  const pendingRTSubmissions = rtSubmissions.filter((s: any) => s.status === "pending" && !s.submitted_at).sort(sortBySessionDescThenNumberDesc);
  const submittedRTSubmissions = rtSubmissions.filter((s: any) => s.submitted_at).sort(sortBySessionDescThenNumberDesc);

  // 서술형연습 문장 존재 여부 확인 (grade_id 또는 school_id로 조회)
  const studentSchoolId = (studentInfo?.grade as any)?.school_id;
  const { data: hasWritingSentences = false } = useQuery({
    queryKey: ["has-writing-sentences", studentInfo?.grade_id, studentSchoolId],
    queryFn: async () => {
      if (!studentInfo?.grade_id) return false;
      // grade_id 매칭 또는 school_id 매칭 (grade_id가 null인 학교 단위 지문)
      let query = supabase.from("passages").select("id");
      if (studentSchoolId) {
        query = query.or(`grade_id.eq.${studentInfo.grade_id},and(grade_id.is.null,school_id.eq.${studentSchoolId})`);
      } else {
        query = query.eq("grade_id", studentInfo.grade_id);
      }
      const { data: passages } = await query;
      if (!passages?.length) return false;
      const { count, error } = await supabase
        .from("writing_sentences")
        .select("id", { count: "exact", head: true })
        .in("passage_id", passages.map((p) => p.id));
      if (error) return false;
      return (count ?? 0) > 0;
    },
    enabled: !!studentInfo?.grade_id
  });
  const handleOpenRTSubmit = (submission: any, groupItems?: any[]) => {
    const list = groupItems && groupItems.length ? groupItems : [submission];
    setSelectedRTGroup(list);
    setSelectedHomework(submission);
    setShowRTSubmit(true);
  };
  const getStatusBadge = (submission: any) => {
    if (submission.status === "completed") {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-200/50 whitespace-nowrap">
          완료
        </span>;
    }
    if (submission.submitted_at) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
          대기
        </span>;
    }
    const dueDate = new Date(submission.homework?.due_date);
    dueDate.setHours(23, 59, 59, 999);
    const today = new Date();
    const isOverdue = today > dueDate;
    
    // 기한 초과인 경우 옳은커밋 제출 여부 확인
    if (isOverdue) {
      const hasCommit = extendedDeadlines.some((e: any) => e.homework_id === submission.homework?.id);
      if (hasCommit) {
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-500 border border-rose-200/50 whitespace-nowrap flex items-center gap-0.5">
            ❤️ 옳은커밋
          </span>;
      }
    }
    
    return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap border ${isOverdue ? "bg-red-50 text-red-600 border-red-200/50" : "bg-amber-50 text-amber-600 border-amber-200/50"}`}>
        {isOverdue ? "기간초과" : "미제출"}
      </span>;
  };

  // 늦은 제출 여부 확인 함수 (리뷰 과제)
  const isLateSubmission = (submission: any) => {
    if (!submission.submitted_at || !submission.homework?.due_date) return false;
    const dueDate = new Date(submission.homework.due_date);
    dueDate.setHours(23, 59, 59, 999);
    const submittedDate = new Date(submission.submitted_at);
    return submittedDate > dueDate;
  };

  // 늦은 제출 여부 확인 함수 (일일 단어과제)
  const isDailyWordLate = (submission: any) => {
    if (!submission.submitted_at || !submission.submission_date) return false;
    const dueDate = new Date(submission.submission_date);
    dueDate.setHours(23, 59, 59, 999);
    const submittedAt = new Date(submission.submitted_at);
    return submittedAt > dueDate;
  };
  const today = new Date();
  const formattedDate = today.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  });
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 tracking-wide">불러오는 중...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, #f4f7fb 0%, #eef1f7 45%, #f7f8fa 100%)" }}>
      {/* 앰비언트 글래스 오브 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -left-20 w-[360px] h-[360px] rounded-full bg-slate-300/20 blur-[110px]" />
        <div className="absolute top-1/4 -right-24 w-[320px] h-[320px] rounded-full bg-blue-200/15 blur-[110px]" />
        <div className="absolute -bottom-32 left-1/4 w-[400px] h-[400px] rounded-full bg-slate-200/20 blur-[130px]" />
      </div>
      {/* Apple-style 헤더 — 미니멀 화이트 + 백드롭 블러 */}
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_1px_8px_-4px_rgba(15,23,42,0.08)]">
        <div className="max-w-lg mx-auto px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                {(studentInfo?.grade as any)?.school?.logo_url ?
              <img
                src={cacheBustUrl((studentInfo?.grade as any)?.school?.logo_url)}
                alt={(studentInfo?.grade as any)?.school?.name || "학교 로고"}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" /> :
              <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-sm">
                    {((studentInfo?.grade as any)?.school?.name || studentInfo?.name || session?.name)?.charAt(0) || "?"}
                  </div>
              }
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="font-semibold text-[15px] text-slate-900 tracking-tight truncate">{studentInfo?.name || session?.name}</h1>
                  {(() => {
                    const examDate = (studentInfo?.grade as any)?.school?.exam_date;
                    if (!examDate) return null;
                    const exam = new Date(examDate + "T00:00:00+09:00");
                    const nowKST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
                    nowKST.setHours(0,0,0,0);
                    const diffDays = Math.ceil((exam.getTime() - nowKST.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) return null;
                    return (
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white whitespace-nowrap flex-shrink-0 tracking-tight">
                        {diffDays === 0 ? "D-DAY" : `D-${diffDays}`}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex flex-nowrap items-center gap-1.5 mt-0.5 whitespace-nowrap overflow-hidden">
                  {(studentInfo?.grade || session?.schoolName || session?.gradeName) && <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap shrink-0">
                      {(studentInfo?.grade as any)?.school?.name || session?.schoolName} {(studentInfo?.grade as any)?.name || session?.gradeName}
                  </span>}
                  <span className="text-[10px] text-slate-300 shrink-0">·</span>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{formattedDate}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 h-9 w-9">
              <LogOut className="w-4 h-4" strokeWidth={1.8} />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-4 py-5 space-y-4 pb-24">
        {/* 오늘의 영어 명언 — 미니멀 인용 카드 */}
        <section className="animate-fade-in">
          <div className="relative rounded-[1.4rem] glass-tile ring-1 ring-slate-200/60 px-5 py-4">
            <div className="flex items-start gap-3.5">
              <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden ring-1 ring-slate-200">
                <img src={orunCharacter} alt="Orun English" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-900 leading-relaxed">
                  &ldquo;{todayQuote.en}&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5 tracking-tight">
                  {todayQuote.ko}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 메인 액션 그리드 — Apple 글래스 */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="rounded-[1.4rem] ring-1 ring-slate-200/60 bg-white/30 p-3">
            <div className="grid grid-cols-2 gap-3">
            {/* 일일 단어과제 */}
            <button
            onClick={() => setShowDailyWordSubmit(true)}
            className="group relative overflow-hidden rounded-[1.5rem] glass-tile p-4 text-left transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(15,23,42,0.25)]">
              {/* 은은한 광택 */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-slate-50/70 opacity-80" />
              {todayDailyWord &&
            <div className="absolute top-3.5 right-3.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 ring-1 ring-emerald-200/70 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                    완료
                  </span>
                </div>
            }
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#1d1d1f] shadow-[0_10px_20px_-8px_rgba(15,23,42,0.4)] flex items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-105">
                  <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1">Daily Words</p>
                <p className="text-[13px] font-semibold tracking-tight leading-tight text-slate-900">
                  {todayDailyWord ? "제출 완료" : "단어과제 제출"}
                </p>
              </div>
            </button>

            {/* 리뷰 과제 */}
            <button
            onClick={() => {const rt = pendingRTSubmissions[0];if (rt) handleOpenRTSubmit(rt);}}
            disabled={pendingRTSubmissions.length === 0}
            className={`group relative overflow-hidden rounded-[1.5rem] glass-tile p-4 text-left transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(15,23,42,0.25)] ${
            pendingRTSubmissions.length === 0 ? "cursor-not-allowed" : ""}`
            }>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-slate-50/70 opacity-80" />
              {pendingRTSubmissions.length > 0 &&
            <div className="absolute top-3.5 right-3.5">
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white font-semibold text-[10px]">{pendingRTSubmissions.length}</span>
                </div>
            }
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-[#1d1d1f] shadow-[0_10px_20px_-8px_rgba(15,23,42,0.4)] flex items-center justify-center mb-3.5 transition-all duration-300 group-hover:scale-105 ${
              pendingRTSubmissions.length === 0 ? "opacity-40 grayscale" : ""}`
              }>
                  <Headphones className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1">Review</p>
                <p className={`text-[13px] font-semibold tracking-tight leading-tight ${
              pendingRTSubmissions.length === 0 ? "text-slate-400" : "text-slate-900"}`
              }>
                  {pendingRTSubmissions.length === 0 ? "과제 없음" : "리뷰과제 제출"}
                </p>
              </div>
            </button>
          </div>

          {/* 하단 유틸 카드들 */}
          <div className={`grid gap-3 mt-3 ${hasWritingSentences ? "grid-cols-2" : "grid-cols-1"}`}>
            {/* 옳은 커밋 */}
            <button
            onClick={() => setShowCommitDialog(true)}
            className="group relative overflow-hidden rounded-[1.5rem] glass-tile p-4 text-left transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(15,23,42,0.25)]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-slate-50/70 opacity-80" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_10px_20px_-8px_rgba(225,29,72,0.5)] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Heart className="w-5 h-5 text-white fill-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-slate-400">Orun Commit</p>
                  <p className="text-[13px] font-semibold text-slate-900 tracking-tight leading-tight">옳은커밋</p>
                </div>
              </div>
            </button>

            {/* 서술형연습 */}
            {hasWritingSentences &&
          <button
            onClick={() => setShowWritingPractice(true)}
            className="group relative overflow-hidden rounded-[1.5rem] glass-tile p-4 text-left transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(15,23,42,0.25)]">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-slate-50/70 opacity-80" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1d1d1f] shadow-[0_10px_20px_-8px_rgba(15,23,42,0.4)] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <PenLine className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-slate-400">Writing</p>
                    <p className="text-[13px] font-semibold text-slate-900 tracking-tight leading-tight">서술형 연습</p>
                  </div>
                </div>
              </button>
          }
          </div>
          </div>
        </section>

        {/* 제출해야 할 과제 */}
        {(() => {
        const extendedDailyWordDates = new Set(
          extendedDeadlines.filter((e: any) => e.daily_word_date).map((e: any) => e.daily_word_date)
        );
        const overdueWithoutExtension = missedDailyWords.filter((date: string) => !extendedDailyWordDates.has(date));
        const overdueWithExtension = missedDailyWords.filter((date: string) => extendedDailyWordDates.has(date));
        const showTodayDailyWord = !todayDailyWord && !isDailyWordPaused;
        const totalPending = pendingRTSubmissions.length + (showTodayDailyWord ? 1 : 0) + overdueWithoutExtension.length + overdueWithExtension.length;

        if (totalPending === 0) return null;

        return (
          <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="rounded-[1.4rem] glass-tile ring-1 ring-slate-200/60 overflow-hidden">
                {/* 섹션 헤더 */}
                <div className="relative flex items-center justify-between px-4 py-3 bg-slate-50/60 border-b border-slate-100">
                  
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#1d1d1f] flex items-center justify-center">
                      <ListChecks className="w-3.5 h-3.5 text-white" strokeWidth={2.25} />
                    </span>
                    <h3 className="font-semibold text-slate-900 text-[13px] tracking-tight">미제출 과제</h3>
                  </div>
                  <span className="text-[10px] font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-full">{totalPending}건</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* 오늘 일일 단어과제 */}
                  {showTodayDailyWord &&
                <button
                  onClick={() => {setDailyWordDefaultDate(new Date());setShowDailyWordSubmit(true);}}
                  className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors duration-150 active:bg-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center flex-shrink-0"><Camera className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} /></span>
                        <div className="flex-1 text-left min-w-0">
                          <span className="font-semibold text-rose-600 text-[12px] block">
                            일일 단어 ({new Date().toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })})
                          </span>
                          <span className="text-[10px] text-slate-400">마감 ~{formattedDate}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200/50">
                          미제출
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </button>
                }

                  {/* 밀린 일일 단어과제 (기간초과) */}
                  {overdueWithoutExtension.map((date: string) =>
                <div key={`missed-${date}`} className="relative group">
                      <button
                    onClick={() => {setDailyWordDefaultDate(new Date(date));setShowDailyWordSubmit(true);}}
                    className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors duration-150 active:bg-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center flex-shrink-0"><Camera className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} /></span>
                          <div className="flex-1 text-left min-w-0">
                            <span className="font-semibold text-rose-600 text-[12px] block">일일 단어</span>
                            <span className="text-[10px] text-slate-400">{new Date(date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-500 border border-red-200/50">
                            기간초과
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </button>
                      <button onClick={(e) => handleDismissOverdue(date, e)} className="absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center hover:bg-red-100 transition-all" title="삭제">
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                )}

                  {/* 밀린 일일 단어과제 (기한 연장됨) */}
                  {overdueWithExtension.map((date: string) => {
                  const extension = extendedDeadlines.find((e: any) => e.daily_word_date === date);
                  return (
                    <div key={`extended-${date}`} className="relative group">
                        <button
                        onClick={() => {setDailyWordDefaultDate(new Date(date));setShowDailyWordSubmit(true);}}
                        className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors duration-150 active:bg-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center flex-shrink-0"><Camera className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} /></span>
                            <div className="flex-1 text-left min-w-0">
                              <span className="font-semibold text-rose-600 text-[12px] block">
                                일일 단어 ({new Date(date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })})
                              </span>
                              <span className="text-[10px] text-slate-400">연장 ~{extension ? new Date(extension.new_due_date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }) : ""}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-500 border border-rose-200/50 flex items-center gap-0.5">
                              ❤️ 옳은커밋
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                        </button>
                        <button onClick={(e) => handleDismissOverdue(date, e)} className="absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center hover:bg-amber-100 transition-all" title="삭제">
                          <X className="w-3 h-3 text-amber-500" />
                        </button>
                      </div>);
                })}
                  
                  {/* 리뷰 과제 - 그룹별 */}
                  {(() => {
                  // 차시(session)별로 그룹핑 — 같은 베이스 지문 + 같은 차시면 한 묶음
                  const getGroupKey = (s: any) => {
                    const hw = s.homework;
                    const session = sessionByHomeworkId.get(hw?.id);
                    // 같은 차시면 베이스 지문이 달라도 한 묶음으로 처리
                    if (session) return `session:${session}`;
                    return hw?.due_date || hw?.homework_group_id || `title:${(hw?.title || "").replace(/\s*#\d+$/, "")}`;
                  };
                  
                  // 전체 RT(pending+submitted) 기준으로 그룹 크기를 먼저 계산
                  const allRTGroupCounts = new Map<string, number>();
                  rtSubmissions.forEach((s: any) => {
                    const key = getGroupKey(s);
                    allRTGroupCounts.set(key, (allRTGroupCounts.get(key) || 0) + 1);
                  });

                  // 그룹별 제출 여부 (부분 제출 감지용)
                  const groupSubmittedCounts = new Map<string, { total: number; submitted: number }>();
                  rtSubmissions.forEach((s: any) => {
                    const key = getGroupKey(s);
                    if (!groupSubmittedCounts.has(key)) groupSubmittedCounts.set(key, { total: 0, submitted: 0 });
                    const g = groupSubmittedCounts.get(key)!;
                    g.total++;
                    if (s.submitted_at) g.submitted++;
                  });

                  const groups = new Map<string, typeof pendingRTSubmissions>();
                  pendingRTSubmissions.forEach((s: any) => {
                    const key = getGroupKey(s);
                    if (!groups.has(key)) groups.set(key, []);
                    groups.get(key)!.push(s);
                  });
                  return Array.from(groups.entries()).map(([key, items]) => {
                    const groupSize = allRTGroupCounts.get(key) || 0;
                    const isPartOfGroup = groupSize > 1;
                    const groupStatus = groupSubmittedCounts.get(key);
                    // 같은 차시 묶음의 헤더: 포함된 베이스 지문명들을 모두 표기
                    const uniqueBaseTitles = Array.from(new Set(items.map((it: any) =>
                      (it.homework?.title || "").replace(/\s*#\d+$/, "").replace(/^리뷰 과제:\s*/, "").replace(/-\d+\s*$/, "").trim()
                    ).filter(Boolean)));
                    const baseTitle = uniqueBaseTitles.join(" · ");
                    const headerSession = sessionByHomeworkId.get(items[0].homework?.id);
                    const headerLabel = headerSession ? `${headerSession}차시 · ${baseTitle}` : baseTitle;
                    return (
                      <div key={key}>
                          {isPartOfGroup ?
                        <RTGroupCollapsible 
                          baseTitle={`${headerLabel} (${groupStatus?.submitted || 0}/${groupStatus?.total || 0})`} 
                          items={items} 
                          onOpen={handleOpenRTSubmit} 
                          getStatusBadge={getStatusBadge} 
                          getSessionLabel={getSessionLabel}
                        /> :

                        items.map((submission: any) =>
                        <button
                          key={submission.id}
                          onClick={() => handleOpenRTSubmit(submission)}
                          className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors duration-150 active:bg-slate-100">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-lg bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center flex-shrink-0"><Headphones className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} /></span>
                                  <div className="flex-1 text-left min-w-0">
                                    <span className="font-semibold text-rose-600 text-[12px] block truncate">{getSessionLabel(submission)}</span>
                                    <span className="text-[10px] text-slate-400">마감 ~{new Date(submission.homework?.due_date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}</span>
                                  </div>
                                  {getStatusBadge(submission)}
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                </div>
                              </button>
                        )
                        }
                        </div>);

                  });
                })()}
                </div>
              </div>
            </section>);
      })()}

        {/* 제출 완료 과제 */}
        {(recentDailyWords.length > 0 || submittedRTSubmissions.length > 0 || dismissedDates.length > 0) &&
      <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="rounded-[1.4rem] glass-tile ring-1 ring-slate-200/60 overflow-hidden">
              {/* 섹션 헤더 */}
              <div className="relative flex items-center justify-between px-4 py-3 bg-slate-50/60 border-b border-slate-100">
                
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#1d1d1f] flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-[13px] tracking-tight">제출 완료</h3>
                </div>
                <span className="text-[10px] font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-full">
                  최근 7일 · {recentDailyWords.length + submittedRTSubmissions.length}건
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {/* 일일 단어과제 */}
                {recentDailyWords.length > 0 &&
            <div>
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50/40">
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">일일 단어</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{recentDailyWords.length}건</span>
                    </div>
                    <DailyWordPaginatedList
                submissions={recentDailyWords}
                onEdit={() => setShowDailyWordSubmit(true)}
                isDailyWordLate={isDailyWordLate} />
                  </div>
            }


                {/* 리뷰 과제 */}
                {submittedRTSubmissions.length > 0 &&
              (() => {
              const groups = new Map<string, any[]>();
              submittedRTSubmissions.forEach((s: any) => {
                // 차시 기준 = 배정일(created_at) 날짜. 같은 차시면 제목과 무관하게 한 그룹으로 묶어 피드백 공유
                const key = s.homework?.homework_group_id || String(s.homework?.created_at || "").slice(0, 10) || s.homework?.due_date;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(s);
              });
              const allItems: { submission: any; sharedNote: string | null; sharedReviewedAt: string | null }[] = [];
              Array.from(groups.entries()).forEach(([, items]) => {
                const sharedNote = items.find((s: any) => s.teacher_note)?.teacher_note || null;
                const sharedReviewedAt = items.find((s: any) => s.reviewed_at)?.reviewed_at || null;
                items.forEach((submission: any) => {
                  allItems.push({ submission, sharedNote, sharedReviewedAt });
                });
              });

              const PAGE_SIZE = 5;
              const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
              const safeRtPage = Math.min(rtPage, totalPages - 1);
              const currentItems = allItems.slice(safeRtPage * PAGE_SIZE, (safeRtPage + 1) * PAGE_SIZE);

              return (
                <div>
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50/40">
                    <div className="flex items-center gap-1.5">
                      <Mic className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">리뷰 과제</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{submittedRTSubmissions.length}건</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {currentItems.map(({ submission, sharedNote, sharedReviewedAt }) =>
                      <SubmittedRTCard key={submission.id} submission={{
                        ...submission,
                        teacher_note: submission.teacher_note || sharedNote,
                        reviewed_at: submission.reviewed_at || sharedReviewedAt,
                        status: submission.status,
                      }} onEdit={() => handleOpenRTSubmit(submission)} isLate={isLateSubmission(submission)} displayTitle={getSessionLabel(submission)} />
                    )}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 py-2 border-t border-slate-100">
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={safeRtPage === 0} onClick={() => setRtPage(p => Math.max(0, p - 1))}>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-[10px] text-muted-foreground">{safeRtPage + 1} / {totalPages}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={safeRtPage >= totalPages - 1} onClick={() => setRtPage(p => p + 1)}>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()
            }
              </div>
            </div>
          </section>
      }

        {/* 제출 현황 캘린더 */}
        <section className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="rounded-[1.4rem] ring-1 ring-slate-200/60 overflow-hidden">
            <SubmissionCalendar
            submissions={allDailyWordSubmissions}
            studentCreatedAt={studentInfo?.created_at}
            dismissedDates={dismissedDates}
            pauseStartDate={dailyWordPauseState?.pauseStartedAt}
            noAssignmentDates={(() => {
              const schoolName = (studentInfo?.grade as any)?.school?.name || "";
              const gradeName = (studentInfo?.grade as any)?.name || "";
              if (schoolName.includes("흑석") && gradeName.includes("1학년")) {
                return ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05", "2026-07-06"];
              }
              return [];
            })()}
            reviewMode={isDailyWordPaused}
            reviewAssignments={rtSubmissions
              .filter((s: any) => s.homework?.created_at)
              .map((s: any) => ({
                assignedDate: String(s.homework.created_at).slice(0, 10),
                submittedAt: s.submitted_at || null,
              }))}
          />
          </div>
        </section>

        {/* 빈 상태 */}
        {todayDailyWord && pendingRTSubmissions.length === 0 && recentDailyWords.length === 0 && submittedRTSubmissions.length === 0 &&
      <section className="py-16 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-slate-800 font-bold text-base">오늘 과제를 모두 완료했어요</p>
            <p className="text-slate-400 mt-1 text-xs">내일도 화이팅!</p>
          </section>
      }
      </main>

      {/* 일일 단어과제 제출 다이얼로그 */}
      <SubmitDailyWordDialog
      open={showDailyWordSubmit}
      onOpenChange={setShowDailyWordSubmit}
      studentId={session?.studentId ?? ""}
      alreadySubmitted={!!todayDailyWord}
      defaultDate={dailyWordDefaultDate}
      onSuccess={() => {
        refetchDailyWord();
        refetchRecentDaily();
        refetchMissed();
        refetchDismissed();
        setShowDailyWordSubmit(false);
        setDailyWordDefaultDate(undefined);
      }} />

      {/* 리뷰 과제 제출 다이얼로그 */}
      <SubmitRTDialog
        open={showRTSubmit}
        onOpenChange={setShowRTSubmit}
        submission={selectedHomework}
        groupItems={selectedRTGroup}
        allRTSubmissions={rtSubmissions}
        onSwitchAssignment={(sub, group) => {
          setSelectedRTGroup(group);
          setSelectedHomework(sub);
        }}
        onSuccess={() => {
          refetchRT();
          setShowRTSubmit(false);
        }}
      />

      {/* 옳은 커밋 다이얼로그 */}
      <CommitDeadlineDialog open={showCommitDialog} onOpenChange={setShowCommitDialog} />

      {/* 서술형연습 풀스크린 뷰 */}
      {showWritingPractice &&
    <div className="fixed inset-0 z-50 bg-background">
          <div className="max-w-lg mx-auto px-5 py-5 h-full overflow-y-auto">
            <WritingPractice
          gradeId={studentInfo?.grade_id || ""}
          schoolId={studentSchoolId || ""}
          onClose={() => setShowWritingPractice(false)} />
          </div>
        </div>
    }

      {/* 밀린 과제 삭제 확인 다이얼로그 */}
      <AlertDialog open={dismissConfirm.show} onOpenChange={(show) => setDismissConfirm({ ...dismissConfirm, show })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>과제를 무시하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>
              {dismissConfirm.date &&
            <>
                  <span className="font-semibold text-foreground">{new Date(dismissConfirm.date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}</span>의 일일 단어 과제를 목록에서 제거합니다. 나중에 다시 제출할 수 있습니다.
                </>
            }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDismiss} className="bg-destructive hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}