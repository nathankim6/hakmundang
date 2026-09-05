import React from "react";
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Cell,
 LabelList,
} from "recharts";

interface DifficultyBarChartProps {
 difficulty: {
 easy: number;
 medium: number;
 hard: number;
 very_hard: number;
 };
 themeColors?: any; // deprecated
}

// 에디토리얼 난이도 팔레트 — 점진적으로 강해지는 톤
const DIFFICULTY_COLORS = [
 { name: "쉬움", color: "hsl(var(--diff-easy))", light: "hsl(var(--diff-easy) / 0.65)", soft: "hsl(var(--diff-easy-soft))" },
 { name: "보통", color: "hsl(var(--diff-mid))", light: "hsl(var(--diff-mid) / 0.65)", soft: "hsl(var(--diff-mid-soft))" },
 { name: "어려움", color: "hsl(var(--diff-hard))", light: "hsl(var(--diff-hard) / 0.65)", soft: "hsl(var(--diff-hard-soft))" },
 { name: "매우 어려움", color: "hsl(var(--diff-xhard))", light: "hsl(var(--diff-xhard) / 0.65)", soft: "hsl(var(--diff-xhard-soft))" },
];

const DifficultyBarChart: React.FC<DifficultyBarChartProps> = ({ difficulty }) => {
 const normalizedDifficulty = (() => {
 const { easy, medium, hard, very_hard } = difficulty;
 const total = easy + medium + hard + very_hard;
 if (total === 0) return { easy: 25, medium: 25, hard: 25, very_hard: 25 };

 const easyRaw = (easy / total) * 100;
 const mediumRaw = (medium / total) * 100;
 const hardRaw = (hard / total) * 100;
 const veryHardRaw = (very_hard / total) * 100;

 let easyPerc = Math.floor(easyRaw);
 let mediumPerc = Math.floor(mediumRaw);
 let hardPerc = Math.floor(hardRaw);
 let veryHardPerc = Math.floor(veryHardRaw);

 const pointsToDistribute = 100 - (easyPerc + mediumPerc + hardPerc + veryHardPerc);
 const fractions = [
 { key: "easy", value: easyRaw - easyPerc },
 { key: "medium", value: mediumRaw - mediumPerc },
 { key: "hard", value: hardRaw - hardPerc },
 { key: "very_hard", value: veryHardRaw - veryHardPerc },
 ].sort((a, b) => b.value - a.value);

 for (let i = 0; i < pointsToDistribute; i++) {
 const item = fractions[i % fractions.length];
 if (item.key === "easy") easyPerc += 1;
 else if (item.key === "medium") mediumPerc += 1;
 else if (item.key === "hard") hardPerc += 1;
 else veryHardPerc += 1;
 }

 return { easy: easyPerc, medium: mediumPerc, hard: hardPerc, very_hard: veryHardPerc };
 })();

 const data = [
 { ...DIFFICULTY_COLORS[0], value: normalizedDifficulty.easy },
 { ...DIFFICULTY_COLORS[1], value: normalizedDifficulty.medium },
 { ...DIFFICULTY_COLORS[2], value: normalizedDifficulty.hard },
 { ...DIFFICULTY_COLORS[3], value: normalizedDifficulty.very_hard },
 ];

 const CustomTooltip = ({ active, payload }: any) => {
 if (active && payload && payload.length) {
 const d = payload[0].payload;
 return (
 <div className="chart-tooltip" style={{ borderTopColor: d.color }}>
 <p className="chart-tooltip-label" style={{ color: d.color }}>
 {d.name}
 </p>
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
 <div className="w-full h-full min-h-[320px] flex flex-col gap-3">
 <div className="flex-1 min-h-[240px] h-[240px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={data}
 margin={{ top: 28, right: 12, left: 4, bottom: 8 }}
 barSize={28}
 barGap={4}
 >
 <defs>
 {data.map((entry, index) => (
 <linearGradient
 key={`gradient-${index}`}
 id={`diffBar${index}`}
 x1="0"
 y1="0"
 x2="0"
 y2="1"
 >
 <stop offset="0%" stopColor={entry.light} stopOpacity={1} />
 <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
 </linearGradient>
 ))}
 </defs>
 <CartesianGrid
 strokeDasharray="2 4"
 vertical={false}
 stroke="hsl(var(--ink) / 0.08)"
 />
 <XAxis
 dataKey="name"
 tick={{
 fontSize: 9,
 fontWeight: 500,
 fill: "hsl(var(--ink-soft))",
 letterSpacing: "0.05em",
 }}
 tickLine={false}
 axisLine={{ stroke: "hsl(var(--ink) / 0.12)", strokeWidth: 1 }}
 />
 <YAxis
 unit="%"
 domain={[0, 100]}
 tick={{ fontSize: 9, fill: "hsl(var(--ink-soft))" }}
 width={28}
 axisLine={false}
 tickLine={false}
 />
 <Tooltip
 content={<CustomTooltip />}
 cursor={{ fill: "hsl(var(--ink) / 0.04)" }}
 />
 <Bar
 dataKey="value"
 name="비율"
 radius={[2, 2, 0, 0]}
 animationDuration={1200}
 animationEasing="ease-out"
 >
 {data.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={`url(#diffBar${index})`} />
 ))}
 <LabelList
 dataKey="value"
 position="top"
 formatter={(value: number) => `${value}%`}
 style={{
 fontSize: 11,
 fontFamily: "'Noto Sans', 'Noto Sans KR', sans-serif",
 fontWeight: 700,
 letterSpacing: "-0.02em",
 fill: "hsl(var(--ink))",
 }}
 />
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>

 {/* 하단 컬러 칩 */}
 <div className="grid grid-cols-4 gap-1.5">
 {data.map((entry) => (
 <div
 key={entry.name}
 className="flex flex-col items-center gap-1.5 px-1 py-2.5 border rounded-lg"
 style={{
 background: `linear-gradient(180deg, ${entry.soft} 0%, hsl(var(--paper)) 100%)`,
 borderColor: entry.color.replace('))', ') / 0.35)'),
 }}
 >
 <div className="flex items-center gap-1">
 <span
 className="text-[10.5px] font-semibold tracking-[0.04em] whitespace-nowrap"
 style={{ color: entry.color }}
 >
 {entry.name}
 </span>
 </div>
 <span
 className="metric-num text-[20px]"
 style={{ color: entry.color }}
 >
 {entry.value}
 <span className="text-[11px] font-semibold ml-0.5">%</span>
 </span>
 </div>
 ))}
 </div>
 </div>
 );
};

export default DifficultyBarChart;
