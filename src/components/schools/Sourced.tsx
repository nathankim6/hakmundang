import type { ReactNode } from "react";
import type { SchoolRecord } from "@/types/school";
import { NEWS_KIND_LABEL, type SchoolNews } from "@/data/news";
import { NEWS_KIND_ICON, NEWS_KIND_ORDER, tmiIcon } from "@/lib/schools/icons";
import { ORUN_MESSAGES, ORUN_RESULTS, type ExamReport, type Source, type SourcedSchool } from "@/data/sourced";
import type { ArtName, IconName } from "@/assets/art";
import { Icon } from "@/components/schools/Art";
import { BLOCK, NUMBERS, SECTION, TAG } from "@/lib/schools/copy";

/**
 * SOURCED 층을 그리는 조각들.
 *
 * 규칙
 *  - 모든 블록 끝에 출처 칩이 붙는다. 출처 없는 문장은 이 파일에서 나오지 않는다.
 *  - 옐로우는 점·숫자에만. 면은 종이색(--paper)만 쓴다. 박스 대신 헤어라인.
 *  - 문구는 copy.ts 에서만 온다.
 */

export interface HeadProps {
  id: string;
  no: string;
  en: string;
  ko: string;
  lede?: string;
  art?: ArtName;
}
export type HeadFn = (p: HeadProps) => ReactNode;
export interface Chapter {
  id: string;
  no: string;
}

const short = (n: string) => n.replace(/(고등학교|중학교)$/, "");

/* ── 출처 칩 ───────────────────────────── */

export function SourceChip({ source, label }: { source: Source; label?: string }) {
  const host = source.url.includes("youtube") ? "유튜브 LIVE" : "옳은영어 블로그";
  const d = source.date.replace(/-/g, ".");
  return (
    <a href={source.url} target="_blank" rel="noreferrer" title={source.title} className="orun-chip orun-chip--dot" style={{ border: 0, padding: 0, textDecoration: "none" }}>
      {label ?? "출처"} · {host} · {d}
    </a>
  );
}

/* ── 블록 머리(출처 자료 태그) ─────────── */

export function SourcedBlock({
  en,
  ko,
  icon,
  children,
  tag = TAG.sourced,
}: {
  en: string;
  ko: string;
  icon?: IconName;
  children: ReactNode;
  tag?: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1.5px solid var(--ink)",
          paddingBottom: 8,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {icon && <Icon name={icon} size={18} style={{ color: "var(--ink)" }} />}
          <span className="orun-eyebrow orun-eyebrow--plain" style={{ fontSize: 9.5, letterSpacing: ".2em" }}>
            {en}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{ko}</span>
        </div>
        <span className="orun-chip orun-chip--ink">{tag}</span>
      </div>
      {children}
    </div>
  );
}

/* ── 올해 시험지 리포트(학교별) ─────────── */

function ExamCard({ e }: { e: ExamReport }) {
  const isMid = e.term.endsWith("중간");
  return (
    <div className="orun-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <span className="orun-mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: isMid ? "var(--blue)" : "var(--yellow)" }}>
          {e.term}
        </span>
        <span className="orun-small">
          {e.grade}학년 · {e.format}
        </span>
      </div>

      {e.cut && (e.cut.grade1 || e.cut.grade2 || e.cut.avg) && (
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-end" }}>
          {e.cut.grade1 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>1등급 컷</div>
              <div className="orun-stat" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15 }}>
                {e.cut.grade1}
              </div>
            </div>
          )}
          {e.cut.grade2 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>2등급 컷</div>
              <div className="orun-stat" style={{ fontSize: 18, fontWeight: 700, color: "var(--body)", lineHeight: 1.2 }}>
                {e.cut.grade2}
              </div>
            </div>
          )}
          {e.cut.avg && (
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>평균</div>
              <div className="orun-stat" style={{ fontSize: 18, fontWeight: 700, color: "var(--body)", lineHeight: 1.2 }}>
                {e.cut.avg}
              </div>
            </div>
          )}
        </div>
      )}

      {e.scope && (
        <div style={{ fontSize: 12.5, color: "var(--body)", display: "flex", gap: 6 }}>
          <Icon name="range" size={14} style={{ color: "var(--muted)", marginTop: 3 }} />
          <span>{e.scope}</span>
        </div>
      )}

      <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500, lineHeight: 1.5 }}>{e.difficulty}</div>

      {e.killers.length > 0 && (
        <div>
          {e.killers.map((k, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "14px 1fr",
                gap: 8,
                padding: "6px 0",
                borderTop: i === 0 ? "1px solid var(--hair)" : "none",
                borderBottom: "1px solid var(--hair)",
                fontSize: 12.5,
                color: "var(--body)",
                lineHeight: 1.5,
              }}
            >
              <span style={{ width: 5, height: 5, background: "var(--yellow-hi)", marginTop: 7 }} />
              <span>{k}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--body)", lineHeight: 1.55, display: "flex", gap: 7 }}>
        <Icon name="quote" size={14} style={{ marginTop: 3, color: "var(--ink)" }} />
        <span>
          {e.verdict}
          {e.teacher && <span className="orun-small"> {e.teacher} T</span>}
        </span>
      </p>

      <div style={{ marginTop: "auto", paddingTop: 4 }}>
        <SourceChip source={e.source} />
      </div>
    </div>
  );
}

