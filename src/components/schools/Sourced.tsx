import type { ReactNode } from "react";
import type { SchoolRecord } from "@/types/school";
import {
  ORUN_MESSAGES,
  ORUN_RESULTS,
  type ExamReport,
  type Source,
  type SourcedSchool,
} from "@/data/sourced";

/**
 * SOURCED 층을 그리는 조각들.
 *
 * 규칙
 *  - 모든 블록 끝에 출처 칩이 붙는다. 출처 없는 문장은 이 파일에서 나오지 않는다.
 *  - 옐로우는 점·숫자에만. 면은 종이색(--paper)만 쓴다. 박스 대신 헤어라인.
 */

const MONO = "'IBM Plex Mono', monospace";

const short = (n: string) => n.replace(/(고등학교|중학교)$/, "");

/* ── 출처 칩 ───────────────────────────── */

export function SourceChip({ source, label }: { source: Source; label?: string }) {
  const host = source.url.includes("youtube") ? "유튜브 LIVE" : "옳은영어 블로그";
  const d = source.date.replace(/-/g, ".");
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      title={source.title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: "var(--muted)",
        textDecoration: "none",
      }}
    >
      <span style={{ width: 5, height: 5, background: "var(--yellow-hi)" }} />
      {label ?? "출처"} · {host} · {d}
    </a>
  );
}

/* ── 블록 헤더(출처 자료 태그) ─────────── */

export function SourcedBlock({
  en,
  ko,
  children,
  tag = "출처 있는 자료",
}: {
  en: string;
  ko: string;
  children: ReactNode;
  tag?: string;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1.5px solid var(--ink)",
          paddingBottom: 7,
          marginBottom: 13,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 11, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9.5,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            {en}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{ko}</span>
        </div>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9.5,
            letterSpacing: ".1em",
            color: "var(--ink)",
            border: "1px solid currentColor",
            padding: "1px 6px",
            whiteSpace: "nowrap",
          }}
        >
          {tag}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ── 2026년 시험, 이렇게 나왔다 (학교별) ── */

function ExamCard({ e }: { e: ExamReport }) {
  const isMid = e.term.endsWith("중간");
  return (
    <div
      style={{
        background: "var(--paper)",
        padding: "18px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: isMid ? "var(--blue)" : "var(--yellow)",
          }}
        >
          {e.term}
        </span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{e.grade}학년 · {e.format}</span>
      </div>

      {e.cut && (e.cut.grade1 || e.cut.grade2 || e.cut.avg) && (
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-end" }}>
          {e.cut.grade1 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>1등급 컷</div>
              <div className="orun-stat" style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", lineHeight: 1.15 }}>
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
        <div style={{ fontSize: 12.5, color: "var(--body)" }}>
          <span style={{ color: "var(--muted)" }}>범위 </span>
          {e.scope}
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

      <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--body)", lineHeight: 1.55 }}>
        <span style={{ color: "var(--yellow)", fontWeight: 700, marginRight: 6 }}>&ldquo;</span>
        {e.verdict}
        {e.teacher && <span style={{ color: "var(--muted)", fontSize: 12 }}> — {e.teacher} T</span>}
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
    <SourcedBlock en="How 2026 went" ko="2026년 시험, 이렇게 나왔다" tag="2026 1학기 분석">
      {s.oneLiner && (
        <p style={{ margin: "0 0 14px", fontSize: 15, color: "var(--ink)", fontWeight: 500, lineHeight: 1.5 }}>
          {s.oneLiner}
        </p>
      )}
      {grades.map((g) => {
        const list = s.exams.filter((e) => e.grade === g);
        return (
          <div key={g} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--muted)",
                margin: "0 0 8px",
              }}
            >
              {level}{g} · Grade {g}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: list.length > 1 ? "repeat(auto-fit,minmax(300px,1fr))" : "1fr",
                gap: 1,
                background: "var(--hair)",
                border: "1px solid var(--hair)",
              }}
            >
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

/* ── 선배들이 후배에게 ─────────────────── */

export function SeniorTmi({ s }: { s: SourcedSchool }) {
  if (!s.tmi.length) return null;
  return (
    <SourcedBlock en="From the seniors" ko="선배들이 후배에게 — TMI" tag="재원생 선배">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
          gap: "0 28px",
        }}
      >
        {s.tmi.map((t, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "22px 1fr",
              gap: 8,
              padding: "8px 0",
              borderBottom: "1px solid var(--hair)",
              fontSize: 13.5,
              color: "var(--body)",
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: "var(--yellow)", paddingTop: 3 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{t}</span>
          </div>
        ))}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--muted)" }}>
        옳은영어 재원생 선배들이 직접 써 준 답을 설명회에서 소개한 것 · 유튜브 LIVE 2025.11.16
      </p>
    </SourcedBlock>
  );
}

