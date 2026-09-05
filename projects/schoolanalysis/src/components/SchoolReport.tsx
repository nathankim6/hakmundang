import orunLogo from "@/assets/orun-logo.jpg";
import seyoonLogo from "@/assets/seyoon-logo.png.asset.json";
import brainiacLogo from "@/assets/brainiac-logo.png.asset.json";
import { Loader2, TrendingUp } from "lucide-react";
import type { SchoolData } from "./SchoolInfoForm";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SchoolReportProps {
  data: SchoolData;
  savedAiAnalysis?: string;
  savedSubjectAnalysis?: string;
  onAnalysisComplete?: (aiAnalysis: string, subjectAnalysis: string) => void;
  schoolType?: "고등학교" | "중학교";
  page?: 1 | 2;
  region?: "dongjak" | "heukseok" | "songpa";
}

const NAVY = "#00204E";
const GOLD = "#C5A059";

const brandConfig = (region?: string) => {
  if (region === "songpa") {
    return {
      orgEnglish: "BRAINIAC ENGLISH",
      orgKorean: "브래니악 영어학원",
      district: "송파구",
    };
  }
  return {
    orgEnglish: "ORUN ENGLISH",
    orgKorean: "옳은영어",
    district: "동작구",
  };
};

const getSchoolLogo = (schoolName: string, schoolLogo?: string): string => {
  if (schoolLogo) return schoolLogo;
  if (schoolName.includes("세륜")) return seyoonLogo.url;
  return "";
};

const getDisplaySchoolName = (schoolName: string, region?: string): string => {
  if (region === "songpa" && schoolName === "창덕여고") return "창덕여자고등학교";
  return schoolName;
};

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-[13px] font-bold mb-3 pl-3"
    style={{ color: NAVY, borderLeft: `3px solid ${GOLD}` }}
  >
    {children}
  </h3>
);

