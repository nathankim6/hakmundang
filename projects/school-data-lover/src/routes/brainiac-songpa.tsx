import { createFileRoute, Link } from "@tanstack/react-router";


const SCHOOLS = [
  "오륜중학교",
  "잠실중학교",
  "잠신중학교",
  "신천중학교",
  "가원중학교",
  "보성중학교",
  "정신여자중학교",
];

export const Route = createFileRoute("/brainiac-songpa")({
  head: () => ({
    meta: [
      { title: "브래니악 영어학원 · 송파구 중학교 분석" },
      {
        name: "description",
        content:
          "송파구 주요 7개 중학교의 학업성취도·특목고 진학 실적을 NEIS·학교알리미 최근 3개년 데이터로 분석합니다.",
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
        src="/brainiac-songpa.html"
        title="브래니악 영어학원 송파구 중학교 분석"
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
        background: "#0F2742",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        borderBottom: "2px solid #E8861E",
        fontFamily:
          "'Noto Sans KR','Noto Sans',-apple-system,system-ui,sans-serif",
      }}
    >
      <Link
        to="/"
        style={{
          color: "#F4B85A",
          textDecoration: "none",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        ← 학원 선택
      </Link>
      <div style={{ fontSize: 13, color: "#9fb0c0" }}>
        브래니악 · 송파구 중학교 · NEIS 연동
      </div>
    </div>
  );
}
