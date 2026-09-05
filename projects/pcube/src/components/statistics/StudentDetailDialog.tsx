import { useState, useMemo, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, CheckCircle, XCircle, BookOpen, FileText, User, TrendingUp, BarChart3, CheckCircle2, Clock, Camera, Mic, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isFuture, isSameDay, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { formatKSTLocale } from "@/utils/koreanTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    name: string;
    school: string;
    grade: string;
    rate: number;
    schoolLogoUrl?: string;
  } | null;
}

function CompletedSubmissionList({ items, pageSize }: { items: { type: 'daily' | 'rt'; key: string; data: any }[]; pageSize: number }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / pageSize);
  const paged = items.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <div className="space-y-1.5">
        {paged.map(item => {
          if (item.type === 'daily') {
            const s = item.data;
            return (
              <div key={item.key} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/30 border border-border/30">
                <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <span className="font-medium text-foreground text-xs">일일 단어</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({formatKSTLocale(s.submission_date, { month: "numeric", day: "numeric" })})
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600">완료</span>
              </div>
            );
          } else {
            const s = item.data;
            return (
              <div key={item.key} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/30 border border-border/30">
                <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <span className="font-medium text-foreground text-xs truncate max-w-[120px]">{s.homework?.title}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {s.submitted_at ? format(new Date(s.submitted_at), 'M/d HH:mm') : ''}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${s.status === 'reviewed' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-primary/15 text-primary'}`}>
                  {s.status === 'reviewed' ? '검토완료' : '대기'}
                </span>
              </div>
            );
          }
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2 mt-1.5 border-t border-border/30">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-5 h-5 rounded text-[10px] font-medium ${
                i === page
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudentDetailDialog({ open, onOpenChange, student }: StudentDetailDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const today = new Date();

  // 해당 월의 제출 기록 조회
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["student-monthly-submissions", student?.id, selectedMonth],
    queryFn: async () => {
      if (!student) return [];
      
      const { data } = await supabase
        .from("daily_word_submissions")
        .select("submission_date, status, submitted_at")
        .eq("student_id", student.id)
        .gte("submission_date", format(monthStart, 'yyyy-MM-dd'))
        .lte("submission_date", format(monthEnd, 'yyyy-MM-dd'));

      return data || [];
    },
    enabled: !!student && open,
  });

  // RT 과제 제출 기록
  const { data: rtSubmissions, isLoading: isLoadingRT } = useQuery({
    queryKey: ["student-rt-submissions", student?.id],
    queryFn: async () => {
      if (!student) return { total: 0, submitted: 0, pending: 0, submittedDates: [] as string[], dueDates: [] as string[] };

      const { data } = await supabase
        .from("homework_submissions")
        .select("id, status, submitted_at, homework:homework(title, due_date)")
        .eq("student_id", student.id);

      const total = data?.length || 0;
      const submitted = data?.filter(s => s.status === "submitted" || s.status === "reviewed").length || 0;
      const pending = data?.filter(s => s.status === "pending").length || 0;
      
      // Collect submitted dates and all due dates for calendar
      const submittedDates = (data || [])
        .filter(s => s.submitted_at)
        .map(s => format(new Date(s.submitted_at!), 'yyyy-MM-dd'));
      const dueDates = (data || [])
        .filter(s => (s as any).homework?.due_date)
        .map(s => (s as any).homework.due_date as string);

      return { total, submitted, pending, submittedDates, dueDates };
    },
    enabled: !!student && open,
  });

  // 밀린 일일 단어과제 조회
  const DAILY_WORD_START_DATE = '2026-02-08';

  const { data: missedDailyWords = [] } = useQuery({
    queryKey: ["student-detail-missed-daily", student?.id],
    queryFn: async () => {
      if (!student) return [];
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      // 학생 등록일 조회
      const { data: studentData } = await supabase
        .from("students")
        .select("created_at")
        .eq("id", student.id)
        .maybeSingle();

      const globalStart = new Date(DAILY_WORD_START_DATE);
      globalStart.setHours(0, 0, 0, 0);
      let startDate = new Date(globalStart);
      if (studentData?.created_at) {
        const createdKST = new Date(new Date(studentData.created_at).getTime() + 9 * 60 * 60 * 1000);
        const createdDate = new Date(createdKST.getUTCFullYear(), createdKST.getUTCMonth(), createdKST.getUTCDate());
        if (createdDate > globalStart) startDate = createdDate;
      }
      startDate.setHours(0, 0, 0, 0);
      if (startDate >= todayDate) return [];

      const { data: subs } = await supabase
        .from("daily_word_submissions")
        .select("submission_date")
        .eq("student_id", student.id);
      const { data: dismissed } = await supabase
        .from("dismissed_daily_words")
        .select("dismissed_date")
        .eq("student_id", student.id);

      const submittedSet = new Set((subs || []).map(s => s.submission_date));
      const dismissedSet = new Set((dismissed || []).map(d => d.dismissed_date));

      const missedDates: string[] = [];
      const current = new Date(startDate);
      while (current < todayDate) {
        const dateStr = format(current, 'yyyy-MM-dd');
        if (!submittedSet.has(dateStr) && !dismissedSet.has(dateStr)) {
          missedDates.push(dateStr);
        }
        current.setDate(current.getDate() + 1);
      }
      return missedDates;
    },
    enabled: !!student && open,
  });

  

  // 녹음 과제 상세 (pending/submitted 구분용)
  const { data: rtAssignmentDetails = [] } = useQuery({
    queryKey: ["student-detail-rt-assignments", student?.id],
    queryFn: async () => {
      if (!student) return [];
      const { data } = await supabase
        .from("homework_submissions")
        .select("id, status, submitted_at, homework:homework_id(id, title, type, due_date)")
        .eq("student_id", student.id);
      return (data || []).filter((s: any) => s.homework?.type === "rt_review");
    },
    enabled: !!student && open,
  });

  const pendingRTAssignments = rtAssignmentDetails.filter((s: any) => s.status === "pending" && !s.submitted_at);
  const submittedRTAssignments = rtAssignmentDetails.filter((s: any) => s.submitted_at);

  // 기한 연장된 날짜 Set
  const overdueWithoutExtension = missedDailyWords;
  const overdueWithExtension: string[] = [];

  // 오늘 제출 여부
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySubmitted = submissions?.some(s => s.submission_date === todayStr);

  // 최근 7일 제출 내역
  const recentDailyWords = submissions?.filter(s => {
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    return s.submission_date >= sevenDaysAgo;
  }) || [];

  // 월별 통계 계산
  const monthlyStats = (() => {
    if (!submissions) return { completed: 0, missed: 0, totalDays: 0, rate: 0 };

    const daysInMonth = eachDayOfInterval({ start: monthStart, end: isFuture(monthEnd) ? today : monthEnd });
    const validDays = daysInMonth.filter(d => !isFuture(d));
    const totalDays = validDays.length;
    const completed = submissions.length;
    const missed = Math.max(0, totalDays - completed);
    const rate = totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0;

    return { completed, missed, totalDays, rate };
  })();

  // 학생의 과제 시작일 계산
  const { data: studentCreatedAt } = useQuery({
    queryKey: ["student-created-at", student?.id],
    queryFn: async () => {
      if (!student) return null;
      const { data } = await supabase.from("students").select("created_at").eq("id", student.id).maybeSingle();
      return data?.created_at || null;
    },
    enabled: !!student && open,
  });

  const effectiveStartDate = useMemo(() => {
    const globalStart = new Date(DAILY_WORD_START_DATE + "T00:00:00+09:00");
    if (studentCreatedAt) {
      const createdKST = new Date(new Date(studentCreatedAt).getTime() + 9 * 60 * 60 * 1000);
      const createdDate = new Date(createdKST.getUTCFullYear(), createdKST.getUTCMonth(), createdKST.getUTCDate());
      return createdDate > globalStart ? createdDate : globalStart;
    }
    return globalStart;
  }, [studentCreatedAt]);

  // 캘린더 데이터 생성
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const submissionDates = new Set(submissions?.map(s => s.submission_date) || []);

  // 이전 달들 목록 생성 (최근 6개월)
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: format(date, 'yyyy년 M월', { locale: ko }),
    };
  });

  // 학교 이름 축약
  const getShortSchoolName = (name: string) => {
    return name.replace("고등학교", "고").replace("중학교", "중").replace("초등학교", "초");
  };

  const reportRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAsImage = useCallback(async () => {
    if (!reportRef.current || !student) return;
    setIsSaving(true);
    try {
      const el = reportRef.current;
      // Temporarily expand for full capture
      const origOverflow = el.style.overflow;
      const origMaxH = el.style.maxHeight;
      el.style.overflow = "visible";
      el.style.maxHeight = "none";

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      el.style.overflow = origOverflow;
      el.style.maxHeight = origMaxH;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${student.name}_학습리포트_${format(new Date(), "yyyyMMdd")}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
        setIsSaving(false);
      }, "image/jpeg", 0.95);
    } catch (e) {
      console.error("Save as image failed:", e);
      setIsSaving(false);
    }
  }, [student]);

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        <div ref={reportRef}>
        {/* 프로페셔널 헤더 - 세련된 그라데이션 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6">
          {/* 배경 장식 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-center gap-5">
            {/* 학교 로고 - 고급 프레임 */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/50 to-primary/20 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity" />
              <Avatar className="relative h-16 w-16 ring-2 ring-white/20 shadow-xl rounded-xl">
                {student.schoolLogoUrl ? (
                  <AvatarImage 
                    src={cacheBustUrl(student.schoolLogoUrl)} 
                    alt={student.school}
                    className="object-cover rounded-xl"
                  />
                ) : null}
                <AvatarFallback className="bg-white/10 text-white text-lg font-bold backdrop-blur-sm rounded-xl">
                  {getShortSchoolName(student.school).slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* 학생 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{student.name}</h2>
                <span className="text-white/70 font-medium text-xs">
                  {getShortSchoolName(student.school)} · {student.grade}
                </span>
              </div>
              <p className="text-sm text-white/60 mt-1 flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" />
                학습 분석 리포트
              </p>
            </div>

            {/* 전체 완료율 */}
            <div className="text-center flex flex-col items-center justify-center">
              <span className={`font-bold text-2xl
                ${student.rate >= 80 
                  ? 'text-emerald-400' 
                  : student.rate >= 50 
                    ? 'text-amber-400' 
                    : 'text-red-400'}`}
              >
                {student.rate}%
              </span>
              <p className="text-[10px] text-white/50 mt-1 font-medium tracking-wide">전체 완료율</p>
            </div>
          </div>
        </div>

        {/* 탭 컨텐츠 - 깔끔한 네비게이션 */}
        <Tabs defaultValue="daily" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-5 pb-3 border-b bg-muted/30">
            <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="daily" className="gap-2 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <BookOpen className="h-4 w-4" />
                일일 단어과제
              </TabsTrigger>
              <TabsTrigger value="rt" className="gap-2 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <FileText className="h-4 w-4" />
                녹음 과제
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="daily" className="flex-1 overflow-auto px-6 pb-6 mt-0 pt-4">
            {/* 통계 요약 - 인라인 컴팩트 */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground font-medium">완료율</p>
                  <p className="text-lg font-bold text-primary">{monthlyStats.rate}%</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground font-medium">완료</p>
                  <p className="text-lg font-bold text-foreground">{monthlyStats.completed}일</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/10 to-red-500/20 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground font-medium">미완료</p>
                  <p className="text-lg font-bold text-foreground">{monthlyStats.missed}일</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500/10 to-slate-500/20 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground font-medium">경과일</p>
                  <p className="text-lg font-bold text-foreground">{monthlyStats.totalDays}일</p>
                </div>
              </div>
            </div>

            {/* 과제 현황 리스트 - 학생 대시보드 스타일 */}
            {(() => {
              const totalPending = pendingRTAssignments.length + 
                (todaySubmitted ? 0 : 1) + 
                overdueWithoutExtension.length + 
                overdueWithExtension.length;
              
              if (totalPending === 0 && recentDailyWords.length === 0 && submittedRTAssignments.length === 0) return null;

              return (
                <div className="space-y-3 mb-4">
                  {/* 미제출 과제 */}
                  {totalPending > 0 && (
                    <div className="bg-card rounded-xl border border-border shadow-sm p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          <h4 className="font-semibold text-foreground text-xs">미제출 과제</h4>
                        </div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                          {totalPending}개
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {/* 오늘 미제출 */}
                        {!todaySubmitted && (
                          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/30 border border-border/30">
                            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center flex-shrink-0">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center gap-1.5">
                              <span className="font-medium text-foreground text-xs">일일 단어</span>
                              <span className="text-[10px] text-muted-foreground">({formatKSTLocale(new Date(), { month: "numeric", day: "numeric" })})</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600">미제출</span>
                          </div>
                        )}
                        {/* 밀린 단어과제 (기간초과) */}
                        {overdueWithoutExtension.map(date => (
                          <div key={`missed-${date}`} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/30 border border-destructive/20">
                            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center flex-shrink-0">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center gap-1.5">
                              <span className="font-medium text-foreground text-xs">일일 단어</span>
                              <span className="text-[10px] text-muted-foreground">
                                ({formatKSTLocale(date, { month: "numeric", day: "numeric" })})
                              </span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive/15 text-destructive animate-pulse">기간초과</span>
                          </div>
                        ))}
                        {/* 기한연장된 단어과제 (제거됨) */}
                        {/* 녹음 과제 미제출 */}
                        {pendingRTAssignments.map((s: any) => {
                          const dueDate = new Date(s.homework?.due_date);
                          dueDate.setHours(23, 59, 59, 999);
                          const isOverdue = new Date() > dueDate;
                          return (
                            <div key={s.id} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/30 border ${isOverdue ? 'border-destructive/20' : 'border-border/30'}`}>
                              <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center flex-shrink-0">
                                <Mic className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                                <span className="font-medium text-foreground text-xs truncate max-w-[120px]">{s.homework?.title}</span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  ~{formatKSTLocale(s.homework?.due_date, { month: "numeric", day: "numeric" })}
                                </span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap ${isOverdue ? 'bg-destructive/15 text-destructive animate-pulse' : 'bg-amber-500/15 text-amber-600'}`}>
                                {isOverdue ? '기간초과' : '미제출'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 제출 완료 과제 */}
                  {(recentDailyWords.length > 0 || submittedRTAssignments.length > 0) && (() => {
                    const PAGE_SIZE = 7;
                    const allCompleted = [
                      ...recentDailyWords.map((s: any) => ({ type: 'daily' as const, key: s.submission_date, data: s })),
                      ...submittedRTAssignments.map((s: any) => ({ type: 'rt' as const, key: s.id, data: s })),
                    ];
                    const totalPages = Math.ceil(allCompleted.length / PAGE_SIZE);
                    return (
                      <div className="bg-card rounded-xl border border-border shadow-sm p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <h4 className="font-semibold text-foreground text-xs">최근 제출 완료</h4>
                          </div>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground">
                            최근 7일
                          </span>
                        </div>
                        <CompletedSubmissionList items={allCompleted} pageSize={PAGE_SIZE} />
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* 캘린더 - 학생 대시보드와 동일한 스타일 */}
            <div className="flex-1 overflow-auto rounded-xl border border-border bg-card p-3">
              {/* 범례 */}
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-blue-600" />
                  <span className="text-[10px] text-muted-foreground">제출</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-rose-500 to-red-600" />
                  <span className="text-[10px] text-muted-foreground">미제출</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                  <span className="text-[10px] text-muted-foreground">과제없음</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted ring-1 ring-primary/40" />
                  <span className="text-[10px] text-muted-foreground">오늘</span>
                </div>
              </div>
              
              <Calendar
                mode="single"
                locale={ko}
                month={new Date(year, month - 1)}
                onMonthChange={(date) => {
                  setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
                }}
                disabled={{ after: today }}
                modifiers={{
                  submitted: calendarDays.filter(day => submissionDates.has(format(day, 'yyyy-MM-dd')) && !isFuture(day) && !isSameDay(day, today)),
                  missed: calendarDays.filter(day => {
                    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                    return !submissionDates.has(format(day, 'yyyy-MM-dd')) && !isFuture(day) && !isSameDay(day, today) && dayStart >= effectiveStartDate;
                  }),
                  beforeStart: calendarDays.filter(day => {
                    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                    return !isFuture(day) && !isSameDay(day, today) && dayStart < effectiveStartDate;
                  }),
                }}
                modifiersStyles={{
                  submitted: {
                    background: "linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(221 83% 53%) 100%)",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: "6px",
                    boxShadow: "0 1px 4px hsl(217 91% 60% / 0.25)",
                  },
                  missed: {
                    background: "linear-gradient(135deg, hsl(347 77% 50%) 0%, hsl(0 72% 51%) 100%)",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: "6px",
                    boxShadow: "0 1px 4px hsl(0 84% 60% / 0.25)",
                  },
                  beforeStart: {
                    background: "hsl(var(--muted))",
                    color: "hsl(var(--muted-foreground))",
                    borderRadius: "6px",
                    opacity: 0.5,
                  },
                }}
                className="rounded-lg pointer-events-auto w-full"
                classNames={{
                  months: "flex flex-col w-full",
                  month: "space-y-1 w-full",
                  caption: "flex justify-center relative items-center h-8",
                  caption_label: "text-sm font-bold text-foreground",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-muted hover:bg-muted/80 p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-border transition-all text-muted-foreground",
                  nav_button_previous: "absolute left-0",
                  nav_button_next: "absolute right-0",
                  table: "w-full border-collapse",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground flex-1 font-semibold text-[10px] text-center",
                  row: "flex w-full mt-1",
                  cell: "flex-1 text-center text-xs p-0 relative",
                  day: "h-8 w-8 mx-auto p-0 font-medium rounded-md hover:bg-muted inline-flex items-center justify-center transition-all text-foreground text-xs",
                  day_selected: "bg-primary text-primary-foreground",
                  day_today: "bg-muted ring-2 ring-primary/50 text-foreground font-bold",
                  day_outside: "text-muted-foreground opacity-40",
                  day_disabled: "text-muted-foreground opacity-20",
                }}
              />

              {/* 통계 요약 */}
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">완료</span>
                  <span className="text-xs font-bold text-foreground">{monthlyStats.completed}일</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[10px] text-muted-foreground">미완료</span>
                  <span className="text-xs font-bold text-foreground">{monthlyStats.missed}일</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] text-muted-foreground">완료율</span>
                  <span className="text-xs font-bold text-foreground">{monthlyStats.rate}%</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rt" className="flex-1 px-6 pb-6 mt-0">
            {/* RT 통계 카드 - 세련된 스타일 */}
            <div className="grid grid-cols-3 gap-3 mb-6 pt-5">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-800/30 dark:to-slate-800/20 border border-slate-200/50 dark:border-slate-700/30 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">배정된 과제</p>
                {isLoadingRT ? (
                  <Skeleton className="h-8 w-16 mx-auto" />
                ) : (
                  <p className="text-2xl font-bold">{rtSubmissions?.total || 0}<span className="text-sm font-medium ml-0.5">개</span></p>
                )}
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 dark:from-emerald-900/20 dark:to-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-300 to-emerald-400 dark:from-emerald-700 dark:to-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <CheckCircle className="h-5 w-5 text-white dark:text-emerald-200" />
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">제출 완료</p>
                {isLoadingRT ? (
                  <Skeleton className="h-8 w-16 mx-auto" />
                ) : (
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{rtSubmissions?.submitted || 0}<span className="text-sm font-medium ml-0.5">개</span></p>
                )}
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 via-red-100/50 to-red-50 dark:from-red-900/20 dark:to-red-900/10 border border-red-200/50 dark:border-red-800/30 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-300 to-red-400 dark:from-red-700 dark:to-red-800 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <XCircle className="h-5 w-5 text-white dark:text-red-200" />
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">미제출</p>
                {isLoadingRT ? (
                  <Skeleton className="h-8 w-16 mx-auto" />
                ) : (
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rtSubmissions?.pending || 0}<span className="text-sm font-medium ml-0.5">개</span></p>
                )}
              </div>
            </div>

            {rtSubmissions && rtSubmissions.total > 0 && (
              <div className="space-y-2.5 p-4 rounded-xl bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 border border-border/50 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground/80">녹음 과제 완료율</span>
                  <span className="text-muted-foreground font-medium">{rtSubmissions.submitted}/{rtSubmissions.total}<span className="ml-0.5 opacity-60">개</span></span>
                </div>
                <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${rtSubmissions.total > 0 ? (rtSubmissions.submitted / rtSubmissions.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* 녹음 과제 캘린더 */}
            <div className="flex-1 overflow-auto rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-blue-600" />
                  <span className="text-[10px] text-muted-foreground">제출</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500" />
                  <span className="text-[10px] text-muted-foreground">마감일</span>
                </div>
              </div>

              <Calendar
                mode="single"
                locale={ko}
                month={new Date(year, month - 1)}
                onMonthChange={(date) => {
                  setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
                }}
                disabled={{ after: today }}
                modifiers={{
                  rtSubmitted: calendarDays.filter(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    return rtSubmissions?.submittedDates?.includes(dateStr) && !isFuture(day);
                  }),
                  rtDue: calendarDays.filter(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    return rtSubmissions?.dueDates?.includes(dateStr) && !rtSubmissions?.submittedDates?.includes(dateStr) && !isFuture(day);
                  }),
                }}
                modifiersStyles={{
                  rtSubmitted: {
                    background: "linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(221 83% 53%) 100%)",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: "6px",
                    boxShadow: "0 1px 4px hsl(217 91% 60% / 0.25)",
                  },
                  rtDue: {
                    background: "linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(25 95% 53%) 100%)",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: "6px",
                    boxShadow: "0 1px 4px hsl(38 92% 50% / 0.25)",
                  },
                }}
                className="rounded-lg pointer-events-auto w-full"
                classNames={{
                  months: "flex flex-col w-full",
                  month: "space-y-1 w-full",
                  caption: "flex justify-center relative items-center h-8",
                  caption_label: "text-sm font-bold text-foreground",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-muted hover:bg-muted/80 p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-border transition-all text-muted-foreground",
                  nav_button_previous: "absolute left-0",
                  nav_button_next: "absolute right-0",
                  table: "w-full border-collapse",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground flex-1 font-semibold text-[10px] text-center",
                  row: "flex w-full mt-1",
                  cell: "flex-1 text-center text-xs p-0 relative",
                  day: "h-8 w-8 mx-auto p-0 font-medium rounded-md hover:bg-muted inline-flex items-center justify-center transition-all text-foreground text-xs",
                  day_selected: "bg-primary text-primary-foreground",
                  day_today: "bg-muted ring-2 ring-primary/50 text-foreground font-bold",
                  day_outside: "text-muted-foreground opacity-40",
                  day_disabled: "text-muted-foreground opacity-20",
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
        </div>
        {/* JPG 저장 버튼 */}
        <div className="px-6 py-3 border-t bg-muted/30 flex justify-end">
          <button
            onClick={handleSaveAsImage}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isSaving ? "저장 중..." : "리포트 JPG 저장"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
