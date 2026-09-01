import { useEffect, useMemo, useRef, useState } from "react";
import type {
  DifficultyLevel,
  SchoolFact,
  SchoolObservation,
  SignatureQuestion,
} from "@/types/school";
import { schoolTypes } from "@/lib/question-types/school";
import {
  completeness,
  emptyObservation,
  getObservation,
  isEdited,
  pruneObservation,
  resetObservation,
  saveObservation,
  useObservations,
} from "@/lib/schools/store";
import { allSchools } from "@/lib/schools/data";

const LEVELS: DifficultyLevel[] = ["기초", "보통", "상", "최상"];
const SUBJECTS = ["국어", "영어", "수학", "사회", "과학"] as const;

export function ObservationEditor() {
  const observations = useObservations();
  const schools = useMemo(
    () => [...allSchools()].sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [],
  );
  const [code, setCode] = useState<string>("");
  const school = schools.find((s) => s.code === code);

  return (
    <div className="orun" style={{ background: "transparent" }}>
      <div className="orun-eyebrow" style={{ marginBottom: 12 }}>
        Observation · 옳은영어가 직접 본 것
      </div>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "var(--ink)",
          margin: "0 0 8px",
          letterSpacing: "-.015em",
        }}
      >
        학교 관측 입력
      </h2>
      <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: "64ch", margin: "0 0 24px" }}>
        공시자료에 없는 내용입니다. 한 번 넣어두면 내년 설명회에서 그대로 다시 씁니다. 학교가
        쌓일수록 준비 시간이 줄어듭니다.
      </p>

      <SchoolSelect
        schools={schools}
        value={code}
        onChange={setCode}
        observations={observations}
      />

      {school ? (
        <EditorForm key={school.code} school={school} />
      ) : (
        <p style={{ color: "var(--muted)", fontSize: 14, padding: "34px 0" }}>
          입력할 학교를 위에서 골라 주세요.
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
  const filled = schools.filter((s) => observations[s.code]);
  return (
    <div style={{ marginBottom: 30 }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 460,
          padding: "11px 12px",
          border: "1px solid var(--hair)",
          background: "var(--ground)",
          color: "var(--ink)",
          fontSize: 15,
          outline: "none",
        }}
      >
        <option value="">— 학교 선택 —</option>
        {schools.map((s) => {
          const pct = Math.round(completeness(observations[s.code]) * 100);
          return (
            <option key={s.code} value={s.code}>
              {s.name} {pct > 0 ? `· ${pct}%` : ""}
            </option>
          );
        })}
      </select>
      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>
        전체 {schools.length}개교 중 <strong style={{ color: "var(--ink)" }}>{filled.length}개교</strong>{" "}
        입력됨
      </p>
    </div>
  );
}

/* ── 폼 ────────────────────────────────────── */

