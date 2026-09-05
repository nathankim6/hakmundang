/* ═══ 인물 작화 ═══
   발밑 중앙이 원점. 키 150 기준(≈4.3등신, 교과서 삽화 비례).
   머리 -153~-119 · 목 -122~-112 · 어깨 -112 · 허리 -60 · 발 0
   레이어: 그림자 → 뒤팔 → 뒷머리 → 다리 → 몸통 → 앞팔 → 목·머리 → 앞머리 → 얼굴 → 손 */

const INK = "#2B2926";
const sh  = o => `rgba(0,0,0,${o})`;
const SKIN = { a: "#F7DCC4", b: "#EBC3A2" };

const SHOULDER = -108;                 // 팔이 붙는 높이

/* ── 팔 (어깨에서 손까지 굵기가 변하는 도형) ── */
const ARM = {
  down:  `M22 ${SHOULDER} c8 5 12 15 12 25 l1 20 c0 5-3 8-8 8 s-8-3-8-8 l-1-19 c-1-9-3-16-8-22 z`,
  point: `M20 ${SHOULDER} c13 2 26-1 36-8 c5-3 10-1 11 4 s-1 8-6 10 c-14 8-29 11-43 8 z`,
  think: `M20 ${SHOULDER} c11 4 17 13 16 23 c-1 6-5 9-10 8 s-7-5-6-10 c1-7-2-12-8-15 z`,
  up:    `M21 ${SHOULDER} c10-5 16-15 17-27 c1-6 5-8 10-7 s6 6 5 11 c-3 17-13 29-25 35 z`,
  hold:  `M21 ${SHOULDER} c9 5 13 14 12 22 c-1 6-6 9-13 9 h-8 c-4 0-6-3-6-6 s3-6 7-6 h5 c3 0 4-2 3-6 z`,
  open:  `M21 ${SHOULDER} c13 2 23 10 28 21 c2 4 0 8-4 10 s-8 0-10-4 c-4-8-10-14-18-16 z`,
};
const HAND = {
  down:  `<ellipse cx="35" cy="-55" rx="6.2" ry="7.2" fill="${SKIN.a}"/>`,
  point: `<ellipse cx="64" cy="-114" rx="6.8" ry="6" fill="${SKIN.a}"/>`,
  think: `<ellipse cx="30" cy="-81" rx="6.4" ry="6.8" fill="${SKIN.a}"/>`,
  up:    `<ellipse cx="51" cy="-140" rx="6.4" ry="7" fill="${SKIN.a}"/>`,
  hold:  `<ellipse cx="10" cy="-83" rx="6.6" ry="6.2" fill="${SKIN.a}"/>`,
  open:  `<ellipse cx="51" cy="-83" rx="6.6" ry="6.6" fill="${SKIN.a}"/>`,
};
const BACK_ARM = `M-22 ${SHOULDER} c-8 5-12 15-12 25 l-1 20 c0 5 3 8 8 8 s8-3 8-8 l1-19 c1-9 3-16 8-22 z`;

/* ── 다리 ── */
const LEG = {
  stand: `<path d="M-19 -62 h16 l-1 56 h-14z" fill="LEG"/><path d="M3 -62 h16 l-1 56 h-14z" fill="LEG"/>
          <path d="M-20 -8 h15 q5 0 5 4 v4 h-22 q-2 0-2-3z" fill="${INK}"/>
          <path d="M4 -8 h15 q5 0 5 4 v4 h-22 q-2 0-2-3z" fill="${INK}"/>`,
  step:  `<path d="M-22 -62 h16 l-6 56 h-14z" fill="LEG"/><path d="M4 -62 h16 l4 56 h-14z" fill="LEG"/>
          <path d="M-28 -8 h15 q5 0 5 4 v4 h-22 q-2 0-2-3z" fill="${INK}"/>
          <path d="M8 -8 h15 q5 0 5 4 v4 h-22 q-2 0-2-3z" fill="${INK}"/>`,
};

/* ── 몸통: 어깨 ±24 → 허리 ±19 로 좁아진다 ── */
const TORSO = `M-24 -110 q3-10 11-13 l7-3 q6 6 12 0 l7 3 q8 3 11 13 l-5 50 h-38 z`;
const TORSO_SHADE = `M2 -126 l7 3 q8 3 11 13 l-5 50 h-15 z`;
const COLLAR = `M-7 -126 l7 8 7-8 -4-2 h-6 z`;

