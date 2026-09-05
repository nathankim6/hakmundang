import { useMemo, useState } from "react";
import { GROUP_LABEL, type SchoolFact, type SchoolGroup } from "@/types/school";
import { groupsWithCounts, hasAchievement, hasObservation, schoolsInGroups } from "@/lib/schools/data";
import { SOURCED } from "@/data/sourced";
import { getNews } from "@/data/news";
import { PICKER } from "@/lib/schools/copy";
import { Icon } from "@/components/schools/Art";

interface Props {
  selected: string[];
  onChange: (codes: string[]) => void;
  onBuild: () => void;
}

/** 이 학교에 대해 우리가 가진 것 */
function layers(code: string) {
  return {
    obs: hasObservation(code),
    deep: Boolean(SOURCED[code]),
    news: Boolean(getNews(code)),
    ach: hasAchievement(code),
  };
}
const hasAny = (code: string) => {
  const l = layers(code);
  return l.obs || l.deep || l.news || l.ach;
};

export function SchoolPicker({ selected, onChange, onBuild }: Props) {
  const groups = useMemo(() => groupsWithCounts(), []);
  const [active, setActive] = useState<SchoolGroup[]>(["동작구_고", "관악구_고"]);
  const [query, setQuery] = useState("");
  const [richOnly, setRichOnly] = useState(false);

  const visible = useMemo(() => {
    let list = schoolsInGroups(active);
    if (richOnly) list = list.filter((s) => hasAny(s.code));
    if (query.trim()) {
      const q = query.trim();
      list = list.filter((s) => s.name.includes(q) || (s.district ?? "").includes(q));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [active, query, richOnly]);

  const selectedSet = new Set(selected);
  const deepSelected = selected.filter((c) => {
    const l = layers(c);
    return l.obs || l.deep;
  }).length;

  const toggleGroup = (g: SchoolGroup) =>
    setActive((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const toggleSchool = (code: string) =>
    onChange(selectedSet.has(code) ? selected.filter((c) => c !== code) : [...selected, code]);

  const allVisibleSelected = visible.length > 0 && visible.every((s) => selectedSet.has(s.code));

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      const codes = new Set(visible.map((s) => s.code));
      onChange(selected.filter((c) => !codes.has(c)));
    } else {
      onChange([...new Set([...selected, ...visible.map((s) => s.code)])]);
    }
  };

  return (
    <div className="orun orun-rise" data-delay="2" style={{ background: "transparent" }}>
      {/* 머리 */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div className="orun-eyebrow" style={{ marginBottom: 10 }}>
            {PICKER.en}
          </div>
          <h2 className="orun-h2">{PICKER.title}</h2>
          <p className="orun-lede" style={{ fontSize: 14, marginTop: 6 }}>
            {PICKER.hint}
          </p>
        </div>
      </div>

      {/* 범위 */}
      <div className="orun-pills" style={{ marginBottom: 18 }}>
        {groups.map(({ group, count }) => (
          <button key={group} className="orun-pill" aria-pressed={active.includes(group)} onClick={() => toggleGroup(group)}>
            {GROUP_LABEL[group]}
            <span className="orun-pill__n">{count}</span>
          </button>
        ))}
      </div>

      {/* 검색 · 필터 */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", paddingBottom: 14, marginBottom: 14, borderBottom: "1.5px solid var(--ink)" }}>
        <div className="orun-input-wrap">
          <Icon name="search" size={16} />
          <input className="orun-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={PICKER.search} aria-label={PICKER.search} />
        </div>
        <label className="orun-toggle">
          <input type="checkbox" checked={richOnly} onChange={(e) => setRichOnly(e.target.checked)} />
          {PICKER.filterSourced}
        </label>
        <button className="orun-btn orun-btn--sm" onClick={toggleAllVisible} disabled={visible.length === 0}>
          <Icon name={allVisibleSelected ? "x" : "checks"} size={14} />
          {allVisibleSelected ? PICKER.clearVisible : PICKER.selectAll}
        </button>
      </div>

      {/* 학교 카드 */}
      {visible.length === 0 ? (
        <p className="orun-lede" style={{ fontSize: 14, padding: "26px 0" }}>
          {PICKER.emptyGroup}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(232px, 1fr))", gap: 10, margin: "0 0 26px" }}>
          {visible.map((s) => (
            <SchoolCard key={s.code} school={s} checked={selectedSet.has(s.code)} onToggle={() => toggleSchool(s.code)} />
          ))}
        </div>
      )}

      {/* 하단 액션 */}
      <div className="orun-sticky-foot">
        <div style={{ fontSize: 13.5, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <strong style={{ color: "var(--ink)", fontSize: 15 }}>{PICKER.footer(selected.length)}</strong>
          {selected.length > 0 && (
            <span className="orun-small">{PICKER.footerDetail(deepSelected, selected.length - deepSelected)}</span>
          )}
        </div>
        <button className="orun-btn orun-btn--primary" onClick={onBuild} disabled={selected.length === 0}>
          {PICKER.cta}
          <Icon name="arrowRight" size={15} />
        </button>
      </div>
    </div>
  );
}

function SchoolCard({ school, checked, onToggle }: { school: SchoolFact; checked: boolean; onToggle: () => void }) {
  const l = layers(school.code);
  const meta = [school.district, school.foundation, school.coed].filter(Boolean).join(" · ");
  return (
    <button type="button" className="orun-pick" aria-pressed={checked} onClick={onToggle}>
      <span className="orun-pick__box" aria-hidden="true">
        <Icon name="check" size={13} stroke={2.6} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span className="orun-pick__name">{school.name}</span>
        <span className="orun-pick__meta" style={{ display: "block" }}>
          {meta}
        </span>
        <span className="orun-pick__foot">
          {l.obs && <span className="orun-chip orun-chip--yellow">{PICKER.badgeObs}</span>}
          {l.deep && <span className="orun-chip orun-chip--ink">{PICKER.badgeSourced}</span>}
          {l.ach && <span className="orun-chip orun-chip--blue">{PICKER.badgeAchieve}</span>}
          {l.news && !l.deep && <span className="orun-chip">{PICKER.badgeNews}</span>}
          <span className="orun-pick__num">{school.g1Total ? PICKER.g1(school.g1Total) : "—"}</span>
        </span>
      </span>
    </button>
  );
}
