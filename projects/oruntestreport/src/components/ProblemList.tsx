import React, { useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import ProblemItem from './ProblemItem';
import ProblemCommentBox from './ProblemCommentBox';
import { useProblemComments } from '@/hooks/useProblemComments';

type ProblemType = {
 id: string;
 name: string;
 category: string;
 questionType: 'objective' | 'subjective';
 difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
 isVariant?: boolean;
 points?: number;
 isKiller?: boolean;
};

type ProblemListProps = {
 problemTypes: ProblemType[];
 themeColors?: any; // deprecated — kept for backward compatibility
 reportId?: string;
};

const legendItems: { label: string; key: ProblemType['difficulty']; color: string }[] = [
 { label: '쉬움', key: 'easy', color: 'hsl(160 60% 42%)' },
 { label: '보통', key: 'medium', color: 'hsl(var(--ink)/0.4)' },
 { label: '어려움', key: 'hard', color: 'hsl(var(--gold))' },
 { label: '매우 어려움', key: 'very_hard', color: 'hsl(0 65% 48%)' },
];

const ProblemList: React.FC<ProblemListProps> = ({ problemTypes, reportId }) => {
 const total = problemTypes?.length || 0;
 const { comments, upsert, addPhoto, removePhoto } = useProblemComments(reportId);

 const counts = useMemo(() => {
 const c: Record<ProblemType['difficulty'], number> = {
 easy: 0, medium: 0, hard: 0, very_hard: 0,
 };
 problemTypes?.forEach((p) => { c[p.difficulty] = (c[p.difficulty] || 0) + 1; });
 return c;
 }, [problemTypes]);

 const objectiveCount = useMemo(
 () => problemTypes?.filter((p) => p.questionType === 'objective').length || 0,
 [problemTypes]
 );
 const subjectiveCount = total - objectiveCount;

  const variantCount = useMemo(
    () => problemTypes?.filter((p) => p.isVariant).length || 0,
    [problemTypes]
  );
  const killerCount = useMemo(
    () => problemTypes?.filter((p) => p.difficulty === 'very_hard').length || 0,
    [problemTypes]
  );

  const statTiles = [
    { label: '전체 문항', value: total, color: 'hsl(var(--ink))' },
    { label: '객관식', value: objectiveCount, color: 'hsl(var(--ink-soft))' },
    { label: '서답형', value: subjectiveCount, color: 'hsl(var(--gold-deep))' },
    { label: '킬러문항', value: killerCount, color: 'hsl(0 70% 45%)' },
    { label: '원문변형', value: variantCount, color: 'hsl(265 50% 48%)' },
  ];

  return (
 <div className="relative">
 {/* 요약 대시보드 */}
 <div className="mb-3 overflow-hidden rounded-xl border border-[hsl(var(--ink)/0.08)] bg-[hsl(var(--paper))]">
   {/* 지표 타일 */}
   <div className="grid grid-cols-5 divide-x divide-[hsl(var(--ink)/0.07)]">
     {statTiles.map((t) => (
       <div key={t.label} className="flex items-baseline justify-center gap-1.5 px-2 py-2">
         <span className="text-[10.5px] font-medium tracking-[0.02em] text-[hsl(var(--ink-soft)/0.85)] whitespace-nowrap">
           {t.label}
         </span>
         <span
           className="text-[16px] font-bold leading-none tabular-nums tracking-[-0.03em]"
           style={{ color: t.color }}
         >
           {t.value}
         </span>
       </div>
     ))}
   </div>

   {/* 난이도 분포 */}
   <div className="flex flex-nowrap items-center gap-3 border-t border-[hsl(var(--ink)/0.07)] bg-[hsl(var(--paper-warm)/0.45)] px-3 py-2">
     <div className="flex h-2 min-w-[120px] flex-1 gap-[2px] overflow-hidden rounded-full">
       {legendItems.map((item) => {
         const pct = total ? (counts[item.key] / total) * 100 : 0;
         if (pct === 0) return null;
         return (
           <div
             key={item.key}
             className="h-full rounded-full"
             style={{ width: `${pct}%`, background: item.color }}
             title={`${item.label} ${counts[item.key]}문항`}
           />
         );
       })}
     </div>
     <div className="flex flex-nowrap items-center gap-x-3">
       {legendItems.map((item) => (
         <div key={item.label} className="flex items-center gap-1 whitespace-nowrap">
           <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
           <span className="text-[10.5px] font-semibold text-[hsl(var(--ink))]">{item.label}</span>
           <span className="text-[10px] font-medium tabular-nums text-[hsl(var(--ink-soft)/0.75)]">
             {counts[item.key]} · {total ? Math.round((counts[item.key] / total) * 100) : 0}%
           </span>
         </div>
       ))}
     </div>
   </div>
 </div>

 {/* 컬럼 헤더 */}
 <div className="hidden md:grid grid-cols-12 gap-3 rounded-t-lg border-b border-[hsl(var(--ink)/0.1)] bg-[hsl(var(--ink)/0.03)] px-3 py-1.5">
   {[
     { label: '번호', span: 'col-span-1' },
     { label: '유형', span: 'col-span-2' },
     { label: '분류', span: 'col-span-3' },
     { label: '세부유형', span: 'col-span-4' },
     { label: '난이도', span: 'col-span-2 text-right' },
   ].map((h) => (
     <div
       key={h.label}
       className={`${h.span} text-[9.5px] font-semibold tracking-[0.1em] text-[hsl(var(--ink-soft)/0.75)] whitespace-nowrap`}
     >
       {h.label}
     </div>
   ))}
 </div>

 <div>
 <div className="divide-y divide-[hsl(var(--ink)/0.07)]">
 {problemTypes && problemTypes.length > 0 ? (
 problemTypes.map((problem, index) => (
 <div key={problem.id} className="group/row relative">
 <ProblemItem problem={problem} index={index} />
 {reportId && (
 <ProblemCommentBox
 problemId={problem.id}
 comment={comments[problem.id]}
 onSave={(pid, text) => upsert(pid, { comment: text })}
 onAddPhoto={addPhoto}
 onRemovePhoto={removePhoto}
 />
 )}
 </div>
 ))
 ) : (
 <div className="text-center text-[hsl(var(--ink-soft))] py-10 font-display">
 등록된 문항이 없습니다.
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default ProblemList;
