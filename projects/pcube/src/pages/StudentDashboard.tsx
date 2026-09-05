import { useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, BookOpen, Calendar, Camera, CheckCircle2, ChevronDown, ChevronRight, ClipboardCheck, Clock, Heart, Info, Instagram, ListChecks, LogOut, Megaphone, Mic, PenLine, Pin, Sparkles, X } from "lucide-react";
import { SubmitDailyWordDialog } from "@/components/student/SubmitDailyWordDialog";
import { SubmitRTDialog } from "@/components/student/SubmitRTDialog";
import { SubmittedDailyWordCard } from "@/components/student/SubmittedDailyWordCard";
import { DailyWordPaginatedList } from "@/components/student/DailyWordPaginatedList";
import { SubmittedRTCard } from "@/components/student/SubmittedRTCard";
import { RTPaginatedList } from "@/components/student/RTPaginatedList";

import { WritingPractice } from "@/components/student/WritingPractice";
import { getTodayQuote } from "@/constants/englishQuotes";
import { getKSTNow, getKSTDateString, formatKSTLocale, formatKSTLocaleDateTime } from "@/utils/koreanTime";
import { SubmissionCalendar } from "@/components/student/SubmissionCalendar";
import orunCharacter from "@/assets/orun-english-character.png";


function AnnouncementCollapsibleItem({ announcement: a, displayNum }: { announcement: any; displayNum?: number | null }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3.5 py-2 text-left hover:bg-muted/40 transition-all duration-150"
      >
        <div className="flex items-center gap-2">
          {a.is_pinned ? (
            <Pin className="w-3 h-3 text-primary flex-shrink-0" />
          ) : displayNum != null ? (
            <span className="text-[10px] font-medium text-muted-foreground flex-shrink-0 w-4 text-center">{displayNum}</span>
          ) : null}
          <span className="text-[11.5px] font-medium text-foreground truncate flex-1">{a.title}</span>
          <span className="text-[9px] text-muted-foreground/50 flex-shrink-0 tabular-nums">
            {(() => { const d = new Date(a.created_at); const m = d.getMonth()+1; const day = d.getDate(); const w = ["일","월","화","수","목","금","토"][d.getDay()]; return `${m}/${day}(${w})`; })()}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="px-3.5 pb-3 pt-1.5 mx-2.5 mb-2 rounded-lg bg-muted/25 border border-border/30">
          <p className="text-[11.5px] text-foreground/70 whitespace-pre-wrap leading-[1.75]">
            {a.content.split(/(https?:\/\/[^\s]+)/g).map((part: string, i: number) =>
              /^https?:\/\//.test(part) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/60 transition-colors">{part}</a>
              ) : part
            )}
          </p>
          {a.image_urls && a.image_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {a.image_urls.map((url: string, i: number) => (
                <img key={i} src={url} alt={`첨부 ${i + 1}`} className="w-full rounded-lg border border-border/30 object-cover max-h-36 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(url, "_blank")} />
              ))}
            </div>
          )}
          <p className="text-[9px] text-muted-foreground/35 mt-2">
            {formatKSTLocaleDateTime(a.created_at, {
              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
      )}
    </div>
  );
}

