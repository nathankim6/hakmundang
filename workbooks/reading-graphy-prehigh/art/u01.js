/* Unit 1 삽화 — 레슨 아이콘 · 배너 장면 · Knowledge Bank 비네트 */
/* 원본 플랫 벡터 삽화 — 테마별 장면 + 아이콘 */
const ink="#2B2A28", line="#3A3936";

/* 레슨 원형 아이콘 */
const icons = {
 translation:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="14" width="21" height="34" rx="3" fill="${c}"/>
  <rect x="35" y="14" width="21" height="34" rx="3" fill="${c}" opacity=".28"/>
  <path d="M29 31h6" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M32.5 27.5 36 31l-3.5 3.5" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13 22h11M13 27h8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`,
 image:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="9" y="13" width="46" height="34" rx="3.5" stroke="${c}" stroke-width="3"/>
  <path d="M20 38c4-8 9-9 13-4 2 2.6 4 2 6-1" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="24" cy="24" r="3.4" fill="${c}"/>
  <path d="M22 53h20" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".45"/></svg>`,
 practice:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="7" y="24" width="50" height="20" rx="2.5" fill="${c}" opacity=".18"/>
  <rect x="7" y="24" width="50" height="20" rx="2.5" stroke="${c}" stroke-width="2.6"/>
  <path d="M17 24v13M27 24v13M37 24v13M47 24v13" stroke="${c}" stroke-width="2.4"/>
  <path d="M32 8l5 9h-10l5-9z" fill="${c}"/></svg>`,
 shelter:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M12 46a20 20 0 0 1 40 0" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 46h48" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M24 46V32h4v-5l4 4 4-4v5h4v14" fill="${c}" opacity=".3"/>
  <path d="M24 46V32h4v-5l4 4 4-4v5h4v14" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/></svg>`,
 talk:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="12" width="26" height="19" rx="4" fill="${c}"/>
  <path d="M15 31v6l7-6z" fill="${c}"/>
  <rect x="30" y="27" width="26" height="19" rx="4" fill="${c}" opacity=".3"/>
  <path d="M49 46v6l-7-6z" fill="${c}" opacity=".3"/>
  <path d="M14 19h14M14 24h9" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`,
};

