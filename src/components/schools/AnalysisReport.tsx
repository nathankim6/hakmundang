import { useMemo, useState } from "react";
import type { SchoolRecord } from "@/types/school";
import {
  Exam2026Table,
  ExamTrend2026,
  LiveInsights,
  OrunSection,
  SeniorTmi,
  SourcedResults,
} from "@/components/schools/Sourced";
import { RESULT_BASIS_LABEL } from "@/data/results";
import {
  detectAnomalies,
  dropoutRate,
  genderSplit,
  gradeSeats,
  headlinePath,
  pathBreakdown,
  seatsForGrade1,
  specialHighDetail,
} from "@/lib/schools/metrics";

interface Props {
  records: SchoolRecord[];
  onBack: () => void;
}

const YEAR = "2027학년도";

export function AnalysisReport({ records, onBack }: Props) {
  const highs = records.filter((r) => r.fact.level === "고");
  const mids = records.filter((r) => r.fact.level === "중");
  // 상세 페이지는 우리가 본 것(관측)이나 출처 자료(2026 분석) 중 하나만 있어도 만든다.
  const detailed = records.filter((r) => r.observation || r.sourced);
  let no = 0;
  const next = () => String(++no).padStart(2, "0");

  return (
    <div className="orun" style={{ background: "transparent" }}>
      <Toolbar records={records} onBack={onBack} />

      <CoverPage records={records} highs={highs.length} mids={mids.length} />
      <OrunSection no={next()} head={SectionHead} />
      <CompareSection records={records} no={next()} />
      <Exam2026Table records={records} no={next()} head={SectionHead} />

      {/* 고등학교는 등급이 핵심, 중학교는 어느 고교로 가는가가 핵심 */}
      {highs.length > 0 && <SeatsSection records={highs} no={next()} />}
      {mids.length > 0 && <NextSchoolSection records={mids} no={next()} />}
      {mids.length > 0 && <MiddleEnglishSection records={mids} no={next()} />}

      <ResultsSection records={records} no={next()} />

      {detailed.map((r) => (
        <SchoolDetail key={r.fact.code} record={r} />
      ))}

      <SourceFooter />
    </div>
  );
}

/* ───────────────────────────────────────── */

