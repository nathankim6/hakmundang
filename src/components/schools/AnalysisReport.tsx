import { useMemo, useState, type ReactNode } from "react";
import type { SchoolRecord } from "@/types/school";
import type { IconName } from "@/assets/art";
import { Art, Icon } from "@/components/schools/Art";
import {
  Exam2026Table,
  ExamTrend2026,
  LiveInsights,
  OrunSection,
  SchoolNewsBlock,
  SeniorTmi,
  SourcedResults,
  type Chapter,
  type HeadProps,
} from "@/components/schools/Sourced";
import { AchievementEmpty, AchievementSection, hasAchievementData } from "@/components/schools/Achievement";
import { RESULT_BASIS_LABEL } from "@/data/results";
import { BLOCK, COVER, FOOTER, SECTION, TAG, TOOLBAR, YEAR } from "@/lib/schools/copy";
import {
  detectAnomalies,
  dropoutRate,
  genderSplit,
  headlinePath,
  pathBreakdown,
  seatsForGrade1,
  specialHighDetail,
} from "@/lib/schools/metrics";

interface Props {
  records: SchoolRecord[];
  onBack: () => void;
}

const short = (n: string) => n.replace(/(고등학교|중학교)$/, "");

type ChapterKey = "numbers" | "compare" | "achieve" | "exam2026" | "seats" | "paths" | "midEnglish" | "results" | "school";
interface ChapterEntry extends Chapter {
  kind: ChapterKey;
  label: string;
}

