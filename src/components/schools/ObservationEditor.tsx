import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { DifficultyLevel, SchoolFact, SchoolObservation, SignatureQuestion } from "@/types/school";
import { schoolTypes } from "@/lib/question-types/school";
import {
  completeness,
  didLastWriteFail,
  editedCount,
  emptyObservation,
  ensureEditable,
  getObservation,
  isEdited,
  pruneObservation,
  resetObservation,
  saveObservation,
  useObservations,
} from "@/lib/schools/store";
import { allSchools } from "@/lib/schools/data";
import { APP, BLOCK, EDITOR } from "@/lib/schools/copy";
import type { IconName } from "@/assets/art";
import { Icon } from "@/components/schools/Art";

const LEVELS: DifficultyLevel[] = ["기초", "보통", "상", "최상"];
const SUBJECTS = ["국어", "영어", "수학", "사회", "과학"] as const;

function middleOf(o: SchoolObservation) {
  return o.middle ?? { aRatio: "", ratio: "", freeSemester: "", textbook: "" };
}

export function ObservationEditor() {
  const observations = useObservations();
  const schools = useMemo(() => [...allSchools()].sort((a, b) => a.name.localeCompare(b.name, "ko")), []);
  const [code, setCode] = useState<string>("");
  const school = schools.find((s) => s.code === code);

  return (
    <div className="orun" style={{ background: "transparent" }}>
      <div className="orun-hero" style={{ padding: "0 0 26px" }}>
        <div>
          <div className="orun-eyebrow" style={{ marginBottom: 12 }}>
            {APP.edit.en}
          </div>
          <h2 className="orun-display" style={{ fontSize: 32, marginBottom: 10 }}>
            {APP.edit.title}
          </h2>
          <p className="orun-lede">{APP.edit.lede}</p>
        </div>
      </div>

      <SchoolSelect schools={schools} value={code} onChange={setCode} observations={observations} />

      {school ? (
        <EditorForm key={school.code} school={school} />
      ) : (
        <p className="orun-lede" style={{ fontSize: 14, padding: "30px 0" }}>
          {EDITOR.pickHint}
        </p>
      )}
    </div>
  );
}

/* ── 학교 선택 ─────────────────────────────── */

