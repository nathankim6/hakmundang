/**
 * 옳은영어 학교 분석지 — 삽화·아이콘 세트.
 *
 * 웹과 PPT가 같은 그림을 쓴다.
 *  - 웹: 인라인 SVG (색은 currentColor·CSS 변수)
 *  - PPT: data:image/svg+xml (색은 실제 값) → 파워포인트에서 벡터로 열린다
 *
 * 그림 규칙
 *  - 2px 잉크 선, 둥근 끝. 면은 종이색만.
 *  - 옐로우는 한 점. 파랑은 보조. 그 외 색 금지.
 *  - 글자를 그림 안에 넣지 않는다(폰트 의존). 숫자는 점으로.
 */

export interface Palette {
  ink: string;
  accent: string;
  second: string;
  soft: string;
  paper: string;
}

export const LIGHT: Palette = { ink: "#1C1C1C", accent: "#FFD400", second: "#1A7FBF", soft: "#E4E2DD", paper: "#F7F6F2" };
export const DARK: Palette = { ink: "#FFFFFF", accent: "#FFD400", second: "#6FB7E6", soft: "#3A3A3A", paper: "#2A2A2A" };
/** 인라인 SVG 전용 — 부모 글자색과 CSS 토큰을 따라간다 */
export const WEB: Palette = { ink: "currentColor", accent: "var(--yellow-hi)", second: "var(--blue)", soft: "var(--hair)", paper: "var(--paper)" };

type Draw = (c: Palette) => string;

/* ══════════════════════════════════════════
 * 아이콘 (24×24)
 * ══════════════════════════════════════════ */

