import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { PassageVariant } from '@/integrations/supabase/reportService';

interface PassageVariantSectionProps {
  items: PassageVariant[];
}

/** 리포트 — 원문 대조 · 지문 변형 분석 */
const PassageVariantSection: React.FC<PassageVariantSectionProps> = ({ items }) => {
  const list = (items || []).filter((v) => v && (v.originalText || v.examText || v.changeDetail));
  if (list.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="editorial-kicker text-[10px] tracking-[0.35em] font-bold text-[#16233A] pdf-capture-nowrap">
          PASSAGE VARIANTS
        </span>
        <span className="h-px flex-1 bg-slate-900/10" />
      </div>
      <h3 className="font-display text-[20px] md:text-[23px] font-medium text-slate-900 leading-tight pdf-capture-nowrap">
        원문 대조 · 지문 변형 분석
      </h3>
      <p className="mt-1.5 text-[12.5px] text-slate-500 break-keep">
        시험 범위 원문과 실제 출제 문장을 문장 단위로 대조해, 변형된 지점과 그 함정을 정리했습니다.
      </p>

      <div className="mt-5 space-y-4">
        {list.map((v, idx) => (
          <article key={idx} className="rounded-xl border border-slate-900/12 bg-white overflow-hidden">
            <header className="flex flex-wrap items-center gap-2 border-b border-slate-900/10 bg-slate-50/80 px-4 py-2.5">
              {v.number && (
                <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-[#16233A] text-white text-[12px] font-bold tabular-nums pdf-capture-nowrap">
                  {v.number}
                </span>
              )}
              {v.variantType && (
                <span className="inline-flex items-center rounded-full bg-[#F5C64F] px-2.5 py-0.5 text-[11px] font-bold text-[#16233A] pdf-capture-nowrap">
                  {v.variantType}
                </span>
              )}
              {v.source && (
                <span className="text-[11.5px] text-slate-500 truncate pdf-capture-nowrap">{v.source}</span>
              )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-3 px-4 py-4">
              <div className="rounded-lg border border-slate-900/10 bg-slate-50/60 p-3">
                <p className="editorial-kicker text-[9.5px] tracking-[0.3em] font-bold text-slate-500 mb-1.5 pdf-capture-nowrap">
                  ORIGINAL · 원문
                </p>
                <p className="text-[12.5px] leading-6 text-slate-700 break-keep">{v.originalText}</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-[#16233A]/40" />
              </div>
              <div className="rounded-lg border border-[#F5C64F]/50 bg-[#F5C64F]/10 p-3">
                <p className="editorial-kicker text-[9.5px] tracking-[0.3em] font-bold text-[#16233A] mb-1.5 pdf-capture-nowrap">
                  EXAM · 출제 문장
                </p>
                <p className="text-[12.5px] leading-6 text-slate-900 break-keep">{v.examText}</p>
              </div>
            </div>

            {(v.changeDetail || v.impact) && (
              <div className="border-t border-slate-900/10 px-4 py-3 space-y-1.5">
                {v.changeDetail && (
                  <p className="text-[12.5px] leading-6 text-slate-700 break-keep">
                    <strong className="text-slate-900">변형 내용 </strong>
                    {v.changeDetail}
                  </p>
                )}
                {v.impact && (
                  <p className="text-[12.5px] leading-6 text-slate-600 break-keep">
                    <strong className="text-slate-900">학습 포인트 </strong>
                    {v.impact}
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default PassageVariantSection;