function EditorForm({ school }: { school: SchoolFact }) {
  const stored = getObservation(school.code);
  const [draft, setDraft] = useState<SchoolObservation>(
    () => stored ?? emptyObservation(school.name),
  );
  const [saved, setSaved] = useState<"idle" | "saved">("idle");
  const timer = useRef<number>();

  // 자동 저장 — 입력이 멈추면 저장한다
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      saveObservation(school.code, pruneObservation(draft));
      setSaved("saved");
      window.setTimeout(() => setSaved("idle"), 1600);
    }, 700);
    return () => window.clearTimeout(timer.current);
  }, [draft, school.code]);

  const set = (patch: Partial<SchoolObservation>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const pct = Math.round(completeness(draft) * 100);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          borderTop: "1.5px solid var(--ink)",
          paddingTop: 16,
          marginBottom: 8,
        }}
      >
        <h3 style={{ fontSize: 21, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          {school.name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
            {pct}% 입력
            {saved === "saved" && (
              <span style={{ color: "var(--blue)", marginLeft: 8 }}>저장됨</span>
            )}
          </span>
          {isEdited(school.code) && (
            <button
              onClick={() => {
                if (!confirm(`${school.name}의 입력 내용을 지웁니다. 계속할까요?`)) return;
                resetObservation(school.code);
                setDraft(getObservation(school.code) ?? emptyObservation(school.name));
              }}
              style={{
                border: "1px solid var(--hair)",
                background: "transparent",
                color: "var(--brick)",
                fontSize: 12,
                padding: "5px 11px",
                cursor: "pointer",
              }}
            >
              입력 지우기
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          height: 3,
          background: "var(--hair)",
          marginBottom: 28,
        }}
      >
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--yellow-hi)" }} />
      </div>

      {/* 공시층 — 읽기 전용 */}
      <Block
        en="From disclosure"
        ko="공시자료"
        hint="학교알리미에서 자동으로 채워집니다. 수정할 수 없습니다."
        tone="fact"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
            gap: 1,
            background: "var(--hair)",
            border: "1px solid var(--hair)",
          }}
        >
          <RO label="1학년" value={school.g1Total} unit="명" />
          <RO label="학급" value={school.g1Classes} unit="반" />
          <RO label="학급당" value={school.g1PerClass?.toFixed(1)} unit="명" />
          <RO label="남" value={school.g1Male} unit="명" />
          <RO label="여" value={school.g1Female} unit="명" />
        </div>
      </Block>

      <Block en="School character" ko="학교 특징" tone="obs">
        <Textarea
          value={draft.character}
          onChange={(v) => set({ character: v })}
          rows={4}
          placeholder="이 학교를 한 문단으로 설명한다면? (설명회 첫 장에 그대로 실립니다)"
        />
      </Block>

      <Block en="Subject difficulty" ko="과목별 난이도" tone="obs">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 28px", marginBottom: 14 }}>
          {SUBJECTS.map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 13.5, width: 30 }}>{s}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {LEVELS.map((lv) => {
                  const on = draft.difficulty[s] === lv;
                  return (
                    <button
                      key={lv}
                      onClick={() =>
                        set({ difficulty: { ...draft.difficulty, [s]: lv } })
                      }
                      aria-pressed={on}
                      style={{
                        border: `1px solid ${on ? "var(--ink)" : "var(--hair)"}`,
                        background: on ? "var(--ink)" : "transparent",
                        color: on ? "#fff" : "var(--muted)",
                        fontSize: 12,
                        padding: "4px 9px",
                        cursor: "pointer",
                        fontWeight: on ? 700 : 400,
                      }}
                    >
                      {lv}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Textarea
          value={draft.difficulty.comment ?? ""}
          onChange={(v) => set({ difficulty: { ...draft.difficulty, comment: v } })}
          rows={3}
          placeholder="난이도에 대한 설명 (성취도 분포에서 읽어낸 것)"
        />
      </Block>

      <Block en="English exam scope" ko="영어 시험범위" tone="obs">
        <Repeatable
          items={draft.examScope}
          onChange={(v) => set({ examScope: v })}
          make={(): { term: string; scope: string } => ({ term: "", scope: "" })}
          addLabel="시험 한 회 더 넣기"
          render={(item, update) => (
            <div style={{ display: "grid", gridTemplateColumns: "132px 1fr", gap: 10 }}>
              <Input
                value={item.term}
                onChange={(v) => update({ ...item, term: v })}
                placeholder="1학기 중간"
              />
              <Input
                value={item.scope}
                onChange={(v) => update({ ...item, scope: v })}
                placeholder="교과서 Lesson 1~2 / 부교재 Unit 1-4 (총 30지문)"
              />
            </div>
          )}
        />
      </Block>

      <Block
        en="Grade cut-off"
        ko="영어 등급 커트라인"
        hint="근거를 반드시 함께 적습니다. 추정치를 학교 공식 발표처럼 보이게 하면 안 됩니다."
        tone="obs"
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          <Field label="1등급">
            <Input
              value={draft.cutoff.grade1}
              onChange={(v) => set({ cutoff: { ...draft.cutoff, grade1: v } })}
              placeholder="87~91"
            />
          </Field>
          <Field label="2등급">
            <Input
              value={draft.cutoff.grade2}
              onChange={(v) => set({ cutoff: { ...draft.cutoff, grade2: v } })}
              placeholder="63~71"
            />
          </Field>
          <Field label="기준">
            <Input
              value={draft.cutoff.basis}
              onChange={(v) => set({ cutoff: { ...draft.cutoff, basis: v } })}
              placeholder="영어 / 원점수 기준"
            />
          </Field>
        </div>
      </Block>

      <Block en="Exam characteristics" ko="시험의 특징" tone="obs">
        <Repeatable
          items={draft.features}
          onChange={(v) => set({ features: v })}
          make={() => ""}
          addLabel="특징 한 줄 더 넣기"
          numbered
          render={(item, update) => (
            <Textarea
              value={item}
              onChange={update}
              rows={2}
              placeholder="시험지를 받아 본 사람만 아는 것"
            />
          )}
        />
      </Block>

      <Block
        en="Signature questions"
        ko="시그니처 문항"
        hint="문항 유형을 연결하면 설명회에서 실제 문항을 즉석에서 생성할 수 있습니다."
        tone="obs"
      >
        <Repeatable
          items={draft.signatures}
          onChange={(v) => set({ signatures: v })}
          make={(): SignatureQuestion => ({ title: "", note: "" })}
          addLabel="시그니처 문항 더 넣기"
          numbered
          render={(item, update) => (
            <div style={{ display: "grid", gap: 8 }}>
              <Input
                value={item.title}
                onChange={(v) => update({ ...item, title: v })}
                placeholder="문항 발문 또는 유형 이름"
              />
              <Textarea
                value={item.note}
                onChange={(v) => update({ ...item, note: v })}
                rows={2}
                placeholder="왜 이 문항이 등급을 가르는지"
              />
              <select
                value={item.generatorTypeId ?? ""}
                onChange={(e) =>
                  update({ ...item, generatorTypeId: e.target.value || undefined })
                }
                style={{
                  padding: "7px 10px",
                  border: "1px solid var(--hair)",
                  background: "var(--ground)",
                  color: "var(--ink)",
                  fontSize: 13,
                  outline: "none",
                  maxWidth: 340,
                }}
              >
                <option value="">문항 생성기 연결 안 함</option>
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

      <Block
        en="Who fits here"
        ko="맞는 학생 유형"
        hint="이 항목은 사실이 아니라 옳은영어의 견해로 표기됩니다."
        tone="view"
      >
        <Repeatable
          items={draft.fit}
          onChange={(v) => set({ fit: v })}
          make={() => ""}
          addLabel="유형 더 넣기"
          numbered
          render={(item, update) => (
            <Input value={item} onChange={update} placeholder="어떤 학생에게 맞는 학교인가" />
          )}
        />
      </Block>
    </div>
  );
}

/* ── 조각들 ────────────────────────────────── */

function Block({
  en,
  ko,
  hint,
  tone,
  children,
}: {
  en: string;
  ko: string;
  hint?: string;
  tone: "fact" | "obs" | "view";
  children: React.ReactNode;
}) {
  const tag =
    tone === "fact"
      ? { text: "공시자료 · 읽기 전용", color: "var(--blue)" }
      : tone === "obs"
        ? { text: "옳은영어 관측", color: "var(--yellow)" }
        : { text: "옳은영어 견해", color: "var(--muted)" };
  return (
    <section style={{ marginBottom: 30 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1.5px solid var(--ink)",
          paddingBottom: 7,
          marginBottom: 12,
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
      {hint && (
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 12px" }}>{hint}</p>
      )}
      {children}
    </section>
  );
}

function RO({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null | undefined;
  unit: string;
}) {
  return (
    <div style={{ background: "var(--paper)", padding: "12px 14px" }}>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid var(--hair)",
  background: "var(--ground)",
  color: "var(--ink)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  lineHeight: 1.6,
};

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{ ...inputStyle, resize: "vertical" }}
    />
  );
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
  render: (item: T, update: (v: T) => void) => React.ReactNode;
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
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: "var(--yellow)",
                fontWeight: 500,
                paddingTop: 11,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          )}
          <div>{render(item, (v) => update(i, v))}</div>
          <div style={{ display: "flex", gap: 3, paddingTop: 6 }}>
            <IconBtn label="위로" onClick={() => move(i, -1)} disabled={i === 0}>
              ↑
            </IconBtn>
            <IconBtn label="아래로" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
              ↓
            </IconBtn>
            <IconBtn label="삭제" onClick={() => remove(i)} danger>
              ×
            </IconBtn>
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, make()])}
        style={{
          marginTop: 12,
          padding: "8px 14px",
          border: "1px dashed var(--hair)",
          background: "transparent",
          color: "var(--muted)",
          fontSize: 13,
          cursor: "pointer",
          width: "100%",
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  danger,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        width: 26,
        height: 26,
        border: "1px solid var(--hair)",
        background: "transparent",
        color: disabled ? "var(--hair)" : danger ? "var(--brick)" : "var(--muted)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 13,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}
