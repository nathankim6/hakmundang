import React, { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Users,
  Link2,
  Trash2,
  Check,
  X,
  Minus,
  ChevronLeft,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  GraduationCap,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { toJpeg } from "html-to-image";
import JSZip from "jszip";
import {
  useStudentSubmissions,
  StudentSubmission,
  AnswerStatus,
} from "@/hooks/useStudentSubmissions";
import { ProblemType } from "@/integrations/supabase/reportService";
import { getSchoolLogo } from "@/lib/schoolLogos";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reportId?: string;
  reportMeta?: { school: string; grade: string; examScope: string; examInfo?: string; teacher?: string; created_at?: string };
  problems: ProblemType[];
}

const statusIcon = (s?: AnswerStatus) => {
  if (s === "wrong") return <X className="w-4 h-4 text-rose-600" />;
  if (s === "partial") return <Minus className="w-4 h-4 text-amber-600" />;
  return <Check className="w-4 h-4 text-emerald-600" />;
};

const statusBg = (s?: AnswerStatus) => {
  if (s === "wrong") return "bg-rose-50 border-rose-200";
  if (s === "partial") return "bg-amber-50 border-amber-200";
  return "bg-emerald-50 border-emerald-200";
};

const StudentSubmissionsDialog: React.FC<Props> = ({ open, onOpenChange, reportId, reportMeta, problems }) => {
  const { submissions, loading, remove } = useStudentSubmissions(reportId);
  const [selected, setSelected] = useState<StudentSubmission | null>(null);
  const [weaknessStudent, setWeaknessStudent] = useState<string>("all");
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [bulkExporting, setBulkExporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const captureReport = async (): Promise<string | null> => {
    if (!reportRef.current) return null;
    const imgs = Array.from(reportRef.current.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
            setTimeout(done, 3000);
          })
      )
    );
    return await toJpeg(reportRef.current, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      skipFonts: true,
    });
  };

  const captureAndDownload = async (studentName: string) => {
    const dataUrl = await captureReport();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.download = `${studentName}_리포트_${new Date().toISOString().slice(0, 10)}.jpg`;
    a.href = dataUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportJpg = async () => {
    if (!reportRef.current || !selected) return;
    setExporting(true);
    try {
      await captureAndDownload(selected.student_name);
      toast.success("JPG 저장 완료");
    } catch (e) {
      console.error("JPG export error:", e);
      toast.error("저장 중 오류가 발생했습니다");
    } finally {
      setExporting(false);
    }
  };

  const handleExportAllJpg = async () => {
    if (submissions.length === 0) return;
    const prevSelected = selected;
    setBulkExporting(true);
    setBulkProgress({ current: 0, total: submissions.length });
    try {
      const zip = new JSZip();
      const dateStr = new Date().toISOString().slice(0, 10);
      for (let i = 0; i < submissions.length; i++) {
        const s = submissions[i];
        setSelected(s);
        // 렌더링 및 이미지 로드 대기
        await new Promise((r) => setTimeout(r, 500));
        setBulkProgress({ current: i + 1, total: submissions.length });
        try {
          const dataUrl = await captureReport();
          if (dataUrl) {
            const base64 = dataUrl.split(",")[1];
            zip.file(`${s.student_name}_리포트_${dateStr}.jpg`, base64, { base64: true });
          }
        } catch (err) {
          console.error(`${s.student_name} 저장 실패:`, err);
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const zipName = `${reportMeta?.school ?? "리포트"}_${reportMeta?.grade ?? ""}_학생리포트_${dateStr}.zip`;
      const a = document.createElement("a");
      a.download = zipName;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${submissions.length}명 리포트 ZIP 저장 완료`);
    } catch (e) {
      console.error("Bulk export error:", e);
      toast.error("일괄 저장 중 오류가 발생했습니다");
    } finally {
      setSelected(prevSelected);
      setBulkExporting(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (weaknessStudent === "all") return submissions;
    return submissions.filter((s) => s.id === weaknessStudent);
  }, [submissions, weaknessStudent]);

  const classAverage = useMemo(() => {
    const scored = submissions.filter((s) => s.score != null);
    if (scored.length === 0) return null;
    return Math.round((scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length) * 10) / 10;
  }, [submissions]);

  // 학교 평균 (리포트 단위 저장 → 같은 시험 전체 학생에게 동일 반영)
  const [schoolAverage, setSchoolAverage] = useState<number | null>(null);
  const [schoolAvgInput, setSchoolAvgInput] = useState("");
  const [savingAvg, setSavingAvg] = useState(false);

  React.useEffect(() => {
    if (!open || !reportId) return;
    (async () => {
      const { data } = await supabase
        .from("report_cards")
        .select("school_average")
        .eq("id", reportId)
        .single();
      const v = (data as any)?.school_average;
      setSchoolAverage(v ?? null);
      setSchoolAvgInput(v != null ? String(v) : "");
    })();
  }, [open, reportId]);

  const saveSchoolAverage = async () => {
    if (!reportId) return;
    const parsed = schoolAvgInput.trim() === "" ? null : Number(schoolAvgInput);
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0 || parsed > 100)) {
      toast.error("0~100 사이의 숫자를 입력해주세요");
      return;
    }
    setSavingAvg(true);
    const { error } = await supabase
      .from("report_cards")
      .update({ school_average: parsed } as any)
      .eq("id", reportId);
    setSavingAvg(false);
    if (error) {
      toast.error("학교 평균 저장 실패");
      return;
    }
    setSchoolAverage(parsed);
    toast.success("학교 평균이 이 시험의 전체 학생에게 반영되었습니다");
  };


  const headerInfo = useMemo(() => {
    if (!reportMeta) {
      return { title: "옳은영어 · 학생 채점 리포트", subtitle: "" };
    }
    const year = reportMeta.created_at
      ? new Date(reportMeta.created_at).getFullYear()
      : new Date().getFullYear();

    const parts = reportMeta.examInfo ? reportMeta.examInfo.split(" ") : [];
    const semester = parts[0] || "";
    const examType = parts[1] || "";
    const title = [
      reportMeta.school,
      reportMeta.grade,
      `${year}년`,
      semester,
      examType,
    ]
      .filter(Boolean)
      .join(" ");
    return { title, subtitle: reportMeta.examScope || "" };
  }, [reportMeta]);


  const link = reportId ? `${window.location.origin}/submit/${reportId}` : "";

  const sortedProblems = useMemo(
    () =>
      [...problems].sort((a, b) => {
        const na = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
        const nb = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
        return na - nb;
      }),
    [problems]
  );

  // 문항별 오답률
  const problemStats = useMemo(() => {
    const map: Record<string, { wrong: number; partial: number; total: number }> = {};
    sortedProblems.forEach((p) => (map[p.id] = { wrong: 0, partial: 0, total: 0 }));
    submissions.forEach((s) => {
      s.answers.forEach((a) => {
        if (!map[a.problem_id]) return;
        map[a.problem_id].total += 1;
        if (a.status === "wrong") map[a.problem_id].wrong += 1;
        if (a.status === "partial") map[a.problem_id].partial += 1;
      });
    });
    return map;
  }, [submissions, sortedProblems]);

  // problem_id -> category 매핑
  const problemCategory = useMemo(() => {
    const m: Record<string, string> = {};
    sortedProblems.forEach((p) => {
      m[p.id] = p.category || "기타";
    });
    return m;
  }, [sortedProblems]);

  // 전체 유형별 오답률 (모든 학생 합산)
  const categoryStats = useMemo(() => {
    const map: Record<string, { wrong: number; partial: number; total: number }> = {};
    submissions.forEach((s) => {
      s.answers.forEach((a) => {
        const cat = problemCategory[a.problem_id];
        if (!cat) return;
        if (!map[cat]) map[cat] = { wrong: 0, partial: 0, total: 0 };
        map[cat].total += 1;
        if (a.status === "wrong") map[cat].wrong += 1;
        if (a.status === "partial") map[cat].partial += 1;
      });
    });
    return Object.entries(map)
      .map(([category, v]) => ({
        category,
        ...v,
        wrongRate: v.total ? Math.round((v.wrong / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.wrongRate - a.wrongRate);
  }, [submissions, problemCategory]);

  // 학생별 취약 유형 (학생 단위로 카테고리별 오답률 계산 → Top 3 추출)
  const studentWeakness = useMemo(() => {
    return submissions.map((s) => {
      const map: Record<string, { wrong: number; total: number }> = {};
      s.answers.forEach((a) => {
        const cat = problemCategory[a.problem_id];
        if (!cat) return;
        if (!map[cat]) map[cat] = { wrong: 0, total: 0 };
        map[cat].total += 1;
        if (a.status === "wrong" || a.status === "partial") map[cat].wrong += 1;
      });
      const cats = Object.entries(map)
        .map(([category, v]) => ({
          category,
          wrong: v.wrong,
          total: v.total,
          rate: v.total ? Math.round((v.wrong / v.total) * 100) : 0,
        }))
        .filter((c) => c.wrong > 0)
        .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong)
        .slice(0, 3);
      return { submission: s, weakCategories: cats };
    });
  }, [submissions, problemCategory]);

  // problem_id -> problem name 매핑
  const problemName = useMemo(() => {
    const m: Record<string, string> = {};
    sortedProblems.forEach((p) => {
      m[p.id] = p.name;
    });
    return m;
  }, [sortedProblems]);

  // 전체 취약 문항 Top (오답률 높은 순)
  const weakProblems = useMemo(() => {
    return sortedProblems
      .map((p) => {
        const st = problemStats[p.id] || { wrong: 0, partial: 0, total: 0 };
        const rate = st.total ? Math.round((st.wrong / st.total) * 100) : 0;
        return { id: p.id, name: p.name, category: p.category, ...st, rate };
      })
      .filter((p) => p.wrong > 0)
      .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong)
      .slice(0, 10);
  }, [sortedProblems, problemStats]);

  // 학생별 취약 문항 (틀린/부분 문항 목록)
  const studentWeakProblems = useMemo(() => {
    return submissions.map((s) => {
      const wrongList = s.answers
        .filter((a) => a.status === "wrong" || a.status === "partial")
        .map((a) => ({
          problem_id: a.problem_id,
          name: problemName[a.problem_id] || a.problem_id,
          category: problemCategory[a.problem_id] || "",
          status: a.status,
          reason: a.reason,
        }));
      return { submission: s, wrongList };
    });
  }, [submissions, problemName, problemCategory]);

  // 취약 유형 탭 - 선택 학생 필터링 통계
  const filteredProblemStats = useMemo(() => {
    const map: Record<string, { wrong: number; partial: number; total: number }> = {};
    sortedProblems.forEach((p) => (map[p.id] = { wrong: 0, partial: 0, total: 0 }));
    filteredSubmissions.forEach((s) => {
      s.answers.forEach((a) => {
        if (!map[a.problem_id]) return;
        map[a.problem_id].total += 1;
        if (a.status === "wrong") map[a.problem_id].wrong += 1;
        if (a.status === "partial") map[a.problem_id].partial += 1;
      });
    });
    return map;
  }, [filteredSubmissions, sortedProblems]);

  const filteredCategoryStats = useMemo(() => {
    const map: Record<string, { wrong: number; partial: number; total: number }> = {};
    filteredSubmissions.forEach((s) => {
      s.answers.forEach((a) => {
        const cat = problemCategory[a.problem_id];
        if (!cat) return;
        if (!map[cat]) map[cat] = { wrong: 0, partial: 0, total: 0 };
        map[cat].total += 1;
        if (a.status === "wrong") map[cat].wrong += 1;
        if (a.status === "partial") map[cat].partial += 1;
      });
    });
    return Object.entries(map)
      .map(([category, v]) => ({
        category,
        ...v,
        wrongRate: v.total ? Math.round((v.wrong / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.wrongRate - a.wrongRate);
  }, [filteredSubmissions, problemCategory]);

  const filteredWeakProblems = useMemo(() => {
    return sortedProblems
      .map((p) => {
        const st = filteredProblemStats[p.id] || { wrong: 0, partial: 0, total: 0 };
        const rate = st.total ? Math.round((st.wrong / st.total) * 100) : 0;
        return { id: p.id, name: p.name, category: p.category, ...st, rate };
      })
      .filter((p) => p.wrong > 0)
      .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong)
      .slice(0, 10);
  }, [sortedProblems, filteredProblemStats]);

  const filteredStudentWeakness = useMemo(() => {
    if (weaknessStudent === "all") return studentWeakness;
    return studentWeakness.filter((sw) => sw.submission.id === weaknessStudent);
  }, [studentWeakness, weaknessStudent]);

  const filteredStudentWeakProblems = useMemo(() => {
    if (weaknessStudent === "all") return studentWeakProblems;
    return studentWeakProblems.filter((sw) => sw.submission.id === weaknessStudent);
  }, [studentWeakProblems, weaknessStudent]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("링크가 복사되었습니다");
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  const getAnswerStatus = (sub: StudentSubmission, pid: string): AnswerStatus => {
    const found = sub.answers.find((a) => a.problem_id === pid);
    return found?.status ?? "correct";
  };

  const getAnswerReason = (sub: StudentSubmission, pid: string): string | undefined => {
    const found = sub.answers.find((a) => a.problem_id === pid);
    return found?.reason;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            학생 제출 관리
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="share" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="share">
              <Link2 className="w-4 h-4 mr-1" /> 공유 링크
            </TabsTrigger>
            <TabsTrigger value="students">제출 학생 ({submissions.length})</TabsTrigger>
            <TabsTrigger value="problems">문항별 통계</TabsTrigger>
            <TabsTrigger value="weakness">
              <BarChart3 className="w-4 h-4 mr-1" /> 취약 유형 통계
            </TabsTrigger>
          </TabsList>

          {/* 공유 링크 */}
          <TabsContent value="share" className="flex-1 overflow-auto">
            <div className="p-4 space-y-3">
              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  이렇게 활용해 보세요
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  공유 링크를 단톡방에 전송하고 학생들에게 문항별로 정오표를 작성하게 하면,
                  학생별로 <b>취약 유형</b>과 <b>자주 실수하는 유형</b>을 통계 데이터로 관리할 수
                  있습니다. 제출이 쌓일수록 <b>“취약 유형 통계”</b> 탭에서 반 전체와 개별 학생의
                  약점을 한눈에 확인할 수 있어요.
                </p>
              </div>
              <p className="text-sm text-neutral-600">
                아래 링크를 단톡방에 공유하세요. 학생은 로그인 없이 바로 채점을 제출할 수 있습니다.
              </p>
              <div className="flex gap-2">
                <Input readOnly value={link} className="flex-1 font-mono text-xs" />
                <Button onClick={copyLink} className="gap-2">
                  <Copy className="w-4 h-4" /> 복사
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 학생 리스트 / 상세 */}
          <TabsContent value="students" className="flex-1 overflow-auto">
            {selected ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelected(null)}
                  >
                    <ChevronLeft className="w-4 h-4" /> 목록으로
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleExportJpg}
                    disabled={exporting}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Download className="w-4 h-4" />
                    {exporting ? "저장 중..." : "JPG 저장"}
                  </Button>
                </div>
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                  <span className="text-xs font-semibold text-amber-800 whitespace-nowrap">학교 평균 설정</span>
                  <Input
                    type="number"
                    value={schoolAvgInput}
                    onChange={(e) => setSchoolAvgInput(e.target.value)}
                    placeholder="예: 62.4"
                    className="h-8 w-24 bg-white text-sm"
                  />
                  <Button size="sm" className="h-8" onClick={saveSchoolAverage} disabled={savingAvg}>
                    {savingAvg ? "저장 중..." : "저장"}
                  </Button>
                  <span className="text-[11px] text-amber-700">
                    한 번 저장하면 같은 시험의 모든 학생 리포트에 동일하게 표시됩니다.
                  </span>
                </div>
                <div ref={reportRef} className="bg-white p-8 rounded-2xl">
                  {/* 리포트 헤더 */}
                  <div className="flex items-center justify-between pb-5 mb-6 border-b-2 border-slate-900">
                    <div className="flex items-center gap-3">
                      <img
                        src="/lovable-uploads/orun-logo-new.png"
                        alt="옳은영어"
                        className="w-12 h-12 object-contain"
                        crossOrigin="anonymous"
                      />
                      <div>
                        <p className="text-[10px] tracking-[0.35em] font-bold text-slate-500 uppercase">
                          ORUN ENGLISH
                        </p>
                        <p className="text-lg font-black text-slate-900 tracking-tight">
                          {headerInfo.title}
                        </p>
                        {headerInfo.subtitle && (
                          <p className="text-xs text-slate-500 mt-1">
                            {headerInfo.subtitle}
                          </p>
                        )}
                      </div>


                    </div>
                    <div className="text-right">
                      <p className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase">
                        Issued
                      </p>
                      <p className="text-sm font-bold text-slate-700 tabular-nums">
                        {new Date().toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>

                <div className="mb-5 p-5 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-colors duration-500" />
                    <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-4 ring-white overflow-hidden">
                      {getSchoolLogo(selected.school) ? (
                        <img
                          src={getSchoolLogo(selected.school)!}
                          alt={`${selected.school} 로고`}
                          className="w-full h-full object-contain p-1"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="space-y-1 min-w-0">
                      <p className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                        {selected.student_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                        <span>{selected.school}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{selected.grade}</span>
                      </div>
                    </div>
                    <div className="flex flex-row items-end gap-3 shrink-0 ml-4">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-1">Score</span>
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex items-baseline gap-1.5 shadow-xl shadow-slate-900/10">
                          <span className="text-xs font-medium opacity-70">점수</span>
                          <span className="text-2xl font-black leading-none">{selected.score ?? "-"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-1">Class Average</span>
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-2xl flex items-baseline gap-1.5 shadow-xl shadow-blue-500/20">
                          <span className="text-xs font-medium opacity-70">반 평균</span>
                          <span className="text-2xl font-black leading-none">{classAverage ?? "-"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-1">School Average</span>
                        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-4 py-2 rounded-2xl flex items-baseline gap-1.5 shadow-xl shadow-amber-400/20">
                          <span className="text-xs font-medium opacity-70">학교 평균</span>
                          <span className="text-2xl font-black leading-none">{schoolAverage ?? "-"}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 text-right max-w-[160px] leading-relaxed self-end">
                        학생이 보고한 가채점 점수입니다. 서술형 채점 및 OMR 실수 등으로 변동될 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {sortedProblems.map((p, idx) => {
                    const st = getAnswerStatus(selected, p.id);
                    const reason = getAnswerReason(selected, p.id);
                    const isKiller = p.difficulty === "very_hard";
                    const isHard = p.difficulty === "hard";
                    const isVariant = !!p.isVariant;
                    const qNum = parseInt(p.name.match(/\d+/)?.[0] || String(idx + 1), 10);
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-lg border flex flex-col gap-1.5 ${statusBg(st)}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {statusIcon(st)}
                          <span className="text-sm font-bold tabular-nums text-neutral-900">Q{qNum}</span>
                          <span className="text-sm font-medium truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isKiller && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-rose-600 text-white">
                              KILLER
                            </span>
                          )}
                          {isHard && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                              어려움
                            </span>
                          )}
                          {isVariant && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                              지문변형
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {p.category} · 난이도 {p.difficulty === "easy" ? "쉬움" : p.difficulty === "medium" ? "보통" : p.difficulty === "hard" ? "어려움" : "매우 어려움"}
                        </p>
                        {reason && (st === "wrong" || st === "partial") && (
                          <div className="mt-1.5 pt-1.5 border-t border-white/60">
                            <p className="text-[9px] font-bold tracking-wider text-neutral-500 uppercase mb-0.5">
                              틀린 이유
                            </p>
                            <p className="text-[11px] text-neutral-700 leading-relaxed whitespace-pre-wrap">
                              {reason}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                  {/* 리포트 푸터 */}
                  <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <img
                        src="/lovable-uploads/orun-logo-new.png"
                        alt="옳은영어"
                        className="w-6 h-6 object-contain opacity-80"
                        crossOrigin="anonymous"
                      />
                      <span className="font-semibold text-slate-700">옳은영어 ORUN ENGLISH</span>
                    </div>
                    <p className="text-[11px]">
                      © {new Date().getFullYear()} ORUN ENGLISH. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {loading ? (
                  <p className="text-center text-neutral-500 py-8">불러오는 중...</p>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                    <p>아직 제출한 학생이 없습니다.</p>
                    <p className="text-xs mt-1">"공유 링크" 탭에서 링크를 학생들에게 보내주세요.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3 px-2">
                      <p className="text-sm text-neutral-600">
                        총 <b>{submissions.length}명</b> 제출
                      </p>
                      <Button
                        size="sm"
                        onClick={handleExportAllJpg}
                        disabled={bulkExporting}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Download className="w-4 h-4" />
                        {bulkExporting
                          ? `저장 중... (${bulkProgress.current}/${bulkProgress.total})`
                          : "전체 학생 JPG 저장"}
                      </Button>
                    </div>
                    <div className="divide-y">
                    {submissions.map((s) => {
                      const wrongCount = s.answers.filter((a) => a.status === "wrong").length;
                      const partialCount = s.answers.filter((a) => a.status === "partial").length;
                      return (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 py-3 hover:bg-neutral-50 px-2 rounded cursor-pointer"
                          onClick={() => setSelected(s)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-neutral-900">{s.student_name}</p>
                            <p className="text-xs text-neutral-500 truncate">
                              {s.school} · {s.grade}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{s.score ?? "-"}<span className="text-xs text-neutral-400 font-normal">점</span></p>
                            <p className="text-xs text-neutral-500">
                              틀림 {wrongCount}{partialCount > 0 ? ` · 부분 ${partialCount}` : ""}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`${s.student_name} 제출을 삭제할까요?`)) remove(s.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-neutral-400" />
                          </Button>
                        </div>
                      );
                    })}
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>

          {/* 문항별 오답률 */}
          <TabsContent value="problems" className="flex-1 overflow-auto">
            <div className="p-4">
              {submissions.length === 0 ? (
                <p className="text-center text-neutral-500 py-8">제출 데이터가 없습니다.</p>
              ) : (
                <div className="space-y-1">
                  {sortedProblems.map((p, idx) => {
                    const st = problemStats[p.id] || { wrong: 0, partial: 0, total: 0 };
                    const wrongRate = st.total ? Math.round((st.wrong / st.total) * 100) : 0;
                    const isKiller = p.difficulty === "very_hard";
                    const isHard = p.difficulty === "hard";
                    const isVariant = !!p.isVariant;
                    const qNum = parseInt(p.name.match(/\d+/)?.[0] || String(idx + 1), 10);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50"
                      >
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold tabular-nums shadow-sm">
                          {qNum}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium truncate">{p.name}</p>
                            {isKiller && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-rose-600 text-white">
                                KILLER
                              </span>
                            )}
                            {isHard && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                어려움
                              </span>
                            )}
                            {isVariant && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                지문변형
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">
                            {p.category} · 난이도 {p.difficulty === "easy" ? "쉬움" : p.difficulty === "medium" ? "보통" : p.difficulty === "hard" ? "어려움" : "매우 어려움"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-rose-600 font-semibold">
                            {st.wrong}/{st.total} 틀림
                          </span>
                          <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500"
                              style={{ width: `${wrongRate}%` }}
                            />
                          </div>
                          <span className="w-10 text-right tabular-nums font-semibold">
                            {wrongRate}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* 취약 유형 통계 */}
          <TabsContent value="weakness" className="flex-1 overflow-auto font-noto">
            <div className="p-5 space-y-6">
              {submissions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <BarChart3 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>제출 데이터가 쌓이면 유형별 통계가 표시됩니다.</p>
                </div>
              ) : (
                <>
                  {/* Header summary */}
                  <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white px-6 py-5 shadow-lg shadow-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-5 h-5" />
                      <h2 className="text-xl font-bold">
                        {weaknessStudent === "all" ? "취약 유형 통계" : `${submissions.find((s) => s.id === weaknessStudent)?.student_name ?? "학생"}의 취약 유형`}
                      </h2>
                    </div>
                    <p className="text-blue-100 text-sm opacity-90">
                      {weaknessStudent === "all"
                        ? `제출 ${submissions.length}명의 데이터를 바탕으로 한 맞춤형 취약점 분석입니다.`
                        : "선택한 학생의 데이터를 바탕으로 한 맞춤형 취약점 분석입니다."}
                    </p>
                  </div>

                  {/* 학생 선택기 */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setWeaknessStudent("all")}
                      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                        weaknessStudent === "all"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      전체
                    </button>
                    {submissions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setWeaknessStudent(s.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                          weaknessStudent === s.id
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                          {s.student_name.charAt(0)}
                        </div>
                        {s.student_name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 유형별 오답률 */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                        <h3 className="text-lg font-bold text-slate-800">
                          {weaknessStudent === "all" ? "전체 유형별 오답률" : "선택한 학생 유형별 오답률"}
                        </h3>
                      </div>
                      {filteredCategoryStats.length === 0 ? (
                        <p className="text-sm text-slate-500">아직 오답 데이터가 없습니다.</p>
                      ) : (
                        <div className="space-y-3">
                          {filteredCategoryStats.map((c) => (
                            <div
                              key={c.category}
                              className="group"
                            >
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                                  {c.category}
                                </span>
                                <span className="text-blue-600 font-bold tabular-nums">
                                  {c.wrongRate}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-sky-500 rounded-full transition-all duration-700"
                                  style={{ width: `${c.wrongRate}%` }}
                                />
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">
                                총 {c.total}회 응답 · 오답 {c.wrong}
                                {c.partial > 0 ? ` · 부분 ${c.partial}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* 취약 유형 Top 3 */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-amber-400 rounded-full" />
                        <h3 className="text-lg font-bold text-slate-800">
                          {weaknessStudent === "all" ? "학생별 취약 유형 Top 3" : "취약 유형 Top 3"}
                        </h3>
                      </div>
                      <div className="grid gap-3">
                        {filteredStudentWeakness.map(({ submission, weakCategories }) => (
                          <div
                            key={submission.id}
                            className="bg-slate-50 rounded-2xl p-4 border border-slate-100"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm text-sm font-bold text-blue-600">
                                  {submission.student_name.charAt(0)}
                                </div>
                                <span className="font-semibold text-slate-900">
                                  {submission.student_name}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-medium">
                                점수 {submission.score ?? "-"}
                              </span>
                            </div>
                            {weakCategories.length === 0 ? (
                              <p className="text-xs text-emerald-600">모든 문항을 맞혔습니다 🎉</p>
                            ) : (
                              <div className="flex justify-between gap-2">
                                {weakCategories.map((c, idx) => (
                                  <div
                                    key={c.category}
                                    className="flex-1 text-center bg-white p-3 rounded-xl shadow-sm border border-slate-100"
                                  >
                                    <span className={`block text-xs font-bold mb-1 ${
                                      idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-500" : "text-slate-300"
                                    }`}>
                                      {idx === 0 ? "1st" : idx === 1 ? "2nd" : "3rd"}
                                    </span>
                                    <div className="text-sm font-bold text-slate-700 truncate">
                                      {c.category}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">
                                      {c.wrong}/{c.total} ({c.rate}%)
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 취약 문항 Top 10 */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-rose-500 rounded-full" />
                        <h3 className="text-lg font-bold text-slate-800">
                          {weaknessStudent === "all" ? "전체 취약 문항 Top 10" : "선택한 학생 취약 문항"}
                        </h3>
                      </div>
                      {filteredWeakProblems.length === 0 ? (
                        <p className="text-sm text-slate-500">아직 오답 문항이 없습니다.</p>
                      ) : (
                        <div className="grid grid-cols-5 gap-2">
                          {filteredWeakProblems.map((p, idx) => (
                            <div
                              key={p.id}
                              className={`aspect-square flex flex-col items-center justify-center rounded-lg border ${
                                idx === 0
                                  ? "bg-rose-50 border-rose-100"
                                  : "bg-slate-50 border-slate-100"
                              }`}
                              title={`${p.name} (${p.category})`}
                            >
                              <span className={`text-xs font-bold ${
                                idx === 0 ? "text-rose-600" : "text-slate-600"
                              }`}>
                                {p.name}
                              </span>
                              <span className={`text-[9px] ${
                                idx === 0 ? "text-rose-400" : "text-slate-400"
                              }`}>
                                {p.rate}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* 상세 취약 문항 */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                        <h3 className="text-lg font-bold text-slate-800">
                          {weaknessStudent === "all" ? "학생별 상세 취약 문항" : "상세 취약 문항"}
                        </h3>
                      </div>
                      <div className="grid gap-3">
                        {filteredStudentWeakProblems.map(({ submission, wrongList }) => (
                          <div
                            key={submission.id}
                            className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100/50"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm text-sm font-bold text-blue-600">
                                  {submission.student_name.charAt(0)}
                                </div>
                                <span className="font-semibold text-slate-900">
                                  {submission.student_name}
                                </span>
                              </div>
                              <span className="px-2 py-1 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-md">
                                틀림 {wrongList.length}문항
                              </span>
                            </div>
                            {wrongList.length === 0 ? (
                              <p className="text-xs text-emerald-600">모든 문항을 맞혔습니다 🎉</p>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {wrongList.map((w) => (
                                    <span
                                      key={w.problem_id}
                                      className={`inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg border shadow-sm transition-all hover:scale-105 ${
                                        w.status === "wrong"
                                          ? "border-rose-100"
                                          : "border-amber-100"
                                      }`}
                                      title={w.category}
                                    >
                                      <span className={`text-xs font-bold ${
                                        w.status === "wrong" ? "text-rose-600" : "text-amber-600"
                                      }`}>
                                        {w.name}
                                      </span>
                                      {w.status === "partial" && (
                                        <span className="text-[10px] text-amber-500">부분</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                                {wrongList.some((w) => w.reason) && (
                                  <div className="mt-3 pt-3 border-t border-blue-100/70 space-y-2">
                                    <p className="text-[11px] font-bold text-blue-700 tracking-wide">
                                      학생이 작성한 오답 회고
                                    </p>
                                    {wrongList
                                      .filter((w) => w.reason)
                                      .map((w) => (
                                        <div
                                          key={`r-${w.problem_id}`}
                                          className="bg-white rounded-lg p-2.5 border border-slate-100"
                                        >
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <span
                                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                w.status === "wrong"
                                                  ? "bg-rose-100 text-rose-600"
                                                  : "bg-amber-100 text-amber-600"
                                              }`}
                                            >
                                              {w.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                              {w.category}
                                            </span>
                                          </div>
                                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {w.reason}
                                          </p>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSubmissionsDialog;