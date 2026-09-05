import { useMemo, useState } from "react";
import { GraduationCap, Trophy, Users as UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildTeacherSummary, getAllTeachers, periodSortKey, scoreTier, tierStyles, formatSchoolName } from "@/lib/naesin";
import { ScoreBadge } from "./ScoreBadge";
import { EmptyState } from "./EmptyState";
import { SchoolLogo } from "./SchoolLogo";

interface TeacherViewProps {
  query: string;
}

export function TeacherView({ query }: TeacherViewProps) {
  const teachers = useMemo(() => getAllTeachers(), []);
  const [selected, setSelected] = useState<string>(teachers[0] ?? "");

  const summary = useMemo(
    () => (selected ? buildTeacherSummary(selected, query) : null),
    [selected, query],
  );

  // 시험명 → 학생 그룹
  const grouped = useMemo(() => {
    if (!summary) return [];
    const map: Record<string, typeof summary.entries> = {};
    summary.entries.forEach((e) => {
      if (!map[e.period]) map[e.period] = [];
      map[e.period].push(e);
    });
    return Object.entries(map)
      .map(([period, list]) => ({
        period,
        list: list.sort((a, b) => {
          const av = parseInt(a.score);
          const bv = parseInt(b.score);
          if (isNaN(av)) return 1;
          if (isNaN(bv)) return -1;
          return bv - av;
        }),
      }))
      .sort((a, b) => periodSortKey(a.period) - periodSortKey(b.period));
  }, [summary]);

  if (!teachers.length) {
    return <EmptyState title="등록된 강사 정보가 없습니다" />;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Teacher chip selector */}
      <div className="flex flex-wrap gap-2">
        {teachers.map((t) => (
          <button
            key={t}
            onClick={() => setSelected(t)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-smooth border",
              selected === t
                ? "gradient-hero text-primary-foreground border-transparent shadow-elegant"
                : "bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {summary && (
        <article className="rounded-3xl bg-card shadow-elegant border border-border/60 overflow-hidden">
          {/* Header */}
          <header className="gradient-hero text-primary-foreground p-6 sm:p-7 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 85% 15%, hsl(38 90% 55% / 0.45), transparent 55%)",
              }}
            />
            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl font-bold font-display flex-shrink-0">
                {summary.teacher.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.25em] font-semibold text-primary-foreground/60">
                  Instructor
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight mt-1">
                  {summary.teacher} <span className="text-base font-normal opacity-70">선생님</span>
                </h3>
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-3 pt-5 border-t border-white/10">
              <Stat icon={<UsersIcon className="w-3.5 h-3.5" />} label="담당 학생" value={summary.studentCount} suffix="명" />
              <Stat icon={<GraduationCap className="w-3.5 h-3.5" />} label="평균" value={summary.avg ?? 0} suffix="점" />
              <Stat icon={<Trophy className="w-3.5 h-3.5" />} label="100점" value={summary.perfectCount} suffix="회" />
            </div>
          </header>

          {/* Grouped records */}
          {summary.entries.length === 0 ? (
            <EmptyState
              title={query ? `"${query}"와 일치하는 기록이 없습니다` : "기록이 없습니다"}
            />
          ) : (
            <div className="divide-y divide-border/60">
              {grouped.map((g) => {
                const nums = g.list
                  .map((e) => parseInt(e.score))
                  .filter((n) => !isNaN(n));
                const total = nums.length;
                const perfect = nums.filter((n) => n === 100).length;
                const high = nums.filter((n) => n >= 90).length;
                const perfectPct = total ? Math.round((perfect / total) * 100) : 0;
                const highPct = total ? Math.round((high / total) * 100) : 0;
                return (
                <section key={g.period} className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <h4 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
                      {g.period}
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-muted-foreground font-numeric">
                        응시 {total}명 / 총 {g.list.length}명
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-score-perfect-bg border-score-perfect/30 text-score-perfect">
                        100점 {perfectPct}%
                        <span className="opacity-60 font-numeric">({perfect})</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-score-high-bg border-score-high/30 text-score-high">
                        90+ {highPct}%
                        <span className="opacity-60 font-numeric">({high})</span>
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {g.list.map((e, i) => {
                      const tier = scoreTier(e.score);
                      const s = tierStyles[tier];
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-secondary/30 transition-smooth hover:bg-secondary/60"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm text-foreground truncate">
                              {e.name}
                            </div>
                            <dl className="mt-1 space-y-0.5 text-[11px]">
                              {e.school && e.school !== "-" && (
                                <div className="flex items-center gap-1.5">
                                  <dt className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/60 w-8 flex-shrink-0">학교</dt>
                                  <dd className="text-muted-foreground truncate inline-flex items-center gap-1.5">
                                    <SchoolLogo school={e.school} size="xs" />
                                    {formatSchoolName(e.school)}
                                  </dd>
                                </div>
                              )}
                              {e.grade && e.grade !== "-" && (
                                <div className="flex items-baseline gap-1.5">
                                  <dt className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/60 w-8 flex-shrink-0">학년</dt>
                                  <dd className="text-muted-foreground truncate">{e.grade}</dd>
                                </div>
                              )}
                            </dl>
                          </div>
                          <div className={cn("font-numeric text-xl font-extrabold", s.text)}>
                            {e.score === "-" ? "—" : e.score}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
                );
              })}
            </div>
          )}
        </article>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary-foreground/60 font-semibold">
        {icon}
        {label}
      </div>
      <div className="font-numeric text-2xl font-bold mt-1">
        {value}
        <span className="text-sm font-normal opacity-60 ml-0.5">{suffix}</span>
      </div>
    </div>
  );
}
