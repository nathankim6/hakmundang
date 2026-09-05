/* Unit 8 삽화 — 레슨 아이콘 · 배너 장면 · Knowledge Bank 비네트 */

const icons = {
 thrift:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="22" stroke="${c}" stroke-width="3" stroke-dasharray="8 6"/>
  <path d="M32 14l6 8H26z" fill="${c}"/>
  <circle cx="32" cy="32" r="10" fill="${c}" opacity=".2"/>
  <path d="M32 26v12M28 30h8M28 35h8" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/></svg>`,
 camera:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="6" y="20" width="34" height="24" rx="4" stroke="${c}" stroke-width="3"/>
  <path d="M40 30l16-8v24l-16-8z" fill="${c}" opacity=".3" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="20" cy="32" r="6" fill="${c}"/>
  <path d="M14 52h20" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <path d="M12 14c4-4 10-4 14 0" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".5"/></svg>`,
 arthur:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 8l4 30-4 8-4-8z" fill="${c}"/>
  <path d="M20 38h24" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M32 46v10" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M12 56h40" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".45"/>
  <circle cx="18" cy="18" r="3" fill="${c}" opacity=".5"/>
  <circle cx="48" cy="22" r="3" fill="${c}" opacity=".4"/>
  <circle cx="46" cy="12" r="2.4" fill="${c}" opacity=".3"/></svg>`,
 harvest:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <path d="M32 54V22" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 30c-8 0-11-5-11-11 7 0 11 4 11 11zM32 30c8 0 11-5 11-11-7 0-11 4-11 11z" fill="${c}" opacity=".6"/>
  <path d="M32 44c-8 0-11-5-11-11 7 0 11 4 11 11zM32 44c8 0 11-5 11-11-7 0-11 4-11 11z" fill="${c}"/>
  <path d="M12 58h40" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  <rect x="44" y="38" width="14" height="16" rx="3" fill="none" stroke="${c}" stroke-width="2.6"/></svg>`,
 letters:(c)=>`<svg viewBox="0 0 64 64" fill="none">
  <rect x="8" y="18" width="30" height="22" rx="3" stroke="${c}" stroke-width="3"/>
  <path d="M8 21l15 11 15-11" stroke="${c}" stroke-width="2.8" fill="none" stroke-linejoin="round"/>
  <circle cx="50" cy="16" r="4" fill="${c}"/><circle cx="56" cy="34" r="4" fill="${c}" opacity=".6"/>
  <circle cx="46" cy="48" r="4" fill="${c}" opacity=".45"/>
  <path d="M38 26l10-8M38 32l16 2M32 40l12 6" stroke="${c}" stroke-width="2.4" opacity=".5"/></svg>`,
};

