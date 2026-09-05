import { useState } from "react";
import { gradeSeats, seatsForGrade1, smallClassWarning } from "@/lib/schools/metrics";
import { CALC } from "@/lib/schools/copy";
import { Icon } from "@/components/schools/Art";

/**
 * 1등급 자리 계산기.
 *
 * 입력칸을 두 개로 물리적으로 쪼갠다.
 * 석차등급은 학년 정원이 아니라 과목별 수강자 수 기준이라,
 * 한 칸짜리 계산기는 학부모를 반드시 오해시킨다.
 */
export function GradeCalculator({ defaultCommon }: { defaultCommon?: number }) {
  const [common, setCommon] = useState<string>(defaultCommon ? String(defaultCommon) : "");
  const [elective, setElective] = useState<string>("");

  return (
    <div className="orun" style={{ background: "transparent" }}>
      <div className="orun-grid-hair" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
        <Pane {...CALC.common} icon="family" value={common} onChange={setCommon} />
        <Pane {...CALC.elective} icon="divide" value={elective} onChange={setElective} accent />
      </div>

      <p className="orun-small" style={{ marginTop: 14 }}>
        {CALC.foot}
      </p>
    </div>
  );
}

function Pane({
  en,
  title,
  hint,
  placeholder,
  icon,
  value,
  onChange,
  accent,
}: {
  en: string;
  title: string;
  hint: string;
  placeholder: string;
  icon: "family" | "divide";
  value: string;
  onChange: (v: string) => void;
  accent?: boolean;
}) {
  const n = Number(value) || 0;
  const seats = seatsForGrade1(n);
  const warn = smallClassWarning(n);
  const bands = gradeSeats(n);

  return (
    <div style={{ padding: "22px 22px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div className="orun-eyebrow">{en}</div>
        <Icon name={icon} size={20} style={{ color: accent ? "var(--blue)" : "var(--ink)" }} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{title}</div>
      <p className="orun-small" style={{ margin: "0 0 14px", lineHeight: 1.55 }}>
        {hint}
      </p>

      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="orun-input orun-mono"
        style={{ paddingLeft: 12, fontSize: 16, borderColor: accent ? "var(--blue)" : undefined }}
      />

      <div style={{ display: "flex", alignItems: "baseline", gap: 7, margin: "18px 0 4px" }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{CALC.seatsLabel}</span>
        <span className="orun-stat" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>
          {n ? seats : "—"}
        </span>
        <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 700 }}>{CALC.unit}</span>
      </div>

      {warn && (
        <div className="orun-callout orun-callout--warn" style={{ margin: "10px 0 0", padding: "10px 12px", fontSize: 12.5 }}>
          <Icon name="alert" size={16} style={{ color: "var(--brick)", marginTop: 2 }} />
          <div style={{ color: "var(--brick)" }}>{warn}</div>
        </div>
      )}

      {bands.length > 0 && (
        <table className="orun-table" style={{ marginTop: 16, fontSize: 12.5 }}>
          <thead>
            <tr>
              <th>{CALC.cols.grade}</th>
              <th className="num">{CALC.cols.seats}</th>
              <th className="num">{CALC.cols.cum}</th>
            </tr>
          </thead>
          <tbody>
            {bands.map((b) => (
              <tr key={b.grade}>
                <td style={{ color: b.grade === 1 ? "var(--ink)" : "var(--body)", fontWeight: b.grade === 1 ? 700 : 400 }}>{b.grade}등급</td>
                <td className="num" style={{ fontWeight: b.grade === 1 ? 700 : 400, color: b.grade === 1 ? "var(--ink)" : undefined }}>
                  {b.seats}
                </td>
                <td className="num" style={{ color: "var(--muted)" }}>
                  {b.cumulative}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
