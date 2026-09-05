import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, School, GraduationCap, ChevronRight } from "lucide-react";
import orunLogoAsset from "@/assets/orun-logo.png.asset.json";

const orunLogo = orunLogoAsset.url;

const SchoolTypeSelector: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    {
      type: "middle",
      title: "중학교",
      sub: "중1 · 중2 · 중3 내신 분석 리포트",
      icon: School,
    },
    {
      type: "high",
      title: "고등학교",
      sub: "고등부 내신 · 모의고사 분석 리포트",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="orun-stage" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div className="mx-auto w-full max-w-[720px] px-5 pt-8 pb-16 sm:px-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-900/10 bg-white/80 px-4 text-[14px] font-bold text-slate-600 backdrop-blur-md transition-all hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </button>
          <img src={orunLogo} alt="옳은영어 로고" className="h-10 w-10 rounded-full bg-white object-contain p-1 shadow-[0_6px_20px_rgba(0,0,0,0.3)]" />
        </div>

        <div className="mt-10">
          <span className="orun-chip">STEP 1 · SCHOOL TYPE</span>
          <h1 className="mt-4 text-[28px] font-extrabold leading-[1.32] tracking-[-0.03em] break-keep text-slate-900 md:text-[36px]">
            어떤 학교의 리포트를
            <br />
            작성할까요?
          </h1>
          <p className="mt-3 text-[15px] font-medium leading-[1.7] text-slate-500 break-keep">
            학교 유형을 선택하면 맞춤 입력 폼이 준비됩니다.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.type}
                type="button"
                onClick={() => navigate(`/create-report/${c.type}`)}
                className="orun-glass orun-glass-hover group flex items-center gap-4 p-6 text-left transition-all"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-900/10 bg-slate-900/5">
                  <Icon className="h-6 w-6 text-[#F5C64F]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[19px] font-bold tracking-[-0.02em] text-slate-900">{c.title}</p>
                  <p className="mt-1 text-[14px] font-medium text-slate-500 break-keep">
                    {c.sub}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#F5C64F]" />
              </button>
            );
          })}
        </div>

        <p className="mt-10 text-[13px] font-medium text-slate-400">
          선택한 유형은 이후 단계에서 변경할 수 있어요.
        </p>
      </div>
    </div>
  );
};

export default SchoolTypeSelector;
