import React from 'react';
import { User } from 'lucide-react';
import teacherIcon from '@/assets/teacher-icon.png';
import AutoResizeText from '@/components/AutoResizeText';
import type { BannerTheme } from '@/lib/logoColor';

interface CategoryEvaluation {
  category: string;
  evaluation: string;
}

interface TeacherCommentProps {
  teacherPhoto?: string;
  teacher: string;
  overallEvaluation?: string;
  themeColors: any;
  isHighSchool?: boolean;
  banner?: BannerTheme;
}

const TeacherComment: React.FC<TeacherCommentProps> = ({
  teacherPhoto,
  teacher,
  overallEvaluation,
  isHighSchool = false,
  banner,
}) => {
  const ORDER = ['수준별 학습 전략', '종합의견'];

  let evaluationCategories: CategoryEvaluation[] = [];
  try {
    if (overallEvaluation) {
      const parsed: CategoryEvaluation[] = JSON.parse(overallEvaluation);
      evaluationCategories = parsed
        // 구버전 '종합 평가' 데이터는 '종합의견'으로 매핑
        .map((item) => ({
          ...item,
          category: item.category === '종합 평가' ? '종합의견' : item.category,
        }))
        .filter((item) => item.evaluation?.trim() !== '' && ORDER.includes(item.category))
        .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
    }
  } catch (e) {
    if (overallEvaluation && overallEvaluation.trim() !== '') {
      evaluationCategories = [{ category: '종합의견', evaluation: overallEvaluation }];
    }
  }

  const b = banner || {
    from: 'hsl(var(--c5))',
    mid: 'hsl(var(--c5-deep))',
    to: 'hsl(var(--c5))',
    accent: 'hsl(var(--c5-deep))',
  };

  if (evaluationCategories.length === 0) {
    evaluationCategories = [
      {
        category: '종합의견',
        evaluation:
          '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.',
      },
    ];
  }


  return (
    <section className="report-section">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="section-numeral section-numeral-c5">V</span>
        <div>
          <span className="editorial-kicker block" style={{ color: b.mid }}>
            Teacher's Note
          </span>
          <span className="font-display text-xl text-[hsl(var(--ink))] tracking-[-0.02em]">
            담당 강사 코멘트
          </span>
        </div>
      </div>

      {/* Modern editorial card — horizontal split */}
      <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--paper))] border border-[hsl(var(--border))] shadow-[0_8px_32px_-12px_hsl(var(--ink)/0.08)]">
        {/* Subtle theme accent rule */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{
            background: `linear-gradient(180deg, ${b.from} 0%, ${b.mid} 100%)`,
          }}
        />

        <div className="relative p-6 md:p-10 pl-7 md:pl-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Left: large photo + teacher label below */}
            <div className="flex-shrink-0 flex flex-col items-center text-center md:w-48">
              <div className="relative">
                <div
                  className="absolute -inset-3 rounded-2xl opacity-20"
                  style={{
                    background: `linear-gradient(135deg, ${b.from} 0%, ${b.mid} 100%)`,
                  }}
                />
                <div
                  className="relative h-auto rounded-2xl overflow-hidden bg-[hsl(var(--muted))] border-[3px] border-[hsl(var(--paper))] shadow-[0_4px_16px_-4px_hsl(var(--ink)/0.12)]"
                  style={{ maxWidth: '180px' }}
                >
                  {teacherPhoto ? (
                    <img
                      src={teacherPhoto}
                      alt={`${teacher} 선생님`}
                      className="w-auto h-auto max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-32 md:w-44 aspect-[3/4] flex items-center justify-center">
                      <User className="h-12 w-12 md:h-16 md:w-16 text-[hsl(var(--muted-foreground))]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Teacher label below photo */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 mt-5 text-[11px] md:text-[12px] font-semibold tracking-[0.12em] uppercase border shadow-sm whitespace-nowrap"
                style={{
                  backgroundColor: `color-mix(in srgb, ${b.from} 12%, transparent)`,
                  borderColor: `color-mix(in srgb, ${b.accent} 25%, transparent)`,
                  color: b.mid,
                }}
              >
                <img
                  src={teacherIcon}
                  alt=""
                  className="w-4 h-4 shrink-0"
                  loading="lazy"
                  width={16}
                  height={16}
                />
                {teacher}
                <span className="normal-case tracking-normal font-medium opacity-80 whitespace-nowrap">선생님</span>
              </div>
            </div>

            {/* Right: evaluation */}
            <div className="flex-1 min-w-0">

              <div className="space-y-6 md:space-y-7">
                {evaluationCategories.map((category, index) => (
                  <div key={index} className="relative">
                    {evaluationCategories.length > 1 && (
                      <div className="flex items-center gap-2.5 mb-3">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: b.from }}
                        />
                        <p className="editorial-kicker text-[10px] md:text-[11px] tracking-[0.22em]" style={{ color: b.mid }}>
                          {category.category}
                        </p>
                        <div className="h-px flex-1 bg-[hsl(var(--border))]" />
                      </div>
                    )}
                    <p
                      className={
                        index === 0
                          ? 'text-[hsl(var(--ink))] text-[15px] md:text-[16.5px] leading-[1.85] tracking-[-0.005em] font-normal whitespace-pre-wrap text-justify break-keep'
                          : 'text-[hsl(var(--ink))]/85 text-[14px] md:text-[15px] leading-[1.82] whitespace-pre-wrap text-justify break-keep font-normal'
                      }
                    >
                      {category.evaluation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TeacherComment;
