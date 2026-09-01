import { useMemo } from "react";
import type { SchoolRecord } from "@/types/school";
import { RESULT_BASIS_LABEL, RESULT_BASIS_SHORT } from "@/data/results";
import {
  detectAnomalies,
  dropoutRate,
  genderSplit,
  gradeSeats,
  pathMix,
  seatsForGrade1,
} from "@/lib/schools/metrics";

interface Props {
  records: SchoolRecord[];
  onBack: () => void;
}

const YEAR = "2027학년도";

export function AnalysisReport({ records, onBack }: Props) {
  const highs = records.filter((r) => r.fact.level === "고");
  const detailed = records.filter((r) => r.observation);

  return (
    <div className="orun" style={{ background: "transparent" }}>
      <Toolbar count={records.length} onBack={onBack} />

      <CoverPage records={records} />
      <CompareSection records={records} />
      {highs.length > 0 && <SeatsSection records={highs} />}
      <ResultsSection records={records} />

      {detailed.map((r) => (
        <SchoolDetail key={r.fact.code} record={r} />
      ))}

      <SourceFooter />
    </div>
  );
}

/* ───────────────────────────────────────── */

function Toolbar({ count, onBack }: { count: number; onBack: () => void }) {
  return (
    <div
      className="orun-no-print"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        paddingBottom: 16,
        marginBottom: 34,
        borderBottom: "1px solid var(--hair)",
      }}
    >
      <button
        onClick={onBack}
        style={{
          padding: "8px 15px",
          border: "1px solid var(--hair)",
          background: "transparent",
          color: "var(--body)",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        ← 학교 다시 고르기
      </button>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{count}개교 분석지</span>
        <button
          onClick={() => window.print()}
          style={{
            padding: "9px 20px",
            border: "none",
            background: "var(--ink)",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          인쇄 · PDF 저장
        </button>
      </div>
    </div>
  );
}

function SectionHead({
  no,
  en,
  ko,
  lede,
}: {
  no: string;
  en: string;
  ko: string;
  lede?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="orun-eyebrow" style={{ marginBottom: 12 }}>
        {no} {en}
      </div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--ink)",
          margin: 0,
          letterSpacing: "-.015em",
          lineHeight: 1.35,
        }}
      >
        {ko}
      </h2>
      {lede && (
        <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 14.5, maxWidth: "64ch" }}>
          {lede}
        </p>
      )}
    </div>
  );
}

/* ── 표지 ─────────────────────────────── */

function CoverPage({ records }: { records: SchoolRecord[] }) {
  const names = records.map((r) => r.fact.name.replace(/(고등학교|중학교)$/, ""));
  return (
    <section
      className="orun-page"
      style={{
        background: "var(--ink)",
        color: "#fff",
        padding: "56px 44px 48px",
        marginBottom: 56,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 40,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10.5,
          letterSpacing: ".24em",
          textTransform: "uppercase",
          color: "var(--yellow-hi)",
        }}
      >
        <span style={{ width: 7, height: 7, background: "var(--yellow-hi)" }} />
        ORUN ENGLISH · 학교 분석지
      </div>

      <h1
        style={{
          fontSize: 42,
          lineHeight: 1.25,
          fontWeight: 700,
          margin: "0 0 16px",
          letterSpacing: "-.025em",
          textWrap: "balance",
        }}
      >
        고교 선택이
        <br />
        입시의 시작입니다
      </h1>
      <p style={{ color: "#B5B5B5", fontSize: 15.5, maxWidth: "52ch", margin: 0 }}>
        {YEAR} 예비고1을 위한 학교별 내신 분석. 공시자료가 말해 주는 것과, 옳은영어가 직접 본 것을
        나누어 담았습니다.
      </p>

      <div style={{ height: 1, background: "#3A3A3A", margin: "36px 0 22px" }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: "10px 24px",
        }}
      >
        {names.map((n, i) => (
          <div key={n + i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: "var(--yellow-hi)",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 500 }}>{n}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 40,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: "#8A8A8A",
        }}
      >
        옳은영어 ORUN ACADEMY · 정확한 분석, 옳은 방향
      </div>
    </section>
  );
}

/* ── 01 한눈에 비교 ───────────────────── */

