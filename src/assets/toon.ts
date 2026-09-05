/**
 * 만화풍 삽화 세트 — 잉크 외곽선 + 파스텔 채색.
 *
 * 웹에서는 CSS 토큰(var(--t-*))으로 색을 받아 다크 모드에서도 따라간다.
 * 캐릭터(학생·선생님·등대 마스코트), 장면(챕터 머리), 스티커(별·말풍선)로 나뉜다.
 * 글자는 그림 안에 넣지 않는다. 문양(crest) 하나만 예외로 학교 이름 두 글자를 쓴다.
 */

export interface ToonPalette {
  ink: string;
  sky: string;
  mint: string;
  coral: string;
  lav: string;
  orange: string;
  pink: string;
  yellow: string;
  skin: string;
  hair: string;
  paper: string;
  white: string;
  soft: string;
}

export const TOON_WEB: ToonPalette = {
  ink: "var(--t-ink)",
  sky: "var(--t-sky)",
  mint: "var(--t-mint)",
  coral: "var(--t-coral)",
  lav: "var(--t-lav)",
  orange: "var(--t-orange)",
  pink: "var(--t-pink)",
  yellow: "var(--t-yellow)",
  skin: "var(--t-skin)",
  hair: "var(--t-hair)",
  paper: "var(--t-paper)",
  white: "var(--t-white)",
  soft: "var(--t-soft)",
};

export const TOON_PPT: ToonPalette = {
  ink: "#2B2A33",
  sky: "#7CC6FF",
  mint: "#7FE0C3",
  coral: "#FF8A80",
  lav: "#C9B8FF",
  orange: "#FFB347",
  pink: "#FFB6D9",
  yellow: "#FFD400",
  skin: "#FFE0C2",
  hair: "#4A3B32",
  paper: "#FFF8E7",
  white: "#FFFFFF",
  soft: "#EAE6F2",
};

type Draw = (c: ToonPalette) => string;
const SW = 2.5;

/* ══════════════════════════════════════════
 * 캐릭터 (120×160 상자, 왼쪽 위 원점)
 * ══════════════════════════════════════════ */

function face(c: ToonPalette, cx: number, cy: number, r: number, mouth: "smile" | "open" | "grin" = "smile") {
  const eye = r * 0.11;
  const m =
    mouth === "open"
      ? `<ellipse cx="${cx}" cy="${cy + r * 0.45}" rx="${r * 0.22}" ry="${r * 0.28}" fill="${c.ink}"/><ellipse cx="${cx}" cy="${cy + r * 0.52}" rx="${r * 0.13}" ry="${r * 0.12}" fill="${c.coral}"/>`
      : mouth === "grin"
        ? `<path d="M${cx - r * 0.32} ${cy + r * 0.38} Q${cx} ${cy + r * 0.85} ${cx + r * 0.32} ${cy + r * 0.38} Z" fill="${c.white}" stroke="${c.ink}"/>`
        : `<path d="M${cx - r * 0.28} ${cy + r * 0.42} Q${cx} ${cy + r * 0.72} ${cx + r * 0.28} ${cy + r * 0.42}" fill="none" stroke="${c.ink}"/>`;
  return `<circle cx="${cx - r * 0.36}" cy="${cy + r * 0.05}" r="${eye}" fill="${c.ink}" stroke="none"/><circle cx="${cx + r * 0.36}" cy="${cy + r * 0.05}" r="${eye}" fill="${c.ink}" stroke="none"/>
  <circle cx="${cx - r * 0.55}" cy="${cy + r * 0.35}" r="${r * 0.14}" fill="${c.pink}" stroke="none" opacity=".85"/><circle cx="${cx + r * 0.55}" cy="${cy + r * 0.35}" r="${r * 0.14}" fill="${c.pink}" stroke="none" opacity=".85"/>${m}`;
}

/** 팔·다리: 잉크 굵은 선 위에 살색 선 */
function limb(c: ToonPalette, d: string, color: string, w = 7) {
  return `<path d="${d}" stroke="${c.ink}" stroke-width="${w + 4}" fill="none"/><path d="${d}" stroke="${color}" stroke-width="${w}" fill="none"/>`;
}

