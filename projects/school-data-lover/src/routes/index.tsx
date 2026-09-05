import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "학원별 입시 분석 · 학교알리미 연동" },
      {
        name: "description",
        content:
          "옳은영어(동작구 고교) · 브래니악(송파구 중학교) 입시 분석을 학교알리미·NEIS 최근 3개년 데이터로 자동 갱신합니다.",
      },
    ],
  }),
  component: Home,
});

const cards = [
  {
    to: "/orun-dongjak",
    title: "옳은영어 · 중학교",
    en: "ORUN ENGLISH · MIDDLE",
    region: "서울 동작구 · 중학교 8개교",
    accent: "#C8962E",
    bg: "linear-gradient(135deg,#0B1A2A,#102B42)",
    desc: "동작구 주요 8개 중학교의 학업성취도·5개년 A등급·특목고 진학 분석",
  },
  {
    to: "/orun-dongjak-high",
    title: "옳은영어 · 고등학교",
    en: "ORUN ENGLISH · HIGH",
    region: "서울 동작구 · 고등학교 7개교",
    accent: "#E4C277",
    bg: "linear-gradient(135deg,#102B42,#1B4068)",
    desc: "동작구 인근 주요 7개 고등학교 학업성취도·일반대학 진학 실적 분석",
  },
  {
    to: "/brainiac-songpa",
    title: "브래니악 · 중학교",
    en: "BRAINIAC · MIDDLE",
    region: "서울 송파구 · 중학교 7개교",
    accent: "#E8861E",
    bg: "linear-gradient(135deg,#0F2742,#1C3E63)",
    desc: "송파구 주요 7개 중학교의 학업성취도·5개년 A등급·특목고 진학 추이 분석",
  },
  {
    to: "/brainiac-songpa-high",
    title: "브래니악 · 고등학교",
    en: "BRAINIAC · HIGH",
    region: "서울 송파구 · 고등학교 7개교",
    accent: "#F4B85A",
    bg: "linear-gradient(135deg,#1C3E63,#2A5A8C)",
    desc: "송파구 주요 7개 고등학교의 학업성취도·일반대학 진학 실적 분석",
  },
] as const;

function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#E7E0D2",
        fontFamily:
          "'Noto Sans KR','Noto Sans',-apple-system,system-ui,sans-serif",
        color: "#16212B",
      }}
    >
      <header
        style={{
          padding: "28px 32px",
          background: "#0B1A2A",
          color: "#fff",
          borderBottom: "2px solid #C8962E",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              color: "#E4C277",
              fontWeight: 700,
            }}
          >
            ACADEMY ADMISSIONS HUB
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              margin: "6px 0 0",
              letterSpacing: -0.3,
            }}
          >
            학원별 입시 분석 대시보드
          </h1>
        </div>
        <div style={{ fontSize: 12, color: "#9fb0c0", textAlign: "right" }}>
          학교알리미 · NEIS Open API 연동
          <br />
          <span style={{ opacity: 0.7 }}>최근 3개년 자동 수집</span>
        </div>
      </header>

      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "60px 24px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 36,
              height: 2,
              background: "#C8962E",
              display: "block",
            }}
          />
          <span
            style={{
              letterSpacing: 4,
              fontSize: 12,
              fontWeight: 800,
              color: "#C8962E",
            }}
          >
            SELECT ACADEMY
          </span>
        </div>
        <h2
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: -0.5,
            color: "#0B1A2A",
            marginBottom: 30,
            lineHeight: 1.2,
          }}
        >
          분석 자료를 열어볼 <em style={{ color: "#C8962E", fontStyle: "normal" }}>학원</em>을 선택하세요
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
            gap: 22,
          }}
        >
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              style={{
                textDecoration: "none",
                color: "#fff",
                background: c.bg,
                borderRadius: 16,
                padding: "30px 28px",
                minHeight: 220,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow:
                  "0 22px 50px -22px rgba(11,26,42,.55),0 2px 8px rgba(0,0,0,.08)",
                borderTop: `3px solid ${c.accent}`,
                transition: "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 3,
                    color: c.accent,
                    fontWeight: 800,
                  }}
                >
                  {c.en}
                </div>
                <h3
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    margin: "10px 0 6px",
                    letterSpacing: -0.5,
                  }}
                >
                  {c.title}
                </h3>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>
                  {c.region}
                </div>
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "rgba(255,255,255,.85)",
                  marginTop: 18,
                }}
              >
                {c.desc}
              </p>
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 240,
                  height: 240,
                  background: `radial-gradient(circle, ${c.accent}33, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  marginTop: 18,
                  fontWeight: 700,
                  fontSize: 13,
                  color: c.accent,
                  letterSpacing: 1,
                }}
              >
                열기 →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
