/* Unit 2 삽화 — 레슨 아이콘 · 배너 장면 · Knowledge Bank 비네트 */
const ink="#2B2A28";

const icons = {
 twowhys:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="20" cy="24" r="12" stroke="${c}" stroke-width="3"/>
  <circle cx="44" cy="24" r="12" stroke="${c}" stroke-width="3" opacity=".38"/>
  <path d="M16 20c0-3 2-4.5 4-4.5s4 1.5 4 4.5-4 3-4 6" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <circle cx="20" cy="33" r="1.9" fill="${c}"/>
  <path d="M40 20c0-3 2-4.5 4-4.5s4 1.5 4 4.5-4 3-4 6" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55"/>
  <circle cx="44" cy="33" r="1.9" fill="${c}" opacity=".55"/>
  <path d="M14 47h36" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
 hunger:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M30 10c-8 0-12 5-12 9-5 1-7 5-7 8 0 4 3 6 5 7-1 5 3 10 8 10h6z" fill="${c}" opacity=".28"/>
  <path d="M34 10c8 0 12 5 12 9 5 1 7 5 7 8 0 4-3 6-5 7 1 5-3 10-8 10h-6z" fill="${c}"/>
  <path d="M32 10v34" stroke="${c}" stroke-width="2.6"/>
  <path d="M23 30l4-6 4 10 4-8 3 4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 52h24" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
 spheres:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="23" stroke="${c}" stroke-width="3" opacity=".4"/>
  <path d="M9 32h46" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 4"/>
  <circle cx="32" cy="20" r="5" fill="${c}"/>
  <path d="M18 14l1.6 3.4L23 19l-3.4 1.6L18 24l-1.6-3.4L13 19l3.4-1.6z" fill="${c}"/>
  <path d="M47 24l1.3 2.7L51 28l-2.7 1.3L47 32l-1.3-2.7L43 28l2.7-1.3z" fill="${c}"/>
  <path d="M16 44c4-7 9-8 13-3 3 4 7 3 9-2 2-4 5-5 9-2" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
 zipper:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M25 6v22M39 6v22" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M25 10h-6M25 17h-6M25 24h-6M39 10h6M39 17h6M39 24h6" stroke="${c}" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>
  <rect x="24" y="28" width="16" height="11" rx="3.5" fill="${c}"/>
  <path d="M32 39v11" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="32" cy="52" r="3.6" stroke="${c}" stroke-width="2.6"/></svg>`,
 doubt:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 10v34M18 48h28" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M10 20h44" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M3 33a7 7 0 0 0 14 0z" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M47 33a7 7 0 0 0 14 0z" fill="${c}"/>
  <path d="M10 20l-3 13M54 20l3 13" stroke="${c}" stroke-width="2" opacity=".6"/>
  <circle cx="32" cy="14" r="3.4" fill="${c}"/></svg>`,
};

