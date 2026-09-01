import { useSyncExternalStore } from "react";
import { OBSERVATIONS } from "@/data/observations";
import type { SchoolObservation } from "@/types/school";

/**
 * 관측층 저장소.
 *
 * 지금은 브라우저(localStorage)에 저장한다. Supabase에 테이블을 만들려면
 * 서비스 키가 필요한데 이 앱은 anon 키만 갖고 있고, 접근코드 로그인은
 * Supabase 인증이 아니라서 RLS를 걸 사용자 식별자도 없다.
 * anon 키로 열린 테이블은 누구나 쓸 수 있으므로 그대로 두면 안 된다.
 *
 * 그래서 입력은 브라우저에 쌓고, JSON으로 내보내 옮기거나 저장소에 커밋한다.
 * supabase/migrations 에 옮겨 갈 스키마를 준비해 두었다.
 */

const KEY = "orun.schools.observations";

type Store = Record<string, SchoolObservation>;

let cache: Store | null = null;
let mergedCache: Store | null = null;
const listeners = new Set<() => void>();

/** 마지막 쓰기가 실제로 저장되었는지 — 용량 초과·프라이빗 모드 대비 */
let lastWriteFailed = false;
export function didLastWriteFail() {
  return lastWriteFailed;
}

function read(): Store {
  if (!cache) {
    try {
      const raw = localStorage.getItem(KEY);
      cache = raw ? (JSON.parse(raw) as Store) : {};
    } catch {
      cache = {};
    }
  }
  return cache;
}

function write(next: Store) {
  cache = next;
  mergedCache = null;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    lastWriteFailed = false;
  } catch {
    lastWriteFailed = true;
  }
  listeners.forEach((l) => l());
}

/** 다른 탭에서 바뀌면 캐시를 버리고 다시 읽는다. 안 그러면 서로 덮어쓴다. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== null && e.key !== KEY) return;
    cache = null;
    mergedCache = null;
    listeners.forEach((l) => l());
  });
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * 코드에 심어 둔 시드 + 사용자가 입력한 것. 입력한 쪽이 이긴다.
 *
 * 여기서 형태를 한 번 맞춰 둔다. 저장소에 직접 주입되었거나 구버전에서 넘어온
 * 관측에 배열 필드가 없으면, 읽는 쪽마다 방어하지 않는 한 렌더 도중 터진다.
 */
function merged(): Store {
  if (!mergedCache) {
    const out: Store = {};
    for (const [code, obs] of Object.entries({ ...OBSERVATIONS, ...read() })) {
      out[code] = normalize(obs);
    }
    mergedCache = out;
  }
  return mergedCache;
}

export function getObservations(): Store {
  return merged();
}

export function getObservation(code: string): SchoolObservation | undefined {
  return merged()[code];
}

/** 사용자가 직접 입력·수정한 학교인지 (시드와 구분) */
export function isEdited(code: string): boolean {
  return code in read();
}

/** 사용자가 입력한 학교 수 — 시드는 세지 않는다 */
export function editedCount(): number {
  return Object.keys(read()).length;
}

export function saveObservation(code: string, obs: SchoolObservation) {
  write({ ...read(), [code]: normalize(obs) });
}

/** 입력을 지운다. 시드가 있으면 시드 상태로 되돌아간다. */
export function resetObservation(code: string) {
  const next = { ...read() };
  delete next[code];
  write(next);
}

export function useObservations(): Store {
  return useSyncExternalStore(subscribe, merged, merged);
}

/* ── 형태 보정 ───────────────────────────────── */

/**
 * 필드가 빠진 관측이 들어와도 화면이 죽지 않도록 형태를 맞춘다.
 * 손으로 고친 백업 파일이나 구버전 파일에는 배열 필드가 없을 수 있는데,
 * 그대로 두면 렌더 중 .map 에서 터져 설명회 도중 흰 화면이 된다.
 */
export function normalize(o: Partial<SchoolObservation>): SchoolObservation {
  const d = o.difficulty ?? ({} as SchoolObservation["difficulty"]);
  return {
    schoolName: typeof o.schoolName === "string" ? o.schoolName : "",
    character: typeof o.character === "string" ? o.character : "",
    difficulty: {
      국어: d.국어 ?? "보통",
      영어: d.영어 ?? "보통",
      수학: d.수학 ?? "보통",
      사회: d.사회 ?? "보통",
      과학: d.과학 ?? "보통",
      comment: typeof d.comment === "string" ? d.comment : "",
    },
    examScope: Array.isArray(o.examScope)
      ? o.examScope.filter(Boolean).map((e) => ({
          term: String(e?.term ?? ""),
          scope: String(e?.scope ?? ""),
        }))
      : [],
    cutoff: {
      basis: o.cutoff?.basis ?? "영어 / 원점수 기준",
      grade1: o.cutoff?.grade1 ?? "",
      grade2: o.cutoff?.grade2 ?? "",
    },
    ...(o.middle
      ? {
          middle: {
            aRatio: o.middle.aRatio ?? "",
            ratio: o.middle.ratio ?? "",
            freeSemester: o.middle.freeSemester ?? "",
            textbook: o.middle.textbook ?? "",
          },
        }
      : {}),
    features: Array.isArray(o.features) ? o.features.map((f) => String(f ?? "")) : [],
    signatures: Array.isArray(o.signatures)
      ? o.signatures.filter(Boolean).map((s) => ({
          title: String(s?.title ?? ""),
          note: String(s?.note ?? ""),
          ...(s?.generatorTypeId ? { generatorTypeId: s.generatorTypeId } : {}),
          ...(s?.imageUrl ? { imageUrl: s.imageUrl } : {}),
        }))
      : [],
    fit: Array.isArray(o.fit) ? o.fit.map((f) => String(f ?? "")) : [],
  };
}

