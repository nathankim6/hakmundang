/* Unit 6 삽화 — 레슨 아이콘 · 배너 장면 · Knowledge Bank 비네트 */

const icons = {
 always:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="12" y="8" width="40" height="48" rx="6" stroke="${c}" stroke-width="3"/>
  <rect x="19" y="17" width="26" height="8" rx="3" fill="${c}"/>
  <rect x="19" y="30" width="26" height="8" rx="3" fill="${c}" opacity=".6"/>
  <rect x="19" y="43" width="18" height="8" rx="3" fill="${c}" opacity=".35"/>
  <circle cx="50" cy="12" r="8" fill="${c}"/>
  <path d="M50 8v5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="50" cy="16.5" r="1.5" fill="#fff"/></svg>`,
 virtual:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 24h48a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-9l-6-6H23l-6 6H8a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="19" cy="33" r="5" fill="${c}"/><circle cx="45" cy="33" r="5" fill="${c}"/>
  <path d="M20 18c4-6 20-6 24 0" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".5"/></svg>`,
 wellbeing:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="10" y="10" width="44" height="34" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M24 54h16" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 44v10" stroke="${c}" stroke-width="3.2"/>
  <path d="M17 34c5-3 7-10 9-10s3 8 6 8 5-10 8-10 4 8 7 10" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="47" cy="20" r="3.4" fill="${c}"/></svg>`,
 aiwinter:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 8v48M12 20l40 24M52 20L12 44" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M32 14l-5 6h10zM32 50l-5-6h10z" fill="${c}"/>
  <circle cx="32" cy="32" r="7" fill="${c}" opacity=".25"/>
  <circle cx="32" cy="32" r="3.4" fill="${c}"/>
  <circle cx="12" cy="20" r="3" fill="${c}"/><circle cx="52" cy="20" r="3" fill="${c}"/>
  <circle cx="12" cy="44" r="3" fill="${c}"/><circle cx="52" cy="44" r="3" fill="${c}"/></svg>`,
 unsaid:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M10 12h44a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H26L14 50V40h-4a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 22h26M16 30h14" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="40" cy="30" r="2" fill="${c}"/><circle cx="47" cy="30" r="2" fill="${c}"/>
  <circle cx="54" cy="30" r="2" fill="${c}"/></svg>`,
};