/** 여학생 — 포니테일, 노란 가방, 손 흔들기 */
export function girl(c: ToonPalette): string {
  return `
  <rect x="26" y="92" width="16" height="32" rx="7" fill="${c.yellow}" stroke="${c.ink}"/>
  ${limb(c, "M42 98 Q28 112 30 128", c.skin)}
  ${limb(c, "M80 98 Q98 84 100 66", c.skin)}
  <circle cx="102" cy="63" r="6" fill="${c.skin}" stroke="${c.ink}"/>
  <path d="M40 84 h40 a12 12 0 0 1 12 12 v30 H28 V96 a12 12 0 0 1 12-12z" fill="${c.sky}" stroke="${c.ink}"/>
  <path d="M36 126 Q60 134 84 126 L90 148 Q60 156 30 148z" fill="${c.coral}" stroke="${c.ink}"/>
  ${limb(c, "M52 148 v12", c.skin)}${limb(c, "M68 148 v12", c.skin)}
  <ellipse cx="51" cy="162" rx="9" ry="4.5" fill="${c.ink}"/><ellipse cx="69" cy="162" rx="9" ry="4.5" fill="${c.ink}"/>
  <ellipse cx="60" cy="52" rx="36" ry="34" fill="${c.hair}" stroke="${c.ink}"/>
  <path d="M88 44 Q116 38 110 80 Q100 62 86 62z" fill="${c.hair}" stroke="${c.ink}"/>
  <circle cx="60" cy="58" r="28" fill="${c.skin}" stroke="${c.ink}"/>
  <path d="M32 54 Q38 24 60 26 Q82 24 88 54 Q78 40 60 42 Q42 40 32 54z" fill="${c.hair}" stroke="${c.ink}"/>
  <circle cx="86" cy="44" r="5" fill="${c.yellow}" stroke="${c.ink}"/>
  ${face(c, 60, 58, 28, "smile")}`;
}

/** 남학생 — 모자, 책 들고 */
export function boy(c: ToonPalette): string {
  return `
  ${limb(c, "M42 98 Q30 112 40 124", c.skin)}
  ${limb(c, "M80 98 Q92 112 80 124", c.skin)}
  <path d="M40 84 h40 a12 12 0 0 1 12 12 v30 H28 V96 a12 12 0 0 1 12-12z" fill="${c.mint}" stroke="${c.ink}"/>
  <rect x="42" y="108" width="36" height="26" rx="3" fill="${c.white}" stroke="${c.ink}"/>
  <path d="M60 108 v26 M48 116 h8 M48 122 h8 M64 116 h8 M64 122 h8" stroke="${c.ink}" stroke-width="1.6"/>
  <path d="M30 126 H90 V146 H30z" fill="${c.lav}" stroke="${c.ink}"/>
  ${limb(c, "M50 146 v14", c.skin)}${limb(c, "M70 146 v14", c.skin)}
  <ellipse cx="49" cy="162" rx="9" ry="4.5" fill="${c.ink}"/><ellipse cx="71" cy="162" rx="9" ry="4.5" fill="${c.ink}"/>
  <circle cx="60" cy="58" r="28" fill="${c.skin}" stroke="${c.ink}"/>
  <path d="M34 52 Q40 30 60 30 Q80 30 86 52 Q74 46 60 48 Q46 46 34 52z" fill="${c.hair}" stroke="${c.ink}"/>
  <path d="M30 42 Q60 18 90 42 Q60 36 30 42z" fill="${c.coral}" stroke="${c.ink}"/>
  <path d="M28 42 h64 a4 4 0 0 1 0 8 h-64 a4 4 0 0 1 0-8z" fill="${c.coral}" stroke="${c.ink}"/>
  <path d="M92 46 h16 a4 4 0 0 1 0 8 H92z" fill="${c.coral}" stroke="${c.ink}"/>
  ${face(c, 60, 62, 26, "grin")}`;
}