/* ── 내보내기 · 불러오기 ─────────────────────── */

export interface ObservationBackup {
  format: "orun.observations";
  version: 1;
  exportedAt: string;
  observations: Store;
}

export function exportObservations(): ObservationBackup {
  return {
    format: "orun.observations",
    version: 1,
    exportedAt: new Date().toISOString(),
    observations: read(),
  };
}

export function downloadObservations() {
  const data = exportObservations();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `옳은영어_학교관측_${data.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 이 프로젝트는 strictNullChecks가 꺼져 있어 boolean 리터럴로는
 * 타입 좁히기가 되지 않는다. 문자열 판별자를 쓴다.
 */
export type ImportResult =
  | { status: "ok"; count: number }
  | { status: "error"; reason: string };

/** 불러오기. 기존 입력에 덮어쓴다(같은 학교면 파일 쪽이 이긴다). */
export function importObservations(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { status: "error", reason: "JSON 형식이 아닙니다." };
  }

  const data = parsed as Partial<ObservationBackup>;
  if (data?.format !== "orun.observations" || !data.observations) {
    return { status: "error", reason: "옳은영어 관측 파일이 아닙니다." };
  }

  const incoming = data.observations as Record<string, Partial<SchoolObservation>>;
  const valid: Store = {};
  for (const [code, obs] of Object.entries(incoming)) {
    if (obs && typeof obs === "object" && typeof obs.schoolName === "string") {
      // 형태를 맞춰 저장한다. 필드가 빠진 파일이 화면을 죽이지 않게.
      valid[code] = normalize(obs);
    }
  }
  if (!Object.keys(valid).length) {
    return { status: "error", reason: "불러올 학교가 없습니다." };
  }

  write({ ...read(), ...valid });
  return { status: "ok", count: Object.keys(valid).length };
}

/** 빈 관측 — 새 학교를 입력할 때의 시작점 */
export function emptyObservation(
  schoolName: string,
  level: "중" | "고" = "고",
): SchoolObservation {
  return {
    schoolName,
    character: "",
    difficulty: {
      국어: "보통",
      영어: "보통",
      수학: "보통",
      사회: "보통",
      과학: "보통",
      comment: "",
    },
    examScope: [
      { term: level === "중" ? "3학년 1학기 중간" : "1학기 중간", scope: "" },
      { term: level === "중" ? "3학년 1학기 기말" : "1학기 기말", scope: "" },
    ],
    cutoff: { basis: "영어 / 원점수 기준", grade1: "", grade2: "" },
    ...(level === "중"
      ? { middle: { aRatio: "", ratio: "", freeSemester: "", textbook: "" } }
      : {}),
    features: ["", "", ""],
    signatures: [{ title: "", note: "" }],
    fit: ["", "", "", ""],
  };
}

/**
 * 저장 전에 빈 항목을 걷어낸다.
 * 화면에는 빈 칸을 남겨 두어야 하므로 저장에만 쓰고,
 * 폼을 다시 열 때는 ensureEditable 로 최소 한 줄을 복원한다.
 */
export function pruneObservation(o: SchoolObservation): SchoolObservation {
  return {
    ...o,
    examScope: o.examScope.filter((e) => e.term.trim() || e.scope.trim()),
    features: o.features.filter((f) => f.trim()),
    signatures: o.signatures.filter((s) => s.title.trim() || s.note.trim()),
    fit: o.fit.filter((f) => f.trim()),
  };
}

/** 폼을 열 때 — 비어 있는 반복 항목에 입력 칸 하나는 남겨 둔다 */
export function ensureEditable(o: SchoolObservation): SchoolObservation {
  return {
    ...o,
    examScope: o.examScope.length ? o.examScope : [{ term: "", scope: "" }],
    features: o.features.length ? o.features : [""],
    signatures: o.signatures.length ? o.signatures : [{ title: "", note: "" }],
    fit: o.fit.length ? o.fit : [""],
  };
}

/** 얼마나 채워졌는지 (0~1) — 학교급마다 채울 칸이 다르다 */
export function completeness(o: SchoolObservation | undefined): number {
  if (!o) return 0;
  const checks = [
    Boolean(o.character?.trim()),
    Boolean(o.difficulty?.comment?.trim()),
    (o.examScope ?? []).some((e) => e.scope.trim()),
    (o.features ?? []).some((f) => f.trim()),
    (o.signatures ?? []).some((s) => s.title.trim()),
    (o.fit ?? []).some((f) => f.trim()),
    // 고등학교는 등급 커트라인, 중학교는 성취도 A 비율
    o.middle ? Boolean(o.middle.aRatio.trim()) : Boolean(o.cutoff?.grade1.trim()),
  ];
  return checks.filter(Boolean).length / checks.length;
}