const scenes = {
 thrift:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <circle cx="320" cy="115" r="80" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="13 10"/>
  <path d="M384 66 L367 58 L377 49 z" fill="${c}"/><path d="M369 179 L377 162 L386 172 z" fill="${c}"/><path d="M256 164 L273 172 L263 181 z" fill="${c}"/><path d="M271 51 L263 68 L254 58 z" fill="${c}"/>
  
  <g><rect x="240" y="16" width="160" height="34" rx="9" fill="${c}"/>
   <text x="320" y="39" font-size="12.5" font-weight="800" fill="#fff" text-anchor="middle">a family spends less</text></g>
  <g><rect x="404" y="98" width="196" height="34" rx="9" fill="${t}" stroke="${c}" stroke-width="2.6"/>
   <text x="502" y="121" font-size="12.5" font-weight="800" fill="${d}" text-anchor="middle">shops sell less</text></g>
  <g><rect x="240" y="180" width="160" height="34" rx="9" fill="${t}" stroke="${c}" stroke-width="2.6"/>
   <text x="320" y="203" font-size="12.5" font-weight="800" fill="${d}" text-anchor="middle">fewer are hired</text></g>
  <g><rect x="40" y="98" width="196" height="34" rx="9" fill="${t}" stroke="${c}" stroke-width="2.6"/>
   <text x="138" y="121" font-size="12.5" font-weight="800" fill="${d}" text-anchor="middle">incomes shrink</text></g></svg>`,
 camera:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g><text x="106" y="30" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">A ROOM</text>
   <rect x="40" y="52" width="132" height="96" rx="10" fill="${t}" stroke="${c}" stroke-width="3"/>
   <circle cx="66" cy="74" r="7" fill="${c}" opacity=".75"/><circle cx="90" cy="74" r="7" fill="${c}" opacity=".75"/><circle cx="114" cy="74" r="7" fill="${c}" opacity=".75"/><circle cx="138" cy="74" r="7" fill="${c}" opacity=".75"/><circle cx="66" cy="100" r="7" fill="${c}" opacity=".75"/><circle cx="90" cy="100" r="7" fill="${c}" opacity=".75"/><circle cx="114" cy="100" r="7" fill="${c}" opacity=".75"/><circle cx="138" cy="100" r="7" fill="${c}" opacity=".75"/><circle cx="66" cy="126" r="7" fill="${c}" opacity=".75"/><circle cx="90" cy="126" r="7" fill="${c}" opacity=".75"/><circle cx="114" cy="126" r="7" fill="${c}" opacity=".75"/><circle cx="138" cy="126" r="7" fill="${c}" opacity=".75"/>
   <text x="106" y="176" font-size="10.5" fill="${d}" opacity=".7" text-anchor="middle">printed next day</text></g>
  <g><text x="320" y="30" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">A RADIO</text>
   <rect x="256" y="70" width="128" height="60" rx="10" fill="${c}"/>
   <circle cx="292" cy="100" r="14" fill="#fff" opacity=".85"/>
   <path d="M320 88h48M320 100h36M320 112h48" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
   <text x="320" y="176" font-size="10.5" fill="${d}" opacity=".7" text-anchor="middle">straight into kitchens</text></g>
  <g><text x="534" y="30" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">A CAMERA</text>
   <rect x="462" y="54" width="26" height="18" rx="3" fill="${c}" opacity=".85"/><rect x="494" y="54" width="26" height="18" rx="3" fill="${c}" opacity=".7"/><rect x="526" y="54" width="26" height="18" rx="3" fill="${c}" opacity=".55"/><rect x="558" y="54" width="26" height="18" rx="3" fill="${c}" opacity=".42"/><rect x="590" y="54" width="26" height="18" rx="3" fill="${c}" opacity=".3"/><rect x="462" y="80" width="26" height="18" rx="3" fill="${c}" opacity=".7"/><rect x="494" y="80" width="26" height="18" rx="3" fill="${c}" opacity=".58"/><rect x="526" y="80" width="26" height="18" rx="3" fill="${c}" opacity=".46"/><rect x="558" y="80" width="26" height="18" rx="3" fill="${c}" opacity=".36"/><rect x="590" y="80" width="26" height="18" rx="3" fill="${c}" opacity=".26"/><rect x="462" y="106" width="26" height="18" rx="3" fill="${c}" opacity=".55"/><rect x="494" y="106" width="26" height="18" rx="3" fill="${c}" opacity=".45"/><rect x="526" y="106" width="26" height="18" rx="3" fill="${c}" opacity=".36"/><rect x="558" y="106" width="26" height="18" rx="3" fill="${c}" opacity=".28"/><rect x="590" y="106" width="26" height="18" rx="3" fill="${c}" opacity=".2"/><rect x="462" y="132" width="26" height="18" rx="3" fill="${c}" opacity=".4"/><rect x="494" y="132" width="26" height="18" rx="3" fill="${c}" opacity=".32"/><rect x="526" y="132" width="26" height="18" rx="3" fill="${c}" opacity=".26"/><rect x="558" y="132" width="26" height="18" rx="3" fill="${c}" opacity=".2"/><rect x="590" y="132" width="26" height="18" rx="3" fill="${c}" opacity=".16"/>
   <text x="534" y="176" font-size="10.5" fill="${d}" opacity=".7" text-anchor="middle">appearance carries argument</text></g>
  <path d="M186 100h58M398 100h58" stroke="${c}" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round"/>
  <text x="320" y="212" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">each step removed someone who stood in the middle</text></svg>`,
 arthur:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <g opacity=".5"><rect x="46" y="60" width="54" height="22" rx="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 5"/></g><g opacity=".5"><rect x="52" y="102" width="40" height="20" rx="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 5"/></g><g opacity=".5"><rect x="120" y="74" width="44" height="18" rx="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 5"/></g><g opacity=".5"><rect x="112" y="120" width="58" height="22" rx="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 5"/></g><g opacity=".5"><rect x="40" y="146" width="66" height="20" rx="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 5"/></g><g opacity=".5"><rect x="146" y="44" width="38" height="18" rx="4" fill="none" stroke="${c}" stroke-width="2.6" stroke-dasharray="5 5"/></g>
  <g><rect x="250" y="70" width="140" height="96" rx="10" fill="${c}"/>
   <path d="M320 88l5 34-5 10-5-10z" fill="#fff" opacity=".9"/>
   <path d="M306 122h28" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>
   <text x="320" y="156" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">1136</text></g>
  <text x="320" y="52" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">ONE BOOK</text>
  <g><rect x="430" y="58" width="150" height="22" rx="6" fill="${c}" opacity=".8"/><text x="505" y="73" font-size="10.5" font-weight="800" fill="#fff" text-anchor="middle">French romance</text></g><g><rect x="444" y="90" width="150" height="22" rx="6" fill="${c}" opacity=".62"/><text x="519" y="105" font-size="10.5" font-weight="800" fill="#fff" text-anchor="middle">the grail</text></g><g><rect x="430" y="122" width="150" height="22" rx="6" fill="${c}" opacity=".45"/><text x="505" y="137" font-size="10.5" font-weight="800" fill="#fff" text-anchor="middle">Malory, 1485</text></g>
  <text x="320" y="212" font-size="12" font-weight="700" fill="${c}" text-anchor="middle">scattered pieces, then one writer, then layer on layer</text></svg>`,
 harvest:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <path d="M60 180h520" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M320 40v140" stroke="${c}" stroke-width="2.6" stroke-dasharray="7 6" opacity=".5"/>
  <text x="190" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">GATHERING</text>
  <text x="452" y="34" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">FARMING</text>
  <g><circle cx="110" cy="104" r="9" fill="${c}"/><path d="M90 180c0-24 9-38 20-38s20 14 20 38z" fill="${c}"/></g><g><circle cx="190" cy="104" r="9" fill="${c}"/><path d="M170 180c0-24 9-38 20-38s20 14 20 38z" fill="${c}"/></g><g><circle cx="270" cy="104" r="9" fill="${c}"/><path d="M250 180c0-24 9-38 20-38s20 14 20 38z" fill="${c}"/></g>
  <g opacity=".78"><circle cx="356" cy="128" r="7" fill="${c}"/><path d="M341 180c0-17 7-27 15-27s15 10 15 27z" fill="${c}"/></g><g opacity=".78"><circle cx="392" cy="128" r="7" fill="${c}"/><path d="M377 180c0-17 7-27 15-27s15 10 15 27z" fill="${c}"/></g><g opacity=".78"><circle cx="428" cy="128" r="7" fill="${c}"/><path d="M413 180c0-17 7-27 15-27s15 10 15 27z" fill="${c}"/></g><g opacity=".78"><circle cx="464" cy="128" r="7" fill="${c}"/><path d="M449 180c0-17 7-27 15-27s15 10 15 27z" fill="${c}"/></g><g opacity=".78"><circle cx="500" cy="128" r="7" fill="${c}"/><path d="M485 180c0-17 7-27 15-27s15 10 15 27z" fill="${c}"/></g><g opacity=".78"><circle cx="536" cy="128" r="7" fill="${c}"/><path d="M521 180c0-17 7-27 15-27s15 10 15 27z" fill="${c}"/></g><g opacity=".78"><circle cx="572" cy="128" r="7" fill="${c}"/><path d="M557 180c0-17 7-27 15-27s15 10 15 27z" fill="${c}"/></g>
  <text x="190" y="206" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">fewer people, taller</text>
  <text x="452" y="206" font-size="11" fill="${d}" opacity=".72" text-anchor="middle">many more people, shorter</text></svg>`,
 letters:(c,t,d)=>`<svg viewBox="0 0 640 230" fill="none">
  <circle cx="320" cy="112" r="26" fill="${c}"/>
  <text x="320" y="164" font-size="11.5" font-weight="800" fill="${d}" text-anchor="middle">Boston, 1772</text>
  <path d="M320 86 L320 26" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="320" cy="26" r="10" fill="${c}" opacity=".62"/><path d="M332 89 L360 36" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="360" cy="36" r="10" fill="${c}" opacity=".62"/><path d="M341 97 L391 63" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="391" cy="63" r="10" fill="${c}" opacity=".62"/><path d="M346 109 L405 102" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="405" cy="102" r="10" fill="${c}" opacity=".62"/><path d="M344 121 L400 142" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="400" cy="142" r="10" fill="${c}" opacity=".62"/><path d="M337 131 L377 176" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="377" cy="176" r="10" fill="${c}" opacity=".62"/><path d="M326 137 L341 196" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="341" cy="196" r="10" fill="${c}" opacity=".62"/><path d="M314 137 L299 196" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="299" cy="196" r="10" fill="${c}" opacity=".62"/><path d="M303 131 L263 176" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="263" cy="176" r="10" fill="${c}" opacity=".62"/><path d="M296 121 L240 142" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="240" cy="142" r="10" fill="${c}" opacity=".62"/><path d="M294 109 L235 102" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="235" cy="102" r="10" fill="${c}" opacity=".62"/><path d="M299 97 L249 63" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="249" cy="63" r="10" fill="${c}" opacity=".62"/><path d="M308 89 L280 36" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="280" cy="36" r="10" fill="${c}" opacity=".62"/>
  <text x="320" y="26" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">A CHANNEL BUILT BEFORE IT WAS NEEDED</text></svg>`,
};

