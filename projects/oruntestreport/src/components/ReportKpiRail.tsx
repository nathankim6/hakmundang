import React from 'react';
import { ListChecks, Sigma, Flame, Shuffle, Gauge } from 'lucide-react';

type Problem = {
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  questionType: 'objective' | 'subjective';
  isVariant?: boolean;
  points?: number;
  isKiller?: boolean;
};

type ReportKpiRailProps = {
  problemTypes: Problem[];
};

const KpiCell: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  accent?: boolean;
  /** CSS 변수명 (예: '--c1') — 테마 팔레트 기반 */
  token?: string;
  icon?: React.ReactNode;
}> = ({ label, value, unit, hint, token = '--c1', icon }) => {
  const softToken = token.endsWith('-soft') ? token : `${token}-soft`;
  return (
    <div
      className="relative min-w-0 px-5 py-5 md:px-7 md:py-6 overflow-hidden"
      style={{ backgroundColor: `hsl(var(${softToken}) / 0.55)` }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ backgroundColor: `hsl(var(${token}))` }}
      />
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0"
          style={{ backgroundColor: `hsl(var(${token}) / 0.12)`, color: `hsl(var(${token}))` }}
        >
          {icon}
        </span>
        <span className="editorial-kicker block text-[9px] tracking-[0.26em] truncate" style={{ color: `hsl(var(${token}))` }}>
          {label}
        </span>
      </div>
      <div className="mt-3.5 flex items-baseline gap-1">
        <span
          className="metric-num text-[30px] md:text-[38px]"
          style={{ color: `hsl(var(${token}))` }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[11px] font-medium text-[hsl(var(--ink-soft))]">{unit}</span>
        )}
      </div>
      {hint && (
        <span className="mt-2 block text-[11px] leading-tight text-[hsl(var(--ink-soft))] break-keep">
          {hint}
        </span>
      )}
    </div>
  );
};

const ReportKpiRail: React.FC<ReportKpiRailProps> = ({ problemTypes }) => {
  const total = problemTypes.length;
  const killer = problemTypes.filter((p) => p.isKiller || p.difficulty === 'very_hard').length;
  const variant = problemTypes.filter((p) => p.isVariant).length;
  const hardish = problemTypes.filter(
    (p) => p.difficulty === 'hard' || p.difficulty === 'very_hard'
  ).length;
  const hardRatio = total ? Math.round((hardish / total) * 100) : 0;

  return (
    <div className="relative rounded-[20px] border border-[hsl(var(--ink)/0.07)] bg-white px-0 md:px-0 py-1 shadow-[0_1px_2px_hsl(var(--ink)/0.03),0_12px_32px_-28px_hsl(var(--ink)/0.4)] overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[hsl(var(--ink)/0.07)]">
        <KpiCell
          label="TOTAL ITEMS"
          value={total}
          unit="문항"
          hint="전체 출제 문항"
          token="--c1"
          icon={<ListChecks className="w-3.5 h-3.5" />}
        />
        <KpiCell
          label="TOTAL POINTS"
          value={100}
          unit="점"
          hint="배점 합계 (100점 만점)"
          accent={false}
          token="--c3"
          icon={<Sigma className="w-3.5 h-3.5" />}
        />
        <KpiCell
          label="KILLER"
          value={killer}
          unit="문항"
          hint="최고난도 변별 문항"
          accent
          token="--diff-xhard"
          icon={<Flame className="w-3.5 h-3.5" />}
        />
        <KpiCell
          label="VARIANT"
          value={variant}
          unit="문항"
          hint="지문 변형 출제"
          accent
          token="--c5"
          icon={<Shuffle className="w-3.5 h-3.5" />}
        />
        <KpiCell
          label="HARD RATIO"
          value={hardRatio}
          unit="%"
          hint="어려움 이상 비중"
          token="--c4"
          icon={<Gauge className="w-3.5 h-3.5" />}
        />
      </div>
    </div>
  );
};

export default ReportKpiRail;
