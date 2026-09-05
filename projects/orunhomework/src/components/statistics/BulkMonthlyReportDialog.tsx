import { useState, useMemo, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Loader2, Users, MessageSquare, CheckCircle2, XCircle, TrendingUp, CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cacheBustUrl } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isFuture, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { useOwnerFilter } from "@/hooks/useOwnerFilter";

interface BulkMonthlyReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAILY_WORD_START_DATE = "2026-02-08";

// March 2026 no-assignment dates
const MARCH_2026_NO_ASSIGNMENT = new Set([
  "2026-03-01","2026-03-02","2026-03-03","2026-03-04","2026-03-05","2026-03-06","2026-03-07","2026-03-08",
  "2026-03-30","2026-03-31",
]);

function getAssignmentStartDate(studentCreatedAt: string | null) {
  const globalStart = new Date(DAILY_WORD_START_DATE + "T00:00:00");
  globalStart.setHours(0, 0, 0, 0);
  if (!studentCreatedAt) return globalStart;
  const createdKST = new Date(new Date(studentCreatedAt).getTime() + 9 * 60 * 60 * 1000);
  const createdDate = new Date(createdKST.getUTCFullYear(), createdKST.getUTCMonth(), createdKST.getUTCDate());
  createdDate.setHours(0, 0, 0, 0);
  return createdDate > globalStart ? createdDate : globalStart;
}

function isNoAssignmentDate(dateStr: string): boolean {
  return MARCH_2026_NO_ASSIGNMENT.has(dateStr);
}

