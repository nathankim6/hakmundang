import { useState } from "react";
import { gradeSeats, seatsForGrade1, smallClassWarning } from "@/lib/schools/metrics";

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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 1,
          background: "var(--hair)",
          border: "1px solid var(--hair)",
        }}
      >
        <Pane
          eyebrow="Common subject"
          title="공통과목"
          hint="1학년 공통과목은 학년 전체가 수강합니다. 분모는 학년 정원입니다."
          placeholder="학년 정원"
          value={common}
          onChange={setCommon}
        />
        <Pane
          eyebrow="Elective subject"
          title="선택과목"
          hint="2·3학년 선택과목은 그 과목을 고른 학생만 경쟁합니다. 분모는 수강자 수입니다."
          placeholder="예상 수강자 수"
          value={elective}
          onChange={setElective}
          accent
        />
      </div>

      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 14 }}>
        2025학년도 고1부터 5등급제입니다. 1등급 10% · 2등급 누적 34% · 3등급 66% · 4등급 90%.
      </p>
    </div>
  );
}

function Pane({
  eyebrow,
  title,
  hint,
  placeholder,
  value,
  onChange,
  accent,
}: {
  eyebrow: string;
  title: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  accent?: boolean;
}) {
  const n = Number(value) || 0;
  const seats = seatsForGrade1(n);
  const warn = smallClassWarning(n);
  const bands = gradeSeats(n);

  return (
    <div style={{ background: "var(--ground)", padding: "22px 22px 20px" }}>
      <div className="orun-eyebrow" style={{ marginBottom: 10 }}>
        {eyebrow}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
        {title}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 14px", lineHeight: 1.55 }}>
        {hint}
      </p>

      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `1px solid ${accent ? "var(--blue)" : "var(--hair)"}`,
          background: "var(--ground)",
          color: "var(--ink)",
          fontSize: 15,
          fontFamily: "'IBM Plex Mono', monospace",
          outline: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "baseline", gap: 7, margin: "18px 0 4px" }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>1등급</span>
        <span
          className="orun-stat"
          style={{ fontSize: 38, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}
        >
          {n ? seats : "—"}
        </span>
        <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 700 }}>명</span>
      </div>

      {warn && (
        <div
          style={{
            background: "var(--brick-soft)",
            borderLeft: "2px solid var(--brick)",
            padding: "9px 12px",
            fontSize: 12.5,
            color: "var(--brick)",
            marginTop: 10,
          }}
        >
          {warn}
        </div>
      )}

      {bands.length > 0 && (
        <table className="orun-table" style={{ marginTop: 16, fontSize: 12.5 }}>
          <thead>
            <tr>
              <th>등급</th>
              <th className="num">인원</th>
              <th className="num">누적</th>
            </tr>
          </thead>
          <tbody>
            {bands.map((b) => (
              <tr key={b.grade}>
                <td style={{ color: b.grade === 1 ? "var(--ink)" : "var(--body)", fontWeight: b.grade === 1 ? 700 : 400 }}>
                  {b.grade}등급
                </td>
                <td className="num" style={{ fontWeight: b.grade === 1 ? 700 : 400 }}>
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