function Toolbar({ records, onBack }: { records: SchoolRecord[]; onBack: () => void }) {
  const [state, setState] = useState<"idle" | "working" | "failed">("idle");

  // pptxgenjs는 무거워서 첫 화면 번들에 넣지 않는다. 누를 때만 불러온다.
  const makeDeck = async () => {
    setState("working");
    try {
      const { buildDeck } = await import("@/lib/schools/deck");
      // 실적 포스터는 public/orun 에 있다. 못 읽어도 덱은 만든다.
      const toDataUrl = async (path: string) => {
        try {
          const blob = await (await fetch(path)).blob();
          return await new Promise<string>((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(String(fr.result));
            fr.onerror = rej;
            fr.readAsDataURL(blob);
          });
        } catch {
          return undefined;
        }
      };
      const posters = (await Promise.all(["/orun/2026-1-mid-results.jpg"].map(toDataUrl))).filter(
        (p): p is string => Boolean(p),
      );
      await buildDeck(records, YEAR, { posters });
      setState("idle");
    } catch (e) {
      console.error(e);
      setState("failed");
    }
  };

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
        ← 학교 다시 담기
      </button>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          {state === "failed" ? "PPT를 못 만들었어요. 다시 눌러 주세요." : `${records.length}곳 분석지`}
        </span>
        <button
          onClick={makeDeck}
          disabled={state === "working"}
          style={{
            padding: "9px 20px",
            border: "1px solid var(--ink)",
            background: "transparent",
            color: "var(--ink)",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: state === "working" ? "wait" : "pointer",
            opacity: state === "working" ? 0.55 : 1,
          }}
        >
          {state === "working" ? "만드는 중…" : "PPT로 뽑기"}
        </button>
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
          인쇄 · PDF
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

function CoverPage({
  records,
  highs,
  mids,
}: {
  records: SchoolRecord[];
  highs: number;
  mids: number;
}) {
  const names = records.map((r) => r.fact.name.replace(/(고등학교|중학교)$/, ""));
  const onlyMid = mids > 0 && highs === 0;
  const title = onlyMid ? ["중학교 3년이", "고교 선택을 만듭니다"] : ["고교 선택이", "입시의 시작입니다"];
  const lede = onlyMid
    ? "2027학년도 예비중1을 위한 학교별 분석. 이 중학교를 나온 학생들이 어느 고등학교로 갔는지부터 봅니다."
    : `${YEAR} 예비고1을 위한 학교별 내신 분석. 공시자료가 말해 주는 것과, 옳은영어가 직접 본 것을 나누어 담았습니다.`;
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
        {title[0]}
        <br />
        {title[1]}
      </h1>
      <p style={{ color: "#B5B5B5", fontSize: 15.5, maxWidth: "52ch", margin: 0 }}>
        {lede}
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

function CompareSection({ records, no }: { records: SchoolRecord[]; no: string }) {
  // 진로 필드는 학교급마다 의미가 다르다(고: 4년제 / 중: 특성화고).
  // 한 표에 섞으면 다른 뜻의 숫자가 같은 칸에 들어가므로 학교급별로 나눈다.
  const byLevel = [
    { level: "고" as const, list: records.filter((r) => r.fact.level === "고") },
    { level: "중" as const, list: records.filter((r) => r.fact.level === "중") },
  ].filter((g) => g.list.length > 0);

  return (
    <section style={{ marginBottom: 60 }}>
      <SectionHead
        no={no}
        en="Side by side"
        ko="나란히 놓고 보기"
        lede="학부모님이 제일 먼저 묻는 것들입니다. 전부 공시 자료 그대로이고, 저희가 손대지 않았습니다."
      />

      {byLevel.map(({ level, list }) => {
        const headLabel = level === "고" ? "4년제" : "특목·자율고";
        return (
          <div key={level} style={{ marginBottom: byLevel.length > 1 ? 30 : 0 }}>
            {byLevel.length > 1 && (
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 8,
                }}
              >
                {level === "고" ? "High school" : "Middle school"} · {level}등학교
              </div>
            )}
            <div style={{ overflowX: "auto" }}>
              <table className="orun-table" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th>학교</th>
                    <th className="num">1학년</th>
                    <th className="num">학급</th>
                    <th className="num">학급당</th>
                    {level === "고" && <th className="num">1등급 자리</th>}
                    <th className="num">{level}1 전출</th>
                    <th className="num">{headLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(({ fact }) => {
                    const seats = fact.g1Total ? seatsForGrade1(fact.g1Total) : null;
                    const drop = dropoutRate(fact);
                    const head = headlinePath(fact);
                    const flagged = detectAnomalies(fact).length > 0;
                    return (
                      <tr key={fact.code}>
                        <td
                          style={{ color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap" }}
                        >
                          {fact.name.replace(/(고등학교|중학교)$/, "")}
                          <span
                            style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}
                          >
                            {" "}
                            {fact.coed}
                          </span>
                        </td>
                        <td className="num">{fact.g1Total ?? "—"}</td>
                        <td className="num">{fact.g1Classes ?? "—"}</td>
                        <td className="num">{fact.g1PerClass?.toFixed(1) ?? "—"}</td>
                        {level === "고" && (
                          <td className="num" style={{ color: "var(--ink)", fontWeight: 700 }}>
                            {seats ?? "—"}
                          </td>
                        )}
                        <td className="num">{drop != null ? `${drop.toFixed(1)}%` : "—"}</td>
                        <td className="num" style={flagged ? { color: "var(--brick)" } : undefined}>
                          {head.value != null ? `${head.value.toFixed(0)}%` : "—"}
                          {flagged && (
                            <span title="공시값 확인 필요" style={{ marginLeft: 4 }}>
                              *
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <Callout tone="paper" label="이 표 읽는 법">
        <p style={{ margin: 0 }}>
          <strong>1등급 자리</strong>는 1학년 인원의 상위 10%이며 소수점은 버립니다. 고등학교에만 있습니다. 중학교는 석차등급 없이 성취도
          A~E만 나옵니다. <strong>전출</strong>은 1학년 중 다른 학교로 옮긴 학생 비율입니다.
          맨 오른쪽 진학 수치는 <strong>직전 졸업생 기준</strong>이라 지금 1학년과는 3년의 시차가
          있습니다. 졸업생이 아직 없는 신설교는 &ldquo;—&rdquo;로 표시됩니다.
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
        표에 <strong style={{ color: "var(--brick)" }}>*</strong> 가 붙은 학교입니다. 전년 대비
        변동이 커서 학교 입력 오류일 가능성이 있으니, 발표 자료에 그대로 쓰기 전에 학교알리미
        원문을 확인해 주세요.
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

function SeatsSection({ records, no }: { records: SchoolRecord[]; no: string }) {
  const sample = records.find((r) => r.fact.g1Total);
  return (
    <section style={{ marginBottom: 60 }}>
      <SectionHead
        no={no}
        en="How many seats"
        ko="1등급, 몇 자리나 있을까"
        lede="5등급제에서 1등급은 상위 10%입니다. 학교가 크면 자리도 많지만 겨루는 사람도 많습니다."
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
            <strong>그 과목을 고른 사람 수</strong>로 매겨집니다. 수강자가 30명이면 1등급은
            3명, 15명이면 1명입니다.
          </p>
          <p style={{ margin: 0 }}>
            상위 10% 이내여야 1등급이므로 <strong>소수점은 버립니다</strong> — 167명이면 16자리,
            170명이면 17자리입니다. 수강자가 10명 미만이면 1등급 자리가 아예 없습니다.
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

/* ── 중학교 전용 · 어느 고등학교로 가나 ── */

function NextSchoolSection({ records, no }: { records: SchoolRecord[]; no: string }) {
  const withPaths = records.filter((r) => r.fact.grad);
  if (!withPaths.length) return null;

  return (
    <section style={{ marginBottom: 60 }}>
      <SectionHead
        no={no}
        en="Where they went"
        ko="이 학교 선배들은 어디로 갔나"
        lede="중학교 선택에서 제일 중요한 숫자입니다. 중학교 성적은 대입에 안 들어가지만, 어느 고등학교로 가느냐는 3년을 바꿉니다."
      />

      {withPaths.map(({ fact }) => {
        const slices = pathBreakdown(fact);
        const special = specialHighDetail(fact);
        if (!slices) return null;
        return (
          <div
            key={fact.code}
            style={{ padding: "18px 0", borderBottom: "1px solid var(--hair)" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>
                {fact.name.replace(/중학교$/, "")}
              </span>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                졸업생 {fact.grad}명 · {fact.pathYear}년 공시
              </span>
            </div>

            {/* 100% 가로 막대 */}
            <div style={{ display: "flex", height: 26, background: "var(--hair)" }}>
              {slices.map((sl, i) => (
                <div
                  key={sl.key}
                  title={`${sl.label} ${sl.count}명 (${sl.percent.toFixed(1)}%)`}
                  style={{
                    width: `${sl.percent}%`,
                    background:
                      sl.key === "general"
                        ? "var(--ink)"
                        : sl.key === "autonomous"
                          ? "var(--blue)"
                          : sl.key === "special"
                            ? "var(--yellow-hi)"
                            : sl.key === "vocational"
                              ? "var(--muted)"
                              : "var(--hair)",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginTop: 10 }}>
              {slices
                .filter((sl) => sl.count > 0)
                .map((sl) => (
                  <div key={sl.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        background:
                          sl.key === "general"
                            ? "var(--ink)"
                            : sl.key === "autonomous"
                              ? "var(--blue)"
                              : sl.key === "special"
                                ? "var(--yellow-hi)"
                                : "var(--muted)",
                      }}
                    />
                    <span style={{ fontSize: 12.5 }}>
                      {sl.label}{" "}
                      <strong className="orun-stat" style={{ color: "var(--ink)" }}>
                        {sl.count}
                      </strong>
                      <span style={{ color: "var(--muted)" }}> ({sl.percent.toFixed(1)}%)</span>
                    </span>
                  </div>
                ))}
            </div>

            {special && (
              <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--muted)" }}>
                특목고 안을 열어보면 —{" "}
                {special.items.map((it) => `${it.label} ${it.count}명`).join(" · ")}
              </div>
            )}
          </div>
        );
      })}

      <Callout tone="blue" label="이 숫자 읽는 법">
        <p style={{ margin: "0 0 10px" }}>
          <strong>서울 중학교는 사는 곳 학교군 안에서 추첨</strong>입니다. 그래서 이건
          &ldquo;좋은 중학교&rdquo; 순위표가 아니라, <strong>우리 동네 아이들이 실제로 어디로
          흘러가는지</strong> 보여주는 지도입니다.
        </p>
        <p style={{ margin: 0 }}>
          특목고 비율이 높다고 그 중학교가 더 좋은 건 아닙니다. 다만 <strong>외고·국제고를
          생각한다면 중2부터</strong>고, 그 출발은 영어입니다.
        </p>
      </Callout>
    </section>
  );
}

/* ── 중학교 전용 · 영어 수업 환경 ─────── */

function MiddleEnglishSection({ records, no }: { records: SchoolRecord[]; no: string }) {
  const leveled = records.filter((r) => r.fact.leveledClass);
  return (
    <section style={{ marginBottom: 60 }}>
      <SectionHead
        no={no}
        en="English class"
        ko="영어 수업, 이렇게 굴러갑니다"
        lede="중학교는 등급이 없어 성취도 A~E만 남습니다. 그래서 '몇 등급이냐'가 아니라 '어떻게 배우느냐'가 남는 정보입니다."
      />

      <div style={{ overflowX: "auto" }}>
        <table className="orun-table" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th>학교</th>
              <th className="num">학급당</th>
              <th className="num">주당 총시수</th>
              <th>수준별 이동수업</th>
              <th>교과교실제</th>
              <th className="num">방과후 참여</th>
            </tr>
          </thead>
          <tbody>
            {records.map(({ fact }) => (
              <tr key={fact.code}>
                <td style={{ color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap" }}>
                  {fact.name.replace(/중학교$/, "")}
                </td>
                <td className="num">{fact.g1PerClass?.toFixed(1) ?? "—"}</td>
                <td className="num">{fact.weeklyHours ?? "—"}</td>
                <td>
                  {fact.leveledClass == null ? (
                    "—"
                  ) : fact.leveledClass ? (
                    <strong style={{ color: "var(--blue)" }}>운영</strong>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>미운영</span>
                  )}
                </td>
                <td>
                  {fact.subjectClassroom == null
                    ? "—"
                    : fact.subjectClassroom
                      ? "운영"
                      : <span style={{ color: "var(--muted)" }}>미운영</span>}
                </td>
                <td className="num">
                  {fact.afterSchoolStudents != null && fact.studentsTotal
                    ? `${Math.round((fact.afterSchoolStudents / fact.studentsTotal) * 100)}%`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout tone="paper" label="수준별 이동수업이 뭔가요">
        <p style={{ margin: 0 }}>
          영어·수학을 실력에 따라 반을 나눠 가르치는 방식입니다.{" "}
          {leveled.length > 0 ? (
            <>
              담으신 학교 중 <strong>{leveled.map((r) => r.fact.name.replace(/중학교$/, "")).join(" · ")}</strong>
              가 운영합니다. 상위반에 들어가려면 <strong>1학년 첫 시험</strong>이 중요합니다 —
              한 번 갈린 반은 잘 안 바뀝니다.
            </>
          ) : (
            "담으신 학교 중엔 운영하는 곳이 없습니다. 전체가 같은 진도로 배웁니다."
          )}
        </p>
      </Callout>
    </section>
  );
}

/* ── 03 옳은영어 실적 ─────────────────── */

function ResultsSection({ records, no }: { records: SchoolRecord[]; no: string }) {
  const all = records.flatMap((r) => r.results ?? []);
  if (!all.length) return null;

  // 분모가 다른 두 지표를 한 줄에 섞으면 서로 비교하게 된다. 기준별로 나눈다.
  const groups = (["enrolled", "schoolTop"] as const)
    .map((basis) => ({ basis, list: all.filter((r) => r.basis === basis) }))
    .filter((g) => g.list.length > 0);

  return (
    <section style={{ marginBottom: 60 }}>
      <SectionHead
        no={no}
        en="We did this"
        ko="우리가 만든 결과"
        lede="2026년 1학기 기말고사 기준입니다. 아래 두 지표는 분모가 서로 달라 나눠 실었습니다. 서로 비교하는 숫자가 아닙니다."
      />

      {groups.map(({ basis, list }) => (
        <div key={basis} style={{ marginBottom: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
              borderBottom: "1.5px solid var(--ink)",
              paddingBottom: 7,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>
              {RESULT_BASIS_LABEL[basis]}
            </span>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
              {basis === "enrolled"
                ? "분모 = 옳은영어 재원생 수"
                : "분모 = 그 학교 전체 1등급 인원"}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
              gap: 1,
              background: "var(--hair)",
              border: "1px solid var(--hair)",
            }}
          >
            {list.map((r) => (
              <div
                key={r.schoolCode + r.label}
                style={{ background: "var(--ground)", padding: "18px 20px 16px" }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                  {r.label}
                </div>
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
              </div>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: 12.5, color: "var(--muted)" }}>
        {all[0].term} · 옳은영어 재원생 자체 집계
      </p>
    </section>
  );
}

/* ── 학교별 상세 ──────────────────────── */

function SchoolDetail({ record }: { record: SchoolRecord }) {
  const { fact, observation: o, sourced } = record;
  if (!o && !sourced) return null;
  const g = genderSplit(fact);
  const isHigh = fact.level === "고";
  const seats = isHigh && fact.g1Total ? seatsForGrade1(fact.g1Total) : null;

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
        {isHigh && <Stat label="1등급 자리" value={seats} unit="명" accent />}
        {g && <Stat label="남 · 여" value={`${g.male} : ${g.female}`} unit="" />}
      </div>

      {sourced && <ExamTrend2026 s={sourced} level={fact.level} />}

      {o && (
        <>
      <FieldBlock en="The school" ko="이런 학교입니다" source="obs">
        <p style={{ margin: 0 }}>{o.character}</p>
      </FieldBlock>

      <FieldBlock en="What's hard" ko="어느 과목이 센가" source="obs">
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

      <FieldBlock
        en="What's on the test"
        ko={isHigh ? "영어 시험, 어디서 나오나" : "영어 시험, 어디서 나오나 · 중3 기준"}
        source="obs"
      >
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

      {!isHigh && o.middle && (
        <FieldBlock en="On the report" ko="성적표에 뭐가 남나" source="obs">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
              gap: 1,
              background: "var(--hair)",
              border: "1px solid var(--hair)",
            }}
          >
            <Stat label="영어 성취도 A" value={o.middle.aRatio || null} unit="" accent />
            <Stat label="지필 : 수행" value={o.middle.ratio || null} unit="" />
            <Stat label="교과서" value={o.middle.textbook || null} unit="" />
          </div>
          {o.middle.freeSemester && (
            <p style={{ margin: "12px 0 0", fontSize: 13.5 }}>
              <strong>지필평가 없는 학기</strong> — {o.middle.freeSemester}
            </p>
          )}
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--muted)" }}>
            우리 학생들 성적표로 잡은 값이고 학교가 발표한 숫자가 아닙니다
          </p>
        </FieldBlock>
      )}

      {isHigh && (
        <FieldBlock en="The cut line" ko="몇 점부터 1등급인가" source="obs">
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
            {o.cutoff.basis} · 우리 학생들 성적표로 잡은 값이고 학교가 발표한 숫자가 아닙니다
          </p>
        </FieldBlock>
      )}

      <FieldBlock en="How they test" ko="이 시험의 성격" source="obs">
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

      <FieldBlock en="Signature" ko="이 학교만 내는 문제" source="obs">
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
                  바로 뽑기
                </span>
              )}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 13.5 }}>{s.note}</p>
          </div>
        ))}
      </FieldBlock>

      <FieldBlock en="Who fits" ko="이런 학생이 잘 맞습니다" source="view">
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
        </>
      )}

      {sourced && <SourcedResults s={sourced} />}
      {sourced && <LiveInsights s={sourced} />}
      {sourced && <SeniorTmi s={sourced} />}
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
      ? { text: "공시 자료", color: "var(--blue)" }
      : source === "obs"
        ? { text: "우리가 본 것", color: "var(--yellow)" }
        : { text: "우리 생각", color: "var(--muted)" };

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
      <span>출처 · 학교알리미 2026년 공시 · 진로현황 2025년 공시 · 옳은영어 블로그 2026년 1학기 분석 · 유튜브 LIVE 2025.11.16</span>
    </footer>
  );
}