export function AnalysisReport({ records, onBack }: Props) {
  const highs = records.filter((r) => r.fact.level === "고");
  const mids = records.filter((r) => r.fact.level === "중");
  // 상세 페이지는 우리가 본 것(관측)이나 출처 자료(2026 분석) 중 하나만 있어도 만든다.
  const detailed = records.filter((r) => r.observation || r.sourced);
  const withPaths = mids.filter((r) => r.fact.grad);
  const hasExam = records.some((r) => r.sourced?.exams.length);
  const hasResults = records.some((r) => r.results?.length);
  const hasAchieve = hasAchievementData(records);

  // 실제로 만들어지는 섹션에만 번호를 붙인다. 레일과 본문이 같은 목록을 쓴다.
  const chapters = useMemo(() => {
    const keys: { key: ChapterKey; label: string; on: boolean }[] = [
      { key: "numbers", label: SECTION.numbers.ko, on: true },
      { key: "compare", label: SECTION.compare.ko, on: true },
      { key: "achieve", label: SECTION.achieve.ko, on: hasAchieve },
      { key: "exam2026", label: SECTION.exam2026.ko, on: hasExam },
      { key: "seats", label: SECTION.seats.ko, on: highs.length > 0 },
      { key: "paths", label: SECTION.paths.ko, on: withPaths.length > 0 },
      { key: "midEnglish", label: SECTION.midEnglish.ko, on: mids.length > 0 },
      { key: "results", label: SECTION.results.ko, on: hasResults },
      { key: "school", label: SECTION.school.ko, on: detailed.length > 0 },
    ];
    const list: ChapterEntry[] = keys
      .filter((k) => k.on)
      .map((k, i) => ({ kind: k.key, label: k.label, id: `ch-${k.key}`, no: String(i + 1).padStart(2, "0") }));
    return list;
    // 목록은 records 에서만 파생된다. 위 불리언들은 전부 records 의 함수다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);
  // 번호만 넘긴다. label/kind 를 같이 흘리면 JSX prop 으로 새어 나간다.
  const ch = (key: ChapterKey): Chapter | undefined => {
    const c = chapters.find((x) => x.kind === key);
    return c ? { id: c.id, no: c.no } : undefined;
  };

  const seen = detailed.filter((r) => r.observation || r.sourced?.exams.length).length;

  return (
    <div className="orun orun-rise" style={{ background: "transparent" }}>
      <Toolbar records={records} onBack={onBack} />

      <CoverPage records={records} highs={highs.length} mids={mids.length} />
      <ChapterRail chapters={chapters} />

      <OrunSection chapter={ch("numbers")!} head={SectionHead} />
      <CompareSection records={records} chapter={ch("compare")!} />
      {ch("achieve") ? <AchievementSection records={records} chapter={ch("achieve")!} head={SectionHead} /> : <AchievementEmpty />}
      <Exam2026Table records={records} chapter={ch("exam2026")} head={SectionHead} />

      {/* 고등학교는 등급이 핵심, 중학교는 어느 고교로 가는가가 핵심 */}
      {ch("seats") && <SeatsSection records={highs} chapter={ch("seats")!} />}
      {ch("paths") && <NextSchoolSection records={withPaths} chapter={ch("paths")!} />}
      {ch("midEnglish") && <MiddleEnglishSection records={mids} chapter={ch("midEnglish")!} />}
      {ch("results") && <ResultsSection records={records} chapter={ch("results")!} />}

      {ch("school") && (
        <>
          <SectionHead
            {...ch("school")!}
            en={SECTION.school.en}
            ko={SECTION.school.ko}
            lede={seen ? SECTION.school.ledeSeen(seen, detailed.length) : SECTION.school.ledeNewsOnly(detailed.length)}
            art="zoom"
          />
          <div className="orun-rail orun-no-print" style={{ marginBottom: 30 }}>
            {detailed.map((r) => (
              <a key={r.fact.code} href={`#school-${r.fact.code}`} className="orun-rail__a" onClick={jump(`school-${r.fact.code}`)}>
                <Icon name="school" size={13} />
                {short(r.fact.name)}
              </a>
            ))}
          </div>
          {detailed.map((r) => (
            <SchoolDetail key={r.fact.code} record={r} />
          ))}
        </>
      )}

      <SourceFooter />
    </div>
  );
}

/* ───────────────────────────────────────── */

function jump(id: string) {
  return (e: React.MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

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
      const posters = (await Promise.all(["/orun/2026-1-mid-results.jpg"].map(toDataUrl))).filter((p): p is string => Boolean(p));
      await buildDeck(records, YEAR, { posters });
      setState("idle");
    } catch (e) {
      console.error(e);
      setState("failed");
    }
  };

  const working = state === "working";
  return (
    <div
      className="orun-no-print"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        padding: "16px 0",
        marginBottom: 28,
        borderBottom: "1px solid var(--hair)",
      }}
    >
      <button className="orun-btn orun-btn--sm" onClick={onBack}>
        <Icon name="arrowLeft" size={14} />
        {TOOLBAR.back}
      </button>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span className="orun-small" style={{ color: state === "failed" ? "var(--brick)" : undefined }}>
          {state === "failed" ? TOOLBAR.pptFailed : TOOLBAR.count(records.length)}
        </span>
        <button className="orun-btn orun-btn--outline" onClick={makeDeck} disabled={working} style={{ cursor: working ? "wait" : undefined }}>
          <Icon name="slides" size={16} />
          {working ? TOOLBAR.pptBusy : TOOLBAR.ppt}
        </button>
        <button className="orun-btn orun-btn--primary" onClick={() => window.print()}>
          <Icon name="print" size={16} />
          {TOOLBAR.print}
        </button>
      </div>
    </div>
  );
}

function ChapterRail({ chapters }: { chapters: ChapterEntry[] }) {
  return (
    <nav className="orun-rail orun-no-print" aria-label="차례">
      {chapters.map((c) => (
        <a key={c.id} href={`#${c.id}`} className="orun-rail__a" onClick={jump(c.id)}>
          <b>{c.no}</b>
          {c.label}
        </a>
      ))}
    </nav>
  );
}

