import { createFileRoute } from "@tanstack/react-router";
import { ClinicApp } from "@/components/clinic/ClinicApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "주말클리닉 출석 관리" },
      { name: "description", content: "주차별 학교별 주말클리닉 출석 및 진도 관리 프로그램" },
      { property: "og:title", content: "주말클리닉 출석 관리" },
      { property: "og:description", content: "주차별 학교별 주말클리닉 출석 및 진도 관리" },
    ],
  }),
  component: Index,
});

function Index() {
  return <ClinicApp />;
}