/* 본문 삽화 (가로 배너, viewBox 640×230) */
const scenes = {
translation:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
 <!-- 원작 -->
 <g><rect x="58" y="52" width="112" height="140" rx="6" fill="${c}"/>
 <rect x="58" y="52" width="16" height="140" rx="4" fill="${d}"/>
 <path d="M92 84h58M92 100h46M92 116h58M92 132h38" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".9"/>
 <text x="114" y="212" font-size="14" font-weight="700" fill="${d}" text-anchor="middle">THE ORIGINAL</text></g>
 <!-- 번역본 -->
 <g><rect x="470" y="52" width="112" height="140" rx="6" fill="${c}" opacity=".3"/>
 <rect x="470" y="52" width="16" height="140" rx="4" fill="${d}" opacity=".38"/>
 <path d="M504 84h58M504 100h46M504 116h58M504 132h38" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".95"/>
 <text x="526" y="212" font-size="14" font-weight="700" fill="${d}" opacity=".6" text-anchor="middle">THE TRANSLATION</text></g>
 <!-- 흐르는 입자 : 점점 옅어짐 -->
 <path d="M186 122c46-46 106-46 152 0s106 46 138 0" stroke="${c}" stroke-width="2.5" stroke-dasharray="7 8" opacity=".55"/>
 ${[0,1,2,3,4,5,6].map(i=>{const x=196+i*44,o=(1-i*0.13).toFixed(2),r=(11-i*0.9).toFixed(1),y=[96,84,92,110,128,136,124][i];
   return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`}).join("")}
 <path d="M330 168h-1" stroke="${c}"/>
 <text x="320" y="196" font-size="13" fill="${d}" opacity=".75" text-anchor="middle">the moment · the local colour · the flow</text>
</svg>`,

image:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
 <!-- 액자 -->
 <rect x="150" y="30" width="340" height="150" rx="6" fill="#FFFDF8" stroke="${d}" stroke-width="7"/>
 <!-- 파이프 -->
 <path d="M250 108h84c0 24-18 34-34 34s-34-12-34-34z" fill="${c}"/>
 <path d="M250 108c0-9-9-13-16-8" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
 <path d="M334 108h44c9 0 13 6 13 13" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
 <text x="320" y="164" font-size="16" font-style="italic" fill="${d}" text-anchor="middle">Ceci n'est pas une pipe.</text>
 <!-- 액자 밖 : 실제 파이프의 그림자 -->
 <g opacity=".22">
  <path d="M60 176h46c0 13-10 19-19 19s-19-7-19-19z" fill="${d}"/>
  <path d="M60 176c0-5-5-7-9-4" stroke="${d}" stroke-width="5" stroke-linecap="round"/>
  <path d="M106 176h24c5 0 7 3 7 7" stroke="${d}" stroke-width="5" stroke-linecap="round"/></g>
 <text x="98" y="216" font-size="12" font-weight="700" fill="${d}" opacity=".55" text-anchor="middle">THE THING</text>
 <text x="530" y="216" font-size="12" font-weight="700" fill="${d}" opacity=".55" text-anchor="middle">A VERSION OF IT</text>
 <path d="M150 205h330" stroke="${d}" stroke-width="1.5" stroke-dasharray="5 6" opacity=".3"/>
</svg>`,

practice:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
 <!-- 건반 -->
 <g><rect x="40" y="120" width="240" height="72" rx="5" fill="#FFFDF8" stroke="${d}" stroke-width="3"/>
 ${[0,1,2,3,4,5,6].map(i=>`<path d="M${40+34.3*(i+1)} 120v72" stroke="${d}" stroke-width="2"/>`).join("")}
 ${[0,1,3,4,5].map(i=>`<rect x="${40+34.3*(i+1)-9}" y="120" width="18" height="42" rx="2.5" fill="${d}"/>`).join("")}
 <text x="160" y="212" font-size="13" font-weight="700" fill="${d}" text-anchor="middle">OFFSTAGE · the engineer</text></g>
 <!-- 볼트 -->
 <g fill="${c}">${[0,1,2].map(i=>`<g transform="translate(${64+i*46},74)"><path d="M0 -13 11.3 -6.5 11.3 6.5 0 13 -11.3 6.5 -11.3 -6.5z"/><circle r="5" fill="${t}"/></g>`).join("")}</g>
 <!-- 화살표 -->
 <path d="M300 130c40-8 62-30 74-58" stroke="${c}" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round"/>
 <path d="M372 70l4 14-14-3" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
 <!-- 종이비행기 -->
 <g transform="translate(470,58) rotate(-14)">
  <path d="M0 0 96 30 44 42 30 78z" fill="${c}"/>
  <path d="M0 0 44 42 30 78z" fill="${d}" opacity=".55"/></g>
 <path d="M406 122c46 12 92 4 128-24" stroke="${c}" stroke-width="2.4" stroke-dasharray="6 8" opacity=".5"/>
 <text x="500" y="196" font-size="13" font-weight="700" fill="${d}" text-anchor="middle">ONSTAGE · the pilot</text>
</svg>`,

shelter:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
 <!-- 유리 돔 -->
 <path d="M180 186a140 140 0 0 1 280 0z" fill="#FFFFFF" opacity=".62"/>
 <path d="M180 186a140 140 0 0 1 280 0" stroke="${c}" stroke-width="3.5"/>
 <path d="M150 186h340" stroke="${d}" stroke-width="5" stroke-linecap="round"/>
 <!-- 성 -->
 <g fill="${c}">
  <rect x="262" y="112" width="30" height="74" rx="2"/><rect x="348" y="112" width="30" height="74" rx="2"/>
  <rect x="292" y="132" width="56" height="54" rx="2" opacity=".8"/>
  <path d="M262 112h30l-15-24zM348 112h30l-15-24z"/>
  <path d="M292 132h56l-28-22z" opacity=".8"/></g>
 <rect x="312" y="156" width="16" height="30" rx="7" fill="${t}"/>
 <circle cx="277" cy="140" r="5" fill="${t}"/><circle cx="363" cy="140" r="5" fill="${t}"/>
 <!-- 반짝임 -->
 <path d="M226 118l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#fff" opacity=".85"/>
 <!-- 돔 밖의 물레 -->
 <g transform="translate(546,150)"><circle r="30" fill="none" stroke="${d}" stroke-width="3.5" opacity=".75"/>
  ${[0,1,2,3,4,5].map(i=>`<path d="M0 0 L${(30*Math.cos(i*Math.PI/3)).toFixed(1)} ${(30*Math.sin(i*Math.PI/3)).toFixed(1)}" stroke="${d}" stroke-width="2.6" opacity=".7"/>`).join("")}
  <circle r="5" fill="${d}" opacity=".8"/><path d="M0 30v14" stroke="${d}" stroke-width="3.5" opacity=".7"/></g>
 <text x="546" y="214" font-size="12" font-weight="700" fill="${d}" opacity=".6" text-anchor="middle">RISK, LEFT OUTSIDE</text>
 <text x="320" y="214" font-size="12" font-weight="700" fill="${d}" opacity=".6" text-anchor="middle">A WORLD WITH NOTHING DANGEROUS IN IT</text>
</svg>`,

talk:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
 <!-- 책 -->
 <g transform="translate(320,168)">
  <path d="M-92 0c30-20 62-20 92-6 30-14 62-14 92 6-30 16-62 16-92 4-30 12-62 12-92-4z" fill="#FFFDF8" stroke="${d}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M0 -6v10" stroke="${d}" stroke-width="3"/></g>
 <!-- 말풍선 3 -->
 <g><rect x="52" y="36" width="188" height="66" rx="16" fill="${c}"/>
  <path d="M92 102v18l20-18z" fill="${c}"/>
  <path d="M76 60h124M76 78h84" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".92"/></g>
 <g><rect x="272" y="20" width="146" height="56" rx="16" fill="${c}" opacity=".42"/>
  <path d="M304 76v16l18-16z" fill="${c}" opacity=".42"/>
  <path d="M294 42h102M294 58h64" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></g>
 <g><rect x="424" y="52" width="164" height="60" rx="16" fill="${c}" opacity=".72"/>
  <path d="M456 112v16l18-16z" fill="${c}" opacity=".72"/>
  <path d="M446 76h114M446 92h72" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></g>
 <path d="M150 128c34 26 96 34 150 22M470 122c-34 22-88 30-140 26" stroke="${c}" stroke-width="2.4" stroke-dasharray="6 8" opacity=".5"/>
 <text x="320" y="212" font-size="13" font-weight="700" fill="${d}" opacity=".7" text-anchor="middle">one book · one long conversation</text>
</svg>`,
};


const STRIP = {
 "01":["globe","swap","hourglass","palette","handshake"],
 "02":["eye","letters","frame","camera","pipe"],
 "03":["heartbeat","hourglass","quote","wrench","takeoff"],
 "04":["wand","fire","dome","wilt","sunrise"],
 "05":["books","map","openbook","chat","loop"],
};
const VIG = {
"01":(c,l,d)=>`<circle cx="72" cy="70" r="42" fill="${l}"/><circle cx="72" cy="70" r="42" stroke="${c}" stroke-width="4.3" fill="none"/>
 <path d="M34 54h76M30 70h84M34 86h76" stroke="${c}" stroke-width="3.5" opacity=".55"/>
 <path d="M48 44c18 14 32 34 40 56M96 44C80 60 68 82 62 100" stroke="${d}" stroke-width="3.8" opacity=".8" fill="none"/>
 <circle cx="60" cy="62" r="5" fill="${d}" opacity=".5"/><circle cx="88" cy="84" r="7" fill="${d}" opacity=".4"/>
 <g transform="translate(150,44) rotate(24)"><rect width="72" height="15" rx="7.5" fill="${c}"/><rect x="62" y="-4" width="16" height="23" rx="5" fill="${d}"/></g>
 <path d="M158 92l10 26M186 84l-6 34" stroke="${c}" stroke-width="4.3" stroke-linecap="round"/><path d="M150 122h48" stroke="${c}" stroke-width="4.9" stroke-linecap="round"/>`,
"02":(c,l,d)=>`<rect x="18" y="30" width="96" height="76" rx="7" fill="${l}" stroke="${c}" stroke-width="4.3"/>
 <path d="M46 30l7-11h24l7 11" fill="none" stroke="${c}" stroke-width="4.3" stroke-linejoin="round"/>
 <circle cx="66" cy="68" r="24" fill="${c}"/><circle cx="66" cy="68" r="11" fill="${l}"/><circle cx="97" cy="43" r="4" fill="${d}"/>
 <rect x="134" y="26" width="88" height="66" rx="4" fill="#FFFDF8" stroke="${d}" stroke-width="7.2"/>
 <path d="M150 74c10-18 20-20 28-9 5 5 9 4 11-3" stroke="${c}" stroke-width="4.3" fill="none" stroke-linecap="round"/>
 <circle cx="158" cy="48" r="6" fill="${c}"/><path d="M140 104h76" stroke="${d}" stroke-width="4.3" stroke-linecap="round" stroke-dasharray="5 6" opacity=".6"/>`,
"03":(c,l,d)=>`<rect x="16" y="34" width="120" height="72" rx="10" fill="${l}" stroke="${c}" stroke-width="4.3"/>
 <circle cx="52" cy="66" r="17" fill="#FFFDF8" stroke="${c}" stroke-width="3.8"/><path d="M52 54v12l8 5" stroke="${c}" stroke-width="4.1" stroke-linecap="round" fill="none"/>
 <circle cx="100" cy="66" r="17" fill="#FFFDF8" stroke="${c}" stroke-width="3.8"/><path d="M92 66h16M100 58v16" stroke="${d}" stroke-width="4.1" stroke-linecap="round"/>
 <rect x="34" y="90" width="84" height="8" rx="4" fill="${c}" opacity=".35"/>
 <g transform="translate(196,42) rotate(-16)"><path d="M0 0 44 14 20 20 14 38z" fill="${c}"/><path d="M0 0 20 20 14 38z" fill="${d}" opacity=".6"/></g>
 <path d="M148 92c22 6 40 0 56-16" stroke="${c}" stroke-width="3.8" stroke-dasharray="5 7" fill="none"/>
 <g fill="${d}">${[0,1,2].map(i=>`<g transform="translate(${160+i*24},112)"><path d="M0 -8 7 -4 7 4 0 8 -7 4 -7 -4z"/><circle r="3" fill="${l}"/></g>`).join("")}</g>`,
"04":(c,l,d)=>`<g transform="translate(66,74)"><circle r="40" fill="none" stroke="${c}" stroke-width="4.9"/>
 ${[0,1,2,3,4,5,6,7].map(i=>`<path d="M0 0 L${(40*Math.cos(i*Math.PI/4)).toFixed(1)} ${(40*Math.sin(i*Math.PI/4)).toFixed(1)}" stroke="${c}" stroke-width="3.5"/>`).join("")}
 <circle r="7" fill="${c}"/></g>
 <path d="M66 114v14M50 128h32" stroke="${c}" stroke-width="4.9" stroke-linecap="round"/>
 <path d="M132 104a34 34 0 0 1 68 0z" fill="#FFFFFF" opacity=".7"/><path d="M132 104a34 34 0 0 1 68 0" stroke="${c}" stroke-width="4.3" fill="none"/>
 <path d="M124 104h84" stroke="${d}" stroke-width="4.9" stroke-linecap="round"/>
 <g fill="${c}"><rect x="150" y="66" width="12" height="38" rx="2"/><rect x="170" y="66" width="12" height="38" rx="2"/><rect x="162" y="78" width="8" height="26" opacity=".7"/>
 <path d="M150 66h12l-6-11zM170 66h12l-6-11z"/></g>
 <path d="M112 44l2.6 7.4 7.4 2.6-7.4 2.6L112 64l-2.6-7.4-7.4-2.6 7.4-2.6z" fill="${d}"/>`,
"05":(c,l,d)=>`<g transform="translate(120,86)">${[0,1,2,3,4,5].map(i=>{const a=i*Math.PI/3-Math.PI/2;const x=(66*Math.cos(a)).toFixed(1),y=(30*Math.sin(a)).toFixed(1);
 return `<g transform="translate(${x},${y})"><rect x="-11" y="-8" width="22" height="16" rx="4" fill="${i%2?l:c}" stroke="${c}" stroke-width="2.9"/><rect x="-8" y="8" width="16" height="10" rx="3" fill="${c}" opacity=".45"/></g>`}).join("")}</g>
 <ellipse cx="120" cy="86" rx="40" ry="18" fill="${l}" stroke="${c}" stroke-width="3.8"/>
 <path d="M96 86c8-6 16-6 24-2 8-4 16-4 24 2-8 5-16 5-24 1-8 4-16 4-24-1z" fill="#FFFDF8" stroke="${c}" stroke-width="3.2" stroke-linejoin="round"/>
 <g><rect x="24" y="14" width="72" height="30" rx="9" fill="${c}"/><path d="M40 44v10l11-10z" fill="${c}"/><path d="M36 26h48M36 35h30" stroke="#fff" stroke-width="4.9" stroke-linecap="round"/></g>
 <g><rect x="146" y="18" width="66" height="27" rx="9" fill="${d}" opacity=".5"/><path d="M196 45v9l-10-9z" fill="${d}" opacity=".5"/><path d="M158 29h42M158 37h24" stroke="#fff" stroke-width="4.6" stroke-linecap="round"/></g>`,
};

module.exports = { icons, scenes, STRIP, VIG };
