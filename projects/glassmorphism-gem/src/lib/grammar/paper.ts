import { esc, fmt } from "./engine";
import { CIRC, type Exam, type PickedQuestion } from "./types";

function pqHtml(q: PickedQuestion, pts: number) {
  let h =
    '<div class="pq"><div class="ph"><span class="pn">' +
    q.seq +
    '</span><span class="plv ' +
    q.level +
    '">' +
    q.level +
    '</span><span class="pt">' +
    pts +
    "점</span></div>" +
    '<div class="pstem">' +
    fmt(q.stem) +
    "</div>";
  if (q.type === "mc") {
    const choices = q.choices || [];
    const long = choices.some((c) => c.length > 16);
    h +=
      '<ol class="' +
      (long ? "" : "two") +
      '">' +
      choices.map((c, i) => "<li>" + CIRC[i] + " " + fmt(c) + "</li>").join("") +
      "</ol>";
  } else {
    h +=
      '<div class="line' +
      (/영작|배열|바꿔|고쳐|전환|다시 쓰/.test(q.stem) ? " d" : "") +
      '"></div>';
  }
  return h + "</div>";
}

export function paperHtml(exam: Exam, withKey: boolean) {
  const { cfg, qs } = exam;
  const per = Math.floor(100 / Math.max(1, qs.length));
  const ex = 100 - per * qs.length;
  const PP = 14;
  const pages: PickedQuestion[][] = [];
  for (let i = 0; i < qs.length; i += PP) pages.push(qs.slice(i, i + PP));
  const tot = pages.length + (withKey ? 1 : 0);
  const foot = (p: number) =>
    '<div class="exf"><b>ORUN GRAMMAR</b>&nbsp;· 옳은영어 문법 문제은행<span class="pg">' +
    p +
    " / " +
    tot +
    "</span></div>";
  let h = "";
  pages.forEach((pg, pi) => {
    h +=
      '<div class="sheet">' +
      (pi === 0
        ? '<div class="exh"><div class="lft"><div class="bar"></div><div>' +
          '<div class="t0">ORUN GRAMMAR · ' +
          esc(cfg.grade) +
          (cfg.book ? " · " + esc(cfg.book) : "") +
          "</div>" +
          '<div class="t1">' +
          esc(cfg.title) +
          "</div></div></div>" +
          '<div class="rgt"><b>옳은영어</b>총 ' +
          qs.length +
          "문항 · 100점 만점</div></div>" +
          '<div class="exi"><div><span>학년/반</span><i></i></div><div><span>이름</span><i></i></div>' +
          '<div class="sc"><span>점수</span><i>&nbsp; &nbsp; / 100</i></div></div>' +
          '<div class="exn"><b>유의사항</b> 객관식은 ①~⑤ 중 하나를, 주관식은 빈칸에 알맞은 말을 정확히 쓰시오.' +
          '<span class="sp">난이도 상 · 중 · 하 표기</span></div>'
        : '<div class="exh"><div class="lft"><div class="bar"></div><div><div class="t0">ORUN GRAMMAR</div>' +
          '<div class="t1" style="font-size:15px">' +
          esc(cfg.title) +
          "</div></div></div>" +
          '<div class="rgt"><b>옳은영어</b>' +
          (pi + 1) +
          '쪽</div></div><div style="height:9px"></div>') +
      '<div class="excols">' +
      pg.map((q) => pqHtml(q, per + (qs.indexOf(q) < ex ? 1 : 0))).join("") +
      "</div>" +
      foot(pi + 1) +
      "</div>";
  });
  if (withKey) {
    h +=
      '<div class="sheet"><div class="keyh"><div class="bar"></div><div>' +
      '<div class="t0">ANSWER &amp; EXPLANATION</div>' +
      '<div class="t1">' +
      esc(cfg.title) +
      " — 정답 및 해설</div></div>" +
      '<div class="rgt"><b>옳은영어</b>교사용</div></div>' +
      '<div class="omr">' +
      qs
        .map(
          (q) =>
            "<div><b>" +
            q.seq +
            "</b><i>" +
            (q.type === "mc" ? CIRC[(q.answer as number) - 1] : "단답") +
            "</i></div>",
        )
        .join("") +
      "</div>" +
      '<table class="ktab"><tr><th style="width:24px">No</th><th style="width:150px">정답</th><th>해설</th><th style="width:96px">출제 항목</th></tr>' +
      qs
        .map(
          (q) =>
            '<tr><td class="n">' +
            q.seq +
            '</td><td class="a">' +
            (q.type === "mc"
              ? CIRC[(q.answer as number) - 1] + " " + fmt((q.choices || [])[(q.answer as number) - 1])
              : fmt(q.answer) +
                (q.alt && q.alt.length
                  ? ' <span style="color:#8a97a8;font-weight:500">/ ' + esc(q.alt.join(" / ")) + "</span>"
                  : "")) +
            "</td><td>" +
            esc(q.why) +
            '</td><td style="color:#8a97a8;font-size:9px">' +
            esc(q.cat) +
            "</td></tr>",
        )
        .join("") +
      "</table>" +
      foot(tot) +
      "</div>";
  }
  return h;
}

export function printHtml(html: string) {
  const el = document.getElementById("paper");
  if (!el) return;
  el.innerHTML = html;
  setTimeout(() => window.print(), 150);
}
