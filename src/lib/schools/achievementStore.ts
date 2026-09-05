import { useSyncExternalStore } from "react";
import { ACHIEVEMENT_SEED } from "@/data/achievement";
import type { AchievementRow, SchoolAchievement } from "@/types/achievement";

/**
 * 학업성취층 저장소. 관측층(store.ts)과 같은 방식으로 브라우저에 쌓는다.
 * 브라우저가 아닌 곳(덱 빌드 스크립트)에서는 메모리에만 둔다.
 */

const KEY = "orun.schools.achievement";
type Store = Record<string, SchoolAchievement>;

let cache: Store | null = null;
let mergedCache: Store | null = null;
const listeners = new Set<() => void>();
const hasLocal = typeof localStorage !== "undefined";

function read(): Store {
  if (!cache) {
    try {
      const raw = hasLocal ? localStorage.getItem(KEY) : null;
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
    if (hasLocal) localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 용량 초과·프라이빗 모드 — 화면은 메모리 값으로 계속 간다 */
  }
  listeners.forEach((l) => l());
}

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

function merged(): Store {
  if (!mergedCache) mergedCache = { ...ACHIEVEMENT_SEED, ...read() };
  return mergedCache;
}

export function getAchievements(): Store {
  return merged();
}
export function getAchievement(code: string): SchoolAchievement | undefined {
  return merged()[code];
}
export function hasAchievement(code: string): boolean {
  return Boolean(merged()[code]?.rows.length);
}
export function useAchievements(): Store {
  return useSyncExternalStore(subscribe, merged, merged);
}

/** 같은 학교·같은 공시연도 자료는 새 파일이 이긴다. 다른 연도는 쌓인다. */
export function addAchievement(code: string, schoolName: string, rows: AchievementRow[], fileName: string) {
  const years = new Set(rows.map((r) => r.year));
  const prev = read()[code];
  const kept = (prev?.rows ?? []).filter((r) => !years.has(r.year));
  const files = [
    ...(prev?.files ?? []).filter((f) => !years.has(f.year)),
    ...[...years].map((year) => ({ name: fileName, year, importedAt: new Date().toISOString(), rows: rows.filter((r) => r.year === year).length })),
  ].sort((a, b) => a.year - b.year);
  write({
    ...read(),
    [code]: { code, schoolName, rows: [...kept, ...rows].sort((a, b) => a.year - b.year || a.grade - b.grade || a.subject.localeCompare(b.subject, "ko")), files },
  });
}

export function removeAchievement(code: string, year?: number) {
  const next = { ...read() };
  if (year == null || !next[code]) {
    delete next[code];
  } else {
    const rows = next[code].rows.filter((r) => r.year !== year);
    const files = next[code].files.filter((f) => f.year !== year);
    if (rows.length) next[code] = { ...next[code], rows, files };
    else delete next[code];
  }
  write(next);
}

/* ── 내보내기 · 불러오기(JSON) ─────────────── */

export interface AchievementBackup {
  format: "orun.achievement";
  version: 1;
  exportedAt: string;
  schools: Store;
}

export function downloadAchievements() {
  const data: AchievementBackup = { format: "orun.achievement", version: 1, exportedAt: new Date().toISOString(), schools: read() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `옳은영어_학업성취_${data.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export type AchievementImportResult = { status: "ok"; count: number } | { status: "error"; reason: string };

export function importAchievementsJson(text: string): AchievementImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { status: "error", reason: "JSON 형식이 아니에요." };
  }
  const data = parsed as Partial<AchievementBackup>;
  if (data?.format !== "orun.achievement" || !data.schools) return { status: "error", reason: "옳은영어 학업성취 파일이 아니에요." };
  const valid: Store = {};
  for (const [code, s] of Object.entries(data.schools)) {
    if (s && Array.isArray(s.rows) && s.rows.length) valid[code] = { code, schoolName: String(s.schoolName ?? ""), rows: s.rows, files: Array.isArray(s.files) ? s.files : [] };
  }
  if (!Object.keys(valid).length) return { status: "error", reason: "불러올 학교가 없어요." };
  write({ ...read(), ...valid });
  return { status: "ok", count: Object.keys(valid).length };
}

export function achievementCount(): number {
  return Object.keys(read()).length;
}
