import * as XLSX from "xlsx";

export type QType = "객관식" | "주관식";
export interface QuestionInfo {
  num: number;
  type: QType;
  topic: string;
}

export type OX = "O" | "X" | null;

export interface VocabRound {
  round: number;
  score: number | null;
  absent: boolean;
}

export interface Student {
  className: string;     // sheet-name style (e.g., 중1FO)
  classKey: string;      // 1FO / 1INT / 1AD / IVY
  name: string;
  rawName: string;
  id: string;

  // 문법
  objAnswers: OX[];               // length 25
  objScore: number | null;        // raw, 25 * 2 = /50
  subjScores: (number | null)[];  // length 5, each /4
  subjTotal: number | null;       // /20
  grammarRaw: number | null;      // obj+subj, /70
  grammarBase: number;            // 30
  grammarFinal: number | null;    // /100

  // 독해
  readingCorrect: number | null;  // /20
  readingRaw: number | null;      // /70
  readingBase: number;            // 30
  readingFinal: number | null;    // /100

  // 단어누적 (22 rounds)
  vocab: VocabRound[];
  vocabAvg: number | null;

  hasGrammar: boolean;
  hasReading: boolean;
  hasVocab: boolean;
  hasAny: boolean;
}

export interface ClassData {
  classKey: string;
  sheetName: string;
  questions: QuestionInfo[];   // 30 questions in order
  students: Student[];
  avgGrammarFinal: number;
  avgReadingFinal: number;
  avgVocab: number;
}

export interface Diagnostic {
  classes: ClassData[];
}

const CLASS_KEYS = ["FO", "INT", "AD", "IVY", "TOP"] as const;
type ClassKey = (typeof CLASS_KEYS)[number];

const BASE_LABEL: Record<ClassKey, string> = {
  FO: "FO",
  INT: "Inter",
  AD: "AD",
  IVY: "IVY",
  TOP: "TOP",
};

// Normalize any class identifier spelling to a canonical ClassKey.
// Handles: FO / 1FO / 중1FO / INT / INTER / 중2Inter / 2IN / AD / 3AD / IVY / 중1IVY / TOP
function normClass(raw: any): ClassKey | null {
  const s = String(raw ?? "").replace(/\s+/g, "").toUpperCase();
  if (!s) return null;
  if (s.includes("TOP")) return "TOP";
  if (s.includes("IVY")) return "IVY";
  if (s.includes("INT") || s.includes("IN")) return "INT";
  if (s.includes("AD")) return "AD";
  if (s.includes("FO")) return "FO";
  return null;
}

// Grade digit embedded in a 문법유형 header label like "중2FO" / "중1Inter".
function cellGrade(v: any): string | null {
  const m = String(v ?? "").match(/중?\s*([123])\s*(?:FO|INT|INTER|AD|IVY)/i);
  return m ? m[1] : null;
}

function splitName(full: string): { name: string; id: string } {
  const m = String(full).match(/^(.*?)(\d+)$/);
  if (m) return { name: m[1].trim(), id: m[2] };
  return { name: String(full).trim(), id: "" };
}

// Normalize matching key: just the Korean name (digits & spaces stripped)
function nameKey(full: string): string {
  return splitName(String(full).replace(/\s+/g, "")).name;
}


