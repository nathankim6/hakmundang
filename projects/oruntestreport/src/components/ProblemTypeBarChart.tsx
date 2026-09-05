
import { getCategoryAccent } from '@/utils/chartPalette';
import React, { useMemo } from 'react';
import { ChartPie } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateChartData } from "@/utils/chartDataUtils";
import ProblemTypeEmptyState from "./ProblemTypeEmptyState";
import ProblemTypeCard from "./ProblemTypeCard";
import ProblemList from "./ProblemList";
import SubcategoryBreakdown from "./SubcategoryBreakdown";
import type { BannerTheme } from "@/lib/logoColor";

type ProblemType = {
 id: string;
 name: string;
 category: string;
 questionType: 'objective' | 'subjective';
 difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
};

const romanRank = (n: number): string => {
 const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III' };
 return map[n] || String(n);
};

type ProblemTypeBarChartProps = {
 problemTypes: ProblemType[];
 themeColors: {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  light: string;
  vibrant: string;
  pastel: string;
  accent2: string;
  highlight: string;
 };
 showMainCategoriesOnly?: boolean;
 isHighSchool?: boolean;
 analysisType?: 'simple' | 'detailed';
 reportId?: string;
 banner?: BannerTheme;
};

const ProblemTypeBarChart: React.FC<ProblemTypeBarChartProps> = ({
 problemTypes,
 themeColors,
 showMainCategoriesOnly = false,
 isHighSchool = false,
 analysisType = 'detailed',
 reportId,
 banner,
}) => {
 const b = banner || {
   from: 'hsl(var(--ink))',
   mid: 'hsl(222 47% 16%)',
   to: 'hsl(var(--ink))',
   accent: 'hsl(var(--gold))',
 };
 // Calculate the chart data by main categories - different logic for middle vs high school
 const chartData = useMemo(() => {
 return calculateChartData(problemTypes, isHighSchool);
 }, [problemTypes, isHighSchool]);

 // Calculate subcategory data for detailed analysis
 const subcategoryData = useMemo(() => {
 const subcategoryCounts: { [key: string]: number } = {};
 problemTypes.forEach(problem => {
 subcategoryCounts[problem.name] = (subcategoryCounts[problem.name] || 0) + 1;
 });
 
 return Object.entries(subcategoryCounts).map(([name, count]) => ({
 name,
 value: count,
 percentage: ((count / problemTypes.length) * 100).toFixed(1)
 })).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
 }, [problemTypes]);

 // Get the total count of problems
 const totalProblems = problemTypes.length;
 
 if (problemTypes.length === 0) {
 return <ProblemTypeEmptyState />;
 }
 
 return (
 <Card className="bg-[hsl(var(--paper))] rounded-none overflow-hidden border border-[hsl(var(--ink)/0.08)] shadow-[0_1px_0_hsl(var(--ink)/0.04),0_30px_60px_-30px_hsl(var(--ink)/0.18)] relative">
 {/* 상단 헤더색 액센트 라인 */}
 <div
 className="absolute top-0 left-0 right-0 h-[3px]"
 style={{ background: `linear-gradient(90deg, ${b.from}, ${b.accent}, ${b.to})` }}
 />

 {/* 헤더색 테마 헤더 */}
  <CardHeader
  className="border-0 pb-3 pt-4 px-5 relative overflow-hidden"
  style={{
  background: `linear-gradient(135deg, ${b.from} 0%, ${b.mid} 50%, ${b.to} 100%)`,
  }}
  >
 {/* 미세 텍스처 — 도트 패턴 */}
 <div
 className="absolute inset-0 opacity-[0.06] pointer-events-none"
 style={{
 backgroundImage: `radial-gradient(circle at 1px 1px, ${b.accent} 1px, transparent 0)`,
 backgroundSize: '12px 12px',
 }}
 />
  <div className="flex items-end justify-between relative">
  <div className="flex items-center gap-3">
  {/* 헤더색 액자형 아이콘 */}
  <div className="relative">
  <div className="absolute inset-0 rounded-full" style={{
  background: `conic-gradient(from 220deg, ${b.from}, ${b.accent}, ${b.mid}, ${b.from})`,
  padding: '1.5px',
  }}>
  <div className="w-full h-full rounded-full" style={{ background: b.from }} />
  </div>
  <div className="relative w-9 h-9 rounded-full border flex items-center justify-center m-[1.5px]" style={{ background: b.from, borderColor: `${b.accent}66` }}>
  <ChartPie size={16} style={{ color: b.accent }} />
  </div>
  </div>
  <div className="flex flex-col gap-1">
  <span className="editorial-kicker tracking-[0.32em] text-[10px] font-bold uppercase" style={{ color: b.accent }}>
  유형 · 분포
  </span>
  <CardTitle className="font-display text-xl md:text-2xl font-semibold text-[hsl(var(--paper))] tracking-[-0.025em] leading-tight">
  문제 유형 <span className="font-medium" style={{ color: b.accent }}>분포</span>
  </CardTitle>
  </div>
  </div>

  {/* 우측 수치 */}
  <div className="text-right">
  <div className="editorial-kicker text-[10px] tracking-[0.32em] font-bold uppercase" style={{ color: b.accent }}>
  총 문항수
  </div>
  <div className="font-display text-[28px] leading-none text-[hsl(var(--paper))] font-bold tracking-[-0.03em] mt-0.5 tabular-nums">
  {totalProblems}<span className="text-[14px] ml-1 font-semibold not-italic" style={{ color: b.accent }}>문항</span>
  </div>
  </div>
  </div>

  {/* 헤더 하단 더블 라인 */}
  <div className="mt-3 space-y-1">
  <div className="h-[2px] w-16" style={{ background: b.accent }} />
  <div className="h-px w-full" style={{ background: `${b.accent}26` }} />
  </div>
 </CardHeader>

 <CardContent className="p-7 bg-[hsl(var(--paper))]">
 {/* 대분류별 통계 */}
 <div className="mb-8">
 <div className="flex items-baseline justify-between mb-3">
 <div className="flex items-center gap-3">
 <span className="font-display text-[hsl(var(--gold-deep))] text-sm">i.</span>
 <h4 className="editorial-kicker text-[hsl(var(--ink))] tracking-[0.28em]">대분류별 통계</h4>
 </div>
 <span className="editorial-kicker text-[hsl(var(--ink-soft)/0.6)] text-[10px] tracking-[0.28em]">대분류</span>
 </div>
 <div className="flex items-center gap-2 mb-5">
 <div className="h-px w-8 bg-[hsl(var(--gold))]" />
 <div className="h-px flex-1 bg-[hsl(var(--ink)/0.08)]" />
 </div>

  {/* 전체 구성 스택 바 + 범례 */}
  <div className="mb-5">
  <div className="flex h-4 w-full overflow-hidden rounded-full border border-[hsl(var(--ink)/0.08)]">
  {chartData.map((item, i) => (
  <div
  key={`stack-${i}`}
  title={`${item.name} · ${item.percentage}%`}
  style={{ width: `${item.percentage}%`, background: getCategoryAccent(i).bar }}
  />
  ))}
  </div>
  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
  {chartData.map((item, i) => (
  <div key={`legend-${i}`} className="flex items-center gap-1.5">
  <span className="h-2.5 w-2.5 rounded-full" style={{ background: getCategoryAccent(i).bar }} />
  <span className="text-[12px] font-semibold text-[hsl(var(--ink))]">{item.name}</span>
  <span className="text-[11px] font-medium tabular-nums text-[hsl(var(--ink-soft)/0.8)]">{item.percentage}%</span>
  </div>
  ))}
  </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
 {chartData.map((item, index) => (
 <div
 key={index}
 className="animate-fade-in"
 style={{
 animation: `fade-in-up 0.5s ease-out forwards ${0.1 + index * 0.1}s`,
 opacity: 0
 }}
 >
 <ProblemTypeCard
 item={item}
 index={index}
 themeColors={themeColors}
 />
 </div>
 ))}
 </div>
 </div>

 {/* 소분류별 통계 */}
 {analysisType === 'detailed' && (
 <div className="mb-8">
 <div className="flex items-baseline justify-between mb-3">
 <div className="flex items-center gap-3">
 <span className="font-display text-[hsl(var(--gold-deep))] text-sm">ii.</span>
 <h4 className="editorial-kicker text-[hsl(var(--ink))] tracking-[0.28em]">소분류별 통계</h4>
 </div>
 <span className="editorial-kicker text-[hsl(var(--ink-soft)/0.6)] text-[10px] tracking-[0.28em]">소분류</span>
 </div>
 <div className="flex items-center gap-2 mb-5">
 <div className="h-px w-8 bg-[hsl(var(--gold))]" />
 <div className="h-px flex-1 bg-[hsl(var(--ink)/0.08)]" />
 </div>

  <SubcategoryBreakdown data={subcategoryData} total={totalProblems} />
 </div>
 )}

 {/* 문항 목록 */}
 {analysisType === 'detailed' && (
 <div>
 <div className="flex items-baseline justify-between mb-3">
 <div className="flex items-center gap-3">
 <span className="font-display text-[hsl(var(--gold-deep))] text-sm">iii.</span>
 <h4 className="editorial-kicker text-[hsl(var(--ink))] tracking-[0.28em]">문항 목록</h4>
 </div>
 
 </div>
 <div className="flex items-center gap-2 mb-5">
 <div className="h-px w-8 bg-[hsl(var(--gold))]" />
 <div className="h-px flex-1 bg-[hsl(var(--ink)/0.08)]" />
 </div>

 <ProblemList
 problemTypes={problemTypes}
 themeColors={themeColors}
 reportId={reportId}
 />
 </div>
 )}
 </CardContent>
 </Card>
 );
};

export default ProblemTypeBarChart;