/* ── 머리카락: 앞머리는 눈 위(-146)에서 끝난다 ── */
const HAIR = {
  short: { back: ``,
    front: `<path d="M-17 -140 c-1-13 7-21 17-21 s18 8 17 21 c-1-5-3-8-6-10 c-6 4-15 5-22 2 c-3 2-5 4-6 8z" fill="HC"/>` },
  bob:   { back: `<path d="M-19 -142 q0-13 19-13 t19 13 v32 q0 8-7 9 h-24 q-7-1-7-9z" fill="HC"/>`,
    front: `<path d="M-19 -140 c-1-15 8-23 19-23 s20 8 19 23 l-2 5 c-1-8-4-13-7-16 c-7 5-18 6-25 2 c-3 3-4 8-3 14z" fill="HC"/>` },
  long:  { back: `<path d="M-21 -142 q0-15 21-15 t21 15 v46 q0 8-8 8 h-26 q-8 0-8-8z" fill="HC"/>`,
    front: `<path d="M-19 -139 c-1-16 8-25 19-25 s20 9 19 25 l-3 4 c0-9-3-15-6-18 c-8 6-18 6-26 1 c-2 4-3 9-3 13z" fill="HC"/>` },
  bun:   { back: `<circle cx="0" cy="-168" r="9.5" fill="HC"/>`,
    front: `<path d="M-17 -140 c-1-13 7-21 17-21 s18 8 17 21 c-1-5-3-7-5-9 c-7 4-16 5-23 2 c-3 2-5 3-6 7z" fill="HC"/>` },
  curly: { back: ``,
    front: `<path d="M-18 -139 c-1-13 7-22 18-22 s19 9 18 22 c-2-5-5-6-7-3 c-3-6-7-6-10-1 c-3-5-8-5-10 1 c-3-4-6-3-9 3z" fill="HC"/>` },
  cap:   { back: ``,
    front: `<path d="M-18 -150 a18 16 0 0 1 36 0z" fill="HC"/><path d="M-26 -150 h22 v5 h-22 q-3 0-3-2.5t3-2.5z" fill="HC" opacity=".72"/>` },
};

const FACE = {
  smile: `<path d="M-6 3 q6 6 12 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  glad:  `<path d="M-6.5 2 q6.5 8 13 0 q-6.5 3-13 0z" fill="${INK}"/>`,
  flat:  `<path d="M-5 4 h10" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
  worry: `<path d="M-5.5 5 q5.5-6 11 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  oh:    `<ellipse cx="0" cy="4" rx="3.2" ry="4.2" fill="${INK}"/>`,
};
const BROW = {
  none: ``,
  up:   `<path d="M-10-11 q4-3 8-1M2-12 q4-2 8 1" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  down: `<path d="M-10-13 q4 2 8 1M2-12 q4-1 8-1" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
};

function figure(o = {}) {
  const { x = 0, y = 0, s = 1, c = "#6B6B8A", pose = "down", hair = "short",
          face = "smile", brow = "none", look = 0, hairc = "#3A3330",
          legc = "#414A5E", flip = 0 } = o;
  const hr = HAIR[hair] || HAIR.short;
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
   <ellipse cx="0" cy="3" rx="30" ry="6" fill="${sh(.12)}"/>
   <path d="${BACK_ARM}" fill="${c}"/><path d="${BACK_ARM}" fill="${sh(.18)}"/>
   ${(hr.back || "").replace(/HC/g, hairc)}
   ${(LEG[pose === "point" ? "step" : "stand"]).replace(/LEG/g, legc)}
   <path d="M-19 -62 h38 v6 h-38z" fill="${sh(.14)}"/>
   <path d="${TORSO}" fill="${c}"/>
   <path d="${TORSO_SHADE}" fill="${sh(.11)}"/>
   <path d="M-5 -126 h10 v9 h-10z" fill="${SKIN.b}"/>
   <path d="${COLLAR}" fill="${sh(.2)}"/>
   <path d="${ARM[pose] || ARM.down}" fill="${c}"/>
   <ellipse cx="0" cy="-136" rx="16" ry="17.5" fill="${SKIN.a}"/>
   <path d="M7 -152 a16 17.5 0 0 1 0 32 16 17.5 0 0 0 0-32z" fill="${SKIN.b}" opacity=".5"/>
   <ellipse cx="-16" cy="-135" rx="3" ry="4.2" fill="${SKIN.b}"/>
   ${(hr.front || "").replace(/HC/g, hairc)}
   <g transform="translate(${look} -136)">
     ${BROW[brow] || ""}
     <ellipse cx="-6" cy="-3" rx="2.3" ry="2.8" fill="${INK}"/>
     <ellipse cx="6" cy="-3" rx="2.3" ry="2.8" fill="${INK}"/>
     <circle cx="-10.5" cy="4" r="3.2" fill="#E8897A" opacity=".3"/>
     <circle cx="10.5" cy="4" r="3.2" fill="#E8897A" opacity=".3"/>
     ${FACE[face] || FACE.smile}
   </g>
   ${HAND[pose] || HAND.down}
  </g>`;
}
module.exports = { figure, INK, SKIN };
