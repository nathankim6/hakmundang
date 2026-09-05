import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";
import { useOwnerStudentIds } from "@/hooks/useOwnerStudentIds";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  getDay,
  isToday,
  isBefore,
  startOfDay,
  isSameDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Minus,
  Filter,
  CalendarIcon,
  ClipboardCheck,
  Mic,
  Heart,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickMessageDialog } from "@/components/dashboard/QuickMessageDialog";
import { QuickKakaoDialog } from "@/components/dashboard/QuickKakaoDialog";
import { DailySubmissionDetailDialog } from "@/components/dashboard/DailySubmissionDetailDialog";
import { RTRecordingPlayerDialog } from "@/components/dashboard/RTRecordingPlayerDialog";
import iconSms from "@/assets/icon-sms.png";
import iconKakao from "@/assets/icon-kakao.png";

const GLOBAL_START_DATE = "2026-02-08";

const ASSIGNMENT_TYPES = [
  { key: "daily_word", label: "단어", color: "bg-slate-500", textColor: "text-slate-600", headerBg: "bg-slate-50" },
  { key: "rt_review", label: "녹음", color: "bg-neutral-500", textColor: "text-neutral-600", headerBg: "bg-neutral-50" },
];

export default function AssignmentStatus() {
  const { isAdmin, ownerCodeId } = useOwnerFilter();
  const { studentIds: ownerStudentIds } = useOwnerStudentIds();
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const [quickSmsStudent, setQuickSmsStudent] = useState<any>(null);
  const [quickKakaoStudent, setQuickKakaoStudent] = useState<any>(null);
  const [photoDialog, setPhotoDialog] = useState<{
    open: boolean;
    submission: any;
    studentName: string;
  }>({ open: false, submission: null, studentName: "" });
  const [rtDialog, setRtDialog] = useState<{
    open: boolean;
    submission: any;
    studentName: string;
    studentId: string;
    homeworkId: string;
    homeworkTitle: string;
    passageId?: string;
  }>({ open: false, submission: null, studentName: "", studentId: "", homeworkId: "", homeworkTitle: "" });

  const displayDays = useMemo(() => {
    if (viewMode === "week") {
      return eachDayOfInterval({
        start: currentWeekStart,
        end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
      });
    } else {
      return eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      });
    }
  }, [viewMode, currentWeekStart, currentMonth]);

  const monthWeeks = useMemo(() => {
    if (viewMode !== "month") return [];
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    const firstDay = displayDays[0];
    const firstDayOfWeek = (getDay(firstDay) + 6) % 7;
    for (let i = 0; i < firstDayOfWeek; i++) currentWeek.push(null);
    displayDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  }, [viewMode, displayDays]);

  const dateLabel = useMemo(() => {
    if (viewMode === "week") {
      const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const monthYear = format(currentWeekStart, "yyyy년 M월", { locale: ko });
      return `${monthYear} ${format(currentWeekStart, "M/d")}~${format(end, "M/d")}`;
    } else {
      return format(currentMonth, "yyyy년 M월", { locale: ko });
    }
  }, [viewMode, currentWeekStart, currentMonth]);

  const weekStartStr = viewMode === "week"
    ? format(currentWeekStart, "yyyy-MM-dd")
    : format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const weekEndStr = viewMode === "week"
    ? format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "yyyy-MM-dd")
    : format(endOfMonth(currentMonth), "yyyy-MM-dd");

  // Data queries
  const { data: schools = [] } = useQuery({
    queryKey: ["as-schools", ownerCodeId],
    queryFn: async () => {
      let query = supabase.from("schools").select("id, name, logo_url").order("name");
      if (ownerCodeId) query = query.eq("owner_code_id", ownerCodeId);
      const { data } = await query;
      return data || [];
    },
  });

  const { data: grades = [] } = useQuery({
    queryKey: ["as-grades", selectedSchool],
    queryFn: async () => {
      let query = supabase.from("grades").select("id, name, school_id").order("name");
      if (selectedSchool !== "all") query = query.eq("school_id", selectedSchool);
      const { data } = await query;
      return data || [];
    },
  });

  const { data: allFilteredStudents = [] } = useQuery({
    queryKey: ["as-students", selectedSchool, selectedGrade],
    queryFn: async () => {
      let query = supabase
        .from("students")
        .select("id, name, created_at, grade_id, student_phone, parent_phone, grade:grade_id(id, name, school_id, school:school_id(id, name, logo_url))")
        .order("name");
      if (selectedGrade !== "all") query = query.eq("grade_id", selectedGrade);
      const { data } = await query;
      let filtered = data || [];
      if (selectedSchool !== "all") {
        filtered = filtered.filter((s: any) => s.grade?.school_id === selectedSchool);
      }
      if (ownerStudentIds) {
        filtered = filtered.filter((s: any) => ownerStudentIds.includes(s.id));
      }
      return filtered;
    },
  });

  const students = useMemo(() => {
    if (selectedStudent === "all") return allFilteredStudents;
    return allFilteredStudents.filter((s: any) => s.id === selectedStudent);
  }, [allFilteredStudents, selectedStudent]);

  // Daily word submissions (filtered by owner students)
  const { data: dailySubmissions = [] } = useQuery({
    queryKey: ["as-daily-subs", weekStartStr, weekEndStr, ownerStudentIds],
    queryFn: async () => {
      let query = supabase
        .from("daily_word_submissions")
        .select("id, submission_date, submitted_at, photo_urls, status, reviewed_at, teacher_note, student_id")
        .gte("submission_date", weekStartStr)
        .lte("submission_date", weekEndStr)
        .order("submitted_at", { ascending: false });
      if (ownerStudentIds) {
        if (ownerStudentIds.length === 0) return [];
        query = query.in("student_id", ownerStudentIds);
      }
      const { data } = await query;
      return data || [];
    },
  });

  // RT homework and submissions (filtered by owner)
  const { data: rtHomework = [] } = useQuery({
    queryKey: ["as-rt-hw", weekStartStr, weekEndStr, ownerCodeId],
    queryFn: async () => {
      // 표시 기간과 겹치는 모든 RT 과제 조회 (created_at <= weekEnd AND due_date >= weekStart)
      let query = supabase
        .from("homework")
        .select("id, title, due_date, created_at, type, target_type, target_grade_id, target_student_id, passage_id")
        .eq("type", "rt_review")
        .gte("due_date", weekStartStr)
        .lte("created_at", weekEndStr + "T23:59:59+09:00");
      if (ownerCodeId) query = query.eq("owner_code_id", ownerCodeId);
      const { data } = await query;
      return data || [];
    },
  });

  const { data: rtSubmissions = [] } = useQuery({
    queryKey: ["as-rt-subs", weekStartStr, weekEndStr, ownerCodeId],
    queryFn: async () => {
      let hwQuery = supabase
        .from("homework")
        .select("id")
        .eq("type", "rt_review")
        .gte("due_date", weekStartStr)
        .lte("created_at", weekEndStr + "T23:59:59+09:00");
      if (ownerCodeId) hwQuery = hwQuery.eq("owner_code_id", ownerCodeId);
      const { data: hw } = await hwQuery;
      if (!hw || hw.length === 0) return [];
      const { data } = await supabase
        .from("homework_submissions")
        .select("id, student_id, homework_id, submitted_at, status, recording_url, recording_timestamps, teacher_note, reviewed_at")
        .in("homework_id", hw.map(h => h.id));
      return data || [];
    },
  });

  // Dismissed daily words (filtered by owner students)
  const { data: dismissedData = [] } = useQuery({
    queryKey: ["as-dismissed", weekStartStr, weekEndStr, ownerStudentIds],
    queryFn: async () => {
      let query = supabase
        .from("dismissed_daily_words")
        .select("student_id, dismissed_date")
        .gte("dismissed_date", weekStartStr)
        .lte("dismissed_date", weekEndStr);
      if (ownerStudentIds) {
        if (ownerStudentIds.length === 0) return [];
        query = query.in("student_id", ownerStudentIds);
      }
      const { data } = await query;
      return data || [];
    },
  });

  // Deadline extensions (다짐Talk) - filtered by owner students
  const { data: deadlineExtensions = [] } = useQuery({
    queryKey: ["as-deadline-ext", weekStartStr, weekEndStr, ownerStudentIds],
    queryFn: async () => {
      let query = supabase
        .from("deadline_extensions")
        .select("student_id, daily_word_date")
        .gte("daily_word_date", weekStartStr)
        .lte("daily_word_date", weekEndStr);
      if (ownerStudentIds) {
        if (ownerStudentIds.length === 0) return [];
        query = query.in("student_id", ownerStudentIds);
      }
      const { data } = await query;
      return data || [];
    },
  });

  const commitSet = useMemo(
    () => new Set(deadlineExtensions.map((d: any) => `${d.student_id}-${d.daily_word_date}`)),
    [deadlineExtensions]
  );

  const dismissedSet = useMemo(
    () => new Set(dismissedData.map((d: any) => `${d.student_id}-${d.dismissed_date}`)),
    [dismissedData]
  );

  // Realtime sync
  useEffect(() => {
    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: ["as-daily-subs"] });
      queryClient.invalidateQueries({ queryKey: ["as-rt-subs"] });
      queryClient.invalidateQueries({ queryKey: ["as-rt-hw"] });
      queryClient.invalidateQueries({ queryKey: ["as-deadline-ext"] });
    };
    const channel = supabase
      .channel("assignment-status-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_word_submissions" }, invalidateAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "homework_submissions" }, invalidateAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "homework" }, invalidateAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "deadline_extensions" }, invalidateAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Group students by school > grade
  const groupedStudents = useMemo(() => {
    const schoolMap = new Map<string, {
      name: string; logo: string | null;
      grades: Map<string, { name: string; students: any[] }>;
    }>();

    (students || []).forEach((student: any) => {
      const schoolId = student.grade?.school_id || "unknown";
      const schoolName = student.grade?.school?.name || "알 수 없음";
      const schoolLogo = student.grade?.school?.logo_url || null;
      const gradeId = student.grade_id;
      const gradeName = student.grade?.name || "알 수 없음";

      if (!schoolMap.has(schoolId)) {
        schoolMap.set(schoolId, { name: schoolName, logo: schoolLogo, grades: new Map() });
      }
      const school = schoolMap.get(schoolId)!;
      if (!school.grades.has(gradeId)) {
        school.grades.set(gradeId, { name: gradeName, students: [] });
      }
      school.grades.get(gradeId)!.students.push(student);
    });

    const groups: any[] = [];
    schoolMap.forEach((school, schoolId) => {
      const gradeList: any[] = [];
      school.grades.forEach((grade, gradeId) => {
        gradeList.push({ gradeId, gradeName: grade.name, students: grade.students });
      });
      groups.push({ schoolId, schoolName: school.name, schoolLogo: school.logo, grades: gradeList });
    });
    return groups;
  }, [students]);

  // Cell data calculation
  const getCellData = (studentId: string, day: Date, studentCreatedAt: string) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const todayDate = new Date();

    if (isBefore(todayDate, startOfDay(day)) && !isSameDay(todayDate, day)) {
      return { status: "future" as const, dailySub: null, rtStatus: null };
    }
    if (dayStr < GLOBAL_START_DATE) {
      return { status: "no-assignment" as const, dailySub: null, rtStatus: null };
    }
    const createdKST = new Date(new Date(studentCreatedAt).getTime() + 9 * 60 * 60 * 1000);
    const createdDateStr = `${createdKST.getUTCFullYear()}-${String(createdKST.getUTCMonth() + 1).padStart(2, "0")}-${String(createdKST.getUTCDate()).padStart(2, "0")}`;
    if (dayStr < createdDateStr) {
      return { status: "no-assignment" as const, dailySub: null, rtStatus: null };
    }
    if (dismissedSet.has(`${studentId}-${dayStr}`)) {
      return { status: "dismissed" as const, dailySub: null, rtStatus: null };
    }

    // Daily word
    const dailySub = dailySubmissions.find(
      (s: any) => s.student_id === studentId && s.submission_date === dayStr
    );

    // RT review
    const dayRtHomework = rtHomework.filter((hw: any) => {
      // 과제 생성일(KST)부터 마감일까지 표시
      const createdDateStr = hw.created_at ? format(new Date(hw.created_at), "yyyy-MM-dd") : hw.due_date;
      if (dayStr < createdDateStr || dayStr > hw.due_date) return false;
      if (hw.target_type === "student") return hw.target_student_id === studentId;
      if (hw.target_type === "grade") {
        const student = (students || []).find((s: any) => s.id === studentId);
        return student?.grade_id === hw.target_grade_id;
      }
      return false;
    });

    const rtStatusList = dayRtHomework.map((hw: any) => {
      const sub = rtSubmissions.find(
        (s: any) => s.student_id === studentId && s.homework_id === hw.id && s.submitted_at
      );
      // 지각 여부: submitted_at 날짜가 due_date 이후인지
      const isLate = sub?.submitted_at ? format(new Date(sub.submitted_at), "yyyy-MM-dd") > hw.due_date : false;
      return {
        hwId: hw.id,
        title: hw.title,
        submitted: !!sub,
        reviewed: !!sub?.reviewed_at,
        submissionId: sub?.id,
        passageId: hw.passage_id,
        isLate,
      };
    });

    let status: "submitted" | "partial" | "missed" | "no-assignment" | "today";
    const hasDailyWord = !!dailySub;
    const hasRt = rtStatusList.length > 0;
    const allRtDone = rtStatusList.every(r => r.submitted);

    if (isToday(day)) {
      status = "today";
    } else if (!hasDailyWord && !hasRt) {
      status = "missed";
    } else if (hasDailyWord && (!hasRt || allRtDone)) {
      status = "submitted";
    } else if (hasDailyWord || rtStatusList.some(r => r.submitted)) {
      status = "partial";
    } else {
      status = "missed";
    }

    return { status, dailySub, rtStatus: rtStatusList };
  };

  // Stats
  const weekStats = useMemo(() => {
    let total = 0, submitted = 0, missed = 0;
    (students || []).forEach((student: any) => {
      displayDays.forEach((day) => {
        const cell = getCellData(student.id, day, student.created_at);
        if (cell.status === "submitted" || cell.status === "missed" || cell.status === "partial") {
          total++;
          if (cell.status === "submitted") submitted++;
          if (cell.status === "missed") missed++;
        }
      });
    });
    return { total, submitted, missed, rate: total > 0 ? Math.round((submitted / total) * 100) : 0 };
  }, [students, displayDays, dailySubmissions, rtHomework, rtSubmissions, dismissedSet]);

  const handleViewDaily = (sub: any, studentName: string) => {
    if (!sub) return;
    setPhotoDialog({ open: true, submission: sub, studentName });
  };

  const handleViewRt = (rtInfo: any, studentName: string, studentId: string) => {
    if (!rtInfo.submitted) return;
    const sub = rtSubmissions.find((s: any) => s.id === rtInfo.submissionId);
    const hw = rtHomework.find((h: any) => h.id === rtInfo.hwId);
    setRtDialog({
      open: true,
      submission: sub || rtInfo,
      studentName,
      studentId,
      homeworkId: rtInfo.hwId,
      homeworkTitle: rtInfo.title,
      passageId: hw?.passage_id || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        icon={ClipboardCheck}
        title="과제 현황"
        description="학교별, 학년별 일일단어 및 녹음리뷰 과제 제출 현황을 한눈에 확인합니다."
      />

      {/* Navigation + Filters */}
      <div className="bg-muted/30 rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Week/Month toggle */}
            <div className="flex items-center bg-primary/10 rounded-xl p-1 border border-primary/20 shadow-sm">
              <button
                onClick={() => setViewMode("week")}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  viewMode === "week"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-primary/60 hover:text-primary hover:bg-primary/10"
                )}
              >
                이번 주
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  viewMode === "month"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-primary/60 hover:text-primary hover:bg-primary/10"
                )}
              >
                이번 달
              </button>
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
              if (viewMode === "week") setCurrentWeekStart(subWeeks(currentWeekStart, 1));
              else setCurrentMonth(subMonths(currentMonth, 1));
            }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm">{dateLabel}</span>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
              if (viewMode === "week") setCurrentWeekStart(addWeeks(currentWeekStart, 1));
              else setCurrentMonth(addMonths(currentMonth, 1));
            }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => {
              if (viewMode === "week") setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
              else setCurrentMonth(new Date());
            }}>
              {viewMode === "week" ? "이번 주" : "이번 달"}
            </Button>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{weekStats.rate}%</span>
            </div>
            <span className="text-muted-foreground">
              제출 {weekStats.submitted} · 미제출 {weekStats.missed}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            필터
          </div>
          <Select value={selectedSchool} onValueChange={(v) => { setSelectedSchool(v); setSelectedGrade("all"); setSelectedStudent("all"); }}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="학교" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학교</SelectItem>
              {schools.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="학년" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학년</SelectItem>
              {grades.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="학생" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학생</SelectItem>
              {allFilteredStudents.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Legend */}
          <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-500" />
              <span>일일단어</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-neutral-500" />
              <Mic className="w-2.5 h-2.5" />
              <span>녹음리뷰</span>
            </div>
            <div className="w-px h-3 bg-border mx-1" />
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-pink-200 border border-pink-300" />
              <span>미제출</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300" />
              <span>제출</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
              <span>확인완료</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
              <span>다짐Talk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix */}
      {groupedStudents.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">등록된 학생이 없습니다.</p>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="space-y-4">
            {groupedStudents.map((school) => (
              <div key={school.schoolId} className="bg-card rounded-xl border-2 border-border shadow-sm overflow-hidden">
                {/* School header */}
                <div className="flex items-center gap-2.5 px-4 py-3 bg-primary/10 border-b-2 border-border">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={school.schoolLogo || ""} />
                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                      {school.schoolName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-sm text-primary">{school.schoolName}</span>
                </div>

                {school.grades.map((grade: any, gradeIdx: number) => (
                  <div key={grade.gradeId} className={gradeIdx > 0 ? "border-t-2 border-border" : ""}>
                    <div className="px-4 py-2 bg-muted/60 border-b border-foreground/10 text-xs font-bold text-muted-foreground">
                      {grade.gradeName}
                    </div>

                    <ScrollArea className="w-full">
                      {viewMode === "week" ? (
                        <div className="min-w-[900px]">
                          {/* Header */}
                          <div style={{ display: "grid", gridTemplateColumns: `120px repeat(7, 1fr)` }} className="border-b-2 border-foreground/20 bg-muted/40">
                            <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground flex items-end border-r-2 border-foreground/20">
                              {format(currentWeekStart, "M월", { locale: ko })} {Math.ceil(currentWeekStart.getDate() / 7)}주차
                            </div>
                            {displayDays.map((day) => (
                              <div key={day.toISOString()} className="border-r-2 border-foreground/15 last:border-r-0">
                                <div className={cn(
                                  "px-0.5 py-1 text-center text-[9px] font-semibold border-b-2 border-foreground/15 whitespace-nowrap",
                                  isToday(day) ? "text-violet-600 font-bold bg-violet-100" :
                                  getDay(day) === 6 ? "text-blue-600 font-bold" :
                                  getDay(day) === 0 ? "text-red-500 font-bold" :
                                  "text-muted-foreground"
                                )}>
                                  {format(day, "M/d")}({format(day, "EEE", { locale: ko })})
                                </div>
                                <div className="grid grid-cols-2 divide-x divide-foreground/10">
                                  {ASSIGNMENT_TYPES.map((at) => (
                                    <div key={at.key} className={cn("text-center py-0.5 text-[7px] font-bold", at.textColor, at.headerBg)}>
                                      {at.label}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Student rows */}
                          {grade.students.map((student: any, idx: number) => (
                            <div
                              key={student.id}
                              style={{ display: "grid", gridTemplateColumns: `120px repeat(7, 1fr)` }}
                              className={cn(
                                idx < grade.students.length - 1 ? "border-b border-foreground/10" : "",
                                idx % 2 === 0 ? "bg-background" : "bg-muted/15"
                              )}
                            >
                              <div className="px-2 py-1.5 text-[10px] font-semibold truncate border-r-2 border-foreground/20 flex items-center gap-0.5 bg-muted/40">
                                <span className="truncate flex-1">{student.name}</span>
                                <button onClick={() => setQuickSmsStudent(student)} className="shrink-0 hover:opacity-70 transition-opacity" title="문자 보내기">
                                  <img src={iconSms} alt="SMS" className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setQuickKakaoStudent(student)} className="shrink-0 hover:opacity-70 transition-opacity" title="카톡 보내기">
                                  <img src={iconKakao} alt="카카오톡" className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {displayDays.map((day) => {
                                const dayStr = format(day, "yyyy-MM-dd");
                                const cell = getCellData(student.id, day, student.created_at);
                                const isInactive = cell.status === "future" || cell.status === "no-assignment" || cell.status === "dismissed";
                                const hasDailySub = !!cell.dailySub;
                                const isDailyReviewed = cell.dailySub?.status === "reviewed" || cell.dailySub?.status === "completed";
                                const isDailyLate = hasDailySub && cell.dailySub?.submitted_at
                                  ? format(new Date(cell.dailySub.submitted_at), "yyyy-MM-dd") > cell.dailySub.submission_date
                                  : false;
                                const hasCommit = commitSet.has(`${student.id}-${dayStr}`);
                                const hasAnyRt = cell.rtStatus && cell.rtStatus.length > 0;
                                const anyRtSubmitted = hasAnyRt && cell.rtStatus!.some((r: any) => r.submitted);
                                const anyRtReviewed = hasAnyRt && cell.rtStatus!.some((r: any) => r.reviewed);
                                const anyRtLate = hasAnyRt && cell.rtStatus!.some((r: any) => r.isLate);

                                return (
                                  <div key={dayStr} className="grid grid-cols-2 divide-x divide-foreground/10 border-r-2 border-foreground/15 last:border-r-0">
                                    {/* Daily word cell */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => { if (hasDailySub) handleViewDaily(cell.dailySub, student.name); }}
                                          disabled={isInactive}
                                          className={cn(
                                            "h-7 flex items-center justify-center transition-all relative",
                                            isInactive ? "bg-muted/20"
                                              : hasDailySub
                                                ? isDailyReviewed
                                                  ? "bg-emerald-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-emerald-400/40"
                                                  : "bg-amber-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-amber-400/40"
                                                : hasCommit
                                                  ? "bg-rose-50 hover:bg-rose-100"
                                                  : "bg-pink-100 hover:bg-pink-50"
                                          )}
                                        >
                                          {isInactive ? <Minus className="w-2 h-2 text-muted-foreground/20" />
                                            : hasDailySub && hasCommit ? <Heart className={cn("w-3 h-3", isDailyReviewed ? "fill-emerald-500 text-emerald-500" : "fill-amber-500 text-amber-500")} />
                                            : hasDailySub ? <CheckCircle2 className={cn("w-3 h-3", isDailyReviewed ? "text-emerald-600" : "text-amber-500")} />
                                            : hasCommit ? <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                                            : <XCircle className="w-3 h-3 text-pink-400" />}
                                          {isDailyLate && (
                                            <span className="absolute -top-0.5 -right-0.5 px-[3px] py-[0.5px] rounded-sm bg-orange-500 text-white text-[6px] font-bold leading-tight shadow-sm">
                                              지각
                                            </span>
                                          )}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-[10px]">
                                        {isInactive ? "해당없음" : hasDailySub && hasCommit
                                          ? `일일단어 ❤️ 다짐Talk + 제출${isDailyLate ? " (지각)" : ""}${isDailyReviewed ? " (확인완료)" : ""}`
                                          : hasDailySub
                                          ? `일일단어 ✅ 제출${isDailyLate ? " (지각)" : ""}${isDailyReviewed ? " (확인완료)" : ""}`
                                          : hasCommit ? "일일단어 ❤️ 다짐Talk" : "일일단어 ❌ 미제출"}
                                      </TooltipContent>
                                    </Tooltip>

                                    {/* RT review cell */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => {
                                            if (anyRtSubmitted && cell.rtStatus) {
                                              const submitted = cell.rtStatus.find((r: any) => r.submitted);
                                              if (submitted) handleViewRt(submitted, student.name, student.id);
                                            }
                                          }}
                                          disabled={isInactive}
                                          className={cn(
                                            "h-7 flex items-center justify-center transition-all relative",
                                            isInactive ? "bg-muted/20"
                                              : anyRtSubmitted
                                                ? anyRtReviewed
                                                  ? "bg-emerald-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-emerald-400/40"
                                                  : "bg-amber-100 hover:opacity-80 cursor-pointer ring-1 ring-inset ring-amber-400/40"
                                                : hasAnyRt
                                                  ? "hover:bg-muted/30"
                                                  : "hover:bg-muted/30"
                                          )}
                                        >
                                          {isInactive ? <Minus className="w-2 h-2 text-muted-foreground/20" />
                                            : anyRtSubmitted ? <Mic className={cn("w-3 h-3", anyRtReviewed ? "text-emerald-600" : "text-amber-500")} />
                                            : hasAnyRt ? <XCircle className="w-3 h-3 text-muted-foreground/30" />
                                            : <Minus className="w-2 h-2 text-muted-foreground/15" />}
                                          {anyRtLate && anyRtSubmitted && (
                                            <span className="absolute -top-0.5 -right-0.5 px-[3px] py-[0.5px] rounded-sm bg-orange-500 text-white text-[6px] font-bold leading-tight shadow-sm">
                                              지각
                                            </span>
                                          )}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-[10px]">
                                        {isInactive ? "해당없음" : anyRtSubmitted
                                          ? `녹음리뷰 ✅ 제출${anyRtLate ? " (지각)" : ""}${anyRtReviewed ? " (확인완료)" : ""}`
                                          : hasAnyRt ? "녹음리뷰 ❌ 미제출" : "녹음과제 없음"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Month mode */
                        <div className="min-w-[900px]">
                          {grade.students.map((student: any, studentIdx: number) => (
                            <div key={student.id} className={studentIdx > 0 ? "border-t-4 border-foreground/20" : ""}>
                              <div className="px-3 py-1.5 bg-muted/60 border-b border-foreground/10 flex items-center gap-2 sticky top-0 z-10">
                                {school.schoolLogo && (
                                  <img src={school.schoolLogo} alt="" className="w-4 h-4 rounded object-cover flex-shrink-0" />
                                )}
                                <span className="text-[11px] font-bold">{student.name}</span>
                                <span className="text-[9px] text-muted-foreground">{grade.gradeName}</span>
                                <div className="ml-auto flex items-center gap-1">
                                  <button onClick={() => setQuickSmsStudent(student)} className="hover:opacity-70"><img src={iconSms} alt="SMS" className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => setQuickKakaoStudent(student)} className="hover:opacity-70"><img src={iconKakao} alt="카톡" className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                              {/* Month header */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }} className="border-b border-foreground/15 bg-muted/30">
                                {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
                                  <div key={d} className={cn("text-center py-1 text-[9px] font-bold", i === 5 ? "text-blue-600" : i === 6 ? "text-red-500" : "text-muted-foreground")}>
                                    {d}
                                  </div>
                                ))}
                              </div>
                              {monthWeeks.map((week, wi) => (
                                <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }} className="border-b border-foreground/10 last:border-b-0">
                                  {week.map((day, di) => {
                                    if (!day) return <div key={di} className="h-10 bg-muted/10" />;
                                    const dayStr = format(day, "yyyy-MM-dd");
                                    const cell = getCellData(student.id, day, student.created_at);
                                    const isInactive = cell.status === "future" || cell.status === "no-assignment" || cell.status === "dismissed";
                                    const hasDailySub = !!cell.dailySub;
                                    const isDailyReviewed = cell.dailySub?.status === "reviewed" || cell.dailySub?.status === "completed";
                                    const isDailyLate = hasDailySub && cell.dailySub?.submitted_at
                                      ? format(new Date(cell.dailySub.submitted_at), "yyyy-MM-dd") > cell.dailySub.submission_date
                                      : false;
                                    const hasCommit = !hasDailySub && commitSet.has(`${student.id}-${dayStr}`);
                                    const hasAnyRt = cell.rtStatus && cell.rtStatus.length > 0;
                                    const anyRtSubmitted = hasAnyRt && cell.rtStatus!.some((r: any) => r.submitted);
                                    const anyRtReviewed = hasAnyRt && cell.rtStatus!.some((r: any) => r.reviewed);
                                    const anyRtLate = hasAnyRt && cell.rtStatus!.some((r: any) => r.isLate);

                                    return (
                                      <div key={di} className={cn(
                                        "h-10 border-r border-foreground/10 last:border-r-0 flex flex-col items-center justify-center gap-0.5 relative",
                                        isToday(day) ? "bg-violet-50 ring-1 ring-violet-300" : ""
                                      )}>
                                        <span className={cn("text-[8px] font-semibold", isToday(day) ? "text-violet-600" : "text-muted-foreground/60")}>{format(day, "d")}</span>
                                        {!isInactive && (
                                          <div className="flex items-center gap-0.5">
                                            {/* Daily */}
                                            <div className={cn(
                                              "w-3 h-3 rounded-sm flex items-center justify-center cursor-pointer relative",
                                              hasDailySub
                                                ? isDailyReviewed ? "bg-emerald-200" : "bg-amber-200"
                                                : hasCommit ? "bg-rose-100" : "bg-pink-200"
                                            )} onClick={() => { if (hasDailySub) handleViewDaily(cell.dailySub, student.name); }}>
                                              {hasDailySub ? <CheckCircle2 className={cn("w-2 h-2", isDailyReviewed ? "text-emerald-700" : "text-amber-600")} />
                                                : hasCommit ? <Heart className="w-2 h-2 fill-rose-400 text-rose-400" />
                                                : <XCircle className="w-2 h-2 text-pink-500" />}
                                            </div>
                                            {/* RT */}
                                            {hasAnyRt && (
                                              <div className={cn(
                                                "w-3 h-3 rounded-sm flex items-center justify-center cursor-pointer relative",
                                                anyRtSubmitted
                                                  ? anyRtReviewed ? "bg-emerald-200" : "bg-amber-200"
                                                  : "bg-muted/40"
                                              )} onClick={() => {
                                                if (anyRtSubmitted && cell.rtStatus) {
                                                  const submitted = cell.rtStatus.find((r: any) => r.submitted);
                                                  if (submitted) handleViewRt(submitted, student.name, student.id);
                                                }
                                              }}>
                                                {anyRtSubmitted ? <Mic className={cn("w-2 h-2", anyRtReviewed ? "text-emerald-700" : "text-amber-600")} />
                                                  : <XCircle className="w-2 h-2 text-muted-foreground/30" />}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        {/* 지각 라벨 (월간) */}
                                        {(isDailyLate || (anyRtLate && anyRtSubmitted)) && (
                                          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-[2px] rounded-sm bg-orange-500 text-white text-[5px] font-bold leading-tight">
                                            지각
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </TooltipProvider>
      )}

      {/* Dialogs */}
      {photoDialog.open && photoDialog.submission && (
        <DailySubmissionDetailDialog
          open={photoDialog.open}
          onOpenChange={(open) => setPhotoDialog(prev => ({ ...prev, open }))}
          submission={photoDialog.submission}
          student={{ id: photoDialog.submission.student_id, name: photoDialog.studentName }}
        />
      )}

      {rtDialog.open && rtDialog.submission && (
        <RTRecordingPlayerDialog
          open={rtDialog.open}
          onOpenChange={(open) => setRtDialog(prev => ({ ...prev, open }))}
          submission={rtDialog.submission}
          studentName={rtDialog.studentName}
          studentId={rtDialog.studentId}
          homeworkId={rtDialog.homeworkId}
          homeworkTitle={rtDialog.homeworkTitle}
          passageId={rtDialog.passageId}
        />
      )}

      {quickSmsStudent && (
        <QuickMessageDialog
          open={!!quickSmsStudent}
          onOpenChange={(open) => { if (!open) setQuickSmsStudent(null); }}
          studentId={quickSmsStudent.id}
          studentName={quickSmsStudent.name}
          studentPhone={quickSmsStudent.student_phone}
          parentPhone={quickSmsStudent.parent_phone}
        />
      )}

      {quickKakaoStudent && (
        <QuickKakaoDialog
          open={!!quickKakaoStudent}
          onOpenChange={(open) => { if (!open) setQuickKakaoStudent(null); }}
          studentId={quickKakaoStudent.id}
          studentName={quickKakaoStudent.name}
          studentPhone={quickKakaoStudent.student_phone}
          parentPhone={quickKakaoStudent.parent_phone}
        />
      )}
    </div>
  );
}
