import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, TrendingUp, CalendarDays } from "lucide-react";

interface SubmissionCalendarProps {
  submissions: Array<{
    submission_date?: string;
    submitted_at?: string;
  }>;
  studentCreatedAt?: string;
  dismissedDates?: string[];
  pauseStartDate?: string | null;
  noAssignmentDates?: string[];
  /** 단어과제가 중지된 기간에는 녹음(리뷰)과제 제출 현황으로 표시 */
  reviewMode?: boolean;
  /** 리뷰과제: 배정일(yyyy-MM-dd) 및 제출 시각 */
  reviewAssignments?: Array<{ assignedDate: string; submittedAt: string | null }>;
}

const GLOBAL_START_DATE = "2026-02-08";

const parseDateOnly = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setHours(0, 0, 0, 0);
  return date;
};

/** 해당 날짜가 속한 주의 월요일 */
const startOfWeekMonday = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0(일)~6(토)
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
};

export function SubmissionCalendar({
  submissions,
  studentCreatedAt,
  dismissedDates = [],
  pauseStartDate = null,
  noAssignmentDates = [],
  reviewMode = false,
  reviewAssignments = [],
}: SubmissionCalendarProps) {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [displayMonth, setDisplayMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // 과제 시작일 계산 (학생 등록일 또는 시스템 기준일 중 늦은 날짜)
  const assignmentStartDate = useMemo(() => {
    const globalStart = parseDateOnly(GLOBAL_START_DATE);
    let startDate = new Date(globalStart);

    if (studentCreatedAt) {
      const createdKST = new Date(new Date(studentCreatedAt).getTime() + 9 * 60 * 60 * 1000);
      const createdDate = new Date(createdKST.getUTCFullYear(), createdKST.getUTCMonth(), createdKST.getUTCDate());
      createdDate.setHours(0, 0, 0, 0);
      if (createdDate > globalStart) startDate = createdDate;
    }

    return startDate;
  }, [studentCreatedAt]);

  // 과제중단은 중단한 다음 날부터 신규 생성이 멈춤
  const pauseEffectiveDate = useMemo(() => {
    if (!pauseStartDate) return null;
    return addDays(parseDateOnly(pauseStartDate), 1);
  }, [pauseStartDate]);

  // 제출한 날짜 Set 및 늦은 제출 카운트 (표시 중인 월 기준)
  const { submittedDates, lateSubmissionCount } = useMemo(() => {
    const dates = new Set<string>();
    let lateCount = 0;

    submissions.forEach((submission) => {
      const dateStr = submission.submission_date || (
        submission.submitted_at ? format(new Date(submission.submitted_at), "yyyy-MM-dd") : null
      );

      if (!dateStr) return;

      const submissionDate = parseDateOnly(dateStr);
      if (!isSameMonth(submissionDate, displayMonth)) return;

      dates.add(dateStr);

      if (submission.submission_date && submission.submitted_at) {
        const submittedAt = new Date(submission.submitted_at);
        const deadline = parseDateOnly(submission.submission_date);
        deadline.setDate(deadline.getDate() + 1);
        if (submittedAt >= deadline) {
          lateCount++;
        }
      }
    });

    return { submittedDates: dates, lateSubmissionCount: lateCount };
  }, [submissions, displayMonth]);

  // 현재 보고 있는 달의 날짜 목록
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(displayMonth);
    const naturalEnd = endOfMonth(displayMonth);
    const end = isSameMonth(displayMonth, today) ? today : naturalEnd;

    if (start > end) return [];
    return eachDayOfInterval({ start, end });
  }, [displayMonth, today]);

  // dismissed 날짜 Set
  const dismissedSet = useMemo(() => new Set(dismissedDates), [dismissedDates]);
  const noAssignmentSet = useMemo(() => new Set(noAssignmentDates), [noAssignmentDates]);

  // 제출한 날, 미제출 날, 과제없는 날, 취소 날 분리
  const { submittedDays, missedDays, noAssignmentDays, dismissedDays } = useMemo(() => {
    const submitted: Date[] = [];
    const missed: Date[] = [];
    const noAssignment: Date[] = [];
    const dismissed: Date[] = [];

    daysInMonth.forEach((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      if (isSameDay(day, today)) return;

      // 과제 시작일 이전은 '과제 없음'
      if (day < assignmentStartDate) {
        noAssignment.push(day);
        return;
      }

      // 명시적으로 '과제없음' 처리된 날짜
      if (noAssignmentSet.has(dayStr)) {
        noAssignment.push(day);
        return;
      }

      // 취소된 날짜 (dismissed)
      if (dismissedSet.has(dayStr)) {
        dismissed.push(day);
        return;
      }

      // 과제중단 이후 날짜는 '과제 없음'
      if (pauseEffectiveDate && day >= pauseEffectiveDate) {
        noAssignment.push(day);
        return;
      }

      if (submittedDates.has(dayStr)) {
        submitted.push(day);
      } else {
        missed.push(day);
      }
    });

    return {
      submittedDays: submitted,
      missedDays: missed,
      noAssignmentDays: noAssignment,
      dismissedDays: dismissed,
    };
  }, [daysInMonth, submittedDates, assignmentStartDate, dismissedSet, noAssignmentSet, pauseEffectiveDate, today]);

  // ===== 녹음(리뷰)과제 모드 =====
  // 배정일별로 묶어 "그 주의 다음 월요일"까지 제출 여부로 기간 색상 결정
  const reviewDays = useMemo(() => {
    const onTime: Date[] = [];
    const late: Date[] = [];
    const missed: Date[] = [];
    if (!reviewMode || reviewAssignments.length === 0) {
      return { onTime, late, missed, onTimeCount: 0, lateCount: 0, missedCount: 0 };
    }

    const now = new Date();

    // 배정일 단위 집계 (같은 날 여러 지문이면 모두 제출해야 완료)
    const byDate = new Map<string, { submittedAt: Date | null; allSubmitted: boolean }>();
    reviewAssignments.forEach(({ assignedDate, submittedAt }) => {
      const key = assignedDate.slice(0, 10);
      const prev = byDate.get(key) || { submittedAt: null, allSubmitted: true };
      if (!submittedAt) {
        prev.allSubmitted = false;
      } else {
        const at = new Date(submittedAt);
        if (!prev.submittedAt || at > prev.submittedAt) prev.submittedAt = at;
      }
      byDate.set(key, prev);
    });

    const dates = Array.from(byDate.keys()).sort();

    dates.forEach((dateKey, idx) => {
      const info = byDate.get(dateKey)!;
      const start = parseDateOnly(dateKey);
      const weekStart = startOfWeekMonday(start);
      const weekEnd = addDays(weekStart, 6); // 일요일

      // 같은 주 안의 다음 배정일 전날까지가 이 과제의 구간
      const nextInWeek = dates
        .slice(idx + 1)
        .map((d) => parseDateOnly(d))
        .find((d) => d > start && d <= weekEnd);
      const spanEnd = nextInWeek ? addDays(nextInWeek, -1) : weekEnd;

      // 마감: 다음 주 월요일 종료 시각
      const deadline = addDays(weekStart, 7);
      deadline.setHours(23, 59, 59, 999);

      let status: "onTime" | "late" | "missed" | "pending";
      if (info.allSubmitted && info.submittedAt) {
        status = info.submittedAt <= deadline ? "onTime" : "late";
      } else if (now <= deadline) {
        status = "pending"; // 기간이 남았으면 표시하지 않음
      } else {
        status = "missed";
      }
      if (status === "pending") return;

      eachDayOfInterval({ start, end: spanEnd }).forEach((day) => {
        if (!isSameMonth(day, displayMonth)) return;
        if (day > today) return;
        if (status === "onTime") onTime.push(day);
        else if (status === "late") late.push(day);
        else missed.push(day);
      });
    });

    return {
      onTime,
      late,
      missed,
      onTimeCount: onTime.length,
      lateCount: late.length,
      missedCount: missed.length,
    };
  }, [reviewMode, reviewAssignments, displayMonth, today]);

  const activeDays = submittedDays.length + missedDays.length;
  const completionRate = activeDays > 0 ? Math.round((submittedDays.length / activeDays) * 100) : 0;


  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border shadow-sm">
      <div className="relative p-2.5">
        {/* 헤더 - 컴팩트 */}
        <div className="relative flex items-center justify-between mb-3 -mx-3 -mt-3 px-3 py-2.5 bg-slate-50/60 border-b border-slate-100">
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1d1d1f] flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-xs">{reviewMode ? "이번 달 녹음과제 제출 현황" : "이번 달 단어과제 제출 현황"}</h3>
              <p className="text-[9px] text-muted-foreground">{format(displayMonth, "yyyy년 M월", { locale: ko })}</p>
            </div>
          </div>
        </div>

        {/* 범례 - 인라인 */}
        {reviewMode ? (
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-blue-600" />
              <span className="text-[9px] text-muted-foreground">기한 내 제출</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[9px] text-muted-foreground">지각 제출</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[9px] text-muted-foreground">미제출</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted ring-1 ring-primary/40" />
              <span className="text-[9px] text-muted-foreground">오늘</span>
            </div>
          </div>
        ) : (
        <div className="flex items-center gap-3 mb-1.5">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-blue-600" />
            <span className="text-[9px] text-muted-foreground">제출</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[9px] text-muted-foreground">미제출</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-muted" />
            <span className="text-[9px] text-muted-foreground">과제없음</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[9px] text-muted-foreground">취소</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-muted ring-1 ring-primary/40" />
            <span className="text-[9px] text-muted-foreground">오늘</span>
          </div>
        </div>
        )}

        <Calendar
          mode="single"
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          locale={ko}
          disabled={{ after: today }}
          modifiers={reviewMode ? {
            submitted: reviewDays.onTime,
            lateSubmitted: reviewDays.late,
            missed: reviewDays.missed,
          } : {
            submitted: submittedDays,
            missed: missedDays,
            noAssignment: noAssignmentDays,
            dismissed: dismissedDays,
          }}
          modifiersStyles={{
            submitted: {
              background: "linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(221 83% 53%) 100%)",
              color: "white",
              fontWeight: 600,
              borderRadius: "6px",
              boxShadow: "0 1px 4px hsl(217 91% 60% / 0.25)",
            },
            lateSubmitted: {
              background: "linear-gradient(135deg, hsl(38 92% 55%) 0%, hsl(25 95% 53%) 100%)",
              color: "white",
              fontWeight: 600,
              borderRadius: "6px",
              boxShadow: "0 1px 4px hsl(25 95% 53% / 0.25)",
            },
            missed: {
              background: "linear-gradient(135deg, hsl(347 77% 50%) 0%, hsl(0 72% 51%) 100%)",
              color: "white",
              fontWeight: 600,
              borderRadius: "6px",
              boxShadow: "0 1px 4px hsl(0 84% 60% / 0.25)",
            },
            noAssignment: {
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
              fontWeight: 400,
              borderRadius: "6px",
              opacity: 0.5,
            },
            dismissed: {
              background: "hsl(215 14% 70%)",
              color: "white",
              fontWeight: 500,
              borderRadius: "6px",
              opacity: 0.7,
            },
          }}
          className="rounded-lg pointer-events-auto w-full"
          classNames={{
            months: "flex flex-col w-full",
            month: "space-y-0.5 w-full",
            caption: "flex justify-center relative items-center h-5",
            caption_label: "text-xs font-bold text-foreground",
            nav: "space-x-1 flex items-center",
            nav_button: "h-6 w-6 bg-muted hover:bg-muted/80 p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-border transition-all text-muted-foreground",
            nav_button_previous: "absolute left-0",
            nav_button_next: "absolute right-0",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground flex-1 font-medium text-[9px] text-center pb-0.5",
            row: "flex w-full mt-0",
            cell: "flex-1 text-center text-xs p-0 relative",
            day: "h-7 w-full mx-auto p-0 font-medium rounded-md hover:bg-muted inline-flex items-center justify-center transition-all text-foreground text-[11px]",
            day_selected: "bg-primary text-primary-foreground",
            day_today: "bg-muted ring-1 ring-primary/50 text-foreground font-bold",
            day_outside: "text-muted-foreground opacity-40",
            day_disabled: "text-muted-foreground opacity-20",
          }}
        />

        {/* 통계 요약 - 인라인 컴팩트 */}
        <div className="mt-1.5 pt-1.5 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground">제출</span>
            <span className="text-xs font-bold text-foreground">{reviewMode ? reviewDays.onTimeCount : submittedDays.length}일</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] text-muted-foreground">지각제출</span>
            <span className="text-xs font-bold text-foreground">{reviewMode ? reviewDays.lateCount : lateSubmissionCount}일</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span className="text-[10px] text-muted-foreground">미제출</span>
            <span className="text-xs font-bold text-foreground">{reviewMode ? reviewDays.missedCount : missedDays.length}일</span>
          </div>
        </div>
      </div>
    </div>
  );
}
