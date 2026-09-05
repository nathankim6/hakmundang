/* Unit 3 삽화 — 레슨 아이콘 · 배너 장면 · Knowledge Bank 비네트 */

const icons = {
 model:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="7" y="12" width="50" height="40" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M14 44l10-14 8 9 7-11 11 16" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/>
  <path d="M14 32h16l6-10h20" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="14" cy="32" r="3.6" fill="${c}"/><circle cx="30" cy="32" r="3.6" fill="${c}"/><circle cx="50" cy="22" r="3.6" fill="${c}"/></svg>`,
 joke:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M10 12h44a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H26l-12 10V42h-4a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="${c}"/>
  <path d="M22 25c0-3 2-4 4-4M38 25c0-3 2-4 4-4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <path d="M22 32c3 4 6 5 10 5s7-1 10-5" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>`,
 data:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M10 52V14M10 52h44" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <rect x="18" y="36" width="8" height="16" rx="2" fill="${c}" opacity=".35"/>
  <rect x="30" y="28" width="8" height="24" rx="2" fill="${c}" opacity=".6"/>
  <rect x="42" y="18" width="8" height="34" rx="2" fill="${c}"/>
  <path d="M16 26h12" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 5"/>
  <circle cx="34" cy="14" r="6" stroke="${c}" stroke-width="2.8"/>
  <path d="M32 12c0-1.6 1-2.4 2-2.4s2 .8 2 2.4-2 1.4-2 2.6" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
 neural:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="12" cy="20" r="5" fill="${c}"/><circle cx="12" cy="44" r="5" fill="${c}"/>
  <circle cx="32" cy="14" r="5" fill="${c}" opacity=".55"/><circle cx="32" cy="32" r="5" fill="${c}" opacity=".55"/><circle cx="32" cy="50" r="5" fill="${c}" opacity=".55"/>
  <circle cx="52" cy="32" r="5" fill="${c}"/>
  <path d="M17 20l10-5M17 20l10 11M17 44l10-11M17 44l10 5M37 14l11 15M37 32h10M37 50l11-15" stroke="${c}" stroke-width="2.2" opacity=".55"/></svg>`,
 feed:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="16" y="6" width="32" height="52" rx="5" stroke="${c}" stroke-width="3"/>
  <rect x="21" y="14" width="22" height="9" rx="2.5" fill="${c}"/>
  <rect x="21" y="27" width="22" height="9" rx="2.5" fill="${c}" opacity=".7"/>
  <rect x="21" y="40" width="22" height="9" rx="2.5" fill="${c}" opacity=".4"/>
  <path d="M28 10h8" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
};

const scenes = {
 /* 11 — 노선도와 실제 길 */
 model:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><text x="150" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">THE MAP</text>
   <path d="M50 130h60l30-40h80" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M50 168h100l30-38h40" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>
   <circle cx="50" cy="130" r="8" fill="#fff" stroke="${c}" stroke-width="4"/><circle cx="110" cy="130" r="8" fill="#fff" stroke="${c}" stroke-width="4"/><circle cx="140" cy="90" r="8" fill="#fff" stroke="${c}" stroke-width="4"/><circle cx="220" cy="90" r="8" fill="#fff" stroke="${c}" stroke-width="4"/><circle cx="150" cy="168" r="8" fill="#fff" stroke="${c}" stroke-width="4"/><circle cx="220" cy="130" r="8" fill="#fff" stroke="${c}" stroke-width="4"/>
   <text x="150" y="200" font-size="11" fill="${d}" opacity=".7" text-anchor="middle">even spaces · straight lines</text></g>
  <path d="M320 40v150" stroke="${c}" stroke-width="2.4" stroke-dasharray="7 7" opacity=".45"/>
  <g><text x="482" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">THE GROUND</text>
   <path d="M382 160c30-8 22-44 58-48s44 24 78 16" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
   <path d="M382 186c48-6 40-30 86-34s52 18 84 10" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".35"/>
   <circle cx="382" cy="160" r="7" fill="#fff" stroke="${c}" stroke-width="3.6"/><circle cx="414" cy="152" r="7" fill="#fff" stroke="${c}" stroke-width="3.6"/><circle cx="440" cy="112" r="7" fill="#fff" stroke="${c}" stroke-width="3.6"/><circle cx="498" cy="116" r="7" fill="#fff" stroke="${c}" stroke-width="3.6"/><circle cx="548" cy="128" r="7" fill="#fff" stroke="${c}" stroke-width="3.6"/>
   <path d="M400 70h30M448 62h44M508 74h26" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".28"/>
   <text x="482" y="212" font-size="11" fill="${d}" opacity=".7" text-anchor="middle">curves · uneven distances</text></g>
  <rect x="238" y="96" width="164" height="38" rx="10" fill="${t}" stroke="${c}" stroke-width="2.6"/>
  <text x="320" y="120" font-size="12.5" font-weight="800" fill="${d}" text-anchor="middle">what was left out</text></svg>`,
 /* 12 — 한 줄에서 갈라지는 뜻 */
 joke:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M40 116h230" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
  <circle cx="270" cy="116" r="13" fill="${c}"/>
  <text x="270" y="150" font-size="11" font-weight="800" fill="${d}" text-anchor="middle">the last word</text>
  <path d="M283 110c60-38 130-42 190-42" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".3" stroke-dasharray="10 8"/>
  <path d="M283 124c60 34 130 40 190 40" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <g><rect x="478" y="50" width="122" height="38" rx="9" fill="#fff" stroke="${c}" stroke-width="2.6" stroke-dasharray="6 5" opacity=".65"/>
   <text x="539" y="74" font-size="12" font-weight="700" fill="${d}" opacity=".6" text-anchor="middle">expected</text></g>
  <g><rect x="478" y="144" width="122" height="40" rx="9" fill="${c}"/>
   <text x="539" y="169" font-size="12.5" font-weight="800" fill="#fff" text-anchor="middle">what arrives</text></g>
  <g transform="translate(96 44)"><circle cx="0" cy="0" r="26" fill="${t}" stroke="${c}" stroke-width="3"/>
   <path d="M-10-6c0-3 2-4 4-4M4-6c0-3 2-4 4-4" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
   <path d="M-11 5c4 6 8 8 11 8s7-2 11-8" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>
  <text x="320" y="216" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">the mind repairs the gap — that repair is the laugh</text></svg>`,
 /* 13 — 같은 점, 다른 축 */
 data:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><path d="M56 178V44M56 178h214" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
   <path d="M70 168l44-6 46-10 48-8 46-12" stroke="${c}" stroke-width="4.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <circle cx="70" cy="168" r="5" fill="${c}"/><circle cx="114" cy="162" r="5" fill="${c}"/><circle cx="160" cy="152" r="5" fill="${c}"/><circle cx="208" cy="144" r="5" fill="${c}"/><circle cx="254" cy="132" r="5" fill="${c}"/>
   <text x="50" y="52" font-size="11" font-weight="800" fill="${d}" text-anchor="end">100</text>
   <text x="50" y="182" font-size="11" font-weight="800" fill="${d}" text-anchor="end">0</text>
   <text x="163" y="210" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">axis from 0 — a gentle rise</text></g>
  <g><path d="M386 178V44M386 178h214" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
   <path d="M400 172l44-26 46-34 48-30 46-38" stroke="${c}" stroke-width="4.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <circle cx="400" cy="172" r="5" fill="${c}"/><circle cx="444" cy="146" r="5" fill="${c}"/><circle cx="490" cy="112" r="5" fill="${c}"/><circle cx="538" cy="82" r="5" fill="${c}"/><circle cx="584" cy="44" r="5" fill="${c}"/>
   <text x="380" y="52" font-size="11" font-weight="800" fill="${d}" text-anchor="end">100</text>
   <text x="380" y="182" font-size="11" font-weight="800" fill="${d}" text-anchor="end">90</text>
   <text x="493" y="210" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">axis from 90 — a steep climb</text></g>
  <rect x="284" y="96" width="72" height="30" rx="8" fill="${t}" stroke="${c}" stroke-width="2.4"/>
  <text x="320" y="116" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">same data</text></svg>`,
 /* 14 — 층을 지나는 신호 */
 neural:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <circle cx="96" cy="60" r="12" fill="${c}" opacity=".9"/><circle cx="96" cy="110" r="12" fill="${c}" opacity=".9"/><circle cx="96" cy="160" r="12" fill="${c}" opacity=".9"/>
  <circle cx="256" cy="44" r="12" fill="${c}" opacity=".55"/><circle cx="256" cy="94" r="12" fill="${c}" opacity=".55"/><circle cx="256" cy="144" r="12" fill="${c}" opacity=".55"/><circle cx="256" cy="194" r="12" fill="${c}" opacity=".55"/>
  <circle cx="416" cy="60" r="12" fill="${c}" opacity=".55"/><circle cx="416" cy="110" r="12" fill="${c}" opacity=".55"/><circle cx="416" cy="160" r="12" fill="${c}" opacity=".55"/>
  <circle cx="560" cy="110" r="16" fill="${c}"/>
  <path d="M108 60 L244 44" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 60 L244 94" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 60 L244 144" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 60 L244 194" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 110 L244 44" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 110 L244 94" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 110 L244 144" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 110 L244 194" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 160 L244 44" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 160 L244 94" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 160 L244 144" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M108 160 L244 194" stroke="${c}" stroke-width="1.9" opacity=".38"/>
  <path d="M268 44 L404 60" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 44 L404 110" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 44 L404 160" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 94 L404 60" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 94 L404 110" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 94 L404 160" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 144 L404 60" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 144 L404 110" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 144 L404 160" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 194 L404 60" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 194 L404 110" stroke="${c}" stroke-width="1.9" opacity=".38"/><path d="M268 194 L404 160" stroke="${c}" stroke-width="1.9" opacity=".38"/>
  <path d="M428 60 L544 110" stroke="${c}" stroke-width="2.2" opacity=".55"/><path d="M428 110 L544 110" stroke="${c}" stroke-width="2.2" opacity=".55"/><path d="M428 160 L544 110" stroke="${c}" stroke-width="2.2" opacity=".55"/>
  <text x="96" y="206" font-size="11" font-weight="800" fill="${d}" text-anchor="middle">pixels</text>
  <text x="256" y="222" font-size="11" font-weight="800" fill="${d}" text-anchor="middle">edges</text>
  <text x="416" y="206" font-size="11" font-weight="800" fill="${d}" text-anchor="middle">ears · eyes</text>
  <text x="560" y="206" font-size="11" font-weight="800" fill="${d}" text-anchor="middle">&#8220;cat&#8221;</text>
  <text x="560" y="60" font-size="11" font-weight="700" fill="${d}" opacity=".65" text-anchor="middle">— but why?</text></svg>`,
 /* 15 — 한쪽으로만 넓어지는 방 */
 feed:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <circle cx="320" cy="112" r="22" fill="${c}"/>
  <text x="320" y="168" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">you</text>
  <rect x="374" y="34" width="86" height="26" rx="7" fill="${c}" opacity=".85"/><rect x="400" y="72" width="86" height="26" rx="7" fill="${c}" opacity=".7"/><rect x="410" y="112" width="86" height="26" rx="7" fill="${c}" opacity=".85"/><rect x="400" y="152" width="86" height="26" rx="7" fill="${c}" opacity=".7"/><rect x="374" y="190" width="86" height="26" rx="7" fill="${c}" opacity=".85"/>
  <path d="M344 112 L374 47" stroke="${c}" stroke-width="2.6" opacity=".55"/><path d="M344 112 L400 85" stroke="${c}" stroke-width="2.6" opacity=".55"/><path d="M344 112 L410 125" stroke="${c}" stroke-width="2.6" opacity=".55"/><path d="M344 112 L400 165" stroke="${c}" stroke-width="2.6" opacity=".55"/><path d="M344 112 L374 203" stroke="${c}" stroke-width="2.6" opacity=".55"/>
  <g opacity=".3"><rect x="180" y="72" width="86" height="26" rx="7" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="6 5"/>
   <rect x="180" y="152" width="86" height="26" rx="7" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="6 5"/>
   <path d="M296 112L266 85M296 112L266 165" stroke="${c}" stroke-width="2.4" stroke-dasharray="5 6"/></g>
  <text x="223" y="126" font-size="11" font-weight="700" fill="${d}" opacity=".5" text-anchor="middle">rarely shown</text>
  <text x="510" y="118" font-size="11" font-weight="800" fill="${d}" text-anchor="middle">more of the same</text>
  <text x="320" y="220" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">a feed is a selection, not a window</text></svg>`,
};