const scenes = {
 always:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <text x="60" y="40" font-size="12" font-weight="800" fill="${d}">ONE MORNING</text>
  <rect x="60" y="58" width="520" height="30" rx="8" fill="${c}" opacity=".16"/>
  <g><path d="M118 52v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="118" cy="48" r="4" fill="${c}"/></g><g><path d="M166 52v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="166" cy="48" r="4" fill="${c}"/></g><g><path d="M204 52v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="204" cy="48" r="4" fill="${c}"/></g><g><path d="M272 52v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="272" cy="48" r="4" fill="${c}"/></g><g><path d="M318 52v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="318" cy="48" r="4" fill="${c}"/></g><g><path d="M352 52v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="352" cy="48" r="4" fill="${c}"/></g><g><path d="M430 52v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="430" cy="48" r="4" fill="${c}"/></g><g><path d="M466 52v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="466" cy="48" r="4" fill="${c}"/></g><g><path d="M528 52v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="528" cy="48" r="4" fill="${c}"/></g>
  <text x="60" y="122" font-size="11" fill="${d}" opacity=".7">each mark is a ten-second message</text>
  <rect x="60" y="146" width="520" height="30" rx="8" fill="${c}" opacity=".16"/>
  <g><rect x="118" y="146" width="34" height="30" rx="8" fill="${c}" opacity=".45"/><path d="M118 140v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g><g><rect x="166" y="146" width="26" height="30" rx="8" fill="${c}" opacity=".45"/><path d="M166 140v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g><g><rect x="204" y="146" width="44" height="30" rx="8" fill="${c}" opacity=".45"/><path d="M204 140v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g><g><rect x="272" y="146" width="32" height="30" rx="8" fill="${c}" opacity=".45"/><path d="M272 140v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g><g><rect x="318" y="146" width="24" height="30" rx="8" fill="${c}" opacity=".45"/><path d="M318 140v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g><g><rect x="352" y="146" width="42" height="30" rx="8" fill="${c}" opacity=".45"/><path d="M352 140v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g><g><rect x="430" y="146" width="26" height="30" rx="8" fill="${c}" opacity=".45"/><path d="M430 140v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g><g><rect x="466" y="146" width="38" height="30" rx="8" fill="${c}" opacity=".45"/><path d="M466 140v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g><g><rect x="528" y="146" width="30" height="30" rx="8" fill="${c}" opacity=".45"/><path d="M528 140v42" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/></g>
  <text x="60" y="210" font-size="11" fill="${d}" opacity=".7">the shaded tails are what stays behind</text>
  <text x="580" y="40" font-size="12" font-weight="800" fill="${c}" text-anchor="end">attention residue</text></svg>`,
 virtual:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <rect x="46" y="34" width="548" height="160" rx="16" fill="${t}" stroke="${c}" stroke-width="3.4" stroke-dasharray="12 9"/>
  <text x="320" y="24" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">A ROOM WHERE FAILURE COSTS NOTHING</text>
  <g><rect x="76" y="62" width="120" height="86" rx="10" fill="#fff" stroke="${c}" stroke-width="3"/><path d="M96 118c14-22 26-24 36-6 6 11 14 9 20-2" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="106" cy="86" r="8" fill="${c}" opacity=".55"/><text x="136" y="176" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">a rare operation</text></g><g><rect x="218" y="62" width="120" height="86" rx="10" fill="#fff" stroke="${c}" stroke-width="3"/><path d="M242 130V88h56v42z" stroke="${c}" stroke-width="3.2" fill="none" stroke-linejoin="round"/><path d="M242 88l28-18 28 18" stroke="${c}" stroke-width="3.2" fill="none" stroke-linejoin="round"/><text x="278" y="176" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">a building not yet built</text></g><g><rect x="360" y="62" width="120" height="86" rx="10" fill="#fff" stroke="${c}" stroke-width="3"/><path d="M380 132h80" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><path d="M396 132V96h20v36" stroke="${c}" stroke-width="3.2" fill="none"/><circle cx="406" cy="86" r="8" fill="${c}"/><text x="420" y="176" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">a fear faced safely</text></g><g><rect x="446" y="62" width="120" height="86" rx="10" fill="#fff" stroke="${c}" stroke-width="3"/><path d="M466 128l16-28 14 20 12-14 14 22z" fill="${c}" opacity=".35"/><path d="M462 132h96" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><path d="M478 92h30" stroke="${c}" stroke-width="3.2" stroke-linecap="round" opacity=".5"/><text x="506" y="176" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">weather never seen</text></g>
  </svg>`,
 wellbeing:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><rect x="52" y="46" width="232" height="140" rx="12" fill="${t}" stroke="${c}" stroke-width="3.4"/>
   <text x="168" y="74" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">TWO HOURS</text>
   <circle cx="120" cy="118" r="20" fill="${c}"/><circle cx="216" cy="118" r="20" fill="${c}"/>
   <path d="M140 118h56" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
   <path d="M150 106l-8 12 8 12M186 106l8 12-8 12" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
   <text x="168" y="166" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">talking with a friend</text></g>
  <g><rect x="356" y="46" width="232" height="140" rx="12" fill="#fff" stroke="${c}" stroke-width="3.4" stroke-dasharray="8 7"/>
   <text x="472" y="74" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">TWO HOURS</text>
   <rect x="392" y="96" width="160" height="14" rx="5" fill="${c}" opacity=".7"/><rect x="392" y="116" width="132" height="14" rx="5" fill="${c}" opacity=".45"/><rect x="392" y="136" width="160" height="14" rx="5" fill="${c}" opacity=".28"/>
   <text x="472" y="166" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">scrolling past strangers</text></g>
  <text x="320" y="218" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">the same number, a different hour</text></svg>`,
 aiwinter:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M60 176V44M60 176h520" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M76 150c40-70 96-84 132-30 26 40 8 82-18 96" stroke="${c}" stroke-width="4.6" fill="none" stroke-linecap="round"/>
  <path d="M190 216" stroke="none"/>
  <path d="M198 164c56-56 116-58 156-8 30 38 12 84-20 96" stroke="${c}" stroke-width="4.6" fill="none" stroke-linecap="round"/>
  <path d="M340 168c60-46 128-40 176 8" stroke="${c}" stroke-width="4.6" fill="none" stroke-linecap="round"/>
  <rect x="186" y="44" width="44" height="132" fill="${c}" opacity=".12"/><text x="208" y="38" font-size="11" font-weight="800" fill="${d}" text-anchor="middle" opacity=".7">AI winter</text><rect x="340" y="44" width="44" height="132" fill="${c}" opacity=".12"/><text x="362" y="38" font-size="11" font-weight="800" fill="${d}" text-anchor="middle" opacity=".7">AI winter</text>
  <text x="150" y="34" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">1956 · the name</text>
  <text x="320" y="216" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">promises, then winters, then a slower climb</text></svg>`,
 unsaid:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><path d="M56 40h250a10 10 0 0 1 10 10v52a10 10 0 0 1-10 10H128l-24 20v-20H56a10 10 0 0 1-10-10V50a10 10 0 0 1 10-10z" fill="${c}"/>
   <text x="180" y="82" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">&#8220;The seats were comfortable.&#8221;</text></g>
  <path d="M182 138v24" stroke="${c}" stroke-width="3" stroke-dasharray="5 6"/>
  <path d="M175 156l7 8 7-8" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g><rect x="60" y="168" width="244" height="38" rx="10" fill="#fff" stroke="${c}" stroke-width="3" stroke-dasharray="7 6"/>
   <text x="182" y="193" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">&#8220;The film was not good.&#8221;</text></g>
  <g><rect x="356" y="52" width="236" height="128" rx="12" fill="${t}" stroke="${c}" stroke-width="3"/>
   <text x="474" y="80" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">THE SHARED RULES</text>
   <g><circle cx="386" cy="104" r="5" fill="${c}"/><text x="400" y="109" font-size="12" font-weight="700" fill="${d}">say enough</text></g><g><circle cx="386" cy="128" r="5" fill="${c}"/><text x="400" y="133" font-size="12" font-weight="700" fill="${d}">say the true</text></g><g><circle cx="386" cy="152" r="5" fill="${c}"/><text x="400" y="157" font-size="12" font-weight="700" fill="${d}">stay relevant</text></g>
  </g></svg>`,
};

const STRIP = {
 "26":["hourglass","warn","loop","alone","shield"],
 "27":["frame","spark","heartbeat","dome","warn"],
 "28":["ruler","pair","frame","ask","balance"],
 "29":["spark","gear","wilt","sunrise","ruler"],
 "30":["quote","chat","swap","globe","ask"]
};

const VIG = {
 "26":(c,t,d)=>`<rect x="10" y="46" width="212" height="26" rx="8" fill="${c}" opacity=".16"/><g><rect x="44" y="46" width="20" height="26" rx="8" fill="${c}" opacity=".45"/><path d="M44 40v38" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/><circle cx="44" cy="36" r="3.6" fill="${c}"/></g><g><rect x="78" y="46" width="16" height="26" rx="8" fill="${c}" opacity=".45"/><path d="M78 40v38" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/><circle cx="78" cy="36" r="3.6" fill="${c}"/></g><g><rect x="112" y="46" width="26" height="26" rx="8" fill="${c}" opacity=".45"/><path d="M112 40v38" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/><circle cx="112" cy="36" r="3.6" fill="${c}"/></g><g><rect x="158" y="46" width="18" height="26" rx="8" fill="${c}" opacity=".45"/><path d="M158 40v38" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/><circle cx="158" cy="36" r="3.6" fill="${c}"/></g><g><rect x="190" y="46" width="22" height="26" rx="8" fill="${c}" opacity=".45"/><path d="M190 40v38" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/><circle cx="190" cy="36" r="3.6" fill="${c}"/></g><text x="116" y="104" font-size="11" font-weight="700" fill="${d}" text-anchor="middle" opacity=".72">the tail is the cost</text>`,
 "27":(c,t,d)=>`<rect x="16" y="30" width="98" height="76" rx="10" fill="${t}" stroke="${c}" stroke-width="4"/>
  <circle cx="46" cy="68" r="11" fill="${c}"/><circle cx="86" cy="68" r="11" fill="${c}"/>
  <path d="M40 42c8-8 32-8 40 0" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".5"/>
  <path d="M128 68h32" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <path d="M152 60l10 8-10 8" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="172" y="34" width="56" height="68" rx="9" fill="#fff" stroke="${c}" stroke-width="3.4" stroke-dasharray="6 6"/>
  <path d="M186 92c8-22 18-26 28-8" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <circle cx="200" cy="56" r="7" fill="${c}" opacity=".5"/>`,
 "28":(c,t,d)=>`<rect x="14" y="26" width="96" height="88" rx="10" fill="${t}" stroke="${c}" stroke-width="3.4"/>
  <circle cx="44" cy="70" r="13" fill="${c}"/><circle cx="80" cy="70" r="13" fill="${c}"/>
  <path d="M57 70h10" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <rect x="130" y="26" width="96" height="88" rx="10" fill="#fff" stroke="${c}" stroke-width="3.4" stroke-dasharray="7 6"/>
  <rect x="148" y="44" width="60" height="12" rx="4" fill="${c}" opacity=".7"/><rect x="148" y="62" width="48" height="12" rx="4" fill="${c}" opacity=".45"/><rect x="148" y="80" width="60" height="12" rx="4" fill="${c}" opacity=".28"/><rect x="148" y="98" width="36" height="12" rx="4" fill="${c}" opacity=".18"/>`,
 "29":(c,t,d)=>`<path d="M14 112V22M14 112h212" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <path d="M26 96c22-46 54-56 76-18 16 28 4 52-12 62" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
  <path d="M104 104c32-38 68-38 92-6" stroke="${c}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
  <rect x="84" y="22" width="22" height="90" fill="${c}" opacity=".12"/>
  <rect x="186" y="22" width="22" height="90" fill="${c}" opacity=".12"/>
  <text x="95" y="18" font-size="9.5" font-weight="800" fill="${d}" text-anchor="middle" opacity=".7">winter</text>
  <text x="197" y="18" font-size="9.5" font-weight="800" fill="${d}" text-anchor="middle" opacity=".7">winter</text>`,
 "30":(c,t,d)=>`<path d="M16 30h150a9 9 0 0 1 9 9v34a9 9 0 0 1-9 9H68l-18 15V82H16a9 9 0 0 1-9-9V39a9 9 0 0 1 9-9z" fill="${c}"/>
  <path d="M30 48h96M30 62h58" stroke="#fff" stroke-width="4.4" stroke-linecap="round" opacity=".9"/>
  <path d="M96 104v14" stroke="${c}" stroke-width="3.4" stroke-dasharray="5 5"/>
  <rect x="24" y="120" width="150" height="14" rx="6" fill="#fff" stroke="${c}" stroke-width="3" stroke-dasharray="6 5"/>
  <circle cx="206" cy="56" r="5" fill="${c}" opacity=".6"/>
  <circle cx="206" cy="76" r="5" fill="${c}" opacity=".4"/>
  <circle cx="206" cy="96" r="5" fill="${c}" opacity=".25"/>`,
};

module.exports = { icons, scenes, STRIP, VIG };