// 문법유형 — detect each class's column group dynamically from the header row.
// In multi-grade files the header lists all grades (중1FO, 중2FO, …); pick the
// column whose embedded grade matches this file's grade (labels without a grade
// digit, e.g. "FO"/"IVY"/"TOP", are always accepted).
function loadQuestionTypes(wb: XLSX.WorkBook, grade: string): Record<ClassKey, QuestionInfo[]> {
  const sheet = wb.Sheets["문법유형"];
  const out: Record<ClassKey, QuestionInfo[]> = { FO: [], INT: [], AD: [], IVY: [], TOP: [] };
  if (!sheet) return out;
  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, blankrows: false, defval: null });
  const header = (rows[0] as any[]) ?? [];
  // Map each class to the column where its label appears (number col is one to the left).
  const groupCol: Partial<Record<ClassKey, number>> = {};
  for (let c = 0; c < header.length; c++) {
    const cg = cellGrade(header[c]);
    if (cg && cg !== grade) continue;
    const k = normClass(header[c]);
    if (k && groupCol[k] == null) groupCol[k] = c;
  }
  for (const k of CLASS_KEYS) {
    let labelCol = groupCol[k];
    // Older files merge INTER & AD into one column group.
    if (labelCol == null && k === "AD") labelCol = groupCol["INT"];
    if (labelCol == null && k === "INT") labelCol = groupCol["AD"];
    if (labelCol == null) continue;
    const c0 = labelCol - 1; // number
    const c1 = labelCol;     // type
    const c2 = labelCol + 1; // topic
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] as any[];
      if (!row) continue;
      const numCell = row[c0];
      const typeCell = row[c1];
      const topicCell = row[c2];
      if (numCell == null || typeCell == null || topicCell == null) continue;
      const m = String(numCell).match(/(\d+)/);
      if (!m) continue;
      // Type label varies across files: 객관식 / 주관식 / 서술형. Normalize:
      // anything that is not 객관식 (주관식, 서술형, etc.) counts as subjective.
      const rawType = String(typeCell).trim();
      const type: QType = rawType.includes("객관") ? "객관식" : "주관식";
      out[k].push({
        num: parseInt(m[1], 10),
        type,
        topic: String(topicCell).trim(),
      });
    }
  }
  return out;
}


function num(v: any): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export async function loadDiagnosticFromBuffer(buf: ArrayBuffer): Promise<Diagnostic> {
  const wb = XLSX.read(buf, { type: "array" });
  return parseWorkbook(wb);
}

export async function loadDiagnostic(url = "/data/diagnostic.xlsx"): Promise<Diagnostic> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  return parseWorkbook(wb);
}

