import React from 'react';
import type { KillerProblem } from '@/integrations/supabase/reportService';

interface KillerTop5SectionProps {
  items?: KillerProblem[];
}

/** 등급을 가른 문항 TOP 5 — 리포트 표시용 */
const KillerTop5Section: React.FC<KillerTop5SectionProps> = ({ items }) => {
  const list = (items || []).filter((it) => it.number?.trim() || it.title?.trim() || it.reason?.trim());
  if (list.length === 0) return null;

  return (
    <section className="report-section">
      <div className="flex items-center gap-3 mb-6">
        <span className="section-numeral section-numeral-c2">★</span>
        <div>
          <span className="editorial-kicker block" style={{ color: 'hsl(var(--c2-deep))' }}>
            Killer
          </span>
          <h2 className="font-display text-2xl md:text-3xl text-[hsl(var(--ink))] tracking-[-0.025em] font-medium leading-tight pdf-capture-nowrap">
            등급을 가른 문항 TOP {list.length}
          </h2>
        </div>
      </div>

      <ol className="space-y-3">
        {list.map((item, index) => (
          <li
            key={index}
            className="relative overflow-hidden rounded-2xl border border-[hsl(var(--ink)/0.1)] bg-[hsl(var(--card))] shadow-[0_6px_24px_-16px_hsl(var(--ink)/0.2)]"
          >
            <div className="h-1 w-full bg-[hsl(var(--c2))]" />
            <div className="flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[hsl(var(--c2)/0.14)] font-display text-[17px] font-semibold tabular-nums text-[hsl(var(--c2-deep))]">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.number?.trim() && (
                    <span className="inline-flex items-center rounded-full bg-[hsl(var(--ink))] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--paper))]">
                      Q.{item.number}
                    </span>
                  )}
                  {item.title?.trim() && (
                    <h3
                      className="text-[15px] font-semibold leading-[1.45] text-[hsl(var(--ink))]"
                      style={{ wordBreak: 'keep-all' }}
                    >
                      {item.title}
                    </h3>
                  )}
                  {typeof item.points === 'number' && item.points > 0 && (
                    <span className="inline-flex items-center rounded-full border border-[hsl(var(--ink)/0.15)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[hsl(var(--ink-soft))]">
                      {item.points}점
                    </span>
                  )}
                </div>

                {item.reason?.trim() && (
                  <p
                    className="mt-2 text-[13.5px] leading-[1.75] text-[hsl(var(--ink-soft))] text-justify"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {item.reason}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default KillerTop5Section;
