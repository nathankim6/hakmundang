import { createFileRoute, Link } from "@tanstack/react-router";


const SCHOOLS = [
  "장승중학교",
  "상현중학교",
  "숭의여자중학교",
  "중대부속중학교",
  "동양중학교",
  "국사봉중학교",
  "성남중학교",
  "영등포중학교",
];

export const Route = createFileRoute("/orun-dongjak")({
  head: () => ({
    meta: [
      { title: "옳은영어 · 동작구 중학교 분석" },
      {
        name: "description",
        content:
          "동작구 주요 8개 중학교의 학업성취도·특목고 진학 실적을 학교알리미·apt2.me 데이터로 분석합니다.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div style={{ background: "#E7E0D2", minHeight: "100vh" }}>
      <TopBar />
      <iframe
        src="/orun-dongjak.html"
        title="옳은영어 동작구 고교 입시 분석"
        style={{
          width: "100%",
          height: "calc(100vh - 56px)",
          border: 0,
          display: "block",
          background: "#E7E0D2",
        }}
      />
    </div>
  );
}

function TopBar() {
  return (
    <div
      style={{
        height: 56,
        background: "#0B1A2A",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        borderBottom: "2px solid #C8962E",
        fontFamily:
          "'Noto Sans KR','Noto Sans',-apple-system,system-ui,sans-serif",
      }}
    >
      <Link
        to="/"
        style={{
          color: "#E4C277",
          textDecoration: "none",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        ← 학원 선택
      </Link>
      <div style={{ fontSize: 13, color: "#9fb0c0" }}>
        옳은영어 · 동작구 중학교 · NEIS 연동
      </div>
    </div>
  );
}