/** 선생님 — 안경, 지시봉 */
export function teacher(c: ToonPalette): string {
  return `
  ${limb(c, "M42 98 Q28 116 34 130", c.skin)}
  ${limb(c, "M80 98 Q104 92 108 74", c.skin)}
  <path d="M104 78 L118 40" stroke="${c.ink}" stroke-width="3"/>
  <circle cx="118" cy="38" r="4" fill="${c.yellow}" stroke="${c.ink}"/>
  <path d="M40 84 h40 a12 12 0 0 1 12 12 v34 H28 V96 a12 12 0 0 1 12-12z" fill="${c.lav}" stroke="${c.ink}"/>
  <path d="M52 84 L60 100 L68 84" fill="${c.white}" stroke="${c.ink}"/>
  <path d="M30 130 H90 V150 H30z" fill="${c.ink}" stroke="${c.ink}"/>
  ${limb(c, "M50 150 v10", c.skin)}${limb(c, "M70 150 v10", c.skin)}
  <ellipse cx="49" cy="162" rx="9" ry="4.5" fill="${c.ink}"/><ellipse cx="71" cy="162" rx="9" ry="4.5" fill="${c.ink}"/>
  <circle cx="60" cy="58" r="28" fill="${c.skin}" stroke="${c.ink}"/>
  <path d="M32 56 Q34 26 60 28 Q86 26 88 56 Q80 44 60 44 Q40 44 32 56z" fill="${c.hair}" stroke="${c.ink}"/>
  <circle cx="60" cy="24" r="9" fill="${c.hair}" stroke="${c.ink}"/>
  <circle cx="48" cy="62" r="9" fill="${c.white}" fill-opacity=".6" stroke="${c.ink}"/><circle cx="72" cy="62" r="9" fill="${c.white}" fill-opacity=".6" stroke="${c.ink}"/><path d="M57 62 h6" stroke="${c.ink}"/>
  ${face(c, 60, 60, 26, "smile")}`;
}

/** 등대 마스코트 — 얼굴 있는 등대 */
export function lighthouseMascot(c: ToonPalette): string {
  return `
  <path d="M34 160 L44 60 H76 L86 160z" fill="${c.white}" stroke="${c.ink}"/>
  <path d="M42 80 H78 M40 104 H80 M38 128 H82" stroke="${c.ink}" stroke-width="1.5"/>
  <path d="M44 80 L42 92 H78 L76 80z M42 104 L40 116 H80 L78 104z M40 128 L38 140 H82 L80 128z" fill="${c.coral}" stroke="${c.ink}"/>
  <rect x="38" y="52" width="44" height="10" rx="3" fill="${c.ink}"/>
  <rect x="46" y="30" width="28" height="24" rx="4" fill="${c.yellow}" stroke="${c.ink}"/>
  <path d="M42 30 L60 12 L78 30z" fill="${c.coral}" stroke="${c.ink}"/>
  <circle cx="60" cy="10" r="4" fill="${c.yellow}" stroke="${c.ink}"/>
  <path d="M80 36 L110 26 M80 44 L112 46" stroke="${c.yellow}" stroke-width="4"/>
  ${limb(c, "M42 112 Q22 118 24 134", c.white, 6)}
  ${limb(c, "M78 112 Q100 104 104 90", c.white, 6)}
  <ellipse cx="60" cy="163" rx="34" ry="6" fill="${c.sky}" stroke="${c.ink}"/>
  ${face(c, 60, 98, 20, "open")}`;
}

/* ══════════════════════════════════════════
 * 스티커
 * ══════════════════════════════════════════ */