export function ExamTrend2026({ s, level }: { s: SourcedSchool; level: "중" | "고" }) {
  if (!s.exams.length) return null;
  const grades = [...new Set(s.exams.map((e) => e.grade))].sort();
  return (
    <SourcedBlock en={BLOCK.exam2026.en} ko={BLOCK.exam2026.ko} tag={BLOCK.exam2026.tag} icon="paper">
      {s.oneLiner && (
        <p style={{ margin: "0 0 14px", fontSize: 15, color: "var(--ink)", fontWeight: 500, lineHeight: 1.5 }}>{s.oneLiner}</p>
      )}
      {grades.map((g) => {
        const list = s.exams.filter((e) => e.grade === g);
        return (
          <div key={g} style={{ marginBottom: 14 }}>
            <div className="orun-eyebrow orun-eyebrow--plain" style={{ fontSize: 10, marginBottom: 8 }}>
              {BLOCK.examGrade(level, g)}
            </div>
            <div className="orun-grid-hair" style={{ gridTemplateColumns: list.length > 1 ? "repeat(auto-fit,minmax(300px,1fr))" : "1fr" }}>
              {list.map((e) => (
                <ExamCard key={e.term + e.grade} e={e} />
              ))}
            </div>
          </div>
        );
      })}
    </SourcedBlock>
  );
}

/* ── 선배들의 TMI ───────────────────────── */


export function SeniorTmi({ s }: { s: SourcedSchool }) {
  if (!s.tmi.length) return null;
  return (
    <SourcedBlock en={BLOCK.tmi.en} ko={BLOCK.tmi.ko} tag={BLOCK.tmi.tag} icon="speech">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "0 28px" }}>
        {s.tmi.map((t, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "20px 1fr",
              gap: 10,
              padding: "9px 0",
              borderBottom: "1px solid var(--hair)",
              fontSize: 13.5,
              color: "var(--body)",
            }}
          >
            <Icon name={tmiIcon(t)} size={17} style={{ color: "var(--ink)", marginTop: 3 }} />
            <span>{t}</span>
          </div>
        ))}
      </div>
      <p className="orun-small" style={{ margin: "10px 0 0" }}>
        {BLOCK.tmiNote}
      </p>
    </SourcedBlock>
  );
}

/* ── 강사진이 짚은 포인트 ───────────────── */

export function LiveInsights({ s }: { s: SourcedSchool }) {
  if (!s.insights.length) return null;
  return (
    <SourcedBlock en={BLOCK.insights.en} ko={BLOCK.insights.ko} tag={BLOCK.insights.tag} icon="mic">
      {s.insights.map((it, i) => (
        <div
          key={i}
          style={{
            padding: "11px 0",
            borderBottom: "1px solid var(--hair)",
            display: "grid",
            gridTemplateColumns: "26px 1fr auto",
            gap: 12,
            alignItems: "baseline",
          }}
        >
          <span className="orun-mono" style={{ fontSize: 11, color: "var(--yellow)" }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--body)", lineHeight: 1.55 }}>{it.text}</span>
          <SourceChip source={it.source} />
        </div>
      ))}
    </SourcedBlock>
  );
}

/* ── 학교별 실적 카드 ───────────────────── */