const STRIP = {
 "11":["map","gear","hourglass","warn","ask"],
 "12":["quote","swap","spark","pair","nope"],
 "13":["ruler","balance","frame","eye","ask"],
 "14":["letters","spark","loop","warn","tag"],
 "15":["frame","heartbeat","fire","shield","eye"]
};

const VIG = {
 "11":(c,t,d)=>`<path d="M20 100h44l24-32h58" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 126h74l22-28h30" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".32"/>
  <circle cx="20" cy="100" r="7.5" fill="#fff" stroke="${c}" stroke-width="4"/>
  <circle cx="64" cy="100" r="7.5" fill="#fff" stroke="${c}" stroke-width="4"/>
  <circle cx="88" cy="68" r="7.5" fill="#fff" stroke="${c}" stroke-width="4"/>
  <circle cx="146" cy="68" r="7.5" fill="#fff" stroke="${c}" stroke-width="4"/>
  <rect x="126" y="14" width="98" height="34" rx="9" fill="${t}" stroke="${c}" stroke-width="3"/>
  <text x="175" y="36" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">1933</text>`,
 "12":(c,t,d)=>`<circle cx="60" cy="62" r="36" fill="${t}" stroke="${c}" stroke-width="4"/>
  <path d="M46 52c0-4 3-6 5-6M68 52c0-4 3-6 5-6" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <path d="M44 72c5 8 11 11 16 11s11-3 16-11" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
  <path d="M104 62h44" stroke="${c}" stroke-width="5" stroke-linecap="round"/>
  <path d="M148 44c22 0 22 36 0 36" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>
  <circle cx="190" cy="42" r="16" fill="${c}" opacity=".7"/><circle cx="206" cy="86" r="12" fill="${c}" opacity=".4"/>
  <path d="M30 122h140" stroke="${d}" stroke-width="4" stroke-linecap="round" opacity=".25"/>`,
 "13":(c,t,d)=>`<path d="M24 118V22M24 118h190" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="48" cy="104" r="6" fill="${c}"/><circle cx="80" cy="92" r="6" fill="${c}"/><circle cx="112" cy="96" r="6" fill="${c}"/><circle cx="144" cy="68" r="6" fill="${c}"/><circle cx="176" cy="52" r="6" fill="${c}"/>
  <path d="M42 108l128-52" stroke="${c}" stroke-width="3.6" stroke-dasharray="7 6" opacity=".55"/>
  <path d="M42 96c40 18 90-30 132-46" stroke="${d}" stroke-width="3.6" fill="none" opacity=".45"/>
  <text x="196" y="112" font-size="11" font-weight="800" fill="${d}" text-anchor="end" opacity=".7">same points</text>`,
 "14":(c,t,d)=>`<rect x="14" y="26" width="92" height="88" rx="10" fill="${t}" stroke="${c}" stroke-width="4"/>
  <path d="M22 106c14-30 30-34 42-14 8 13 18 10 24-4l18 18z" fill="${c}" opacity=".55"/>
  <circle cx="44" cy="52" r="9" fill="${c}"/>
  <text x="60" y="130" font-size="11" font-weight="800" fill="${d}" text-anchor="middle">snow?</text>
  <g><path d="M132 74h34" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
   <path d="M160 66l10 8-10 8" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
  <rect x="180" y="52" width="52" height="44" rx="10" fill="${c}"/>
  <text x="206" y="80" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">wolf</text>`,
 "15":(c,t,d)=>`<circle cx="70" cy="70" r="18" fill="${c}"/>
  <rect x="114" y="22" width="60" height="18" rx="5" fill="${c}" opacity=".85"/><rect x="134" y="50" width="60" height="18" rx="5" fill="${c}" opacity=".7"/><rect x="142" y="80" width="60" height="18" rx="5" fill="${c}" opacity=".85"/><rect x="126" y="110" width="60" height="18" rx="5" fill="${c}" opacity=".6"/>
  <path d="M88 70 L114 31" stroke="${c}" stroke-width="2.6" opacity=".5"/><path d="M88 70 L134 59" stroke="${c}" stroke-width="2.6" opacity=".5"/><path d="M88 70 L142 89" stroke="${c}" stroke-width="2.6" opacity=".5"/><path d="M88 70 L126 119" stroke="${c}" stroke-width="2.6" opacity=".5"/>
  <g opacity=".28"><rect x="6" y="34" width="46" height="16" rx="5" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 5"/>
   <rect x="6" y="96" width="46" height="16" rx="5" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 5"/></g>`,
};

module.exports = { icons, scenes, STRIP, VIG };
