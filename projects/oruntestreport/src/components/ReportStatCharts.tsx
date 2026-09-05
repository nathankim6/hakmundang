import React from 'react';
import { Card } from "@/components/ui/card";
import QuestionTypePieChart from "@/components/QuestionTypePieChart";
import ProblemTypeBarChart from "@/components/ProblemTypeBarChart";
import DifficultyBarChart from "@/components/DifficultyBarChart";
import type { BannerTheme } from "@/lib/logoColor";

interface ReportStatChartsProps {
  stats: {
    objectivePercentage: number;
    subjectivePercentage: number;
    problemTypes: Array<{
      id: string;
      name: string;
      category: string;
      questionType: 'objective' | 'subjective';
      difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
      isVariant?: boolean;
      points?: number;
      isKiller?: boolean;
    }>;
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
      very_hard: number;
    };
  };
  themeColors: any;
  analysisType?: 'simple' | 'detailed';
  reportId?: string;
  banner?: BannerTheme;
}

const SectionHeader: React.FC<{
  numeral: string;
  kicker: string;
  title: string;
  tone?: string;
}> = ({ numeral, kicker, title, tone = '--c1' }) => (
  <div className="mb-6">
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--paper-warm))] shadow-[0_1px_2px_-1px_hsl(var(--ink)/0.05)]"
    >
      <span
        className="section-numeral shrink-0"
        style={{ ['--sec' as any]: `var(${tone})` }}
      >
        {numeral}
      </span>
      <div className="flex flex-col">
        <span
          className="editorial-kicker tracking-[0.28em] text-[9.5px] leading-none"
          style={{ color: `hsl(var(${tone}-deep))` }}
        >
          {kicker}
        </span>
        <h2 className="font-display font-semibold text-[hsl(var(--ink))] text-base md:text-lg leading-tight mt-0.5">
          {title}
        </h2>
      </div>
    </div>
  </div>
);

const ReportStatCharts: React.FC<ReportStatChartsProps> = ({
  stats,
  themeColors,
  analysisType = 'detailed',
  reportId,
  banner,
}) => {
  const isHighSchool = stats.problemTypes.some(
    (p) =>
      p.category === '부교재(모의고사)' ||
      p.category === '단어장' ||
      p.category === '교과서' ||
      p.category === '핸드아웃' ||
      p.category === '부교재' ||
      p.category === '모의고사' ||
      p.category === '워크북'
  );

  return (
    <>
      <section className="report-section">
        <SectionHeader
          numeral="I"
        kicker="구성 비율"
          title="객관식 · 서답형 비율과 난이도"
          tone="--c2"
        />

        <div className="bento-grid text-left bg-[hsl(var(--paper-warm))] border border-[hsl(var(--border))] rounded-3xl p-4 md:p-5 shadow-[0_2px_12px_-6px_hsl(var(--ink)/0.04)]">
          {/* 객/서 비율 */}
          <Card className="md:col-span-3 bento-tile border-0 shadow-none">
            <div className="flex items-baseline justify-between mb-5 pl-2">
              <div className="flex items-center gap-2">
                <span className="editorial-kicker tracking-[0.32em] text-[11px] font-bold" style={{ color: 'hsl(var(--c1-deep))' }}>
                  문항 유형
                </span>
                <div className="h-px w-8" style={{ background: 'hsl(var(--c1) / 0.4)' }} />
              </div>
              <span className="font-display text-[hsl(var(--ink))] text-base font-semibold">
                객관식 · 서답형
              </span>
            </div>

            <div className="flex flex-col items-center gap-4 pl-2">
              <div className="w-full h-[368px] print:h-[200px]">
                <QuestionTypePieChart
                  objectivePercentage={stats.objectivePercentage}
                  subjectivePercentage={stats.subjectivePercentage}
                  themeColors={themeColors}
                />
              </div>
            </div>
          </Card>

          {/* 난이도 */}
          <Card className="md:col-span-3 bento-tile border-0 shadow-none">
            <div className="flex items-baseline justify-between mb-5 pr-2">
              <span className="font-display text-[hsl(var(--ink))] text-base font-semibold">
                난이도 분포
              </span>
              <div className="flex items-center gap-2">
                <div className="h-px w-8" style={{ background: 'hsl(var(--c4) / 0.4)' }} />
                <span className="editorial-kicker tracking-[0.32em] text-[11px] font-bold" style={{ color: 'hsl(var(--c4-deep))' }}>
                  난이도
                </span>
              </div>
            </div>
            <div className="h-[368px] pr-2">
              <DifficultyBarChart
                difficulty={stats.difficulty}
                themeColors={themeColors}
              />
            </div>
          </Card>
        </div>
      </section>

      <section className="report-section">
        <SectionHeader
          numeral="III"
        kicker="유형별 분석"
          title="출제 유형 분석"
          tone="--c3"
        />

        <Card className="bento-tile bg-[hsl(var(--paper-warm))] border border-[hsl(var(--border))] p-5 rounded-2xl text-left shadow-[0_1px_2px_-1px_hsl(var(--ink)/0.05)]">
          <ProblemTypeBarChart
            problemTypes={stats.problemTypes}
            themeColors={themeColors}
            showMainCategoriesOnly={false}
            isHighSchool={isHighSchool}
            analysisType={analysisType}
            reportId={reportId}
            banner={banner}
          />
        </Card>
      </section>
    </>
  );
};

export default ReportStatCharts;