function RTGroupCollapsible({ baseTitle, items, onOpen, getStatusBadge
}: {baseTitle: string;items: any[];onOpen: (s: any) => void;getStatusBadge: (s: any) => ReactNode;}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center gap-2.5 bg-gradient-to-r from-violet-50/80 via-violet-50/40 to-transparent hover:from-violet-50 hover:via-violet-50/60 transition-all duration-200 border-l-2 border-violet-300/70">

        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-200 to-violet-100 flex items-center justify-center shadow-sm">
          {expanded ? <ChevronDown className="w-3 h-3 text-violet-500" /> : <ChevronRight className="w-3 h-3 text-violet-500" />}
        </div>
        <span className="text-[11px] font-bold text-violet-600 tracking-tight">📖 {baseTitle}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[9px] font-semibold text-violet-400 bg-violet-100/60 px-1.5 py-0.5 rounded-full">{items.length}개</span>
        </div>
      </button>
      {expanded && items.map((submission: any) => {
        const num = submission.homework?.title?.match(/#(\d+)$/)?.[1];
        return (
          <button
            key={submission.id}
            onClick={() => onOpen(submission)}
            className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors duration-150 active:bg-slate-100 pl-7">

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-violet-100/50">
                <Mic className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <span className="font-bold text-foreground text-[12px] block truncate">#{num}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  {submission.homework?.due_date ? (
                    <>
                      <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">마감 ~{(() => { const d = new Date(submission.homework.due_date); const m = d.getMonth()+1; const day = d.getDate(); const w = ["일","월","화","수","목","금","토"][d.getDay()]; return `${m}/${day}(${w})`; })()}</span>
                    </>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">상시 과제</span>
                  )}
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
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  
  const [showWritingPractice, setShowWritingPractice] = useState(false);
  const [dismissConfirm, setDismissConfirm] = useState<{show: boolean;date: string;}>({ show: false, date: "" });
  const [overduePage, setOverduePage] = useState(0);
  const OVERDUE_PAGE_SIZE = 10;

  // 공지사항 접기 상태 (localStorage 기반)
  const [announcementsCollapsed, setAnnouncementsCollapsed] = useState(() => {
    return localStorage.getItem("announcements-collapsed") === "true";
  });
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [lastSeenAnnouncementId, setLastSeenAnnouncementId] = useState(() => {
    return localStorage.getItem("last-seen-announcement-id") || "";
  });

  // 오늘의 영어 명언
  const todayQuote = getTodayQuote();

  // 공지사항 조회 - studentInfo 로드 후 owner_code_id로 필터링
  const { data: announcements = [] } = useQuery({
    queryKey: ["student-announcements", session?.studentId],
    queryFn: async () => {
      // 먼저 학생의 access_code_id 조회
      const { data: studentData } = await supabase
        .from("students")
        .select("access_code_id")
        .eq("id", session!.studentId)
        .maybeSingle();
      
      let query = supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);
      if (studentData?.access_code_id) {
        query = query.eq("owner_code_id", studentData.access_code_id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!session?.studentId,
  });

  // 새 공지가 올라오면 자동 펼침
  useEffect(() => {
    if (announcements.length > 0) {
      const latestId = announcements[0].id;
      if (latestId !== lastSeenAnnouncementId) {
        setAnnouncementsCollapsed(false);
        localStorage.setItem("announcements-collapsed", "false");
        setLastSeenAnnouncementId(latestId);
        localStorage.setItem("last-seen-announcement-id", latestId);
      }
    }
  }, [announcements, lastSeenAnnouncementId]);

  const toggleAnnouncementsCollapsed = () => {
    const next = !announcementsCollapsed;
    setAnnouncementsCollapsed(next);
    localStorage.setItem("announcements-collapsed", String(next));
  };

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
          access_code_id,
          grade:grade_id(
            id,
            name,
            school:school_id(name, logo_url, exam_name, exam_date, owner_code_id)
          )
        `).eq("id", session.studentId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.studentId
  });

  // 인스타그램 URL 조회
  const { data: instagramSettings } = useQuery({
    queryKey: ["instagram-settings", studentInfo?.access_code_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .eq("owner_code_id", studentInfo!.access_code_id!)
        .in("key", ["instagram_url", "instagram_label"]);
      const map: Record<string, string> = {};
      data?.forEach(s => { map[s.key] = s.value; });
      return map;
    },
    enabled: !!studentInfo?.access_code_id
  });

  // 단어과제 일시중지 여부 조회 (학생의 학교 소유 선생님 설정 기준)
  const ownerCodeIdForSettings =
    (studentInfo as any)?.grade?.school?.owner_code_id || studentInfo?.access_code_id || null;

  const { data: isDailyWordPaused = false } = useQuery({
    queryKey: ["daily-word-paused-student", ownerCodeIdForSettings],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("id")
        .eq("owner_code_id", ownerCodeIdForSettings!)
        .eq("key", "daily_word_paused")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!ownerCodeIdForSettings,
  });

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

  // 실시간 구독 - 녹음 과제(homework_submissions) 업데이트 수신
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

  // 실시간 구독 - 숙제, 공지, 마감연장, 영작, 지문 등 전체 동기화
  useEffect(() => {
    if (!session?.studentId) return;

    const invalidateRT = () => {
      queryClient.invalidateQueries({ queryKey: ["student-rt-submissions", session.studentId] });
    };

    const channel = supabase.channel('student-all-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homework' }, invalidateRT)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        queryClient.invalidateQueries({ queryKey: ["student-announcements"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dismissed_daily_words', filter: `student_id=eq.${session.studentId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["dismissed-daily-words", session.studentId] });
        queryClient.invalidateQueries({ queryKey: ["missed-daily-words", session.studentId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'writing_submissions', filter: `student_id=eq.${session.studentId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["writing-submissions"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'writing_sentences' }, () => {
        queryClient.invalidateQueries({ queryKey: ["writing-sentences"] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'passages' }, invalidateRT)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, () => {
        queryClient.invalidateQueries({ queryKey: ["student-info", session.studentId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schools' }, () => {
        queryClient.invalidateQueries({ queryKey: ["student-info", session.studentId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.studentId, queryClient]);

  // 오늘 일일 단어과제 제출 여부 확인
  const {
    data: todayDailyWord,
    refetch: refetchDailyWord
  } = useQuery({
    queryKey: ["today-daily-word", session?.studentId],
    queryFn: async () => {
      if (!session?.studentId) return null;
      // KST 기준 오늘 날짜
      const today = getKSTDateString();

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
      const sevenDaysAgo = getKSTNow();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const {
        data,
        error
      } = await supabase.from("daily_word_submissions").select("*").eq("student_id", session.studentId).gte("submission_date", getKSTDateString(sevenDaysAgo)).order("submission_date", {
        ascending: false
      });
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

  // 밀린 일일 단어과제 조회 (시작일 이후, 오늘 이전, 미제출된 날짜들)
  const DAILY_WORD_START_DATE = '2026-02-08';

  const { data: missedDailyWords = [], refetch: refetchMissed } = useQuery({
    queryKey: ["missed-daily-words", session?.studentId, dismissedDates, studentInfo?.created_at],
    queryFn: async () => {
      if (!session?.studentId) return [];

      // KST 기준 날짜 포맷 함수
      const formatDateKST = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // 학생별 시작일: 글로벌 시작일과 학생 등록일(KST) 중 더 늦은 날짜
      const globalStart = new Date(DAILY_WORD_START_DATE);
      globalStart.setHours(0, 0, 0, 0);
      let startDate = new Date(globalStart);
      if (studentInfo?.created_at) {
        const createdKST = new Date(new Date(studentInfo.created_at).getTime() + 9 * 60 * 60 * 1000);
        const createdDate = new Date(createdKST.getUTCFullYear(), createdKST.getUTCMonth(), createdKST.getUTCDate());
        if (createdDate > globalStart) startDate = createdDate;
      }
      startDate.setHours(0, 0, 0, 0);

      // 오늘 날짜 (KST 기준)
      const today = getKSTNow();
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

  // 밀린 과제 전체 제거 핸들러
  const handleDismissAllOverdue = async (dates: string[]) => {
    if (!session?.studentId || dates.length === 0) return;
    try {
      const rows = dates.map((d) => ({ student_id: session.studentId, dismissed_date: d }));
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.
        from("dismissed_daily_words").
        upsert(rows.slice(i, i + 500), { onConflict: "student_id,dismissed_date", ignoreDuplicates: true });
        if (error) throw error;
      }
      refetchDismissed();
      refetchMissed();
    } catch (err) {
      console.error("Failed to dismiss all overdue:", err);
    }
  };

  

  // 녹음 과제 목록 조회 (관리자가 배정한 것)
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
              passage_id,
              homework_group_id,
              round,
              target_grade_id,
              target_type,
              owner_code_id,
              passages:passage_id(title, content, sentences)
            )
          `).eq("student_id", session.studentId).order("created_at", {
         ascending: false
       });
      if (error) throw error;
      // 녹음 과제만 필터링
      return data.filter((s: any) => s.homework?.type === "rt_review");
    },
    enabled: !!session?.studentId
  });
  // 번호 순서대로 정렬 (#1, #2, #3...)
  const sortByNumber = (a: any, b: any) => {
    const numA = parseInt(a.homework?.title?.match(/#(\d+)/)?.[1] || "999");
    const numB = parseInt(b.homework?.title?.match(/#(\d+)/)?.[1] || "999");
    return numA - numB;
  };
  const pendingRTSubmissions = rtSubmissions.filter((s: any) => s.status === "pending" && !s.submitted_at).sort(sortByNumber);
  const submittedRTSubmissions = rtSubmissions.filter((s: any) => s.submitted_at).sort(sortByNumber);

  // 서술형연습 문장 존재 여부 확인
  const { data: hasWritingSentences = false } = useQuery({
    queryKey: ["has-writing-sentences", studentInfo?.grade_id],
    queryFn: async () => {
      if (!studentInfo?.grade_id) return false;
      const { data: passages } = await supabase.
      from("passages").
      select("id").
      eq("grade_id", studentInfo.grade_id);
      if (!passages?.length) return false;
      const { count, error } = await supabase.
      from("writing_sentences").
      select("id", { count: "exact", head: true }).
      in("passage_id", passages.map((p) => p.id));
      if (error) return false;
      return (count ?? 0) > 0;
    },
    enabled: !!studentInfo?.grade_id
  });
  const handleOpenRTSubmit = (submission: any) => {
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
    const isRT = submission.homework?.type === "rt_review";
    const isOverdue = !isRT && submission.homework?.due_date ? (() => {
      const dueDate = new Date(submission.homework.due_date);
      dueDate.setHours(23, 59, 59, 999);
      return getKSTNow() > dueDate;
    })() : false;
    

    return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap border ${isOverdue ? "bg-red-50 text-red-600 border-red-200/50" : "bg-amber-50 text-amber-600 border-amber-200/50"}`}>
        {isOverdue ? "기간초과" : "미제출"}
      </span>;
  };

  // 늦은 제출 여부 확인 함수 (녹음 과제)
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
  const today = getKSTNow();
  const formattedDate = formatKSTLocale(today, {
    month: "long",
    day: "numeric",
    weekday: "short"
  });
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 tracking-wide">불러오는 중...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background relative">
      {/* 앰비언트 배경 (Apple 글라스 효과용 - 로고 와인 & 브라스 골드) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[hsl(320_46%_44%/0.18)] blur-3xl" />
      </div>

      {/* 프리미엄 헤더 - 세련된 다크 톤 */}
      <header className="sticky top-0 z-20 sec-wine sec-header shadow-lg">
        <div className="max-w-lg mx-auto px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {(studentInfo?.grade as any)?.school?.logo_url ?
              <img
                src={cacheBustUrl((studentInfo?.grade as any)?.school?.logo_url)}
                alt={(studentInfo?.grade as any)?.school?.name || "학교 로고"}
                className="w-10 h-10 rounded-lg object-contain ring-2 ring-white/10 bg-white/10" /> :
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                    {((studentInfo?.grade as any)?.school?.name || studentInfo?.name || session?.name)?.charAt(0) || "?"}
                  </div>
              }
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
                <div>
                <h1 className="font-bold text-[15px] text-white tracking-tight">{studentInfo?.name || session?.name}</h1>
                <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                  {(studentInfo?.grade || session?.schoolName || session?.gradeName) && <span className="text-[10px] font-medium text-white/50">
                      {(studentInfo?.grade as any)?.school?.name || session?.schoolName} {(studentInfo?.grade as any)?.name || session?.gradeName}
                  </span>}
                  <span className="text-[10px] text-white/20">•</span>
                  <span className="text-[10px] text-white/40">{formattedDate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {instagramSettings?.instagram_url && (
                <a
                  href={instagramSettings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-white/10 transition-all duration-200 min-h-[40px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                        <stop offset="0%" stopColor="#fdf497" />
                        <stop offset="5%" stopColor="#fdf497" />
                        <stop offset="45%" stopColor="#fd5949" />
                        <stop offset="60%" stopColor="#d6249f" />
                        <stop offset="90%" stopColor="#285AEB" />
                      </radialGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
                    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
                  </svg>
                  <span className="text-[8px] font-medium whitespace-normal text-white/50 leading-tight text-center">{instagramSettings.instagram_label || "Instagram"}</span>
                </a>
              )}
              <Button variant="ghost" size="icon" onClick={logout} className="rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all duration-200 h-9 w-9">
                <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3.5 pb-24">
        {announcements.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <div className="rounded-xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <button
                onClick={toggleAnnouncementsCollapsed}
                className="w-full px-3.5 py-2 bg-primary/10 border-b border-primary/15 flex items-center gap-2 hover:bg-primary/15 transition-all duration-150"
              >
                <Megaphone className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-foreground">공지사항</span>
                <span className="text-[9px] text-muted-foreground/50 bg-primary/8 px-1.5 py-0.5 rounded-full">{announcements.length}건</span>
                <span className="text-[9px] text-muted-foreground/40 ml-auto">{announcementsCollapsed ? "펼치기" : "접기"}</span>
                {!announcementsCollapsed && <span className="text-[8px] text-muted-foreground/30">(접으면 다음부터 접힌 채로 유지돼요)</span>}
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/30 transition-transform duration-200 ${announcementsCollapsed ? "" : "rotate-180"}`} />
              </button>
              {!announcementsCollapsed && (() => {
                const pinned = announcements.filter((a: any) => a.is_pinned);
                const regular = announcements.filter((a: any) => !a.is_pinned);
                const pageSize = 8;
                const totalPages = Math.max(1, Math.ceil(regular.length / pageSize));
                const pagedRegular = regular.slice((announcementPage - 1) * pageSize, announcementPage * pageSize);
                return (
                  <div>
                    <div className="divide-y divide-border/20">
                      {(() => {
                        let nonPinnedCounter = 0;
                        return (
                          <>
                            {pinned.map((a: any) => (
                              <AnnouncementCollapsibleItem key={a.id} announcement={a} displayNum={null} />
                            ))}
                            {pagedRegular.map((a: any) => {
                              const num = (announcementPage - 1) * pageSize + (++nonPinnedCounter);
                              return <AnnouncementCollapsibleItem key={a.id} announcement={a} displayNum={num} />;
                            })}
                          </>
                        );
                      })()}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-1 py-1.5 border-t border-border/20 bg-muted/10">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAnnouncementPage(p => Math.max(1, p - 1)); }}
                          disabled={announcementPage === 1}
                          className="px-1.5 py-0.5 text-[10px] text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors"
                        >‹</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setAnnouncementPage(i + 1); }}
                            className={`w-5 h-5 rounded text-[10px] font-medium transition-colors ${announcementPage === i + 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                          >{i + 1}</button>
                        ))}
                        <button
                          onClick={(e) => { e.stopPropagation(); setAnnouncementPage(p => Math.min(totalPages, p + 1)); }}
                          disabled={announcementPage === totalPages}
                          className="px-1.5 py-0.5 text-[10px] text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors"
                        >›</button>
                      </div>
                    )}
                  </div>
                );
              })()}
              {announcementsCollapsed && (
                <p className="text-[9px] text-muted-foreground/40 text-center py-1.5 bg-muted/20">접힌 상태는 다음 접속 시에도 유지됩니다</p>
              )}
            </div>
          </section>
        )}

        {/* 오늘의 영어 명언 */}
        <section className="animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl glass-card px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden ring-1 ring-slate-200">
                <img src={orunCharacter} alt="Orun English" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-700 leading-relaxed italic">
                  "{todayQuote.en}"
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {todayQuote.ko}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* D-DAY 배너 */}
        {(() => {
          const school = (studentInfo?.grade as any)?.school;
          if (!school?.exam_date || !school?.exam_name) return null;
          const examDate = new Date(school.exam_date + "T00:00:00");
          const now = getKSTNow();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const diffDays = Math.ceil((examDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays < -7) return null; // 시험이 지난 지 7일 이상이면 숨김
          const dDayText = diffDays === 0 ? "D-DAY" : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
          const isUrgent = diffDays >= 0 && diffDays <= 7;
          return (
            <section className="animate-fade-in" style={{ animationDelay: "0.03s" }}>
              <div className={`relative overflow-hidden rounded-xl px-4 py-3 shadow-sm border ${
                isUrgent 
                  ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200/60" 
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`text-lg ${isUrgent ? "" : ""}`}>📅</div>
                    <div>
                      <p className={`text-[11px] font-bold ${isUrgent ? "text-red-700" : "text-blue-700"}`}>
                        {school.exam_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {examDate.getMonth() + 1}월 {examDate.getDate()}일 ({["일","월","화","수","목","금","토"][examDate.getDay()]})
                      </p>
                    </div>
                  </div>
                  <div className={`text-xl font-black tracking-tight ${
                    diffDays === 0 ? "text-red-500 animate-pulse" : isUrgent ? "text-red-600" : "text-blue-600"
                  }`}>
                    {dDayText}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}


        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className={`grid gap-2.5 ${isDailyWordPaused ? "grid-cols-1" : "grid-cols-2"}`}>
            {/* 일일 단어과제 */}
            {!isDailyWordPaused && (
            <button
            onClick={() => setShowDailyWordSubmit(true)}
            className={`group relative overflow-hidden rounded-xl p-3.5 text-left transition-all duration-200 active:scale-[0.98] border ${
            todayDailyWord ?
            "bg-white border-emerald-200 shadow-sm" :
            "bg-slate-900 border-slate-700 shadow-md"}`
            }>
              {todayDailyWord &&
            <div className="absolute top-2.5 right-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
            }
              <div className="relative z-10">
                <div className={`w-9 h-9 rounded-lg overflow-hidden mb-2 ${
              todayDailyWord ? "" : "ring-1 ring-white/20"}`
              }>
                  <BookOpen className="w-full h-full shrink-0" strokeWidth={1.75} />
                </div>
                <p className={`text-[9px] font-semibold tracking-[0.12em] uppercase mb-0.5 ${
              todayDailyWord ? "text-emerald-500/70" : "text-slate-400"}`
              }>PHOTO ASSIGNMENT</p>
                <p className={`text-[13px] font-bold tracking-tight leading-tight ${
              todayDailyWord ? "text-emerald-700" : "text-white"}`
              }>
                  {todayDailyWord ? "단어과제 제출완료" : "사진과제 제출"}
                </p>
                {todayDailyWord && (
                  <p className="text-[10px] font-medium text-primary mt-0.5">다른 사진과제 제출</p>
                )}
              </div>
            </button>
            )}

            {/* 녹음 과제 */}
            <button
            onClick={() => {const rt = pendingRTSubmissions[0];if (rt) handleOpenRTSubmit(rt);}}
            disabled={pendingRTSubmissions.length === 0}
            className={`group relative overflow-hidden rounded-xl p-3.5 text-left transition-all duration-200 active:scale-[0.98] border ${
            pendingRTSubmissions.length === 0 ?
            "bg-white border-slate-200 shadow-sm cursor-not-allowed" :
            "bg-slate-900 border-slate-700 shadow-md"}`
            }>
              {pendingRTSubmissions.length > 0 &&
            <div className="absolute top-2.5 right-2.5">
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded bg-amber-500 text-white font-bold text-[9px]">{pendingRTSubmissions.length}</span>
                </div>
            }
              <div className="relative z-10">
                <div className={`w-9 h-9 rounded-lg overflow-hidden mb-2 ${
              pendingRTSubmissions.length === 0 ? "opacity-30 grayscale" : "ring-1 ring-white/20"}`
              }>
                  <ClipboardCheck className="w-full h-full shrink-0" strokeWidth={1.75} />
                </div>
                <p className={`text-[9px] font-semibold tracking-[0.12em] uppercase mb-0.5 ${
              pendingRTSubmissions.length === 0 ? "text-slate-300" : "text-slate-400"}`
              }>RECORDING ASSIGNMENT</p>
                <p className={`text-[13px] font-bold tracking-tight leading-tight ${
              pendingRTSubmissions.length === 0 ? "text-slate-300" : "text-white"}`
              }>
                  {pendingRTSubmissions.length === 0 ? "과제 없음" : "녹음과제 제출"}
                </p>
              </div>
            </button>
          </div>

          {/* 하단 유틸 카드들 */}
          {hasWritingSentences &&
          <div className="grid grid-cols-1 gap-2.5 mt-2.5">

            {/* 서술형연습 */}
            <button
            onClick={() => setShowWritingPractice(true)}
            className="group relative overflow-hidden rounded-xl p-3.5 text-left transition-all duration-200 active:scale-[0.98] bg-white border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md w-full">
                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 ring-1 ring-emerald-200/50">
                    <PenLine className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-semibold tracking-[0.12em] uppercase text-slate-400">​WRITING</p>
                    <p className="text-[13px] font-bold text-slate-800 tracking-tight leading-tight">서술형 연습</p>
                  </div>
                </div>
              </button>
          </div>
          }

        </section>

        {/* 제출해야 할 과제 */}
        {(() => {
        const overdueWithoutExtension = isDailyWordPaused ? [] : missedDailyWords;
        const totalPending = pendingRTSubmissions.length + (!isDailyWordPaused && !todayDailyWord ? 1 : 0) + overdueWithoutExtension.length;

        if (totalPending === 0) return null;

        return (
          <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="rounded-2xl glass-card border-red-200/50 overflow-hidden">
                {/* 섹션 헤더 */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-red-500/10 border-b border-red-200/60 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-6 h-6 shrink-0" strokeWidth={1.75} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-[12px]">미제출 과제</h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded">{totalPending}건</span>
                </div>

                <p className="text-[10px] text-red-500 font-bold text-center py-1.5 bg-red-50 border-b border-red-100">⚠️ 미제출 과제란은 항상 비어있게 유지하세요~^^</p>
                <div className="divide-y divide-slate-100">
                  {/* 오늘 일일 단어과제 */}
                  {!isDailyWordPaused && !todayDailyWord &&
                <button
                  onClick={() => {setDailyWordDefaultDate(getKSTNow());setShowDailyWordSubmit(true);}}
                  className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors duration-150 active:bg-slate-100">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={1.75} />
                        <div className="flex-1 text-left min-w-0">
                          <span className="font-semibold text-slate-700 text-[12px] block">
                            일일 단어 ({(() => { const d = getKSTNow(); const m = d.getMonth()+1; const day = d.getDate(); const w = ["일","월","화","수","목","금","토"][d.getDay()]; return `${m}. ${day}.(${w})`; })()})
                          </span>
                          <span className="text-[10px] text-slate-400">마감 ~{(() => { const d = today; const m = d.getMonth()+1; const day = d.getDate(); const w = ["일","월","화","수","목","금","토"][d.getDay()]; return `${formattedDate}`; })()}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200/50">
                          미제출
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </button>
                }

                  {/* 밀린 일일 단어과제 (기간초과) - 페이지당 10개 */}
                  {(() => {
                  const totalOverduePages = Math.ceil(overdueWithoutExtension.length / OVERDUE_PAGE_SIZE);
                  const page = Math.min(overduePage, Math.max(0, totalOverduePages - 1));
                  const pagedOverdue = overdueWithoutExtension.slice(page * OVERDUE_PAGE_SIZE, (page + 1) * OVERDUE_PAGE_SIZE);
                  return (
                    <>
                      {pagedOverdue.map((date: string) =>
                      <div key={`missed-${date}`} className="relative group">
                            <button
                          onClick={() => {setDailyWordDefaultDate(new Date(date));setShowDailyWordSubmit(true);}}
                          className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors duration-150 active:bg-slate-100">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={1.75} />
                                <div className="flex-1 text-left min-w-0">
                                  <span className="font-semibold text-slate-700 text-[12px] block">일일 단어</span>
                                  <span className="text-[10px] text-slate-400">{(() => { const d = new Date(date); const m = d.getMonth()+1; const dy = d.getDate(); const w = ["일","월","화","수","목","금","토"][d.getDay()]; return `${m}/${dy}(${w})`; })()}</span>
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
                      {totalOverduePages > 1 &&
                      <div className="flex items-center justify-center gap-1 py-2 bg-slate-50/50">
                            <button
                          onClick={() => setOverduePage(Math.max(0, page - 1))}
                          disabled={page === 0}
                          className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:bg-slate-200 disabled:opacity-30">
                              이전
                            </button>
                            {Array.from({ length: totalOverduePages }, (_, i) => i).
                        filter((i) => Math.abs(i - page) <= 2 || i === 0 || i === totalOverduePages - 1).
                        map((i, idx, arr) =>
                        <span key={i} className="flex items-center">
                                  {idx > 0 && arr[idx - 1] !== i - 1 && <span className="text-[10px] text-slate-300 px-0.5">…</span>}
                                  <button
                            onClick={() => setOverduePage(i)}
                            className={`w-5 h-5 rounded text-[10px] font-semibold ${i === page ? "bg-red-500 text-white" : "text-slate-500 hover:bg-slate-200"}`}>
                                    {i + 1}
                                  </button>
                                </span>
                        )}
                            <button
                          onClick={() => setOverduePage(Math.min(totalOverduePages - 1, page + 1))}
                          disabled={page >= totalOverduePages - 1}
                          className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:bg-slate-200 disabled:opacity-30">
                              다음
                            </button>
                          </div>
                      }
                    </>);

                })()}

                  {/* 녹음 과제 - 그룹별 */}
                  {(() => {
                  // homework_group_id 기반으로 그룹핑 (없으면 title 기반 폴백)
                  const getGroupKey = (s: any) => s.homework?.homework_group_id || `title:${(s.homework?.title || "").replace(/\s*#\d+$/, "")}`;
                  
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
                    const baseTitle = (items[0].homework?.title || "").replace(/\s*#\d+$/, "").replace(/^녹음 과제:\s*/, "");
                    return (
                      <div key={key}>
                          {isPartOfGroup ?
                        <RTGroupCollapsible 
                          baseTitle={`${baseTitle} (${groupStatus?.submitted || 0}/${groupStatus?.total || 0})`} 
                          items={items} 
                          onOpen={handleOpenRTSubmit} 
                          getStatusBadge={getStatusBadge} 
                        /> :

                        items.map((submission: any) =>
                        <button
                          key={submission.id}
                          onClick={() => handleOpenRTSubmit(submission)}
                          className={`w-full px-3 py-1.5 transition-colors duration-150 active:bg-slate-100 ${
                            (submission.homework as any)?.round >= 3 ? "bg-slate-100 hover:bg-slate-150" :
                            (submission.homework as any)?.round === 2 ? "bg-slate-50 hover:bg-slate-100" :
                            "hover:bg-slate-50"
                          }`}>
                                <div className="flex items-center gap-2">
                                  <Mic className="w-5 h-5 shrink-0" strokeWidth={1.75} />
                                  <div className="flex-1 text-left min-w-0">
                                    <span className="font-semibold text-slate-700 text-[11px] block break-all leading-tight">
                                      {submission.homework?.title}
                                      {(submission.homework as any)?.round && (
                                        <span className={`ml-1 text-[10px] font-bold ${(submission.homework as any).round >= 3 ? "text-amber-600" : (submission.homework as any).round === 2 ? "text-blue-500" : "text-primary"}`}>({(submission.homework as any).round}회차)</span>
                                      )}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{(() => { const examDate = (studentInfo?.grade as any)?.school?.exam_date; if (!examDate) return ""; const d = new Date(examDate + "T00:00:00"); const m = d.getMonth()+1; const dy = d.getDate(); const w = ["일","월","화","수","목","금","토"][d.getDay()]; return `마감 ~${m}/${dy}(${w})`; })()}</span>
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
            <div className="rounded-2xl glass-card overflow-hidden">
              {/* 섹션 헤더 */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-200/60 backdrop-blur">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-[12px]">제출 완료 과제</h3>
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  최근 7일 · {recentDailyWords.length + submittedRTSubmissions.length}건
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {/* 일일 단어과제 */}
                {recentDailyWords.length > 0 &&
            <div>
                    <div className="flex items-center justify-between px-4 py-2 bg-blue-50/80 border-b border-blue-100">
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


                {/* 녹음 과제 */}
                {submittedRTSubmissions.length > 0 &&
            <div>
                    <div className="flex items-center justify-between px-4 py-2 bg-violet-50/80 border-b border-violet-100">
                      <div className="flex items-center gap-1.5">
                        <Mic className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">녹음 과제</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{submittedRTSubmissions.length}건</span>
                    </div>
                    <RTPaginatedList
                      submissions={submittedRTSubmissions}
                      onEdit={(submission: any) => handleOpenRTSubmit(submission)}
                      isLate={(submission: any) => isLateSubmission(submission)}
                    />
                  </div>
            }
              </div>
            </div>
          </section>
      }

        {/* 제출 현황 캘린더 */}
        <section className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <SubmissionCalendar
            submissions={recentDailyWords}
            studentCreatedAt={studentInfo?.created_at}
            dismissedDates={dismissedDates}
            recordingSubmittedDates={submittedRTSubmissions.map((s: any) => {
              const d = new Date(new Date(s.submitted_at).getTime() + 9 * 60 * 60 * 1000);
              return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
            })} />

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

      {/* 녹음 과제 제출 다이얼로그 */}
      <SubmitRTDialog open={showRTSubmit} onOpenChange={setShowRTSubmit} submission={selectedHomework} onSuccess={() => {
      refetchRT();
      setShowRTSubmit(false);
    }} />



      {/* 서술형연습 풀스크린 뷰 */}
      {showWritingPractice &&
    <div className="fixed inset-0 z-50 bg-background">
          <div className="max-w-lg mx-auto px-5 py-5 h-full overflow-y-auto">
            <WritingPractice
          gradeId={studentInfo?.grade_id || ""}
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
                  <span className="font-semibold text-foreground">{(() => { const d = new Date(dismissConfirm.date); const m = d.getMonth()+1; const dy = d.getDate(); const w = ["일","월","화","수","목","금","토"][d.getDay()]; return `${m}/${dy}(${w})`; })()}</span>의 일일 단어 과제를 목록에서 제거합니다. 나중에 다시 제출할 수 있습니다.
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