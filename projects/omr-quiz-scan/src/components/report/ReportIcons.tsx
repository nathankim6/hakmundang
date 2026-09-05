import { SVGProps } from "react";

/**
 * ORUN Report Icon Set — "Engraved Editorial"
 * 커스텀 제작 아이콘. 얇은 라인 + 미세한 채움 포인트로
 * 일반적인 아이콘 라이브러리와 구분되는 각인(engraving) 스타일.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

/** 학생 — 각인된 인장 속 인물 */
export const IconStudent = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9.2" opacity="0.35" />
    <circle cx="12" cy="9.6" r="2.7" />
    <path d="M6.9 17.6c1-2.6 2.8-3.9 5.1-3.9s4.1 1.3 5.1 3.9" />
    <circle cx="12" cy="9.6" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
  </svg>
);

/** 소속반 — 아치형 배지 */
export const IconClass = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4.2 10.6 12 6.4l7.8 4.2L12 14.8Z" />
    <path d="M7.2 12.5v3.4c0 1.4 2.1 2.5 4.8 2.5s4.8-1.1 4.8-2.5v-3.4" opacity="0.6" />
    <path d="M19.8 10.6v4" opacity="0.5" />
    <circle cx="19.8" cy="15.4" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

/** 시험명 — 접힌 문서 */
export const IconPaper = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6.4 3.6h7.3l4 4v12.8H6.4Z" />
    <path d="M13.7 3.6v4h4" opacity="0.6" />
    <path d="M9.1 12.4h6.2M9.1 15.4h4.2" opacity="0.75" />
    <circle cx="9.1" cy="9.4" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

/** 시행일자 — 각인 달력 */
export const IconDate = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.6" y="5.4" width="16.8" height="14.2" rx="2.4" />
    <path d="M3.6 9.6h16.8" opacity="0.6" />
    <path d="M8.2 3.6v3.4M15.8 3.6v3.4" />
    <circle cx="12" cy="14.6" r="1.5" fill="currentColor" stroke="none" opacity="0.85" />
  </svg>
);

/** 총점 — 조준 인장 */
export const IconScoreSeal = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 2.8 14.6 6l4-.2-.2 4L21 12.4l-2.6 2.6.2 4-4-.2L12 21.2 9.4 18.8l-4 .2.2-4-2.6-2.6 2.6-2.6-.2-4 4 .2Z" opacity="0.45" />
    <circle cx="12" cy="12" r="4.4" />
    <path d="m10.2 12.1 1.4 1.5 2.5-3" />
  </svg>
);

/** 등급 — 월계관 */
export const IconLaurel = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9.4 19.4c-3-1.3-4.6-4-4.6-7.9 0-3.4 1.4-6 4-7.6" />
    <path d="M14.6 19.4c3-1.3 4.6-4 4.6-7.9 0-3.4-1.4-6-4-7.6" />
    <path d="M7.2 9.6c1.1.2 1.9.8 2.3 1.8M7 13.4c1.1.1 1.9.6 2.5 1.6M16.8 9.6c-1.1.2-1.9.8-2.3 1.8M17 13.4c-1.1.1-1.9.6-2.5 1.6" opacity="0.6" />
    <circle cx="12" cy="11.6" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

/** 영역별 성취도 — 분할 원반 */
export const IconSegments = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 3.6v8.4l7.3 4.2" />
    <path d="M12 12 4.9 16.2" opacity="0.55" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/** 점수 비교 — 계단 막대 */
export const IconCompare = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20h16" opacity="0.6" />
    <rect x="5.2" y="13.4" width="3.6" height="6.6" rx="1.1" />
    <rect x="10.2" y="9" width="3.6" height="11" rx="1.1" />
    <rect x="15.2" y="5.2" width="3.6" height="14.8" rx="1.1" opacity="0.75" />
    <circle cx="12" cy="6.4" r="0.9" fill="currentColor" stroke="none" opacity="0.7" />
  </svg>
);

/** 오답 — 각진 경고 인장 */
export const IconFlag = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.4 20.4 18a1.4 1.4 0 0 1-1.2 2.1H4.8A1.4 1.4 0 0 1 3.6 18Z" />
    <path d="M12 9.6v4.2" />
    <circle cx="12" cy="16.8" r="0.95" fill="currentColor" stroke="none" />
  </svg>
);

/** 문항 채점 — 격자 체크 */
export const IconGrid = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.6" y="3.6" width="7.2" height="7.2" rx="1.6" />
    <rect x="13.2" y="3.6" width="7.2" height="7.2" rx="1.6" opacity="0.55" />
    <rect x="3.6" y="13.2" width="7.2" height="7.2" rx="1.6" opacity="0.55" />
    <path d="m14 17.1 1.7 1.8 4-4.4" />
  </svg>
);

/** 누적 성장 — 파형 */
export const IconPulse = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2.8 12.4h3.4l2-5.2 3.2 10.4 2.4-6.6 1.7 3.2h5.7" />
    <circle cx="8.2" cy="7.2" r="0.9" fill="currentColor" stroke="none" opacity="0.7" />
  </svg>
);

/** 점수 추이 — 상승 곡선 */
export const IconTrend = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.6 19.2h16.8" opacity="0.5" />
    <path d="M4.8 15.6 9.4 11l3 2.8 6.2-6.4" />
    <path d="M15.6 7.4h3.2v3.2" />
    <circle cx="9.4" cy="11" r="0.9" fill="currentColor" stroke="none" opacity="0.75" />
  </svg>
);

/** 취약 유형 — 금 간 방패 */
export const IconWeak = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.2 19 5.8v5.5c0 4.1-2.7 7.2-7 9.5-4.3-2.3-7-5.4-7-9.5V5.8Z" />
    <path d="M12 8.2 10.6 12h2.6L11.8 16" opacity="0.85" />
  </svg>
);

/** 성장 유형 — 새싹 화살 */
export const IconGrowth = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 20.4V9.6" />
    <path d="m7.6 13.4 4.4-4.6 4.4 4.6" />
    <path d="M12 9.6c-.2-2.6 1.5-4.6 4.4-5.2.3 2.9-1.2 4.9-4.4 5.2Z" opacity="0.6" />
  </svg>
);

/** 코멘트 — 각인 말풍선 */
export const IconNote = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4.2 6.4a2.2 2.2 0 0 1 2.2-2.2h11.2a2.2 2.2 0 0 1 2.2 2.2v7.4a2.2 2.2 0 0 1-2.2 2.2H10l-4.3 3.6a.6.6 0 0 1-1-.5v-3.1H6.4a2.2 2.2 0 0 1-2.2-2.2Z" />
    <path d="M8.4 8.6h7.2M8.4 11.8h4.6" opacity="0.7" />
  </svg>
);
