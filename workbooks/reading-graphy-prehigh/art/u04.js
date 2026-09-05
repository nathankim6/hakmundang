/* Unit 4 삽화 — 레슨 아이콘 · 배너 장면 · Knowledge Bank 비네트 */

const icons = {
 clock:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="34" r="22" stroke="${c}" stroke-width="3.2"/>
  <path d="M32 20v14l10 6" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M32 6v6M14 12l4 5M50 12l-4 5" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="34" r="3" fill="${c}"/></svg>`,
 surgery:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M42 10l12 12-26 26-12-12z" fill="${c}" opacity=".25"/>
  <path d="M46 8c6 2 10 6 12 12L26 52l-6-2-2-6z" stroke="${c}" stroke-width="3" stroke-linejoin="round" fill="none"/>
  <path d="M12 56l8-8" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M20 20h14M27 13v14" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></svg>`,
 virus:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="15" fill="${c}" opacity=".2"/>
  <circle cx="32" cy="32" r="15" stroke="${c}" stroke-width="3"/>
  <path d="M32 8v9M32 47v9M8 32h9M47 32h9M15 15l7 7M42 42l7 7M49 15l-7 7M22 42l-7 7" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="6" r="3" fill="${c}"/><circle cx="32" cy="58" r="3" fill="${c}"/>
  <circle cx="6" cy="32" r="3" fill="${c}"/><circle cx="58" cy="32" r="3" fill="${c}"/>
  <path d="M26 30c3-3 6-1 6 2s3 5 6 2" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`,
 wall:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M20 26h24v26H20z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M14 26h36" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M26 26V16a6 6 0 0 1 12 0v10" stroke="${c}" stroke-width="3" fill="none"/>
  <path d="M26 38h12M26 45h12" stroke="${c}" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>
  <path d="M8 56h48" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M10 56V44M54 56V44" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".55"/></svg>`,
 burnout:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="10" y="14" width="44" height="36" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M10 26h44" stroke="${c}" stroke-width="3"/>
  <path d="M20 10v8M44 10v8" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <rect x="17" y="32" width="10" height="6" rx="2" fill="${c}" opacity=".35"/>
  <rect x="31" y="32" width="16" height="6" rx="2" fill="${c}"/>
  <rect x="17" y="41" width="20" height="6" rx="2" fill="${c}" opacity=".6"/>
  <path d="M40 44l4 4 8-9" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

const scenes = {
 clock:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><circle cx="130" cy="106" r="52" fill="${t}" stroke="${c}" stroke-width="4"/>
   <path d="M130 74v34l22 12" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <text x="130" y="192" font-size="12.5" font-weight="800" fill="${d}" text-anchor="middle">THE WATCH</text>
   <text x="130" y="210" font-size="11" fill="${d}" opacity=".7" text-anchor="middle">changed in one second</text></g>
  <g><circle cx="510" cy="106" r="52" fill="#fff" stroke="${c}" stroke-width="4" stroke-dasharray="9 7"/>
   <path d="M510 74v34l22 12" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
   <text x="510" y="192" font-size="12.5" font-weight="800" fill="${d}" text-anchor="middle">THE BODY</text>
   <text x="510" y="210" font-size="11" fill="${d}" opacity=".7" text-anchor="middle">about one hour a day</text></g>
  <g><circle cx="214" cy="106" r="4" fill="${c}" opacity=".5"/><circle cx="246" cy="106" r="4" fill="${c}" opacity=".5"/><circle cx="278" cy="106" r="4" fill="${c}" opacity=".5"/><circle cx="310" cy="106" r="4" fill="${c}" opacity=".5"/><circle cx="342" cy="106" r="4" fill="${c}" opacity=".5"/><circle cx="374" cy="106" r="4" fill="${c}" opacity=".5"/><circle cx="406" cy="106" r="4" fill="${c}" opacity=".5"/><circle cx="438" cy="106" r="4" fill="${c}" opacity=".5"/></g>
  <path d="M198 106h250" stroke="${c}" stroke-width="3" stroke-dasharray="10 9" stroke-linecap="round" opacity=".65"/>
  <path d="M436 98l12 8-12 8" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g><circle cx="322" cy="52" r="17" fill="${c}"/>
   <path d="M322 22v8M292 52h8M352 52h8M300 30l6 6M344 30l-6 6" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
   <text x="322" y="86" font-size="11" font-weight="800" fill="${d}" text-anchor="middle">morning light</text></g></svg>`,
 surgery:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><text x="150" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">BEFORE — SPEED</text>
   <rect x="52" y="96" width="196" height="16" rx="8" fill="${c}" opacity=".2"/>
   <rect x="52" y="96" width="30" height="16" rx="8" fill="${c}"/>
   <text x="150" y="140" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">under a minute · screaming</text>
   <path d="M62 62c8-10 16-10 24 0s16 10 24 0 16-10 24 0 16 10 24 0 16-10 24 0" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/></g>
  <path d="M320 44v150" stroke="${c}" stroke-width="2.4" stroke-dasharray="7 7" opacity=".4"/>
  <g><text x="490" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">AFTER — CARE</text>
   <rect x="392" y="96" width="196" height="16" rx="8" fill="${c}" opacity=".2"/>
   <rect x="392" y="96" width="164" height="16" rx="8" fill="${c}"/>
   <text x="490" y="140" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">as long as the work needs</text>
   <path d="M400 62h176" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".5"/></g>
  <g><rect x="252" y="160" width="136" height="34" rx="9" fill="${t}" stroke="${c}" stroke-width="2.6"/>
   <text x="320" y="182" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">and a long training</text></g></svg>`,
 virus:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><circle cx="112" cy="110" r="40" fill="${t}" stroke="${c}" stroke-width="4"/>
   <path d="M112 110 L164 110" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="164" cy="110" r="5" fill="${c}"/><path d="M112 110 L148 146" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="148" cy="146" r="5" fill="${c}"/><path d="M112 110 L112 162" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="112" cy="162" r="5" fill="${c}"/><path d="M112 110 L76 146" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="76" cy="146" r="5" fill="${c}"/><path d="M112 110 L60 110" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="60" cy="110" r="5" fill="${c}"/><path d="M112 110 L76 74" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="76" cy="74" r="5" fill="${c}"/><path d="M112 110 L112 58" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="112" cy="58" r="5" fill="${c}"/><path d="M112 110 L148 74" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="148" cy="74" r="5" fill="${c}"/>
   <path d="M96 106c8-8 16-2 16 6s8 12 16 4" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
   <text x="112" y="196" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">A SET OF INSTRUCTIONS</text></g>
  <path d="M176 110h74" stroke="${c}" stroke-width="3.4" stroke-dasharray="9 7" stroke-linecap="round"/>
  <path d="M238 102l12 8-12 8" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g><ellipse cx="420" cy="110" rx="118" ry="76" fill="${t}" opacity=".55" stroke="${c}" stroke-width="4"/>
   <circle cx="396" cy="98" r="26" fill="${c}" opacity=".3"/>
   <circle cx="396" cy="98" r="26" stroke="${c}" stroke-width="3" fill="none"/>
   <rect x="440" y="120" width="26" height="34" rx="6" fill="${c}" opacity=".55"/><rect x="474" y="110" width="26" height="34" rx="6" fill="${c}" opacity=".4"/><rect x="440" y="74" width="26" height="34" rx="6" fill="${c}" opacity=".3"/>
   <text x="420" y="204" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">THE CELL — BORROWED MACHINERY</text></g></svg>`,
 wall:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><text x="146" y="30" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">1854 · BROAD STREET</text>
   <rect x="44" y="48" width="204" height="140" rx="8" fill="${t}" stroke="${c}" stroke-width="3"/>
   <path d="M44 118h204M146 48v140" stroke="${c}" stroke-width="2.6" opacity=".35"/>
   <circle cx="132" cy="104" r="4" fill="${c}" opacity=".75"/><circle cx="158" cy="112" r="4" fill="${c}" opacity=".75"/><circle cx="140" cy="132" r="4" fill="${c}" opacity=".75"/><circle cx="160" cy="96" r="4" fill="${c}" opacity=".75"/><circle cx="124" cy="124" r="4" fill="${c}" opacity=".75"/><circle cx="152" cy="134" r="4" fill="${c}" opacity=".75"/><circle cx="168" cy="124" r="4" fill="${c}" opacity=".75"/><circle cx="136" cy="90" r="4" fill="${c}" opacity=".75"/><circle cx="96" cy="74" r="3" fill="${c}" opacity=".75"/><circle cx="206" cy="150" r="3" fill="${c}" opacity=".75"/><circle cx="84" cy="160" r="3" fill="${c}" opacity=".75"/><circle cx="214" cy="80" r="3" fill="${c}" opacity=".75"/>
   <g><rect x="138" y="106" width="16" height="26" rx="4" fill="${c}"/>
    <path d="M146 106V96" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="146" cy="119" r="22" stroke="${c}" stroke-width="2.6" fill="none" stroke-dasharray="5 5"/></g>
   <text x="146" y="208" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">deaths gather at one pump</text></g>
  <g><text x="470" y="30" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">AFTER THE HANDLE CAME OFF</text>
   <rect x="368" y="48" width="204" height="140" rx="8" fill="#fff" stroke="${c}" stroke-width="3" stroke-dasharray="8 7"/>
   <path d="M368 118h204M470 48v140" stroke="${c}" stroke-width="2.6" opacity=".18"/>
   <text x="470" y="126" font-size="15" font-weight="800" fill="${d}" opacity=".45" text-anchor="middle">nothing to see</text>
   <text x="470" y="208" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">success leaves no picture</text></g></svg>`,
 burnout:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M66 176V44M66 176h520" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M80 158l90-6 90 4 90 22 90 40 76 24" stroke="${c}" stroke-width="4.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M336 44v132" stroke="${c}" stroke-width="3" stroke-dasharray="7 6" opacity=".7"/>
  <text x="336" y="38" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">17 hours awake</text>
  <text x="150" y="200" font-size="11" font-weight="700" fill="${d}" opacity=".72" text-anchor="middle">errors stay low</text>
  <text x="470" y="200" font-size="11" font-weight="700" fill="${d}" opacity=".72" text-anchor="middle">errors climb</text>
  <text x="44" y="52" font-size="11" font-weight="800" fill="${d}" text-anchor="end">many</text>
  <text x="44" y="180" font-size="11" font-weight="800" fill="${d}" text-anchor="end">few</text>
  <rect x="404" y="52" width="168" height="34" rx="9" fill="${t}" stroke="${c}" stroke-width="2.6"/>
  <text x="488" y="74" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">≈ mild drunkenness</text></svg>`,
};

const STRIP = {
 "16":["hourglass","loop","sunrise","takeoff","balance"],
 "17":["hourglass","gear","wrench","shield","pair"],
 "18":["spark","nope","loop","ask","shield"],
 "19":["map","eye","dome","warn","nope"],
 "20":["alone","ruler","hourglass","swap","gear"]
};

const VIG = {
 "16":(c,t,d)=>`<circle cx="66" cy="70" r="42" fill="${t}" stroke="${c}" stroke-width="4"/>
  <path d="M66 44v28l18 10" stroke="${c}" stroke-width="4.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="180" cy="52" r="18" fill="${c}"/>
  <path d="M180 20v9M150 52h9M201 52h9M158 30l6 6M202 30l-6 6" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M124 70h30" stroke="${c}" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round"/>
  <path d="M148 100c14 10 34 10 52 0" stroke="${d}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".4"/>`,
 "17":(c,t,d)=>`<path d="M40 24c26 6 42 22 50 46L46 108l-12-6-4-14z" fill="${t}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M24 124l14-14" stroke="${c}" stroke-width="4.4" stroke-linecap="round"/>
  <g><path d="M140 42c0-8 6-14 14-14h30c8 0 14 6 14 14v52c0 8-6 14-14 14h-30c-8 0-14-6-14-14z" fill="${c}" opacity=".2" stroke="${c}" stroke-width="3.4"/>
   <path d="M152 42v-8M168 40v-10M184 42v-8" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
   <text x="169" y="86" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">1889</text></g>`,
 "18":(c,t,d)=>`<circle cx="62" cy="66" r="30" fill="${t}" stroke="${c}" stroke-width="4"/>
  <path d="M62 30v-10M62 102v10M26 66H16M108 66h10M37 41l-7-7M87 91l7 7M87 41l7-7M37 91l-7 7" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M52 62c7-7 14-2 14 5s7 10 14 4" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="176" cy="70" rx="56" ry="40" fill="${c}" opacity=".16" stroke="${c}" stroke-width="3.4"/>
  <circle cx="162" cy="62" r="14" stroke="${c}" stroke-width="3" fill="none"/>
  <circle cx="192" cy="82" r="7" fill="${c}" opacity=".5"/><circle cx="196" cy="56" r="5" fill="${c}" opacity=".4"/>`,
 "19":(c,t,d)=>`<rect x="14" y="18" width="102" height="102" rx="8" fill="${t}" stroke="${c}" stroke-width="4"/>
  <path d="M14 70h102M64 18v102" stroke="${c}" stroke-width="2.6" opacity=".3"/>
  VIG<circle cx="132" cy="104" r="4" fill="${c}" opacity=".75"/><circle cx="158" cy="112" r="4" fill="${c}" opacity=".75"/><circle cx="140" cy="132" r="4" fill="${c}" opacity=".75"/><circle cx="160" cy="96" r="4" fill="${c}" opacity=".75"/><circle cx="124" cy="124" r="4" fill="${c}" opacity=".75"/><circle cx="152" cy="134" r="4" fill="${c}" opacity=".75"/><circle cx="168" cy="124" r="4" fill="${c}" opacity=".75"/><circle cx="136" cy="90" r="4" fill="${c}" opacity=".75"/><circle cx="96" cy="74" r="3" fill="${c}" opacity=".75"/><circle cx="206" cy="150" r="3" fill="${c}" opacity=".75"/><circle cx="84" cy="160" r="3" fill="${c}" opacity=".75"/><circle cx="214" cy="80" r="3" fill="${c}" opacity=".75"/>
  <rect x="58" y="60" width="13" height="22" rx="3.5" fill="${c}"/>
  <path d="M64 60v-9" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M140 70h34" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <path d="M166 62l10 8-10 8" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="186" y="46" width="44" height="48" rx="8" fill="#fff" stroke="${c}" stroke-width="3.4" stroke-dasharray="6 6"/>`,
 "20":(c,t,d)=>`<path d="M22 112V26M22 112h194" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <path d="M34 100l38-3 38 2 38 12 38 22" stroke="${c}" stroke-width="4.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M124 26v86" stroke="${c}" stroke-width="3.2" stroke-dasharray="6 5" opacity=".7"/>
  <text x="124" y="20" font-size="10.5" font-weight="800" fill="${d}" text-anchor="middle">17 h</text>
  <circle cx="200" cy="130" r="0" fill="none"/>`,
};

module.exports = { icons, scenes, STRIP, VIG };
