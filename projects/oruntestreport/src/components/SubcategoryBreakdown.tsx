import React from 'react';
import { getCategoryAccent } from '@/utils/chartPalette';
import { Crown, Layers, Target } from 'lucide-react';

type Item = { name: string; value: number; percentage: string };

type Props = {
  data: Item[];
  total: number;
};

const SubcategoryBreakdown: React.FC<Props> = ({ data, total }) => {
  if (data.length === 0) return null;

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const top3Share = top3.reduce((s, d) => s + d.value, 0);
  const top3Pct = Math.round((top3Share / Math.max(total, 1)) * 100);
  const maxPct = Math.max(...data.map((d) => parseFloat(d.percentage)), 1);

  const summary = [
    {
      icon: Crown,
      label: '최다 출제 유형',
      value: top3[0].name,
      sub: `${top3[0].value}문항 · ${top3[0].percentage}%`,
    },
    {
      icon: Target,
      label: '상위 3유형 집중도',
      value: `${top3Pct}%`,
      sub: `${top3Share}문항 / 전체 ${total}문항`,
    },
    {
      icon: Layers,
      label: '출제된 소분류 수',
      value: `${data.length}개`,
      sub: `평균 ${(total / data.length).toFixed(1)}문항`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 한눈에 보는 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {summary.map((s, i) => {
          const accent = getCategoryAccent(i);
          return (
            <div
              key={s.label}
              className="flex items-start gap-3 border border-[hsl(var(--ink)/0.08)] bg-[hsl(var(--paper))] px-4 py-3.5"
              style={{ background: `linear-gradient(135deg, ${accent.track} 0%, hsl(var(--paper)) 70%)` }}
            >
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: accent.tint, color: accent.label }}
              >
                <s.icon size={15} />
              </div>
              <div className="min-w-0">
                <div className="editorial-kicker text-[10px] tracking-[0.22em] text-[hsl(var(--ink-soft)/0.75)]">
                  {s.label}
                </div>
                <div
                  className="mt-1 truncate text-[17px] font-bold leading-tight tracking-[-0.015em]"
                  style={{ color: accent.label }}
                  title={s.value}
                >
                  {s.value}
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-[hsl(var(--ink-soft))] tabular-nums">
                  {s.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 전체 구성 스펙트럼 바 */}
      <div>
        <div className="flex h-3 w-full overflow-hidden rounded-full border border-[hsl(var(--ink)/0.08)]">
          {data.map((item, i) => (
            <div
              key={item.name}
              title={`${item.name} · ${item.percentage}%`}
              style={{
                width: `${item.percentage}%`,
                background: getCategoryAccent(i).bar,
                opacity: i < 3 ? 1 : 0.55,
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-medium tracking-[0.14em] text-[hsl(var(--ink-soft)/0.7)] uppercase">
          <span>전체 구성 비율</span>
          <span className="tabular-nums">{total}문항 = 100%</span>
        </div>
      </div>

      {/* 핵심 TOP 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {top3.map((item, i) => {
          const accent = getCategoryAccent(i);
          const pct = parseFloat(item.percentage);
          return (
            <div
              key={item.name}
              className="relative overflow-hidden border border-[hsl(var(--ink)/0.08)] bg-[hsl(var(--paper))] px-5 pb-4 pt-5"
              style={{ animation: `fade-in-up 0.5s ease-out forwards ${0.05 + i * 0.06}s`, opacity: 0 }}
            >
              <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: accent.bar }} />
              <div className="flex items-center justify-between">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
                  style={{ background: accent.tint, color: accent.label }}
                >
                  {i + 1}
                </span>
                <span className="text-[11px] font-semibold tabular-nums text-[hsl(var(--ink-soft))]">
                  {item.value}문항
                </span>
              </div>
              <h4
                className="mt-3 truncate text-[16px] font-bold leading-tight tracking-[-0.015em] text-[hsl(var(--ink))]"
                title={item.name}
              >
                {item.name}
              </h4>
              <div className="mt-3 flex items-end gap-1.5">
                <span
                  className="text-[30px] font-bold leading-none tabular-nums tracking-[-0.03em]"
                  style={{ color: accent.label }}
                >
                  {item.percentage}
                </span>
                <span className="pb-1 text-[13px] font-semibold text-[hsl(var(--ink-soft))]">%</span>
              </div>
              <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full" style={{ background: accent.track }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(pct / maxPct) * 100}%`, background: accent.bar }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 나머지 유형 — 컴팩트 2열 */}
      {rest.length > 0 && (
        <div>
          <div className="mb-2.5 editorial-kicker text-[10px] tracking-[0.22em] text-[hsl(var(--ink-soft)/0.7)]">
            그 외 유형 {rest.length}개
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
            {rest.map((item, i) => {
              const accent = getCategoryAccent(i + 3);
              const pct = parseFloat(item.percentage);
              return (
                <div
                  key={item.name}
                  className="grid grid-cols-[24px_minmax(0,1fr)_90px] items-center gap-3 border-b border-[hsl(var(--ink)/0.06)] py-2.5"
                >
                  <span className="text-[11px] font-semibold tabular-nums text-[hsl(var(--ink-soft)/0.65)]">
                    {i + 4}
                  </span>
                  <div className="min-w-0">
                    <div
                      className="truncate text-[13px] font-semibold text-[hsl(var(--ink))]"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div
                      className="mt-1 h-[4px] w-full overflow-hidden rounded-full"
                      style={{ background: accent.track }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(pct / maxPct) * 100}%`, background: accent.bar }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-right">
                    <span
                      className="text-[13px] font-bold tabular-nums"
                      style={{ color: accent.label }}
                    >
                      {item.percentage}%
                    </span>
                    <span className="text-[11px] font-medium tabular-nums text-[hsl(var(--ink-soft)/0.8)]">
                      {item.value}문항
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryBreakdown;