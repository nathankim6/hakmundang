/* Unit 5 삽화 — 레슨 아이콘 · 배너 장면 · Knowledge Bank 비네트 */

const icons = {
 ritual:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="16" cy="20" r="5.5" fill="${c}" opacity=".95"/><path d="M8 44c0-6 4-10 8-10s8 4 8 10z" fill="${c}" opacity=".95"/><circle cx="32" cy="17" r="6.5" fill="${c}" opacity="1"/><path d="M22 44c0-6 4-10 10-10s10 4 10 10z" fill="${c}" opacity="1"/><circle cx="48" cy="20" r="5.5" fill="${c}" opacity=".95"/><path d="M40 44c0-6 4-10 8-10s8 4 8 10z" fill="${c}" opacity=".95"/>
  <path d="M10 52h44" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/></svg>`,
 twoq:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M8 32h48" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="6 5"/>
  <path d="M20 22c0-4 3-7 6-7s6 3 6 7-6 4-6 8" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <circle cx="26" cy="26" r="2.4" fill="${c}"/>
  <path d="M36 44h16M44 36v16" stroke="${c}" stroke-width="3.4" stroke-linecap="round" opacity=".55"/>
  <text x="16" y="52" font-size="13" font-weight="800" fill="${c}">is</text></svg>`,
 sophist:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 46V20" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 20L14 8M32 20l18-12" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <circle cx="14" cy="8" r="4.5" fill="${c}"/>
  <circle cx="50" cy="8" r="4.5" fill="${c}" opacity=".35"/>
  <path d="M18 46h28l-4 10H22z" fill="${c}" opacity=".22" stroke="${c}" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M24 33h16" stroke="${c}" stroke-width="2.8" stroke-linecap="round" opacity=".5"/></svg>`,
 stoic:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="14" width="48" height="36" rx="5" stroke="${c}" stroke-width="3"/>
  <path d="M32 14v36" stroke="${c}" stroke-width="3.2"/>
  <circle cx="20" cy="26" r="4" fill="${c}"/><circle cx="20" cy="38" r="4" fill="${c}"/>
  <circle cx="44" cy="26" r="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="3 3"/>
  <circle cx="44" cy="38" r="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="3 3"/>
  <path d="M14 56h12M38 56h12" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".5"/></svg>`,
 wanting:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="20" stroke="${c}" stroke-width="3.2" fill="none" stroke-dasharray="7 6"/>
  <path d="M32 12l6 8-12 0z" fill="${c}"/>
  <circle cx="32" cy="32" r="8" fill="${c}" opacity=".28"/>
  <circle cx="32" cy="32" r="3.4" fill="${c}"/>
  <path d="M50 44c4 4 6 8 6 12" stroke="${c}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".45"/></svg>`,
};

const scenes = {
 ritual:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <rect x="30" y="46" width="580" height="130" rx="14" fill="${t}" opacity=".55"/>
  <g opacity=".55"><circle cx="80" cy="96" r="13" fill="${c}"/><path d="M55 160c0-16 11-26 25-26s25 10 25 26z" fill="${c}"/></g><g opacity=".8"><circle cx="160" cy="96" r="13" fill="${c}"/><path d="M135 160c0-16 11-26 25-26s25 10 25 26z" fill="${c}"/></g><g opacity="1"><circle cx="240" cy="96" r="13" fill="${c}"/><path d="M215 160c0-16 11-26 25-26s25 10 25 26z" fill="${c}"/></g><g opacity="1"><circle cx="320" cy="96" r="13" fill="${c}"/><path d="M295 160c0-16 11-26 25-26s25 10 25 26z" fill="${c}"/></g><g opacity="1"><circle cx="400" cy="96" r="13" fill="${c}"/><path d="M375 160c0-16 11-26 25-26s25 10 25 26z" fill="${c}"/></g><g opacity=".8"><circle cx="480" cy="96" r="13" fill="${c}"/><path d="M455 160c0-16 11-26 25-26s25 10 25 26z" fill="${c}"/></g><g opacity=".55"><circle cx="560" cy="96" r="13" fill="${c}"/><path d="M535 160c0-16 11-26 25-26s25 10 25 26z" fill="${c}"/></g>
  <path d="M52 178h536" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <text x="320" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">SAME HOUR · SAME MOVEMENT</text>
  <text x="320" y="206" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">the body learns before the mind agrees</text></svg>`,
 twoq:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <rect x="180" y="96" width="280" height="42" rx="10" fill="${c}"/>
  <text x="320" y="123" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">THE SAME FACTS</text>
  <g><path d="M320 92V56" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
   <path d="M320 92l-140-30" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
   <path d="M320 92l140-30" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/></g>
  <g><rect x="52" y="26" width="188" height="40" rx="10" fill="#fff" stroke="${c}" stroke-width="3"/>
   <text x="146" y="52" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">How did it happen?</text></g>
  <g><rect x="400" y="26" width="188" height="40" rx="10" fill="#fff" stroke="${c}" stroke-width="3" stroke-dasharray="7 6"/>
   <text x="494" y="52" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">How should we live?</text></g>
  <path d="M186 168h268" stroke="${c}" stroke-width="3" stroke-dasharray="9 8" opacity=".6"/>
  <text x="320" y="192" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">is &#8594; ought : the step that needs its own reason</text></svg>`,
 sophist:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <circle cx="150" cy="120" r="16" fill="${c}"/>
  <path d="M166 114h96" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
  <path d="M262 114c66-42 142-48 214-48" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M262 122c66 40 142 46 214 46" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="12 9" opacity=".45"/>
  <g><rect x="484" y="46" width="112" height="40" rx="10" fill="${c}"/>
   <text x="540" y="72" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">WINNING</text></g>
  <g><rect x="484" y="148" width="112" height="40" rx="10" fill="#fff" stroke="${c}" stroke-width="3" stroke-dasharray="7 6"/>
   <text x="540" y="174" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">BEING RIGHT</text></g>
  <text x="150" y="164" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">the speaker</text>
  <text x="320" y="214" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">a skill aimed only at winning need not stop at the truth</text></svg>`,
 stoic:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M320 26v178" stroke="${c}" stroke-width="4" stroke-dasharray="10 8"/>
  <g><rect x="42" y="44" width="248" height="146" rx="12" fill="${t}" stroke="${c}" stroke-width="3.4"/>
   <text x="166" y="72" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">UP TO ME</text>
   <g><circle cx="80" cy="108" r="8" fill="${c}"/><text x="102" y="113" font-size="12.5" font-weight="700" fill="${d}">my judgement</text></g><g><circle cx="80" cy="146" r="8" fill="${c}"/><text x="102" y="151" font-size="12.5" font-weight="700" fill="${d}">my effort</text></g>
  </g>
  <g><rect x="350" y="44" width="248" height="146" rx="12" fill="#fff" stroke="${c}" stroke-width="3.4" stroke-dasharray="8 7"/>
   <text x="474" y="72" font-size="13" font-weight="800" fill="${d}" text-anchor="middle">NOT UP TO ME</text>
   <g><circle cx="388" cy="104" r="8" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="3.5 3.5"/><text x="410" y="109" font-size="12.5" font-weight="700" fill="${d}" opacity=".72">reputation</text></g><g><circle cx="388" cy="134" r="8" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="3.5 3.5"/><text x="410" y="139" font-size="12.5" font-weight="700" fill="${d}" opacity=".72">health</text></g><g><circle cx="388" cy="164" r="8" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="3.5 3.5"/><text x="410" y="169" font-size="12.5" font-weight="700" fill="${d}" opacity=".72">the weather</text></g>
  </g></svg>`,
 wanting:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M40 186h560" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <g><rect x="96" y="150" width="72" height="36" rx="5" fill="${c}" opacity=".25"/><circle cx="132" cy="140" r="9" fill="${c}"/></g><g><rect x="200" y="126" width="72" height="60" rx="5" fill="${c}" opacity=".4"/><circle cx="236" cy="116" r="9" fill="${c}"/></g><g><rect x="304" y="102" width="72" height="84" rx="5" fill="${c}" opacity=".55"/><circle cx="340" cy="92" r="9" fill="${c}"/></g><g><rect x="408" y="80" width="72" height="106" rx="5" fill="${c}" opacity=".75"/><circle cx="444" cy="70" r="9" fill="${c}"/></g><g><rect x="512" y="60" width="72" height="126" rx="5" fill="${c}" opacity=".95"/><circle cx="548" cy="50" r="9" fill="${c}"/></g>
  <path d="M92 140c72-56 168-72 268-64s156 26 208 58" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-dasharray="10 9" opacity=".45"/>
  <path d="M568 134l14 6-11 10" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
  <text x="300" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle" opacity=".85">the horizon moves too</text>
  <text x="320" y="216" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">a satisfied wish leaves a space, and a new wish moves in</text></svg>`,
};