export function SectionHead({ id, no, en, ko, lede, art }: HeadProps) {
  return (
    <div id={id} className="orun-chapter" style={{ scrollMarginTop: 72 }}>
      <div>
        <div className="orun-chapter__no">{no}</div>
        <div className="orun-eyebrow" style={{ marginBottom: 10 }}>
          {en}
        </div>
        <h2 className="orun-h2">{ko}</h2>
        {lede && (
          <p className="orun-lede" style={{ marginTop: 8, fontSize: 14.5 }}>
            {lede}
          </p>
        )}
      </div>
      {art && <Art name={art} className="orun-chapter__art" />}
    </div>
  );
}

/* ── 표지 ─────────────────────────────── */

function CoverPage({ records, highs, mids }: { records: SchoolRecord[]; highs: number; mids: number }) {
  const names = records.map((r) => short(r.fact.name));
  const onlyMid = mids > 0 && highs === 0;
  const c = onlyMid ? COVER.mid : COVER.high;
  return (
    <section className="orun-page orun-dark orun-cover">
      <div>
        <div className="orun-eyebrow" style={{ color: "var(--yellow-hi)", marginBottom: 36 }}>
          {COVER.eyebrow}
        </div>
        <h1 className="orun-display" style={{ fontSize: "clamp(30px, 4.4vw, 46px)", marginBottom: 16 }}>
          {c.title[0]}
          <br />
          {c.title[1]}
        </h1>
        <p className="orun-lede" style={{ fontSize: 15.5, color: "var(--body)", maxWidth: "52ch" }}>
          {c.lede(YEAR)}
        </p>

        <hr className="orun-hair" style={{ margin: "34px 0 22px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "10px 24px" }}>
          {names.map((n, i) => (
            <div key={n + i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <span className="orun-mono" style={{ fontSize: 11, color: "var(--yellow-hi)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>{n}</span>
            </div>
          ))}
        </div>

        <div className="orun-eyebrow orun-eyebrow--plain" style={{ marginTop: 40, fontSize: 10, letterSpacing: ".18em" }}>
          {COVER.footer}
        </div>
      </div>
      <Art name="lighthouseTown" className="orun-cover__art" style={{ color: "var(--ink)" }} />
    </section>
  );
}

/* ── 한 표로 보는 학교 스펙 ───────────── */

function CompareSection({ records, chapter }: { records: SchoolRecord[]; chapter: Chapter }) {
  const C = SECTION.compare;
  // 진로 필드는 학교급마다 의미가 다르다(고: 4년제 / 중: 특성화고).
  // 한 표에 섞으면 다른 뜻의 숫자가 같은 칸에 들어가므로 학교급별로 나눈다.
  const byLevel = [
    { level: "고" as const, list: records.filter((r) => r.fact.level === "고") },
    { level: "중" as const, list: records.filter((r) => r.fact.level === "중") },
  ].filter((g) => g.list.length > 0);

  return (
    <section style={{ marginBottom: 64 }}>
      <SectionHead {...chapter} en={C.en} ko={C.ko} lede={C.lede} art="sideBySide" />

      {byLevel.map(({ level, list }) => {
        const headLabel = level === "고" ? "4년제" : "특목·자율고";
        return (
          <div key={level} style={{ marginBottom: byLevel.length > 1 ? 30 : 0 }}>
            {byLevel.length > 1 && (
              <div className="orun-eyebrow orun-eyebrow--plain" style={{ marginBottom: 8 }}>
                {level === "고" ? C.subHigh : C.subMid}
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
                        <td className="name">
                          {short(fact.name)}
                          <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}> {fact.coed}</span>
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
                            <span title={C.anomaly} style={{ marginLeft: 4 }}>
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

      <Callout icon="info" label={C.howTo}>
        <p>{C.howToText}</p>
      </Callout>

      <AnomalyNotice records={records} />
    </section>
  );
}

function AnomalyNotice({ records }: { records: SchoolRecord[] }) {
  const found = useMemo(
    () => records.map((r) => ({ name: r.fact.name, list: detectAnomalies(r.fact) })).filter((x) => x.list.length > 0),
    [records],
  );
  if (!found.length) return null;
  return (
    <Callout tone="warn" icon="alert" label={SECTION.compare.anomaly}>
      <p>{SECTION.compare.anomalyText}</p>
      {found.map((f) => (
        <p key={f.name} style={{ fontSize: 13 }}>
          <strong>{f.name}</strong> {f.list.map((a) => `${a.field}: ${a.message}`).join(" / ")}
        </p>
      ))}
    </Callout>
  );
}

/* ── 1등급 자리 ───────────────────────── */

function SeatsSection({ records, chapter }: { records: SchoolRecord[]; chapter: Chapter }) {
  const C = SECTION.seats;
  return (
    <section style={{ marginBottom: 64 }}>
      <SectionHead {...chapter} en={C.en} ko={C.ko} lede={C.lede} art="seats" />

      <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))" }}>
        {records.map(({ fact }) => {
          const n = fact.g1Total ?? 0;
          const seats = seatsForGrade1(n);
          return (
            <div key={fact.code} style={{ padding: "18px 18px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="seat" size={16} style={{ color: "var(--ink)" }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{short(fact.name)}</span>
              </div>
              <div className="orun-small" style={{ marginBottom: 12 }}>
                {BLOCK.stats.g1} {n || "—"}명
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span className="orun-stat" style={{ fontSize: 36, fontWeight: 700 }}>
                  {seats || "—"}
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{C.unit}</span>
              </div>
              <DotGrid total={n} filled={seats} />
            </div>
          );
        })}
      </div>

      <Callout tone="blue" icon="divide" label={C.callout}>
        <p>{C.calloutA}</p>
        <p>{C.calloutB}</p>
      </Callout>
    </section>
  );
}

function DotGrid({ total, filled }: { total: number; filled: number }) {
  if (!total) return null;
  const shown = Math.min(total, 120);
  const scale = total / shown;
  const filledShown = Math.round(filled / scale);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 2.5, marginTop: 14 }} aria-label={`${total}명 중 ${filled}명`}>
      {Array.from({ length: shown }, (_, i) => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i < filledShown ? "var(--yellow-hi)" : "var(--hair)" }} />
      ))}
    </div>
  );
}

/* ── 중학교 전용 · 어느 고등학교로 가나 ── */

const PATH_COLOR: Record<string, string> = {
  general: "var(--ink)",
  autonomous: "var(--blue)",
  special: "var(--yellow-hi)",
  vocational: "var(--muted)",
};

function NextSchoolSection({ records, chapter }: { records: SchoolRecord[]; chapter: Chapter }) {
  const C = SECTION.paths;
  return (
    <section style={{ marginBottom: 64 }}>
      <SectionHead {...chapter} en={C.en} ko={C.ko} lede={C.lede} art="pathsMap" />

      {records.map(({ fact }) => {
        const slices = pathBreakdown(fact);
        const special = specialHighDetail(fact);
        if (!slices) return null;
        return (
          <div key={fact.code} style={{ padding: "18px 0", borderBottom: "1px solid var(--hair)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{short(fact.name)}</span>
              <span className="orun-small">{C.grads(fact.grad!, fact.pathYear ?? "")}</span>
            </div>

            {/* 100% 가로 막대 */}
            <div style={{ display: "flex", height: 26, background: "var(--hair)" }}>
              {slices.map((sl) => (
                <div
                  key={sl.key}
                  title={`${sl.label} ${sl.count}명 (${sl.percent.toFixed(1)}%)`}
                  style={{ width: `${sl.percent}%`, background: PATH_COLOR[sl.key] ?? "var(--hair)", transition: "width .4s" }}
                />
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginTop: 10 }}>
              {slices
                .filter((sl) => sl.count > 0)
                .map((sl) => (
                  <div key={sl.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, background: PATH_COLOR[sl.key] ?? "var(--muted)" }} />
                    <span style={{ fontSize: 12.5 }}>
                      {sl.label}{" "}
                      <strong className="orun-stat">{sl.count}</strong>
                      <span style={{ color: "var(--muted)" }}> ({sl.percent.toFixed(1)}%)</span>
                    </span>
                  </div>
                ))}
            </div>

            {special && (
              <div className="orun-small" style={{ marginTop: 10 }}>
                {C.specialDetail} {special.items.map((it) => `${it.label} ${it.count}명`).join(", ")}
              </div>
            )}
          </div>
        );
      })}

      <Callout tone="blue" icon="map" label={C.callout}>
        <p>{C.calloutA}</p>
        <p>{C.calloutB}</p>
      </Callout>
    </section>
  );
}

/* ── 중학교 전용 · 영어 수업 환경 ─────── */

function MiddleEnglishSection({ records, chapter }: { records: SchoolRecord[]; chapter: Chapter }) {
  const C = SECTION.midEnglish;
  const leveled = records.filter((r) => r.fact.leveledClass);
  const onOff = (v: boolean | null, strong = false) =>
    v == null ? "—" : v ? <strong style={{ color: strong ? "var(--blue)" : "var(--ink)" }}>{C.on}</strong> : <span style={{ color: "var(--muted)" }}>{C.off}</span>;
  return (
    <section style={{ marginBottom: 64 }}>
      <SectionHead {...chapter} en={C.en} ko={C.ko} lede={C.lede} art="classroom" />

      <div style={{ overflowX: "auto" }}>
        <table className="orun-table" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th>{C.cols.school}</th>
              <th className="num">{C.cols.perClass}</th>
              <th className="num">{C.cols.weekly}</th>
              <th>{C.cols.leveled}</th>
              <th>{C.cols.subjectRoom}</th>
              <th className="num">{C.cols.after}</th>
            </tr>
          </thead>
          <tbody>
            {records.map(({ fact }) => (
              <tr key={fact.code}>
                <td className="name">{short(fact.name)}</td>
                <td className="num">{fact.g1PerClass?.toFixed(1) ?? "—"}</td>
                <td className="num">{fact.weeklyHours ?? "—"}</td>
                <td>{onOff(fact.leveledClass, true)}</td>
                <td>{onOff(fact.subjectClassroom)}</td>
                <td className="num">
                  {fact.afterSchoolStudents != null && fact.studentsTotal ? `${Math.round((fact.afterSchoolStudents / fact.studentsTotal) * 100)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout icon="abc" label={C.callout}>
        <p>{leveled.length ? C.calloutOn(leveled.map((r) => short(r.fact.name)).join(", ")) : C.calloutOff}</p>
      </Callout>
    </section>
  );
}

/* ── 옳은영어 성적표 ──────────────────── */

function ResultsSection({ records, chapter }: { records: SchoolRecord[]; chapter: Chapter }) {
  const C = SECTION.results;
  const all = records.flatMap((r) => r.results ?? []);
  if (!all.length) return null;

  // 분모가 다른 두 지표를 한 줄에 섞으면 서로 비교하게 된다. 기준별로 나눈다.
  const groups = (["enrolled", "schoolTop"] as const)
    .map((basis) => ({ basis, list: all.filter((r) => r.basis === basis) }))
    .filter((g) => g.list.length > 0);

  return (
    <section style={{ marginBottom: 64 }}>
      <SectionHead {...chapter} en={C.en} ko={C.ko} lede={C.lede} art="podium" />

      {groups.map(({ basis, list }) => (
        <div key={basis} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", borderBottom: "1.5px solid var(--ink)", paddingBottom: 7, marginBottom: 12 }}>
            <span style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{RESULT_BASIS_LABEL[basis]}</span>
            <span className="orun-small">{basis === "enrolled" ? C.enrolledSub : C.schoolTopSub}</span>
          </div>

          <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
            {list.map((r) => (
              <div key={r.schoolCode + r.label} style={{ padding: "18px 20px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="trophy" size={15} style={{ color: "var(--ink)" }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{r.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>1등급</span>
                  <span className="orun-stat" style={{ fontSize: 34, fontWeight: 700 }}>
                    {r.percent}
                  </span>
                  <span style={{ fontSize: 15, color: "var(--ink)", fontWeight: 700 }}>%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="orun-small">
        {all[0].term}, {C.foot}
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
  const S = BLOCK.stats;

  return (
    <section id={`school-${fact.code}`} className="orun-page" style={{ marginBottom: 64, scrollMarginTop: 72 }}>
      <div style={{ borderTop: "1.5px solid var(--ink)", paddingTop: 22, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="school" size={26} style={{ color: "var(--ink)" }} />
          <h2 className="orun-h2" style={{ fontSize: 28 }}>
            {fact.name}
          </h2>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[fact.district, fact.foundation, fact.kind, fact.coed].filter(Boolean).map((t) => (
            <span key={t as string} className="orun-chip">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 개요 */}
      <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", marginBottom: 24 }}>
        <Stat icon="family" label={S.g1} value={fact.g1Total} unit="명" />
        <Stat icon="layers" label={S.classes} value={fact.g1Classes} unit="반" />
        <Stat icon="divide" label={S.perClass} value={fact.g1PerClass?.toFixed(1)} unit="명" />
        {isHigh && <Stat icon="seat" label={S.seats} value={seats} unit="명" accent />}
        {g && <Stat icon="percent" label={S.coed} value={`${g.male} : ${g.female}`} unit="" />}
      </div>

      {sourced?.news && <SchoolNewsBlock n={sourced.news} />}
      {sourced && <ExamTrend2026 s={sourced} level={fact.level} />}

      {o && (
        <>
          <FieldBlock {...BLOCK.character} icon="school" source="obs">
            <p style={{ margin: 0 }}>{o.character}</p>
          </FieldBlock>

          <FieldBlock {...BLOCK.subjects} icon="bars" source="obs">
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
            {o.difficulty.comment && <p style={{ margin: 0, fontSize: 13.5 }}>{o.difficulty.comment}</p>}
          </FieldBlock>

          <FieldBlock {...(isHigh ? BLOCK.scope : BLOCK.scopeMid)} icon="range" source="obs">
            {o.examScope.map((e) => (
              <div key={e.term} style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 16, padding: "9px 0", borderBottom: "1px solid var(--hair)", fontSize: 13.5 }}>
                <div style={{ color: "var(--ink)", fontWeight: 700 }}>{e.term}</div>
                <div>{e.scope}</div>
              </div>
            ))}
          </FieldBlock>

          {!isHigh && o.middle && (
            <FieldBlock {...BLOCK.middleReport} icon="paper" source="obs">
              <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
                <Stat icon="abc" label={S.aRatio} value={o.middle.aRatio || null} unit="" accent />
                <Stat icon="checks" label={S.ratio} value={o.middle.ratio || null} unit="" />
                <Stat icon="book" label={S.textbook} value={o.middle.textbook || null} unit="" />
              </div>
              {o.middle.freeSemester && (
                <p style={{ margin: "12px 0 0", fontSize: 13.5 }}>
                  <strong style={{ color: "var(--ink)" }}>{BLOCK.freeSemester}</strong> {o.middle.freeSemester}
                </p>
              )}
              <p className="orun-small" style={{ margin: "10px 0 0" }}>
                {BLOCK.middleReportNote}
              </p>
            </FieldBlock>
          )}

          {isHigh && (
            <FieldBlock {...BLOCK.cutoff} icon="cut" source="obs">
              <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-end" }}>
                {[
                  { g: 1, v: o.cutoff.grade1 },
                  { g: 2, v: o.cutoff.grade2 },
                ].map(({ g: gr, v }) => (
                  <div key={gr}>
                    <div className="orun-small" style={{ marginBottom: 4 }}>
                      {gr}등급 커트라인
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span className="orun-stat" style={{ fontSize: 28, fontWeight: 700 }}>
                        {v}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>점</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="orun-small" style={{ margin: "12px 0 0" }}>
                {BLOCK.cutoffNote(o.cutoff.basis)}
              </p>
            </FieldBlock>
          )}

          <FieldBlock {...BLOCK.features} icon="checks" source="obs">
            {o.features.map((f, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--hair)", fontSize: 13.5 }}>
                <span className="orun-mono" style={{ fontSize: 11, color: "var(--yellow)", fontWeight: 500 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{f}</span>
              </div>
            ))}
          </FieldBlock>

          <FieldBlock {...BLOCK.signature} icon="sparkle" source="obs">
            {o.signatures.map((s, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--hair)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span className="orun-mono" style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--yellow)" }}>
                    Q{String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{s.title}</span>
                  {s.generatorTypeId && <span className="orun-chip orun-chip--blue orun-no-print">{BLOCK.signatureMake}</span>}
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 13.5 }}>{s.note}</p>
              </div>
            ))}
          </FieldBlock>

          <FieldBlock {...BLOCK.fit} icon="family" source="view">
            {o.fit.map((f, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 10, padding: "8px 0", fontSize: 13.5 }}>
                <span style={{ width: 6, height: 6, background: "var(--yellow-hi)", marginTop: 8 }} />
                <span>{f}</span>
              </div>
            ))}
            <p className="orun-small" style={{ margin: "8px 0 0" }}>
              {BLOCK.fitNote}
            </p>
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
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: IconName;
  label: string;
  value: string | number | null | undefined;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon name={icon} size={13} style={{ color: accent ? "var(--ink)" : "var(--muted)" }} />
        <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span className="orun-stat" style={{ fontSize: 22, fontWeight: 700, color: accent ? "var(--ink)" : "var(--body)" }}>
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
  icon,
  source,
  children,
}: {
  en: string;
  ko: string;
  icon: IconName;
  source: "fact" | "obs" | "view";
  children: ReactNode;
}) {
  const cls = source === "fact" ? "orun-chip--blue" : source === "obs" ? "orun-chip--yellow" : "";
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1.5px solid var(--ink)", paddingBottom: 8, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Icon name={icon} size={18} style={{ color: "var(--ink)" }} />
          <span className="orun-eyebrow orun-eyebrow--plain" style={{ fontSize: 9.5, letterSpacing: ".2em" }}>
            {en}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{ko}</span>
        </div>
        <span className={`orun-chip ${cls}`}>{TAG[source]}</span>
      </div>
      {children}
    </div>
  );
}

function Callout({
  tone = "paper",
  icon = "info",
  label,
  children,
}: {
  tone?: "paper" | "blue" | "warn";
  icon?: IconName;
  label: string;
  children: ReactNode;
}) {
  const cls = tone === "blue" ? " orun-callout--blue" : tone === "warn" ? " orun-callout--warn" : "";
  const color = tone === "blue" ? "var(--blue)" : tone === "warn" ? "var(--brick)" : "var(--ink)";
  return (
    <div className={`orun-callout${cls}`}>
      <Icon name={icon} size={19} style={{ color, marginTop: 1 }} />
      <div>
        <div className="orun-callout__label">{label}</div>
        {children}
      </div>
    </div>
  );
}

function SourceFooter() {
  return (
    <footer
      className="orun-eyebrow orun-eyebrow--plain"
      style={{
        borderTop: "1.5px solid var(--ink)",
        paddingTop: 18,
        marginTop: 20,
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
        fontSize: 10,
        letterSpacing: ".14em",
        lineHeight: 1.7,
      }}
    >
      <span>{FOOTER.left}</span>
      <span style={{ textTransform: "none", maxWidth: "70ch" }}>{FOOTER.sources}</span>
    </footer>
  );
}
