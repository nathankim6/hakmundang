import { useMemo, useRef, useState } from "react";
import type { ParsedAchievement } from "@/types/achievement";
import { allSchools } from "@/lib/schools/data";
import { parseAchievementFile } from "@/lib/schools/achievementParse";
import { addAchievement, downloadAchievements, importAchievementsJson, removeAchievement, useAchievements } from "@/lib/schools/achievementStore";
import { ACHIEVE_IMPORT as T } from "@/lib/schools/copy";
import { Icon, Logo } from "@/components/schools/Art";
import { schoolinfoUrl } from "@/lib/schools/schoolinfo";
import type { SchoolFact } from "@/types/school";

/**
 * 학교알리미 학업성취 엑셀 불러오기.
 * 파일을 읽어 미리 보여 주고, 학교·연도를 확인한 뒤 저장한다.
 */

type Pending = ParsedAchievement & { id: number; code: string; year: number };

const YEARS = [2027, 2026, 2025, 2024, 2023, 2022];
/** 3개년 비교에 필요한 공시연도 — 체크리스트가 이 세 해를 기준으로 셈한다 */
const NEED_YEARS = [2026, 2025, 2024];

export function AchievementImport({ selected = [] }: { selected?: string[] }) {
  const store = useAchievements();
  const schools = useMemo(() => [...allSchools()].sort((a, b) => a.name.localeCompare(b.name, "ko")), []);
  const [pending, setPending] = useState<Pending[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);

  const matchCode = (name?: string) => {
    if (!name) return "";
    const exact = schools.find((s) => s.name === name);
    if (exact) return exact.code;
    const loose = schools.find((s) => s.name.replace(/\s/g, "") === name.replace(/\s/g, "") || s.name.includes(name) || name.includes(s.name.replace(/(고등학교|중학교)$/, "")));
    return loose?.code ?? "";
  };

  const onFiles = async (files: FileList | File[]) => {
    setBusy(true);
    setMsg(null);
    const out: Pending[] = [];
    for (const f of Array.from(files)) {
      if (/\.json$/i.test(f.name)) continue;
      try {
        const parsed = await parseAchievementFile(f);
        out.push({ ...parsed, id: Date.now() + Math.random(), code: matchCode(parsed.schoolName), year: parsed.year ?? YEARS[1] });
      } catch (e) {
        out.push({ fileName: f.name, rows: [], warnings: [`읽지 못했어요: ${(e as Error).message}`], id: Date.now() + Math.random(), code: "", year: YEARS[1] });
      }
    }
    setPending((p) => [...p, ...out]);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const update = (id: number, patch: Partial<Pending>) => setPending((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const saveOne = (x: Pending) => {
    if (!x.code || !x.rows.length) return false;
    const school = schools.find((s) => s.code === x.code)!;
    const rows = x.rows.map((r) => {
      const delta = x.year - r.year;
      return delta ? { ...r, year: x.year, schoolYear: r.schoolYear + delta } : r;
    });
    addAchievement(x.code, school.name, rows, x.fileName);
    return true;
  };

  const saveAll = () => {
    const ok = pending.filter(saveOne);
    setPending((p) => p.filter((x) => !ok.includes(x)));
    setMsg(T.saved(new Set(ok.map((x) => x.code)).size));
  };

  const loaded = Object.values(store).filter((s) => s.rows.length);

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1.5px solid var(--ink)", paddingBottom: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Icon name="bars" size={18} style={{ color: "var(--ink)" }} />
          <span className="orun-eyebrow orun-eyebrow--plain" style={{ fontSize: 9.5, letterSpacing: ".2em" }}>
            {T.en}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{T.title}</span>
        </div>
      </div>
      <p className="orun-small" style={{ margin: "0 0 14px", maxWidth: "70ch" }}>
        {T.lede}
      </p>

      <Checklist selected={selected} schools={schools} store={store} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void onFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        style={{
          border: `1.5px dashed ${over ? "var(--ink)" : "var(--hair)"}`,
          background: over ? "var(--paper)" : "transparent",
          padding: "26px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color .15s, background .15s",
        }}
      >
        <Icon name="download" size={22} style={{ color: "var(--ink)", marginBottom: 6 }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{busy ? "읽는 중" : T.drop}</div>
        <div className="orun-small" style={{ marginTop: 2 }}>
          {T.hint}
        </div>
        <input ref={fileRef} type="file" multiple accept=".xlsx,.xls,.htm,.html,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style={{ display: "none" }} onChange={(e) => e.target.files && void onFiles(e.target.files)} />
      </div>

      {pending.length > 0 && (
        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          {pending.map((x) => (
            <div key={x.id} className="orun-card" style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Icon name="paper" size={16} style={{ color: "var(--ink)" }} />
                <strong style={{ color: "var(--ink)", fontSize: 13.5 }}>{x.fileName}</strong>
                <span className="orun-chip orun-chip--ink">{T.parsed(x.rows.length)}</span>
                <button className="orun-btn orun-btn--sm orun-btn--icon" style={{ marginLeft: "auto", color: "var(--brick)" }} onClick={() => setPending((p) => p.filter((y) => y.id !== x.id))} aria-label={T.remove} title={T.remove}>
                  <Icon name="x" size={13} />
                </button>
              </div>
              {x.warnings.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 6, fontSize: 12.5, color: "var(--brick)" }}>
                  <Icon name="alert" size={14} style={{ marginTop: 3 }} />
                  <span>{w}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <label className="orun-small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {T.school}
                  <select className="orun-input" value={x.code} onChange={(e) => update(x.id, { code: e.target.value })} style={{ paddingLeft: 10, width: 260, fontSize: 13 }}>
                    <option value="">{T.pickSchool}</option>
                    {schools.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="orun-small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {T.year}
                  <select className="orun-input" value={x.year} onChange={(e) => update(x.id, { year: Number(e.target.value) })} style={{ paddingLeft: 10, width: 110, fontSize: 13 }}>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}년
                      </option>
                    ))}
                  </select>
                </label>
                <button className="orun-btn orun-btn--sm orun-btn--primary" disabled={!x.code || !x.rows.length} onClick={() => { if (saveOne(x)) { setPending((p) => p.filter((y) => y.id !== x.id)); setMsg(T.saved(1)); } }}>
                  <Icon name="check" size={13} />
                  {T.save}
                </button>
              </div>
              {x.rows.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table className="orun-table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>학년</th>
                        <th>학기</th>
                        <th>과목</th>
                        <th className="num">수강자</th>
                        <th className="num">평균</th>
                        <th className="num">표준편차</th>
                        <th className="num">A</th>
                        <th className="num">B</th>
                        <th className="num">C</th>
                        <th className="num">D</th>
                        <th className="num">E</th>
                      </tr>
                    </thead>
                    <tbody>
                      {x.rows.slice(0, 6).map((r, i) => (
                        <tr key={i}>
                          <td>{r.grade}</td>
                          <td>{r.term ?? "—"}</td>
                          <td className="name">{r.subject}</td>
                          <td className="num">{r.n}</td>
                          <td className="num">{r.avg ?? "—"}</td>
                          <td className="num">{r.sd ?? "—"}</td>
                          {(["A", "B", "C", "D", "E"] as const).map((L) => (
                            <td key={L} className="num">
                              {r.dist[L]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {x.rows.length > 6 && (
                    <p className="orun-small" style={{ margin: "6px 0 0" }}>
                      {T.preview}: {x.rows.length}행 중 6행
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          {pending.length > 1 && (
            <button className="orun-btn orun-btn--primary" onClick={saveAll} disabled={!pending.some((x) => x.code && x.rows.length)} style={{ justifySelf: "start" }}>
              <Icon name="checks" size={15} />
              {T.saveAll(pending.filter((x) => x.code && x.rows.length).length)}
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <div className="orun-eyebrow orun-eyebrow--plain" style={{ fontSize: 9.5, marginBottom: 8 }}>
          {T.loaded}
        </div>
        {loaded.length === 0 ? (
          <p className="orun-small" style={{ margin: 0 }}>
            {T.none}
          </p>
        ) : (
          <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {loaded.map((s) => (
              <div key={s.code} style={{ padding: "12px 14px", display: "grid", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="school" size={14} style={{ color: "var(--ink)" }} />
                  <strong style={{ color: "var(--ink)", fontSize: 13.5 }}>{s.schoolName}</strong>
                  <button className="orun-btn orun-btn--sm orun-btn--icon" style={{ marginLeft: "auto", color: "var(--brick)", padding: 4 }} onClick={() => removeAchievement(s.code)} aria-label={T.remove} title={T.remove}>
                    <Icon name="x" size={12} />
                  </button>
                </div>
                {s.files.map((f) => (
                  <div key={f.year + f.name} className="orun-small" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span>
                      <span className="orun-mono" style={{ color: "var(--yellow)" }}>
                        {f.year}
                      </span>{" "}
                      {T.fileNote(f.name, f.rows)}
                    </span>
                    <button className="orun-btn orun-btn--sm orun-btn--icon" style={{ padding: 2, border: 0 }} onClick={() => removeAchievement(s.code, f.year)} aria-label={T.remove} title={T.remove}>
                      <Icon name="x" size={11} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <button className="orun-btn orun-btn--sm" onClick={downloadAchievements} disabled={loaded.length === 0}>
            <Icon name="download" size={14} />
            {T.export}
          </button>
          <button className="orun-btn orun-btn--sm" onClick={() => jsonRef.current?.click()}>
            <Icon name="folder" size={14} />
            {T.importJson}
          </button>
          <input
            ref={jsonRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const r = importAchievementsJson(await f.text());
              setMsg(r.status === "ok" ? T.saved(r.count) : r.reason);
              e.target.value = "";
            }}
          />
          {msg && <span style={{ fontSize: 12.5, color: "var(--blue)" }}>{msg}</span>}
        </div>
      </div>
    </section>
  );
}

/* ── 받을 파일 체크리스트 ─────────────────── */

/**
 * 고른 학교마다 학교알리미 페이지로 가는 링크와 연도별 파일 상태를 보여 준다.
 * 성취도 화면은 보안문자 뒤에 있어 사람이 받아야 하므로, 프로그램은
 * 파일을 대신 받지 않고 거기까지 가는 길과 남은 일만 정리한다.
 */
function Checklist({ selected, schools, store }: { selected: string[]; schools: SchoolFact[]; store: ReturnType<typeof useAchievements> }) {
  const C = T.checklist;
  const rows = selected.map((code) => schools.find((s) => s.code === code)).filter((s): s is SchoolFact => Boolean(s));
  const has = (code: string, year: number) => Boolean(store[code]?.files.some((f) => f.year === year));
  const total = rows.length * NEED_YEARS.length;
  const have = rows.reduce((n, s) => n + NEED_YEARS.filter((y) => has(s.code, y)).length, 0);
  const allDone = total > 0 && have === total;

  return (
    <div className="orun-card orun-card--paper" style={{ marginBottom: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Icon name="checks" size={18} style={{ color: "var(--ink)" }} />
        <strong style={{ color: "var(--ink)", fontSize: 14.5 }}>{C.title}</strong>
        {total > 0 && (
          <span className={`orun-chip ${allDone ? "orun-chip--mint" : "orun-chip--yellow"}`} style={{ marginLeft: "auto" }}>
            {allDone ? C.done : C.progress(have, total)}
          </span>
        )}
      </div>
      <p className="orun-small" style={{ margin: 0, maxWidth: "70ch" }}>
        {C.lede}
      </p>
      <ol className="orun-small" style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4, listStyle: "decimal" }}>
        {C.steps.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ol>
      {rows.length === 0 ? (
        <p className="orun-small" style={{ margin: 0 }}>
          {C.noneSelected}
        </p>
      ) : (
        <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
          {rows.map((s) => {
            const url = schoolinfoUrl(s.code);
            return (
              <div key={s.code} style={{ padding: "12px 14px", display: "grid", gap: 8, alignContent: "start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Logo code={s.code} name={s.name} size="sm" />
                  <strong style={{ color: "var(--ink)", fontSize: 13.5 }}>{s.name}</strong>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {NEED_YEARS.map((y) => {
                    const ok = has(s.code, y);
                    return (
                      <span key={y} className={`orun-chip ${ok ? "orun-chip--mint" : "orun-chip--fill"}`}>
                        {ok ? C.yearDone(y) : C.yearTodo(y)}
                      </span>
                    );
                  })}
                </div>
                {url ? (
                  <a className="orun-btn orun-btn--sm" href={url} target="_blank" rel="noopener noreferrer" style={{ justifySelf: "start", textDecoration: "none" }}>
                    <Icon name="school" size={13} />
                    {C.open}
                  </a>
                ) : (
                  <span className="orun-small">{C.noLink}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
