import { esc, fmt } from "./engine";
import { CIRC, type Exam } from "./types";
import type { OrunBook, OrunItem, OrunTrack } from "./types";

export function orunPaper(
  T: OrunTrack,
  b: OrunBook,
  it: OrunItem,
  isChk: boolean,
  withKey: boolean,
) {
  const kind = isChk ? T.check : T.recall;
  const head =
    '<div class="exh"><div class="lft"><div class="bar"></div><div>' +
    '<div class="t0">' +
    esc(T.vol) +
    " · " +
    esc(b.short) +
    "</div>" +
    '<div class="t1">' +
    esc(it.t) +
    "</div></div></div>" +
    '<div class="rgt"><b>' +
    esc(kind) +
    "</b>" +
    esc(it.src || "") +
    "</div></div>" +
    '<div class="exi"><div><span>학년/반</span><i></i></div><div><span>이름</span><i></i></div>' +
    '<div class="sc"><span>점수</span><i>&nbsp; &nbsp; / 100</i></div></div>';

  let body = "";
  if (isChk) {
    body =
      '<div class="excols">' +
      it.chk.questions
        .map((q) => {
          let h = '<div class="pq">';
          if (q.groupHeader)
            h +=
              '<div style="background:#eef4ff;border-left:2.5px solid #0f1b2d;border-radius:4px;padding:3px 7px;margin-bottom:4px;font-weight:800;font-size:10px">' +
              fmt(q.groupHeader) +
              "</div>";
          h += '<div class="ph"><span class="pn">' + q.no + "</span></div>";
          if (q.stem) h += '<div class="pstem">' + fmt(q.stem) + "</div>";
          if (q.bank && q.bank.length)
            h +=
              '<div style="border:1px solid #d8dfe9;border-radius:4px;padding:3px 7px;margin:3px 0;font-size:10px"><b style="color:#8a97a8;font-size:8.5px">보기</b> ' +
              q.bank.map(fmt).join("&nbsp; ") +
              "</div>";
          if (q.bullets && q.bullets.length)
            h +=
              '<div style="font-size:10.4px;line-height:1.6;margin-top:2px">' +
              q.bullets.map((x) => "· " + fmt(x)).join("<br>") +
              "</div>";
          if (q.choices && q.choices.length) {
            const long = q.choices.some((c) => c.length > 16);
            h +=
              '<ol class="' +
              (long ? "" : "two") +
              '">' +
              q.choices.map((c, i) => "<li>" + CIRC[i] + " " + fmt(c) + "</li>").join("") +
              "</ol>";
          } else h += '<div class="line"></div>';
          return h + "</div>";
        })
        .join("") +
      "</div>";
  } else {
    body = (it.rec?.sections || [])
      .map(
        (sec) =>
          '<div style="margin-bottom:7mm"><div style="display:flex;gap:8px;align-items:center;margin-bottom:5px">' +
          '<span style="background:#0f1b2d;color:#fff;border-radius:4px;padding:2px 9px;font-weight:800;font-size:9.5px">' +
          esc(sec.label || "") +
          '</span><span style="font-size:9.8px;color:#5b6b7c">' +
          esc(sec.instruction || "") +
          "</span></div>" +
          sec.rows
            .map(
              (r, i) =>
                '<div class="pq" style="margin-bottom:4mm"><div class="ph"><span class="pn">' +
                (i + 1) +
                '</span></div><div class="pstem">' +
                fmt(r.prompt || "") +
                '</div><div class="line" style="height:' +
                (r.lines || 1) * 13 +
                'px"></div></div>',
            )
            .join("") +
          "</div>",
      )
      .join("");
  }

  let h =
    '<div class="sheet">' +
    head +
    '<div style="height:9px"></div>' +
    body +
    '<div class="exf"><b>ORUN GRAMMAR</b>&nbsp;· ' +
    esc(T.vol) +
    " " +
    esc(kind) +
    '<span class="pg">1</span></div></div>';

  if (withKey) {
    h +=
      '<div class="sheet"><div class="keyh"><div class="bar"></div><div><div class="t0">ANSWER &amp; EXPLANATION</div>' +
      '<div class="t1">' +
      esc(it.t) +
      " — " +
      esc(kind) +
      " 정답 및 해설</div></div>" +
      '<div class="rgt"><b>' +
      esc(T.vol) +
      "</b>교사용</div></div>" +
      '<table class="ktab"><tr><th style="width:24px">No</th><th style="width:170px">정답</th><th>해설</th></tr>' +
      (isChk
        ? (it.chk.answerKey || [])
            .map(
              (k) =>
                '<tr><td class="n">' +
                k.no +
                '</td><td class="a">' +
                fmt(k.answer || "") +
                "</td><td>" +
                esc(k.why || "") +
                "</td></tr>",
            )
            .join("")
        : (it.rec?.sections || [])
            .map(
              (sec) =>
                '<tr><td colspan="3" style="background:#f6f8fb;font-weight:800">' +
                esc(sec.label || "") +
                "</td></tr>" +
                sec.rows
                  .map(
                    (r, i) =>
                      '<tr><td class="n">' +
                      (i + 1) +
                      '</td><td class="a">' +
                      fmt(r.answer || "") +
                      "</td><td>" +
                      esc(r.why || "") +
                      "</td></tr>",
                  )
                  .join(""),
            )
            .join("")) +
      '</table><div class="exf"><b>ORUN GRAMMAR</b>&nbsp;· 정답 및 해설<span class="pg">2</span></div></div>';
  }
  return h;
}

