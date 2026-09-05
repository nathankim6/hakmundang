import { useMemo, useState, type ReactNode } from "react";
import type { SchoolRecord } from "@/types/school";
import type { IconName } from "@/assets/art";
import type { StickerName } from "@/assets/toon";
import { Icon, Logo, Scene, Sticker } from "@/components/schools/Art";
import { AchievementEmpty, AchievementSection } from "@/components/schools/Achievement";
import { hasAchievementData } from "@/lib/schools/achievement";
import {
  Exam2026Table,
  ExamTrend2026,
  LiveInsights,
  OrunSection,
  SchoolNewsBlock,
  SeniorTmi,
  SourcedBlock,
  SourcedResults,
  type Chapter,
  type HeadProps,
} from "@/components/schools/Sourced";
import { RESULT_BASIS_LABEL } from "@/data/results";
import { BLOCK, COVER, FOOTER, SECTION, TOOLBAR, YEAR } from "@/lib/schools/copy";
import { logoUrl } from "@/lib/schools/logos";
import { detectAnomalies, dropoutRate, genderSplit, headlinePath, pathBreakdown, seatsForGrade1, specialHighDetail } from "@/lib/schools/metrics";

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
  const detailed = records.filter((r) => r.observation || r.sourced);
  const withPaths = mids.filter((r) => r.fact.grad);
  const hasExam = records.some((r) => r.sourced?.exams.length);
  const hasResults = records.some((r) => r.results?.length);
  const hasAchieve = hasAchievementData(records);

  // 실제로 만들어지는 섹션에만 번호를 붙인다. 레일과 본문이 같은 목록을 쓴다.
  const chapters = useMemo(() => {
    const keys: { kind: ChapterKey; label: string; on: boolean }[] = [
      { kind: "numbers", label: SECTION.numbers.ko, on: true },
      { kind: "compare", label: SECTION.compare.ko, on: true },
      { kind: "achieve", label: SECTION.achieve.ko, on: hasAchieve },
      { kind: "exam2026", label: SECTION.exam2026.ko, on: hasExam },
      { kind: "seats", label: SECTION.seats.ko, on: highs.length > 0 },
      { kind: "paths", label: SECTION.paths.ko, on: withPaths.length > 0 },
      { kind: "midEnglish", label: SECTION.midEnglish.ko, on: mids.length > 0 },
      { kind: "results", label: SECTION.results.ko, on: hasResults },
      { kind: "school", label: SECTION.school.ko, on: detailed.length > 0 },
    ];
    const list: ChapterEntry[] = keys.filter((k) => k.on).map((k, i) => ({ kind: k.kind, label: k.label, id: `ch-${k.kind}`, no: String(i + 1).padStart(2, "0") }));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);
  const ch = (kind: ChapterKey): Chapter | undefined => {
    const c = chapters.find((x) => x.kind === kind);
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
                <Logo code={r.fact.code} name={r.fact.name} size="sm" style={{ width: 24, height: 24 }} />
                {short(r.fact.name)}
              </a>
            ))}
          </div>
          {detailed.map((r) => (
            <SchoolDetail key={r.fact.code} record={r} />
          ))}
        </>
      )}

      <BrandFooter />
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

async function toDataUrl(path: string): Promise<string | undefined> {
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
}

