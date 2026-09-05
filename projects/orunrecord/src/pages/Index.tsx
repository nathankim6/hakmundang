import { useMemo, useState } from "react";
import { ArrowDown, ArrowDownUp, ArrowUp, BookOpen, Presentation, Search, School, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buildStudentSummaries, DATA, formatSchoolName, formatSchoolGrade, type Record2526, type RecordYearly } from "@/lib/naesin";
import { StudentCard } from "@/components/naesin/StudentCard";
import { BrowseTable } from "@/components/naesin/BrowseTable";
import { TeacherView } from "@/components/naesin/TeacherView";
import { EmptyState } from "@/components/naesin/EmptyState";
import { SchoolLogo } from "@/components/naesin/SchoolLogo";

import orunLogo from "@/assets/orun-logo.png";

type Mode = "student" | "browse" | "teacher";
type Year = "2026" | "2025" | "2024" | "2023";
type Grade = "all" | "1" | "2" | "3";
type SchoolFilter = string; // "all" 또는 정규화된 학교명

const GRADES: { key: Grade; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "1", label: "1학년" },
  { key: "2", label: "2학년" },
  { key: "3", label: "3학년" },
];

const YEARS: Year[] = ["2026", "2025", "2024", "2023"];
const PERIODS_2025 = [
  { key: "25년_1중간", label: "1학기 중간" },
  { key: "25년_1기말", label: "1학기 기말" },
  { key: "25년_2중간", label: "2학기 중간" },
  { key: "25년_2기말", label: "2학기 기말" },
];

const PERIODS_YEARLY = [
  { key: "1학기중간", label: "1학기 중간" },
  { key: "1학기기말", label: "1학기 기말" },
  { key: "2학기중간", label: "2학기 중간" },
  { key: "2학기기말", label: "2학기 기말" },
] as const;

type YearlyKey = (typeof PERIODS_YEARLY)[number]["key"];

