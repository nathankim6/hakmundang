import React from 'react';
import { getCategoryAccent } from '@/utils/chartPalette';

type ProblemTypeCardProps = {
  item: {
    name: string;
    value: number;
    percentage: string;
  };
  index: number;
  themeColors?: any; // deprecated — kept for backward compatibility
};



const ProblemTypeCard: React.FC<ProblemTypeCardProps> = ({ item, index }) => {
  const accent = getCategoryAccent(index);
  const pct = parseFloat(item.percentage);

  return (
    <div className="group relative flex items-center gap-5 overflow-hidden border border-[hsl(var(--ink)/0.1)] bg-[hsl(var(--paper))] px-5 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-16px_hsl(var(--ink)/0.2)]">
      <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: accent.bar }} />

      {/* 도넛 게이지 — 비율을 한눈에 */}
      <div className="relative h-[74px] w-[74px] shrink-0">
        <div
          className="h-full w-full rounded-full transition-all duration-700"
          style={{
            background: `conic-gradient(${accent.bar} ${Math.min(pct, 100)}%, ${accent.track} 0)`,
          }}
        />
        <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-[hsl(var(--paper))]">
          <span
            className="text-[19px] font-bold leading-none tabular-nums tracking-[-0.03em]"
            style={{ color: accent.label }}
          >
            {Math.round(pct)}
          </span>
          <span className="text-[9px] font-semibold text-[hsl(var(--ink-soft)/0.8)]">%</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h4
          className="break-keep text-[17px] font-bold leading-snug tracking-[-0.015em] text-[hsl(var(--ink))]"
          title={item.name}
        >
          {item.name}
        </h4>
        <div className="mt-2 flex flex-nowrap items-center gap-2">
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-bold tabular-nums whitespace-nowrap"
            style={{ color: accent.label, background: accent.tint, whiteSpace: 'nowrap' }}
          >
            {item.value}문항
          </span>
          <span className="whitespace-nowrap text-[11px] font-medium text-[hsl(var(--ink-soft)/0.75)]">
            전체 중 {item.percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProblemTypeCard;