function CompareSection({ records }: { records: SchoolRecord[] }) {
  const hasHigh = records.some((r) => r.fact.level === "고");
  return (
    <section style={{ marginBottom: 60 }}>
      <SectionHead
        no="01"
        en="At a glance"
        ko="한눈에 비교"
        lede="학부모님이 가장 먼저 묻는 것들입니다. 전부 공시자료 그대로이며, 저희가 가공하지 않았습니다."
      />
      <div style={{ overflowX: "auto" }}>
        <table className="orun-table" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th>학교</th>
              <th className="num">1학년</th>
              <th className="num">학급</th>
              <th className="num">학급당</th>
              <th className="num">1등급 자리</th>
              {hasHigh && <th className="num">고1 이탈</th>}
              {hasHigh && <th className="num">4년제</th>}
            </tr>
          </thead>
          <tbody>
            {records.map(({ fact }) => {
              const seats = fact.g1Total ? seatsForGrade1(fact.g1Total) : null;
              const drop = dropoutRate(fact);
              const mix = pathMix(fact);
              return (
                <tr key={fact.code}>
                  <td style={{ color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap" }}>
                    {fact.name.replace(/(고등학교|중학교)$/, "")}
                    <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>
                      {" "}
                      {fact.coed}
                    </span>
                  </td>
                  <td className="num">{fact.g1Total ?? "—"}</td>
                  <td className="num">{fact.g1Classes ?? "—"}</td>
                  <td className="num">{fact.g1PerClass?.toFixed(1) ?? "—"}</td>
                  <td className="num" style={{ color: "var(--ink)", fontWeight: 700 }}>
                    {seats ?? "—"}
                  </td>
                  {hasHigh && (
                    <td className="num">{drop != null ? `${drop.toFixed(1)}%` : "—"}</td>
                  )}
                  {hasHigh && (
                    <td className="num">
                      {mix?.uni4 != null ? `${mix.uni4.toFixed(0)}%` : "—"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Callout tone="paper" label="이 표를 읽는 법">
        <p style={{ margin: 0 }}>
          <strong>1등급 자리</strong>는 1학년 인원의 10%입니다(2025학년도 고1부터 5등급제).{" "}
          <strong>고1 이탈</strong>은 1학년 중 전출한 학생 비율로, 학교 적응을 보여주는 신호입니다.{" "}
          <strong>4년제</strong>는 직전 졸업생 기준이라 지금 1학년과는 3년의 시차가 있습니다.
        </p>
      </Callout>

      <AnomalyNotice records={records} />
    </section>
  );
}

function AnomalyNotice({ records }: { records: SchoolRecord[] }) {
  const found = useMemo(
    () =>
      records
        .map((r) => ({ name: r.fact.name, list: detectAnomalies(r.fact) }))
        .filter((x) => x.list.length > 0),
    [records],
  );
  if (!found.length) return null;
  return (
    <Callout tone="warn" label="공시값 확인 필요">
      <p style={{ margin: "0 0 8px" }}>
        아래 항목은 전년 대비 변동이 커서 학교 입력 오류일 가능성이 있습니다. 발표 자료에 그대로
        쓰기 전에 학교알리미 원문을 확인해 주세요.
      </p>
      {found.map((f) => (
        <p key={f.name} style={{ margin: "6px 0 0", fontSize: 13.5 }}>
          <strong>{f.name}</strong> — {f.list.map((a) => `${a.field}: ${a.message}`).join(" / ")}
        </p>
      ))}
    </Callout>
  );
}

/* ── 02 1등급 자리 ────────────────────── */

function SeatsSection({ records }: { records: SchoolRecord[] }) {
  const sample = records.find((r) => r.fact.g1Total);
  return (
    <section style={{ marginBottom: 60 }}>
      <SectionHead
        no="02"
        en="Grade seats"
        ko="1등급은 몇 자리입니까"
        lede="5등급제에서 1등급은 상위 10%입니다. 학교가 크면 자리도 많지만, 경쟁하는 학생도 많습니다."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
          gap: 1,
          background: "var(--hair)",
          border: "1px solid var(--hair)",
        }}
      >
        {records.map(({ fact }) => {
          const n = fact.g1Total ?? 0;
          const seats = seatsForGrade1(n);
          return (
            <div key={fact.code} style={{ background: "var(--ground)", padding: "18px 18px 16px" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
                {fact.name.replace(/고등학교$/, "")}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                1학년 {n || "—"}명
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span
                  className="orun-stat"
                  style={{ fontSize: 34, fontWeight: 700, color: "var(--ink)" }}
                >
                  {seats || "—"}
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>자리</span>
              </div>
              <DotGrid total={n} filled={seats} />
            </div>
          );
        })}
      </div>

      {sample && (
        <Callout tone="blue" label="꼭 아셔야 할 것">
          <p style={{ margin: "0 0 10px" }}>
            <strong>이 숫자는 공통과목에서만 맞습니다.</strong> 석차등급은 학년 정원이 아니라{" "}
            <strong>과목별 수강자 수</strong>를 기준으로 매겨집니다. 2·3학년 선택과목에서 수강자가
            30명이면 1등급은 3명, 15명이면 2명입니다.
          </p>
          <p style={{ margin: 0 }}>
            수강자가 13명 이하면 1등급은 1명뿐이고, 더 적으면 석차등급이 아예 산출되지 않습니다.
            고교학점제에서는 <strong>어떤 과목을 고르느냐가 등급을 바꿉니다.</strong>
          </p>
        </Callout>
      )}
    </section>
  );
}

function DotGrid({ total, filled }: { total: number; filled: number }) {
  if (!total) return null;
  const shown = Math.min(total, 120);
  const scale = total / shown;
  const filledShown = Math.round(filled / scale);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2.5,
        marginTop: 14,
      }}
      aria-label={`${total}명 중 ${filled}명`}
    >
      {Array.from({ length: shown }, (_, i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: i < filledShown ? "var(--ink)" : "var(--hair)",
          }}
        />
      ))}
    </div>
  );
}

/* ── 03 옳은영어 실적 ─────────────────── */

function ResultsSection({ records }: { records: SchoolRecord[] }) {
  const all = records.flatMap((r) => r.results ?? []);
  if (!all.length) return null;

  return (
    <section style={{ marginBottom: 60 }}>
      <SectionHead
        no="03"
        en="Our results"
        ko="옳은영어가 만든 결과"
        lede="2026년 1학기 기말고사 기준입니다. 아래 두 지표는 기준이 다르므로 나누어 표기했습니다."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
          gap: 1,
          background: "var(--hair)",
          border: "1px solid var(--hair)",
        }}
      >
        {all.map((r) => (
          <div
            key={r.schoolCode + r.label}
            style={{ background: "var(--ground)", padding: "20px 20px 18px" }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9.5,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--yellow)",
                marginBottom: 10,
              }}
            >
              {RESULT_BASIS_SHORT[r.basis]}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{r.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>1등급</span>
              <span
                className="orun-stat"
                style={{ fontSize: 32, fontWeight: 700, color: "var(--ink)" }}
              >
                {r.percent}
              </span>
              <span style={{ fontSize: 15, color: "var(--ink)", fontWeight: 700 }}>%</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
              {RESULT_BASIS_LABEL[r.basis]}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 14 }}>
        {all[0].term} · 옳은영어 재원생 자체 집계
      </p>
    </section>
  );
}

/* ── 학교별 상세 ──────────────────────── */

function SchoolDetail({ record }: { record: SchoolRecord }) {
  const { fact, observation: o } = record;
  if (!o) return null;
  const g = genderSplit(fact);
  const seats = fact.g1Total ? seatsForGrade1(fact.g1Total) : null;

  return (
    <section className="orun-page" style={{ marginBottom: 64 }}>
      <div
        style={{
          borderTop: "1.5px solid var(--ink)",
          paddingTop: 20,
          marginBottom: 26,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--ink)",
            margin: 0,
            letterSpacing: "-.02em",
          }}
        >
          {fact.name}
        </h2>
        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
          {[fact.district, fact.foundation, fact.kind, fact.coed].filter(Boolean).join(" · ")}
        </div>
      </div>

      {/* 개요 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 1,
          background: "var(--hair)",
          border: "1px solid var(--hair)",
          marginBottom: 22,
        }}
      >
        <Stat label="1학년" value={fact.g1Total} unit="명" />
        <Stat label="1학년 학급" value={fact.g1Classes} unit="반" />
        <Stat label="학급당" value={fact.g1PerClass?.toFixed(1)} unit="명" />
        <Stat label="1등급 자리" value={seats} unit="명" accent />
        {g && <Stat label="남 · 여" value={`${g.male} : ${g.female}`} unit="" />}
      </div>

      <FieldBlock en="School character" ko="학교 특징" source="obs">
        <p style={{ margin: 0 }}>{o.character}</p>
      </FieldBlock>

      <FieldBlock en="Subject difficulty" ko="과목별 난이도" source="obs">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 26px", marginBottom: 12 }}>
          {(["국어", "영어", "수학", "사회", "과학"] as const).map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13.5, color: "var(--body)" }}>{s}</span>
              <span className="orun-diff" data-level={o.difficulty[s]}>
                {o.difficulty[s]}
              </span>
            </div>
          ))}
        </div>
        {o.difficulty.comment && (
          <p style={{ margin: 0, fontSize: 13.5 }}>{o.difficulty.comment}</p>
        )}
      </FieldBlock>

      <FieldBlock en="English exam scope" ko="영어 시험범위" source="obs">
        {o.examScope.map((e) => (
          <div
            key={e.term}
            style={{
              display: "grid",
              gridTemplateColumns: "96px 1fr",
              gap: 16,
              padding: "9px 0",
              borderBottom: "1px solid var(--hair)",
              fontSize: 13.5,
            }}
          >
            <div style={{ color: "var(--ink)", fontWeight: 700 }}>{e.term}</div>
            <div>{e.scope}</div>
          </div>
        ))}
      </FieldBlock>

      <FieldBlock en="Grade cut-off" ko="영어 등급 커트라인" source="obs">
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-end" }}>
          {[
            { g: 1, v: o.cutoff.grade1 },
            { g: 2, v: o.cutoff.grade2 },
          ].map(({ g: gr, v }) => (
            <div key={gr}>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                {gr}등급 커트라인
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  className="orun-stat"
                  style={{ fontSize: 27, fontWeight: 700, color: "var(--ink)" }}
                >
                  {v}
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>점</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--muted)" }}>
          {o.cutoff.basis} · 옳은영어 재원생 성적표 기반 추정치이며 학교 공식 발표가 아닙니다
        </p>
      </FieldBlock>

      <FieldBlock en="Exam characteristics" ko="시험의 특징" source="obs">
        {o.features.map((f, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr",
              gap: 12,
              padding: "9px 0",
              borderBottom: "1px solid var(--hair)",
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: "var(--yellow)",
                fontWeight: 500,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{f}</span>
          </div>
        ))}
      </FieldBlock>

      <FieldBlock en="Signature questions" ko="이 학교의 시그니처 문항" source="obs">
        {o.signatures.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--hair)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  letterSpacing: ".14em",
                  color: "var(--yellow)",
                }}
              >
                Q{String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>
                {s.title}
              </span>
              {s.generatorTypeId && (
                <span
                  className="orun-no-print"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "var(--blue)",
                    border: "1px solid currentColor",
                    padding: "1px 6px",
                  }}
                >
                  문항 생성 가능
                </span>
              )}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 13.5 }}>{s.note}</p>
          </div>
        ))}
      </FieldBlock>

      <FieldBlock en="Who fits here" ko={`${fact.name.replace(/고등학교$/, "고")}에 맞는 학생`} source="view">
        {o.fit.map((f, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "22px 1fr",
              gap: 10,
              padding: "8px 0",
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "var(--yellow-hi)",
                marginTop: 8,
              }}
            />
            <span>{f}</span>
          </div>
        ))}
      </FieldBlock>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string | number | null | undefined;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div style={{ background: "var(--ground)", padding: "14px 16px" }}>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 5 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span
          className="orun-stat"
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: accent ? "var(--ink)" : "var(--body)",
          }}
        >
          {value ?? "—"}
        </span>
        {unit && <span style={{ fontSize: 12, color: "var(--muted)" }}>{unit}</span>}
      </div>
    </div>
  );
}

function FieldBlock({
  en,
  ko,
  source,
  children,
}: {
  en: string;
  ko: string;
  source: "fact" | "obs" | "view";
  children: React.ReactNode;
}) {
  const tag =
    source === "fact"
      ? { text: "공시자료", color: "var(--blue)" }
      : source === "obs"
        ? { text: "옳은영어 관측", color: "var(--yellow)" }
        : { text: "옳은영어 견해", color: "var(--muted)" };

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
              fontFamily: "'IBM Plex Mono', monospace",
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
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9.5,
            letterSpacing: ".1em",
            color: tag.color,
            border: "1px solid currentColor",
            padding: "1px 6px",
            whiteSpace: "nowrap",
          }}
        >
          {tag.text}
        </span>
      </div>
      {children}
    </div>
  );
}

function Callout({
  tone,
  label,
  children,
}: {
  tone: "paper" | "blue" | "warn";
  label: string;
  children: React.ReactNode;
}) {
  const bg =
    tone === "blue" ? "var(--blue-soft)" : tone === "warn" ? "var(--brick-soft)" : "var(--paper)";
  const bar =
    tone === "blue" ? "var(--blue)" : tone === "warn" ? "var(--brick)" : "var(--yellow-hi)";
  const lc = tone === "blue" ? "var(--blue)" : tone === "warn" ? "var(--brick)" : "var(--muted)";
  return (
    <div
      style={{
        background: bg,
        borderLeft: `2px solid ${bar}`,
        padding: "18px 22px",
        margin: "22px 0",
        fontSize: 13.5,
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9.5,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: lc,
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function SourceFooter() {
  return (
    <footer
      style={{
        borderTop: "1.5px solid var(--ink)",
        paddingTop: 18,
        marginTop: 20,
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        letterSpacing: ".14em",
        textTransform: "uppercase",
        color: "var(--muted)",
      }}
    >
      <span>옳은영어 ORUN ENGLISH</span>
      <span>출처 · 학교알리미 2026년 공시 · 진로현황 2025년 공시 · 2026.09.01 조회</span>
    </footer>
  );
}
