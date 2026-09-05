import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "옳은영어 어원/접사 미니북" },
      { name: "description", content: "단어를 외우지 말고 분해하라 — 어근·접사 미니북" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/minibook.html"
      title="옳은영어 어원/접사 미니북"
      style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
    />
  );
}
