import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface QuestionTypePieChartProps {
 objectivePercentage: number;
 subjectivePercentage: number;
 themeColors?: any; // deprecated
}

// 에디토리얼 팔레트 — 테마 토큰 기반 (ink=객관식, gold=서답형)
// 모든 테마(고등부/중1/중2/중3)에서 자동으로 학년 컬러 적용
const COLOR_OBJ = "hsl(var(--c1-deep))";
const COLOR_OBJ_MID = "hsl(var(--c1))";
const COLOR_OBJ_LIGHT = "hsl(var(--c1) / 0.75)";
const COLOR_SUBJ = "hsl(var(--c4-deep))";
const COLOR_SUBJ_MID = "hsl(var(--c4))";
const COLOR_SUBJ_LIGHT = "hsl(var(--c4) / 0.75)";

const QuestionTypePieChart: React.FC<QuestionTypePieChartProps> = ({
 objectivePercentage,
 subjectivePercentage,
}) => {
 const total = objectivePercentage + subjectivePercentage;
 let objPercentage = Math.round((objectivePercentage / total) * 100);
 let subjPercentage = Math.round((subjectivePercentage / total) * 100);

 if (objPercentage + subjPercentage > 100) {
 if (objPercentage > subjPercentage) objPercentage = 100 - subjPercentage;
 else subjPercentage = 100 - objPercentage;
 } else if (objPercentage + subjPercentage < 100) {
 if (objPercentage > subjPercentage)
 objPercentage += 100 - (objPercentage + subjPercentage);
 else subjPercentage += 100 - (objPercentage + subjPercentage);
 }

 const data = [
 {
 name: "객관식",
 value: objPercentage,
 color: COLOR_OBJ,
 mid: COLOR_OBJ_MID,
 light: COLOR_OBJ_LIGHT,
 },
 {
 name: "서답형",
 value: subjPercentage,
 color: COLOR_SUBJ,
 mid: COLOR_SUBJ_MID,
 light: COLOR_SUBJ_LIGHT,
 },
 ];

 const CustomTooltip = ({ active, payload }: any) => {
 if (active && payload && payload.length) {
 const d = payload[0].payload;
 return (
 <div className="chart-tooltip" style={{ borderTopColor: d.color }}>
 <div className="flex items-center gap-1.5">
 <span
 className="inline-block w-1 h-1 rotate-45"
 style={{ background: d.color }}
 />
 <p className="chart-tooltip-label" style={{ color: d.color }}>
 {d.name}
 </p>
 </div>
 <p className="chart-tooltip-value mt-1" style={{ color: d.color }}>
 {d.value}
 <span className="text-[11px] ml-0.5 font-light text-[hsl(var(--ink-soft))]">%</span>
 </p>
 </div>
 );
 }
 return null;
 };

 return (
 <div className="h-full w-full flex flex-col items-center justify-center relative">
 <div className="relative w-full flex-1 min-h-[240px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <defs>
 {data.map((d, i) => (
 <g key={i}>
 <linearGradient id={`pieGrad${i}`} x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor={d.light} stopOpacity={1} />
 <stop offset="55%" stopColor={d.mid} stopOpacity={1} />
 <stop offset="100%" stopColor={d.color} stopOpacity={1} />
 </linearGradient>
 {/* 광택 하이라이트 오버레이 */}
 <radialGradient id={`pieSheen${i}`} cx="50%" cy="0%" r="80%">
 <stop offset="0%" stopColor="hsl(40 80% 98%)" stopOpacity={0.28} />
 <stop offset="60%" stopColor="hsl(40 80% 98%)" stopOpacity={0} />
 </radialGradient>
 </g>
 ))}
 <filter id="pieShadow" x="-30%" y="-30%" width="160%" height="160%">
 <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="hsl(var(--ink))" floodOpacity="0.22" />
 </filter>
 <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
 <feGaussianBlur stdDeviation="2" result="blur" />
 <feMerge>
 <feMergeNode in="blur" />
 <feMergeNode in="SourceGraphic" />
 </feMerge>
 </filter>
 </defs>

 {/* 메인 도넛 */}
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 labelLine={false}
 outerRadius={104}
 innerRadius={74}
 dataKey="value"
 animationDuration={1600}
 animationEasing="ease-out"
 paddingAngle={2}
 stroke="hsl(var(--paper))"
 strokeWidth={3}
 cornerRadius={3}
 >
 {data.map((_, i) => (
 <Cell key={i} fill={`url(#pieGrad${i})`} />
 ))}
 </Pie>

 {/* 광택 오버레이 */}
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 labelLine={false}
 outerRadius={104}
 innerRadius={74}
 dataKey="value"
 stroke="none"
 paddingAngle={2}
 cornerRadius={3}
 isAnimationActive={false}
 >
 {data.map((_, i) => (
 <Cell key={i} fill={`url(#pieSheen${i})`} />
 ))}
 </Pie>

 <Tooltip content={<CustomTooltip />} />
 </PieChart>
 </ResponsiveContainer>

 {/* 중앙 모노그램 */}
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <div
 className="flex flex-col items-center justify-center rounded-full bg-[hsl(var(--paper))]"
 style={{ width: "128px", height: "128px" }}
 >
 <span className="editorial-kicker text-[8.5px] tracking-[0.3em] mb-1.5" style={{ color: "hsl(var(--ink-soft))" }}>
            전체 구성
 </span>
 <span className="metric-num text-[32px] text-[hsl(var(--ink))]">
 100
 <span className="text-[15px] ml-0.5 text-[hsl(var(--ink-soft))]">%</span>
 </span>
 </div>
 </div>
 </div>

 {/* 범례 — 링 밖에서 수치 표기 (겹침 방지) */}
 <div className="mt-3 w-full grid grid-cols-2 gap-2">
 {data.map((d) => (
 <div
 key={d.name}
 className="flex items-center justify-between gap-2 rounded-lg px-3 py-2"
 style={{ background: `${d.color.replace("))", ") / 0.07)")}`, border: `1px solid ${d.color.replace("))", ") / 0.2)")}` }}
 >
 <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[hsl(var(--ink))] whitespace-nowrap">
 <span className="w-2 h-2 rounded-sm" style={{ background: d.color }} />
 {d.name}
 </span>
 <span className="metric-num text-[17px]" style={{ color: d.color }}>
 {d.value}
 <span className="text-[10px] ml-0.5">%</span>
 </span>
 </div>
 ))}
 </div>
 </div>
 );
};

export default QuestionTypePieChart;