export const STICKERS: Record<string, Draw> = {
  star: (c) => `<path d="M60 8 L74 44 L112 46 L82 70 L92 108 L60 86 L28 108 L38 70 L8 46 L46 44z" fill="${c.yellow}" stroke="${c.ink}"/>`,
  sparkle: (c) => `<path d="M60 6 Q66 54 114 60 Q66 66 60 114 Q54 66 6 60 Q54 54 60 6z" fill="${c.yellow}" stroke="${c.ink}"/>`,
  heart: (c) => `<path d="M60 108 L18 66 A24 24 0 0 1 60 34 A24 24 0 0 1 102 66z" fill="${c.coral}" stroke="${c.ink}"/>`,
  bubble: (c) => `<path d="M16 22 h88 a12 12 0 0 1 12 12 v44 a12 12 0 0 1 -12 12 H52 L30 108 V90 H16 A12 12 0 0 1 4 78 V34 a12 12 0 0 1 12-12z" fill="${c.white}" stroke="${c.ink}"/><circle cx="42" cy="56" r="5" fill="${c.ink}"/><circle cx="60" cy="56" r="5" fill="${c.ink}"/><circle cx="78" cy="56" r="5" fill="${c.ink}"/>`,
  medal: (c) => `<path d="M40 8 H80 L70 50 H50z" fill="${c.coral}" stroke="${c.ink}"/><circle cx="60" cy="76" r="32" fill="${c.yellow}" stroke="${c.ink}"/><circle cx="60" cy="76" r="22" fill="${c.orange}" stroke="${c.ink}"/><path d="M60 60 L65 72 L78 73 L68 81 L71 94 L60 87 L49 94 L52 81 L42 73 L55 72z" fill="${c.white}" stroke="${c.ink}"/>`,
  check: (c) => `<circle cx="60" cy="60" r="50" fill="${c.mint}" stroke="${c.ink}"/><path d="M34 62 L52 80 L88 42" fill="none" stroke="${c.ink}" stroke-width="8"/>`,
  bolt: (c) => `<path d="M68 6 L28 68 H58 L50 114 L94 46 H64z" fill="${c.yellow}" stroke="${c.ink}"/>`,
  cloud: (c) => `<path d="M30 90 a20 20 0 0 1 8-38 a26 26 0 0 1 48-8 a22 22 0 0 1 24 40 H30z" fill="${c.white}" stroke="${c.ink}"/>`,
  sun: (c) => `<circle cx="60" cy="60" r="26" fill="${c.yellow}" stroke="${c.ink}"/><path d="M60 10v14M60 96v14M10 60h14M96 60h14M25 25l10 10M85 85l10 10M95 25l-10 10M35 85l-10 10" stroke="${c.ink}" stroke-width="3"/>`,
  pin: (c) => `<path d="M60 112 C60 112 24 70 24 44 A36 36 0 0 1 96 44 C96 70 60 112 60 112z" fill="${c.coral}" stroke="${c.ink}"/><circle cx="60" cy="44" r="14" fill="${c.white}" stroke="${c.ink}"/>`,
  flag: (c) => `<path d="M30 8 V112" stroke="${c.ink}" stroke-width="4"/><path d="M32 12 H100 L86 34 L100 56 H32z" fill="${c.coral}" stroke="${c.ink}"/>`,
  seat: (c) => `<rect x="26" y="20" width="68" height="46" rx="12" fill="${c.sky}" stroke="${c.ink}"/><rect x="18" y="62" width="84" height="22" rx="8" fill="${c.lav}" stroke="${c.ink}"/><path d="M30 84v22M90 84v22" stroke="${c.ink}" stroke-width="5"/>`,
  paper: (c) => `<path d="M28 10 H76 L100 34 V112 H28z" fill="${c.white}" stroke="${c.ink}"/><path d="M76 10 V34 H100" fill="${c.soft}" stroke="${c.ink}"/><path d="M42 54h40M42 68h40M42 82h26" stroke="${c.ink}" stroke-width="3"/><circle cx="82" cy="90" r="12" fill="${c.yellow}" stroke="${c.ink}"/>`,
  trophy: (c) => `<path d="M34 12 H86 V48 A26 26 0 0 1 34 48z" fill="${c.yellow}" stroke="${c.ink}"/><path d="M34 20 H18 V34 A16 16 0 0 0 34 50 M86 20 H102 V34 A16 16 0 0 1 86 50" fill="none" stroke="${c.ink}"/><path d="M60 74 V90 M40 108 H80 V96 H40z" fill="${c.orange}" stroke="${c.ink}"/><path d="M52 30 L60 24 L68 30 L60 36z" fill="${c.white}" stroke="${c.ink}"/>`,
};

/* ══════════════════════════════════════════
 * 장면 (320×220)
 * ══════════════════════════════════════════ */

const AW = 320;
const AH = 220;

function school(c: ToonPalette, x: number, y: number, w: number, h: number, roof: string, wall = c.white) {
  const cols = Math.max(2, Math.floor(w / 26));
  let win = "";
  for (let r = 0; r < Math.floor((h - 30) / 26); r++)
    for (let k = 0; k < cols; k++) win += `<rect x="${x + 10 + k * ((w - 20 - 12) / (cols - 1))}" y="${y + 12 + r * 26}" width="12" height="14" rx="3" fill="${c.sky}" stroke="${c.ink}" stroke-width="1.8"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${wall}" stroke="${c.ink}"/>
  <path d="M${x - 8} ${y} L${x + w / 2} ${y - 26} L${x + w + 8} ${y}z" fill="${roof}" stroke="${c.ink}"/>
  <rect x="${x + w / 2 - 9}" y="${y + h - 24}" width="18" height="24" rx="4" fill="${c.orange}" stroke="${c.ink}"/>
  ${win}
  <path d="M${x + w / 2} ${y - 26} V${y - 44} h16 l-5 5 5 5 h-16" fill="${c.yellow}" stroke="${c.ink}" stroke-width="2"/>`;
}
function cloud(c: ToonPalette, x: number, y: number, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 24 a12 12 0 0 1 6-22 a16 16 0 0 1 30-4 a14 14 0 0 1 14 26z" fill="${c.white}" stroke="${c.ink}" stroke-width="${SW / s}"/></g>`;
}
function ground(c: ToonPalette, y = 200) {
  return `<path d="M0 ${y} Q80 ${y - 6} 160 ${y} T320 ${y} V220 H0z" fill="${c.mint}" stroke="none" opacity=".55"/><path d="M0 ${y} Q80 ${y - 6} 160 ${y} T320 ${y}" fill="none" stroke="${c.ink}"/>`;
}
function put(inner: string, x: number, y: number, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
}
function sticker(name: keyof typeof STICKERS, c: ToonPalette, x: number, y: number, s = 0.3) {
  return put(STICKERS[name](c), x, y, s);
}

