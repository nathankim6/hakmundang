import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, GraduationCap, RotateCcw, Download, Search, Plus,
  Check, Clock, X, CircleDashed, Trash2, BookOpen, ChevronDown, Pencil,
} from "lucide-react";
import { loadWeeks, saveWeeks, resetWeeks, parseStartHour, clearAllStudents, clearAllRanges } from "./storage";
import type { Week, Student, SchoolMeta, AttendanceStatus } from "./types";
import { cn } from "@/lib/utils";

const DAY_TABS: { key: string; label: string; match: (d: string) => boolean }[] = [
  { key: "토", label: "토요일", match: (d) => d.includes("토") },
  { key: "일", label: "일요일", match: (d) => d.includes("일") },
  { key: "평일", label: "평일", match: (d) => /[월화수목금]/.test(d) || !d },
];

const HOUR_SLOTS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

function hourLabel(h: number) {
  if (h < 12) return `오전 ${h}시`;
  if (h === 12) return `오후 12시`;
  return `오후 ${h - 12}시`;
}

const SCHOOL_PALETTE = [
  { bg: "bg-[oklch(0.95_0.05_265)]", text: "text-[oklch(0.4_0.15_265)]", dot: "bg-[oklch(0.55_0.18_265)]" },
  { bg: "bg-[oklch(0.95_0.05_150)]", text: "text-[oklch(0.4_0.15_150)]", dot: "bg-[oklch(0.55_0.18_150)]" },
  { bg: "bg-[oklch(0.95_0.05_30)]",  text: "text-[oklch(0.45_0.18_30)]", dot: "bg-[oklch(0.6_0.2_30)]" },
  { bg: "bg-[oklch(0.95_0.05_320)]", text: "text-[oklch(0.4_0.18_320)]", dot: "bg-[oklch(0.55_0.2_320)]" },
  { bg: "bg-[oklch(0.94_0.06_200)]", text: "text-[oklch(0.4_0.15_200)]", dot: "bg-[oklch(0.55_0.18_200)]" },
  { bg: "bg-[oklch(0.95_0.05_85)]",  text: "text-[oklch(0.42_0.15_85)]", dot: "bg-[oklch(0.6_0.18_85)]" },
];

function schoolColor(schools: SchoolMeta[], name: string) {
  const i = Math.max(0, schools.findIndex((s) => s.name === name));
  return SCHOOL_PALETTE[i % SCHOOL_PALETTE.length];
}