export const SchoolReport = ({
  data,
  savedAiAnalysis,
  savedSubjectAnalysis,
  onAnalysisComplete,
  schoolType,
  page,
  region,
}: SchoolReportProps) => {
  const showPage1 = !page || page === 1;
  const showPage2 = !page || page === 2;
  const latestYear = data.yearData[2];
  const brand = brandConfig(region);
  const [aiAnalysis, setAiAnalysis] = useState<string>(savedAiAnalysis || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [subjectAnalysis, setSubjectAnalysis] = useState<string>(savedSubjectAnalysis || "");
  const [isAnalyzingSubjects, setIsAnalyzingSubjects] = useState(false);
  const [isEditingAiAnalysis, setIsEditingAiAnalysis] = useState(false);
  const [isEditingSubjectAnalysis, setIsEditingSubjectAnalysis] = useState(false);
  const [editedAiAnalysis, setEditedAiAnalysis] = useState<string>("");
  const [editedSubjectAnalysis, setEditedSubjectAnalysis] = useState<string>("");
  const [reportId, setReportId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (savedAiAnalysis && !aiAnalysis) {
      setAiAnalysis(savedAiAnalysis);
      return;
    }
    if (savedAiAnalysis || aiAnalysis) return;
    const run = async () => {
      try {
        const { data: existing } = await supabase
          .from("reports")
          .select("*")
          .eq("school_name", data.schoolName)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing && JSON.stringify(existing.year_data) === JSON.stringify(data.yearData) && existing.ai_analysis) {
          setAiAnalysis(existing.ai_analysis);
          setReportId(existing.id);
          return;
        }
      } catch (e) {
        console.error("Load saved AI analysis error:", e);
      }
      setIsAnalyzing(true);
      try {
        const { data: analysisData, error } = await supabase.functions.invoke("analyze-school-data", {
          body: { schoolData: data, region },
        });
        if (error) {
          toast({ title: "분석 오류", description: error.message || "AI 분석 중 오류가 발생했습니다.", variant: "destructive" });
          return;
        }
        if (analysisData?.analysis) setAiAnalysis(analysisData.analysis);
      } catch (error) {
        toast({
          title: "분석 오류",
          description: error instanceof Error ? error.message : "AI 분석 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    run();
  }, [savedAiAnalysis, aiAnalysis]);

  useEffect(() => {
    if (savedSubjectAnalysis && !subjectAnalysis) {
      setSubjectAnalysis(savedSubjectAnalysis);
      return;
    }
    if (savedSubjectAnalysis || subjectAnalysis) return;
    const run = async () => {
      try {
        const { data: existing } = await supabase
          .from("reports")
          .select("*")
          .eq("school_name", data.schoolName)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing && JSON.stringify(existing.year_data) === JSON.stringify(data.yearData) && existing.subject_analysis) {
          setSubjectAnalysis(existing.subject_analysis);
          if (!reportId) setReportId(existing.id);
          return;
        }
      } catch (e) {
        console.error("Load saved subject analysis error:", e);
      }
      setIsAnalyzingSubjects(true);
      try {
        const { data: analysisData, error } = await supabase.functions.invoke("analyze-subjects", {
          body: { schoolData: data, region },
        });
        if (error) {
          toast({ title: "분석 오류", description: error.message || "과목별 분석 중 오류가 발생했습니다.", variant: "destructive" });
          return;
        }
        if (analysisData?.analysis) setSubjectAnalysis(analysisData.analysis);
      } catch (error) {
        toast({
          title: "분석 오류",
          description: error instanceof Error ? error.message : "과목별 분석 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzingSubjects(false);
      }
    };
    run();
  }, [savedSubjectAnalysis, subjectAnalysis]);

  useEffect(() => {
    if (aiAnalysis && subjectAnalysis && onAnalysisComplete && !savedAiAnalysis && !savedSubjectAnalysis) {
      onAnalysisComplete(aiAnalysis, subjectAnalysis);
    }
  }, [aiAnalysis, subjectAnalysis, onAnalysisComplete, savedAiAnalysis, savedSubjectAnalysis]);

  const refreshAi = async () => {
    setAiAnalysis("");
    setIsAnalyzing(true);
    try {
      const { data: analysisData, error } = await supabase.functions.invoke("analyze-school-data", {
        body: { schoolData: data, region },
      });
      if (error) {
        toast({ title: "분석 오류", description: error.message, variant: "destructive" });
        return;
      }
      if (analysisData?.analysis) {
        setAiAnalysis(analysisData.analysis);
        onAnalysisComplete?.(analysisData.analysis, subjectAnalysis);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const refreshSubjects = async () => {
    setSubjectAnalysis("");
    setIsAnalyzingSubjects(true);
    try {
      const { data: analysisData, error } = await supabase.functions.invoke("analyze-subjects", {
        body: { schoolData: data, region },
      });
      if (error) {
        toast({ title: "분석 오류", description: error.message, variant: "destructive" });
        return;
      }
      if (analysisData?.analysis) {
        setSubjectAnalysis(analysisData.analysis);
        onAnalysisComplete?.(aiAnalysis, analysisData.analysis);
      }
    } finally {
      setIsAnalyzingSubjects(false);
    }
  };

  const englishAvgChange = Number(data.yearData[2].englishAvg) - Number(data.yearData[0].englishAvg);
  const topGradeChange = data.yearData[2].englishGrades.A - data.yearData[0].englishGrades.A;

  // ----- Reusable header -----
  const issueDate = new Date()
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\./g, ".")
    .replace(/\s/g, "");

  const Header = ({ pageNum }: { pageNum: 1 | 2 }) => (
    <header
      className="relative overflow-hidden rounded-sm text-white mb-5"
      style={{
        background: `linear-gradient(135deg, #000d24 0%, ${NAVY} 55%, #002b6b 100%)`,
        padding: "22px 28px 20px",
      }}
    >
      {/* Decorative gold halo */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-120px",
          right: "-120px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD}55 0%, transparent 70%)`,
        }}
      />
      {/* Diagonal gold streak */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        }}
      />

      {/* Top meta strip */}
      <div className="relative z-10 flex justify-between items-center text-[9px] tracking-[0.32em] uppercase font-light pb-3 border-b border-white/15">
        <span style={{ color: GOLD }}>{brand.orgEnglish} · SCHOOL REPORT</span>
        <span className="text-white/60">
          {pageNum === 1 ? "PART 01 · OVERVIEW" : "PART 02 · SUBJECT AUDIT"}
        </span>
      </div>

      {/* Hero block: logo + school name dominant */}
      <div className="relative z-10 flex items-center gap-6 pt-5">
        {/* Logo medallion */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: `1.5px solid ${GOLD}`,
            boxShadow: `0 0 0 4px rgba(197,160,89,0.08), inset 0 0 18px rgba(197,160,89,0.12)`,
          }}
        >
          {getSchoolLogo(data.schoolName, data.schoolLogo) ? (
            <img
              src={getSchoolLogo(data.schoolName, data.schoolLogo)}
              alt={getDisplaySchoolName(data.schoolName, region)}
              className="object-contain"
              style={{ width: "62px", height: "62px" }}
            />
          ) : (
            <div
              className="rotate-45"
              style={{
                width: "32px",
                height: "32px",
                border: `2px solid ${GOLD}`,
              }}
            />
          )}
        </div>

        {/* School name & title block */}
        <div className="flex-grow min-w-0">
          <div
            className="text-[10px] tracking-[0.4em] uppercase mb-1.5 font-medium"
            style={{ color: GOLD, fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            {brand.orgKorean} {brand.district} 중/고등학교 심층분석 리포트
          </div>
          <h1
            className="font-black leading-none tracking-tight truncate"
            style={{
              fontSize: getDisplaySchoolName(data.schoolName, region).length > 8 ? "34px" : "42px",
              fontFamily: "'Noto Sans KR', sans-serif",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            {getDisplaySchoolName(data.schoolName, region)}
          </h1>
        </div>

        {/* Right meta: issue date */}
        <div className="flex-shrink-0 text-right">
          <div
            className="text-[8px] tracking-[0.3em] uppercase mb-1"
            style={{ color: GOLD }}
          >
            Issue
          </div>
          <div className="text-[13px] font-semibold tracking-tight">{issueDate}</div>
          <div className="h-px w-16 ml-auto mt-1.5" style={{ background: GOLD }} />
          <div className="text-[8px] text-white/50 tracking-widest mt-1">VOL · 2026</div>
        </div>
      </div>
    </header>
  );


  const Footer = () => (
    <footer className="mt-auto pt-4 border-t border-neutral-200 flex justify-between items-center">
      <p className="text-[10px] text-neutral-400 font-medium tracking-widest">
        © {new Date().getFullYear()} {brand.orgEnglish}. ALL RIGHTS RESERVED.
      </p>
      <div className="flex gap-1.5">
        <div className="w-3 h-3" style={{ background: NAVY }} />
        <div className="w-3 h-3" style={{ background: GOLD }} />
        <div className="w-3 h-3 bg-neutral-200" />
      </div>
    </footer>
  );

  return (
    <div className="w-full animate-fade-in bg-white text-neutral-800 flex flex-col flex-grow" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {showPage1 && (
        <div className="flex flex-col flex-grow">
          <Header pageNum={1} />

          {/* Two-column overview */}
          <div className="grid grid-cols-12 gap-5 flex-grow">
            {/* LEFT: Student stats */}
            <div className="col-span-5 flex flex-col gap-5 border-r border-neutral-100 pr-5">
              <section>
                <SectionHeading>3개년 학생 수 및 성비 비교</SectionHeading>
                <div className="space-y-4">
                  {[...data.yearData]
                    .sort((a, b) => {
                      const aDisplay = (region === "songpa" || region === "dongjak") && String(a.year) === "2023" ? 2026 : Number(a.year);
                      const bDisplay = (region === "songpa" || region === "dongjak") && String(b.year) === "2023" ? 2026 : Number(b.year);
                      return aDisplay - bDisplay;
                    })
                    .map((y, idx) => {
                    const maleRatio = (y.maleStudents / y.totalStudents) * 100;
                    const femaleRatio = (y.femaleStudents / y.totalStudents) * 100;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-lg font-bold italic" style={{ color: NAVY }}>
                            {(region === "songpa" || region === "dongjak") && String(y.year) === "2023" ? "2026" : y.year}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            총 학생 수{" "}
                            <strong className="text-neutral-800 text-sm ml-1">{y.totalStudents}명</strong>
                          </span>
                        </div>
                        <div className="flex h-1.5 rounded-full overflow-hidden bg-neutral-100">
                          <div style={{ width: `${maleRatio}%`, background: NAVY }} />
                          <div style={{ width: `${femaleRatio}%`, background: GOLD }} />
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-neutral-500 font-medium">
                          <span>남학생 {y.maleStudents}명 ({maleRatio.toFixed(1)}%)</span>
                          <span>여학생 {y.femaleStudents}명 ({femaleRatio.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-neutral-50 p-3 rounded border border-neutral-100">
                <h4 className="text-[11px] font-bold mb-2 uppercase tracking-widest" style={{ color: NAVY }}>
                  Summary Analysis
                </h4>
                <ul className="space-y-1.5 text-[11px] leading-relaxed text-neutral-600">
                  {(() => {
                    const sorted = [...data.yearData].sort((a, b) => {
                      const aDisplay = (region === "songpa" || region === "dongjak") && String(a.year) === "2023" ? 2026 : Number(a.year);
                      const bDisplay = (region === "songpa" || region === "dongjak") && String(b.year) === "2023" ? 2026 : Number(b.year);
                      return aDisplay - bDisplay;
                    });
                    const first = sorted[0];
                    const last = sorted[sorted.length - 1];
                    const t0 = first.totalStudents;
                    const t2 = last.totalStudents;
                    const delta = t2 - t0;
                    const pct = ((delta / t0) * 100).toFixed(1);
                    return (
                      <>
                        <li className="flex gap-2">
                          <span className="font-bold" style={{ color: GOLD }}>•</span>
                          <span>
                            총 학생 수는 {t0}명에서 {t2}명으로{" "}
                            {delta === 0 ? "변동 없음" : `${Math.abs(delta)}명 ${delta > 0 ? "증가" : "감소"} (${pct}%)`}.
                          </span>
                        </li>
                        {(() => {
                          const firstMalePct = (first.maleStudents / t0) * 100;
                          const firstFemalePct = (first.femaleStudents / t0) * 100;
                          const lastMalePct = (last.maleStudents / t2) * 100;
                          const lastFemalePct = (last.femaleStudents / t2) * 100;
                          const isSingleGender = [firstMalePct, firstFemalePct, lastMalePct, lastFemalePct].some(p => p >= 99.5 || p <= 0.5);
                          if (isSingleGender) return null;
                          return (
                            <li className="flex gap-2">
                              <span className="font-bold" style={{ color: GOLD }}>•</span>
                              <span>
                                성비는 {firstMalePct.toFixed(0)}:{firstFemalePct.toFixed(0)} →{" "}
                                {lastMalePct.toFixed(0)}:{lastFemalePct.toFixed(0)} 로 변화했습니다.
                              </span>
                            </li>
                          );
                        })()}
                      </>
                    );
                  })()}

                </ul>
              </section>

              {/* Logo */}
              <div className="mt-auto flex justify-center items-center py-4">
                <img
                  src={region === "songpa" ? brainiacLogo.url : orunLogo}
                  alt={`${brand.orgKorean} 로고`}
                  className="h-10 opacity-50"
                />
              </div>
            </div>

            {/* RIGHT: English KPIs + trend + commentary */}
            <div className="col-span-7 flex flex-col gap-5 pl-5">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <SectionHeading>영어 과목 3개년 중점 분석</SectionHeading>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-neutral-400">평균 점수 변화</p>
                      <p className="text-sm font-bold" style={{ color: NAVY }}>
                        {englishAvgChange >= 0 ? "+" : ""}
                        {englishAvgChange.toFixed(1)}점 {englishAvgChange >= 0 ? "▴" : "▾"}
                      </p>
                    </div>
                    <div className="text-center border-l border-neutral-200 pl-4">
                      <p className="text-[10px] text-neutral-400">A등급 비율 변화</p>
                      <p className="text-sm font-bold" style={{ color: GOLD }}>
                        {topGradeChange >= 0 ? "+" : ""}
                        {topGradeChange.toFixed(1)}%p {topGradeChange >= 0 ? "▴" : "▾"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {data.yearData.map((y, idx) => {
                    const a = Number(y.englishGrades.A);
                    const b = Number(y.englishGrades.B);
                    const c = Number(y.englishGrades.C);
                    const d = Number(y.englishGrades.D);
                    const e = Number(y.englishGrades.E);
                    const isMissing = data.schoolName === "영동일고등학교" && y.year === "2023";
                    return (
                      <div key={idx} className="grid grid-cols-12 items-center gap-3">
                        <div className="col-span-2">
                          <div className="text-[10px] font-bold text-neutral-400">{y.year}</div>
                          {isMissing ? (
                            <div className="text-sm font-bold text-neutral-400">공시정보 없음</div>
                          ) : (
                            <>
                              <div className="text-sm font-bold" style={{ color: NAVY }}>
                                평균 {Number(y.englishAvg).toFixed(1)}
                              </div>
                              {y.year !== "2025" && (
                                <div className="text-[9px] text-neutral-400">표준편차 {Number(y.englishStdDev).toFixed(1)}</div>
                              )}
                            </>
                          )}
                        </div>
                        {!isMissing && (
                          <div className="col-span-10 space-y-1">
                            <div className="flex h-6 rounded-sm overflow-hidden">
                              <div className="relative flex items-center justify-center rounded-l-sm" style={{ width: `${a}%`, background: NAVY }}>{a >= 8 && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-white font-bold whitespace-nowrap z-10">A {a.toFixed(0)}</span>}</div>
                              <div className="relative flex items-center justify-center" style={{ width: `${b}%`, background: "#1f4e8a" }}>{b >= 8 && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-white whitespace-nowrap z-10">B {b.toFixed(0)}</span>}</div>
                              <div className="relative flex items-center justify-center" style={{ width: `${c}%`, background: "#5b7da3" }}>{c >= 8 && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-white whitespace-nowrap z-10">C {c.toFixed(0)}</span>}</div>
                              <div className="relative flex items-center justify-center" style={{ width: `${d}%`, background: "#d9d2c2" }}>{d >= 8 && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-neutral-700 whitespace-nowrap z-10">D {d.toFixed(0)}</span>}</div>
                              <div className="relative flex items-center justify-center rounded-r-sm" style={{ width: `${e}%`, background: GOLD }}>{e >= 8 && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-white whitespace-nowrap z-10">E {e.toFixed(0)}</span>}</div>
                            </div>
                            <div className="grid grid-cols-5 gap-1 text-[8px] font-medium tabular-nums">
                              <div className="text-center" style={{ color: NAVY }}>A {a.toFixed(0)}</div>
                              <div className="text-center" style={{ color: "#1f4e8a" }}>B {b.toFixed(0)}</div>
                              <div className="text-center" style={{ color: "#5b7da3" }}>C {c.toFixed(0)}</div>
                              <div className="text-center text-neutral-600">D {d.toFixed(0)}</div>
                              <div className="text-center" style={{ color: GOLD }}>E {e.toFixed(0)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-neutral-400 mt-2">
                  ※ 2025년도부터 표준편차가 제공되지 않습니다.
                </p>
                <p className="text-[9px] text-neutral-400 mt-1">
                  ※ 학교알리미에 공시된 수행평가를 포함한 합산 점수입니다.
                </p>
              </section>

              {/* AI commentary */}
              <section className="group flex-grow">
                <div className="flex items-center justify-between">
                  <SectionHeading>데이터 분석 리포트</SectionHeading>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditingAiAnalysis ? (
                      <>
                        <button
                          onClick={() => {
                            setAiAnalysis(editedAiAnalysis);
                            onAnalysisComplete?.(editedAiAnalysis, subjectAnalysis);
                            setIsEditingAiAnalysis(false);
                            toast({ title: "저장 완료" });
                          }}
                          className="px-2 py-0.5 text-[10px] font-medium rounded"
                          style={{ background: NAVY, color: "white" }}
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setIsEditingAiAnalysis(false)}
                          className="px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-600 rounded"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditedAiAnalysis(aiAnalysis);
                            setIsEditingAiAnalysis(true);
                          }}
                          disabled={isAnalyzing || !aiAnalysis}
                          className="no-pdf px-2 py-0.5 text-[10px] font-medium border border-neutral-200 text-neutral-600 rounded disabled:opacity-40"
                        >
                          수정
                        </button>
                        <button
                          onClick={refreshAi}
                          disabled={isAnalyzing}
                          className="no-pdf px-2 py-0.5 text-[10px] font-medium border border-neutral-200 text-neutral-600 rounded disabled:opacity-40 flex items-center gap-1"
                        >
                          <TrendingUp className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`} />
                          새로고침
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    데이터를 분석하는 중입니다...
                  </div>
                ) : isEditingAiAnalysis ? (
                  <textarea
                    value={editedAiAnalysis}
                    onChange={(e) => setEditedAiAnalysis(e.target.value)}
                    className="w-full min-h-[200px] p-3 text-[12px] leading-relaxed border border-neutral-200 rounded focus:outline-none focus:ring-1"
                    style={{ "--tw-ring-color": NAVY } as React.CSSProperties}
                  />
                ) : (
                  <div
                    className="text-[11px] leading-[1.65] text-black font-normal whitespace-pre-wrap"
                    style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                  >
                    {aiAnalysis || "분석 결과를 불러오는 중입니다..."}
                  </div>
                )}
              </section>
            </div>
          </div>

          <Footer />
        </div>
      )}

      {showPage2 && (
        <div className="flex flex-col flex-grow">
          <Header pageNum={2} />

          <div className="grid grid-cols-12 gap-5 flex-grow">
            {/* LEFT: Std-dev guide + Avg/Std Dev */}
            <div className="col-span-5 flex flex-col gap-5 border-r border-neutral-100 pr-5">
              {/* Std-dev guide removed — no longer provided from 2025 */}

               <section>
                 <SectionHeading>{latestYear.year}년도 과목별 평균</SectionHeading>
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-y-2" style={{ borderColor: NAVY }}>
                       <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: NAVY }}>과목</th>
                       <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: NAVY }}>평균</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     {[
                       { name: "국어", avg: latestYear.koreanAvg, highlight: false },
                       { name: "수학", avg: latestYear.mathAvg, highlight: false },
                       { name: "영어", avg: latestYear.englishAvg, highlight: true },
                     ].map((r) => (
                       <tr
                         key={r.name}
                         className="border-b border-neutral-100"
                         style={r.highlight ? { background: "#fafaf7" } : undefined}
                       >
                         <td
                           className="py-2.5 px-4 font-medium"
                           style={r.highlight ? { color: NAVY, fontWeight: 700 } : undefined}
                         >
                           {r.name}
                         </td>
                         <td className="py-2.5 px-4 text-right text-base" style={r.highlight ? { color: NAVY, fontWeight: 700 } : undefined}>
                           {Number(r.avg).toFixed(1)}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                  <p className="text-[9px] text-neutral-400 mt-2">
                    ※ 학교알리미에 공시된 수행평가를 포함한 합산 점수입니다.
                  </p>
                  <p className="text-[9px] text-neutral-400 mt-1">
                    ※ 실제 지필고사의 평균점수는 더 낮을 수 있습니다.
                  </p>
                </section>

              {/* Logo */}
              <div className="mt-auto flex justify-center items-center py-4">
                <img
                  src={region === "songpa" ? brainiacLogo.url : orunLogo}
                  alt={`${brand.orgKorean} 로고`}
                  className="h-10 opacity-50"
                />
              </div>
            </div>

            {/* RIGHT: Achievement + 5-grade + Subject analysis */}
            <div className="col-span-7 flex flex-col gap-5">
              <section>
                <SectionHeading>{latestYear.year}년도 과목별 성취도 비율</SectionHeading>
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="text-white" style={{ background: NAVY }}>
                      <th className="py-2 text-[10px] font-medium">과목</th>
                      {["A", "B", "C", "D", "E"].map((g) => (
                        <th key={g} className="py-2 text-[10px] font-medium">{g}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[11px] text-neutral-700">
                    {[
                      { name: "국어", g: latestYear.koreanGrades },
                      { name: "수학", g: latestYear.mathGrades },
                      { name: "영어", g: latestYear.englishGrades, highlight: true as const },
                    ].map((r) => (
                      <tr key={r.name} className="border-b border-neutral-100">
                        <td
                          className="py-2.5 font-bold"
                          style={
                            r.highlight
                              ? { background: "rgba(197,160,89,0.1)", color: NAVY }
                              : { background: "#fafafa" }
                          }
                        >
                          {r.name}
                        </td>
                        <td className="py-2.5" style={r.highlight ? { fontWeight: 700 } : undefined}>{Number(r.g.A).toFixed(1)}%</td>
                        <td className="py-2.5">{Number(r.g.B).toFixed(1)}%</td>
                        <td className="py-2.5">{Number(r.g.C).toFixed(1)}%</td>
                        <td className="py-2.5">{Number(r.g.D).toFixed(1)}%</td>
                        <td className="py-2.5">{Number(r.g.E).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* 5-grade system - 고등학교 only */}
              {schoolType === "고등학교" && (
                <section>
                  <SectionHeading>5등급제 등급별 석차 조건</SectionHeading>
                  <table className="w-full text-center text-[11px] border-collapse">
                    <thead>
                      <tr className="text-white" style={{ background: NAVY }}>
                        <th className="py-2">학년도</th>
                        <th className="py-2">1등급 (~10%)</th>
                        <th className="py-2">2등급 (~34%)</th>
                        <th className="py-2">3등급 (~68%)</th>
                        <th className="py-2">4등급 (~90%)</th>
                        <th className="py-2">5등급 (~100%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.yearData.map((y, idx) => {
                        const latest = idx === data.yearData.length - 1;
                        return (
                          <tr key={idx} className="border-b border-neutral-100" style={latest ? { background: "rgba(197,160,89,0.08)" } : undefined}>
                            <td className="py-2 font-bold" style={latest ? { color: NAVY } : undefined}>{y.year}</td>
                            <td className="py-2">{y.grade5System.grade1}등</td>
                            <td className="py-2">{y.grade5System.grade2}등</td>
                            <td className="py-2">{y.grade5System.grade3}등</td>
                            <td className="py-2">{y.grade5System.grade4}등</td>
                            <td className="py-2">{y.grade5System.grade5}등</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Subject difficulty AI commentary */}
              <section className="group flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: NAVY }}>
                    과목별 시험 난이도 종합 분석
                  </h3>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditingSubjectAnalysis ? (
                      <>
                        <button
                          onClick={() => {
                            setSubjectAnalysis(editedSubjectAnalysis);
                            onAnalysisComplete?.(aiAnalysis, editedSubjectAnalysis);
                            setIsEditingSubjectAnalysis(false);
                            toast({ title: "저장 완료" });
                          }}
                          className="px-2 py-0.5 text-[10px] font-medium rounded"
                          style={{ background: NAVY, color: "white" }}
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setIsEditingSubjectAnalysis(false)}
                          className="px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-600 rounded"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditedSubjectAnalysis(subjectAnalysis);
                            setIsEditingSubjectAnalysis(true);
                          }}
                          disabled={isAnalyzingSubjects || !subjectAnalysis}
                          className="no-pdf px-2 py-0.5 text-[10px] font-medium border border-neutral-200 text-neutral-600 rounded disabled:opacity-40"
                        >
                          수정
                        </button>
                        <button
                          onClick={refreshSubjects}
                          disabled={isAnalyzingSubjects}
                          className="no-pdf px-2 py-0.5 text-[10px] font-medium border border-neutral-200 text-neutral-600 rounded disabled:opacity-40 flex items-center gap-1"
                        >
                          <TrendingUp className={`w-3 h-3 ${isAnalyzingSubjects ? "animate-spin" : ""}`} />
                          새로고침
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {isAnalyzingSubjects ? (
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    과목별 데이터를 분석하는 중입니다...
                  </div>
                ) : isEditingSubjectAnalysis ? (
                  <textarea
                    value={editedSubjectAnalysis}
                    onChange={(e) => setEditedSubjectAnalysis(e.target.value)}
                    className="w-full min-h-[200px] p-3 text-[12px] leading-relaxed border border-neutral-200 rounded focus:outline-none"
                  />
                ) : (
                  <div
                    className="text-[11px] leading-[1.65] text-black font-normal whitespace-pre-wrap"
                    style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                  >
                    {subjectAnalysis || "분석 결과를 불러오는 중입니다..."}
                  </div>
                )}
              </section>
            </div>
          </div>

          <Footer />
        </div>
      )}
    </div>
  );
};
