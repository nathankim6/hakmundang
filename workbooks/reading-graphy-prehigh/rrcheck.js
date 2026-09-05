/* READ RIGHT 전 문장 표기 데이터 검사.  node rrcheck.js 10  (인자 없으면 rr/ 에 있는 유닛 전부) */
const fs = require("fs");
const ROLES = new Set(["s", "v", "c", "s2", "v2", "m"]);
const nos = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(__dirname + "/rr").map(f => f.match(/^u(\d+)\.js$/)?.[1]).filter(Boolean);
let bad = 0;
const err = (u, l, i, m) => { bad++; console.log(`  U${u} L${l} 문장${i + 1}  ${m}`); };
for (const nn of nos) {
  const pad = String(nn).padStart(2, "0");
  const U = require(`./units/u${pad}.js`);
  let RR; try { RR = require(`./rr/u${pad}.js`); } catch (e) { bad++; console.log(`  U${U.no}  rr/u${pad}.js 없음 또는 문법 오류: ${e.message}`); continue; }
  console.log(`Unit ${U.no}`);
  for (const t of U.lessons) {
    const R = RR[t.no];
    if (!Array.isArray(R)) { bad++; console.log(`  U${U.no} L${t.no}  rr 항목 없음`); continue; }
    if (R.length !== t.sent.length) { bad++; console.log(`  U${U.no} L${t.no}  문장 ${t.sent.length}개 ≠ rr ${R.length}개`); }
    R.forEach((toks, i) => {
      if (!Array.isArray(toks) || !toks.length) return err(U.no, t.no, i, "토큰 배열이 아님");
      const roles = [];
      for (const tk of toks) {
        if (!Array.isArray(tk) || tk.length !== 2 || typeof tk[0] !== "string") return err(U.no, t.no, i, `토큰 형식 오류: ${JSON.stringify(tk)}`);
        if (!/[A-Za-z0-9]/.test(tk[0])) return err(U.no, t.no, i, `구두점만 있는 토큰은 앞 토큰에 붙인다: "${tk[0]}"`);
        if (tk[0] !== tk[0].trim()) return err(U.no, t.no, i, `토큰 앞뒤 공백: "${tk[0]}"`);
        if (tk[1] !== null && !ROLES.has(tk[1])) return err(U.no, t.no, i, `역할 값 오류: ${tk[1]}`);
        roles.push(tk[1]);
      }
      const joined = toks.map(x => x[0]).join(" ");
      if (joined !== t.sent[i]) return err(U.no, t.no, i, `토큰을 이으면 원문과 다름\n      rr : ${joined}\n      원문: ${t.sent[i]}`);
      if (!roles.includes("v")) err(U.no, t.no, i, "본동사(v)가 없음");
      if (!roles.includes("s")) console.log(`  U${U.no} L${t.no} 문장${i + 1}  (주의) 주어(s)가 없음 — 명령문이 아니면 확인`);
      if (roles.includes("s2") && !roles.includes("v2")) err(U.no, t.no, i, "s2 가 있는데 v2 가 없음");
      if (roles.includes("v2") && !roles.includes("c") && !roles.includes("s2")) err(U.no, t.no, i, "v2 가 있는데 접속사(c)도 s2 도 없음");
    });
  }
}
console.log(bad ? `\n── 문제 ${bad}건` : "\n── rr 데이터 규격 통과");
process.exit(bad ? 1 : 0);