function SchoolSelect({
  schools,
  value,
  onChange,
  observations,
}: {
  schools: SchoolFact[];
  value: string;
  onChange: (c: string) => void;
  observations: Record<string, SchoolObservation>;
}) {
  const filled = editedCount();
  const recorded = schools.filter((s) => isEdited(s.code));
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div className="orun-input-wrap" style={{ maxWidth: 460 }}>
          <Icon name="school" size={16} />
          <select className="orun-input" value={value} onChange={(e) => onChange(e.target.value)} style={{ cursor: "pointer" }}>
            <option value="">{EDITOR.pickSchool}</option>
            {schools.map((s) => {
              const pct = Math.round(completeness(observations[s.code]) * 100);
              return (
                <option key={s.code} value={s.code}>
                  {s.name}
                  {pct > 0 ? ` (${pct}%)` : ""}
                </option>
              );
            })}
          </select>
        </div>
        <span className="orun-small">{EDITOR.progress(schools.length, filled)}</span>
      </div>

      {recorded.length > 0 && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
          <span className="orun-eyebrow orun-eyebrow--plain" style={{ fontSize: 9.5 }}>
            {EDITOR.recorded}
          </span>
          {recorded.map((s) => (
            <button key={s.code} className="orun-pill" aria-pressed={s.code === value} onClick={() => onChange(s.code)} style={{ padding: "5px 11px", fontSize: 12.5 }}>
              {s.name}
              <span className="orun-pill__n">{Math.round(completeness(observations[s.code]) * 100)}%</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 폼 ────────────────────────────────────── */

function EditorForm({ school }: { school: SchoolFact }) {
  const stored = getObservation(school.code);
  const isMiddle = school.level === "중";
  const [draft, setDraft] = useState<SchoolObservation>(() => ensureEditable(stored ?? emptyObservation(school.name, school.level)));
  const [saved, setSaved] = useState<"idle" | "saved" | "failed">("idle");
  const timer = useRef<number>();

  /**
   * 사용자가 실제로 고친 뒤에만 저장한다.
   * 가드가 없으면 드롭다운에서 학교를 고르기만 해도 빈 관측이 저장되어,
   * 관측한 적 없는 학교에 "옳은영어 관측: 전 과목 보통"이 인쇄된다.
   */
  const dirty = useRef(false);
  const latest = useRef(draft);
  latest.current = draft;

  const flush = () => {
    if (!dirty.current) return;
    saveObservation(school.code, pruneObservation(latest.current));
    dirty.current = false;
  };

  useEffect(() => {
    if (!dirty.current) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      saveObservation(school.code, pruneObservation(latest.current));
      dirty.current = false;
      setSaved(didLastWriteFail() ? "failed" : "saved");
      if (!didLastWriteFail()) window.setTimeout(() => setSaved("idle"), 1600);
    }, 700);
    return () => window.clearTimeout(timer.current);
  }, [draft, school.code]);

  // 학교를 바꾸거나 화면을 떠날 때 디바운스 중인 입력을 흘려보낸다
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.clearTimeout(timer.current);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school.code]);

  const set = (patch: Partial<SchoolObservation>) => {
    dirty.current = true;
    setDraft((d) => ({ ...d, ...patch }));
  };

  const pct = Math.round(completeness(draft) * 100);
  const S = EDITOR.stats;

  return (
    <div className="orun-rise">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          borderTop: "1.5px solid var(--ink)",
          paddingTop: 18,
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Icon name="school" size={22} style={{ color: "var(--ink)" }} />
          <h3 className="orun-h2" style={{ fontSize: 22 }}>
            {school.name}
          </h3>
          <span className="orun-chip">{[school.district, school.coed].filter(Boolean).join(" · ")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="orun-chip orun-chip--ink">{EDITOR.pct(pct)}</span>
          {saved === "saved" && <span className="orun-chip orun-chip--blue orun-chip--dot">{EDITOR.saved}</span>}
          {saved === "failed" && <span style={{ fontSize: 12.5, color: "var(--brick)", fontWeight: 700 }}>{EDITOR.saveFailed}</span>}
          {isEdited(school.code) && (
            <button
              className="orun-btn orun-btn--sm"
              style={{ color: "var(--brick)" }}
              onClick={() => {
                if (!confirm(EDITOR.resetConfirm(school.name))) return;
                window.clearTimeout(timer.current);
                dirty.current = false;
                resetObservation(school.code);
                setDraft(ensureEditable(getObservation(school.code) ?? emptyObservation(school.name, school.level)));
              }}
            >
              <Icon name="x" size={13} />
              {EDITOR.reset}
            </button>
          )}
        </div>
      </div>

      <div style={{ height: 3, background: "var(--hair)", marginBottom: 30 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--yellow-hi)", transition: "width .3s" }} />
      </div>

      {/* 공시층 — 읽기 전용 */}
      <Block en={EDITOR.fact.en} ko={EDITOR.fact.ko} icon="shield" hint={EDITOR.fact.hint} tone="fact">
        <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))" }}>
          <RO label={S.g1} value={school.g1Total} unit="명" />
          <RO label={S.classes} value={school.g1Classes} unit="반" />
          <RO label={S.perClass} value={school.g1PerClass?.toFixed(1)} unit="명" />
          <RO label={S.male} value={school.g1Male} unit="명" />
          <RO label={S.female} value={school.g1Female} unit="명" />
        </div>
      </Block>

      <Block {...BLOCK.character} icon="school" tone="obs">
        <Textarea value={draft.character} onChange={(v) => set({ character: v })} rows={4} placeholder={isMiddle ? EDITOR.character.phMid : EDITOR.character.phHigh} />
      </Block>

      <Block {...BLOCK.subjects} icon="bars" tone="obs">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 28px", marginBottom: 14 }}>
          {SUBJECTS.map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 13.5, width: 30, color: "var(--ink)", fontWeight: 500 }}>{s}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {LEVELS.map((lv) => (
                  <button
                    key={lv}
                    className="orun-pill"
                    aria-pressed={draft.difficulty[s] === lv}
                    onClick={() => set({ difficulty: { ...draft.difficulty, [s]: lv } })}
                    style={{ padding: "4px 10px", fontSize: 12 }}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Textarea
          value={draft.difficulty.comment ?? ""}
          onChange={(v) => set({ difficulty: { ...draft.difficulty, comment: v } })}
          rows={3}
          placeholder={isMiddle ? EDITOR.subjects.phMid : EDITOR.subjects.phHigh}
        />
      </Block>

      <Block {...(isMiddle ? BLOCK.scopeMid : BLOCK.scope)} icon="range" tone="obs">
        <Repeatable
          items={draft.examScope}
          onChange={(v) => set({ examScope: v })}
          make={(): { term: string; scope: string } => ({ term: "", scope: "" })}
          addLabel={EDITOR.scope.add}
          render={(item, update) => (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 150px) 1fr", gap: 10 }}>
              <Input value={item.term} onChange={(v) => update({ ...item, term: v })} placeholder={isMiddle ? EDITOR.scope.termMid : EDITOR.scope.termHigh} />
              <Input value={item.scope} onChange={(v) => update({ ...item, scope: v })} placeholder={EDITOR.scope.ph} />
            </div>
          )}
        />
      </Block>

      {isMiddle ? (
        <Block {...BLOCK.middleReport} icon="paper" hint={EDITOR.middle.hint} tone="obs">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
            <Field label={EDITOR.middle.aRatio}>
              <Input value={draft.middle?.aRatio ?? ""} onChange={(v) => set({ middle: { ...middleOf(draft), aRatio: v } })} placeholder={EDITOR.middle.ph.aRatio} />
            </Field>
            <Field label={EDITOR.middle.ratio}>
              <Input value={draft.middle?.ratio ?? ""} onChange={(v) => set({ middle: { ...middleOf(draft), ratio: v } })} placeholder={EDITOR.middle.ph.ratio} />
            </Field>
            <Field label={EDITOR.middle.freeSemester}>
              <Input value={draft.middle?.freeSemester ?? ""} onChange={(v) => set({ middle: { ...middleOf(draft), freeSemester: v } })} placeholder={EDITOR.middle.ph.freeSemester} />
            </Field>
            <Field label={EDITOR.middle.textbook}>
              <Input value={draft.middle?.textbook ?? ""} onChange={(v) => set({ middle: { ...middleOf(draft), textbook: v } })} placeholder={EDITOR.middle.ph.textbook} />
            </Field>
          </div>
        </Block>
      ) : (
        <Block {...BLOCK.cutoff} icon="cut" hint={EDITOR.cutoff.hint} tone="obs">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
            <Field label={EDITOR.cutoff.g1}>
              <Input value={draft.cutoff.grade1} onChange={(v) => set({ cutoff: { ...draft.cutoff, grade1: v } })} placeholder={EDITOR.cutoff.ph.g1} />
            </Field>
            <Field label={EDITOR.cutoff.g2}>
              <Input value={draft.cutoff.grade2} onChange={(v) => set({ cutoff: { ...draft.cutoff, grade2: v } })} placeholder={EDITOR.cutoff.ph.g2} />
            </Field>
            <Field label={EDITOR.cutoff.basis}>
              <Input value={draft.cutoff.basis} onChange={(v) => set({ cutoff: { ...draft.cutoff, basis: v } })} placeholder={EDITOR.cutoff.ph.basis} />
            </Field>
          </div>
        </Block>
      )}

      <Block {...BLOCK.features} icon="checks" tone="obs">
        <Repeatable
          items={draft.features}
          onChange={(v) => set({ features: v })}
          make={() => ""}
          addLabel={EDITOR.features.add}
          numbered
          render={(item, update) => <Textarea value={item} onChange={update} rows={2} placeholder={EDITOR.features.ph} />}
        />
      </Block>

      <Block {...BLOCK.signature} icon="sparkle" hint={EDITOR.signature.hint} tone="obs">
        <Repeatable
          items={draft.signatures}
          onChange={(v) => set({ signatures: v })}
          make={(): SignatureQuestion => ({ title: "", note: "" })}
          addLabel={EDITOR.signature.add}
          numbered
          render={(item, update) => (
            <div style={{ display: "grid", gap: 8 }}>
              <Input value={item.title} onChange={(v) => update({ ...item, title: v })} placeholder={EDITOR.signature.title} />
              <Textarea value={item.note} onChange={(v) => update({ ...item, note: v })} rows={2} placeholder={EDITOR.signature.note} />
              <select
                className="orun-input"
                value={item.generatorTypeId ?? ""}
                onChange={(e) => update({ ...item, generatorTypeId: e.target.value || undefined })}
                style={{ paddingLeft: 12, maxWidth: 340, fontSize: 13, cursor: "pointer" }}
              >
                <option value="">{EDITOR.signature.noType}</option>
                {schoolTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        />
      </Block>

      <Block {...BLOCK.fit} icon="family" hint={EDITOR.fit.hint} tone="view">
        <Repeatable
          items={draft.fit}
          onChange={(v) => set({ fit: v })}
          make={() => ""}
          addLabel={EDITOR.fit.add}
          numbered
          render={(item, update) => <Input value={item} onChange={update} placeholder={isMiddle ? EDITOR.fit.phMid : EDITOR.fit.phHigh} />}
        />
      </Block>
    </div>
  );
}

/* ── 조각들 ────────────────────────────────── */

function Block({
  en,
  ko,
  icon,
  hint,
  children,
}: {
  en: string;
  ko: string;
  icon: IconName;
  hint?: string;
  tone?: "fact" | "obs" | "view";
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1.5px solid var(--ink)", paddingBottom: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Icon name={icon} size={18} style={{ color: "var(--ink)" }} />
          <span className="orun-eyebrow orun-eyebrow--plain" style={{ fontSize: 9.5, letterSpacing: ".2em" }}>
            {en}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{ko}</span>
        </div>
      </div>
      {hint && (
        <p className="orun-small" style={{ margin: "0 0 12px" }}>
          {hint}
        </p>
      )}
      {children}
    </section>
  );
}

function RO({ label, value, unit }: { label: string; value: string | number | null | undefined; unit: string }) {
  return (
    <div style={{ padding: "12px 14px" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span className="orun-stat" style={{ fontSize: 19, fontWeight: 700, color: "var(--body)" }}>
          {value ?? "—"}
        </span>
        <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{unit}</span>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const fieldStyle: CSSProperties = { paddingLeft: 12, lineHeight: 1.6 };

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className="orun-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={fieldStyle} />;
}

function Textarea({ value, onChange, rows, placeholder }: { value: string; onChange: (v: string) => void; rows: number; placeholder?: string }) {
  return <textarea className="orun-input" value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{ ...fieldStyle, resize: "vertical" }} />;
}

function Repeatable<T>({
  items,
  onChange,
  make,
  render,
  addLabel,
  numbered,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  make: () => T;
  render: (item: T, update: (v: T) => void) => ReactNode;
  addLabel: string;
  numbered?: boolean;
}) {
  const update = (i: number, v: T) => onChange(items.map((it, j) => (j === i ? v : it)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: numbered ? "26px 1fr auto" : "1fr auto",
            gap: 10,
            alignItems: "start",
            padding: "10px 0",
            borderBottom: "1px solid var(--hair)",
          }}
        >
          {numbered && (
            <span className="orun-mono" style={{ fontSize: 11, color: "var(--yellow)", fontWeight: 500, paddingTop: 11 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
          )}
          <div>{render(item, (v) => update(i, v))}</div>
          <div style={{ display: "flex", gap: 3, paddingTop: 4 }}>
            <IconBtn label={EDITOR.rows.up} icon="arrowUp" onClick={() => move(i, -1)} disabled={i === 0} />
            <IconBtn label={EDITOR.rows.down} icon="arrowDown" onClick={() => move(i, 1)} disabled={i === items.length - 1} />
            <IconBtn label={EDITOR.rows.remove} icon="x" onClick={() => remove(i)} danger />
          </div>
        </div>
      ))}
      <button
        className="orun-btn orun-btn--sm"
        onClick={() => onChange([...items, make()])}
        style={{ marginTop: 12, width: "100%", justifyContent: "center", borderStyle: "dashed", color: "var(--muted)" }}
      >
        <Icon name="plus" size={13} />
        {addLabel}
      </button>
    </div>
  );
}

function IconBtn({ icon, onClick, disabled, danger, label }: { icon: IconName; onClick: () => void; disabled?: boolean; danger?: boolean; label: string }) {
  return (
    <button
      className="orun-btn orun-btn--sm orun-btn--icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{ padding: 6, opacity: disabled ? 0.3 : 1, color: danger ? "var(--brick)" : undefined }}
    >
      <Icon name={icon} size={13} />
    </button>
  );
}
