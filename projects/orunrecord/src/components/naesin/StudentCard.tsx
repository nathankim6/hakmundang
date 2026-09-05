import { Award, GraduationCap, Sparkles, TrendingUp, User } from "lucide-react";
import { scoreTier, tierStyles, formatSchoolName, type StudentSummary } from "@/lib/naesin";
import { ScoreBadge } from "./ScoreBadge";
import { SchoolLogo, findLogo } from "./SchoolLogo";
import { cn } from "@/lib/utils";

export function StudentCard({ student }: { student: StudentSummary }) {
  const initial = student.name.charAt(0);
  const avg = (() => {
    const nums = student.records.map((r) => parseInt(r.score)).filter((n) => !isNaN(n));
    if (!nums.length) return null;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  })();
  const top = student.records.reduce<number>((max, r) => {
    const n = parseInt(r.score);
    return !isNaN(n) && n > max ? n : max;
  }, 0);

  const perfectCount = student.records.filter((r) => r.score === "100").length;

  // 가장 최근 시험의 학년 (records는 시험 시점 오름차순으로 정렬됨)
  const latestGrade = (() => {
    for (let i = student.records.length - 1; i >= 0; i--) {
      const g = student.records[i].grade;
      const m = String(g || "").match(/([1-3])/);
      if (m) return `중${m[1]}`;
    }
    const m2 = String(student.grade || "").match(/([1-3])/);
    return m2 ? `중${m2[1]}` : "";
  })();

  return (
    <article className="group rounded-3xl bg-card shadow-elegant border border-border/60 overflow-hidden animate-fade-in transition-smooth hover:shadow-elevated">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground relative overflow-hidden">
        {/* Layered ambient glow */}
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, hsl(38 90% 55% / 0.45), transparent 55%), radial-gradient(circle at 88% 80%, hsl(224 90% 55% / 0.5), transparent 55%), radial-gradient(circle at 60% 0%, hsl(280 70% 55% / 0.25), transparent 60%)",
          }}
        />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Top hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative p-6 sm:p-7">
          {/* Eyebrow row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-accent/70" />
              <span className="text-[10px] uppercase tracking-[0.32em] font-semibold text-accent/90">
                Student Profile
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4 sm:gap-5">
            {/* Avatar — 학교 로고 우선, 없으면 이니셜 */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-accent/30 blur-xl" />
              <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-gradient-to-br from-white/25 via-white/10 to-white/5 backdrop-blur-md ring-1 ring-white/30 shadow-elegant flex items-center justify-center overflow-hidden">
                {findLogo(student.school) ? (
                  <SchoolLogo
                    school={student.school}
                    size="lg"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white shadow-sm"
                  />
                ) : (
                  <span className="font-display text-3xl font-bold tracking-tight">{initial}</span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] leading-tight">
                {student.name}
                <span className="text-base font-normal opacity-50 ml-1.5">학생</span>
              </h3>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-2.5">
                {student.school && student.school !== "-" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 pl-1 pr-3 py-1 text-xs">
                    <SchoolLogo school={student.school} size="sm" />
                    <span className="font-medium text-primary-foreground/90">
                      {formatSchoolName(student.school)}
                    </span>
                  </span>
                )}
                {latestGrade && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 px-2.5 py-1 text-xs text-primary-foreground/85">
                    <GraduationCap className="w-3 h-3" />
                    {latestGrade}
                  </span>
                )}
                {student.teacher && student.teacher !== "-" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 px-2.5 py-1 text-xs text-primary-foreground/85">
                    <User className="w-3 h-3" />
                    {student.teacher}
                  </span>
                )}
              </div>
            </div>
          </div>

          {avg !== null && (
            <>
              {/* Decorative divider */}
              <div className="mt-6 h-px w-full bg-gradient-to-r from-white/25 via-white/8 to-transparent" />
              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                <Stat
                  icon={<TrendingUp className="w-3 h-3" />}
                  label="평균"
                  value={avg}
                  suffix="점"
                />
                <Stat
                  icon={<Award className="w-3 h-3" />}
                  label="최고"
                  value={top}
                  suffix="점"
                  highlight
                />
                <Stat
                  icon={<Sparkles className="w-3 h-3" />}
                  label="100점"
                  value={perfectCount}
                  suffix="회"
                />
              </div>
            </>
          )}
        </div>

        {/* Bottom hairline */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </header>

      {/* Records grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/60">
        {student.records.map((r, idx) => {
          const tier = scoreTier(r.score);
          const s = tierStyles[tier];
          return (
            <div key={idx} className="bg-card p-5 transition-smooth hover:bg-secondary/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">{r.period}</div>
                    {(() => {
                      const gm = String(r.grade || "").match(/([1-3])/);
                      if (!gm) return null;
                      return (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold tracking-wide">
                          <GraduationCap className="w-2.5 h-2.5" strokeWidth={2.5} />
                          중{gm[1]}
                        </span>
                      );
                    })()}
                  </div>
                  <dl className="mt-2 space-y-1 text-xs">
                    {r.school && r.school !== "-" && (
                      <div className="flex items-center gap-1.5">
                        <dt className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 w-10 flex-shrink-0">학교</dt>
                        <dd className="text-foreground/80 truncate inline-flex items-center gap-1.5">
                          <SchoolLogo school={r.school} size="sm" />
                          {formatSchoolName(r.school)}
                        </dd>
                      </div>
                    )}
                    {r.teacher && r.teacher !== "-" && (
                      <div className="flex items-baseline gap-1.5">
                        <dt className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 w-10 flex-shrink-0">강사</dt>
                        <dd className="text-foreground/80 truncate">{r.teacher}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <ScoreBadge value={r.score} size="sm" />
              </div>
              <div className={cn("mt-3 font-numeric text-4xl font-extrabold leading-none", s.text)}>
                {r.score === "-" ? "—" : r.score}
                <span className="text-sm font-medium text-muted-foreground/60 ml-1">점</span>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function Stat({
  icon,
  label,
  value,
  suffix,
  highlight,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3 sm:p-4 backdrop-blur-sm border transition-smooth",
        highlight
          ? "bg-accent/15 border-accent/35 shadow-elegant"
          : "bg-white/5 border-white/15 hover:bg-white/8",
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-primary-foreground/65 font-semibold">
        {icon}
        {label}
      </div>
      <div className="font-numeric text-2xl sm:text-3xl font-extrabold mt-1.5 leading-none flex items-baseline gap-1">
        <span className={cn(highlight && "text-accent")}>{value}</span>
        <span className="text-sm font-medium opacity-60">{suffix}</span>
      </div>
    </div>
  );
}