const STRIP = {
 "21":["pair","loop","hourglass","quote","dome"],
 "22":["ask","gear","balance","nope","swap"],
 "23":["quote","pair","swap","balance","nope"],
 "24":["balance","shield","globe","nope","sprout"],
 "25":["loop","heartbeat","palette","pair","hourglass"]
};

const VIG = {
 "21":(c,t,d)=>`<g opacity=".55"><circle cx="40" cy="52" r="11" fill="${c}"/><path d="M19 108c0-14 9-22 21-22s21 8 21 22z" fill="${c}"/></g><g opacity=".85"><circle cx="90" cy="52" r="11" fill="${c}"/><path d="M69 108c0-14 9-22 21-22s21 8 21 22z" fill="${c}"/></g><g opacity="1"><circle cx="140" cy="52" r="11" fill="${c}"/><path d="M119 108c0-14 9-22 21-22s21 8 21 22z" fill="${c}"/></g><g opacity=".7"><circle cx="190" cy="52" r="11" fill="${c}"/><path d="M169 108c0-14 9-22 21-22s21 8 21 22z" fill="${c}"/></g><path d="M14 122h212" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
 "22":(c,t,d)=>`<rect x="14" y="46" width="94" height="34" rx="9" fill="${c}"/>
  <text x="61" y="69" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">is</text>
  <rect x="132" y="46" width="94" height="34" rx="9" fill="#fff" stroke="${c}" stroke-width="3.4" stroke-dasharray="7 6"/>
  <text x="179" y="69" font-size="14" font-weight="800" fill="${d}" text-anchor="middle">ought</text>
  <path d="M112 63h16" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-dasharray="4 5"/>
  <path d="M104 100c14-14 34-14 48 0" stroke="${d}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".4"/>
  <text x="120" y="126" font-size="11" font-weight="700" fill="${d}" text-anchor="middle" opacity=".7">a missing step</text>`,
 "23":(c,t,d)=>`<circle cx="46" cy="70" r="20" fill="${c}"/>
  <path d="M66 66h40" stroke="${c}" stroke-width="5" stroke-linecap="round"/>
  <path d="M106 66c34-24 66-28 108-28" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M106 74c34 22 66 26 108 26" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="9 7" opacity=".45"/>
  <circle cx="220" cy="38" r="9" fill="${c}"/>
  <circle cx="220" cy="100" r="9" fill="#fff" stroke="${c}" stroke-width="3.2"/>`,
 "24":(c,t,d)=>`<path d="M120 14v112" stroke="${c}" stroke-width="4" stroke-dasharray="8 7"/>
  <rect x="14" y="26" width="92" height="88" rx="10" fill="${t}" stroke="${c}" stroke-width="3.4"/>
  <rect x="134" y="26" width="92" height="88" rx="10" fill="#fff" stroke="${c}" stroke-width="3.4" stroke-dasharray="7 6"/>
  <circle cx="44" cy="54" r="7" fill="${c}"/><circle cx="44" cy="84" r="7" fill="${c}"/>
  <path d="M58 54h34M58 84h34" stroke="${c}" stroke-width="3.4" stroke-linecap="round" opacity=".55"/>
  <circle cx="164" cy="54" r="7" fill="none" stroke="${c}" stroke-width="2.8" stroke-dasharray="3 3"/>
  <circle cx="164" cy="84" r="7" fill="none" stroke="${c}" stroke-width="2.8" stroke-dasharray="3 3"/>
  <path d="M178 54h34M178 84h34" stroke="${c}" stroke-width="3.4" stroke-linecap="round" opacity=".28"/>`,
 "25":(c,t,d)=>`<path d="M14 118h212" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  VIG<g><rect x="96" y="150" width="72" height="36" rx="5" fill="${c}" opacity=".25"/><circle cx="132" cy="140" r="9" fill="${c}"/></g><g><rect x="200" y="126" width="72" height="60" rx="5" fill="${c}" opacity=".4"/><circle cx="236" cy="116" r="9" fill="${c}"/></g><g><rect x="304" y="102" width="72" height="84" rx="5" fill="${c}" opacity=".55"/><circle cx="340" cy="92" r="9" fill="${c}"/></g><g><rect x="408" y="80" width="72" height="106" rx="5" fill="${c}" opacity=".75"/><circle cx="444" cy="70" r="9" fill="${c}"/></g><g><rect x="512" y="60" width="72" height="126" rx="5" fill="${c}" opacity=".95"/><circle cx="548" cy="50" r="9" fill="${c}"/></g>
  <path d="M40 92c48-34 118-42 172-16" stroke="${d}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-dasharray="8 7" opacity=".45"/>`,
};

module.exports = { icons, scenes, STRIP, VIG };
