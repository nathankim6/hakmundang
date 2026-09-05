import seed from "@/data/seed.json";
import type { Week, SchoolMeta, Student, AttendanceStatus, DayKey } from "./types";

const STORAGE_KEY = "weekend-clinic-v2";

const DATE_LABELS: Record<number, string> = {
  1: "3월 28일·29일",
  2: "4월 4일·5일",
  3: "4월 11일·12일",
  4: "4월 18일·19일",
};

const DAY_CHARS = ["월", "화", "수", "목", "금", "토", "일"] as const;

function parseDayTime(schoolName: string, rawTime: string): { day: string; time: string } {
  let time = (rawTime || "").trim();
  if (schoolName.includes("토요일")) return { day: "토", time };
  if (schoolName.includes("일요일")) return { day: "일", time };

  // Patterns like "일요일 3시~5시"
  const wm = /^([월화수목금토일])요일\s*(.*)$/.exec(time);
  if (wm) return { day: wm[1], time: wm[2].trim() };

  // Patterns like "월금 수업 끝나고" / "일 2:30~4:30" / "화목 수업이후"
  const dm = /^([월화수목금토일]+)\s+(.*)$/.exec(time);
  if (dm) return { day: dm[1], time: dm[2].trim() };

  // Just chars at start
  let day = "";
  let i = 0;
  while (i < time.length && (DAY_CHARS as readonly string[]).includes(time[i])) {
    day += time[i];
    i++;
  }
  if (day) return { day, time: time.slice(i).trim() };

  return { day: "", time };
}

export function parseStartHour(time: string): number | null {
  const m = /(\d{1,2})\s*(?::\s*(\d{1,2}))?\s*시?/.exec(time);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  if (h >= 1 && h <= 9) h += 12;
  return h;
}

export function buildInitial(): Week[] {
  type SeedShape = Array<{
    week: number;
    header: string;
    schools: Array<{ name: string; range: string; students: Array<{ name: string; time: string }> }>;
  }>;
  return (seed as SeedShape).map((w) => {
    const schoolMap = new Map<string, SchoolMeta>();
    const students: Student[] = [];
    w.schools.forEach((sc, si) => {
      const canonical = normalizeSchoolName(sc.name);
      const existing = schoolMap.get(canonical);
      if (existing) {
        if (sc.range && !existing.range.includes(sc.range)) {
          existing.range = [existing.range, sc.range].filter(Boolean).join("\n");
        }
      } else {
        schoolMap.set(canonical, { name: canonical, range: sc.range || "" });
      }
      sc.students.forEach((st, sti) => {
        const { day, time } = parseDayTime(sc.name, st.time);
        students.push({
          id: `w${w.week}-${si}-${sti}-${st.name}`,
          name: st.name,
          school: canonical,
          day,
          time,
          status: "pending" as AttendanceStatus,
        });
      });
    });
    return { week: w.week, header: w.header, dateLabel: DATE_LABELS[w.week] ?? "", schools: Array.from(schoolMap.values()), students };
  });
}

/** Strip parenthetical day suffix so 흑석고(토요일)/흑석고(일요일) → 흑석고 */
export function normalizeSchoolName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

/** Merge any duplicate school entries created by the old parenthetical scheme. */
function normalizeWeeks(weeks: Week[]): Week[] {
  return weeks.map((w) => {
    const schoolMap = new Map<string, SchoolMeta>();
    for (const s of w.schools) {
      const name = normalizeSchoolName(s.name);
      const existing = schoolMap.get(name);
      if (existing) {
        if (s.range && !existing.range.includes(s.range)) {
          existing.range = [existing.range, s.range].filter(Boolean).join("\n");
        }
      } else {
        schoolMap.set(name, { name, range: s.range || "" });
      }
    }
    const students = w.students.map((st) => ({ ...st, school: normalizeSchoolName(st.school) }));
    return { ...w, schools: Array.from(schoolMap.values()), students };
  });
}

export function loadWeeks(): Week[] {
  if (typeof window === "undefined") return buildInitial();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitial();
    const parsed = JSON.parse(raw) as Week[];
    if (!parsed?.[0]?.students) return buildInitial();
    return normalizeWeeks(parsed);
  } catch {
    return buildInitial();
  }
}

export function saveWeeks(weeks: Week[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
}

export function resetWeeks(): Week[] {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  return buildInitial();
}

/** Clear all students across all weeks (keep schools/ranges). */
export function clearAllStudents(weeks: Week[]): Week[] {
  return weeks.map((w) => ({ ...w, students: [] }));
}

/** Clear all range/과제 text across all weeks. */
export function clearAllRanges(weeks: Week[]): Week[] {
  return weeks.map((w) => ({ ...w, schools: w.schools.map((s) => ({ ...s, range: "" })) }));
}

export type { Week, SchoolMeta, Student, AttendanceStatus, DayKey };