function Toolbar({ records, onBack }: { records: SchoolRecord[]; onBack: () => void }) {
  const [state, setState] = useState<"idle" | "working" | "failed">("idle");

  // pptxgenjs는 무거워서 첫 화면 번들에 넣지 않는다. 누를 때만 불러온다.
  const makeDeck = async () => {
    setState("working");
    try {
      const { buildDeck } = await import("@/lib/schools/deck");
      const posters = (await Promise.all(["/orun/2026-1-mid-results.jpg"].map(toDataUrl))).filter((p): p is string => Boolean(p));
      const logos: Record<string, string> = {};
      await Promise.all(
        records.map(async (r) => {
          const url = logoUrl(r.fact.code);
          if (!url) return;
          const d = await toDataUrl(url);
          if (d) logos[r.fact.code] = d;
        }),
      );
      await buildDeck(records, YEAR, { posters, logos });
      setState("idle");
    } catch (e) {
      console.error(e);
      setState("failed");
    }
  };

  const working = state === "working";
  return (
    <div className="orun-no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "22px 0 6px" }}>
      <button className="orun-btn orun-btn--sm" onClick={onBack}>
        <Icon name="arrowLeft" size={14} />
        {TOOLBAR.back}
      </button>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span className="orun-chip orun-chip--lav">{state === "failed" ? TOOLBAR.pptFailed : TOOLBAR.count(records.length)}</span>
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
    <div id={id} className="orun-chapter" style={{ scrollMarginTop: 90 }}>
      <div>
        <div className="orun-chapter__no">{no}</div>
        <div style={{ marginBottom: 10 }}>
          <span className="orun-eyebrow">{en}</span>
        </div>
        <h2 className="orun-h2">{ko}</h2>
        {lede && (
          <p className="orun-lede" style={{ marginTop: 8, fontSize: 14.5 }}>
            {lede}
          </p>
        )}
      </div>
      {art && <Scene name={art} className="orun-chapter__art" />}
    </div>
  );
}

/* ── 표지 ─────────────────────────────── */

