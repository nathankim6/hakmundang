import { cn } from "@/lib/utils";
import { ScoreBadge } from "./ScoreBadge";
import { EmptyState } from "./EmptyState";
import { SchoolLogo } from "./SchoolLogo";

import {
  matchRecord,
  DATA,
  statsForExam,
  statsForYearly,
  formatSchoolName,
  formatSchoolGrade,
  type Record2526,
  type RecordYearly,
  type ScoreStats,
} from "@/lib/naesin";

type SortMode = "none" | "desc" | "asc";

interface BrowseTableProps {
  query: string;
  year: "2026" | "2025" | "2024" | "2023";
  period25: string;
  periodYearly: keyof RecordYearly;
  grade: "all" | "1" | "2" | "3";
  school: string; // "all" 또는 정규화된 학교명 (예: "강남중")
  sort: SortMode;
}

const PERIOD_LABEL: Record<string, string> = {
  "1학기중간": "1학기 중간",
  "1학기기말": "1학기 기말",
  "2학기중간": "2학기 중간",
  "2학기기말": "2학기 기말",
};

/** "1", "2", "3" 학년 추출. 매칭 안 되면 null */
function extractGrade(text?: string): "1" | "2" | "3" | null {
  if (!text) return null;
  const m = String(text).match(/([1-3])\s*학년|중\s*([1-3])|중([1-3])/);
  if (!m) return null;
  const g = m[1] || m[2] || m[3];
  return (g as "1" | "2" | "3") || null;
}

function gradeMatches(target: string | undefined, grade: "all" | "1" | "2" | "3"): boolean {
  if (grade === "all") return true;
  return extractGrade(target) === grade;
}

/** 학교명 매칭. school === "all"이면 통과. 학교명을 정규화해 비교 */
function schoolMatches(target: string | undefined, school: string): boolean {
  if (school === "all") return true;
  if (!target) return false;
  const formatted = formatSchoolName(target) || formatSchoolGrade(target).replace(/\s*[1-3]학년\s*$/, "").trim();
  return formatted === school;
}

/** 점수 정렬: 숫자가 아닌(미응시/-)값은 항상 뒤로 보냄 */
function sortByScore<T>(arr: T[], getScore: (r: T) => string | undefined, mode: SortMode): T[] {
  if (mode === "none") return arr;
  const copy = [...arr];
  copy.sort((a, b) => {
    const av = parseInt(String(getScore(a) ?? ""));
    const bv = parseInt(String(getScore(b) ?? ""));
    const aNaN = isNaN(av);
    const bNaN = isNaN(bv);
    if (aNaN && bNaN) return 0;
    if (aNaN) return 1;
    if (bNaN) return -1;
    return mode === "desc" ? bv - av : av - bv;
  });
  return copy;
}


/** 레코드들을 학년별로 그룹화. 학년 미상은 "기타"에 들어갑니다. */
function groupByGrade<T>(rows: T[], getGrade: (r: T) => string | undefined) {
  const groups: Record<"1" | "2" | "3" | "기타", T[]> = { "1": [], "2": [], "3": [], "기타": [] };
  rows.forEach((r) => {
    const g = extractGrade(getGrade(r));
    if (g) groups[g].push(r);
    else groups["기타"].push(r);
  });
  const ordered: { key: "1" | "2" | "3" | "기타"; label: string; list: T[] }[] = [];
  (["1", "2", "3"] as const).forEach((k) => {
    if (groups[k].length) ordered.push({ key: k, label: `${k}학년`, list: groups[k] });
  });
  if (groups["기타"].length) ordered.push({ key: "기타", label: "학년 미상", list: groups["기타"] });
  return ordered;
}

function GradeSection({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/40 border-b border-border/60">
        <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {label}
        </h4>
        <span className="text-[11px] text-muted-foreground font-numeric">{count}명</span>
      </div>
      {children}
    </div>
  );
}

