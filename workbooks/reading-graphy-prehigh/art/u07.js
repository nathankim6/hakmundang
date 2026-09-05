/* Unit 7 삽화 — 레슨 아이콘 · 배너 장면 · Knowledge Bank 비네트 */

const icons = {
 coach:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M14 20h22a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H24l-10 8V40a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6z" fill="${c}" opacity=".25"/>
  <circle cx="46" cy="18" r="8" fill="${c}"/>
  <path d="M34 52c0-9 6-15 12-15s12 6 12 15" fill="${c}" opacity=".55"/>
  <path d="M18 28h14M18 34h9" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
 esports:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M18 20h28c7 0 11 6 12 14s-2 12-8 12c-4 0-6-3-9-6H31c-3 3-5 6-9 6-6 0-9-4-8-12s5-14 12-14z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M20 34h10M25 29v10" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="42" cy="32" r="3" fill="${c}"/><circle cx="49" cy="37" r="3" fill="${c}"/>
  <path d="M10 12h6M48 12h6M20 8h24" stroke="${c}" stroke-width="2.6" stroke-linecap="round" opacity=".4"/></svg>`,
 synth:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="16" width="48" height="32" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M8 32h24" stroke="${c}" stroke-width="3"/>
  <path d="M32 16v32" stroke="${c}" stroke-width="3" stroke-dasharray="5 4"/>
  <circle cx="20" cy="25" r="4" fill="${c}"/>
  <path d="M12 44c4-8 10-9 14-3" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="44" cy="25" r="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="3 3"/>
  <path d="M36 44c4-8 10-9 14-3" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="4 4"/></svg>`,
 longtail:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 50V16M8 50h48" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <rect x="13" y="18" width="7" height="32" rx="2" fill="${c}"/>
  <rect x="23" y="34" width="7" height="16" rx="2" fill="${c}" opacity=".6"/>
  <rect x="33" y="42" width="7" height="8" rx="2" fill="${c}" opacity=".4"/>
  <rect x="43" y="45" width="6" height="5" rx="2" fill="${c}" opacity=".3"/>
  <rect x="52" y="46" width="5" height="4" rx="2" fill="${c}" opacity=".22"/></svg>`,
 boxoffice:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 22h48v26a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M10 22l8-10h32l-8 10z" fill="${c}" opacity=".28"/>
  <path d="M22 12l-8 10M34 12l-8 10M46 12l-8 10" stroke="${c}" stroke-width="2.6"/>
  <circle cx="32" cy="38" r="8" stroke="${c}" stroke-width="3"/>
  <path d="M32 33v10M29 36h6M29 41h6" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
};

const scenes = {
 coach:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><text x="160" y="30" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">TELLING</text>
   <circle cx="88" cy="86" r="22" fill="${c}"/>
   <g><rect x="118" y="48" width="64" height="16" rx="7" fill="${c}" opacity=".85"/></g><g><rect x="118" y="72" width="86" height="16" rx="7" fill="${c}" opacity=".7"/></g><g><rect x="118" y="96" width="52" height="16" rx="7" fill="${c}" opacity=".55"/></g><g><rect x="118" y="120" width="72" height="16" rx="7" fill="${c}" opacity=".4"/></g>
   <circle cx="232" cy="98" r="18" fill="${c}" opacity=".4"/>
   <path d="M206 172c0-16 12-26 26-26s26 10 26 26z" fill="${c}" opacity=".28"/>
   <text x="160" y="204" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">the judgement stays outside</text></g>
  <path d="M320 40v150" stroke="${c}" stroke-width="2.4" stroke-dasharray="7 7" opacity=".45"/>
  <g><text x="480" y="30" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">WAITING</text>
   <circle cx="408" cy="86" r="22" fill="${c}" opacity=".35"/>
   <circle cx="552" cy="98" r="18" fill="${c}"/>
   <path d="M526 172c0-16 12-26 26-26s26 10 26 26z" fill="${c}" opacity=".8"/>
   <circle cx="552" cy="60" r="16" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="5 5"/>
   <path d="M548 56c0-3 2-5 4-5s4 2 4 5-4 3-4 6" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
   <text x="480" y="204" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">the judgement grows inside</text></g></svg>`,
 esports:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <rect x="238" y="60" width="164" height="96" rx="12" fill="${c}"/>
  <text x="320" y="104" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">ONE MATCH</text>
  <text x="320" y="126" font-size="11" fill="#fff" opacity=".8" text-anchor="middle">two teams, one stage</text>
  <rect x="48" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".8"/><rect x="94" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".65"/><rect x="140" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".5"/><rect x="186" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".38"/><rect x="48" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".7"/><rect x="94" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".55"/><rect x="140" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".42"/><rect x="186" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".3"/><rect x="48" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".55"/><rect x="94" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".42"/><rect x="140" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".32"/><rect x="186" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".22"/><rect x="426" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".8"/><rect x="472" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".65"/><rect x="518" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".5"/><rect x="564" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".38"/><rect x="426" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".7"/><rect x="472" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".55"/><rect x="518" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".42"/><rect x="564" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".3"/><rect x="426" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".55"/><rect x="472" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".42"/><rect x="518" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".32"/><rect x="564" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".22"/>
  <text x="320" y="212" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">the ring of watchers, with the room removed</text></svg>`,
 synth:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <rect x="46" y="46" width="548" height="130" rx="12" fill="${t}" stroke="${c}" stroke-width="3"/>
  <path d="M320 46v130" stroke="${c}" stroke-width="3" stroke-dasharray="9 8"/>
  <text x="182" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">FILMED</text>
  <text x="458" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">FILLED IN</text>
  <g><circle cx="96" cy="88" r="10" fill="${c}"/><path d="M76 142c0-13 9-21 20-21s20 8 20 21z" fill="${c}"/></g><g><circle cx="138" cy="88" r="10" fill="${c}"/><path d="M118 142c0-13 9-21 20-21s20 8 20 21z" fill="${c}"/></g><g><circle cx="180" cy="88" r="10" fill="${c}"/><path d="M160 142c0-13 9-21 20-21s20 8 20 21z" fill="${c}"/></g><g><circle cx="222" cy="88" r="10" fill="${c}"/><path d="M202 142c0-13 9-21 20-21s20 8 20 21z" fill="${c}"/></g><g><circle cx="264" cy="88" r="10" fill="${c}"/><path d="M244 142c0-13 9-21 20-21s20 8 20 21z" fill="${c}"/></g>
  <g opacity=".42"><circle cx="356" cy="88" r="10" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/><path d="M336 142c0-13 9-21 20-21s20 8 20 21z" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/></g><g opacity=".42"><circle cx="394" cy="88" r="10" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/><path d="M374 142c0-13 9-21 20-21s20 8 20 21z" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/></g><g opacity=".42"><circle cx="432" cy="88" r="10" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/><path d="M412 142c0-13 9-21 20-21s20 8 20 21z" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/></g><g opacity=".42"><circle cx="470" cy="88" r="10" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/><path d="M450 142c0-13 9-21 20-21s20 8 20 21z" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/></g><g opacity=".42"><circle cx="508" cy="88" r="10" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/><path d="M488 142c0-13 9-21 20-21s20 8 20 21z" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/></g><g opacity=".42"><circle cx="546" cy="88" r="10" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/><path d="M526 142c0-13 9-21 20-21s20 8 20 21z" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="4 4"/></g>
  <text x="320" y="206" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">the decision moved from the set to a later room</text></svg>`,
 longtail:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M56 182V38M56 182h526" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <rect x="56" y="44" width="16" height="134" rx="3" fill="${c}" opacity="1"/><rect x="78" y="92" width="16" height="86" rx="3" fill="${c}" opacity=".8"/><rect x="100" y="120" width="16" height="58" rx="3" fill="${c}" opacity=".68"/><rect x="122" y="136" width="16" height="42" rx="3" fill="${c}" opacity=".58"/><rect x="144" y="146" width="16" height="32" rx="3" fill="${c}" opacity=".5"/><rect x="166" y="152" width="16" height="26" rx="3" fill="${c}" opacity=".45"/><rect x="188" y="156" width="16" height="22" rx="3" fill="${c}" opacity=".4"/><rect x="210" y="159" width="16" height="19" rx="3" fill="${c}" opacity=".36"/><rect x="232" y="161" width="16" height="17" rx="3" fill="${c}" opacity=".33"/><rect x="254" y="163" width="16" height="15" rx="3" fill="${c}" opacity=".3"/><rect x="276" y="164" width="16" height="14" rx="3" fill="${c}" opacity=".28"/><rect x="298" y="165" width="16" height="13" rx="3" fill="${c}" opacity=".26"/><rect x="320" y="166" width="16" height="12" rx="3" fill="${c}" opacity=".25"/><rect x="342" y="167" width="16" height="11" rx="3" fill="${c}" opacity=".24"/><rect x="364" y="168" width="16" height="10" rx="3" fill="${c}" opacity=".23"/><rect x="386" y="168" width="16" height="10" rx="3" fill="${c}" opacity=".22"/><rect x="408" y="169" width="16" height="9" rx="3" fill="${c}" opacity=".21"/><rect x="430" y="169" width="16" height="9" rx="3" fill="${c}" opacity=".2"/><rect x="452" y="170" width="16" height="8" rx="3" fill="${c}" opacity=".2"/><rect x="474" y="170" width="16" height="8" rx="3" fill="${c}" opacity=".19"/><rect x="496" y="170" width="16" height="8" rx="3" fill="${c}" opacity=".19"/><rect x="518" y="171" width="16" height="7" rx="3" fill="${c}" opacity=".18"/><rect x="540" y="171" width="16" height="7" rx="3" fill="${c}" opacity=".18"/><rect x="562" y="171" width="16" height="7" rx="3" fill="${c}" opacity=".17"/>
  <path d="M96 44h150" stroke="${c}" stroke-width="2.6" stroke-dasharray="6 5" opacity=".5"/>
  <text x="150" y="34" font-size="11.5" font-weight="800" fill="${d}">the head kept most of the listening</text>
  <text x="430" y="214" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">the tail is longer than anyone imagined</text></svg>`,
 boxoffice:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M56 178h528" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M56 118h528" stroke="${c}" stroke-width="2.4" stroke-dasharray="7 6" opacity=".55"/>
  <text x="588" y="112" font-size="10.5" font-weight="800" fill="${d}" text-anchor="end" opacity=".7">break even</text>
  <rect x="68" y="118" width="30" height="24" rx="3" fill="${c}" opacity=".3"/><rect x="112" y="118" width="30" height="30" rx="3" fill="${c}" opacity=".3"/><rect x="156" y="118" width="30" height="18" rx="3" fill="${c}" opacity=".3"/><rect x="200" y="118" width="30" height="34" rx="3" fill="${c}" opacity=".3"/><rect x="244" y="50" width="30" height="128" rx="3" fill="${c}" opacity="1"/><rect x="288" y="118" width="30" height="22" rx="3" fill="${c}" opacity=".3"/><rect x="332" y="118" width="30" height="28" rx="3" fill="${c}" opacity=".3"/><rect x="376" y="118" width="30" height="16" rx="3" fill="${c}" opacity=".3"/><rect x="420" y="86" width="30" height="92" rx="3" fill="${c}" opacity=".85"/><rect x="464" y="118" width="30" height="26" rx="3" fill="${c}" opacity=".3"/><rect x="508" y="118" width="30" height="20" rx="3" fill="${c}" opacity=".3"/><rect x="552" y="118" width="30" height="32" rx="3" fill="${c}" opacity=".3"/>
  <text x="320" y="212" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">a few pay for all the rest</text></svg>`,
};