export const SCENES: Record<string, Draw> = {
  /** 히어로 — 학교 가는 길 */
  hero: (c) => `
    ${sticker("sun", c, 250, 6, 0.42)}
    ${cloud(c, 40, 30, 1)}${cloud(c, 190, 52, 0.7)}
    ${ground(c, 196)}
    ${school(c, 168, 96, 112, 100, c.coral)}
    ${put(lighthouseMascot(c), 70, 40, 0.95)}
    ${put(girl(c), 130, 72, 0.78)}
    ${put(boy(c), 20, 76, 0.78)}
    ${sticker("sparkle", c, 150, 40, 0.16)}${sticker("sparkle", c, 292, 70, 0.12)}
  `,
  /** 분모 — 물 위엔 조금, 아래는 크다 */
  numbers: (c) => `
    ${cloud(c, 30, 20, 0.7)}${cloud(c, 240, 30, 0.6)}
    <path d="M0 100 Q40 92 80 100 T160 100 T240 100 T320 100 V220 H0z" fill="${c.sky}" opacity=".6"/>
    <path d="M0 100 Q40 92 80 100 T160 100 T240 100 T320 100" fill="none" stroke="${c.ink}"/>
    <path d="M132 100 L156 52 L176 76 L188 66 L210 100z" fill="${c.white}" stroke="${c.ink}"/>
    <path d="M132 100 L98 140 L146 192 L206 206 L258 150 L210 100" fill="${c.white}" fill-opacity=".85" stroke="${c.ink}" stroke-dasharray="7 5"/>
    ${sticker("sparkle", c, 150, 30, 0.14)}
    ${put(boy(c), 26, 20, 0.5)}
    <rect x="40" y="120" width="20" height="8" rx="4" fill="${c.coral}" stroke="${c.ink}"/><path d="M50 128 V150" stroke="${c.ink}" stroke-width="2"/>
  `,
  /** 나란히 — 세 학교 */
  compare: (c) => `
    ${cloud(c, 30, 24, 0.8)}${cloud(c, 230, 18, 0.6)}
    ${ground(c, 200)}
    ${school(c, 20, 118, 84, 82, c.coral)}
    ${school(c, 118, 100, 84, 100, c.lav)}
    ${school(c, 216, 128, 84, 72, c.orange)}
    <path d="M62 92 L160 74 L258 102" fill="none" stroke="${c.yellow}" stroke-width="4"/>
    <circle cx="62" cy="92" r="6" fill="${c.yellow}" stroke="${c.ink}"/><circle cx="160" cy="74" r="6" fill="${c.yellow}" stroke="${c.ink}"/><circle cx="258" cy="102" r="6" fill="${c.yellow}" stroke="${c.ink}"/>
  `,
  /** 성취도 — 계단 위 깃발 */
  achieve: (c) => `
    ${cloud(c, 20, 18, 0.7)}
    ${ground(c, 204)}
    <rect x="40" y="150" width="60" height="54" rx="8" fill="${c.sky}" stroke="${c.ink}"/>
    <rect x="108" y="118" width="60" height="86" rx="8" fill="${c.mint}" stroke="${c.ink}"/>
    <rect x="176" y="78" width="60" height="126" rx="8" fill="${c.yellow}" stroke="${c.ink}"/>
    <rect x="244" y="126" width="60" height="78" rx="8" fill="${c.lav}" stroke="${c.ink}"/>
    ${put(girl(c), 176, -8, 0.5)}
    ${sticker("flag", c, 232, 34, 0.26)}
    ${sticker("sparkle", c, 150, 60, 0.14)}${sticker("sparkle", c, 270, 90, 0.11)}
  `,
  /** 시험지 */
  paper: (c) => `
    ${cloud(c, 220, 20, 0.6)}
    ${put(STICKERS.paper(c), 60, 20, 1.5)}
    ${put(boy(c), 200, 52, 0.85)}
    <path d="M112 192 L172 132 L188 148 L128 208 z" fill="${c.yellow}" stroke="${c.ink}"/><path d="M112 192 L108 212 L128 208z" fill="${c.skin}" stroke="${c.ink}"/><path d="M172 132 L188 148" stroke="${c.ink}"/>
    ${sticker("sparkle", c, 40, 150, 0.16)}
  `,
  /** 자리 — 강당 의자, 앞줄 셋만 노랗다 */
  seats: (c) => {
    let s = `<rect x="30" y="18" width="260" height="14" rx="7" fill="${c.coral}" stroke="${c.ink}"/>`;
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 7; k++) {
        const x = 36 + k * 36;
        const y = 54 + r * 40;
        const hot = r === 0 && k < 3;
        s += `<rect x="${x}" y="${y}" width="26" height="20" rx="6" fill="${hot ? c.yellow : c.sky}" stroke="${c.ink}"/><rect x="${x - 2}" y="${y + 16}" width="30" height="8" rx="4" fill="${hot ? c.orange : c.lav}" stroke="${c.ink}"/>`;
        if (hot) s += `<path d="M${x + 13} ${y - 10} l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="${c.yellow}" stroke="${c.ink}" stroke-width="1.5"/>`;
      }
    return s;
  },
  /** 진로 — 갈림길과 깃발 */
  paths: (c) => `
    ${cloud(c, 200, 14, 0.6)}
    ${ground(c, 206)}
    ${school(c, 22, 120, 76, 86, c.coral)}
    <path d="M98 176 C150 176 170 60 250 60" fill="none" stroke="${c.ink}" stroke-width="12"/><path d="M98 176 C150 176 170 60 250 60" fill="none" stroke="${c.yellow}" stroke-width="7" stroke-dasharray="10 8"/>
    <path d="M98 180 C160 180 180 116 252 116" fill="none" stroke="${c.ink}" stroke-width="12"/><path d="M98 180 C160 180 180 116 252 116" fill="none" stroke="${c.sky}" stroke-width="7"/>
    <path d="M98 184 C160 186 180 170 252 170" fill="none" stroke="${c.ink}" stroke-width="12"/><path d="M98 184 C160 186 180 170 252 170" fill="none" stroke="${c.mint}" stroke-width="7"/>
    ${sticker("pin", c, 246, 14, 0.3)}${sticker("pin", c, 248, 70, 0.3)}${sticker("pin", c, 248, 124, 0.3)}
    ${put(girl(c), 100, 96, 0.5)}
  `,
  /** 영어 수업 — 칠판과 선생님 */
  classroom: (c) => `
    <rect x="30" y="24" width="200" height="110" rx="10" fill="${c.mint}" stroke="${c.ink}"/>
    <rect x="42" y="36" width="176" height="86" rx="6" fill="${c.ink}" opacity=".85"/>
    <path d="M58 60 h70 M58 78 h100 M58 96 h50" stroke="${c.white}" stroke-width="3" opacity=".9"/>
    <path d="M170 96 l10 10 18-24" fill="none" stroke="${c.yellow}" stroke-width="5"/>
    ${put(teacher(c), 218, 40, 0.9)}
    ${ground(c, 206)}
    <rect x="40" y="160" width="70" height="14" rx="6" fill="${c.lav}" stroke="${c.ink}"/><path d="M48 174v26M102 174v26" stroke="${c.ink}" stroke-width="4"/>
    <rect x="130" y="160" width="70" height="14" rx="6" fill="${c.lav}" stroke="${c.ink}"/><path d="M138 174v26M192 174v26" stroke="${c.ink}" stroke-width="4"/>
  `,
  /** 성적표 — 트로피와 색종이 */
  scoreboard: (c) => `
    ${put(STICKERS.trophy(c), 90, 30, 1.3)}
    ${sticker("star", c, 40, 30, 0.24)}${sticker("star", c, 250, 40, 0.2)}${sticker("sparkle", c, 60, 140, 0.16)}${sticker("sparkle", c, 246, 130, 0.14)}
    <path d="M30 100 l8 -6 M292 90 l-8 8 M52 190 l8 -8 M266 186 l8 8" stroke="${c.coral}" stroke-width="4"/>
    <rect x="30" y="60" width="10" height="16" rx="2" fill="${c.sky}" stroke="${c.ink}" transform="rotate(20 35 68)"/><rect x="280" y="150" width="10" height="16" rx="2" fill="${c.lav}" stroke="${c.ink}" transform="rotate(-30 285 158)"/><rect x="60" y="170" width="10" height="16" rx="2" fill="${c.coral}" stroke="${c.ink}" transform="rotate(40 65 178)"/>
    ${ground(c, 206)}
  `,
  /** 들여다보기 — 확대경 든 학생 */
  zoom: (c) => `
    ${cloud(c, 210, 16, 0.6)}
    ${ground(c, 204)}
    ${school(c, 30, 104, 120, 100, c.lav)}
    <circle cx="190" cy="108" r="48" fill="${c.sky}" fill-opacity=".45" stroke="${c.ink}" stroke-width="5"/>
    <circle cx="190" cy="108" r="48" fill="none" stroke="${c.white}" stroke-width="2" stroke-dasharray="2 10"/>
    <path d="M224 144 L262 182" stroke="${c.ink}" stroke-width="12"/><path d="M224 144 L262 182" stroke="${c.coral}" stroke-width="7"/>
    <rect x="166" y="84" width="48" height="48" rx="6" fill="${c.white}" stroke="${c.ink}"/><path d="M190 84v48M166 108h48" stroke="${c.ink}"/>
    ${put(girl(c), 232, 50, 0.7)}
  `,
  /** TMI — 두 학생과 말풍선 */
  tmi: (c) => `
    ${put(boy(c), 30, 60, 0.85)}
    ${put(girl(c), 190, 60, 0.85)}
    <path d="M110 30 h90 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 H150 L134 104 V88 H110 a12 12 0 0 1 -12 -12 V42 a12 12 0 0 1 12-12z" fill="${c.white}" stroke="${c.ink}"/>
    <rect x="128" y="46" width="52" height="22" rx="4" fill="${c.yellow}" stroke="${c.ink}"/><path d="M128 57h52M154 46v22" stroke="${c.ink}"/>
    <path d="M226 116 h70 a10 10 0 0 1 10 10 v26 a10 10 0 0 1 -10 10 H262 L250 174 V162 H226 a10 10 0 0 1 -10-10 V126 a10 10 0 0 1 10-10z" fill="${c.mint}" stroke="${c.ink}"/>
    <path d="M232 156 h10 v-8 h10 v-8 h10 v-8 h10 v-8 h10" fill="none" stroke="${c.ink}" stroke-width="3"/>
    ${sticker("heart", c, 150, 4, 0.16)}
    ${ground(c, 206)}
  `,
  /** 학교 소식 — 신문과 확성기 */
  news: (c) => `
    <path d="M26 44 H186 V176 H44 a18 18 0 0 1 -18 -18z" fill="${c.white}" stroke="${c.ink}"/>
    <path d="M186 64 H216 V158 a18 18 0 0 1 -18 18" fill="${c.soft}" stroke="${c.ink}"/>
    <rect x="44" y="62" width="64" height="50" rx="6" fill="${c.sky}" stroke="${c.ink}"/>
    <path d="M120 66 h50 M120 82 h50 M120 98 h30 M44 128 h126 M44 144 h126 M44 160 h86" stroke="${c.ink}" stroke-width="3"/>
    <path d="M214 128 v40 l62 22 V106z" fill="${c.coral}" stroke="${c.ink}"/>
    <path d="M222 168 l10 30 h20 l-8 -28" fill="${c.orange}" stroke="${c.ink}"/>
    <path d="M276 106 l24 -14 v100 l-24 -14" fill="${c.orange}" stroke="${c.ink}"/>
    <path d="M306 136 a20 20 0 0 1 0 26" fill="none" stroke="${c.yellow}" stroke-width="5"/><path d="M312 124 a36 36 0 0 1 0 50" fill="none" stroke="${c.yellow}" stroke-width="3"/>
  `,
  /** 마무리 — 마스코트가 방향을 가리킨다 */
  closing: (c) => `
    ${cloud(c, 40, 20, 0.7)}${cloud(c, 240, 28, 0.5)}
    ${ground(c, 200)}
    ${put(lighthouseMascot(c), 40, 26, 1.05)}
    <path d="M170 128 H270 M244 100 l30 28 -30 28" fill="none" stroke="${c.ink}" stroke-width="14"/><path d="M170 128 H268 M244 102 l28 26 -28 26" fill="none" stroke="${c.yellow}" stroke-width="8"/>
    ${sticker("sparkle", c, 280, 60, 0.14)}${sticker("sparkle", c, 180, 60, 0.12)}
  `,
  /** 빈 상태 — 빈 상자 든 학생 */
  empty: (c) => `
    ${put(boy(c), 100, 30, 0.9)}
    <path d="M60 150 H180 L170 200 H70z" fill="${c.orange}" stroke="${c.ink}"/><path d="M60 150 L44 130 H120 L130 150 M180 150 L196 130 H120" fill="${c.yellow}" stroke="${c.ink}"/>
    <path d="M210 90 h60 a10 10 0 0 1 10 10 v26 a10 10 0 0 1 -10 10 H240 L228 148 V136 H210 a10 10 0 0 1 -10-10 V100 a10 10 0 0 1 10-10z" fill="${c.white}" stroke="${c.ink}"/>
    <path d="M232 106 q8 -10 16 0 M240 112 v10" fill="none" stroke="${c.ink}" stroke-width="3"/><circle cx="240" cy="128" r="2.4" fill="${c.ink}"/>
    ${ground(c, 206)}
  `,
  /** 계산기 — 분수 */
  fraction: (c) => `
    <rect x="70" y="20" width="180" height="180" rx="22" fill="${c.white}" stroke="${c.ink}"/>
    <path d="M100 110 H220" stroke="${c.ink}" stroke-width="5"/>
    <circle cx="130" cy="72" r="14" fill="${c.yellow}" stroke="${c.ink}"/><circle cx="160" cy="72" r="14" fill="${c.yellow}" stroke="${c.ink}"/><circle cx="190" cy="72" r="14" fill="${c.yellow}" stroke="${c.ink}"/>
    ${[0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((k) => `<circle cx="${112 + k * 24}" cy="${136 + r * 26}" r="9" fill="${c.sky}" stroke="${c.ink}"/>`).join("")).join("")}
    ${put(girl(c), 232, 90, 0.55)}
  `,
};