const scenes = {
 /* 06 — 같은 장면 앞의 두 질문 */
 twowhys:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <rect x="248" y="74" width="146" height="92" rx="10" fill="${t}" stroke="${c}" stroke-width="3.4"/>
  <path d="M292 100l-4-18 15 9zM350 100l4-18-15 9z" fill="${c}"/>
  <path d="M292 100l-4-18 15 9zM350 100l4-18-15 9z" stroke="${d}" stroke-width="2.6" stroke-linejoin="round" fill="none"/>
  <path d="M290 116a31 26 0 0 1 62 0v6a31 26 0 0 1-62 0z" fill="${c}"/>
  <circle cx="309" cy="115" r="3.6" fill="#fff"/><circle cx="333" cy="115" r="3.6" fill="#fff"/>
  <path d="M321 124l-5 4 5 3 5-3z" fill="#fff"/>
  <path d="M300 128h-18M300 134h-16M342 128h18M342 134h16" stroke="${d}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M352 132c14 2 22 10 22 22" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <g><path d="M266 152h34l-4 14h-26z" fill="${d}" opacity=".55"/>
   <ellipse cx="283" cy="152" rx="17" ry="5" fill="${d}" opacity=".8"/></g>
  <text x="321" y="185" font-size="13" font-weight="700" fill="${d}" text-anchor="middle">THE SAME SCENE</text>
  <g><circle cx="108" cy="86" r="30" fill="${c}"/>
   <path d="M97 80c0-7 5-11 11-11s11 4 11 11-9 8-9 14" stroke="#fff" stroke-width="4.4" fill="none" stroke-linecap="round"/>
   <circle cx="110" cy="104" r="3.4" fill="#fff"/>
   <text x="108" y="140" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">MECHANISM</text>
   <text x="108" y="158" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">nerves · muscles · causes</text></g>
  <g><circle cx="532" cy="86" r="30" fill="${t}" stroke="${c}" stroke-width="3.4"/>
   <path d="M521 80c0-7 5-11 11-11s11 4 11 11-9 8-9 14" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
   <circle cx="534" cy="104" r="3.4" fill="${c}"/>
   <text x="532" y="140" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">MEANING</text>
   <text x="532" y="158" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">expectation · memory</text></g>
  <path d="M146 96h84" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="8 7"/>
  <path d="M222 89l10 7-10 7" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M494 96h-84" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="8 7"/>
  <path d="M418 89l-10 7 10 7" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="320" y="216" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">two questions · one behaviour</text></svg>`,
 /* 07 — 굶은 뇌와 외로운 뇌 */
 hunger:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><path d="M196 52c-32 0-50 20-50 40 0 8 3 15 8 20-4 18 10 34 30 34h16V52z" fill="${t}" stroke="${c}" stroke-width="3.6" stroke-linejoin="round"/>
   <circle cx="168" cy="96" r="15" fill="${c}" opacity=".85"/>
   <text x="160" y="180" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">10 HOURS HUNGRY</text></g>
  <g><path d="M444 52c32 0 50 20 50 40 0 8-3 15-8 20 4 18-10 34-30 34h-16V52z" fill="${t}" stroke="${c}" stroke-width="3.6" stroke-linejoin="round"/>
   <circle cx="472" cy="96" r="15" fill="${c}" opacity=".85"/>
   <text x="482" y="180" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">10 HOURS ALONE</text></g>
  <path d="M320 44v138" stroke="${c}" stroke-width="2.6" stroke-dasharray="6 6" opacity=".55"/>
  <circle cx="320" cy="96" r="24" fill="${c}" opacity=".2"/>
  <circle cx="320" cy="96" r="13" fill="${c}"/>
  <text x="320" y="146" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">SAME REGION</text>
  <path d="M232 96h56M352 96h56" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 6"/>
  <text x="320" y="216" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">a bright spot is a place, not a feeling</text></svg>`,
 /* 08 — 달을 경계로 나뉜 두 세계 */
 spheres:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M0 132h640" stroke="${c}" stroke-width="3" stroke-dasharray="9 8" opacity=".7"/>
  <text x="596" y="124" font-size="11" font-weight="800" fill="${d}" text-anchor="end" opacity=".8">THE MOON</text>
  <circle cx="320" cy="132" r="26" fill="${t}" stroke="${c}" stroke-width="3.4"/>
  <circle cx="312" cy="124" r="5" fill="${c}" opacity=".5"/><circle cx="328" cy="138" r="6.5" fill="${c}" opacity=".38"/>
  <g opacity=".95">
   <path d="M92 46l3 6.6 6.6 3-6.6 3-3 6.6-3-6.6-6.6-3 6.6-3z" fill="${c}"/>
   <path d="M208 74l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="${c}"/>
   <path d="M456 52l2.6 5.8 5.8 2.6-5.8 2.6-2.6 5.8-2.6-5.8-5.8-2.6 5.8-2.6z" fill="${c}"/>
   <path d="M552 86l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="${c}"/>
   <circle cx="150" cy="96" r="3" fill="${c}" opacity=".6"/><circle cx="500" cy="110" r="3" fill="${c}" opacity=".6"/>
   <path d="M92 46a120 120 0 0 1 116 28" stroke="${c}" stroke-width="2.2" fill="none" opacity=".45" stroke-dasharray="5 6"/></g>
  <text x="44" y="42" font-size="12" font-weight="800" fill="${d}">CELESTIAL · no change</text>
  <text x="44" y="164" font-size="12" font-weight="800" fill="${d}">TERRESTRIAL · change</text>
  <g><path d="M110 200c0-16 12-26 26-26s26 10 26 26z" fill="${c}" opacity=".85"/>
   <path d="M240 200c6-22 16-30 24-30s16 8 20 30z" fill="${c}" opacity=".55"/>
   <path d="M392 200l16-30 16 30z" fill="${c}" opacity=".7"/>
   <path d="M480 200c0-14 10-22 22-22s22 8 22 22z" fill="${c}" opacity=".4"/></g>
  <path d="M0 200h640" stroke="${c}" stroke-width="4" stroke-linecap="round"/></svg>`,
 /* 09 — 머릿속 자전거와 진짜 자전거 */
 zipper:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><path d="M60 150a44 44 0 1 1 88 0" stroke="${c}" stroke-width="3.6" fill="${t}" opacity=".9"/>
   <circle cx="82" cy="150" r="22" stroke="${c}" stroke-width="3.4" fill="none"/>
   <circle cx="132" cy="150" r="22" stroke="${c}" stroke-width="3.4" fill="none"/>
   <path d="M82 150h50M104 150l14-26h14" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
   <path d="M96 128c14 10 24 10 36 0" stroke="${c}" stroke-width="3" stroke-dasharray="4 5" fill="none"/>
   <text x="106" y="196" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">IN YOUR HEAD</text></g>
  <g><circle cx="492" cy="150" r="24" stroke="${c}" stroke-width="3.6" fill="none"/>
   <circle cx="566" cy="150" r="24" stroke="${c}" stroke-width="3.6" fill="none"/>
   <path d="M492 150l26-40h32l16 40M518 110h26M506 150h60" stroke="${c}" stroke-width="3.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
   <circle cx="524" cy="150" r="7" fill="${c}"/>
   <path d="M524 150l-8 8" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
   <text x="529" y="196" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">ON THE ROAD</text></g>
  <g><rect x="232" y="52" width="176" height="104" rx="12" fill="${t}" stroke="${c}" stroke-width="3.4"/>
   <text x="320" y="92" font-size="15" font-weight="800" fill="${d}" text-anchor="middle">&#8220;I know</text>
   <text x="320" y="114" font-size="15" font-weight="800" fill="${d}" text-anchor="middle">how it works.&#8221;</text>
   <path d="M300 156l6 16 16-16z" fill="${t}" stroke="${c}" stroke-width="3.4" stroke-linejoin="round"/>
   <path d="M264 132h112" stroke="${c}" stroke-width="2.4" opacity=".4"/>
   <text x="320" y="146" font-size="11" fill="${d}" opacity=".7" text-anchor="middle">— until you explain it</text></g>
  <text x="320" y="220" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">familiar is not the same as understood</text></svg>`,
 /* 10 — 주장과 증거의 저울 */
 doubt:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M320 40v148M256 188h128" stroke="${c}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="320" cy="36" r="7" fill="${c}"/>
  <path d="M132 70h376" stroke="${c}" stroke-width="5" stroke-linecap="round" transform="rotate(-9 320 70)"/>
  <g><path d="M132 96l-30 4" stroke="${c}" stroke-width="2.2"/>
   <path d="M64 106a44 44 0 0 0 88 0z" fill="${t}" stroke="${c}" stroke-width="3.4" stroke-linejoin="round"/>
   <rect x="86" y="82" width="44" height="20" rx="4" fill="${c}" opacity=".85"/>
   <text x="108" y="164" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">ORDINARY CLAIM</text>
   <text x="108" y="182" font-size="11" fill="${d}" opacity=".7" text-anchor="middle">a timetable is enough</text></g>
  <g><path d="M508 44l30 4" stroke="${c}" stroke-width="2.2"/>
   <path d="M488 60a44 44 0 0 0 88 0z" fill="${c}"/>
   <rect x="502" y="16" width="60" height="30" rx="5" fill="${c}"/>
   <rect x="510" y="-2" width="44" height="22" rx="5" fill="${c}" opacity=".55"/>
   <text x="532" y="118" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">EXTRAORDINARY</text>
   <text x="532" y="136" font-size="11" fill="${d}" opacity=".7" text-anchor="middle">far heavier evidence</text></g>
  <text x="320" y="220" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">a skeptic asks what would settle it</text></svg>`,
};

