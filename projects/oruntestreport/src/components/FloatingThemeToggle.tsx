import React, { useState } from 'react';
import { Palette, Sparkles, Check } from 'lucide-react';
import { ThemeType, themeDescriptions } from '@/utils/themeColorUtils';

interface FloatingThemeToggleProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  isOverridden: boolean;
}

// 프리셋별 미리보기 컬러 — 토큰 HSL과 동기화
const presetSwatches: Record<ThemeType, { ink: string; gold: string; paper: string; label: string }> = {
  blue: {
    ink: 'hsl(222 47% 11%)',
    gold: 'hsl(41 65% 52%)',
    paper: 'hsl(36 30% 97%)',
    label: '고등부 · 딥 네이비',
  },
  yellow: {
    ink: 'hsl(38 25% 14%)',
    gold: 'hsl(44 88% 52%)',
    paper: 'hsl(48 50% 97%)',
    label: '중1 · 럭스 사프란',
  },
  purple: {
    ink: 'hsl(348 35% 18%)',
    gold: 'hsl(350 45% 50%)',
    paper: 'hsl(350 30% 98%)',
    label: '중2 · 버건디',
  },
  emerald: {
    ink: 'hsl(162 30% 14%)',
    gold: 'hsl(158 35% 42%)',
    paper: 'hsl(150 28% 97%)',
    label: '중3 · 포레스트',
  },
};

const themeOrder: ThemeType[] = ['blue', 'yellow', 'purple', 'emerald'];

const FloatingThemeToggle: React.FC<FloatingThemeToggleProps> = ({
  currentTheme,
  onThemeChange,
  isOverridden,
}) => {
  const [open, setOpen] = useState(false);
  const current = presetSwatches[currentTheme];

  return (
    <div className="fixed top-20 right-6 z-[9998] print:hidden">
      {/* 트리거 — 미니멀 골드 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="테마 변경"
        aria-expanded={open}
        className="group relative flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-full transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: 'hsl(var(--paper) / 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid hsl(var(--gold) / 0.45)',
          boxShadow:
            '0 0 0 1px hsl(var(--gold) / 0.15), 0 14px 36px -14px hsl(var(--ink) / 0.5)',
        }}
      >
        {/* 현재 테마 트리플 스워치 */}
        <span className="inline-flex items-center -space-x-1.5">
          <span
            className="inline-block w-3.5 h-3.5 rounded-full ring-1 ring-[hsl(var(--paper))]"
            style={{ background: current.ink }}
          />
          <span
            className="inline-block w-3.5 h-3.5 rounded-full ring-1 ring-[hsl(var(--paper))]"
            style={{ background: current.gold }}
          />
          <span
            className="inline-block w-3.5 h-3.5 rounded-full ring-1 ring-[hsl(var(--paper))]"
            style={{ background: current.paper, border: '1px solid hsl(var(--ink)/0.15)' }}
          />
        </span>
        <Palette
          size={14}
          className="text-[hsl(var(--gold-deep))] group-hover:rotate-12 transition-transform"
        />
        <span className="editorial-kicker text-[10px] tracking-[0.28em] text-[hsl(var(--ink))] font-bold">
          테마
        </span>
      </button>

      {/* 드롭다운 패널 */}
      {open && (
        <>
          {/* 외부 클릭 차단 */}
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[-1] cursor-default"
          />
          <div
            className="absolute right-0 mt-3 w-[340px] origin-top-right animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              background: 'hsl(var(--paper))',
              border: '1px solid hsl(var(--gold) / 0.4)',
              boxShadow:
                '0 0 0 1px hsl(var(--gold) / 0.15), 0 30px 60px -20px hsl(var(--ink) / 0.45)',
            }}
          >
            {/* 상단 골드 라인 */}
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  'linear-gradient(90deg, hsl(var(--gold-deep)), hsl(var(--gold)), hsl(var(--gold-deep)))',
              }}
            />

            {/* 헤더 */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-[hsl(var(--gold-deep))]" />
                <span className="editorial-kicker text-[10px] tracking-[0.32em] text-[hsl(var(--ink))]">
                  프리셋 테마
                </span>
              </div>
              <span
                className={`text-[9px] uppercase tracking-[0.22em] font-bold px-1.5 py-0.5 ${
                  isOverridden
                    ? 'text-[hsl(var(--gold-deep))] bg-[hsl(var(--gold)/0.12)] border border-[hsl(var(--gold)/0.4)]'
                    : 'text-[hsl(var(--ink-soft))] border border-[hsl(var(--ink)/0.15)]'
                }`}
              >
                {isOverridden ? '수동' : '자동'}
              </span>
            </div>
            <div className="px-4 pb-3">
              <p className="text-[11px] text-[hsl(var(--ink-soft))] leading-relaxed break-keep">
                {isOverridden
                  ? '수동으로 선택된 테마입니다.'
                  : '학년에 맞춰 자동 적용된 테마입니다. 원하는 프리셋을 직접 선택할 수도 있습니다.'}
              </p>
            </div>

            {/* 디바이더 */}
            <div className="h-px bg-[hsl(var(--ink)/0.08)] mx-4" />

            {/* 프리셋 리스트 */}
            <div className="p-2">
              {themeOrder.map((t) => {
                const swatch = presetSwatches[t];
                const active = t === currentTheme;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onThemeChange(t);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 transition-colors text-left rounded-sm ${
                      active
                        ? 'bg-[hsl(var(--gold)/0.08)]'
                        : 'hover:bg-[hsl(var(--paper-warm))]'
                    }`}
                  >
                    {/* 트리플 스워치 */}
                    <span className="inline-flex items-center -space-x-1.5 flex-shrink-0">
                      <span
                        className="inline-block w-5 h-5 rounded-full ring-1 ring-[hsl(var(--paper))]"
                        style={{ background: swatch.ink }}
                      />
                      <span
                        className="inline-block w-5 h-5 rounded-full ring-1 ring-[hsl(var(--paper))]"
                        style={{ background: swatch.gold }}
                      />
                      <span
                        className="inline-block w-5 h-5 rounded-full ring-1 ring-[hsl(var(--paper))]"
                        style={{
                          background: swatch.paper,
                          border: '1px solid hsl(var(--ink)/0.15)',
                        }}
                      />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-[hsl(var(--ink))] tracking-[-0.005em] break-keep leading-snug">
                          {themeDescriptions[t]}
                        </span>
                        {active && (
                          <Check
                            size={12}
                            className="text-[hsl(var(--gold-deep))] flex-shrink-0"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <span className="block text-[10.5px] text-[hsl(var(--ink-soft))] uppercase tracking-[0.18em] font-medium break-keep leading-snug mt-0.5">
                        {swatch.label.split('·')[1]?.trim() || swatch.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FloatingThemeToggle;