export type SceneName = keyof typeof SCENES;
export type CharacterName = "girl" | "boy" | "teacher" | "lighthouse";
export type StickerName = keyof typeof STICKERS;

const wrap = (inner: string, vb: string, w: number | string, h: number | string, c: ToonPalette) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" fill="none" stroke="${c.ink}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export function sceneSvg(name: SceneName, o: { width?: number | string; height?: number | string; palette?: ToonPalette } = {}) {
  const c = o.palette ?? TOON_WEB;
  return wrap(SCENES[name](c), `0 0 ${AW} ${AH}`, o.width ?? AW, o.height ?? AH, c);
}

export function characterSvg(name: CharacterName, o: { height?: number | string; palette?: ToonPalette } = {}) {
  const c = o.palette ?? TOON_WEB;
  const inner = name === "girl" ? girl(c) : name === "boy" ? boy(c) : name === "teacher" ? teacher(c) : lighthouseMascot(c);
  const h = o.height ?? 160;
  const w = typeof h === "number" ? (h * 120) / 168 : h;
  return wrap(inner, "0 0 120 168", w, h, c);
}

export function stickerSvg(name: StickerName, o: { size?: number | string; palette?: ToonPalette } = {}) {
  const c = o.palette ?? TOON_WEB;
  return wrap(STICKERS[name](c), "0 0 120 120", o.size ?? 120, o.size ?? 120, c);
}