/* ── 설명회에서 한 말 ──────────────────── */

export function LiveInsights({ s }: { s: SourcedSchool }) {
  if (!s.insights.length) return null;
  return (
    <SourcedBlock en="Said on stage" ko="설명회에서 강사들이 한 말" tag="LIVE · 블로그">
      {s.insights.map((it, i) => (
        <div
          key={i}
          style={{
            padding: "11px 0",
            borderBottom: "1px solid var(--hair)",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 14,
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: 13.5, color: "var(--body)", lineHeight: 1.55 }}>{it.text}</span>
          <SourceChip source={it.source} />
        </div>
      ))}
    </SourcedBlock>
  );
}

/* ── 학교별 실적 카드 ──────────────────── */

export function SourcedResults({ s }: { s: SourcedSchool }) {
  if (!s.results.length) return null;
  return (
    <SourcedBlock en="Proof" ko="이 학교에서 옳은영어가 낸 결과" tag="2026 실적">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
          gap: 1,
          background: "var(--hair)",
          border: "1px solid var(--hair)",
        }}
      >
        {s.results.map((r, i) => (
          <div key={i} style={{ background: "var(--ground)", padding: "16px 18px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{r.label}</div>
            <div className="orun-stat" style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1 }}>
              {r.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.45 }}>{r.basis}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.term}</div>
            <div style={{ marginTop: "auto", paddingTop: 6 }}>
              <SourceChip source={r.source} />
            </div>
          </div>
        ))}
      </div>
    </SourcedBlock>
  );
}

/* ── 전체 비교: 2026년 1학기 한눈에 ────── */

function pick(s: SourcedSchool, term: "중간" | "기말", grade: number) {
  return s.exams.find((e) => e.term.endsWith(term) && e.grade === grade);
}

