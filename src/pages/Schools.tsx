import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/orun.css";
import { Character, Icon, Scene } from "@/components/schools/Art";
import { SchoolPicker } from "@/components/schools/SchoolPicker";
import { AnalysisReport } from "@/components/schools/AnalysisReport";
import { GradeCalculator } from "@/components/schools/GradeCalculator";
import { ObservationEditor } from "@/components/schools/ObservationEditor";
import { BackupPanel } from "@/components/schools/BackupPanel";
import { allSchools, getRecords } from "@/lib/schools/data";
import { useObservations } from "@/lib/schools/store";
import { useAchievements } from "@/lib/schools/achievementStore";
import { AchievementImport } from "@/components/schools/AchievementImport";
import { NEWS } from "@/data/news";
import { SOURCED } from "@/data/sourced";
import { APP } from "@/lib/schools/copy";
import type { IconName } from "@/assets/art";

type Tab = "pick" | "report" | "calc" | "edit";
type Theme = "light" | "dark";

const STORAGE_KEY = "orun.schools.selected";
const THEME_KEY = "orun.theme";

const Schools = () => {
  const [tab, setTab] = useState<Tab>("pick");
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* 저장 실패는 무시 */
    }
  }, [theme]);

  const setAndStore = (codes: string[]) => {
    setSelected(codes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    } catch {
      /* 저장 실패는 무시 — 화면은 그대로 동작한다 */
    }
  };

  // 관측 입력이 바뀌면 분석지도 같이 갱신된다
  const observations = useObservations();
  const achievements = useAchievements();
  // observations 는 store 가 바뀔 때만 새 객체가 온다. 그때 분석지를 다시 만든다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const records = useMemo(() => getRecords(selected), [selected, observations, achievements]);

  const go = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="orun" data-theme={theme} style={{ minHeight: "100vh", background: "var(--ground)", color: "var(--body)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 90px" }}>
        <TopBar
          tab={tab}
          setTab={go}
          count={selected.length}
          theme={theme}
          onTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />

        {tab === "pick" && (
          <>
            <Hero />
            <SchoolPicker selected={selected} onChange={setAndStore} onBuild={() => go("report")} />
          </>
        )}

        {tab === "report" &&
          (records.length ? (
            <AnalysisReport records={records} onBack={() => go("pick")} />
          ) : (
            <Empty onBack={() => go("pick")} />
          ))}

        {tab === "edit" && (
          <section className="orun-rise" style={{ paddingTop: 30 }}>
            <ObservationEditor />
            <AchievementImport selected={selected} />
            <BackupPanel />
          </section>
        )}

        {tab === "calc" && (
          <section className="orun-rise" style={{ paddingTop: 30 }}>
            <div className="orun-hero" style={{ padding: "0 0 26px" }}>
              <div>
                <div className="orun-eyebrow" style={{ marginBottom: 12 }}>
                  {APP.calc.en}
                </div>
                <h2 className="orun-display" style={{ fontSize: 34, marginBottom: 10 }}>
                  {APP.calc.title}
                </h2>
                <p className="orun-lede">{APP.calc.lede}</p>
              </div>
              <Scene name="fraction" className="orun-hero__art" style={{ maxWidth: 300 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 20, alignItems: "end" }}>
              <GradeCalculator />
              <Character name="teacher" height={150} className="orun-no-print" style={{ marginBottom: 20 }} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

/* ── 상단 바 ─────────────────────────────── */

function TopBar({
  tab,
  setTab,
  count,
  theme,
  onTheme,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  count: number;
  theme: Theme;
  onTheme: () => void;
}) {
  const tabs: { id: Tab; label: string; icon: IconName; needsSelection?: boolean }[] = [
    { id: "pick", label: APP.tabs.pick, icon: "school" },
    { id: "report", label: APP.tabs.report, icon: "paper", needsSelection: true },
    { id: "calc", label: APP.tabs.calc, icon: "calc" },
    { id: "edit", label: APP.tabs.edit, icon: "edit" },
  ];

  return (
    <header className="orun-topbar orun-no-print">
      <span className="orun-brand">{APP.brand}</span>

      <nav className="orun-seg" aria-label="화면" style={{ marginLeft: 8 }}>
        {tabs.map((t) => {
          const on = tab === t.id;
          const off = t.needsSelection && count === 0;
          return (
            <button
              key={t.id}
              className="orun-seg__btn"
              aria-pressed={on}
              disabled={off}
              onClick={() => !off && setTab(t.id)}
              title={off ? APP.empty.text : undefined}
            >
              <Icon name={t.icon} size={15} />
              {t.label}
              {t.id === "report" && count > 0 && <span className="orun-seg__n">{count}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <button
          className="orun-btn orun-btn--sm orun-btn--icon"
          onClick={onTheme}
          aria-label={theme === "dark" ? APP.theme.toLight : APP.theme.toDark}
          title={theme === "dark" ? APP.theme.toLight : APP.theme.toDark}
        >
          <Icon name={theme === "dark" ? "lamp" : "moon"} size={16} />
        </button>
        <Link to="/" className="orun-btn orun-btn--sm" style={{ textDecoration: "none" }}>
          {APP.generatorLink}
          <Icon name="arrowRight" size={14} />
        </Link>
      </div>
    </header>
  );
}

/* ── 첫 화면 ─────────────────────────────── */

function Hero() {
  const total = allSchools().length;
  const seen = Object.keys(SOURCED).length;
  const news = Object.keys(NEWS).length;
  return (
    <>
      <section className="orun-hero orun-rise">
        <div>
          <div className="orun-eyebrow" style={{ marginBottom: 14 }}>
            {APP.eyebrow}
          </div>
          <h1 className="orun-display" style={{ fontSize: "clamp(30px, 4.2vw, 44px)", marginBottom: 14 }}>
            {APP.title}
          </h1>
          <p className="orun-lede">{APP.lede}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
            <span className="orun-chip orun-chip--yellow">{APP.stats.fact(total)}</span>
            <span className="orun-chip orun-chip--blue">{APP.stats.seen(seen)}</span>
            <span className="orun-chip orun-chip--mint">{APP.stats.news(news)}</span>
          </div>
        </div>
        <Scene name="hero" className="orun-hero__art orun-bob" />
      </section>

      <div className="orun-steps orun-rise" data-delay="1">
        {APP.steps.map((s, i) => (
          <div key={s.title}>
            <span className={`orun-blob ${["", "orun-blob--sky", "orun-blob--mint"][i]}`}>
              <Icon name={s.icon} size={18} style={{ color: "var(--on-pastel)" }} />
            </span>
            <div>
              <b>{s.title}</b>
              <span>{s.text}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Empty({ onBack }: { onBack: () => void }) {
  return (
    <div className="orun-rise" style={{ padding: "70px 0", textAlign: "center" }}>
      <Scene name="empty" width={260} style={{ margin: "0 auto 18px" }} />
      <p className="orun-lede" style={{ margin: "0 auto 18px" }}>
        {APP.empty.text}
      </p>
      <button className="orun-btn orun-btn--primary" onClick={onBack}>
        {APP.empty.cta}
        <Icon name="arrowRight" size={15} />
      </button>
    </div>
  );
}

export default Schools;