const STRIP = {
 "36":["loop","balance","ruler","warn","pair"],
 "37":["quote","frame","globe","ask","shield"],
 "38":["letters","quote","openbook","swap","tag"],
 "39":["sprout","ruler","dome","balance","nope"],
 "40":["letters","map","pair","loop","spark"]
};

const VIG = {
 "36":(c,t,d)=>`<circle cx="120" cy="70" r="54" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="11 8"/>
  <path d="M166 40 L148 32 L158 22 z" fill="${c}"/><path d="M150 116 L158 98 L168 108 z" fill="${c}"/><path d="M74 100 L92 108 L82 118 z" fill="${c}"/><path d="M90 24 L82 42 L72 32 z" fill="${c}"/>
  <text x="120" y="76" font-size="12" font-weight="800" fill="${d}" text-anchor="middle">the loop</text>`,
 "37":(c,t,d)=>`<rect x="14" y="34" width="70" height="60" rx="8" fill="${t}" stroke="${c}" stroke-width="3.4"/>
  <circle cx="34" cy="56" r="6" fill="${c}"/><circle cx="56" cy="56" r="6" fill="${c}"/><circle cx="45" cy="76" r="6" fill="${c}"/>
  <rect x="100" y="46" width="54" height="36" rx="8" fill="${c}"/>
  <path d="M116 58h26M116 70h18" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>
  <rect x="170" y="34" width="16" height="11" rx="2.5" fill="${c}" opacity=".7"/><rect x="190" y="34" width="16" height="11" rx="2.5" fill="${c}" opacity=".55"/><rect x="210" y="34" width="16" height="11" rx="2.5" fill="${c}" opacity=".4"/><rect x="170" y="52" width="16" height="11" rx="2.5" fill="${c}" opacity=".55"/><rect x="190" y="52" width="16" height="11" rx="2.5" fill="${c}" opacity=".44"/><rect x="210" y="52" width="16" height="11" rx="2.5" fill="${c}" opacity=".32"/><rect x="170" y="70" width="16" height="11" rx="2.5" fill="${c}" opacity=".42"/><rect x="190" y="70" width="16" height="11" rx="2.5" fill="${c}" opacity=".33"/><rect x="210" y="70" width="16" height="11" rx="2.5" fill="${c}" opacity=".24"/><rect x="170" y="88" width="16" height="11" rx="2.5" fill="${c}" opacity=".3"/><rect x="190" y="88" width="16" height="11" rx="2.5" fill="${c}" opacity=".24"/><rect x="210" y="88" width="16" height="11" rx="2.5" fill="${c}" opacity=".18"/>
  <path d="M90 64h6M160 64h4" stroke="${c}" stroke-width="3" stroke-dasharray="4 4"/>`,
 "38":(c,t,d)=>`<g opacity=".45"><rect x="12" y="26" width="40" height="18" rx="4" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="4 4"/></g><g opacity=".45"><rect x="16" y="60" width="30" height="16" rx="4" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="4 4"/></g><g opacity=".45"><rect x="58" y="44" width="34" height="14" rx="4" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="4 4"/></g><g opacity=".45"><rect x="12" y="92" width="44" height="16" rx="4" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="4 4"/></g><rect x="102" y="34" width="56" height="72" rx="8" fill="${c}"/><path d="M130 48l4 26-4 8-4-8z" fill="#fff" opacity=".9"/><path d="M120 74h20" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><rect x="172" y="34" width="56" height="16" rx="5" fill="${c}" opacity=".7"/><rect x="172" y="58" width="56" height="16" rx="5" fill="${c}" opacity=".52"/><rect x="172" y="82" width="56" height="16" rx="5" fill="${c}" opacity=".36"/>`,
 "39":(c,t,d)=>`<path d="M14 118h212" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <path d="M120 20v98" stroke="${c}" stroke-width="2.6" stroke-dasharray="6 5" opacity=".5"/>
  <g><circle cx="40" cy="60" r="7" fill="${c}"/><path d="M25 118c0-18 7-28 15-28s15 10 15 28z" fill="${c}"/></g><g><circle cx="80" cy="60" r="7" fill="${c}"/><path d="M65 118c0-18 7-28 15-28s15 10 15 28z" fill="${c}"/></g>
  <g opacity=".75"><circle cx="146" cy="76" r="5.5" fill="${c}"/><path d="M135 118c0-13 5-20 11-20s11 7 11 20z" fill="${c}"/></g><g opacity=".75"><circle cx="174" cy="76" r="5.5" fill="${c}"/><path d="M163 118c0-13 5-20 11-20s11 7 11 20z" fill="${c}"/></g><g opacity=".75"><circle cx="202" cy="76" r="5.5" fill="${c}"/><path d="M191 118c0-13 5-20 11-20s11 7 11 20z" fill="${c}"/></g>`,
 "40":(c,t,d)=>`<circle cx="120" cy="66" r="18" fill="${c}"/>
  VIG<path d="M320 86 L320 26" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="320" cy="26" r="10" fill="${c}" opacity=".62"/><path d="M332 89 L360 36" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="360" cy="36" r="10" fill="${c}" opacity=".62"/><path d="M341 97 L391 63" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="391" cy="63" r="10" fill="${c}" opacity=".62"/><path d="M346 109 L405 102" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="405" cy="102" r="10" fill="${c}" opacity=".62"/><path d="M344 121 L400 142" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="400" cy="142" r="10" fill="${c}" opacity=".62"/><path d="M337 131 L377 176" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="377" cy="176" r="10" fill="${c}" opacity=".62"/><path d="M326 137 L341 196" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="341" cy="196" r="10" fill="${c}" opacity=".62"/><path d="M314 137 L299 196" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="299" cy="196" r="10" fill="${c}" opacity=".62"/><path d="M303 131 L263 176" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="263" cy="176" r="10" fill="${c}" opacity=".62"/><path d="M296 121 L240 142" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="240" cy="142" r="10" fill="${c}" opacity=".62"/><path d="M294 109 L235 102" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="235" cy="102" r="10" fill="${c}" opacity=".62"/><path d="M299 97 L249 63" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="249" cy="63" r="10" fill="${c}" opacity=".62"/><path d="M308 89 L280 36" stroke="${c}" stroke-width="2.6" opacity=".5"/><circle cx="280" cy="36" r="10" fill="${c}" opacity=".62"/>`,
};

module.exports = { icons, scenes, STRIP, VIG };