export function orunExam(T: OrunTrack, b: OrunBook, it: OrunItem, isChk: boolean): Exam {
  const kind = isChk ? T.check : T.recall;
  const qs: Exam["qs"] = [];
  if (isChk) {
    const key: Record<number, { answer?: string; why?: string }> = {};
    (it.chk.answerKey || []).forEach((k) => {
      key[k.no] = k;
    });
    it.chk.questions.forEach((q) => {
      let stem = (q.groupHeader ? q.groupHeader + "\n" : "") + (q.stem || "");
      if (q.bank && q.bank.length) stem += "\n[보기] " + q.bank.join("   ");
      if (q.bullets && q.bullets.length) stem += "\n" + q.bullets.map((x) => "· " + x).join("\n");
      const k = key[q.no] || {};
      const hasCh = !!(q.choices && q.choices.length);
      qs.push({
        seq: q.no,
        level: "중",
        type: hasCh ? "mc" : "short",
        stem: stem.trim(),
        ...(hasCh ? { choices: q.choices as string[] } : {}),
        answer: hasCh ? Math.max(1, (q.choices || []).indexOf(k.answer || "") + 1) : k.answer || "",
        why: k.why || "",
        no: q.no,
        cat: it.t,
        catId: it.id,
        grade: T.vol,
      });
    });
  } else {
    let n = 0;
    (it.rec?.sections || []).forEach((sec) => {
      sec.rows.forEach((r) => {
        n++;
        qs.push({
          seq: n,
          level: "중",
          type: "short",
          stem: "[" + (sec.label || "") + "] " + (r.prompt || ""),
          answer: r.answer || "",
          why: r.why || "",
          no: n,
          cat: it.t,
          catId: it.id,
          grade: T.vol,
        });
      });
    });
  }
  return {
    cfg: {
      title: it.t + " — " + kind,
      grade: T.vol,
      book: b.short,
      cats: [it.id],
      lvN: { 상: 0, 중: qs.length, 하: 0 },
      tyN: { mc: qs.filter((q) => q.type === "mc").length, short: qs.filter((q) => q.type === "short").length },
      total: qs.length,
      noDup: false,
      seed: 0,
    },
    qs,
  };
}