const STRIP = {
 "31":["quote","hourglass","pair","nope","sprout"],
 "32":["pair","frame","globe","balance","tag"],
 "33":["camera","swap","spark","shield","ask"],
 "34":["books","ruler","eye","tag","balance"],
 "35":["frame","balance","hourglass","spark","nope"]
};

const VIG = {
 "31":(c,t,d)=>`<circle cx="52" cy="60" r="24" fill="${c}"/>
  <path d="M22 122c0-18 13-30 30-30s30 12 30 30z" fill="${c}" opacity=".3"/>
  <circle cx="170" cy="56" r="20" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="6 6"/>
  <path d="M164 50c0-4 3-7 6-7s6 3 6 7-6 4-6 8" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <circle cx="171" cy="72" r="3" fill="${c}"/>
  <path d="M96 84h44" stroke="${c}" stroke-width="4" stroke-dasharray="5 6" stroke-linecap="round"/>
  <text x="170" y="120" font-size="11" font-weight="700" fill="${d}" text-anchor="middle" opacity=".7">room to notice</text>`,
 "32":(c,t,d)=>`<rect x="76" y="34" width="88" height="56" rx="9" fill="${c}"/>
  <text x="120" y="68" font-size="12" font-weight="800" fill="#fff" text-anchor="middle">stage</text>
  VIG<rect x="48" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".8"/><rect x="94" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".65"/><rect x="140" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".5"/><rect x="186" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".38"/><rect x="48" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".7"/><rect x="94" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".55"/><rect x="140" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".42"/><rect x="186" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".3"/><rect x="48" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".55"/><rect x="94" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".42"/><rect x="140" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".32"/><rect x="186" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".22"/><rect x="426" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".8"/><rect x="472" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".65"/><rect x="518" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".5"/><rect x="564" y="44" width="30" height="20" rx="4" fill="${c}" opacity=".38"/><rect x="426" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".7"/><rect x="472" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".55"/><rect x="518" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".42"/><rect x="564" y="86" width="30" height="20" rx="4" fill="${c}" opacity=".3"/><rect x="426" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".55"/><rect x="472" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".42"/><rect x="518" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".32"/><rect x="564" y="128" width="30" height="20" rx="4" fill="${c}" opacity=".22"/>`,
 "33":(c,t,d)=>`<rect x="12" y="26" width="100" height="88" rx="9" fill="${t}" stroke="${c}" stroke-width="3.4"/>
  <rect x="128" y="26" width="100" height="88" rx="9" fill="#fff" stroke="${c}" stroke-width="3.4" stroke-dasharray="7 6"/>
  <g><circle cx="40" cy="60" r="8" fill="${c}"/><path d="M24 100c0-10 7-16 16-16s16 6 16 16z" fill="${c}"/></g><g><circle cx="72" cy="60" r="8" fill="${c}"/><path d="M56 100c0-10 7-16 16-16s16 6 16 16z" fill="${c}"/></g><g><circle cx="104" cy="60" r="8" fill="${c}"/><path d="M88 100c0-10 7-16 16-16s16 6 16 16z" fill="${c}"/></g>
  <g opacity=".4"><circle cx="156" cy="60" r="8" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="3.5 3.5"/><path d="M140 100c0-10 7-16 16-16s16 6 16 16z" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="3.5 3.5"/></g><g opacity=".4"><circle cx="186" cy="60" r="8" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="3.5 3.5"/><path d="M170 100c0-10 7-16 16-16s16 6 16 16z" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="3.5 3.5"/></g><g opacity=".4"><circle cx="216" cy="60" r="8" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="3.5 3.5"/><path d="M200 100c0-10 7-16 16-16s16 6 16 16z" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="3.5 3.5"/></g>`,
 "34":(c,t,d)=>`<path d="M18 116V22M18 116h206" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <rect x="18" y="26" width="12" height="90" rx="2.5" fill="${c}" opacity="1"/><rect x="35" y="60" width="12" height="56" rx="2.5" fill="${c}" opacity=".78"/><rect x="52" y="80" width="12" height="36" rx="2.5" fill="${c}" opacity=".64"/><rect x="69" y="90" width="12" height="26" rx="2.5" fill="${c}" opacity=".54"/><rect x="86" y="96" width="12" height="20" rx="2.5" fill="${c}" opacity=".46"/><rect x="103" y="100" width="12" height="16" rx="2.5" fill="${c}" opacity=".4"/><rect x="120" y="102" width="12" height="14" rx="2.5" fill="${c}" opacity=".36"/><rect x="137" y="104" width="12" height="12" rx="2.5" fill="${c}" opacity=".32"/><rect x="154" y="105" width="12" height="11" rx="2.5" fill="${c}" opacity=".3"/><rect x="171" y="106" width="12" height="10" rx="2.5" fill="${c}" opacity=".28"/><rect x="188" y="107" width="12" height="9" rx="2.5" fill="${c}" opacity=".26"/><rect x="205" y="107" width="12" height="9" rx="2.5" fill="${c}" opacity=".25"/>`,
 "35":(c,t,d)=>`<path d="M14 116h212" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <path d="M14 76h212" stroke="${c}" stroke-width="2.6" stroke-dasharray="6 5" opacity=".5"/>
  <rect x="22" y="76" width="18" height="18" rx="2.5" fill="${c}" opacity=".3"/><rect x="48" y="76" width="18" height="24" rx="2.5" fill="${c}" opacity=".3"/><rect x="74" y="76" width="18" height="14" rx="2.5" fill="${c}" opacity=".3"/><rect x="100" y="30" width="18" height="86" rx="2.5" fill="${c}" opacity="1"/><rect x="126" y="76" width="18" height="20" rx="2.5" fill="${c}" opacity=".3"/><rect x="152" y="76" width="18" height="16" rx="2.5" fill="${c}" opacity=".3"/><rect x="178" y="54" width="18" height="62" rx="2.5" fill="${c}" opacity=".8"/><rect x="204" y="76" width="18" height="22" rx="2.5" fill="${c}" opacity=".3"/>`,
};

module.exports = { icons, scenes, STRIP, VIG };
