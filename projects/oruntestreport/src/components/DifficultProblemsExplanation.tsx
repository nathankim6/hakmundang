import React from 'react';
import SectionOrnament from './SectionOrnament';

interface DifficultProblemsExplanationProps {
  explanation?: string;
  hasDifficultProblems: boolean;
  themeColors: any;
}

const DifficultProblemsExplanation: React.FC<DifficultProblemsExplanationProps> = ({
  explanation,
  hasDifficultProblems,
}) => {
  if (!hasDifficultProblems || !explanation) return null;

  return (
    <section className="report-section">
      <div className="flex items-baseline justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="section-numeral section-numeral-c4">IV</span>
          <div>
            <span className="editorial-kicker block" style={{ color: 'hsl(var(--c4-deep))' }}>Spotlight</span>
            <h2 className="font-display text-2xl md:text-3xl text-[hsl(var(--ink))] tracking-[-0.025em] font-medium leading-tight">
              시험 특징 &amp; 킬러 문항
            </h2>
          </div>
        </div>
      </div>

      <div className="editorial-card relative !p-0 overflow-hidden">
        {/* 좌측 골드 룰 */}
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{
            background:
              'linear-gradient(to bottom, hsl(var(--gold)), hsl(var(--gold)/0.25))',
          }}
        />
        <div className="pattern-overlay pattern-deco-gold opacity-25" />

        <div className="relative px-5 py-4 md:px-8 md:py-6 bg-[hsl(var(--paper-warm))]">
          <div className="mb-3 flex items-center gap-2.5">
            <SectionOrnament
              variant={0}
              className="pointer-events-none h-4 w-4 flex-shrink-0 text-[hsl(var(--gold))]"
            />
            <span className="editorial-kicker text-[10px] tracking-[0.28em] text-[hsl(var(--gold-deep))] whitespace-nowrap">
              Analysis Summary
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-[hsl(var(--gold)/0.45)] to-transparent" />
          </div>

          <p
            className="text-[14.5px] md:text-[16px] text-[hsl(var(--ink))] leading-[1.85] tracking-[-0.008em] whitespace-pre-wrap text-justify"
            style={{ wordBreak: 'keep-all' }}
          >
            {explanation}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DifficultProblemsExplanation;
