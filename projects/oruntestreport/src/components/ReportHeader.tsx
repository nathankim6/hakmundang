import React from 'react';
import { getSchoolLogo } from '@/lib/schoolLogos';
import { useLogoBannerTheme } from '@/lib/logoColor';

interface ReportHeaderProps {
 date: string;
 themeColors: any;
 schoolName?: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ date, themeColors, schoolName }) => {
  // 리포트 시리얼 — 날짜 기반 (없으면 오늘)
  const parsed = date ? new Date(date) : new Date();
  const issueDate = isNaN(parsed.getTime()) ? new Date() : parsed;
  const yyyy = issueDate.getFullYear();
  const mm = String(issueDate.getMonth() + 1).padStart(2, '0');
  const dd = String(issueDate.getDate()).padStart(2, '0');
  const issued = `${yyyy}_${mm}_${dd}`;

  // 학교 로고 대표 색상 → 배너 테마 자동 산출
  const logoUrl = getSchoolLogo(schoolName);
  const banner = useLogoBannerTheme(logoUrl);

  return (
    <header className="relative pb-1">
      {/* 배너 바 */}
      <div
        className="relative flex items-center gap-4 md:gap-6 px-3.5 md:px-5 py-3 md:py-3.5 border-x border-b overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${banner.from} 0%, ${banner.mid} 50%, ${banner.to} 100%)`,
          borderColor: `color-mix(in srgb, ${banner.mid} 45%, transparent)`,
        }}
      >
        {/* 다이아몬드 패턴 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 22px)',
          }}
        />

        {/* 로고 타일 */}
        <div className="relative shrink-0 h-12 w-12 md:h-14 md:w-14 border border-white/40 bg-white/10 p-[3px] backdrop-blur-sm">
          <img
            src="/lovable-uploads/orun-logo-new.png"
            alt="ORUN ACADEMY"
            className="h-full w-full object-contain"
          />
        </div>

        <span className="relative h-10 md:h-12 w-px bg-white/25" />

        {/* 타이틀 */}
        <div className="relative min-w-0 flex-1">
          <div
            className="flex items-center gap-1.5 text-[8.5px] md:text-[9.5px] font-semibold uppercase text-white/70"
            style={{ letterSpacing: '0.32em' }}
          >
            <span className="text-[7px] text-[hsl(var(--gold))]">◆</span>
            ORUN ENGLISH
          </div>
          <h1
            className="mt-1 font-orbitron text-[17px] sm:text-[22px] md:text-[27px] leading-[1.05] font-bold text-white whitespace-nowrap"
            style={{ letterSpacing: '0.04em' }}
          >
            ORUN ENGLISH <span style={{ color: banner.accent, filter: `drop-shadow(0 0 8px ${banner.accent})` }}>EXAM</span> ANALYSIS
          </h1>
        </div>

        {/* 우측 배지 */}
        <div className="relative shrink-0 flex items-center gap-2">
          <span
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 border border-white/30 text-[10px] md:text-[11px] font-semibold text-white whitespace-nowrap metric-num"
            style={{ letterSpacing: '0.1em' }}
          >
            ISSUED : {issued}
          </span>
        </div>
      </div>

      {/* 하단 골드 액센트 */}
      <div className="flex">
        <span className="h-[3px] flex-1" style={{ background: `color-mix(in srgb, ${banner.mid} 12%, transparent)` }} />
      </div>

    </header>
  );
};

export default ReportHeader;