// Single student report card for rendering
function StudentReportCard({
  student,
  submissions,
  dismissedDates,
  comment,
  selectedMonth,
  reportRef,
}: {
  student: { id: string; name: string; school: string; grade: string; schoolLogoUrl?: string; created_at: string };
  submissions: Array<{ submission_date: string; submitted_at: string }>;
  dismissedDates: string[];
  comment: string;
  selectedMonth: string;
  reportRef: React.RefObject<HTMLDivElement>;
}) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assignmentStartDate = getAssignmentStartDate(student.created_at);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const submissionDates = new Set(submissions.map(s => s.submission_date));
  const dismissedSet = new Set(dismissedDates);

  // Pause check
  const { data: pauseSetting } = useQuery({
    queryKey: ["pause-setting-report", student.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", `daily_word_pause_${student.id}`)
        .maybeSingle();
      return data?.value || null;
    },
  });

  const pauseStartDate = pauseSetting ? (() => {
    try { return JSON.parse(pauseSetting).startDate || null; } catch { return null; }
  })() : null;

  const pauseEffectiveDate = pauseStartDate
    ? new Date(new Date(pauseStartDate + "T00:00:00").getTime() + 86400000)
    : null;
  if (pauseEffectiveDate) pauseEffectiveDate.setHours(0, 0, 0, 0);

  // Calculate stats
  const { submittedDays, missedDays, noAssignmentDays } = useMemo(() => {
    const submitted: Date[] = [];
    const missed: Date[] = [];
    const noAssignment: Date[] = [];

    calendarDays.forEach(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      if (isFuture(day) || isSameDay(day, today)) return;

      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      if (dayStart < assignmentStartDate || dismissedSet.has(dayStr) || isNoAssignmentDate(dayStr)) {
        noAssignment.push(day);
        return;
      }
      if (pauseEffectiveDate && dayStart >= pauseEffectiveDate && !submissionDates.has(dayStr)) {
        noAssignment.push(day);
        return;
      }

      if (submissionDates.has(dayStr)) {
        submitted.push(day);
      } else {
        missed.push(day);
      }
    });

    return { submittedDays: submitted, missedDays: missed, noAssignmentDays: noAssignment };
  }, [calendarDays, submissionDates, assignmentStartDate, dismissedSet, pauseEffectiveDate, today]);

  const activeDays = submittedDays.length + missedDays.length;
  const completionRate = activeDays > 0 ? Math.round((submittedDays.length / activeDays) * 100) : 0;

  // Late count
  const lateCount = submissions.filter(s => {
    const deadline = new Date(s.submission_date + "T00:00:00");
    deadline.setDate(deadline.getDate() + 1);
    return new Date(s.submitted_at) >= deadline;
  }).length;

  const shortSchool = student.school.replace("고등학교", "고").replace("중학교", "중");

  const rateColor = completionRate >= 80 ? "#059669" : completionRate >= 50 ? "#d97706" : "#dc2626";
  const rateLabel = completionRate >= 80 ? "우수" : completionRate >= 50 ? "보통" : "노력 필요";

  return (
    <div ref={reportRef} className="w-[560px]" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Premium Header with gradient */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)", padding: "24px 28px", borderRadius: "16px 16px 0 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {student.schoolLogoUrl ? (
              <img src={cacheBustUrl(student.schoolLogoUrl)} alt={student.school} style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)", border: "2px solid rgba(255,255,255,0.15)" }}>
                {shortSchool.slice(0, 2)}
              </div>
            )}
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>{student.name}</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "2px 0 0 0" }}>{shortSchool} · {student.grade}</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>완료율</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", margin: "2px 0 0 0", lineHeight: 1 }}>{completionRate}<span style={{ fontSize: 16, fontWeight: 600 }}>%</span></p>
          </div>
        </div>
        {/* Brand bar */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.05em" }}>옳은영어 · 일일 단어과제 월별 리포트</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{format(new Date(year, month - 1), "yyyy년 M월", { locale: ko })}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ background: "#ffffff", padding: "20px 28px 24px", borderRadius: "0 0 16px 16px", border: "1px solid #e2e8f0", borderTop: "none" }}>
        {/* Stats cards row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, padding: "12px 14px", borderRadius: 10, background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #bfdbfe" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>제출</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#1e40af" }}>{submittedDays.length}<span style={{ fontSize: 11, fontWeight: 500, color: "#64748b" }}>일</span></span>
          </div>
          <div style={{ flex: 1, padding: "12px 14px", borderRadius: 10, background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)", border: "1px solid #fca5a5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>미제출</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#dc2626" }}>{missedDays.length}<span style={{ fontSize: 11, fontWeight: 500, color: "#64748b" }}>일</span></span>
          </div>
          <div style={{ flex: 1, padding: "12px 14px", borderRadius: 10, background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "1px solid #fde68a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>지각</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#d97706" }}>{lateCount}<span style={{ fontSize: 11, fontWeight: 500, color: "#64748b" }}>일</span></span>
          </div>
          <div style={{ flex: 1, padding: "12px 14px", borderRadius: 10, background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>총 과제일</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#334155" }}>{activeDays}<span style={{ fontSize: 11, fontWeight: 500, color: "#64748b" }}>일</span></span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>이달 달성률</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: rateColor }}>{rateLabel}</span>
          </div>
          <div style={{ width: "100%", height: 8, borderRadius: 4, background: "#e2e8f0", overflow: "hidden" }}>
            <div style={{ width: `${completionRate}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${rateColor}cc, ${rateColor})`, transition: "width 0.3s" }} />
          </div>
        </div>

        {/* Calendar */}
        <div style={{ marginBottom: 16, padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fafbfc" }}>
          <Calendar
            mode="single"
            locale={ko}
            month={new Date(year, month - 1)}
            disabled={{ after: today }}
            modifiers={{
              submitted: submittedDays,
              missed: missedDays,
              noAssignment: noAssignmentDays,
            }}
            modifiersStyles={{
              submitted: {
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "white",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
              },
              missed: {
                background: "linear-gradient(135deg, #f43f5e, #dc2626)",
                color: "white",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(220,38,38,0.25)",
              },
              noAssignment: {
                background: "#f1f5f9",
                color: "#94a3b8",
                borderRadius: "8px",
                opacity: 0.5,
              },
            }}
            className="rounded-lg pointer-events-none w-full"
            classNames={{
              months: "flex flex-col w-full",
              month: "space-y-1 w-full",
              caption: "flex justify-center relative items-center h-8",
              caption_label: "text-sm font-bold text-slate-900",
              nav: "hidden",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell: "text-slate-400 flex-1 font-semibold text-[10px] text-center",
              row: "flex w-full mt-1",
              cell: "flex-1 text-center text-xs p-0 relative",
              day: "h-9 w-full mx-auto p-0 font-semibold rounded-lg inline-flex items-center justify-center text-slate-900 text-xs",
              day_today: "ring-2 ring-blue-400/50 font-bold",
              day_outside: "text-slate-300 opacity-40",
              day_disabled: "text-slate-300 opacity-20",
            }}
          />
        </div>

        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: comment ? 16 : 0, padding: "6px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(135deg, #3b82f6, #2563eb)" }} />
            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>제출</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(135deg, #f43f5e, #dc2626)" }} />
            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>미제출</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "#e2e8f0" }} />
            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>과제없음</span>
          </div>
        </div>

        {/* Teacher Comment */}
        {comment && (
          <div style={{ padding: "16px 18px", borderRadius: 12, background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", border: "1px solid #bae6fd", position: "relative", overflow: "hidden" }}>
            {/* Decorative quote mark */}
            <div style={{ position: "absolute", top: 8, right: 14, fontSize: 48, fontWeight: 800, color: "rgba(56,189,248,0.12)", lineHeight: 1, fontFamily: "Georgia, serif" }}>"</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #0ea5e9, #0284c7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(14,165,233,0.3)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", letterSpacing: "-0.01em" }}>선생님 코멘트</span>
            </div>
            <p style={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap", lineHeight: 1.7, margin: 0, fontWeight: 450 }}>{comment}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, margin: 0 }}>옳은영어 학습 리포트</p>
          </div>
          <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, margin: 0 }}>{format(new Date(), "yyyy.MM.dd")} 발행</p>
        </div>
      </div>
    </div>
  );
}