export function SourcedResults({ s }: { s: SourcedSchool }) {
  if (!s.results.length) return null;
  return (
    <SourcedBlock en={BLOCK.results.en} ko={BLOCK.results.ko} tag={BLOCK.results.tag} icon="trophy">
      <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))" }}>
        {s.results.map((r, i) => (
          <div key={i} style={{ padding: "16px 18px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="orun-small">{r.label}</div>
            <div className="orun-stat" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>
              {r.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.45 }}>{r.basis}</div>
            <div className="orun-small" style={{ fontSize: 11.5 }}>
              {r.term}
            </div>
            <div style={{ marginTop: "auto", paddingTop: 6 }}>
              <SourceChip source={r.source} />
            </div>
          </div>
        ))}
      </div>
    </SourcedBlock>
  );
}

/* ── 전체 비교: 올해 시험지 한눈에 ─────── */

function pick(s: SourcedSchool, term: "중간" | "기말", grade: number) {
  return s.exams.find((e) => e.term.endsWith(term) && e.grade === grade);
}

export function Exam2026Table({ records, chapter, head }: { records: SchoolRecord[]; chapter?: Chapter; head: HeadFn }) {
  const highs = records.filter((r) => r.fact.level === "고" && r.sourced?.exams.length);
  const mids = records.filter((r) => r.fact.level === "중" && r.sourced?.exams.length);
  if ((!highs.length && !mids.length) || !chapter) return null;
  const C = SECTION.exam2026;

  const table = (list: SchoolRecord[], level: "고" | "중", grade: number) => (
    <div style={{ overflowX: "auto", marginBottom: 22 }}>
      <table className="orun-table" style={{ minWidth: 820 }}>
        <thead>
          <tr>
            <th>{C.cols.school}</th>
            <th>{C.cols.mid}</th>
            <th>{C.cols.fin}</th>
            {level === "고" && <th className="num">{C.cols.cut}</th>}
            <th>{C.cols.oneLiner}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => {
            const s = r.sourced!;
            const m = pick(s, "중간", grade);
            const f = pick(s, "기말", grade);
            const cut = f?.cut?.grade1 ?? m?.cut?.grade1;
            const cell = (e?: ExamReport) =>
              e ? (
                <>
                  <div style={{ color: "var(--ink)" }}>{e.format}</div>
                  <div style={{ color: "var(--muted)" }}>{e.difficulty}</div>
                </>
              ) : (
                "—"
              );
            return (
              <tr key={r.fact.code}>
                <td className="name">{short(r.fact.name)}</td>
                <td style={{ fontSize: 12.5, minWidth: 180 }}>{cell(m)}</td>
                <td style={{ fontSize: 12.5, minWidth: 180 }}>{cell(f)}</td>
                {level === "고" && (
                  <td className="num" style={{ color: "var(--ink)", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {cut ?? "—"}
                  </td>
                )}
                <td style={{ fontSize: 12.5, color: "var(--body)", minWidth: 200 }}>{s.oneLiner ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const midGrade = mids.some((r) => pick(r.sourced!, "중간", 3) || pick(r.sourced!, "기말", 3)) ? 3 : 2;

  return (
    <section style={{ marginBottom: 64 }}>
      {head({ ...chapter, en: C.en, ko: C.ko, lede: C.lede, art: "examPaper" })}
      {highs.length > 0 && (
        <>
          <div className="orun-eyebrow orun-eyebrow--plain" style={{ marginBottom: 8 }}>
            {C.subHigh}
          </div>
          {table(highs, "고", 1)}
        </>
      )}
      {mids.length > 0 && (
        <>
          <div className="orun-eyebrow orun-eyebrow--plain" style={{ marginBottom: 8 }}>
            {C.subMid}
          </div>
          {table(mids, "중", midGrade)}
        </>
      )}
      <p className="orun-small" style={{ margin: 0 }}>
        {C.foot}
      </p>
    </section>
  );
}

/* ── 숫자 읽는 법 + 실적 포스터 ────────── */

const POSTER_SRC = ["/orun/2026-1-mid-results.jpg", "/orun/2026-1-final-allA.jpg", "/orun/2026-1-final-honor-high.jpg"];

export function OrunSection({ chapter, head }: { chapter: Chapter; head: HeadFn }) {
  const C = SECTION.numbers;
  return (
    <section style={{ marginBottom: 64 }}>
      {head({ ...chapter, en: C.en, ko: C.ko, lede: C.lede, art: "iceberg" })}

      <div style={{ marginBottom: 26 }}>
        {ORUN_MESSAGES.slice(0, 4).map((m, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "34px 1fr auto",
              gap: 14,
              padding: "12px 0",
              borderBottom: "1px solid var(--hair)",
              alignItems: "baseline",
            }}
          >
            <span className="orun-mono" style={{ fontSize: 12, color: "var(--yellow)", fontWeight: 500 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 14, color: "var(--body)", lineHeight: 1.55 }}>{m.text}</span>
            <SourceChip source={m.source} />
          </div>
        ))}
      </div>

      <div className="orun-eyebrow" style={{ marginBottom: 10 }}>
        {NUMBERS.cards}
      </div>
      <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", marginBottom: 22 }}>
        {ORUN_RESULTS.map((r, i) => (
          <div key={i} style={{ padding: "16px 18px 14px" }}>
            <div className="orun-small">{r.label}</div>
            <div className="orun-stat" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1, margin: "6px 0 4px" }}>
              {r.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--body)" }}>{r.basis}</div>
            <div className="orun-small" style={{ fontSize: 11.5, marginTop: 2 }}>
              {r.term}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
        {POSTER_SRC.map((src, i) => (
          <figure key={src} style={{ margin: 0 }}>
            <div className="orun-card" style={{ padding: 10 }}>
              <img src={src} alt={NUMBERS.posterCaptions[i]} style={{ width: "100%", display: "block", aspectRatio: "966 / 1371", objectFit: "cover" }} loading="lazy" />
            </div>
            <figcaption style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.5, marginTop: 8 }}>
              {NUMBERS.posterCaptions[i]}
              <div style={{ marginTop: 4 }}>
                <SourceChip source={ORUN_RESULTS[0].source} label={NUMBERS.posterSource} />
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="orun-small" style={{ margin: "14px 0 0" }}>
        {NUMBERS.posterNote}
      </p>
    </section>
  );
}

/* ── 학교 밖에서 확인한 것 ──────────────── */


export function SchoolNewsBlock({ n }: { n: SchoolNews }) {
  if (!n.items.length) return null;
  const items = [...n.items].sort((a, b) => NEWS_KIND_ORDER.indexOf(a.kind) - NEWS_KIND_ORDER.indexOf(b.kind));
  return (
    <SourcedBlock en={BLOCK.news.en} ko={BLOCK.news.ko} tag={BLOCK.news.tag} icon="news">
      {n.oneLiner && (
        <p style={{ margin: "0 0 12px", fontSize: 14.5, color: "var(--ink)", fontWeight: 500, lineHeight: 1.5 }}>{n.oneLiner}</p>
      )}
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "104px 1fr",
            gap: 14,
            padding: "11px 0",
            borderBottom: "1px solid var(--hair)",
            alignItems: "start",
          }}
        >
          <span
            className="orun-eyebrow orun-eyebrow--plain"
            style={{
              gap: 6,
              fontSize: 9.5,
              letterSpacing: ".14em",
              paddingTop: 4,
              color: it.kind === "results" ? "var(--yellow)" : it.kind === "curriculum" ? "var(--blue)" : "var(--muted)",
            }}
          >
            <Icon name={NEWS_KIND_ICON[it.kind]} size={14} />
            {NEWS_KIND_LABEL[it.kind]}
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{it.title}</div>
            <div style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.55, marginTop: 3 }}>{it.summary}</div>
            <a
              href={it.source.url}
              target="_blank"
              rel="noreferrer"
              className="orun-chip"
              style={{ border: 0, padding: 0, marginTop: 6, textDecoration: "none" }}
            >
              <span style={{ width: 5, height: 5, background: it.confidence === "high" ? "var(--yellow-hi)" : "var(--hair)" }} />
              {it.source.publisher}
              {it.date ? ` · ${it.date.replace(/-/g, ".")}` : ""}
            </a>
          </div>
        </div>
      ))}
      <p className="orun-small" style={{ margin: "10px 0 0" }}>
        {BLOCK.newsNote(n.homepage, n.fetchedAt)}
      </p>
    </SourcedBlock>
  );
}