async function parseWorkbook(wb: XLSX.WorkBook): Promise<Diagnostic> {

  // Detect this file's grade (중1 / 중2 / 중3) from the 문법 sheet name.
  let grade = "1";
  for (const n of wb.SheetNames) {
    const m = n.match(/^중([123])\(문법\)$/);
    if (m) { grade = m[1]; break; }
  }
  const classLabel = (k: ClassKey) => (k === "TOP" ? "TOP" : `중${grade}${BASE_LABEL[k]}`);

  const qmap = loadQuestionTypes(wb, grade);

  // Roster — some files include a class column (col1), others only names (col0).
  const rosterSheet = wb.Sheets["이름(명렬표)"];
  const roster: { rawName: string; classKey: ClassKey }[] = [];
  if (rosterSheet) {
    const rosterRows = XLSX.utils.sheet_to_json<any[]>(rosterSheet, { header: 1, blankrows: false, defval: null });
    for (const r of rosterRows) {
      if (!r || !r[0]) continue;
      const k = normClass(r[1]);
      if (!k) continue; // no class info → membership derived from data sheets
      roster.push({ rawName: String(r[0]).trim(), classKey: k });
    }
  }

  // 중X(문법) — O/X per question + scores
  const gramSheet = wb.Sheets[`중${grade}(문법)`];
  const gramByName = new Map<string, { classKey: ClassKey; ox: OX[]; obj: number | null; subj: number | null }>();
  if (gramSheet) {
    const gramRows = XLSX.utils.sheet_to_json<any[]>(gramSheet, { header: 1, blankrows: false, defval: null });
    for (let r = 2; r < gramRows.length; r++) {
      const row = gramRows[r] as any[];
      if (!row || !row[1]) continue;
      const k = normClass(row[0]);
      if (!k) continue;
      const rawName = String(row[1]).trim();
      const ox: OX[] = [];
      for (let q = 0; q < 25; q++) {
        const v = row[2 + q];
        if (v === "O" || v === "o") ox.push("O");
        else if (v === "X" || v === "x") ox.push("X");
        else ox.push(null);
      }
      const obj = num(row[27]);
      const subj = num(row[28]);
      gramByName.set(`${k}::${nameKey(rawName)}`, { classKey: k, ox, obj, subj });
    }
  }

  // 중X{...}(문법주관식) — subjective per-question scores 26-30
  // Match sheet by normalized class (handles 중1INTER vs 중1Inter, etc.)
  const subjByName = new Map<string, (number | null)[]>();
  const subjSheetNames = wb.SheetNames.filter((n) => n.replace(/\s+/g, "").includes("문법주관식"));
  for (const k of CLASS_KEYS) {
    const sheetName = subjSheetNames.find((n) => normClass(n) === k);
    const sheet = sheetName ? wb.Sheets[sheetName] : undefined;
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, blankrows: false, defval: null });
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] as any[];
      if (!row || !row[1]) continue;
      const rawName = String(row[1]).trim();
      const scores = [2, 3, 4, 5, 6].map((c) => num(row[c]));
      subjByName.set(`${k}::${nameKey(rawName)}`, scores);
    }
  }

  // 중X(독해)
  const readSheet = wb.Sheets[`중${grade}(독해)`];
  const readByName = new Map<string, { classKey: ClassKey; correct: number | null; raw: number | null; base: number; final: number | null }>();
  if (readSheet) {
    const readRows = XLSX.utils.sheet_to_json<any[]>(readSheet, { header: 1, blankrows: false, defval: null });
    for (let r = 1; r < readRows.length; r++) {
      const row = readRows[r] as any[];
      if (!row || !row[0] || !row[1]) continue;
      const k = normClass(row[1]);
      if (!k) continue;
      const rawName = String(row[0]).trim();
      readByName.set(`${k}::${nameKey(rawName)}`, {
        classKey: k,
        correct: num(row[3]),
        raw: num(row[4]),
        base: num(row[5]) ?? 30,
        final: num(row[6]),
      });
    }
  }

  // 중X(단어누적) — round count varies per file (22, 24, 29, …). Layout varies:
  // some files have a class column (col0) then name (col1); others put the name
  // directly in col0. We derive the number of rounds dynamically from the data.
  const vocabSheet = wb.Sheets[`중${grade}(단어누적)`];
  const vocabByName = new Map<string, VocabRound[]>(); // keyed by nameKey only
  if (vocabSheet) {
    const vocabRows = XLSX.utils.sheet_to_json<any[]>(vocabSheet, { header: 1, blankrows: false, defval: null });
    // Determine how many round columns exist (max trailing width across rows).
    let maxRounds = 0;
    for (const row of vocabRows) {
      if (!row) continue;
      const hasClassCol = normClass(row[0]) != null && row[1] != null;
      const start = hasClassCol ? 2 : 1;
      const nameRaw = hasClassCol ? row[1] : row[0];
      const cls = String(nameRaw ?? "").trim();
      if (!cls || cls === "반" || cls === "이름") continue;
      // Count columns up to the last cell that holds an actual value.
      let last = start - 1;
      for (let c = start; c < (row as any[]).length; c++) {
        const v = (row as any[])[c];
        if (v != null && v !== "") last = c;
      }
      maxRounds = Math.max(maxRounds, last - start + 1);
    }
    if (maxRounds < 1) maxRounds = 22;
    for (let r = 0; r < vocabRows.length; r++) {
      const row = vocabRows[r] as any[];
      if (!row) continue;
      const hasClassCol = normClass(row[0]) != null && row[1] != null;
      const nameRaw = hasClassCol ? row[1] : row[0];
      const start = hasClassCol ? 2 : 1;
      if (nameRaw == null) continue;
      const cls = String(nameRaw).trim();
      if (!cls || cls === "반" || cls === "이름") continue;
      const rounds: VocabRound[] = [];
      for (let i = 0; i < maxRounds; i++) {
        const v = row[start + i];
        if (v === "결석") rounds.push({ round: i + 1, score: null, absent: true });
        else rounds.push({ round: i + 1, score: num(v), absent: false });
      }
      vocabByName.set(nameKey(cls), rounds);
    }
  }

  // Build full set of names per class. Roster only carries class info in some
  // files, so the data sheets (문법/독해/주관식) are the authoritative source.
  const namesByClass: Record<ClassKey, Set<string>> = { FO: new Set(), INT: new Set(), AD: new Set(), IVY: new Set(), TOP: new Set() };
  for (const r of roster) namesByClass[r.classKey].add(r.rawName);
  // Re-walk source maps to collect raw names per class.

  if (gramSheet) {
    const gramRows = XLSX.utils.sheet_to_json<any[]>(gramSheet, { header: 1, blankrows: false, defval: null });
    for (let r = 2; r < gramRows.length; r++) {
      const row = gramRows[r] as any[];
      if (!row || !row[1]) continue;
      const k = normClass(row[0]);
      if (k) namesByClass[k].add(String(row[1]).trim());
    }
  }
  if (readSheet) {
    const readRows = XLSX.utils.sheet_to_json<any[]>(readSheet, { header: 1, blankrows: false, defval: null });
    for (let r = 1; r < readRows.length; r++) {
      const row = readRows[r] as any[];
      if (!row || !row[0] || !row[1]) continue;
      const k = normClass(row[1]);
      if (k) namesByClass[k].add(String(row[0]).trim());
    }
  }
  for (const k of CLASS_KEYS) {
    const sheetName = subjSheetNames.find((n) => normClass(n) === k);
    const sheet = sheetName ? wb.Sheets[sheetName] : undefined;
    if (!sheet) continue;
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, blankrows: false, defval: null });
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] as any[];
      if (!row || !row[1]) continue;
      namesByClass[k].add(String(row[1]).trim());
    }
  }

  // Build students per class
  const classes: ClassData[] = [];
  for (const k of CLASS_KEYS) {
    const names = Array.from(namesByClass[k]).sort((a, b) => a.localeCompare(b, "ko"));
    if (names.length === 0) continue; // class not present in this file
    const questions = qmap[k];
    const students: Student[] = [];
    for (const rawName of names) {
      const { name, id } = splitName(rawName);
      const nk = nameKey(rawName);
      const g = gramByName.get(`${k}::${nk}`);
      const sub = subjByName.get(`${k}::${nk}`) ?? [null, null, null, null, null];
      const subjTotal = sub.every((x) => x == null) ? null : sub.reduce<number>((a, b) => a + (b ?? 0), 0);
      const objScore = g?.obj ?? null;
      const grammarRaw = objScore == null && subjTotal == null ? null : (objScore ?? 0) + (subjTotal ?? 0);
      const grammarFinal = grammarRaw == null ? null : grammarRaw + 30;
      const r = readByName.get(`${k}::${nk}`);
      const v = vocabByName.get(nk) ?? Array.from({ length: 22 }, (_, i) => ({ round: i + 1, score: null, absent: false }));
      const valid = v.filter((x) => x.score != null);
      const vocabAvg = valid.length ? valid.reduce((a, x) => a + (x.score ?? 0), 0) / valid.length : null;

      const objAnswers = g?.ox ?? Array(25).fill(null);
      const hasGrammar = g != null && (g.obj != null || g.ox.some((a) => a != null)) || subjTotal != null;
      const hasReading = r != null && r.final != null;
      const hasVocab = vocabAvg != null;

      students.push({
        className: classLabel(k),
        classKey: k,
        name,
        rawName,
        id,
        objAnswers,
        objScore,
        subjScores: sub,
        subjTotal,
        grammarRaw,
        grammarBase: 30,
        grammarFinal,
        readingCorrect: r?.correct ?? null,
        readingRaw: r?.raw ?? null,
        readingBase: r?.base ?? 30,
        readingFinal: r?.final ?? null,
        vocab: v,
        vocabAvg,
        hasGrammar,
        hasReading,
        hasVocab,
        hasAny: hasGrammar || hasReading || hasVocab,
      });
    }
    const gFinals = students.map((s) => s.grammarFinal).filter((x): x is number => x != null);
    const rFinals = students.map((s) => s.readingFinal).filter((x): x is number => x != null);
    const vAvgs = students.map((s) => s.vocabAvg).filter((x): x is number => x != null);
    classes.push({
      classKey: k,
      sheetName: classLabel(k),
      questions,
      students,
      avgGrammarFinal: gFinals.length ? gFinals.reduce((a, b) => a + b, 0) / gFinals.length : 0,
      avgReadingFinal: rFinals.length ? rFinals.reduce((a, b) => a + b, 0) / rFinals.length : 0,
      avgVocab: vAvgs.length ? vAvgs.reduce((a, b) => a + b, 0) / vAvgs.length : 0,
    });
  }

  return { classes };
}