export function ClinicApp() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [activeWeek, setActiveWeek] = useState(1);
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rangesOpen, setRangesOpen] = useState(true);

  useEffect(() => { setWeeks(loadWeeks()); }, []);
  useEffect(() => { if (weeks.length) saveWeeks(weeks); }, [weeks]);

  const current = weeks.find((w) => w.week === activeWeek);

  // Filter by school/query only (day is shown as columns)
  const filteredStudents = useMemo(() => {
    if (!current) return [] as Student[];
    return current.students.filter((s) => {
      if (schoolFilter !== "all" && s.school !== schoolFilter) return false;
      if (query && !s.name.includes(query)) return false;
      return true;
    });
  }, [current, schoolFilter, query]);

  const stats = useMemo(() => {
    const all = filteredStudents;
    const present = all.filter((s) => s.status === "present").length;
    const late = all.filter((s) => s.status === "late").length;
    const absent = all.filter((s) => s.status === "absent").length;
    return { total: all.length, present, late, absent, rate: all.length ? Math.round(((present + late) / all.length) * 100) : 0 };
  }, [filteredStudents]);

  // For each day (토/일/평일), build { hourKey -> students[] }
  const dayBuckets = useMemo(() => {
    const result: Record<string, Map<number | "other", Student[]>> = {};
    const extraHours = new Set<number>();
    for (const tab of DAY_TABS) {
      const m = new Map<number | "other", Student[]>();
      HOUR_SLOTS.forEach((h) => m.set(h, []));
      result[tab.key] = m;
    }
    for (const s of filteredStudents) {
      const tab = DAY_TABS.find((t) => t.match(s.day || ""));
      if (!tab) continue;
      const h = parseStartHour(s.time);
      const key: number | "other" = h != null ? h : "other";
      const m = result[tab.key];
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(s);
      if (h != null && !HOUR_SLOTS.includes(h)) extraHours.add(h);
    }
    // Compute unified hour order across all days
    const hours: (number | "other")[] = [
      ...Array.from(new Set([...HOUR_SLOTS, ...extraHours])).sort((a, b) => a - b),
    ];
    // include "other" only if any day uses it
    const hasOther = DAY_TABS.some((t) => (result[t.key].get("other") || []).length > 0);
    if (hasOther) hours.push("other");
    // Ensure each map has entries for every hour
    for (const tab of DAY_TABS) {
      for (const h of hours) if (!result[tab.key].has(h)) result[tab.key].set(h, []);
    }
    return { hours, byDay: result };
  }, [filteredStudents]);

  function update(fn: (w: Week) => Week) {
    setWeeks((prev) => prev.map((w) => (w.week === activeWeek ? fn(w) : w)));
  }

  const updateStudent = (id: string, patch: Partial<Student>) =>
    update((w) => ({ ...w, students: w.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  const deleteStudent = (id: string) =>
    update((w) => ({ ...w, students: w.students.filter((s) => s.id !== id) }));

  const addStudent = (hour: number | "other", dayKey: string) => {
    if (!current) return;
    const school = schoolFilter !== "all" ? schoolFilter : current.schools[0]?.name ?? "";
    const time = hour === "other" ? "" : `${hour <= 12 ? hour : hour - 12}시~${(hour + 2) <= 12 ? hour + 2 : (hour + 2) - 12}시`;
    const newStudent: Student = {
      id: `w${activeWeek}-new-${Date.now()}`,
      name: "새 학생",
      school,
      day: dayKey,
      time,
      status: "pending",
    };
    update((w) => ({ ...w, students: [...w.students, newStudent] }));
  };

  const updateSchoolRange = (name: string, range: string) =>
    update((w) => ({ ...w, schools: w.schools.map((s) => (s.name === name ? { ...s, range } : s)) }));

  function exportCSV() {
    if (!current) return;
    const labels: Record<AttendanceStatus, string> = { pending: "예정", present: "출석", late: "지각", absent: "결석" };
    const rows = [["주차", "요일", "시간", "학교", "이름", "상태"]];
    current.students.forEach((s) => rows.push([`${current.week}주차`, s.day, s.time, s.school, s.name, labels[s.status]]));
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `주말클리닉_${current.week}주차.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (confirm("모든 출석 데이터를 초기화하시겠습니까?")) setWeeks(resetWeeks());
  }

  function handleClearStudents() {
    if (confirm("모든 주차의 학생 명단을 모두 삭제할까요?\n(진도/범위는 유지됩니다)")) {
      setWeeks((prev) => clearAllStudents(prev));
    }
  }

  function handleClearRanges() {
    if (confirm("모든 주차의 진도/범위를 모두 비울까요?\n(학생 명단은 유지됩니다)")) {
      setWeeks((prev) => clearAllRanges(prev));
    }
  }

  if (!current) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">불러오는 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-accent/30">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-elevated)]" style={{ background: "var(--gradient-primary)" }}>
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">주말클리닉 출석 관리</h1>
                <p className="text-xs text-muted-foreground">김성진T · 요일·시간대별 등원 관리</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:bg-accent">
                <Download className="h-3.5 w-3.5" />CSV 내보내기
              </button>
              <button onClick={handleClearStudents} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-destructive/40 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />명단 초기화
              </button>
              <button onClick={handleClearRanges} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-destructive/40 hover:text-destructive">
                <BookOpen className="h-3.5 w-3.5" />범위 초기화
              </button>
              <button onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-destructive/40 hover:text-destructive">
                <RotateCcw className="h-3.5 w-3.5" />전체 초기화
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
                {weeks.map((w) => (
                  <button
                    key={w.week}
                    onClick={() => setActiveWeek(w.week)}
                    className={cn(
                      "flex flex-col items-center rounded-lg px-4 py-1.5 text-xs font-semibold transition",
                      activeWeek === w.week ? "bg-foreground text-background shadow" : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <span className="text-[10px] uppercase tracking-wider opacity-70">Week</span>
                    <span className="text-sm">{w.week}주차</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{current.dateLabel}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <StatTile label="전체" value={stats.total} tone="default" />
            <StatTile label="출석" value={stats.present} tone="success" />
            <StatTile label="지각" value={stats.late} tone="warning" />
            <StatTile label="결석" value={stats.absent} tone="destructive" />
            <StatTile label="출석률" value={`${stats.rate}%`} tone="primary" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
            <FilterChip active={schoolFilter === "all"} onClick={() => setSchoolFilter("all")}>전체 학교</FilterChip>
            {current.schools.map((s) => {
              const c = schoolColor(current.schools, s.name);
              return (
                <FilterChip key={s.name} active={schoolFilter === s.name} onClick={() => setSchoolFilter(s.name)}>
                  <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", c.dot)} />
                  {s.name}
                </FilterChip>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="학생 이름 검색"
              className="w-40 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* 학교별 범위 (접기) */}
        <div className="mb-3 overflow-hidden rounded-xl border border-border/60 bg-card">
          <button
            onClick={() => setRangesOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left transition hover:bg-accent/40"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">학교별 진도 / 범위</span>
              <span className="text-[11px] text-muted-foreground">{current.schools.length}개교</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", rangesOpen && "rotate-180")} />
          </button>
          {rangesOpen && (
            <div className="grid gap-2 border-t border-border/60 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {current.schools.map((s) => {
                const c = schoolColor(current.schools, s.name);
                return (
                  <div key={s.name} className={cn("rounded-lg border border-border/60 p-2.5", c.bg)}>
                    <div className={cn("text-[10px] font-bold uppercase tracking-wider", c.text)}>{s.name}</div>
                    <textarea
                      value={s.range}
                      onChange={(e) => updateSchoolRange(s.name, e.target.value)}
                      rows={2}
                      placeholder="범위 / 과제 입력..."
                      className="mt-1 w-full resize-none bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 시간대 × 요일 그리드 - 토/일/평일 한눈에 */}
        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
          <div
            className="grid divide-y divide-border/60"
            style={{ gridTemplateColumns: `72px repeat(${DAY_TABS.length}, minmax(0, 1fr))` }}
          >
            {/* header */}
            <div className="sticky top-0 z-10 border-b border-border/60 bg-card/95 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
              시간
            </div>
            {DAY_TABS.map((d) => {
              const count = filteredStudents.filter((s) => d.match(s.day || "")).length;
              const tone =
                d.key === "토" ? "from-info/15 text-info"
                : d.key === "일" ? "from-destructive/15 text-destructive"
                : "from-primary/15 text-primary";
              return (
                <div
                  key={d.key}
                  className={cn(
                    "sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-l border-border/60 bg-gradient-to-b to-transparent px-3 py-2 backdrop-blur",
                    tone,
                  )}
                >
                  <span className="text-sm font-bold">{d.label}</span>
                  <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-foreground tabular-nums">
                    {count}명
                  </span>
                </div>
              );
            })}

            {/* rows: 각 시간 × 요일 */}
            {dayBuckets.hours.map((h) => (
              <HourRow
                key={String(h)}
                hourKey={h}
                label={h === "other" ? "미지정" : hourLabel(h as number)}
                days={DAY_TABS.map((d) => ({
                  key: d.key,
                  students: dayBuckets.byDay[d.key].get(h) || [],
                }))}
                schools={current.schools}
                editingId={editingId}
                setEditingId={setEditingId}
                onAdd={(dayKey) => addStudent(h, dayKey)}
                onUpdate={updateStudent}
                onDelete={deleteStudent}
              />
            ))}
          </div>
        </section>
        {filteredStudents.length === 0 && (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-card/50 py-8 text-center text-sm text-muted-foreground">
            해당 필터에 학생이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

function HourRow({
  label, days, schools, editingId, setEditingId, onAdd, onUpdate, onDelete,
}: {
  hourKey: number | "other";
  label: string;
  days: { key: string; students: Student[] }[];
  schools: SchoolMeta[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onAdd: (dayKey: string) => void;
  onUpdate: (id: string, patch: Partial<Student>) => void;
  onDelete: (id: string) => void;
}) {
  const total = days.reduce((n, d) => n + d.students.length, 0);
  return (
    <div
      className="contents"
    >
      {/* time gutter */}
      <div className={cn(
        "flex flex-col items-center justify-start gap-0.5 border-r border-border/60 px-2 py-2",
        total === 0 ? "bg-transparent" : "bg-gradient-to-r from-primary/5 to-transparent",
      )}>
        <span className="text-[11px] font-bold text-foreground tabular-nums leading-tight text-center">{label}</span>
        <span className="text-[10px] text-muted-foreground tabular-nums">{total}명</span>
      </div>
      {/* day cells */}
      {days.map((d) => (
        <div
          key={d.key}
          className={cn(
            "group/cell relative flex flex-wrap gap-1.5 border-l border-border/60 p-2 min-h-[48px]",
            d.students.length === 0 && "bg-muted/20",
          )}
        >
          {d.students.length === 0 && (
            <span className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground/40">—</span>
          )}
          {d.students.map((s) => (
            <StudentChip
              key={s.id}
              student={s}
              schools={schools}
              editing={editingId === s.id}
              onEdit={() => setEditingId(editingId === s.id ? null : s.id)}
              onClose={() => setEditingId(null)}
              onChange={(p) => onUpdate(s.id, p)}
              onDelete={() => { setEditingId(null); onDelete(s.id); }}
            />
          ))}
          <button
            onClick={() => onAdd(d.key)}
            className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground opacity-0 transition hover:border-primary hover:text-primary group-hover/cell:opacity-100"
            title="학생 추가"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

const ACTIONS: { value: AttendanceStatus; label: string; icon: typeof Check; activeClass: string }[] = [
  { value: "present", label: "출석", icon: Check, activeClass: "bg-success text-white border-success" },
  { value: "late", label: "지각", icon: Clock, activeClass: "bg-warning text-[oklch(0.25_0.1_75)] border-warning" },
  { value: "absent", label: "결석", icon: X, activeClass: "bg-destructive text-white border-destructive" },
  { value: "pending", label: "예정", icon: CircleDashed, activeClass: "bg-muted text-foreground border-border" },
];

const STATUS_CHIP_CLASS: Record<AttendanceStatus, string> = {
  present: "border-success/60 bg-success/10 text-success",
  late:    "border-warning/60 bg-warning/10 text-[oklch(0.42_0.16_75)]",
  absent:  "border-destructive/50 bg-destructive/10 text-destructive line-through decoration-destructive/60",
  pending: "border-border bg-background text-foreground",
};

const STATUS_DOT: Record<AttendanceStatus, string> = {
  present: "bg-success",
  late: "bg-warning",
  absent: "bg-destructive",
  pending: "bg-muted-foreground/40",
};

function StudentChip({
  student, schools, editing, onEdit, onClose, onChange, onDelete,
}: {
  student: Student;
  schools: SchoolMeta[];
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onChange: (p: Partial<Student>) => void;
  onDelete: () => void;
}) {
  const c = schoolColor(schools, student.school);

  if (editing) {
    return (
      <div className="flex w-full flex-col gap-2 rounded-xl border border-primary/40 bg-background p-2.5 shadow-[var(--shadow-elevated)] sm:w-[300px]">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold", c.bg, c.text)}>
            {student.name.slice(0, 1)}
          </div>
          <input
            autoFocus
            value={student.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-primary"
          />
          <button onClick={onDelete} className="text-muted-foreground transition hover:text-destructive" title="삭제">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={student.school}
            onChange={(e) => onChange({ school: e.target.value })}
            className={cn("min-w-0 flex-1 rounded-md px-1.5 py-1 text-[11px] font-medium outline-none", c.bg, c.text)}
          >
            {schools.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
          <input
            value={student.day}
            onChange={(e) => onChange({ day: e.target.value })}
            placeholder="요일"
            className="w-12 rounded-md border border-border bg-muted/40 px-1.5 py-1 text-center text-[11px] text-foreground outline-none"
          />
          <input
            value={student.time}
            onChange={(e) => onChange({ time: e.target.value })}
            placeholder="시간 (예: 3:00)"
            className="min-w-0 flex-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] text-foreground outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            const active = student.status === a.value;
            return (
              <button
                key={a.value}
                onClick={() => onChange({ status: a.value })}
                className={cn(
                  "inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-border bg-background text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground",
                  active && a.activeClass,
                )}
              >
                <Icon className="h-3 w-3" />{a.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="self-end text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
        >
          닫기
        </button>
      </div>
    );
  }

  // Compact chip: click body to cycle status, click pencil to edit
  const cycle = () => {
    const order: AttendanceStatus[] = ["pending", "present", "late", "absent"];
    const next = order[(order.indexOf(student.status) + 1) % order.length];
    onChange({ status: next });
  };

  return (
    <div
      className={cn(
        "group relative flex h-9 w-[168px] shrink-0 items-center gap-1.5 rounded-lg border px-2 text-xs transition hover:shadow-sm",
        STATUS_CHIP_CLASS[student.status],
      )}
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", c.dot)} title={student.school} />
      <button onClick={cycle} className="flex min-w-0 flex-1 flex-col items-start gap-0.5 outline-none">
        <span className="w-full truncate text-left text-[12px] font-semibold leading-none">{student.name}</span>
        <span className="w-full truncate text-left text-[10px] font-medium text-muted-foreground leading-none">
          {student.school}{student.time ? ` · ${student.time}` : ""}
        </span>
      </button>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[student.status])} />
      <button
        onClick={onEdit}
        className="ml-0.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-primary"
        title="편집"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: number | string; tone: "default" | "success" | "warning" | "destructive" | "primary" }) {
  const toneClass = {
    default: "border-border bg-card text-foreground",
    success: "border-success/30 bg-success/5 text-success",
    warning: "border-warning/40 bg-warning/5 text-[oklch(0.45_0.15_75)]",
    destructive: "border-destructive/30 bg-destructive/5 text-destructive",
    primary: "border-primary/30 text-primary-foreground",
  }[tone];
  const style = tone === "primary" ? { background: "var(--gradient-primary)" } : undefined;
  return (
    <div className={cn("rounded-xl border px-3 py-2.5 shadow-sm", toneClass)} style={style}>
      <div className={cn("text-[10px] font-medium uppercase tracking-wider", tone === "primary" ? "text-white/80" : "opacity-70")}>{label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}