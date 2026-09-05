/* ═══ 삽화 공용 부품 — 만화 + 인포그래픽 ═══
   대형 출판사 중등 교과서 톤: 둥근 선, 단순한 표정, 라벨과 화살표가 있는 도해.
   모든 함수는 SVG 조각(문자열)을 돌려준다. 좌표는 각 도판의 viewBox 기준. */

const ink = "#2E2C2A";                       // 윤곽선
const esc = s => String(s).replace(/&(?![a-z#])/g, "&amp;")
                          .replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ── 사람: figure.js 의 작화를 그대로 쓴다 ──
   키 150(≈4.3등신), 그림자·명암·손발 포함. hands()/headTop() 은 소품과
   말풍선을 얼굴에 겹치지 않게 놓기 위한 좌표 도우미. */
const { figure } = require("./figure.js");
const person = figure;
/* 손이 모이는 지점 (pose:"hold") */
function hands(o = {}) { const { x = 0, y = 0, s = 1 } = o; return { x: x + 10 * s, y: y - 83 * s }; }
/* 머리 꼭대기 */
function headTop(o = {}) { const { x = 0, y = 0, s = 1 } = o; return { x, y: y - 154 * s }; }

/* ── 말풍선 / 생각풍선 ── */
function bubble(o = {}) {
  const { x = 0, y = 0, w = 160, h = 46, lines = [], c = "#333", fill = "#fff",
          tail = "bl", size = 13, bold = 1, tx = 0 } = o;
  const tails = {
    bl: `M${x + 26} ${y + h} l0 18 l20 -18 z`,
    br: `M${x + w - 46} ${y + h} l20 18 l0 -18 z`,
    tl: `M${x + 26} ${y} l0 -18 l20 18 z`,
    tr: `M${x + w - 46} ${y} l20 -18 l0 18 z`,
    lm: `M${x} ${y + h / 2 - 9} l-18 9 l18 9 z`,
    rm: `M${x + w} ${y + h / 2 - 9} l18 9 l-18 9 z`,
    none: ``,
  };
  const n = lines.length || 1, lh = size * 1.32;
  const y0 = y + h / 2 - ((n - 1) * lh) / 2 + size * 0.36;
  return `<g><path d="${tails[tail] || ""}" fill="${fill}" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(16, h / 2)}" fill="${fill}" stroke="${c}" stroke-width="2.6"/>
    ${lines.map((t, i) => `<text x="${x + w / 2 + tx}" y="${y0 + i * lh}" font-size="${size}" font-weight="${bold ? 800 : 500}" fill="${c}" text-anchor="middle">${esc(t)}</text>`).join("")}
    </g>`;
}
function thought(o = {}) {
  const { x = 0, y = 0, w = 160, h = 50, lines = [], c = "#333", size = 12.5, side = "l" } = o;
  const cx = side === "l" ? x + 26 : x + w - 26, dir = side === "l" ? -1 : 1;
  const n = lines.length || 1, lh = size * 1.3;
  const y0 = y + h / 2 - ((n - 1) * lh) / 2 + size * 0.36;
  return `<g><ellipse cx="${cx + dir * 6}" cy="${y + h + 14}" rx="8" ry="6.5" fill="#fff" stroke="${c}" stroke-width="2.4"/>
    <circle cx="${cx + dir * 18}" cy="${y + h + 27}" r="4.5" fill="#fff" stroke="${c}" stroke-width="2.2"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#fff" stroke="${c}" stroke-width="2.6" stroke-dasharray="9 5"/>
    ${lines.map((t, i) => `<text x="${x + w / 2}" y="${y0 + i * lh}" font-size="${size}" font-weight="700" fill="${c}" text-anchor="middle">${esc(t)}</text>`).join("")}
    </g>`;
}

/* ── 만화 칸 ── */
function panel(o = {}) {
  const { x = 0, y = 0, w = 180, h = 120, c = "#333", fill = "#fff", label = "", n = 0, tint = "#eee" } = o;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${c}" stroke-width="3"/>
    ${n ? `<circle cx="${x + 17}" cy="${y + 17}" r="12" fill="${c}"/>
      <text x="${x + 17}" y="${y + 22}" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">${n}</text>` : ""}
    ${label ? `<text x="${x + w / 2}" y="${y + h + 17}" font-size="11.5" font-weight="800" fill="${c}" text-anchor="middle">${esc(label)}</text>` : ""}
    </g>`;
}

/* ── 인포그래픽 부품 ── */
function arrow(o = {}) {
  const { x1, y1, x2, y2, c = "#333", w = 4, dash = 0, curve = 0 } = o;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const d = curve
    ? `M${x1} ${y1} Q${mx + nx * curve} ${my + ny * curve} ${x2} ${y2}`
    : `M${x1} ${y1} L${x2} ${y2}`;
  const ax = x2 - (dx / len) * 12, ay = y2 - (dy / len) * 12;
  return `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>
    <path d="M${x2} ${y2} L${ax + nx * 7} ${ay + ny * 7} L${ax - nx * 7} ${ay - ny * 7} z" fill="${c}"/>`;
}
function step(o = {}) {
  const { x, y, n, c = "#333", r = 15, label = "", below = 1 } = o;
  return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>
    <text x="${x}" y="${y + r * 0.36}" font-size="${r * 1.05}" font-weight="800" fill="#fff" text-anchor="middle">${n}</text>
    ${label ? `<text x="${x}" y="${below ? y + r + 17 : y - r - 9}" font-size="11.5" font-weight="800" fill="${c}" text-anchor="middle">${esc(label)}</text>` : ""}
    </g>`;
}
function callout(o = {}) {
  const { x, y, tx, ty, text, c = "#333", anchor = "middle", size = 11.5 } = o;
  return `<g><path d="M${x} ${y} L${tx} ${ty}" stroke="${c}" stroke-width="2.2" stroke-dasharray="4 4"/>
    <circle cx="${x}" cy="${y}" r="4.5" fill="${c}"/>
    <text x="${tx}" y="${ty + (ty < y ? -6 : 14)}" font-size="${size}" font-weight="800" fill="${c}" text-anchor="${anchor}">${esc(text)}</text></g>`;
}
function stat(o = {}) {
  const { x, y, big, small, c = "#333", size = 30 } = o;
  return `<g><text x="${x}" y="${y}" font-size="${size}" font-weight="800" fill="${c}" text-anchor="middle">${esc(big)}</text>
    <text x="${x}" y="${y + 17}" font-size="11" font-weight="700" fill="${c}" opacity=".72" text-anchor="middle">${esc(small)}</text></g>`;
}
function tag(o = {}) {
  const { x, y, text, c = "#333", fill = "", size = 11.5, pad = 11 } = o;
  const w = String(text).length * size * 0.62 + pad * 2;
  return `<g><rect x="${x - w / 2}" y="${y - size}" width="${w}" height="${size * 1.9}" rx="${size}" fill="${fill || c}" ${fill ? `stroke="${c}" stroke-width="2.2"` : ""}/>
    <text x="${x}" y="${y + size * 0.42}" font-size="${size}" font-weight="800" fill="${fill ? c : "#fff"}" text-anchor="middle">${esc(text)}</text></g>`;
}
function label(o = {}) {
  const { x, y, text, c = "#333", size = 11.5, anchor = "middle", op = 1, bold = 800 } = o;
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${bold}" fill="${c}" text-anchor="${anchor}" opacity="${op}">${esc(text)}</text>`;
}
function ground(o = {}) {
  const { x1, x2, y, c = "#333", w = 4 } = o;
  return `<path d="M${x1} ${y}h${x2 - x1}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
}
/* 막대 하나 (인포그래픽용) */
function bar(o = {}) {
  const { x, base, h, w = 26, c = "#333", op = 1, cap = "", capc = "" } = o;
  return `<g><rect x="${x - w / 2}" y="${base - h}" width="${w}" height="${h}" rx="5" fill="${c}" opacity="${op}"/>
    ${cap ? `<text x="${x}" y="${base + 16}" font-size="10.5" font-weight="800" fill="${capc || c}" text-anchor="middle">${esc(cap)}</text>` : ""}</g>`;
}
/* ── 소품: 옷 위에 놓여도 읽히도록 흰 바탕 + 윤곽선 ── */
const OL = "#2B2926";
const prop = {
  /* 펼친 책 — 손에 들린 모습 */
  book: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-22-13 q11-4 21 0 v22 q-10-4-21 0z" fill="#fff" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M22-13 q-11-4-21 0 v22 q10-4 21 0z" fill="#fff" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-1-13 v22" stroke="${OL}" stroke-width="2"/>
    <path d="M-17-7h11M-17-2h9M6-7h11M6-2h9" stroke="${c}" stroke-width="1.8" stroke-linecap="round" opacity=".65"/></g>`,
  /* 닫힌 책 (세워 둔 것) */
  bookc: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-11" y="-16" width="22" height="32" rx="2.5" fill="${c}" stroke="${OL}" stroke-width="2"/>
    <path d="M-6-16v32" stroke="#fff" stroke-width="2" opacity=".5"/></g>`,
  screen: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-22" y="-16" width="44" height="32" rx="4" fill="#fff" stroke="${OL}" stroke-width="2.2"/>
    <rect x="-17" y="-11" width="34" height="22" rx="2" fill="${c}" opacity=".85"/>
    <path d="M-8 16h16M0 16v6" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"/></g>`,
  phone: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-10" y="-17" width="20" height="34" rx="4" fill="#fff" stroke="${OL}" stroke-width="2.2"/>
    <rect x="-6" y="-12" width="12" height="22" rx="1.5" fill="${c}" opacity=".8"/></g>`,
  clock: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <circle r="16" fill="#fff" stroke="${OL}" stroke-width="2.4"/>
    <path d="M0-10v11l8 4" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle r="2" fill="${OL}"/></g>`,
  coin: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <circle r="14" fill="${c}" stroke="${OL}" stroke-width="2.2"/>
    <text y="6" font-size="17" font-weight="800" fill="#fff" text-anchor="middle">$</text></g>`,
  bulb: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0-18c8 0 14 6 14 13 0 5-4 8-5 11h-18c-1-3-5-6-5-11 0-7 6-13 14-13z" fill="#FFD86B" stroke="${OL}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M-6 9h12M-4 14h8" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M0-27v5M-16-20l3 4M16-20l-3 4" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/></g>`,
  leaf: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 15C-13 7-13-9 0-17 13-9 13 7 0 15z" fill="${c}" stroke="${OL}" stroke-width="2"/>
    <path d="M0 15V-13" stroke="#fff" stroke-width="1.8" opacity=".8"/></g>`,
  paper: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-14" y="-18" width="28" height="36" rx="2.5" fill="#fff" stroke="${OL}" stroke-width="2"/>
    <path d="M-8-10h16M-8-4h16M-8 2h11" stroke="${c}" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>`,
  cup: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-11-12h22l-2 24q-1 5-9 5t-9-5z" fill="#fff" stroke="${OL}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M11-6q7 1 7 7t-7 7" fill="none" stroke="${OL}" stroke-width="2.2"/>
    <path d="M-8-8h16l-1 6h-14z" fill="${c}"/></g>`,
};

module.exports = { ink, hands, headTop, person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop };
