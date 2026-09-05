/* ═══ 삽화 공용 부품 — 만화 + 인포그래픽 ═══
   대형 출판사 중등 교과서 톤: 둥근 선, 단순한 표정, 라벨과 화살표가 있는 도해.
   모든 함수는 SVG 조각(문자열)을 돌려준다. 좌표는 각 도판의 viewBox 기준. */

const ink = "#2E2C2A";                       // 윤곽선
const esc = s => String(s).replace(/&(?![a-z#])/g, "&amp;")
                          .replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ── 사람 ──────────────────────────────────────────────
   x,y = 발밑 중앙.  s = 키(기본 100 이 사람 하나 높이).            */
const FACE = {
  smile: `<path d="M-5 3q5 5 10 0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  flat:  `<path d="M-5 4h10" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`,
  worry: `<path d="M-5 5q5-5 10 0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  oh:    `<ellipse cx="0" cy="4" rx="3" ry="4" fill="${ink}"/>`,
  glad:  `<path d="M-6 2q6 7 12 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
};
const ARMS = {
  down:  `<path d="M-14 -33c-5 8-8 16-9 24M14 -33c5 8 8 16 9 24" stroke="CC" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  point: `<path d="M-14 -33c-5 8-8 16-9 24M13 -35c10 1 19-1 27-7" stroke="CC" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  up:    `<path d="M-14 -33c-8 3-14 11-16 20M14 -33c8 3 14 11 16 20" stroke="CC" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  think: `<path d="M-14 -33c-5 8-8 16-9 24M13 -33c7 6 11 3 12-6" stroke="CC" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  hold:  `<path d="M-13 -33c-3 8 2 13 8 15M13 -33c3 8-2 13-8 15" stroke="CC" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  open:  `<path d="M-14 -33c-9 2-16 8-19 16M14 -33c9 2 16 8 19 16" stroke="CC" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  wave:  `<path d="M-14 -33c-5 8-8 16-9 24M14 -34c8-3 13-10 14-19" stroke="CC" stroke-width="7" fill="none" stroke-linecap="round"/>`,
};
const HAIR = {
  short: `<path d="M-17 -55c0-11 7-17 17-17s17 6 17 17c-6-6-11-8-17-8s-11 2-17 8z" fill="HH"/>`,
  bun:   `<path d="M-17 -55c0-11 7-17 17-17s17 6 17 17c-6-6-11-8-17-8s-11 2-17 8z" fill="HH"/><circle cx="0" cy="-76" r="7" fill="HH"/>`,
  long:  `<path d="M-17 -55c0-11 7-17 17-17s17 6 17 17v20c0 5-2 8-5 9 1-9 0-19-2-26-7 6-13 6-20 0-2 7-3 17-2 26-3-1-5-4-5-9z" fill="HH"/>`,
  cap:   `<path d="M-18 -62h36a18 18 0 0 0-36 0z" fill="HH"/><path d="M-24 -62h26v5h-26z" fill="HH" opacity=".7"/>`,
  curly: `<path d="M-17 -55c0-11 7-17 17-17s17 6 17 17c-4-4-7-3-9 0-3-4-7-4-9 0-2-4-6-4-9 0-2-3-5-4-7 0z" fill="HH"/>`,
  none:  ``,
};
function person(o = {}) {
  const { x = 0, y = 0, s = 1, c = "#888", face = "smile", arms = "down",
          hair = "short", look = 0, skin = "#F6DCC8", hairc = "" } = o;
  const f = (FACE[face] || FACE.smile);
  const a = (ARMS[arms] || ARMS.down).replace(/CC/g, c);
  const h = (HAIR[hair] || "").replace(/HH/g, hairc || ink);
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${a}
    <path d="M-17 0c0-23 7-37 17-37s17 14 17 37z" fill="${c}"/>
    <path d="M-4 -36h8v6h-8z" fill="${skin}"/>
    <circle cx="0" cy="-51" r="17" fill="${skin}" stroke="${ink}" stroke-width="2.2"/>
    ${h}
    <g transform="translate(${look} -51)">
      <circle cx="-6" cy="-3" r="2.5" fill="${ink}"/><circle cx="6" cy="-3" r="2.5" fill="${ink}"/>
      ${f}
    </g></g>`;
}

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
/* 작은 소품들 */
const prop = {
  book: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-16-11h14v22h-14z" fill="${c}"/><path d="M2-11h14v22H2z" fill="${c}" opacity=".55"/><path d="M-16-11h32M0-11v22" stroke="#fff" stroke-width="1.6" opacity=".6"/></g>`,
  screen: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-20" y="-14" width="40" height="28" rx="4" fill="${c}"/><path d="M-8 14h16M0 14v6" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g>`,
  phone: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-9" y="-16" width="18" height="32" rx="4" fill="${c}"/><path d="M-4-12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`,
  clock: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="15" fill="#fff" stroke="${c}" stroke-width="3.4"/><path d="M0-9v10l7 4" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  coin: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="13" fill="${c}"/><text y="5" font-size="16" font-weight="800" fill="#fff" text-anchor="middle">$</text></g>`,
  bulb: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-16c7 0 12 5 12 11 0 5-4 7-5 11h-14c-1-4-5-6-5-11 0-6 5-11 12-11z" fill="${c}"/><path d="M-6 10h12M-4 15h8" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/></g>`,
  leaf: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 14C-12 6-12-8 0-16 12-8 12 6 0 14z" fill="${c}"/><path d="M0 14V-12" stroke="#fff" stroke-width="1.8" opacity=".7"/></g>`,
};


/* 손 위치 도우미 — arms:"hold" 일 때 두 손이 모이는 지점.
   소품을 얼굴이 아니라 가슴 앞에 놓기 위해 쓴다. */
function hands(o = {}) { const { x = 0, y = 0, s = 1 } = o; return { x, y: y - 18 * s }; }
/* 머리 꼭대기 — 말풍선 꼬리를 겹치지 않게 놓기 위해 쓴다. */
function headTop(o = {}) { const { x = 0, y = 0, s = 1 } = o; return { x, y: y - 68 * s }; }

module.exports = { ink, hands, headTop, person, bubble, thought, panel, arrow, step, callout, stat, tag, label, ground, bar, prop };
