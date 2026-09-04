/* 픽토그램 라이브러리 — viewBox 48×48, 2톤 플랫 */
const P = (c,d)=>({c,d});
const S = {
 globe:(c,l)=>`<circle cx="24" cy="24" r="17" fill="${l}"/><circle cx="24" cy="24" r="17" stroke="${c}" stroke-width="2.6" fill="none"/><ellipse cx="24" cy="24" rx="7.5" ry="17" stroke="${c}" stroke-width="2.2" fill="none"/><path d="M7 24h34M10 15h28M10 33h28" stroke="${c}" stroke-width="2.2"/>`,
 swap:(c,l)=>`<rect x="6" y="8" width="15" height="32" rx="3" fill="${c}"/><rect x="27" y="8" width="15" height="32" rx="3" fill="${l}"/><path d="M21 18h6M21 30h6" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/><path d="M24.5 15.5 28 18l-3.5 2.5M24.5 27.5 21 30l3.5 2.5" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
 hourglass:(c,l)=>`<path d="M13 7h22M13 41h22" stroke="${c}" stroke-width="3" stroke-linecap="round"/><path d="M16 7c0 9 8 12 8 17s-8 8-8 17M32 7c0 9-8 12-8 17s8 8 8 17" stroke="${c}" stroke-width="2.6" fill="none"/><path d="M18 36c2-5 10-5 12 0z" fill="${c}"/><path d="M18 12c2 5 10 5 12 0z" fill="${l}"/>`,
 palette:(c,l)=>`<path d="M24 8c9 0 16 6 16 13 0 5-4 6-7 6h-3c-2 0-3 2-2 4 1 3-1 5-4 5-9 0-16-7-16-15S15 8 24 8z" fill="${l}" stroke="${c}" stroke-width="2.4"/><circle cx="17" cy="20" r="2.6" fill="${c}"/><circle cx="25" cy="16" r="2.6" fill="${c}"/><circle cx="32" cy="21" r="2.6" fill="${c}"/>`,
 handshake:(c,l)=>`<path d="M6 22l8-6 10 4 10-4 8 6-8 12-6-4-4 4-4-4-6 4z" fill="${l}" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 26l6 5 6-5" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
 eye:(c,l)=>`<path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z" fill="${l}" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="24" cy="24" r="6" fill="${c}"/>`,
 letters:(c,l)=>`<rect x="5" y="12" width="17" height="17" rx="3" fill="${c}"/><rect x="26" y="19" width="17" height="17" rx="3" fill="${l}" stroke="${c}" stroke-width="2.2"/><path d="M10 25l3.5-8 3.5 8M11 22h5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M31 31h7M31 26h7" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`,
 frame:(c,l)=>`<rect x="6" y="9" width="36" height="26" rx="3" fill="${l}" stroke="${c}" stroke-width="2.6"/><path d="M13 29c4-7 8-8 11-3 2 2.5 4 2 5-1" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="17" cy="17" r="2.8" fill="${c}"/><path d="M17 41h14" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`,
 camera:(c,l)=>`<rect x="5" y="14" width="38" height="24" rx="4" fill="${l}" stroke="${c}" stroke-width="2.4"/><path d="M17 14l3-5h8l3 5" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="26" r="7.5" fill="${c}"/><circle cx="24" cy="26" r="3.2" fill="${l}"/>`,
 pipe:(c,l)=>`<path d="M8 22h20c0 8-5 11-10 11S8 30 8 22z" fill="${c}"/><path d="M8 22c0-4-4-6-7-3" stroke="${c}" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M28 22h11c3 0 4 2 4 5" stroke="${c}" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M6 40h36" stroke="${l}" stroke-width="3.4" stroke-linecap="round"/>`,
 heartbeat:(c,l)=>`<circle cx="24" cy="24" r="17" fill="${l}"/><path d="M8 25h7l3-8 5 16 4-10 3 4h10" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
 quote:(c,l)=>`<rect x="5" y="9" width="38" height="26" rx="5" fill="${c}"/><path d="M14 35v7l8-7z" fill="${c}"/><path d="M15 17c-3 0-4 2-4 4s2 3 4 3 3-1 3-3c0-4-2-4-3-4zM28 17c-3 0-4 2-4 4s2 3 4 3 3-1 3-3c0-4-2-4-3-4z" fill="#fff"/>`,
 wrench:(c,l)=>`<path d="M32 8a9 9 0 0 0-8 13L9 36a3.5 3.5 0 0 0 5 5l15-15a9 9 0 1 0 3-18z" fill="${l}" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="33" cy="17" r="4" fill="${c}"/>`,
 takeoff:(c,l)=>`<path d="M6 10l34 11-18 4-5 13z" fill="${c}"/><path d="M6 10l16 15-5 13z" fill="${l}"/><path d="M8 41h32" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="4 5"/>`,
 wand:(c,l)=>`<path d="M10 38L34 14" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M34 6l1.8 5.2L41 13l-5.2 1.8L34 20l-1.8-5.2L27 13l5.2-1.8z" fill="${c}"/><circle cx="14" cy="12" r="2.6" fill="${l}" stroke="${c}" stroke-width="1.8"/><circle cx="40" cy="32" r="2.2" fill="${l}" stroke="${c}" stroke-width="1.8"/>`,
 fire:(c,l)=>`<path d="M24 6c6 8 12 11 12 20a12 12 0 0 1-24 0c0-6 4-9 6-13 1 4 3 5 4 6 1-5 0-9 2-13z" fill="${l}" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 40a6 6 0 0 1-6-6c0-3 3-5 4-8 2 3 8 4 8 8a6 6 0 0 1-6 6z" fill="${c}"/>`,
 dome:(c,l)=>`<path d="M8 36a16 16 0 0 1 32 0z" fill="${l}"/><path d="M8 36a16 16 0 0 1 32 0" stroke="${c}" stroke-width="2.6" fill="none"/><path d="M5 36h38" stroke="${c}" stroke-width="3" stroke-linecap="round"/><path d="M20 36V25h3v-4l3 3 3-3v4h3v11" fill="${c}"/>`,
 wilt:(c,l)=>`<path d="M24 42V22" stroke="${c}" stroke-width="3" stroke-linecap="round"/><path d="M24 26c-7 0-11-4-11-9 6 0 11 3 11 9z" fill="${l}" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 30c6-2 9-6 8-11-5 1-9 5-8 11z" fill="${c}"/><path d="M16 42h16" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`,
 sunrise:(c,l)=>`<circle cx="24" cy="28" r="9" fill="${c}"/><path d="M24 9v5M11 15l3.5 3.5M37 15l-3.5 3.5M6 28h5M37 28h5" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/><path d="M5 36h38M11 42h26" stroke="${l}" stroke-width="3.4" stroke-linecap="round"/>`,
 books:(c,l)=>`<rect x="7" y="10" width="10" height="30" rx="2" fill="${c}"/><rect x="19" y="15" width="10" height="25" rx="2" fill="${l}" stroke="${c}" stroke-width="2.2"/><rect x="31" y="7" width="10" height="33" rx="2" fill="${c}" opacity=".55"/><path d="M9 18h6M21 22h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
 map:(c,l)=>`<path d="M6 12l12-4 12 4 12-4v28l-12 4-12-4-12 4z" fill="${l}" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 8v28M30 12v28" stroke="${c}" stroke-width="2.2"/><circle cx="24" cy="21" r="3.4" fill="${c}"/>`,
 openbook:(c,l)=>`<path d="M24 14c-5-4-11-4-17-2v24c6-2 12-2 17 2 5-4 11-4 17-2V12c-6-2-12-2-17 2z" fill="${l}" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 14v24" stroke="${c}" stroke-width="2.4"/>`,
 chat:(c,l)=>`<rect x="4" y="9" width="26" height="18" rx="5" fill="${c}"/><path d="M11 27v6l7-6z" fill="${c}"/><rect x="20" y="21" width="24" height="17" rx="5" fill="${l}" stroke="${c}" stroke-width="2.2"/><path d="M37 38v5l-6-5z" fill="${l}" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"/>`,
 loop:(c,l)=>`<path d="M14 18a8 8 0 1 0 0 12c5 0 6-12 12-12a8 8 0 1 1 0 12c-6 0-7-12-12-12z" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/><circle cx="34" cy="24" r="3" fill="${l}"/>`,
};
/* 레슨별 플로차트 5단계 픽토그램 */
const STRIP = {
 "01":["globe","swap","hourglass","palette","handshake"],
 "02":["eye","letters","frame","camera","pipe"],
 "03":["heartbeat","hourglass","quote","wrench","takeoff"],
 "04":["wand","fire","dome","wilt","sunrise"],
 "05":["books","map","openbook","chat","loop"],
};
/* Knowledge Bank 코너 삽화 — viewBox 240×140 */
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
module.exports={S,STRIP,VIG};
