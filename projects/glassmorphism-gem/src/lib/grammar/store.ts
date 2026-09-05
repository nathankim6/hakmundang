import { useSyncExternalStore } from "react";
import type { Exam, Level } from "./types";

export interface Report {
  score: number;
  rows: { q: Exam["qs"][number]; my: unknown; ok: boolean; pts: number }[];
  cat: Record<string, [number, number]>;
  lvl: Record<Level, [number, number]>;
  when: Date;
  cfg: Exam["cfg"];
}

export interface AppState {
  grade: string;
  book: string | null;
  step: 1 | 2;
  mode: "book" | "cat";
  cat: string | null;
  lv: string;
  ty: string;
  showKey: boolean;
  sel: string[];
  open: number[];
  total: number;
  lvN: Record<Level, number>;
  tyN: { mc: number; short: number };
  noDup: boolean;
  title: string;
  exam: Exam | null;
  sheet: Exam | null;
  answers: Record<number, number | string>;
  report: Report | null;
  taker: { org: string; cls: string; name: string; phone4: string; code: string };
  toast: { msg: string; id: number } | null;
}

let state: AppState = {
  grade: "중1",
  book: null,
  step: 1,
  mode: "book",
  cat: null,
  lv: "전체",
  ty: "전체",
  showKey: false,
  sel: [],
  open: [1],
  total: 20,
  lvN: { 상: 5, 중: 8, 하: 7 },
  tyN: { mc: 15, short: 5 },
  noDup: true,
  title: "",
  exam: null,
  sheet: null,
  answers: {},
  report: null,
  taker: { org: "", cls: "", name: "", phone4: "", code: "" },
  toast: null,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  emit();
}

export function getState() {
  return state;
}

export function useApp(): AppState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function toast(msg: string) {
  setState({ toast: { msg, id: Date.now() } });
}

export function setTotal(n: number) {
  n = Math.max(1, Math.min(200, n));
  const a = Math.round(n * 0.25);
  const b = Math.round(n * 0.4);
  const m = Math.round(n * 0.75);
  setState({ total: n, lvN: { 상: a, 중: b, 하: n - a - b }, tyN: { mc: m, short: n - m } });
}

export function toggleSel(id: string) {
  setState((s) => ({
    sel: s.sel.includes(id) ? s.sel.filter((x) => x !== id) : [...s.sel, id],
  }));
}

export function setSel(ids: string[], on: boolean) {
  setState((s) => ({
    sel: on ? Array.from(new Set([...s.sel, ...ids])) : s.sel.filter((x) => !ids.includes(x)),
  }));
}
