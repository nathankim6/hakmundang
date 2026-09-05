import React from "react";
import { useNavigate } from "react-router-dom";
import { SaveAll, Plus, ArrowRight } from "lucide-react";
import orunLogoAsset from "@/assets/orun-logo.png.asset.json";
import iconPreciseAnalysis from "@/assets/icons/icon-precise-analysis.png.asset.json";
import iconEasyWriting from "@/assets/icons/icon-easy-writing.png.asset.json";
import iconInstantShare from "@/assets/icons/icon-instant-share.png.asset.json";

const orunLogo = orunLogoAsset.url;

const Index: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      iconUrl: iconPreciseAnalysis.url,
       title: "자동화(Automation)",
       desc: "고급 추론 AI모델을 활용한 시험 자동 분석",
    },
    {
      iconUrl: iconEasyWriting.url,
       title: "정교함(Refinement)",
       desc: "직접 수정을 통한 분석의 정교함 강화 ",
    },
    {
      iconUrl: iconInstantShare.url,
       title: "개인화(Personalization)",
      desc: "링크 전달 한 번으로 학생 별 취약유형 파악",
    },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden text-[#1E293B]"
      style={{
        fontFamily: "'Noto Sans KR', sans-serif",
        background:
          "radial-gradient(900px 620px at 50% 26%, rgba(245, 198, 79, 0.18), transparent 62%)," +
          "radial-gradient(1200px 800px at 50% -10%, rgba(148, 178, 210, 0.25), transparent 60%)," +
          "linear-gradient(180deg, #F4F7FB 0%, #EDF1F7 45%, #E8EDF4 100%)",
      }}
    >
      {/* glass sheen overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(255,255,255,0.08), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1080px] px-5 sm:px-8">
        {/* Hero */}
        <section className="flex flex-col items-center pt-16 pb-12 text-center md:pt-24 md:pb-16">
          {/* Logo medallion */}
          <div
            className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white shadow-[0_18px_48px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.5)] md:h-[124px] md:w-[124px]"
          >
            <img
              src={orunLogo}
              alt="옳은영어 로고"
              className="h-[76px] w-[76px] object-contain md:h-[92px] md:w-[92px]"
            />
          </div>

          <span className="mt-9 inline-flex items-center rounded-full border border-slate-900/10 bg-slate-900/5 px-4 py-1.5 text-[12px] font-bold tracking-[0.18em] text-slate-600 backdrop-blur-md">
            ORUN ENGLISH
          </span>

          <h1
            className="orun-hero-title mt-6 text-[30px] font-black leading-[1.15] tracking-[0.02em] md:text-[48px]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            ORUN School
            <br />
            <span className="orun-hero-shimmer">Exam Analytics</span>
          </h1>

          <p className="mt-5 max-w-[520px] text-[15px] font-medium leading-[1.75] text-slate-500 break-keep md:text-[17px]">
             고급 AI추론 모델을 사용해 학교 기출 시험을 자동 분석합니다
          </p>

          <div className="mt-10 flex w-full max-w-[420px] flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/create-report")}
              className="group inline-flex h-[56px] items-center justify-center gap-2 rounded-2xl bg-[#F5C64F] px-8 text-[16px] font-bold text-[#2B3642] shadow-[0_12px_32px_rgba(245,198,79,0.28)] transition-all hover:bg-[#FFD666] active:scale-[0.98]"
            >
              <Plus className="h-[18px] w-[18px]" />
              새 리포트 작성
              <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => navigate("/saved-reports")}
              className="inline-flex h-[56px] items-center justify-center gap-2 rounded-2xl border border-slate-900/10 bg-slate-900/5 px-8 text-[16px] font-bold text-slate-700 backdrop-blur-md transition-all hover:bg-slate-900/10 active:scale-[0.98]"
            >
              <SaveAll className="h-[18px] w-[18px]" />
              저장된 리포트
            </button>
          </div>
        </section>

        {/* Features — glass cards */}
        <section className="grid grid-cols-1 gap-3 pb-6 md:grid-cols-3 md:gap-4">
          {features.map(({ iconUrl, title, desc }) => (
            <div
              key={title}
              className="rounded-3xl border border-slate-900/10 bg-white/80 p-7 shadow-[0_8px_32px_rgba(30,41,59,0.10)] backdrop-blur-xl transition-all hover:border-slate-900/15 hover:bg-white"
            >
              <img
                src={iconUrl}
                alt={title}
                loading="lazy"
                width={48}
                height={48}
                className="h-12 w-12 rounded-2xl object-contain shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
              />
              <h3 className="mt-5 text-[18px] font-bold tracking-[-0.02em] text-slate-900">{title}</h3>
              <p className="mt-2 whitespace-pre-line text-[14px] font-medium leading-[1.7] text-slate-500 break-keep">
                {desc}
              </p>
            </div>
          ))}
        </section>


        {/* Footer */}
        <footer className="border-t border-slate-900/10 py-8 text-center">
          <p className="text-[13px] font-bold tracking-[0.2em] text-slate-600">ORUN ENGLISH ACADEMY</p>
          <p className="mt-1.5 text-[13px] font-medium text-slate-400">
            Copyright © 2025 ORUN ENGLISH. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
