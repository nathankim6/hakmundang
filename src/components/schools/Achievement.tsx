import type { SchoolRecord } from "@/types/school";
import type { SchoolAchievement } from "@/types/achievement";
import { SECTION, TAG } from "@/lib/schools/copy";
import { LETTERS, SUBJECTS3, fix, pct, profileOf, type AchievementProfile, type Subject3, type SubjectPoint } from "@/lib/schools/achievement";
import { profileText, repPoint } from "@/lib/schools/achievementText";
import { Art, Icon } from "@/components/schools/Art";
import type { Chapter, HeadFn } from "@/components/schools/Sourced";

/**
 * 국영수 성취도 3개년 — 학교알리미 공시(FACT) 위에 우리 해석(VIEW)을 얹는다.
 * 숫자는 공시 그대로, 판정 문장은 '우리 생각' 태그를 단다.
 */

const short = (n: string) => n.replace(/(고등학교|중학교)$/, "");
const SEG_COLOR = ["var(--ink)", "var(--muted)", "color-mix(in srgb, var(--muted) 40%, var(--hair))", "var(--hair)", "var(--shade)"];

export function AchievementSection({ records, chapter, head }: { records: SchoolRecord[]; chapter: Chapter; head: HeadFn }) {
  const C = SECTION.achieve;
  const groups = (["고", "중"] as const)
    .map((level) => ({ level, list: records.filter((r) => r.fact.level === level) }))
    .filter((g) => g.list.length);
  return (
    <section style={{ marginBottom: 64 }}>
      {head({ ...chapter, en: C.en, ko: C.ko, lede: groups.every((g) => g.level === "중") ? C.ledeMid : C.lede, art: "fraction" })}
      {groups.map(({ level, list }) => (
        <LevelBlock key={level} level={level} list={list} />
      ))}
    </section>
  );
}

/** 자료가 하나도 없을 때 — 번호 없는 안내. 인쇄·정적 내보내기에는 나오지 않는다. */
export function AchievementEmpty() {
  const C = SECTION.achieve;
  return (
    <section className="orun-no-print" style={{ marginBottom: 64 }}>
      <div className="orun-eyebrow" style={{ marginBottom: 12 }}>
        {C.en}
      </div>
      <EmptyState />
    </section>
  );
}