const Index = () => {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("student");
  const [year, setYear] = useState<Year>("2026");
  const [period25, setPeriod25] = useState("25년_2기말");
  const [periodYearly, setPeriodYearly] = useState<YearlyKey>("2학기기말");
  const [grade, setGrade] = useState<Grade>("all");
  const [school, setSchool] = useState<SchoolFilter>("all");
  const [sort, setSort] = useState<"none" | "desc" | "asc">("none");

  // 현재 선택된 연도/시험 데이터에서 학교 목록을 동적으로 추출
  const schoolOptions = useMemo(() => {
    const set = new Set<string>();
    if (year === "2026") {
      ((DATA["26년_1중간"] as Record2526[]) || []).forEach((r) => {
        const n = formatSchoolName(r.학교);
        if (n) set.add(n);
      });
    } else if (year === "2025") {
      ((DATA[period25] as Record2526[]) || []).forEach((r) => {
        const n = formatSchoolName(r.학교);
        if (n) set.add(n);
      });
    } else {
      const key = year === "2024" ? "2024년" : "2023년";
      ((DATA[key] as RecordYearly[]) || []).forEach((r) => {
        // 학교학년에서 학교만 분리
        const formatted = formatSchoolGrade(r.학교학년);
        const schoolOnly = formatted.replace(/\s*[1-3]학년\s*$/, "").trim();
        if (schoolOnly) set.add(schoolOnly);
      });
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [year, period25]);

  const students = useMemo(() => buildStudentSummaries(query), [query]);

  const handleSearch = () => setQuery(input.trim());
  const handleClear = () => {
    setInput("");
    setQuery("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <header className="gradient-hero text-primary-foreground relative overflow-hidden">
        {/* Ambient color orbs */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, hsl(38 90% 55% / 0.45), transparent 55%), radial-gradient(circle at 88% 82%, hsl(224 90% 50% / 0.5), transparent 55%), radial-gradient(circle at 65% 0%, hsl(280 70% 55% / 0.25), transparent 60%)",
          }}
        />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Soft top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        {/* Bottom divider */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          {/* Brand row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/95 shadow-elegant flex items-center justify-center p-1.5 ring-1 ring-white/40">
                <img src={orunLogo} alt="Orun Academy" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[15px] font-bold tracking-tight leading-none">
                  ORUN ENGLISH
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-[-0.02em] leading-[1.05]">
            <span className="text-accent">옳은영어</span>{" "}
            <span className="text-primary-foreground/95">내신성적 아카이브</span>{" "}
            <span className="italic font-display text-accent/95"></span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-primary-foreground/65 max-w-2xl leading-relaxed">
            2023년부터 현재까지, 학생별 내신 성적과 이력을 한눈에 확인할 수 있습니다
          </p>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8 -mt-6 relative">
        {/* Search bar */}
        <div className="rounded-2xl bg-card shadow-elevated border border-border/60 p-2 sm:p-2.5 mb-5 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="이름, 학교, 강사로 검색..."
                className="h-12 pl-11 pr-10 border-0 bg-transparent text-base focus-visible:ring-0 placeholder:text-muted-foreground/60"
              />
              {input && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-smooth"
                  aria-label="지우기"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              className="h-12 px-6 rounded-xl gradient-hero text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition-smooth border-0"
            >
              검색
            </Button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="inline-flex p-1.5 rounded-2xl bg-card border border-border/60 shadow-elegant mb-6 flex-wrap">
          <ModeTab active={mode === "student"} onClick={() => setMode("student")} icon={<Users className="w-4 h-4" />}>
            학생별 검색
          </ModeTab>
          <ModeTab active={mode === "teacher"} onClick={() => setMode("teacher")} icon={<Presentation className="w-4 h-4" />}>
            강사별 조회
          </ModeTab>
          <ModeTab active={mode === "browse"} onClick={() => setMode("browse")} icon={<BookOpen className="w-4 h-4" />}>
            시험별 조회
          </ModeTab>
        </div>

        {/* Content */}
        {mode === "student" && (
          <section className="space-y-5">
            {!query ? (
              <EmptyState
                title="학생 이름을 검색해 보세요"
                hint=""
              />
            ) : students.length === 0 ? (
              <EmptyState title={`"${query}"에 해당하는 학생이 없습니다`} hint="철자를 확인하시거나 다른 검색어를 시도해 보세요." />
            ) : (
              <>
                <p className="text-sm text-muted-foreground px-1">
                  <span className="font-bold font-numeric text-foreground text-base">{students.length}</span>명의 학생을 찾았습니다
                </p>
                {students.map((s) => (
                  <StudentCard key={s.name} student={s} />
                ))}
              </>
            )}
          </section>
        )}

        {mode === "teacher" && <TeacherView query={query} />}

        {mode === "browse" && (
          <section>
            {/* Grade filter + Sort */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {GRADES.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setGrade(g.key)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold transition-smooth border",
                    grade === g.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {g.label}
                </button>
              ))}

              <button
                onClick={() =>
                  setSort((s) => (s === "none" ? "desc" : s === "desc" ? "asc" : "none"))
                }
                className={cn(
                  "ml-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-smooth border",
                  sort === "none"
                    ? "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                    : "bg-primary text-primary-foreground border-primary",
                )}
                aria-label="점수 정렬"
              >
                {sort === "desc" ? (
                  <ArrowDown className="w-3.5 h-3.5" />
                ) : sort === "asc" ? (
                  <ArrowUp className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownUp className="w-3.5 h-3.5" />
                )}
                {sort === "desc" ? "점수 내림차순" : sort === "asc" ? "점수 오름차순" : "점수 정렬"}
              </button>
            </div>

            {/* Year tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-semibold text-sm transition-smooth border",
                    year === y
                      ? "gradient-hero text-primary-foreground border-transparent shadow-elegant"
                      : "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {y}년
                </button>
              ))}
            </div>

            {/* 2025 period selector */}
            {year === "2025" && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {PERIODS_2025.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod25(p.key)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold transition-smooth border",
                      period25 === p.key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* 2024 / 2023 period selector */}
            {(year === "2024" || year === "2023") && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {PERIODS_YEARLY.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriodYearly(p.key)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold transition-smooth border",
                      periodYearly === p.key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* School filter */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <School className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                  School
                </span>
                {school !== "all" && (
                  <button
                    onClick={() => setSchool("all")}
                    className="ml-auto text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    초기화
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSchool("all")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-smooth border",
                    school === "all"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  전체 학교
                </button>
                {schoolOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSchool(s)}
                    className={cn(
                      "inline-flex items-center gap-1.5 pl-1.5 pr-3.5 py-1 rounded-full text-xs font-semibold transition-smooth border",
                      school === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <SchoolLogo school={s} size="xs" />
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <BrowseTable query={query} year={year} period25={period25} periodYearly={periodYearly} grade={grade} school={school} sort={sort} />
          </section>
        )}

        <footer className="mt-16 pt-8 border-t border-border/60 text-center">
          <p className="text-xs text-muted-foreground/70">© 2026 ORUN ENGLISH · 옳은영어 내신성적 아카이브</p>
        </footer>
      </main>
    </div>
  );
};

function ModeTab({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth",
        active ? "gradient-hero text-primary-foreground shadow-elegant" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export default Index;
