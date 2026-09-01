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
const listeners = new Set<() => void>();

function read(): Store {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 용량 초과 등 — 화면 상태는 유지한다 */
  }
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** 코드에 심어 둔 시드 + 사용자가 입력한 것. 입력한 쪽이 이긴다. */
let mergedCache: Store | null = null;
let mergedFrom: Store | null = null;

function merged(): Store {
  const edits = read();
  if (mergedCache && mergedFrom === edits) return mergedCache;
  mergedFrom = edits;
  mergedCache = { ...OBSERVATIONS, ...edits };
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

export function saveObservation(code: string, obs: SchoolObservation) {
  write({ ...read(), [code]: obs });
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

  const incoming = data.observations as Store;
  const valid: Store = {};
  for (const [code, obs] of Object.entries(incoming)) {
    if (obs && typeof obs === "object" && typeof obs.schoolName === "string") {
      valid[code] = obs;
    }
  }
  if (!Object.keys(valid).length) {
    return { status: "error", reason: "불러올 학교가 없습니다." };
  }

  write({ ...read(), ...valid });
  return { status: "ok", count: Object.keys(valid).length };
}

/** 빈 관측 — 새 학교를 입력할 때의 시작점 */
export function emptyObservation(schoolName: string): SchoolObservation {
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
      { term: "1학기 중간", scope: "" },
      { term: "1학기 기말", scope: "" },
    ],
    cutoff: { basis: "영어 / 원점수 기준", grade1: "", grade2: "" },
    features: ["", "", ""],
    signatures: [{ title: "", note: "" }],
    fit: ["", "", "", ""],
  };
}

/** 저장 전에 빈 항목을 걷어낸다 */
export function pruneObservation(o: SchoolObservation): SchoolObservation {
  return {
    ...o,
    examScope: o.examScope.filter((e) => e.term.trim() || e.scope.trim()),
    features: o.features.filter((f) => f.trim()),
    signatures: o.signatures.filter((s) => s.title.trim() || s.note.trim()),
    fit: o.fit.filter((f) => f.trim()),
  };
}

/** 얼마나 채워졌는지 (0~1) — 목록에서 진행도로 보여준다 */
export function completeness(o: SchoolObservation | undefined): number {
  if (!o) return 0;
  const checks = [
    Boolean(o.character.trim()),
    Boolean(o.difficulty.comment?.trim()),
    o.examScope.some((e) => e.scope.trim()),
    Boolean(o.cutoff.grade1.trim()),
    o.features.some((f) => f.trim()),
    o.signatures.some((s) => s.title.trim()),
    o.fit.some((f) => f.trim()),
  ];
  return checks.filter(Boolean).length / checks.length;
}
