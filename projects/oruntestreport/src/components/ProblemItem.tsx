import React from 'react';
import { formatCategoryLabel } from '@/utils/problemTypeUtils';

type ProblemItemProps = {
 problem: {
 id: string;
 name: string;
 category: string;
 questionType: 'objective' | 'subjective';
 difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
 isVariant?: boolean;
 points?: number;
 isKiller?: boolean;
 answer?: string;
 insight?: string;
 };

 index: number;
 themeColors?: any; // deprecated — kept for backward compatibility
};

const difficultyMeta: Record<
  ProblemItemProps['problem']['difficulty'],
  { label: string; dot: string; bar: string; text: string }
> = {
  easy: {
    label: '쉬움',
    dot: 'hsl(160 60% 42%)',
    bar: 'hsl(160 60% 42%)',
    text: 'hsl(160 60% 28%)',
  },
  medium: {
    label: '보통',
    dot: 'hsl(var(--ink-soft))',
    bar: 'hsl(var(--ink)/0.35)',
    text: 'hsl(var(--ink))',
  },
  hard: {
    label: '어려움',
    dot: 'hsl(30 85% 46%)',
    bar: 'hsl(30 85% 50%)',
    text: 'hsl(30 85% 42%)',
  },
  very_hard: {
    label: '매우 어려움',
    dot: 'hsl(0 65% 48%)',
    bar: 'hsl(0 65% 48%)',
    text: 'hsl(0 65% 38%)',
  },
};

const Tag: React.FC<{ color: string; label: string; title?: string }> = ({ color, label, title }) => (
  <span
    title={title}
    className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-semibold tracking-[0.02em] whitespace-nowrap"
    style={{ color, background: `${color}14`, boxShadow: `inset 0 0 0 1px ${color}33` }}
  >
    <span className="h-[4px] w-[4px] rounded-full" style={{ background: color }} />
    {label}
  </span>
);

const ProblemItem: React.FC<ProblemItemProps> = ({ problem, index }) => {
  const meta = difficultyMeta[problem.difficulty];
  const isSubjective = problem.questionType === 'subjective';
  const isKiller = problem.difficulty === 'very_hard' || !!problem.isKiller;
  const isHard = problem.difficulty === 'hard';
  const isVariant = !!problem.isVariant;
  const killerColor = 'hsl(0 70% 45%)';
  const hardColor = 'hsl(30 80% 44%)';
  const variantColor = 'hsl(265 50% 48%)';

  const difficultyLevel: Record<ProblemItemProps['problem']['difficulty'], number> = {
    easy: 1,
    medium: 2,
    hard: 3,
    very_hard: 4,
  };
  const level = difficultyLevel[problem.difficulty];

  return (
    <div className="group relative grid grid-cols-12 items-center gap-x-3 gap-y-0.5 px-3 py-1.5 transition-colors duration-200 hover:bg-[hsl(var(--paper-warm)/0.5)]">
      {/* 좌측 난이도 인디케이터 */}
      <span
        className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: meta.bar }}
      />

      {/* No. */}
      <div className="col-span-2 flex items-center gap-2 md:col-span-1">
        <span
          className="inline-flex h-[22px] min-w-[26px] items-center justify-center rounded-[6px] px-1 text-[12px] font-bold tabular-nums tracking-[-0.02em]"
          style={{
            color: 'hsl(var(--ink))',
            background: 'hsl(var(--ink)/0.05)',
            boxShadow: 'inset 0 0 0 1px hsl(var(--ink)/0.08)',
          }}
          aria-label={`문항 번호 ${index + 1}`}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Type */}
      <div className="col-span-4 flex flex-nowrap items-center gap-1 md:col-span-2">
        <span
          className={`text-[10.5px] font-semibold whitespace-nowrap ${
            isSubjective ? 'text-[hsl(var(--gold-deep))]' : 'text-[hsl(var(--ink-soft))]'
          }`}
        >
          {isSubjective ? '서답형' : '객관식'}
        </span>
        {typeof problem.points === 'number' && problem.points > 0 && (
          <span className="rounded-full bg-[hsl(var(--ink)/0.05)] px-1.5 text-[9.5px] font-medium tabular-nums text-[hsl(var(--ink-soft))]">
            {problem.points}점
          </span>
        )}
      </div>

      {/* Category */}
      <div className="col-span-6 flex min-w-0 items-center md:col-span-3">
        <span className="truncate text-[13px] font-semibold tracking-[-0.015em] text-[hsl(var(--ink))]">
          {formatCategoryLabel(problem.category)}
        </span>
      </div>

      {/* Sub-type */}
      <div className="col-span-7 flex min-w-0 flex-nowrap items-center gap-1 md:col-span-4">
        <span
          className="whitespace-nowrap text-[12.5px] font-semibold"
          style={{
            color: isKiller
              ? killerColor
              : isHard
              ? hardColor
              : 'hsl(var(--ink-soft))',
          }}
        >
          {problem.name}
        </span>
        {isKiller && <Tag color={killerColor} label="KILLER" title="킬러 문항" />}
        {isHard && <Tag color={hardColor} label="HARD" title="어려운 문항" />}
        {isVariant && <Tag color={variantColor} label="원문변형" title="원문 변형 문항" />}
      </div>

      {/* Difficulty */}
      <div className="col-span-5 flex items-center justify-end gap-1.5 md:col-span-2">
        <span className="inline-flex items-end gap-[2px]">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="inline-block w-[3px] rounded-full"
              style={{
                height: `${3 + i * 1.6}px`,
                background: i <= level ? meta.bar : 'hsl(var(--ink)/0.1)',
              }}
            />
          ))}
        </span>
        <span
          className="whitespace-nowrap text-[10.5px] font-semibold"
          style={{ color: meta.text }}
        >
          {meta.label}
        </span>
      </div>

      {/* 정답 · 출제 포인트 */}
      {(problem.answer?.trim() || problem.insight?.trim()) && (
        <div className="col-span-12 mt-0.5 flex flex-wrap items-start gap-x-2 gap-y-1 border-t border-[hsl(var(--ink)/0.06)] pt-1">
          {problem.answer?.trim() && (
            <span
              className="flex-shrink-0 inline-flex items-center gap-1 rounded-[5px] px-1.5 py-[1px] text-[10.5px] font-bold"
              style={{
                color: 'hsl(var(--gold-deep))',
                background: 'hsl(var(--gold)/0.12)',
                boxShadow: 'inset 0 0 0 1px hsl(var(--gold)/0.28)',
              }}
            >
              정답 {problem.answer.trim()}
            </span>
          )}
          {problem.insight?.trim() && (
            <p
              className="min-w-0 flex-1 text-[11.5px] leading-[1.55] text-[hsl(var(--ink-soft))]"
              style={{ wordBreak: 'keep-all' }}
            >
              {problem.insight.trim()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};


export default ProblemItem;