const STRIP = {
 "06":["pair","gear","brain","nope","handshake"],
 "07":["alone","brain","heartbeat","warn","sprout"],
 "08":["moonface","eye","nova","scope","ruler"],
 "09":["zipper","tag","dome","shield","warn"],
 "10":["nope","ask","balance","spark","cable"]
};

const VIG = {
 "06":(c,t,d)=>`<circle cx="72" cy="70" r="42" fill="${t}"/><circle cx="72" cy="70" r="42" stroke="${c}" stroke-width="4.2" fill="none"/>
  <path d="M60 60c0-8 6-12 12-12s12 4 12 12-10 9-10 16" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="74" cy="90" r="4" fill="${c}"/>
  <g><circle cx="176" cy="42" r="14" fill="${c}"/><path d="M154 92c0-13 10-21 22-21s22 8 22 21z" fill="${c}" opacity=".6"/>
  <circle cx="176" cy="42" r="14" stroke="${d}" stroke-width="2.4" fill="none"/></g>
  <path d="M118 70h32" stroke="${c}" stroke-width="3.6" stroke-dasharray="6 6" stroke-linecap="round"/>
  <path d="M186 116h34M196 128h24" stroke="${d}" stroke-width="3.4" stroke-linecap="round" opacity=".5"/>`,
 "07":(c,t,d)=>`<path d="M90 20c-30 0-46 18-46 36 0 7 3 13 8 17-4 16 9 31 27 31h11V20z" fill="${t}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M96 20c30 0 46 18 46 36 0 7-3 13-8 17 4 16-9 31-27 31H96z" fill="${c}" opacity=".22"/>
  <path d="M93 20v84" stroke="${c}" stroke-width="3"/>
  <circle cx="93" cy="62" r="17" fill="${c}" opacity=".85"/><circle cx="93" cy="62" r="8" fill="${d}"/>
  <path d="M168 42l7 15 15 7-15 7-7 15-7-15-15-7 15-7z" fill="${c}" opacity=".45"/>
  <text x="176" y="106" font-size="11" font-weight="800" fill="${d}" text-anchor="middle" opacity=".8">craving</text>`,
 "08":(c,t,d)=>`<path d="M12 78h216" stroke="${c}" stroke-width="3" stroke-dasharray="8 7" opacity=".65"/>
  <circle cx="120" cy="78" r="24" fill="${t}" stroke="${c}" stroke-width="4"/>
  <circle cx="112" cy="70" r="5" fill="${c}" opacity=".5"/><circle cx="128" cy="86" r="6" fill="${c}" opacity=".35"/>
  <path d="M44 30l3.4 7.4 7.4 3.4-7.4 3.4L44 52l-3.4-7.4L33 41l7.4-3.4z" fill="${c}"/>
  <path d="M192 26l4 8.6 8.6 4-8.6 4-4 8.6-4-8.6-8.6-4 8.6-4z" fill="${c}"/>
  <circle cx="192" cy="34" r="16" fill="${c}" opacity=".18"/>
  <path d="M28 128c10-16 22-18 32-6 8 9 18 7 24-4 6-10 16-11 26-3" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <text x="196" y="70" font-size="10" font-weight="800" fill="${d}" text-anchor="middle" opacity=".85">1572</text>`,
 "09":(c,t,d)=>`<circle cx="76" cy="66" r="40" fill="${t}" stroke="${c}" stroke-width="4"/>
  <circle cx="60" cy="76" r="15" stroke="${c}" stroke-width="3.4" fill="none"/>
  <circle cx="96" cy="76" r="15" stroke="${c}" stroke-width="3.4" fill="none"/>
  <path d="M60 76h36M74 76l10-18h10" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M68 60c10 7 16 7 24 0" stroke="${d}" stroke-width="3" stroke-dasharray="4 5" fill="none"/>
  <path d="M132 40h84M132 58h68M132 76h84M132 94h52" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".35"/>
  <path d="M150 112l10 10 22-22" stroke="${d}" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
 "10":(c,t,d)=>`<path d="M120 22v96M84 118h72" stroke="${c}" stroke-width="4.4" stroke-linecap="round"/>
  <path d="M36 44h168" stroke="${c}" stroke-width="4.4" stroke-linecap="round" transform="rotate(-8 120 44)"/>
  <path d="M18 62a30 30 0 0 0 60 0z" fill="${t}" stroke="${c}" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M162 40a30 30 0 0 0 60 0z" fill="${c}"/>
  <rect x="176" y="8" width="32" height="18" rx="4" fill="${c}" opacity=".55"/>
  <circle cx="120" cy="20" r="5.5" fill="${c}"/>
  <text x="48" y="98" font-size="10" font-weight="800" fill="${d}" text-anchor="middle" opacity=".75">claim</text>
  <text x="192" y="82" font-size="10" font-weight="800" fill="${d}" text-anchor="middle" opacity=".75">evidence</text>`,
};

module.exports = { icons, scenes, STRIP, VIG };
