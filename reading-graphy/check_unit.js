/* 유닛 스모크 테스트 — usage: node check_unit.js <bookdir>/units/unitNN.js [full|short]
   ORUN_WORK가 자동으로 <bookdir>/work 로 설정된 상태에서 render/renderExplain을 실제 실행한다. */
const path = require("path");
const fs = require("fs");
const file = path.resolve(process.argv[2]);
const kind = process.argv[3] || "";
const bookdir = path.dirname(path.dirname(file));
process.env.ORUN_WORK = path.join(bookdir, "work");

const errs = [];
let U;
try { U = require(file); } catch (e) { console.error("LOAD FAIL:", e.message); process.exit(1); }

const base = path.basename(file, ".js");           // unitNN
const nn = base.replace("unit", "");
if (U.no !== nn) errs.push(`no 필드(${U.no}) != 파일명(${nn})`);
if (!U.title) errs.push("title 없음");
if (!U.level) errs.push("level 없음");
if (!U.foot || !U.foot.includes(U.title)) errs.push("foot이 title을 포함하지 않음");
if (!Array.isArray(U.banner) || U.banner[0] !== nn) errs.push("banner 배열 이상");
if (kind === "short" && U.pages !== 5) errs.push("축약 유닛인데 pages:5 없음");
if (kind === "full" && U.pages) errs.push("풀 유닛인데 pages 필드가 있음(지워야 함)");
const banner = path.join(bookdir, "work", `banner_u${nn}.png`);
if (!fs.existsSync(banner)) errs.push(`배너 없음: ${banner}`);
if (kind === "full") {
  const kb = path.join(bookdir, "work", `kb_u${nn}.png`);
  if (!fs.existsSync(kb)) errs.push(`KB 도식 없음: ${kb}`);
}
const src = fs.readFileSync(file, "utf8");
// 블록 주석이 코드를 삼켰는지 검사한다 — 치환 스크립트가 주석의 닫는 기호를 지우면
// 문법은 유효한 채 한 구역이 통째로 사라진다(렌더는 통과하므로 여기서 잡아야 한다).
(() => {
  const CODE = /K\.push\(|exSeg\(|new TableRow|new Paragraph|writeField\(|\bT\(\[/;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {           // 문자열 리터럴 건너뛰기
      const q = c; i++;
      while (i < src.length) { if (src[i] === "\\") { i += 2; continue; } if (src[i] === q) break; i++; }
      continue;
    }
    if (c === "/" && src[i + 1] === "/") { const j = src.indexOf("\n", i); i = j < 0 ? src.length : j; continue; }
    if (c === "/" && src[i + 1] === "*") {
      const j = src.indexOf("*/", i + 2);
      const end = j < 0 ? src.length : j + 2;
      const body = src.slice(i, end);
      if (CODE.test(body)) {
        const line = src.slice(0, i).split("\n").length;
        errs.push(`${line}행 블록 주석이 코드 ${body.split("\n").length}줄을 삼킴 (닫는 */ 누락) — ${body.slice(0, 50).trim()}...`);
      }
      i = end - 1;
      continue;
    }
  }
})();
if (src.includes("banner_u01.png") && nn !== "01") errs.push("banner_u01.png가 남아 있음 (banner_u" + nn + ".png로 교체)");
if (src.includes("kb_u01.png") && nn !== "01") errs.push("kb_u01.png가 남아 있음");

const L = require(path.join(bookdir, "scripts", "lib.js"));
for (const fn of ["render", "renderExplain"]) {
  const K = [];
  try {
    U[fn](L.mkCtx(U.no, K));
    if (K.length < 10) errs.push(`${fn}: 요소가 너무 적음 (${K.length})`);
  } catch (e) { errs.push(`${fn} 실행 오류: ${e.message}`); }
}
if (errs.length) { console.error("FAIL " + base + ":\n - " + errs.join("\n - ")); process.exit(1); }
console.log("OK " + base + " (" + (kind || "?") + ", title=" + U.title + ")");
