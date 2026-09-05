import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import orunLogo from "@/assets/orun-logo.jpg";
import iconAnalysisCreate from "@/assets/icons/icon-analysis-create.png";
import iconAnalysisDb from "@/assets/icons/icon-analysis-db.png";
import iconIntegrated from "@/assets/icons/icon-integrated.png";
import iconExamHigh from "@/assets/icons/icon-exam-high.png";
import iconExamMiddle from "@/assets/icons/icon-exam-middle.png";
import iconInternalReport from "@/assets/icons/icon-internal-report.png";

type MenuItem = {
  title: string;
  description: string;
  iconImage: string;
  cta: string;
  route?: string;
  options?: { label: string; route: string }[];
};

const Home = () => {
  const navigate = useNavigate();

  const create: MenuItem = {
    title: "학교분석자료 제작(설명회용)",
    description: "맞춤형 학교 분석 리포트를 제작하기 위해 지역을 선택하고 시작하세요.",
    iconImage: iconAnalysisCreate,
    cta: "지역 선택하기",
    options: [
      { label: "동작", route: "/create" },
      { label: "흑석", route: "/create-heukseok" },
      { label: "송파", route: "/create-songpa" },
    ],
  };

  const repository: MenuItem = {
    title: "분석자료 DB(설명회용)",
    description: "지역별 분석 히스토리",
    iconImage: iconAnalysisDb,
    cta: "지역 선택",
    options: [
      { label: "동작", route: "/repository" },
      { label: "흑석", route: "/repository-heukseok" },
      { label: "송파", route: "/repository-songpa" },
    ],
  };

  const integrated: MenuItem = {
    title: "지역학교 비교분석(설명회용)",
    description: "다중 학교 비교 분석",
    iconImage: iconIntegrated,
    cta: "바로가기",
    route: "/integrated-analysis",
  };

  const internalReport: MenuItem = {
    title: "내신분석 리포트(강사전용)",
    description: "개별 내신 분석 리포트",
    iconImage: iconInternalReport,
    cta: "바로가기",
    route: "/internal-report",
  };

  const examHigh: MenuItem = {
    title: "기출DB (고등)",
    description: "High School",
    iconImage: iconExamHigh,
    cta: "바로가기",
    route: "/exam-db-high",
  };

  const examMiddle: MenuItem = {
    title: "기출DB (중등)",
    description: "Middle School",
    iconImage: iconExamMiddle,
    cta: "바로가기",
    route: "/exam-db-middle",
  };

  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);

  const open = (item: MenuItem) => {
    if (item.options) setActiveMenu(item);
    else navigate(item.route!);
  };

  return (
    <div className="relative min-h-screen bg-glass-base text-glass-ink antialiased">
      {/* ambient light blooms */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="animate-pulse-glow absolute -right-24 top-1/3 h-[24rem] w-[24rem] rounded-full bg-glass-tint/70 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <Header />

      <main className="relative container mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-20">
        {/* Hero */}
        <header className="mb-14 flex flex-col items-center space-y-5 text-center md:mb-20">
          <div className="flex h-20 w-20 rotate-6 items-center justify-center overflow-hidden rounded-3xl border border-glass-edge bg-glass-panel shadow-[0_24px_60px_-20px_hsl(var(--glass-shadow))] backdrop-blur-xl">
            <img src={orunLogo} alt="Orun Academy 로고" className="h-full w-full object-cover" />
          </div>
          <div className="space-y-3">
            <h1 className="group relative font-orbitron text-4xl font-black uppercase tracking-[0.18em] md:text-6xl">
              <span className="orun-title animate-fade-in drop-shadow-[0_10px_30px_hsl(var(--glass-shadow))]">
                ORUN ANALYSIS
              </span>
              <span
                aria-hidden
                className="orun-title-glow pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 blur-3xl"
              />
              <span
                aria-hidden
                className="orun-title pointer-events-none absolute inset-0 select-none opacity-30 blur-[10px]"
              >
                ORUN ANALYSIS
              </span>
            </h1>
            <div className="orun-rule mx-auto h-px w-40 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <p className="font-orbitron text-[11px] font-medium uppercase tracking-[0.4em] text-glass-muted md:text-xs">
              옳은영어 학교분석 아카이브
            </p>

            <p className="text-sm text-glass-muted/80 md:text-base">
              3개년도 학교분석
              <span className="mx-2 opacity-40">·</span>
              기출 DB
              <span className="mx-2 opacity-40">·</span>
              내신 리포트 작성
            </p>
          </div>
        </header>

        {/* Bento grid */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3 md:auto-rows-[168px] lg:grid-cols-4">
          {/* Primary tile */}
          <button
            type="button"
            onClick={() => open(create)}
            className="group relative overflow-hidden rounded-[2.5rem] border border-glass-edge bg-glass-panel p-8 text-left shadow-[0_30px_70px_-30px_hsl(var(--glass-shadow))] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 md:col-span-2 md:row-span-2"
          >
            <div className="absolute -bottom-10 -right-10 h-52 w-52 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:bg-primary/20" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-glass-edge bg-glass-tint/60 transition-transform duration-500 group-hover:scale-105">
                <img src={create.iconImage} alt="" className="h-14 w-14 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{create.title}</h2>
                <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-glass-muted">
                  {create.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-bold text-primary transition-transform duration-300 group-hover:translate-x-1.5">
                  {create.cta} <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </div>
          </button>

          {/* Two square tiles */}
          {[repository, integrated].map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => open(item)}
              className="group relative overflow-hidden rounded-[2rem] border border-glass-edge bg-glass-panel p-6 text-left shadow-[0_20px_50px_-28px_hsl(var(--glass-shadow))] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 md:col-span-1 md:row-span-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-glass-edge bg-glass-tint/60 transition-transform duration-500 group-hover:scale-105">
                <img src={item.iconImage} alt="" className="h-10 w-10 object-contain" />
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
                <p className="mt-1 text-sm text-glass-muted">{item.description}</p>
              </div>
              <ChevronRight className="absolute right-6 top-6 h-4 w-4 text-glass-muted opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
            </button>
          ))}

          {/* Accent wide tile */}
          <button
            type="button"
            onClick={() => open(internalReport)}
            className="group relative flex items-center justify-between overflow-hidden rounded-[2rem] bg-primary p-6 text-left shadow-[0_24px_60px_-24px_hsl(var(--primary)/0.5)] transition-all duration-500 hover:-translate-y-1 md:col-span-2 md:row-span-1"
          >
            <div className="absolute -mr-10 -mt-10 right-0 top-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-2xl" />
            <div className="relative flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/20 backdrop-blur-md">
                <img src={internalReport.iconImage} alt="" className="h-11 w-11 object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-foreground">{internalReport.title}</h3>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  학교별 문항 심층 분석 및 내신 리포트 작성
                </p>
              </div>
            </div>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" />
            </span>
          </button>

          {/* Small tiles */}
          {[examHigh, examMiddle].map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => open(item)}
              className="group relative overflow-hidden rounded-[2rem] border border-glass-edge bg-glass-panel p-6 text-left shadow-[0_20px_50px_-28px_hsl(var(--glass-shadow))] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 md:col-span-1 lg:col-span-2 md:row-span-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-glass-edge bg-glass-tint/60 transition-transform duration-500 group-hover:scale-105">
                <img src={item.iconImage} alt="" className="h-8 w-8 object-contain" />
              </div>
              <h3 className="text-base font-bold tracking-tight">{item.title}</h3>
              <p className="mt-1 text-xs italic text-glass-muted">{item.description}</p>
            </button>
          ))}
        </section>

        <Dialog open={!!activeMenu} onOpenChange={(o) => !o && setActiveMenu(null)}>
          <DialogContent className="max-w-sm rounded-[2rem] border border-glass-edge bg-glass-panel shadow-[0_40px_90px_-30px_hsl(var(--glass-shadow))] backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-glass-ink">
                {activeMenu?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 pt-2">
              {activeMenu?.options?.map((option) => (
                <button
                  key={option.route}
                  type="button"
                  onClick={() => navigate(option.route)}
                  className="group flex items-center justify-between rounded-2xl border border-glass-edge bg-glass-tint/40 px-4 py-4 text-left backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-glass-panel"
                >
                  <span className="inline-flex items-center gap-3 text-base font-semibold text-glass-ink">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </span>
                    {option.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-glass-muted transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="relative mt-8 border-t border-glass-edge">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 md:flex-row">
          <p className="text-xs font-medium text-glass-muted">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-glass-ink">옳은영어</span> · All rights reserved
          </p>
          <p className="text-xs tracking-wide text-glass-muted/80">
            Educational Excellence Archive System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