function LevelBlock({ level, list }: { level: "고" | "중"; list: SchoolRecord[] }) {
  const C = SECTION.achieve;
  const rows = list
    .map((r) => ({ r, p: r.achievement ? profileOf(r.achievement) : null }))
    .filter((x): x is { r: SchoolRecord; p: AchievementProfile } => Boolean(x.p));
  const missing = list.filter((r) => !rows.some((x) => x.r === r));
  if (!rows.length) return null;
  const grade = rows[0].p.grade;
  const year = Math.max(...rows.map((x) => x.p.latestYear));
  const isHigh = level === "고";

  return (
    <div style={{ marginBottom: 30 }}>
      <div className="orun-eyebrow orun-eyebrow--plain" style={{ marginBottom: 8 }}>
        {isHigh ? C.subHigh(grade, year) : C.subMid(grade, year)}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="orun-table" style={{ minWidth: isHigh ? 860 : 680 }}>
          <thead>
            <tr>
              <th>{C.cols.school}</th>
              <th className="num">{C.cols.n}</th>
              {isHigh && <th className="num">{C.cols.seats}</th>}
              {SUBJECTS3.map((s) => (
                <th key={s} className="num">
                  {C.cols.a(s)}
                </th>
              ))}
              <th className="num">{C.cols.avg}</th>
              {isHigh && <th>{C.cols.verdict}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ r, p }) => {
              const rep = repPoint(p);
              return (
                <tr key={r.fact.code}>
                  <td className="name">{short(r.fact.name)}</td>
                  <td className="num">{rep?.n ?? "—"}</td>
                  {isHigh && (
                    <td className="num" style={{ color: "var(--ink)", fontWeight: 700 }}>
                      {rep?.seats ?? "—"}
                    </td>
                  )}
                  {SUBJECTS3.map((s) => {
                    const pt = p.latest[s];
                    if (!pt) return <td key={s} className="num">—</td>;
                    const above = isHigh && pt.gap > 0;
                    return (
                      <td key={s} className="num" style={{ whiteSpace: "nowrap" }}>
                        <span style={{ color: "var(--ink)", fontWeight: 700 }}>{pct(pt.dist.A)}</span>
                        {isHigh && (
                          <span style={{ color: above ? "var(--brick)" : "var(--blue)", fontSize: 11.5, marginLeft: 6 }}>
                            {C.aCount(pt.aCount)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="num" style={{ whiteSpace: "nowrap" }}>
                    {SUBJECTS3.map((s) => fix(p.latest[s]?.avg, 0)).join(" / ")}
                  </td>
                  {isHigh && (
                    <td>
                      <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {SUBJECTS3.map((s) => {
                          const pt = p.latest[s];
                          if (!pt) return null;
                          const above = pt.gap > 0;
                          return (
                            <span key={s} className="orun-chip" style={{ color: above ? "var(--brick)" : "var(--blue)" }}>
                              {s} {above ? C.above : C.below}
                            </span>
                          );
                        })}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isHigh && (
        <p className="orun-small" style={{ margin: "10px 0 0" }}>
          {C.legend}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14, marginTop: 22 }}>
        {rows.map(({ r, p }) => (
          <SchoolCard key={r.fact.code} record={r} profile={p} sa={r.achievement!} isHigh={isHigh} />
        ))}
      </div>

      {missing.length > 0 && (
        <p className="orun-small" style={{ margin: "14px 0 0" }}>
          {C.partial(missing.map((r) => short(r.fact.name)).join(", "))}
        </p>
      )}
    </div>
  );
}

function SchoolCard({ record, profile: p, sa, isHigh }: { record: SchoolRecord; profile: AchievementProfile; sa: SchoolAchievement; isHigh: boolean }) {
  const C = SECTION.achieve;
  const t = profileText(p, isHigh);
  const years = [...new Set(sa.rows.map((r) => r.year))].sort();
  return (
    <div className="orun-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="school" size={16} style={{ color: "var(--ink)" }} />
          <span style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{short(record.fact.name)}</span>
        </div>
        <span className="orun-chip orun-chip--ink">{t.name}</span>
      </div>

      <div>
        {SUBJECTS3.map((s) => (
          <SubjectBars key={s} subject={s} points={p.series[s]} isHigh={isHigh} />
        ))}
      </div>

      <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink)", fontWeight: 500, lineHeight: 1.55 }}>{t.summary}</p>
      {t.extra.map((e, i) => (
        <p key={i} style={{ margin: 0, fontSize: 13, color: "var(--body)", lineHeight: 1.55 }}>
          {e}
        </p>
      ))}

      <List title={C.fitTitle} icon="family" items={t.fit} />
      <List title={C.cautionTitle} icon="alert" items={t.caution} muted />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: "auto" }}>
        <span className="orun-small" style={{ fontSize: 11.5 }}>
          {C.source(years.join(", "))}
        </span>
        <span className="orun-chip">{TAG.view}</span>
      </div>
    </div>
  );
}

function List({ title, icon, items, muted }: { title: string; icon: "family" | "alert"; items: string[]; muted?: boolean }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Icon name={icon} size={14} style={{ color: muted ? "var(--brick)" : "var(--ink)" }} />
        <span className="orun-eyebrow orun-eyebrow--plain" style={{ fontSize: 9.5 }}>
          {title}
        </span>
      </div>
      {items.map((f, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "12px 1fr", gap: 8, fontSize: 13, color: muted ? "var(--muted)" : "var(--body)", lineHeight: 1.5, padding: "3px 0" }}>
          <span style={{ width: 5, height: 5, background: muted ? "var(--hair)" : "var(--yellow-hi)", marginTop: 7 }} />
          <span>{f}</span>
        </div>
      ))}
    </div>
  );
}

/** 과목 하나의 3개년 막대. 노란 선이 1등급 자리. */
export function SubjectBars({ subject, points, isHigh }: { subject: Subject3; points: SubjectPoint[]; isHigh: boolean }) {
  if (!points.length) return null;
  return (
    <div style={{ padding: "8px 0", borderTop: "1px solid var(--hair)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>
          {subject} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 11.5 }}>{points[points.length - 1].subject}</span>
        </span>
        <span className="orun-mono" style={{ fontSize: 11, color: "var(--muted)" }}>
          A {pct(points[points.length - 1].dist.A)}
        </span>
      </div>
      {points.map((pt) => (
        <div key={pt.schoolYear} style={{ display: "grid", gridTemplateColumns: "44px 1fr 92px", gap: 8, alignItems: "center", padding: "2px 0" }}>
          <span className="orun-mono" style={{ fontSize: 10.5, color: "var(--muted)" }}>
            {pt.schoolYear}
          </span>
          <div style={{ position: "relative", height: 12, display: "flex", background: "var(--shade)" }} title={LETTERS.map((L) => `${L} ${pct(pt.dist[L])}`).join(", ")}>
            {LETTERS.map((L, i) => (
              <span key={L} style={{ width: `${pt.dist[L]}%`, background: SEG_COLOR[i], height: "100%" }} />
            ))}
            {isHigh && pt.n > 0 && (
              <span
                title={`1등급 자리 ${pt.seats}명`}
                style={{ position: "absolute", left: `${(pt.seats / pt.n) * 100}%`, top: -3, width: 2, height: 18, background: "var(--yellow-hi)" }}
              />
            )}
          </div>
          <span className="orun-mono" style={{ fontSize: 10.5, color: "var(--body)", textAlign: "right", whiteSpace: "nowrap" }}>
            {fix(pt.avg, 0)}점 · {pt.n}명
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  const C = SECTION.achieve.empty;
  return (
    <div className="orun-callout" style={{ margin: 0 }}>
      <Icon name="paper" size={19} style={{ color: "var(--ink)", marginTop: 1 }} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 20, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{C.title}</div>
          <p style={{ maxWidth: "60ch" }}>{C.text}</p>
          <ol style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
            {C.steps.map((s, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 8, fontSize: 13 }}>
                <span className="orun-mono" style={{ color: "var(--yellow)", fontSize: 11, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <Art name="examPaper" width={150} style={{ color: "var(--muted)" }} />
      </div>
    </div>
  );
}

