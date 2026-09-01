import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/orun.css";
import { SchoolPicker } from "@/components/schools/SchoolPicker";
import { AnalysisReport } from "@/components/schools/AnalysisReport";
import { GradeCalculator } from "@/components/schools/GradeCalculator";
import { ObservationEditor } from "@/components/schools/ObservationEditor";
import { BackupPanel } from "@/components/schools/BackupPanel";
import { getRecords } from "@/lib/schools/data";
import { useObservations } from "@/lib/schools/store";

type Tab = "pick" | "report" | "calc" | "edit";

const STORAGE_KEY = "orun.schools.selected";

const Schools = () => {
  const [tab, setTab] = useState<Tab>("pick");
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

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
  const records = useMemo(() => getRecords(selected), [selected, observations]);

  return (
    <div
      className="orun"
      style={{ minHeight: "100vh", background: "var(--ground)", color: "var(--body)" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 90px" }}>
        <Header tab={tab} setTab={setTab} disabled={selected.length === 0} />

        {tab === "pick" && (
          <SchoolPicker
            selected={selected}
            onChange={setAndStore}
            onBuild={() => setTab("report")}
          />
        )}

        {tab === "report" &&
          (records.length ? (
            <AnalysisReport records={records} onBack={() => setTab("pick")} />
          ) : (
            <Empty onBack={() => setTab("pick")} />
          ))}

        {tab === "edit" && (
          <section style={{ paddingTop: 8 }}>
            <ObservationEditor />
            <BackupPanel />
          </section>
        )}

        {tab === "calc" && (
          <section style={{ paddingTop: 8 }}>
            <div className="orun-eyebrow" style={{ marginBottom: 12 }}>
              Grade seats · 라이브 시연용
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
              1등급은 몇 자리입니까
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: "62ch", margin: "0 0 26px" }}>
              설명회에서 학부모님 앞에 직접 숫자를 넣어 보여주는 화면입니다. 공통과목과 선택과목의
              분모가 다르다는 것을 눈으로 보여주는 것이 목적입니다.
            </p>
            <GradeCalculator />
          </section>
        )}
      </div>
    </div>
  );
};

function Header({
  tab,
  setTab,
  disabled,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  disabled: boolean;
}) {
  const tabs: { id: Tab; label: string; needsSelection?: boolean }[] = [
    { id: "pick", label: "학교 고르기" },
    { id: "report", label: "분석지", needsSelection: true },
    { id: "calc", label: "1등급 계산기" },
    { id: "edit", label: "관측 입력" },
  ];

  return (
    <header className="orun-no-print" style={{ padding: "40px 0 26px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 22,
        }}
      >
        <span style={{ width: 8, height: 8, background: "var(--yellow-hi)" }} />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10.5,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          ORUN ENGLISH · 학교 분석지
        </span>
        <Link
          to="/"
          style={{
            marginLeft: "auto",
            fontSize: 12.5,
            color: "var(--muted)",
            textDecoration: "none",
          }}
        >
          문항 생성기 →
        </Link>
      </div>

      <h1
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: "var(--ink)",
          margin: "0 0 10px",
          letterSpacing: "-.025em",
          lineHeight: 1.25,
        }}
      >
        고교 선택이 입시의 시작입니다
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: "60ch", margin: "0 0 26px" }}>
        분석할 학교를 고르면 설명회용 분석지가 만들어집니다. 공시자료는 자동으로 채워지고, 옳은영어가
        직접 본 내용이 그 위에 얹힙니다.
      </p>

      <nav
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1.5px solid var(--ink)",
        }}
      >
        {tabs.map((t) => {
          const on = tab === t.id;
          const off = t.needsSelection && disabled;
          return (
            <button
              key={t.id}
              onClick={() => !off && setTab(t.id)}
              disabled={off}
              style={{
                padding: "10px 20px",
                border: "none",
                borderBottom: on ? "2px solid var(--ink)" : "2px solid transparent",
                marginBottom: -1.5,
                background: "transparent",
                color: off ? "var(--hair)" : on ? "var(--ink)" : "var(--muted)",
                fontSize: 14,
                fontWeight: on ? 700 : 400,
                cursor: off ? "not-allowed" : "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

function Empty({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ padding: "60px 0", textAlign: "center" }}>
      <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 18 }}>
        아직 고른 학교가 없습니다.
      </p>
      <button
        onClick={onBack}
        style={{
          padding: "11px 24px",
          border: "none",
          background: "var(--ink)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        학교 고르러 가기
      </button>
    </div>
  );
}

export default Schools;