/* ══════════════════════════════════════════
 * 문양(로고 대체) — 학교 이름 두 글자
 * ══════════════════════════════════════════ */

const CREST_FILLS: (keyof ToonPalette)[] = ["sky", "mint", "coral", "lav", "orange", "pink", "yellow"];

export function crestSvg(name: string, o: { size?: number | string; palette?: ToonPalette } = {}) {
  const c = o.palette ?? TOON_WEB;
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const fill = c[CREST_FILLS[h % CREST_FILLS.length]];
  const short = name.replace(/(고등학교|중학교|외국어고등학교|국제고등학교)$/, "").replace(/여자$/, "여");
  const label = short.slice(0, 2);
  const size = o.size ?? 120;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">` +
    `<path d="M60 8 L104 24 V60 C104 88 84 104 60 114 C36 104 16 88 16 60 V24z" fill="${fill}" stroke="${c.ink}" stroke-width="${SW}" stroke-linejoin="round"/>` +
    `<path d="M60 20 L94 32 V60 C94 80 80 93 60 101 C40 93 26 80 26 60 V32z" fill="${c.white}" fill-opacity=".55" stroke="none"/>` +
    `<text x="60" y="${label.length > 1 ? 74 : 76}" text-anchor="middle" font-family="Jua, 'Noto Sans KR', sans-serif" font-size="${label.length > 1 ? 30 : 40}" fill="${c.ink}">${label}</text></svg>`
  );
}