export default function BulkMonthlyReportDialog({ open, onOpenChange }: BulkMonthlyReportDialogProps) {
  const { ownerCodeId, shouldFilter } = useOwnerFilter();

  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [comments, setComments] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const renderRef = useRef<HTMLDivElement>(null);

  // Schools
  const { data: schools = [] } = useQuery({
    queryKey: ["bulk-report-schools", ownerCodeId],
    enabled: open,
    queryFn: async () => {
      let q = supabase.from("schools").select("id, name, logo_url").order("name");
      if (shouldFilter && ownerCodeId) q = q.eq("owner_code_id", ownerCodeId);
      const { data } = await q;
      return data || [];
    },
  });

  // Grades
  const { data: grades = [] } = useQuery({
    queryKey: ["bulk-report-grades", selectedSchool],
    enabled: open && !!selectedSchool,
    queryFn: async () => {
      const { data } = await supabase.from("grades").select("id, name").eq("school_id", selectedSchool).order("name");
      return data || [];
    },
  });

  // Students
  const { data: students = [] } = useQuery({
    queryKey: ["bulk-report-students", selectedGrade],
    enabled: open && !!selectedGrade,
    queryFn: async () => {
      const { data } = await supabase.from("students").select("id, name, created_at").eq("grade_id", selectedGrade).order("name");
      return data || [];
    },
  });

  const [year, month] = selectedMonth.split("-").map(Number);
  const monthStart = format(startOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");
  const monthEnd2 = format(endOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");

  // All submissions for the grade/month
  const studentIds = students.map(s => s.id);
  const { data: allSubmissions = [] } = useQuery({
    queryKey: ["bulk-report-submissions", studentIds, selectedMonth],
    enabled: open && studentIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_word_submissions")
        .select("student_id, submission_date, submitted_at")
        .in("student_id", studentIds)
        .gte("submission_date", monthStart)
        .lte("submission_date", monthEnd2);
      return data || [];
    },
  });

  // Dismissed dates
  const { data: allDismissed = [] } = useQuery({
    queryKey: ["bulk-report-dismissed", studentIds, selectedMonth],
    enabled: open && studentIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("dismissed_daily_words")
        .select("student_id, dismissed_date")
        .in("student_id", studentIds)
        .gte("dismissed_date", monthStart)
        .lte("dismissed_date", monthEnd2);
      return data || [];
    },
  });

  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: format(date, "yyyy년 M월", { locale: ko }),
    };
  });

  const selectedSchoolData = schools.find(s => s.id === selectedSchool);

  const handleGenerateSingle = useCallback(async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const el = document.getElementById(`report-card-${studentId}`);
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(); return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const shortSchool = (selectedSchoolData?.name || "").replace("고등학교", "고").replace("중학교", "중");
          a.download = `${student.name}_${shortSchool}_${selectedMonth.replace("-", "")}_월별리포트.jpg`;
          a.click();
          URL.revokeObjectURL(url);
          resolve();
        }, "image/jpeg", 0.95);
      });

      toast.success(`${student.name} 리포트가 다운로드되었습니다.`);
    } catch (e) {
      console.error("Single report generation failed:", e);
      toast.error("리포트 생성 중 오류가 발생했습니다.");
    }
  }, [students, selectedMonth, selectedSchoolData]);

  const handleGenerate = useCallback(async () => {
    if (students.length === 0) return;
    setIsGenerating(true);
    setProgress({ current: 0, total: students.length });

    try {
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        setProgress({ current: i + 1, total: students.length });

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 300));

        const el = document.getElementById(`report-card-${student.id}`);
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(); return; }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const shortSchool = (selectedSchoolData?.name || "").replace("고등학교", "고").replace("중학교", "중");
            a.download = `${student.name}_${shortSchool}_${selectedMonth.replace("-", "")}_월별리포트.jpg`;
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          }, "image/jpeg", 0.95);
        });

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast.success(`${students.length}명의 리포트가 다운로드되었습니다.`);
    } catch (e) {
      console.error("Report generation failed:", e);
      toast.error("리포트 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [students, comments, selectedMonth, selectedSchoolData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-t-2xl">
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            반별 월별 리포트 일괄 다운로드
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-sm">
            학교/반을 선택하고 학생별 코멘트를 입력한 후 일괄 다운로드하세요
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex gap-3">
            <Select value={selectedSchool} onValueChange={(v) => { setSelectedSchool(v); setSelectedGrade(""); }}>
              <SelectTrigger className="flex-1 h-9 text-sm">
                <SelectValue placeholder="학교 선택" />
              </SelectTrigger>
              <SelectContent>
                {schools.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name.replace("고등학교", "고").replace("중학교", "중")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="flex-1 h-9 text-sm">
                <SelectValue placeholder="반 선택" />
              </SelectTrigger>
              <SelectContent>
                {grades.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="flex-1 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0 px-6 py-4">
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Users className="w-12 h-12 opacity-20" />
              <p className="text-sm">학교와 반을 선택하세요</p>
            </div>
          ) : (
            <div className="space-y-6">
              {students.map(student => {
                const studentSubs = allSubmissions.filter(s => s.student_id === student.id);
                const studentDismissed = allDismissed.filter(d => d.student_id === student.id).map(d => d.dismissed_date);
                const studentSchool = selectedSchoolData;

                // Quick stats
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const assignStart = getAssignmentStartDate(student.created_at);
                const mStart = startOfMonth(new Date(year, month - 1));
                const mEnd = endOfMonth(new Date(year, month - 1));
                const days = eachDayOfInterval({ start: mStart, end: mEnd });
                const subSet = new Set(studentSubs.map(s => s.submission_date));
                const disSet = new Set(studentDismissed);
                let submitted = 0, missed = 0;
                days.forEach(d => {
                  const ds = format(d, "yyyy-MM-dd");
                  if (isFuture(d) || isSameDay(d, today)) return;
                  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                  if (dd < assignStart || disSet.has(ds) || isNoAssignmentDate(ds)) return;
                  if (subSet.has(ds)) submitted++; else missed++;
                });
                const total = submitted + missed;
                const rate = total > 0 ? Math.round((submitted / total) * 100) : 0;

                return (
                  <div key={student.id} className="rounded-xl border border-border overflow-hidden">
                    {/* Student header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{student.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            제출 {submitted}일 · 미제출 {missed}일
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${rate >= 80 ? "text-emerald-600" : rate >= 50 ? "text-amber-600" : "text-destructive"}`}>
                          {rate}%
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleGenerateSingle(student.id)}
                          title="개인 리포트 다운로드"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Comment input */}
                    <div className="px-4 py-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5 mb-2">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">코멘트</span>
                      </div>
                      <Textarea
                        placeholder="학생에게 전할 코멘트를 입력하세요..."
                        value={comments[student.id] || ""}
                        onChange={(e) => setComments(prev => ({ ...prev, [student.id]: e.target.value }))}
                        className="min-h-[60px] text-sm resize-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Hidden render area for report cards */}
        <div
          style={{ position: "fixed", left: "-9999px", top: 0 }}
          ref={renderRef}
        >
          {students.map(student => {
            const studentSubs = allSubmissions.filter(s => s.student_id === student.id);
            const studentDismissed = allDismissed.filter(d => d.student_id === student.id).map(d => d.dismissed_date);

            return (
              <div key={student.id} id={`report-card-${student.id}`}>
                <StudentReportCard
                  student={{
                    ...student,
                    school: selectedSchoolData?.name || "",
                    grade: grades.find(g => g.id === selectedGrade)?.name || "",
                    schoolLogoUrl: selectedSchoolData?.logo_url || undefined,
                  }}
                  submissions={studentSubs}
                  dismissedDates={studentDismissed}
                  comment={comments[student.id] || ""}
                  selectedMonth={selectedMonth}
                  reportRef={{ current: null }}
                />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {students.length > 0 ? `${students.length}명 · 각 학생별 JPG 파일 다운로드` : "학교/반을 선택하세요"}
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || students.length === 0}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress.current}/{progress.total} 생성 중...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                전체 리포트 다운로드
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
