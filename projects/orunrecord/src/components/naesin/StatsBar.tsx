import { Award, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoreStats } from "@/lib/naesin";

interface StatsBarProps {
  stats: ScoreStats;
  variant?: "hero" | "compact";
  className?: string;
}

export function StatsBar({ stats, variant = "compact", className }: StatsBarProps) {
  if (variant === "hero") {
    return (
      <div className={cn("grid grid-cols-3 gap-3 sm:gap-5", className)}>
        <HeroStat icon={<Users className="w-3.5 h-3.5" />} label="응시 인원" value={stats.total} suffix="명" />
        <HeroStat icon={<Sparkles className="w-3.5 h-3.5" />} label="100점 비율" value={stats.perfectPct} suffix="%" sub={`${stats.perfect}명`} highlight />
        <HeroStat icon={<Award className="w-3.5 h-3.5" />} label="90점 이상" value={stats.highPct} suffix="%" sub={`${stats.high}명`} />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Pill label="응시" value={`${stats.total}명`} tone="muted" />
      <Pill label="100점" value={`${stats.perfectPct}%`} sub={`${stats.perfect}명`} tone="perfect" />
      <Pill label="90점↑" value={`${stats.highPct}%`} sub={`${stats.high}명`} tone="high" />
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  suffix,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl p-4 sm:p-5 backdrop-blur-sm border", highlight ? "bg-accent/15 border-accent/30" : "bg-white/8 border-white/15")}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary-foreground/65 font-semibold">
        {icon}
        {label}
      </div>
      <div className="font-numeric mt-2 flex items-baseline gap-1.5">
        <span className={cn("text-3xl sm:text-4xl font-extrabold leading-none", highlight && "text-accent")}>{value}</span>
        <span className="text-sm font-medium opacity-70">{suffix}</span>
        {sub && <span className="text-xs opacity-50 ml-auto font-medium">{sub}</span>}
      </div>
    </div>
  );
}

const toneStyles: Record<string, string> = {
  muted: "bg-secondary/60 text-muted-foreground border-border/60",
  perfect: "bg-score-perfect-bg text-score-perfect border-score-perfect/20",
  high: "bg-score-high-bg text-score-high border-score-high/20",
};

function Pill({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: keyof typeof toneStyles }) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5", toneStyles[tone])}>
      <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">{label}</span>
      <span className="font-numeric text-sm font-extrabold tracking-tight">{value}</span>
      {sub && <span className="text-[10px] opacity-60 font-medium">{sub}</span>}
    </div>
  );
}