const ICONS = {
  /* 시험·성적 */
  seat: (c) => `<path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/><path d="M4 11h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M7 17v3M17 17v3"/><rect x="10.5" y="12.6" width="3" height="1.8" fill="${c.accent}" stroke="none"/>`,
  paper: (c) => `<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h6M10 15h6M10 18h4"/><path d="M10 9h3" stroke="${c.accent}" stroke-width="2.4"/>`,
  divide: (c) => `<path d="M5 12h14"/><circle cx="12" cy="6.5" r="1.7"/><circle cx="12" cy="17.5" r="1.9" fill="${c.accent}" stroke="none"/>`,
  cut: (c) => `<path d="M3 19h18"/><path d="M6 19v-5M10 19v-9M14 19V8M18 19v-7"/><path d="M3 9.5h18" stroke="${c.accent}" stroke-dasharray="2.5 2.5" stroke-width="2"/>`,
  bars: (c) => `<path d="M3 20h18"/><path d="M6 20v-7M11 20V6M16 20v-4M20.5 20v-9"/><circle cx="11" cy="6" r="1.8" fill="${c.accent}" stroke="none"/>`,
  range: (c) => `<path d="M4 6v12M20 6v12"/><path d="M9 9l-3 3 3 3M15 9l3 3-3 3"/><circle cx="12" cy="12" r="1.5" fill="${c.accent}" stroke="none"/>`,
  checks: (c) => `<path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1 1 2-2M3.5 18l1 1 2-2"/><path d="M3.5 12l1 1 2-2" stroke="${c.accent}" stroke-width="2.4"/>`,
  percent: (c) => `<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5" fill="${c.accent}" stroke="none"/>`,
  trend: (c) => `<path d="M3 20h18"/><path d="M4 16l5-5 4 3 7-8"/><circle cx="20" cy="6" r="1.9" fill="${c.accent}" stroke="none"/>`,
  target: (c) => `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.7" fill="${c.accent}" stroke="none"/>`,
  /* 영어·공부 */
  abc: (c) => `<path d="M3 18L7.5 6 12 18M5 14h5"/><circle cx="17" cy="14.5" r="2.6"/><path d="M19.6 12v6"/><path d="M3 21.5h18" stroke="${c.accent}" stroke-width="2.2"/>`,
  grammar: (c) => `<path d="M8 4H5v16h3M16 4h3v16h-3"/><path d="M9.5 12h5" stroke-dasharray="2 2"/><circle cx="12" cy="12" r="1.6" fill="${c.accent}" stroke="none"/>`,
  headphones: (c) => `<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H4z"/><path d="M17 14h3v6h-3z" fill="${c.accent}"/>`,
  pen: (c) => `<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/><path d="M4 20l1.1-3.1 2 2z" fill="${c.accent}" stroke="none"/>`,
  book: (c) => `<path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/><path d="M17 4v5l-1.5-1L14 9V4" stroke="${c.accent}" stroke-width="1.6"/>`,
  bulb: (c) => `<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5A6 6 0 0 1 12 3z"/><path d="M4 5.5l1.6 1.6M20 5.5l-1.6 1.6M12 .8v1.6" stroke="${c.accent}" stroke-width="2.2"/>`,
  layers: (c) => `<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/><path d="M12 6l3.6 2L12 10 8.4 8z" fill="${c.accent}" stroke="none"/>`,
  tablet: (c) => `<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M11 18h2"/><path d="M8 8h8" stroke="${c.accent}" stroke-width="2.2"/>`,
  chip: (c) => `<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9 4v3M12 4v3M15 4v3M9 17v3M12 17v3M15 17v3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3"/><rect x="10.5" y="10.5" width="3" height="3" fill="${c.accent}" stroke="none"/>`,
  sparkle: (c) => `<path d="M11 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M19 2.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" fill="${c.accent}" stroke="none"/>`,
  /* 학교생활 */
  tray: (c) => `<rect x="3" y="7.5" width="18" height="11" rx="1.5"/><path d="M3 13h18M12 7.5v11"/><circle cx="7.5" cy="10.3" r="1.4" fill="${c.accent}" stroke="none"/>`,
  stairs: (c) => `<path d="M3 21h4v-4h4v-4h4v-4h4V5h2"/><circle cx="21" cy="5" r="1.6" fill="${c.accent}" stroke="none"/>`,
  store: (c) => `<path d="M4 10l1-5h14l1 5"/><path d="M4 10a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M5 12v9h14v-9M10 21v-5h4v5"/><circle cx="16.5" cy="15" r="1.2" fill="${c.accent}" stroke="none"/>`,
  bus: (c) => `<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10H4z"/><path d="M4 11h16M4 16v2h3v-2M17 16v2h3v-2M12 4v7"/><circle cx="7.5" cy="14" r="1" fill="${c.accent}" stroke="none"/><circle cx="16.5" cy="14" r="1" fill="${c.accent}" stroke="none"/>`,
  shirt: (c) => `<path d="M8 3L4 6l2 3 2-1v13h8V8l2 1 2-3-4-3-2 2h-4z"/><path d="M10 3a2 2 0 0 0 4 0" stroke="${c.accent}" stroke-width="2.2"/>`,
  moon: (c) => `<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/><circle cx="19" cy="5" r="1.4" fill="${c.accent}" stroke="none"/>`,
  lamp: (c) => `<path d="M4 21h10M9 21v-8L15 6"/><path d="M13 4l5 5-2.5 1L12 7z"/><circle cx="19.5" cy="12.5" r="1.8" fill="${c.accent}" stroke="none"/>`,
  dumbbell: (c) => `<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/><rect x="10.5" y="10.6" width="3" height="2.8" fill="${c.accent}" stroke="none"/>`,
  ball: (c) => `<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8"/><circle cx="12" cy="12" r="1.5" fill="${c.accent}" stroke="none"/>`,
  door: (c) => `<path d="M4 21V3h10v18"/><path d="M14 12h7M18 9l3 3-3 3"/><circle cx="11" cy="12" r="1.1" fill="${c.accent}" stroke="none"/>`,
  /* 사람·장소 */
  school: (c) => `<path d="M3 21h18M5 21V9l7-5 7 5v12M10 21v-6h4v6M8 12h2M14 12h2"/><path d="M12 4V1.5h3l-1 1 1 1h-3" stroke="${c.accent}" stroke-width="1.8"/>`,
  pin: (c) => `<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.4" fill="${c.accent}" stroke="none"/>`,
  map: (c) => `<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/><circle cx="12" cy="10.5" r="1.6" fill="${c.accent}" stroke="none"/>`,
  family: (c) => `<circle cx="8" cy="7" r="2.6"/><path d="M3 20v-3a5 5 0 0 1 10 0v3"/><circle cx="16.5" cy="9.5" r="2" fill="${c.accent}"/><path d="M13.5 20v-2.5a3.2 3.2 0 0 1 6.4 0V20"/>`,
  gradcap: (c) => `<path d="M2 9l10-4 10 4-10 4z"/><path d="M6 11v4c0 1.5 3 3 6 3s6-1.5 6-3v-4M22 9v5"/><circle cx="22" cy="15.5" r="1.3" fill="${c.accent}" stroke="none"/>`,
  compass: (c) => `<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-4 2 2-6z"/><path d="M15 9l-2 6-2-2z" fill="${c.accent}" stroke="none"/>`,
  eye: (c) => `<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1.2" fill="${c.accent}" stroke="none"/>`,
  search: (c) => `<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/><path d="M6.6 9.2a4.2 4.2 0 0 1 2.8-2.9" stroke="${c.accent}" stroke-width="2.2"/>`,
  /* 말·소식·기록 */
  speech: (c) => `<path d="M4 5h16v11H9l-5 4z"/><circle cx="9" cy="10.5" r="1" fill="${c.accent}" stroke="none"/><circle cx="12" cy="10.5" r="1" fill="${c.accent}" stroke="none"/><circle cx="15" cy="10.5" r="1" fill="${c.accent}" stroke="none"/>`,
  quote: (c) => `<path d="M7 15c-2 0-3-1.5-3-3.5S5.5 7 8 7c.5 0 1 .1 1.5.3C9.2 10 8.5 12.5 7 15z"/><path d="M16 15c-2 0-3-1.5-3-3.5S14.5 7 17 7c.5 0 1 .1 1.5.3C18.2 10 17.5 12.5 16 15z" stroke="${c.accent}"/>`,
  mic: (c) => `<path d="M9 4a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/><circle cx="19.5" cy="4.5" r="1.8" fill="${c.accent}" stroke="none"/>`,
  megaphone: (c) => `<path d="M4 10v4l10 4V6z"/><path d="M14 6l4-2v16l-4-2M5 14l1.5 5h3l-1-5"/><path d="M20.5 8.5a5 5 0 0 1 0 7" stroke="${c.accent}" stroke-width="2.2"/>`,
  news: (c) => `<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v9a2 2 0 0 1-2 2"/><path d="M7 9h4v4H7zM13 12h2M7 16h8"/><path d="M13 9h2" stroke="${c.accent}" stroke-width="2.4"/>`,
  camera: (c) => `<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/><circle cx="12" cy="13" r="1.2" fill="${c.accent}" stroke="none"/>`,
  folder: (c) => `<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 11h18" stroke="${c.accent}" stroke-width="1.6"/>`,
  calendar: (c) => `<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/><rect x="13.5" y="13" width="3" height="3" fill="${c.accent}" stroke="none"/>`,
  link: (c) => `<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/><circle cx="20" cy="4" r="1.5" fill="${c.accent}" stroke="none"/>`,
  shield: (c) => `<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4" stroke="${c.accent}" stroke-width="2.2"/>`,
  trophy: (c) => `<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M12 13v4M8 21h8M10 17h4v4h-4z"/><circle cx="12" cy="7.5" r="1.4" fill="${c.accent}" stroke="none"/>`,
  sprout: (c) => `<path d="M12 21v-8"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6z"/><path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5z"/><path d="M6 21h12" stroke="${c.accent}" stroke-width="2.2"/>`,
  flask: (c) => `<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><circle cx="10" cy="16" r="1" fill="${c.accent}" stroke="none"/><circle cx="14" cy="17.5" r="1.4" fill="${c.accent}" stroke="none"/>`,
  /* UI */
  arrowRight: (c) => `<path d="M5 12h14M13 6l6 6-6 6"/><circle cx="5" cy="12" r="1.2" fill="${c.accent}" stroke="none"/>`,
  arrowLeft: (c) => `<path d="M19 12H5M11 6l-6 6 6 6"/><circle cx="19" cy="12" r="1.2" fill="${c.accent}" stroke="none"/>`,
  arrowDown: (c) => `<path d="M12 4v15M6 13l6 6 6-6"/><path d="M5 2.5h14" stroke="${c.accent}" stroke-width="2.2"/>`,
  arrowUp: (c) => `<path d="M12 20V5M6 11l6-6 6 6"/><path d="M5 21.5h14" stroke="${c.accent}" stroke-width="2.2"/>`,
  download: (c) => `<path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 20h16" stroke="${c.accent}" stroke-width="2.2"/>`,
  print: (c) => `<path d="M7 8V4h10v4"/><path d="M5 8h14a2 2 0 0 1 2 2v6h-4v4H7v-4H3v-6a2 2 0 0 1 2-2zM7 16h10"/><circle cx="18" cy="12" r="1.1" fill="${c.accent}" stroke="none"/>`,
  filter: (c) => `<path d="M4 6h16M7 12h10M10 18h4"/><circle cx="16" cy="6" r="1.8" fill="${c.accent}" stroke="none"/>`,
  check: (c) => `<path d="M4 12.5l5 5L20 7"/><circle cx="9" cy="17.5" r="1.4" fill="${c.accent}" stroke="none"/>`,
  plus: () => `<path d="M12 5v14M5 12h14"/>`,
  x: () => `<path d="M6 6l12 12M18 6L6 18"/>`,
  slides: (c) => `<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/><path d="M7 9h6M7 12h4" stroke="${c.accent}" stroke-width="1.8"/>`,
  edit: (c) => `<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="M14.5 5.5l3 3" stroke="${c.accent}" stroke-width="2.2"/>`,
  calc: (c) => `<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h8M8 12h2M12 12h2M16 12h.01M8 16h2M12 16h2"/><rect x="15" y="15" width="2.4" height="2.4" fill="${c.accent}" stroke="none"/>`,
  info: (c) => `<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.8" r="1.3" fill="${c.accent}" stroke="none"/>`,
  alert: (c) => `<path d="M12 3l10 18H2z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="1.2" fill="${c.accent}" stroke="none"/>`,
} satisfies Record<string, Draw>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function iconSvg(
  name: IconName,
  opts: { size?: number; palette?: Palette; stroke?: number; title?: string } = {},
): string {
  const { size = 24, palette = WEB, stroke = 1.8 } = opts;
  const inner = ICONS[name](palette);
  const title = opts.title ? `<title>${esc(opts.title)}</title>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" ` +
    `fill="none" stroke="${palette.ink}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="${opts.title ? "false" : "true"}">` +
    `${title}${inner}</svg>`
  );
}