export function Exam2026Table({
  records,
  no,
  head,
}: {
  records: SchoolRecord[];
  no: string;
  head: (p: { no: string; en: string; ko: string; lede?: string }) => ReactNode;
}) {
  const highs = records.filter((r) => r.fact.level === "고" && r.sourced?.exams.length);
  const mids = records.filter((r) => r.fact.level === "중" && r.sourced?.exams.length);
  if (!highs.length && !mids.length) return null;

  const table = (list: SchoolRecord[], level: "고" | "중", grade: number) => (
    <div style={{ overflowX: "auto", marginBottom: 22 }}>
      <table className="orun-table" style={{ minWidth: 820 }}>
        <thead>
          <tr>
            <th>학교</th>
            <th>중간고사</th>
            <th>기말고사</th>
            {level === "고" && <th className="num">1등급 컷</th>}
            <th>한 줄로</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => {
            const s = r.sourced!;
            const m = pick(s, "중간", grade);
            const f = pick(s, "기말", grade);
            const cut = f?.cut?.grade1 ?? m?.cut?.grade1;
            return (
              <tr key={r.fact.code}>
                <td style={{ color: "var(--ink)", fontWeight: 700, whiteSpace: "nowrap" }}>{short(r.fact.name)}</td>
                <td style={{ fontSize: 12.5, minWidth: 180 }}>
                  {m ? (
                    <>
                      <div style={{ color: "var(--ink)" }}>{m.format}</div>
                      <div style={{ color: "var(--muted)" }}>{m.difficulty}</div>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ fontSize: 12.5, minWidth: 180 }}>
                  {f ? (
                    <>
                      <div style={{ color: "var(--ink)" }}>{f.format}</div>
                      <div style={{ color: "var(--muted)" }}>{f.difficulty}</div>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
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

  return (
    <section style={{ marginBottom: 60 }}>
      {head({
        no,
        en: "The 2026 tests",
        ko: "2026년 1학기, 시험은 이렇게 나왔다",
        lede:
          "옳은영어 강사진이 실제 시험지를 놓고 쓴 학교별 상세 분석입니다. 컷은 학교가 발표한 값이 아니라 우리 학생들 성적표와 강사 추정으로 잡은 값입니다.",
      })}
      {highs.length > 0 && (
        <>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
            High school · 고1 기준
          </div>
          {table(highs, "고", 1)}
        </>
      )}
      {mids.length > 0 && (
        <>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
            Middle school · 중3 기준 (없으면 중2)
          </div>
          {table(
            mids.map((r) => r),
            "중",
            mids.some((r) => pick(r.sourced!, "중간", 3) || pick(r.sourced!, "기말", 3)) ? 3 : 2,
          )}
        </>
      )}
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>
        학교별 상세는 아래 학교 페이지에 중간·기말 카드로 실었습니다 · 출처는 카드마다 붙어 있습니다
      </p>
    </section>
  );
}

/* ── 숫자의 이면 + 실적 포스터 ─────────── */

const POSTERS: { src: string; caption: string; source: Source }[] = [
  {
    src: "/orun/2026-1-mid-results.jpg",
    caption: "2026 1학기 중간고사 결과 — 흑석고1 학교 1등급의 35%, 수도여고1 재원생 30%, 영등포고1 40%, 숭의여고1 33%",
    source: ORUN_RESULTS[0].source,
  },
  {
    src: "/orun/2026-1-final-allA.jpg",
    caption: "2026 1학기 기말고사 전 과목 1등급 — 흑석고1 3명, 영등포고1 1명",
    source: ORUN_RESULTS[0].source,
  },
  {
    src: "/orun/2026-1-final-honor-high.jpg",
    caption: "2026 1학기 기말고사 고등부 성적 우수자 — 90점 이상 및 1등급",
    source: ORUN_RESULTS[0].source,
  },
];

export function OrunSection({
  no,
  head,
}: {
  no: string;
  head: (p: { no: string; en: string; ko: string; lede?: string }) => ReactNode;
}) {
  return (
    <section style={{ marginBottom: 60 }}>
      {head({
        no,
        en: "Read the numbers",
        ko: "'1등급 몇 명'보다 먼저 보셔야 할 것",
        lede: "설명회를 이 얘기로 엽니다. 숫자는 정확해 보이지만, 어떤 분모 위에 올려놓았는지에 따라 뜻이 달라집니다.",
      })}

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
            <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--yellow)", fontWeight: 500 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 14, color: "var(--body)", lineHeight: 1.55 }}>{m.text}</span>
            <SourceChip source={m.source} />
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 1,
          background: "var(--hair)",
          border: "1px solid var(--hair)",
          marginBottom: 22,
        }}
      >
        {ORUN_RESULTS.map((r, i) => (
          <div key={i} style={{ background: "var(--ground)", padding: "16px 18px 14px" }}>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{r.label}</div>
            <div className="orun-stat" style={{ fontSize: 30, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, margin: "6px 0 4px" }}>
              {r.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--body)" }}>{r.basis}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{r.term}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 18,
        }}
      >
        {POSTERS.map((p) => (
          <figure key={p.src} style={{ margin: 0 }}>
            <div style={{ background: "var(--paper)", padding: 10 }}>
              <img
                src={p.src}
                alt={p.caption}
                style={{ width: "100%", display: "block", aspectRatio: "966 / 1371", objectFit: "cover" }}
                loading="lazy"
              />
            </div>
            <figcaption style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.5, marginTop: 8 }}>
              {p.caption}
              <div style={{ marginTop: 4 }}>
                <SourceChip source={p.source} label="포스터 원문" />
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "14px 0 0" }}>
        포스터의 이름은 원문대로 가려져 있습니다 · 옳은영어 블로그에 공개된 자료를 그대로 옮겼습니다
      </p>
    </section>
  );
}