export function BrowseTable({ query, year, period25, periodYearly, grade, school, sort }: BrowseTableProps) {
  if (year === "2026") {
    const stats = statsForExam("26년_1중간");
    const filtered = ((DATA["26년_1중간"] as Record2526[]) || []).filter(
      (r) =>
        matchRecord(r as unknown as Record<string, unknown>, query) &&
        gradeMatches(r.학년, grade) &&
        schoolMatches(r.학교, school),
    );
    const data = sortByScore(filtered, (r) => r.점수, sort);
    const grouped = groupByGrade(data, (r) => r.학년);
    return (
      <Wrapper count={data.length} stats={stats}>
        {data.length === 0 ? (
          <EmptyStateInline query={query} />
        ) : (
          <div className="divide-y divide-border/60">
            {grouped.map((g) => (
              <GradeSection key={g.key} label={g.label} count={g.list.length}>
                <Table headers={["이름", "학교", "학년", "강사", "점수", "시험일"]}>
                  {g.list.map((r, i) => (
                    <Row key={i}>
                      <Td className="font-semibold text-foreground">{r.이름}</Td>
                      <Td><span className="inline-flex items-center gap-2"><SchoolLogo school={r.학교} size="sm" />{formatSchoolName(r.학교)}</span></Td>
                      <Td>{r.학년}</Td>
                      <Td>{r.강사}</Td>
                      <Td><ScoreBadge value={r.점수} /></Td>
                      <Td className="text-xs text-muted-foreground font-numeric">{r.시험일 || ""}</Td>
                    </Row>
                  ))}
                </Table>
              </GradeSection>
            ))}
          </div>
        )}
      </Wrapper>
    );
  }

  if (year === "2025") {
    const stats = statsForExam(period25);
    const filtered = ((DATA[period25] as Record2526[]) || []).filter(
      (r) =>
        matchRecord(r as unknown as Record<string, unknown>, query) &&
        gradeMatches(r.학년, grade) &&
        schoolMatches(r.학교, school),
    );
    const data = sortByScore(filtered, (r) => r.점수, sort);
    const has학년 = data.some((r) => r.학년 && r.학년 !== "-");
    const headers = has학년 ? ["이름", "학교", "학년", "강사", "점수"] : ["이름", "학교", "강사", "점수"];
    const grouped = groupByGrade(data, (r) => r.학년);
    return (
      <Wrapper count={data.length} stats={stats}>
        {data.length === 0 ? (
          <EmptyStateInline query={query} />
        ) : (
          <div className="divide-y divide-border/60">
            {grouped.map((g) => (
              <GradeSection key={g.key} label={g.label} count={g.list.length}>
                <Table headers={headers}>
                  {g.list.map((r, i) => (
                    <Row key={i}>
                      <Td className="font-semibold text-foreground">{r.이름}</Td>
                      <Td><span className="inline-flex items-center gap-2"><SchoolLogo school={r.학교} size="sm" />{formatSchoolName(r.학교)}</span></Td>
                      {has학년 && <Td>{r.학년}</Td>}
                      <Td>{r.강사}</Td>
                      <Td><ScoreBadge value={r.점수} /></Td>
                    </Row>
                  ))}
                </Table>
              </GradeSection>
            ))}
          </div>
        )}
      </Wrapper>
    );
  }

  // 2024 / 2023
  const key = (year === "2024" ? "2024년" : "2023년") as "2024년" | "2023년";
  const stats = statsForYearly(key, periodYearly);
  const all = (DATA[key] as RecordYearly[]) || [];
  const filtered = all.filter((r) => {
    const v = r[periodYearly];
    if (!v || v === "-") return false;
    if (!gradeMatches(r.학교학년, grade)) return false;
    if (!schoolMatches(r.학교학년, school)) return false;
    return matchRecord(r as unknown as Record<string, unknown>, query);
  });
  const data = sortByScore(filtered, (r) => r[periodYearly] as string | undefined, sort);
  const grouped = groupByGrade(data, (r) => r.학교학년);
  return (
    <Wrapper count={data.length} stats={stats}>
      {data.length === 0 ? (
        <EmptyStateInline
          query={query}
          fallback={`${PERIOD_LABEL[periodYearly as string]} 기록이 없습니다`}
        />
      ) : (
        <div className="divide-y divide-border/60">
          {grouped.map((g) => (
            <GradeSection key={g.key} label={g.label} count={g.list.length}>
              <Table headers={["학교/학년", "이름", "점수"]}>
                {g.list.map((r, i) => (
                  <Row key={i}>
                    <Td className="text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><SchoolLogo school={r.학교학년} size="sm" />{formatSchoolGrade(r.학교학년)}</span></Td>
                    <Td className="font-semibold text-foreground">{r.이름}</Td>
                    <Td><ScoreBadge value={r[periodYearly] as string} /></Td>
                  </Row>
                ))}
              </Table>
            </GradeSection>
          ))}
        </div>
      )}
    </Wrapper>
  );
}

function EmptyStateInline({ query, fallback }: { query: string; fallback?: string }) {
  return (
    <div className="p-4">
      <EmptyState
        title={query ? `"${query}"에 대한 결과가 없습니다` : fallback || "기록이 없습니다"}
      />
    </div>
  );
}

function Wrapper({
  count,
  stats,
  children,
}: {
  count: number;
  stats: ScoreStats;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in space-y-4">
      {/* 시험 통계 카드 */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-elegant p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              시험 통계
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              검색 결과 <span className="font-bold font-numeric text-foreground text-base">{count}</span>건
              <span className="opacity-50 mx-2">·</span>
              전체 응시 <span className="font-bold font-numeric text-foreground text-base">{stats.total}</span>명
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <RatioCard
            tone="muted"
            label="응시자"
            big={`${stats.total}`}
            unit="명"
            sub="전체 응시 인원"
          />
          <RatioCard
            tone="perfect"
            label="100점 비율"
            big={`${stats.perfectPct}`}
            unit="%"
            sub={`응시자 ${stats.total}명 중 100점 ${stats.perfect}명`}
          />
          <RatioCard
            tone="high"
            label="90점 이상 비율"
            big={`${stats.highPct}`}
            unit="%"
            sub={`응시자 ${stats.total}명 중 90점 이상 ${stats.high}명`}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 shadow-elegant overflow-hidden">
        <div className="overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}

const ratioToneStyles: Record<string, string> = {
  muted: "bg-secondary/40 border-border/60 text-foreground",
  perfect: "bg-score-perfect-bg border-score-perfect/30 text-score-perfect",
  high: "bg-score-high-bg border-score-high/30 text-score-high",
};

function RatioCard({
  tone,
  label,
  big,
  unit,
  sub,
}: {
  tone: keyof typeof ratioToneStyles;
  label: string;
  big: string;
  unit: string;
  sub: string;
}) {
  return (
    <div className={cn("rounded-2xl border p-4", ratioToneStyles[tone])}>
      <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">
        {label}
      </div>
      <div className="font-numeric mt-1.5 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold leading-none">{big}</span>
        <span className="text-sm font-semibold opacity-70">{unit}</span>
      </div>
      <div className="mt-2 text-[11px] font-medium opacity-75">{sub}</div>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-secondary/60 border-b border-border">
          {headers.map((h) => (
            <th key={h} className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3.5 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-border/40 last:border-0 transition-smooth hover:bg-secondary/40">{children}</tr>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-foreground/80 whitespace-nowrap ${className}`}>{children}</td>;
}
