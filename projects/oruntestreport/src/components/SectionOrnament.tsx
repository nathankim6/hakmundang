import React from 'react';

type SectionOrnamentProps = {
  /** 문양 종류 인덱스 (섹션별로 다르게) */
  variant?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * 골드 톤 미니 문양 — 섹션 헤더/카드 코너 장식용.
 * 색상은 currentColor 기반이므로 부모에서 text-[hsl(var(--gold))] 등으로 제어한다.
 */
const SectionOrnament: React.FC<SectionOrnamentProps> = ({ variant = 0, className, style }) => {
  const glyphs = [
    // 다이아몬드 + 라인
    <g key="0">
      <path d="M12 3 L17 12 L12 21 L7 12 Z" fill="none" strokeWidth="1" />
      <path d="M12 7.5 L14.5 12 L12 16.5 L9.5 12 Z" fill="currentColor" opacity="0.5" stroke="none" />
    </g>,
    // 사각 격자 문양
    <g key="1">
      <rect x="4" y="4" width="16" height="16" fill="none" strokeWidth="1" />
      <rect x="8.5" y="8.5" width="7" height="7" fill="currentColor" opacity="0.45" stroke="none" />
      <path d="M12 1.5 V4 M12 20 V22.5 M1.5 12 H4 M20 12 H22.5" strokeWidth="1" />
    </g>,
    // 아치 문양
    <g key="2">
      <path d="M5 20 V12 A7 7 0 0 1 19 12 V20" fill="none" strokeWidth="1" />
      <path d="M9 20 V12.5 A3 3 0 0 1 15 12.5 V20" fill="currentColor" opacity="0.35" stroke="none" />
    </g>,
    // 방사형 눈금
    <g key="3">
      <circle cx="12" cy="12" r="8" fill="none" strokeWidth="1" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" opacity="0.55" />
      <path d="M12 1.5 V5 M12 19 V22.5 M1.5 12 H5 M19 12 H22.5" strokeWidth="1" />
    </g>,
  ];

  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="square"
      className={className ?? 'w-4 h-4'}
      style={style}
    >
      {glyphs[variant % glyphs.length]}
    </svg>
  );
};

export default SectionOrnament;