function CoverPage({ records, highs, mids }: { records: SchoolRecord[]; highs: number; mids: number }) {
  const onlyMid = mids > 0 && highs === 0;
  const c = onlyMid ? COVER.mid : COVER.high;
  return (
    <section className="orun-page orun-cover">
      <div>
        <div style={{ marginBottom: 22 }}>
          <span className="orun-eyebrow">{COVER.eyebrow}</span>
        </div>
        <h1 className="orun-display" style={{ fontSize: "clamp(32px, 4.6vw, 48px)", marginBottom: 14 }}>
          {c.title[0]}
          <br />
          {c.title[1]}
        </h1>
        <p className="orun-lede" style={{ fontSize: 15.5, maxWidth: "48ch", color: "var(--ink)" }}>
          {c.lede(YEAR)}
        </p>

        <div className="orun-logos" style={{ marginTop: 26 }}>
          {records.map((r) => (
            <span key={r.fact.code} className="orun-logos__item">
              <Logo code={r.fact.code} name={r.fact.name} size="sm" />
              {short(r.fact.name)}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--display)", fontSize: 14, color: "var(--ink)" }}>
          <Sticker name="star" size={22} />
          {COVER.footer}
        </div>
      </div>
      <Scene name="hero" className="orun-cover__art orun-bob" />
    </section>
  );
}

/* ── 한 표로 보는 학교 스펙 ───────────── */

function CompareSection({ records, chapter }: { records: SchoolRecord[]; chapter: Chapter }) {
  const C = SECTION.compare;
  const byLevel = [
    { level: "고" as const, list: records.filter((r) => r.fact.level === "고") },
    { level: "중" as const, list: records.filter((r) => r.fact.level === "중") },
  ].filter((g) => g.list.length > 0);

  return (
    <section style={{ marginBottom: 64 }}>
      <SectionHead {...chapter} en={C.en} ko={C.ko} lede={C.lede} art="compare" />

      {byLevel.map(({ level, list }) => {
        const headLabel = level === "고" ? "4년제" : "특목·자율고";
        return (
          <div key={level} style={{ marginBottom: byLevel.length > 1 ? 30 : 0 }}>
            {byLevel.length > 1 && (
              <span className="orun-chip orun-chip--lav" style={{ marginBottom: 10 }}>
                {level === "고" ? C.subHigh : C.subMid}
              </span>
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
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Logo code={fact.code} name={fact.name} size="sm" style={{ width: 26, height: 26 }} />
                            {short(fact.name)}
                            <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>{fact.coed}</span>
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

      <Callout sticker="bubble" label={C.howTo}>
        <p>{C.howToText}</p>
      </Callout>

      <AnomalyNotice records={records} />
    </section>
  );
}

function AnomalyNotice({ records }: { records: SchoolRecord[] }) {
  const found = useMemo(() => records.map((r) => ({ name: r.fact.name, list: detectAnomalies(r.fact) })).filter((x) => x.list.length > 0), [records]);
  if (!found.length) return null;
  return (
    <Callout tone="warn" sticker="bolt" label={SECTION.compare.anomaly}>
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

      <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
        {records.map(({ fact }) => {
          const n = fact.g1Total ?? 0;
          const seats = seatsForGrade1(n);
          return (
            <div key={fact.code} style={{ padding: "16px 16px 14px", position: "relative" }}>
              <Sticker name="seat" size={34} style={{ position: "absolute", top: -12, right: -8 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Logo code={fact.code} name={fact.name} size="sm" />
                <span style={{ fontFamily: "var(--display)", fontSize: 16, color: "var(--ink)" }}>{short(fact.name)}</span>
              </div>
              <div className="orun-small" style={{ margin: "6px 0 10px" }}>
                {BLOCK.stats.g1} {n || "—"}명
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span className="orun-stat" style={{ fontSize: 40 }}>
                  {seats || "—"}
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{C.unit}</span>
              </div>
              <DotGrid total={n} filled={seats} />
            </div>
          );
        })}
      </div>

      <Callout tone="blue" sticker="bubble" label={C.callout}>
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 12 }} aria-label={`${total}명 중 ${filled}명`}>
      {Array.from({ length: shown }, (_, i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", border: "1px solid var(--ink)", background: i < filledShown ? "var(--yellow-hi)" : "var(--t-soft)" }} />
      ))}
    </div>
  );
}

/* ── 중학교 전용 · 어느 고등학교로 가나 ── */

const PATH_COLOR: Record<string, string> = {
  general: "var(--t-sky)",
  autonomous: "var(--t-lav)",
  special: "var(--t-yellow)",
  vocational: "var(--t-mint)",
  rest: "var(--t-soft)",
};

function NextSchoolSection({ records, chapter }: { records: SchoolRecord[]; chapter: Chapter }) {
  const C = SECTION.paths;
  return (
    <section style={{ marginBottom: 64 }}>
      <SectionHead {...chapter} en={C.en} ko={C.ko} lede={C.lede} art="paths" />

      <div style={{ display: "grid", gap: 14 }}>
        {records.map(({ fact }) => {
          const slices = pathBreakdown(fact);
          const special = specialHighDetail(fact);
          if (!slices) return null;
          return (
            <div key={fact.code} className="orun-card orun-card--flat" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--display)", fontSize: 17, color: "var(--ink)" }}>
                  <Logo code={fact.code} name={fact.name} size="sm" />
                  {short(fact.name)}
                </span>
                <span className="orun-chip">{C.grads(fact.grad!, fact.pathYear ?? "")}</span>
              </div>

              <div style={{ display: "flex", height: 26, border: "2px solid var(--ink)", borderRadius: 13, overflow: "hidden", background: "var(--t-soft)" }}>
                {slices.map((sl, i) => (
                  <div key={sl.key} title={`${sl.label} ${sl.count}명 (${sl.percent.toFixed(1)}%)`} style={{ width: `${sl.percent}%`, background: PATH_COLOR[sl.key] ?? "var(--t-soft)", borderRight: i < slices.length - 1 ? "2px solid var(--ink)" : "none" }} />
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {slices
                  .filter((sl) => sl.count > 0)
                  .map((sl) => (
                    <span key={sl.key} className="orun-chip" style={{ background: PATH_COLOR[sl.key] ?? "var(--t-soft)" }}>
                      {sl.label} {sl.count}명
                      <span style={{ fontWeight: 400 }}>({sl.percent.toFixed(1)}%)</span>
                    </span>
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
      </div>

      <Callout tone="blue" sticker="pin" label={C.callout}>
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
  const onOff = (v: boolean | null) =>
    v == null ? "—" : v ? <span className="orun-chip orun-chip--mint">{C.on}</span> : <span className="orun-chip" style={{ color: "var(--muted)" }}>{C.off}</span>;
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
                <td className="name">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Logo code={fact.code} name={fact.name} size="sm" style={{ width: 26, height: 26 }} />
                    {short(fact.name)}
                  </span>
                </td>
                <td className="num">{fact.g1PerClass?.toFixed(1) ?? "—"}</td>
                <td className="num">{fact.weeklyHours ?? "—"}</td>
                <td>{onOff(fact.leveledClass)}</td>
                <td>{onOff(fact.subjectClassroom)}</td>
                <td className="num">{fact.afterSchoolStudents != null && fact.studentsTotal ? `${Math.round((fact.afterSchoolStudents / fact.studentsTotal) * 100)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout sticker="bubble" label={C.callout}>
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
  const groups = (["enrolled", "schoolTop"] as const)
    .map((basis) => ({ basis, list: all.filter((r) => r.basis === basis) }))
    .filter((g) => g.list.length > 0);

  return (
    <section style={{ marginBottom: 64 }}>
      <SectionHead {...chapter} en={C.en} ko={C.ko} lede={C.lede} art="scoreboard" />

      {groups.map(({ basis, list }) => (
        <div key={basis} style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <span className="orun-h2" style={{ fontSize: 18 }}>
              {RESULT_BASIS_LABEL[basis]}
            </span>
            <span className="orun-chip">{basis === "enrolled" ? C.enrolledSub : C.schoolTopSub}</span>
          </div>

          <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))" }}>
            {list.map((r, i) => (
              <div key={r.schoolCode + r.label} style={{ padding: "16px 18px 14px", position: "relative" }}>
                <Sticker name={i % 2 ? "star" : "medal"} size={34} style={{ position: "absolute", top: -12, right: -8 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Logo code={r.schoolCode} name={r.label} size="sm" />
                  <span style={{ fontFamily: "var(--display)", fontSize: 16, color: "var(--ink)" }}>{r.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>1등급</span>
                  <span className="orun-stat" style={{ fontSize: 38 }}>
                    {r.percent}
                  </span>
                  <span style={{ fontSize: 16, color: "var(--ink)", fontWeight: 700 }}>%</span>
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
    <section id={`school-${fact.code}`} className="orun-page" style={{ marginBottom: 64, scrollMarginTop: 90 }}>
      <div className="orun-card orun-card--paper" style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginBottom: 22, padding: "18px 22px" }}>
        <Logo code={fact.code} name={fact.name} size="lg" />
        <div style={{ flex: "1 1 240px" }}>
          <h2 className="orun-display" style={{ fontSize: 30 }}>
            {fact.name}
          </h2>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {[fact.district, fact.foundation, fact.kind, fact.coed].filter(Boolean).map((t) => (
              <span key={t as string} className="orun-chip">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", marginBottom: 26 }}>
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
          <SourcedBlock {...BLOCK.character} icon="school">
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75 }}>{o.character}</p>
          </SourcedBlock>

          <SourcedBlock {...BLOCK.subjects} icon="bars">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px", marginBottom: 12 }}>
              {(["국어", "영어", "수학", "사회", "과학"] as const).map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, color: "var(--body)", fontWeight: 700 }}>{s}</span>
                  <span className="orun-diff" data-level={o.difficulty[s]}>
                    {o.difficulty[s]}
                  </span>
                </div>
              ))}
            </div>
            {o.difficulty.comment && <p style={{ margin: 0, fontSize: 13.5 }}>{o.difficulty.comment}</p>}
          </SourcedBlock>

          <SourcedBlock {...(isHigh ? BLOCK.scope : BLOCK.scopeMid)} icon="range">
            <div style={{ display: "grid", gap: 8 }}>
              {o.examScope.map((e) => (
                <div key={e.term} className="orun-card orun-card--flat" style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 14, padding: "10px 14px", fontSize: 13.5, alignItems: "center" }}>
                  <span className="orun-chip orun-chip--yellow" style={{ justifySelf: "start" }}>
                    {e.term}
                  </span>
                  <div>{e.scope}</div>
                </div>
              ))}
            </div>
          </SourcedBlock>

          {!isHigh && o.middle && (
            <SourcedBlock {...BLOCK.middleReport} icon="paper">
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
            </SourcedBlock>
          )}

          {isHigh && (
            <SourcedBlock {...BLOCK.cutoff} icon="cut">
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {[
                  { g: 1, v: o.cutoff.grade1, cls: "orun-blob" },
                  { g: 2, v: o.cutoff.grade2, cls: "orun-blob orun-blob--sky" },
                ].map(({ g: gr, v, cls }) => (
                  <div key={gr} className="orun-card orun-card--flat" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px" }}>
                    <span className={cls}>{gr}</span>
                    <div>
                      <div className="orun-small">{gr}등급 커트라인</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span className="orun-stat" style={{ fontSize: 30 }}>
                          {v}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>점</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="orun-small" style={{ margin: "10px 0 0" }}>
                {o.cutoff.basis}
              </p>
            </SourcedBlock>
          )}

          <SourcedBlock {...BLOCK.features} icon="checks">
            <div style={{ display: "grid", gap: 10 }}>
              {o.features.map((f, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 12, alignItems: "start", fontSize: 13.5 }}>
                  <span className={`orun-blob ${["", "orun-blob--sky", "orun-blob--mint", "orun-blob--coral", "orun-blob--lav"][i % 5]}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ paddingTop: 6 }}>{f}</span>
                </div>
              ))}
            </div>
          </SourcedBlock>

          <SourcedBlock {...BLOCK.signature} icon="sparkle">
            <div style={{ display: "grid", gap: 10 }}>
              {o.signatures.map((s, i) => (
                <div key={i} className="orun-card orun-card--flat" style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span className="orun-chip orun-chip--coral">Q{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{s.title}</span>
                    {s.generatorTypeId && <span className="orun-chip orun-chip--blue orun-no-print">{BLOCK.signatureMake}</span>}
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 13.5 }}>{s.note}</p>
                </div>
              ))}
            </div>
          </SourcedBlock>

          <SourcedBlock {...BLOCK.fit} icon="family">
            <div style={{ display: "grid", gap: 8 }}>
              {o.fit.map((f, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 10, fontSize: 14, alignItems: "start" }}>
                  <Sticker name="check" size={18} style={{ marginTop: 3 }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </SourcedBlock>
        </>
      )}

      {sourced && <SourcedResults s={sourced} />}
      {sourced && <LiveInsights s={sourced} />}
      {sourced && <SeniorTmi s={sourced} />}
    </section>
  );
}

function Stat({ icon, label, value, unit, accent }: { icon: IconName; label: string; value: string | number | null | undefined; unit: string; accent?: boolean }) {
  return (
    <div style={{ padding: "12px 14px", background: accent ? "var(--yellow-soft)" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Icon name={icon} size={14} style={{ color: "var(--ink)" }} />
        <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span className="orun-stat" style={{ fontSize: 24 }}>
          {value ?? "—"}
        </span>
        {unit && <span style={{ fontSize: 12, color: "var(--muted)" }}>{unit}</span>}
      </div>
    </div>
  );
}

function Callout({ tone = "paper", sticker = "bubble", label, children }: { tone?: "paper" | "blue" | "warn"; sticker?: StickerName; label: string; children: ReactNode }) {
  const cls = tone === "blue" ? " orun-callout--blue" : tone === "warn" ? " orun-callout--warn" : "";
  return (
    <div className={`orun-callout${cls}`}>
      <Sticker name={sticker} size={24} style={{ marginTop: 0 }} />
      <div>
        <div className="orun-callout__label">{label}</div>
        {children}
      </div>
    </div>
  );
}

function BrandFooter() {
  return (
    <footer style={{ borderTop: "2.5px solid var(--ink)", paddingTop: 18, marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--display)", fontSize: 15, color: "var(--ink)" }}>
        <Sticker name="sun" size={22} />
        {FOOTER.left}
      </span>
      <span className="orun-chip orun-chip--yellow">{FOOTER.tagline}</span>
    </footer>
  );
}
