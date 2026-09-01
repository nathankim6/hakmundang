import { useMemo, useState } from "react";
import { GROUP_LABEL, type SchoolFact, type SchoolGroup } from "@/types/school";
import { groupsWithCounts, hasObservation, schoolsInGroups } from "@/lib/schools/data";

interface Props {
  selected: string[];
  onChange: (codes: string[]) => void;
  onBuild: () => void;
}

export function SchoolPicker({ selected, onChange, onBuild }: Props) {
  const groups = useMemo(() => groupsWithCounts(), []);
  const [active, setActive] = useState<SchoolGroup[]>(["동작구_고", "관악구_고"]);
  const [query, setQuery] = useState("");
  const [observedOnly, setObservedOnly] = useState(false);

  const visible = useMemo(() => {
    let list = schoolsInGroups(active);
    if (observedOnly) list = list.filter((s) => hasObservation(s.code));
    if (query.trim()) {
      const q = query.trim();
      list = list.filter((s) => s.name.includes(q) || (s.district ?? "").includes(q));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [active, query, observedOnly]);

  const selectedSet = new Set(selected);
  const observedSelected = selected.filter(hasObservation).length;

  const toggleGroup = (g: SchoolGroup) =>
    setActive((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const toggleSchool = (code: string) =>
    onChange(selectedSet.has(code) ? selected.filter((c) => c !== code) : [...selected, code]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((s) => selectedSet.has(s.code));

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      const codes = new Set(visible.map((s) => s.code));
      onChange(selected.filter((c) => !codes.has(c)));
    } else {
      onChange([...new Set([...selected, ...visible.map((s) => s.code)])]);
    }
  };

  return (
    <div className="orun" style={{ background: "transparent" }}>
      {/* 카테고리 */}
      <div style={{ marginBottom: 30 }}>
        <div className="orun-eyebrow" style={{ marginBottom: 14 }}>
          Category · 분석 범위
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {groups.map(({ group, count }) => {
            const on = active.includes(group);
            return (
              <button
                key={group}
                onClick={() => toggleGroup(group)}
                aria-pressed={on}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 15px",
                  border: `1px solid ${on ? "var(--ink)" : "var(--hair)"}`,
                  background: on ? "var(--ink)" : "transparent",
                  color: on ? "#fff" : "var(--body)",
                  fontSize: 13.5,
                  fontWeight: on ? 700 : 400,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {GROUP_LABEL[group]}
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: on ? "var(--yellow-hi)" : "var(--muted)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 검색 · 필터 */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          paddingBottom: 12,
          borderBottom: "1.5px solid var(--ink)",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="학교명 검색"
          style={{
            flex: "1 1 200px",
            padding: "8px 12px",
            border: "1px solid var(--hair)",
            background: "var(--ground)",
            color: "var(--ink)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            cursor: "pointer",
            color: "var(--body)",
          }}
        >
          <input
            type="checkbox"
            checked={observedOnly}
            onChange={(e) => setObservedOnly(e.target.checked)}
          />
          분석 자료 있는 학교만
        </label>
        <button
          onClick={toggleAllVisible}
          style={{
            padding: "8px 14px",
            border: "1px solid var(--hair)",
            background: "transparent",
            color: "var(--body)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {allVisibleSelected ? "전체 해제" : "보이는 학교 전체 선택"}
        </button>
      </div>

      {/* 학교 목록 */}
      <div style={{ margin: "4px 0 28px" }}>
        {visible.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: 14, padding: "22px 0" }}>
            선택한 범위에 해당하는 학교가 없습니다. 위에서 카테고리를 하나 이상 골라 주세요.
          </p>
        )}
        {visible.map((s) => (
          <SchoolRow
            key={s.code}
            school={s}
            checked={selectedSet.has(s.code)}
            onToggle={() => toggleSchool(s.code)}
          />
        ))}
      </div>

      {/* 하단 액션 */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--ground)",
          borderTop: "1.5px solid var(--ink)",
          padding: "16px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 13.5 }}>
          <strong style={{ color: "var(--ink)" }}>{selected.length}개교</strong> 선택
          {selected.length > 0 && (
            <span style={{ color: "var(--muted)" }}>
              {" · "}상세 분석 {observedSelected}개교 · 요약만 {selected.length - observedSelected}개교
            </span>
          )}
        </div>
        <button
          onClick={onBuild}
          disabled={selected.length === 0}
          style={{
            padding: "12px 26px",
            border: "none",
            background: selected.length ? "var(--ink)" : "var(--hair)",
            color: selected.length ? "#fff" : "var(--muted)",
            fontSize: 14,
            fontWeight: 700,
            cursor: selected.length ? "pointer" : "not-allowed",
            letterSpacing: "-.01em",
          }}
        >
          분석지 만들기 →
        </button>
      </div>
    </div>
  );
}

function SchoolRow({
  school,
  checked,
  onToggle,
}: {
  school: SchoolFact;
  checked: boolean;
  onToggle: () => void;
}) {
  const observed = hasObservation(school.code);
  return (
    <label
      style={{
        display: "grid",
        gridTemplateColumns: "26px 1fr auto",
        gap: 12,
        alignItems: "center",
        padding: "11px 0",
        borderBottom: "1px solid var(--hair)",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 14.5 }}>
            {school.name}
          </span>
          {observed && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9.5,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--yellow)",
                border: "1px solid currentColor",
                padding: "1px 6px",
              }}
            >
              옳은영어 분석
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
          {[school.district, school.foundation, school.kind, school.coed]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
      <div
        className="orun-stat"
        style={{ fontSize: 12.5, color: "var(--muted)", textAlign: "right" }}
      >
        {school.g1Total ? `1학년 ${school.g1Total}명` : "—"}
      </div>
    </label>
  );
}
