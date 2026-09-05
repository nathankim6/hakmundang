import {
  type Bank,
  type Cat,
  type ExamCfg,
  type Level,
  type PickedQuestion,
  type QType,
  type Question,
  LVS,
} from "./types";

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

export const fmt = (s: unknown) =>
  esc(s).replace(/&lt;u&gt;/g, "<u>").replace(/&lt;\/u&gt;/g, "</u>");

export function mulberry(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuf<T>(arr: T[], r: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[.,!?;:]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

export const okShort = (q: Question, v: unknown) => {
  const n = norm(v);
  return !!n && [q.answer].concat(q.alt || []).some((a) => norm(a) === n);
};

export const gcats = (cats: Cat[], g: string) => cats.filter((c) => c.grade === g);

export function planMatrix(
  N: number,
  lvN: Record<Level, number>,
  tyN: { mc: number; short: number },
) {
  const out: { level: Level; type: QType; need: number }[] = [];
  LVS.forEach((l) => {
    const n = lvN[l] || 0;
    if (!n) return;
    let mc = Math.round(n * (tyN.mc / Math.max(1, N)));
    mc = Math.max(0, Math.min(mc, n));
    out.push({ level: l, type: "mc", need: mc }, { level: l, type: "short", need: n - mc });
  });
  let cur = out.filter((o) => o.type === "mc").reduce((s, o) => s + o.need, 0);
  let guard = 0;
  while (cur !== tyN.mc && guard++ < 200) {
    const up = cur < tyN.mc;
    const src = out
      .filter((o) => o.type === (up ? "short" : "mc") && o.need > 0)
      .sort((a, b) => b.need - a.need)[0];
    if (!src) break;
    const dst = out.find((o) => o.level === src.level && o.type !== src.type);
    if (!dst) break;
    src.need--;
    dst.need++;
    cur += up ? 1 : -1;
  }
  return out.filter((o) => o.need > 0);
}

export function byIdMap(bank: Bank) {
  const m: Record<string, Cat> = {};
  bank.cats.forEach((c) => (m[c.id] = c));
  return m;
}

function pool(byId: Record<string, Cat>, ids: string[], levels: Level[], types: QType[]) {
  const P: Omit<PickedQuestion, "seq">[] = [];
  ids.forEach((id) => {
    const c = byId[id];
    if (!c) return;
    c.questions.forEach((q) => {
      if (levels.indexOf(q.level) < 0) return;
      if (types.indexOf(q.type) < 0) return;
      P.push({ ...q, cat: c.name, catId: c.id, grade: c.grade });
    });
  });
  return P;
}

const readUsed = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem("og.used") || "[]"));
  } catch {
    return new Set<string>();
  }
};

export function pickQuestions(byId: Record<string, Cat>, cfg: ExamCfg): PickedQuestion[] {
  const rnd = mulberry(cfg.seed);
  const used = cfg.noDup ? readUsed() : new Set<string>();
  let out: Omit<PickedQuestion, "seq">[] = [];
  planMatrix(cfg.total, cfg.lvN, cfg.tyN).forEach((m) => {
    let P = pool(byId, cfg.cats, [m.level], [m.type]);
    const fresh = P.filter((q) => !used.has(q.catId + "#" + q.no));
    P = shuf(fresh.length >= m.need ? fresh : P, rnd);
    out = out.concat(P.slice(0, m.need));
  });
  out = shuf(out, rnd);
  out.sort((a, b) => (a.type === b.type ? 0 : a.type === "mc" ? -1 : 1));
  return out.map((q, i) => ({ ...q, seq: i + 1 }));
}

export function rememberUsed(qs: PickedQuestion[]) {
  const u = readUsed();
  qs.forEach((q) => u.add(q.catId + "#" + q.no));
  localStorage.setItem("og.used", JSON.stringify(Array.from(u).slice(-6000)));
}

export function poolStat(byId: Record<string, Cat>, ids: string[]) {
  const r = {
    상: { mc: 0, short: 0 },
    중: { mc: 0, short: 0 },
    하: { mc: 0, short: 0 },
    all: 0,
  };
  ids.forEach((id) => {
    const c = byId[id];
    if (!c) return;
    c.questions.forEach((q) => {
      r[q.level][q.type]++;
      r.all++;
    });
  });
  return r;
}

export const encCfg = (c: ExamCfg) =>
  "OG2." + btoa(unescape(encodeURIComponent(JSON.stringify(c))));

export function decCfg(x: string): ExamCfg | null {
  try {
    if (!/^OG[12]\./.test(x)) return null;
    return JSON.parse(decodeURIComponent(escape(atob(x.slice(4)))));
  } catch {
    return null;
  }
}

export function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 900);
}
