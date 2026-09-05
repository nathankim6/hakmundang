import { CIRC, type Exam } from "./types";

let CRC: Uint32Array | null = null;
function crc32(u8: Uint8Array) {
  if (!CRC) {
    CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]!) & 255]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
const u16 = (n: number) => [n & 255, (n >> 8) & 255];
const u32 = (n: number) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];

function zipStore(files: { name: string; data: string }[]) {
  const enc = new TextEncoder();
  const parts: (Uint8Array | string)[] = [];
  const cen: { nm: Uint8Array; crc: number; len: number; off: number }[] = [];
  let off = 0;
  files.forEach((f) => {
    const data = enc.encode(f.data);
    const nm = enc.encode(f.name);
    const crc = crc32(data);
    const loc = ([80, 75, 3, 4] as number[]).concat(
      u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(data.length), u32(data.length), u16(nm.length), u16(0),
    );
    parts.push(new Uint8Array(loc), nm, data);
    cen.push({ nm, crc, len: data.length, off });
    off += loc.length + nm.length + data.length;
  });
  const cd: Uint8Array[] = [];
  let cdl = 0;
  cen.forEach((c) => {
    const hh = ([80, 75, 1, 2] as number[]).concat(
      u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(c.crc), u32(c.len), u32(c.len),
      u16(c.nm.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(c.off),
    );
    cd.push(new Uint8Array(hh), c.nm);
    cdl += hh.length + c.nm.length;
  });
  cd.push(
    new Uint8Array(
      ([80, 75, 5, 6] as number[]).concat(
        u16(0), u16(0), u16(cen.length), u16(cen.length), u32(cdl), u32(off), u16(0),
      ),
    ),
  );
  return new Blob([...parts, ...cd] as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

const X = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function wRuns(t: unknown, o: { b?: number; c?: string; sz?: number } = {}) {
  const text = String(t ?? "");
  const out: string[] = [];
  const P: [string, number][] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = /<u>([\s\S]*?)<\/u>/g;
  while ((m = re.exec(text))) {
    if (m.index > last) P.push([text.slice(last, m.index), 0]);
    P.push([m[1]!, 1]);
    last = re.lastIndex;
  }
  if (last < text.length) P.push([text.slice(last), 0]);
  P.forEach((p) => {
    p[0].split("\n").forEach((line, i) => {
      if (i) out.push("<w:r><w:br/></w:r>");
      out.push(
        "<w:r><w:rPr>" +
          (o.b ? "<w:b/>" : "") +
          (p[1] ? '<w:u w:val="single"/>' : "") +
          (o.c ? '<w:color w:val="' + o.c + '"/>' : "") +
          '<w:sz w:val="' + (o.sz || 20) + '"/><w:szCs w:val="' + (o.sz || 20) + '"/></w:rPr>' +
          '<w:t xml:space="preserve">' + X(line) + "</w:t></w:r>",
      );
    });
  });
  return out.join("");
}

function wP(
  runs: string,
  o: { before?: number; after?: number; line?: number; ind?: number; hang?: number; align?: string; bdr?: number } = {},
) {
  return (
    '<w:p><w:pPr><w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after || 40) +
    '" w:line="' + (o.line || 264) + '" w:lineRule="auto"/>' +
    (o.ind ? '<w:ind w:left="' + o.ind + '" w:hanging="' + (o.hang || 0) + '"/>' : "") +
    (o.align ? '<w:jc w:val="' + o.align + '"/>' : "") +
    (o.bdr ? '<w:pBdr><w:bottom w:val="single" w:sz="' + o.bdr + '" w:space="4" w:color="0F1B2D"/></w:pBdr>' : "") +
    "</w:pPr>" + runs + "</w:p>"
  );
}

export function docxBlob(exam: Exam, withKey: boolean) {
  const { cfg, qs } = exam;
  const per = Math.floor(100 / Math.max(1, qs.length));
  const ex = 100 - per * qs.length;
  const PG =
    '<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1020" w:right="900" w:bottom="1020" w:left="900" w:header="0" w:footer="0" w:gutter="0"/>';
  const SEC1 = '<w:sectPr><w:type w:val="continuous"/>' + PG + '<w:cols w:num="1"/></w:sectPr>';
  const SEC2 = '<w:sectPr><w:type w:val="continuous"/>' + PG + '<w:cols w:num="2" w:space="420" w:sep="1"/></w:sectPr>';
  let b = "";
  b += wP(wRuns("ORUN GRAMMAR · " + cfg.grade + (cfg.book ? " · " + cfg.book : ""), { b: 1, sz: 15, c: "8A97A8" }), { after: 20 });
  b += wP(wRuns(cfg.title, { b: 1, sz: 32 }), { after: 70, bdr: 18 });
  b += wP(wRuns("학년/반 ____________     이름 ____________     점수 ________ / 100     (총 " + qs.length + "문항)", { sz: 18, c: "44506A" }), { after: 50 });
  b += wP(wRuns("객관식은 ①~⑤ 중 하나를, 주관식은 빈칸에 알맞은 말을 정확히 쓰시오.", { sz: 16, c: "8A97A8" }), { after: 110 });
  b += "<w:p><w:pPr>" + SEC1 + "</w:pPr></w:p>";
  qs.forEach((q, i) => {
    const pts = per + (i < ex ? 1 : 0);
    b += wP(
      wRuns(q.seq + ". ", { b: 1, sz: 20 }) +
        wRuns("[" + q.level + "·" + pts + "점] ", { sz: 14, c: "A8B2BF" }) +
        wRuns(q.stem, { sz: 20 }),
      { before: i ? 120 : 0, after: 30, ind: 260, hang: 260 },
    );
    if (q.type === "mc")
      (q.choices || []).forEach((c, j) => {
        b += wP(wRuns(CIRC[j] + " " + c, { sz: 19 }), { after: 14, ind: 400 });
      });
    else b += wP(wRuns("▶ __________________________________", { sz: 19, c: "9AA6B4" }), { after: 20, ind: 400 });
  });
  let tail = "";
  if (withKey) {
    tail += "<w:p><w:pPr>" + SEC2 + "</w:pPr></w:p>";
    tail += wP(wRuns("ANSWER & EXPLANATION", { b: 1, sz: 15, c: "8A97A8" }), { after: 20 });
    tail += wP(wRuns(cfg.title + " — 정답 및 해설", { b: 1, sz: 28 }), { after: 70, bdr: 18 });
    qs.forEach((q) => {
      tail += wP(
        wRuns(q.seq + ". ", { b: 1, sz: 19 }) +
          wRuns(
            q.type === "mc" ? CIRC[(q.answer as number) - 1] + " " + (q.choices || [])[(q.answer as number) - 1] : q.answer,
            { b: 1, sz: 19, c: "B8332E" },
          ) +
          wRuns("   " + q.why, { sz: 18 }) +
          wRuns("   (" + q.cat + ")", { sz: 15, c: "A8B2BF" }),
        { after: 26, ind: 280, hang: 280 },
      );
    });
    tail += SEC1.replace('<w:type w:val="continuous"/>', "");
  } else tail += SEC2;
  const doc =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    b + tail + "</w:body></w:document>";
  return zipStore([
    {
      name: "[Content_Types].xml",
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
    },
    {
      name: "_rels/.rels",
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    },
    {
      name: "word/_rels/document.xml.rels",
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    },
    {
      name: "word/styles.xml",
      data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr>' +
        '<w:rFonts w:ascii="Noto Sans KR" w:hAnsi="Noto Sans KR" w:eastAsia="Noto Sans KR" w:cs="Noto Sans KR"/>' +
        '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>',
    },
    { name: "word/document.xml", data: doc },
  ]);
}