/* ══════════════════════════════════════════
 * 삽화 (320×220)
 * ══════════════════════════════════════════ */

const AW = 320;
const AH = 220;

const rect = (x: number, y: number, w: number, h: number, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;

/** 창문 격자 */
function windows(x0: number, y0: number, cols: number, rows: number, w = 8, h = 10, gx = 14, gy = 20) {
  let s = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += rect(x0 + c * gx, y0 + r * gy, w, h, 'stroke-width="1.5"');
  return s;
}

const ART: Record<string, Draw> = {
  /** 표지 — 동네 지붕 위로 등대 불빛 */
  lighthouseTown: (c) => `
    <path d="M12 196h296"/>
    <path d="M24 196V128h36v68"/>${windows(31, 140, 2, 3)}
    <path d="M72 196V96h30v100"/>${windows(79, 108, 1, 4)}${windows(93, 108, 1, 4, 6)}
    <path d="M114 196v-54l18-16 18 16v54M126 196v-16h12v16"/>${windows(122, 150, 2, 1)}
    <path d="M162 196V116h26v80"/>${windows(168, 128, 1, 3)}
    <path d="M222 196l8-118h24l8 118"/>
    <path d="M218 78h48"/>
    <path d="M232 78V60h20v18M228 60l14-14 14 14z"/>
    <path d="M229 116h26M227 146h30M225 176h34" stroke-width="1.5"/>
    <path d="M254 66l54-22M254 72l56 12" stroke="${c.accent}" stroke-width="3"/>
    <circle cx="242" cy="69" r="4.5" fill="${c.accent}" stroke="none"/>
    <path d="M276 196v-40h24v40"/>${windows(283, 166, 1, 1)}
  `,
  /** 분모 — 물 위에 보이는 건 조금, 아래가 크다 */
  iceberg: (c) => `
    <path d="M12 96h296"/>
    <path d="M12 112h296" stroke="${c.soft}" stroke-dasharray="6 6"/>
    <path d="M132 96l24-52 20 24 12-10 22 38z" fill="${c.paper}"/>
    <path d="M132 96l-34 40 48 52 60 14 52-56 28-50" stroke-dasharray="7 5" opacity=".7"/>
    <circle cx="156" cy="44" r="4.5" fill="${c.accent}" stroke="none"/>
    <path d="M232 44v52" stroke="${c.accent}" stroke-width="2.5"/>
    <path d="M226 44h12M226 96h12" stroke="${c.accent}" stroke-width="2.5"/>
    <path d="M300 112v90M294 112h12M294 202h12" stroke="${c.soft}" stroke-width="2.5"/>
  `,
  /** 나란히 — 세 학교의 키를 한 선으로 */
  sideBySide: (c) => `
    <path d="M12 188h296"/>
    <path d="M30 188V110h72v78M24 110l42-28 42 28M60 188v-22h12v22"/>${windows(40, 124, 2, 2)}${windows(80, 124, 1, 2)}
    <path d="M124 188v-68h72v68M118 120l42-24 42 24M154 188v-22h12v22"/>${windows(134, 132, 2, 2)}${windows(174, 132, 1, 2)}
    <path d="M218 188V100h72v88M212 100l42-30 42 30M248 188v-22h12v22"/>${windows(228, 114, 2, 3)}${windows(268, 114, 1, 3)}
    <path d="M66 82L160 96l94-26" stroke="${c.accent}" stroke-width="2.5"/>
    <circle cx="66" cy="82" r="4.5" fill="${c.accent}" stroke="none"/>
    <circle cx="160" cy="96" r="4.5" fill="${c.accent}" stroke="none"/>
    <circle cx="254" cy="70" r="4.5" fill="${c.accent}" stroke="none"/>
    <path d="M30 56h260" stroke="${c.soft}" stroke-dasharray="4 6"/>
  `,
  /** 자리 — 강당 좌석, 앞줄 몇 개만 노랗다 */
  seats: (c) => {
    let s = `<path d="M40 28h240" stroke-width="3"/>`;
    for (let r = 0; r < 5; r++) {
      for (let k = 0; k < 8; k++) {
        const x = 44 + k * 32;
        const y = 58 + r * 34;
        const hot = r === 0 && k < 4;
        s += rect(x, y, 22, 14, `rx="3" ${hot ? `fill="${c.accent}"` : `fill="${c.paper}"`}`);
        s += `<path d="M${x + 3} ${y + 14}v6M${x + 19} ${y + 14}v6" stroke-width="1.5"/>`;
      }
    }
    return s;
  },
  /** 시험지 — 답안 마킹과 연필 */
  examPaper: (c) => `
    <path d="M84 24h130l32 32v140H84z" fill="${c.paper}"/>
    <path d="M214 24v32h32"/>
    <path d="M110 84h96M110 104h96M110 124h68M110 144h96M110 164h56" stroke-width="1.5"/>
    <circle cx="98" cy="84" r="5"/><circle cx="98" cy="104" r="5" fill="${c.ink}"/><circle cx="98" cy="124" r="5"/>
    <circle cx="98" cy="144" r="5" fill="${c.accent}"/><circle cx="98" cy="164" r="5"/>
    <path d="M192 206l62-62 16 16-62 62H192z" fill="${c.paper}"/>
    <path d="M192 206l-3 18 18-3z" fill="${c.accent}" stroke="none"/>
    <path d="M244 154l16 16" stroke-width="1.5"/>
  `,
  /** 진로 — 한 중학교에서 네 갈래로 */
  pathsMap: (c) => `
    <path d="M28 130V90h44v40M24 90l26-18 26 18M44 130v-16h12v16"/>${windows(34, 100, 1, 1)}${windows(56, 100, 1, 1)}
    <path d="M20 130h60"/>
    <path d="M72 110C130 110 160 40 246 40" stroke="${c.accent}" stroke-width="2.5"/>
    <path d="M72 112C140 112 170 90 246 90" stroke-width="4.5"/>
    <path d="M72 114C140 114 170 140 246 140" stroke="${c.second}" stroke-width="2.5"/>
    <path d="M72 116C140 116 170 190 246 190" stroke="${c.soft}" stroke-width="2" stroke-dasharray="5 5"/>
    <path d="M256 52s10-9 10-16a10 10 0 0 0-20 0c0 7 10 16 10 16z" fill="${c.accent}"/>
    <path d="M256 102s10-9 10-16a10 10 0 0 0-20 0c0 7 10 16 10 16z" fill="${c.ink}"/>
    <path d="M256 152s10-9 10-16a10 10 0 0 0-20 0c0 7 10 16 10 16z" fill="${c.paper}" stroke="${c.second}"/>
    <path d="M256 202s10-9 10-16a10 10 0 0 0-20 0c0 7 10 16 10 16z" fill="${c.paper}" stroke="${c.soft}"/>
    <path d="M276 40h28M276 90h28M276 140h28M276 190h28" stroke="${c.soft}" stroke-width="1.5"/>
  `,
  /** 들여다보기 — 학교 위에 확대경 */
  zoom: (c) => `
    <path d="M20 176h280"/>
    <path d="M50 176V96h120v80M42 96l64-42 64 42M100 176v-30h20v30"/>${windows(62, 112, 2, 2, 10, 12, 18, 22)}${windows(136, 112, 2, 2, 10, 12, 18, 22)}
    <path d="M106 54V30h18l-6 6 6 6h-18" stroke="${c.accent}" stroke-width="2.5"/>
    <circle cx="204" cy="110" r="56" fill="${c.paper}" fill-opacity=".92" stroke-width="3"/>
    <rect x="180" y="86" width="48" height="48" stroke-width="2.5"/>
    <path d="M204 86v48M180 110h48" stroke-width="2.5"/>
    <path d="M244 150l46 46" stroke-width="9"/>
    <path d="M164 94a44 44 0 0 1 24-30" stroke="${c.accent}" stroke-width="3"/>
  `,
  /** TMI — 말풍선 셋 */
  tmi: (c) => `
    <path d="M24 40h150a12 12 0 0 1 12 12v66a12 12 0 0 1-12 12H80l-26 26v-26H24a12 12 0 0 1-12-12V52a12 12 0 0 1 12-12z" fill="${c.paper}"/>
    <rect x="50" y="66" width="96" height="40" rx="4"/><path d="M50 86h96M98 66v40"/>
    <circle cx="74" cy="76" r="6" fill="${c.accent}" stroke="none"/>
    <path d="M170 96h126a12 12 0 0 1 12 12v50a12 12 0 0 1-12 12h-18v24l-24-24h-84a12 12 0 0 1-12-12v-50a12 12 0 0 1 12-12z" fill="${c.paper}"/>
    <path d="M186 158h14v-10h14v-10h14v-10h14v-10h14v-10h14"/>
    <circle cx="284" cy="108" r="4.5" fill="${c.accent}" stroke="none"/>
    <path d="M60 182h60a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H88l-12 10v-10H60a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8z" stroke="${c.accent}" stroke-width="2.5"/>
    <circle cx="76" cy="198" r="3" fill="${c.ink}" stroke="none"/><circle cx="90" cy="198" r="3" fill="${c.ink}" stroke="none"/><circle cx="104" cy="198" r="3" fill="${c.ink}" stroke="none"/>
  `,
  /** 학교 소식 — 신문과 확성기 */
  news: (c) => `
    <path d="M16 40h160v140H32a16 16 0 0 1-16-16z" fill="${c.paper}"/>
    <path d="M176 60h34v104a16 16 0 0 1-16 16"/>
    <rect x="36" y="60" width="64" height="52"/>
    <path d="M116 64h44M116 80h44M116 96h30M36 128h124M36 144h124M36 160h84" stroke-width="1.5"/>
    <path d="M212 132v40l64 22V110z" fill="${c.paper}"/>
    <path d="M220 172l10 30h20l-8-28M276 110l24-14v102l-24-14"/>
    <path d="M306 138a20 20 0 0 1 0 28" stroke="${c.accent}" stroke-width="3"/>
    <path d="M312 126a36 36 0 0 1 0 52" stroke="${c.accent}" stroke-width="2"/>
  `,
  /** 성적표 — 시상대 */
  podium: (c) => `
    <path d="M20 196h280"/>
    <path d="M60 196v-60h66v60" fill="${c.paper}"/>
    <path d="M126 196v-96h66v96" fill="${c.paper}"/>
    <path d="M192 196v-44h66v44" fill="${c.paper}"/>
    <circle cx="159" cy="124" r="8" fill="${c.accent}" stroke="none"/>
    <circle cx="93" cy="160" r="6"/>
    <circle cx="225" cy="176" r="5" stroke="${c.soft}"/>
    <path d="M141 44h36v20a18 18 0 0 1-36 0z"/>
    <path d="M141 50h-10v8a10 10 0 0 0 10 10M177 50h10v8a10 10 0 0 1-10 10M159 82v10M147 92h24"/>
    <path d="M124 28l7 7M194 28l-7 7M159 18v9" stroke="${c.accent}" stroke-width="2.5"/>
  `,
  /** 마무리 — 등대와 옳은 방향 */
  lighthouseArrow: (c) => `
    <path d="M20 190h130"/>
    <path d="M40 190l10-118h28l10 118M36 72h56M52 72V54h24v18M48 54l16-14 16 14z"/>
    <path d="M49 110h30M47 150h34" stroke-width="1.5"/>
    <circle cx="64" cy="63" r="5" fill="${c.accent}" stroke="none"/>
    <path d="M120 132h168M258 106l30 26-30 26" stroke="${c.accent}" stroke-width="4"/>
  `,
  /** 영어 수업 — 칠판과 책상 */
  classroom: (c) => `
    <rect x="56" y="32" width="208" height="96" rx="4" fill="${c.paper}"/>
    <path d="M80 60h100M80 80h140M80 100h70" stroke-width="1.5"/>
    <path d="M226 62l10 10 20-24" stroke="${c.accent}" stroke-width="3.5"/>
    <path d="M20 196h280"/>
    <rect x="40" y="160" width="60" height="12" rx="2" fill="${c.paper}"/><path d="M46 172v24M94 172v24" stroke-width="1.5"/>
    <rect x="130" y="160" width="60" height="12" rx="2" fill="${c.paper}"/><path d="M136 172v24M184 172v24" stroke-width="1.5"/>
    <rect x="220" y="160" width="60" height="12" rx="2" fill="${c.paper}"/><path d="M226 172v24M274 172v24" stroke-width="1.5"/>
  `,
  /** 계산 — 분수: 위는 적고 아래는 많다 */
  fraction: (c) => {
    let s = `<path d="M60 110h200" stroke-width="3"/>`;
    for (let k = 0; k < 4; k++) s += `<circle cx="${124 + k * 24}" cy="76" r="8" fill="${c.accent}" stroke="none"/>`;
    for (let r = 0; r < 4; r++) for (let k = 0; k < 10; k++) s += `<circle cx="${52 + k * 24}" cy="${136 + r * 24}" r="6"/>`;
    return s;
  },
};

export type ArtName = keyof typeof ART;
export const ART_NAMES = Object.keys(ART) as ArtName[];
export const ART_RATIO = AW / AH;

export function artSvg(
  name: ArtName,
  opts: { width?: number; height?: number; palette?: Palette; stroke?: number } = {},
): string {
  const { palette = WEB, stroke = 2 } = opts;
  const width = opts.width ?? (opts.height ? opts.height * ART_RATIO : AW);
  const height = opts.height ?? width / ART_RATIO;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${AW} ${AH}" width="${width}" height="${height}" ` +
    `fill="none" stroke="${palette.ink}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `${ART[name](palette)}</svg>`
  );
}

/* ══════════════════════════════════════════
 * 공용
 * ══════════════════════════════════════════ */

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** SVG 문자열 → data URL. pptxgenjs addImage({ data }) 에 그대로 넣는다. */
export function svgDataUrl(svg: string): string {
  const compact = svg.replace(/\n\s*/g, "");
  const b64 =
    typeof btoa === "function"
      ? btoa(compact)
      : (globalThis as unknown as { Buffer: { from(s: string): { toString(e: string): string } } }).Buffer.from(compact).toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}
