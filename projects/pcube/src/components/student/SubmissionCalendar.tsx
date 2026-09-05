import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, eachDayOfInterval, isSameDay, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays, CheckCircle2, Clock, Flame, TrendingUp, XCircle } from "lucide-react";

interface SubmissionCalendarProps {
  submissions: Array<{
    submission_date?: string;
    submitted_at?: string;
  }>;
  studentCreatedAt?: string;
  dismissedDates?: string[];
  /** 녹음과제를 제출한 날짜들 (yyyy-MM-dd) — 해당 주(월~일) 전체를 제출 처리 */
  recordingSubmittedDates?: string[];
}

const GLOBAL_START_DATE = "2026-02-08";

export function SubmissionCalendar({ submissions, studentCreatedAt, dismissedDates = [], recordingSubmittedDates = [] }: SubmissionCalendarProps) {
  const today = new Date();

  // 과제 시작일 계산 (학생 등록일 또는 시스템 기준일 중 늦은 날짜)
  const assignmentStartDate = useMemo(() => {
    const globalStart = new Date(GLOBAL_START_DATE);
    globalStart.setHours(0, 0, 0, 0);
    let startDate = new Date(globalStart);
    if (studentCreatedAt) {
      const createdKST = new Date(new Date(studentCreatedAt).getTime() + 9 * 60 * 60 * 1000);
      const createdDate = new Date(createdKST.getUTCFullYear(), createdKST.getUTCMonth(), createdKST.getUTCDate());
      if (createdDate > globalStart) startDate = createdDate;
    }
    return startDate;
  }, [studentCreatedAt]);

  // 제출한 날짜 Set 및 늦은 제출 카운트
  const { submittedDates, lateSubmissionCount } = useMemo(() => {
    const dates = new Set<string>();
    let lateCount = 0;

    submissions.forEach((submission) => {
      const dateStr = submission.submission_date || (
      submission.submitted_at ? format(new Date(submission.submitted_at), "yyyy-MM-dd") : null);
      if (dateStr) {
        dates.add(dateStr);

        if (submission.submission_date && submission.submitted_at) {
          const submissionDate = new Date(submission.submission_date);
          const submittedAt = new Date(submission.submitted_at);
          const deadline = new Date(submissionDate);
          deadline.setDate(deadline.getDate() + 1);
          deadline.setHours(0, 0, 0, 0);
          if (submittedAt >= deadline) {
            lateCount++;
          }
        }
      }
    });
    return { submittedDates: dates, lateSubmissionCount: lateCount };
  }, [submissions]);

  // 이번 달의 모든 날짜 (오늘까지만)
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(today);
    const end = today;
    return eachDayOfInterval({ start, end });
  }, []);

  // dismissed 날짜 Set
  const dismissedSet = useMemo(() => new Set(dismissedDates), [dismissedDates]);

  // 녹음과제 제출 주차(월~일) Set
  const recordingWeekSet = useMemo(() => {
    const weeks = new Set<string>();
    recordingSubmittedDates.forEach((d) => {
      const date = new Date(d + "T00:00:00");
      if (isNaN(date.getTime())) return;
      weeks.add(format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"));
    });
    return weeks;
  }, [recordingSubmittedDates]);

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

      // 녹음과제를 제출한 주차는 전체를 제출로 표시
      if (recordingWeekSet.has(format(startOfWeek(day, { weekStartsOn: 1 }), "yyyy-MM-dd"))) {
        submitted.push(day);
        return;
      }

      // 취소된 날짜 (dismissed)
      if (dismissedSet.has(dayStr)) {
        dismissed.push(day);
        return;
      }

      if (submittedDates.has(dayStr)) {
        submitted.push(day);
      } else {
        missed.push(day);
      }
    });

    return { submittedDays: submitted, missedDays: missed, noAssignmentDays: noAssignment, dismissedDays: dismissed };
  }, [daysInMonth, submittedDates, assignmentStartDate, dismissedSet, recordingWeekSet]);

  const activeDays = daysInMonth.length > 1 ? daysInMonth.length - 1 - noAssignmentDays.length - dismissedDays.length : 0;
  const completionRate = activeDays > 0 ?
  Math.round(submittedDays.length / activeDays * 100) :
  0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-md">
      {/* 상단 그라데이션 장식 바 */}
      <div className="h-1 bg-gradient-to-r from-primary via-blue-400 to-primary/60" />

      <div className="relative p-3">
        {/* 헤더 + 범례 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden shadow-sm ring-1 ring-border/40 flex-shrink-0">
              <CalendarDays className="w-full h-full shrink-0" strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-foreground text-[12px] leading-tight">
              이번 달 단어과제 제출 현황
              <span className="ml-1 font-medium text-[10px] text-muted-foreground">{format(today, "yyyy년 M월", { locale: ko })}</span>
            </h3>
          </div>
          <div className="flex items-center gap-x-2 gap-y-0.5 flex-wrap justify-end">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-blue-600" />
              <span className="text-[9px] text-muted-foreground font-medium">제출</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-rose-500 to-red-600" />
              <span className="text-[9px] text-muted-foreground font-medium">미제출</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted border border-border/50" />
              <span className="text-[9px] text-muted-foreground font-medium">과제없음</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              <span className="text-[9px] text-muted-foreground font-medium">취소</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted ring-[1.5px] ring-primary/50" />
              <span className="text-[9px] text-muted-foreground font-medium">오늘</span>
            </div>
          </div>
        </div>


        <Calendar
          mode="single"
          locale={ko}
          defaultMonth={today}
          disabled={{ after: today }}
          modifiers={{
            submitted: submittedDays,
            missed: missedDays,
            noAssignment: noAssignmentDays,
            dismissed: dismissedDays
          }}
          modifiersStyles={{
            submitted: {
              background: "linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(221 83% 53%) 100%)",
              color: "white",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "0 2px 6px hsl(217 91% 60% / 0.3)"
            },
            missed: {
              background: "linear-gradient(135deg, hsl(347 77% 50%) 0%, hsl(0 72% 51%) 100%)",
              color: "white",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "0 2px 6px hsl(0 84% 60% / 0.3)"
            },
            noAssignment: {
              background: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
              fontWeight: 400,
              borderRadius: "8px",
              opacity: 0.45
            },
            dismissed: {
              background: "hsl(215 14% 70%)",
              color: "white",
              fontWeight: 500,
              borderRadius: "8px",
              opacity: 0.65
            }
          }}
          className="rounded-xl pointer-events-auto w-full p-0"
          classNames={{
            months: "flex flex-col w-full",
            month: "space-y-1 w-full",
            caption: "flex justify-center relative items-center h-6",
            caption_label: "text-[12px] font-bold text-foreground tracking-tight",
            nav: "space-x-1 flex items-center",
            nav_button: "h-6 w-6 bg-muted hover:bg-accent p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-border/60 transition-all text-muted-foreground hover:text-foreground",
            nav_button_previous: "absolute left-0",
            nav_button_next: "absolute right-0",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground flex-1 font-semibold text-[9px] text-center uppercase tracking-wide",
            row: "flex w-full mt-0.5",
            cell: "flex-1 text-center text-xs p-0 relative",
            day: "h-7 w-7 mx-auto p-0 font-semibold rounded-md hover:bg-accent inline-flex items-center justify-center transition-all text-foreground text-[11px]",
            day_selected: "bg-primary text-primary-foreground",
            day_today: "bg-accent ring-2 ring-primary/40 text-foreground font-bold",
            day_outside: "text-muted-foreground opacity-30",
            day_disabled: "text-muted-foreground opacity-15"
          }}
        />

        {/* 통계 요약 - 컴팩트 */}
        <div className="mt-2 pt-2 border-t border-border/40 grid grid-cols-3 gap-1.5">
          <div className="flex items-center justify-center gap-1 bg-primary/5 rounded-md py-1">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            <span className="text-[13px] font-extrabold text-foreground leading-none">{submittedDays.length}</span>
            <span className="text-[9px] text-muted-foreground font-medium">제출</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-amber-500/5 rounded-md py-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="text-[13px] font-extrabold text-foreground leading-none">{lateSubmissionCount}</span>
            <span className="text-[9px] text-muted-foreground font-medium">지각제출</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-rose-500/5 rounded-md py-1">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span className="text-[13px] font-extrabold text-foreground leading-none">{missedDays.length}</span>
            <span className="text-[9px] text-muted-foreground font-medium">미제출</span>
          </div>

        </div>
      </div>
    </div>
  );
}
