import { useState, useEffect, useRef, useLayoutEffect, forwardRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SchoolReport } from "@/components/SchoolReport";
import { ArrowLeft, Pencil, Trash2, Download, Package, BarChart3, RefreshCw } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { SchoolData } from "@/components/SchoolInfoForm";
import { Header } from "@/components/Header";
import JSZip from "jszip";
import jsPDF from "jspdf";

// A4 page. Fixed 210×297mm with 5mm margin all sides. No scaling — content
// keeps full 200mm width so every page feels edge-to-edge.
const A4Page = forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => (
  <div
    ref={ref}
    className="bg-white mx-auto relative"
    style={{
      width: "210mm",
      height: "297mm",
      padding: "5mm",
      overflow: "hidden",
      boxSizing: "border-box",
      fontFamily: "'Noto Sans KR', 'Noto Sans', system-ui, sans-serif",
      boxShadow:
        "0 1px 3px rgba(15, 23, 42, 0.04), 0 20px 60px -20px rgba(15, 23, 42, 0.18)",
      border: "1px solid rgba(15, 23, 42, 0.06)",
      borderRadius: "2px",
    }}
  >
    <div style={{ width: "200mm", minHeight: "287mm", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  </div>
));
A4Page.displayName = "A4Page";


interface ReportListItem {
  id: string;
  school_name: string;
  created_at: string;
  updated_at: string;
}

interface SavedReport {
  id: string;
  school_name: string;
  school_logo: string | null;
  created_at: string;
  updated_at: string;
  year_data: any;
  ai_analysis: string | null;
  subject_analysis: string | null;
}

const getDisplaySchoolName = (name: string, region: string) =>
  region === "songpa" && name === "창덕여고" ? "창덕여자고등학교" : name;

const isHighSchool = (name: string) =>
  name.includes("고등학교") || name === "창덕여고";

const isMiddleSchool = (name: string) =>
  name.includes("중학교");

const Repository = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRegion = location.pathname.includes("songpa")
    ? "songpa"
    : location.pathname.includes("heukseok")
    ? "heukseok"
    : "dongjak";
  const regionLabel =
    currentRegion === "songpa" ? "송파" : currentRegion === "heukseok" ? "흑석" : "동작";
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState<{ done: number; total: number } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReports();
  }, [currentRegion]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("id, school_name, created_at, updated_at")
        .eq("region", currentRegion)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("리포트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (id: string) => {
    setLoadingReport(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .eq("region", currentRegion)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSelectedReport(data);
      }
    } catch (error) {
      console.error("Error fetching report detail:", error);
      toast.error("리포트 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("reports").delete().eq("id", id).eq("region", currentRegion);

      if (error) throw error;
      toast.success("리포트가 삭제되었습니다.");
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleEdit = async (reportId: string) => {
    try {
      const { data: report, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .eq("region", currentRegion)
        .maybeSingle();

      if (error) throw error;
      if (report) {
        const schoolData: SchoolData = {
          schoolName: report.school_name,
          schoolLogo: report.school_logo || undefined,
          yearData: report.year_data as any,
        };
        navigate(
          currentRegion === "songpa"
            ? "/create-songpa"
            : currentRegion === "heukseok"
            ? "/create-heukseok"
            : "/create",
          { 
          state: { 
            editData: schoolData, 
            reportId: report.id,
            aiAnalysis: report.ai_analysis || "",
            subjectAnalysis: report.subject_analysis || "",
          } 
        });
      }
    } catch (error) {
      console.error("Error fetching report for edit:", error);
      toast.error("리포트를 불러오는데 실패했습니다.");
    }
  };

  const handleAnalysisComplete = async (newAi: string, newSubject: string) => {
    if (!selectedReport) return;
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          ai_analysis: newAi,
          subject_analysis: newSubject,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedReport.id);

      if (error) throw error;
      setSelectedReport(prev => prev ? {
        ...prev,
        ai_analysis: newAi,
        subject_analysis: newSubject,
        updated_at: new Date().toISOString(),
      } : prev);
    } catch (e) {
      console.error('Error saving generated analysis:', e);
    }
  };

  const handleRefreshAllAnalyses = async () => {
    if (!confirm(`${regionLabel} 지역의 모든 학교(중/고) 데이터 분석 리포트와 과목별 시험 난이도 종합분석을 다시 생성합니다. 계속하시겠습니까?`)) return;

    setIsRefreshingAll(true);
    const toastId = toast.loading("전체 리포트 분석을 새로고침 중...");

    try {
      const { data: allReports, error: fetchErr } = await supabase
        .from("reports")
        .select("id, school_name, year_data")
        .eq("region", currentRegion);

      if (fetchErr) throw fetchErr;
      const list = allReports || [];
      setRefreshProgress({ done: 0, total: list.length });

      let success = 0;
      let failed = 0;

      for (let i = 0; i < list.length; i++) {
        const r = list[i];
        try {
          const schoolData = { schoolName: r.school_name, yearData: r.year_data };

          const [aiRes, subRes] = await Promise.all([
            supabase.functions.invoke("analyze-school-data", { body: { schoolData } }),
            supabase.functions.invoke("analyze-subjects", { body: { schoolData } }),
          ]);

          if (aiRes.error) throw aiRes.error;
          if (subRes.error) throw subRes.error;

          const newAi = (aiRes.data as any)?.analysis || "";
          const newSubject = (subRes.data as any)?.analysis || "";

          const { error: updErr } = await supabase
            .from("reports")
            .update({
              ai_analysis: newAi,
              subject_analysis: newSubject,
              updated_at: new Date().toISOString(),
            })
            .eq("id", r.id);

          if (updErr) throw updErr;
          success++;
        } catch (e) {
          console.error(`Failed to refresh ${r.school_name}:`, e);
          failed++;
        }
        setRefreshProgress({ done: i + 1, total: list.length });
        toast.loading(`전체 리포트 분석을 새로고침 중... (${i + 1}/${list.length})`, { id: toastId });
      }

      toast.success(`완료: 성공 ${success}건${failed > 0 ? `, 실패 ${failed}건` : ""}`, { id: toastId });
      await fetchReports();
      if (selectedReport) {
        await fetchReportDetail(selectedReport.id);
      }
    } catch (e) {
      console.error("Refresh all error:", e);
      toast.error("새로고침에 실패했습니다.", { id: toastId });
    } finally {
      setIsRefreshingAll(false);
      setRefreshProgress(null);
    }
  };

  const captureElementToPng = async (el: HTMLDivElement): Promise<string> => {
    const { toPng } = await import("html-to-image");
    // A4 at 96dpi: 210mm × 297mm = 794 × 1123 px (exact)
    const a4WidthPx = Math.round((210 / 25.4) * 96);
    const a4HeightPx = Math.round((297 / 25.4) * 96);

    // Neutralize on-screen chrome (shadow/border/radius) so the capture
    // matches the printable A4 surface exactly — no stray edges.
    const prev = {
      boxShadow: el.style.boxShadow,
      border: el.style.border,
      borderRadius: el.style.borderRadius,
    };
    el.style.boxShadow = "none";
    el.style.border = "none";
    el.style.borderRadius = "0";

    // Hide buttons that shouldn't appear in PDF
    const noPdfEls = el.querySelectorAll<HTMLElement>(".no-pdf");
    const prevDisplays: string[] = [];
    noPdfEls.forEach((node) => {
      prevDisplays.push(node.style.display);
      node.style.display = "none";
    });

    try {
      return await toPng(el, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        width: a4WidthPx,
        height: a4HeightPx,
        canvasWidth: a4WidthPx,
        canvasHeight: a4HeightPx,
        style: {
          transform: "none",
          filter: "none",
          backdropFilter: "none",
          margin: "0",
          boxShadow: "none",
          border: "none",
          borderRadius: "0",
        },
        skipFonts: true,
      });
    } finally {
      el.style.boxShadow = prev.boxShadow;
      el.style.border = prev.border;
      el.style.borderRadius = prev.borderRadius;
      noPdfEls.forEach((node, i) => {
        node.style.display = prevDisplays[i];
      });
    }
  };

  const buildPdfFromPages = async (pageEls: HTMLDivElement[]): Promise<jsPDF> => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pageEls.length; i++) {
      const el = pageEls[i];
      if (!el) continue;
      const dataUrl = await captureElementToPng(el);
      if (i > 0) pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, pageHeight);
    }
    return pdf;
  };

  const handleDownloadAllReports = async (type: "고등학교" | "중학교") => {
    const filteredReports = reports.filter(report => type === "고등학교" ? isHighSchool(report.school_name) : isMiddleSchool(report.school_name));
    const groupLabel = type === "고등학교" ? "고등부" : "중등부";

    if (filteredReports.length === 0) {
      toast.error(`저장할 ${groupLabel} 리포트가 없습니다.`);
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(`${groupLabel} 리포트를 생성하는 중... (0/${filteredReports.length})`);

    try {
      const zip = new JSZip();

      for (let i = 0; i < filteredReports.length; i++) {
        const reportItem = filteredReports[i];
        toast.loading(`${groupLabel} 리포트를 생성하는 중... (${i + 1}/${filteredReports.length})`, { id: toastId });

        const { data: report, error } = await supabase
          .from("reports")
          .select("*")
          .eq("id", reportItem.id)
          .eq("region", currentRegion)
          .maybeSingle();

        if (error || !report) continue;

        setSelectedReport(report);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (page1Ref.current && page2Ref.current) {
          try {
            const pdf = await buildPdfFromPages([page1Ref.current, page2Ref.current]);
            const pdfBlob = pdf.output("blob");
            const fileName = `${report.school_name}_리포트_${new Date().toISOString().split("T")[0]}.pdf`;
            zip.file(fileName, pdfBlob);
          } catch (e) {
            console.error(`PDF build failed for ${report.school_name}:`, e);
          }
        }
      }

      setSelectedReport(null);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${groupLabel}_리포트_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success(`${groupLabel} 리포트가 PDF로 저장되었습니다!`, { id: toastId });
    } catch (error) {
      console.error("Error saving all reports:", error);
      toast.error("리포트 저장에 실패했습니다.", { id: toastId });
      setSelectedReport(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!page1Ref.current || !page2Ref.current || !selectedReport) return;

    setIsSaving(true);
    const toastId = toast.loading("PDF를 생성하는 중...");

    try {
      const pdf = await buildPdfFromPages([page1Ref.current, page2Ref.current]);
      const fileName = `${selectedReport.school_name}_리포트_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
      toast.success("PDF가 저장되었습니다!", { id: toastId });
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast.error("PDF 저장에 실패했습니다.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-white">
        <Header />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 56px)' }}>
          <div className="text-lg font-medium text-[hsl(var(--navy))]">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-white">
      <Header />

      {loadingReport && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-medium text-slate-700">리포트 불러오는 중...</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!selectedReport && (
          <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center rounded-full border border-[hsl(var(--gold-accent))]/30 bg-card/70 px-4 py-2 text-sm font-semibold text-[hsl(var(--navy))] shadow-sm">
              {regionLabel} 분석DB
            </div>
            <Button
              onClick={handleRefreshAllAnalyses}
              disabled={isRefreshingAll || reports.length === 0}
              variant="default"
              size="lg"
              className="bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--navy-dark))] hover:from-[hsl(var(--navy-dark))] hover:to-[hsl(var(--navy-dark))] shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingAll ? "animate-spin" : ""}`} />
              {isRefreshingAll
                ? `새로고침 중... ${refreshProgress ? `(${refreshProgress.done}/${refreshProgress.total})` : ""}`
                : "모든 학교 분석 새로고침"}
            </Button>
          </div>
        )}
        {selectedReport ? (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => setSelectedReport(null)} variant="outline" className="border-[hsl(var(--gold-accent))]/30 hover:bg-[hsl(var(--gold-accent))]/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
              <Button
                onClick={handleDownloadPdf}
                variant="secondary"
                disabled={isSaving}
                className="bg-gradient-to-r from-[hsl(var(--gold-accent))] to-amber-500 text-white hover:from-amber-600 hover:to-amber-600 shadow-md"
              >
                <Download className="w-4 h-4 mr-2" />
                {isSaving ? "저장 중..." : "PDF 저장"}
              </Button>
              <Button onClick={() => handleEdit(selectedReport.id)} variant="default" className="bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--navy-dark))] hover:from-[hsl(var(--navy-dark))] hover:to-[hsl(var(--navy-dark))] shadow-md">
                <Pencil className="w-4 h-4 mr-2" />
                수정
              </Button>
              <Button onClick={() => handleDelete(selectedReport.id)} variant="destructive" className="shadow-md">
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
              <Button
                onClick={handleRefreshAllAnalyses}
                disabled={isRefreshingAll || reports.length === 0}
                variant="default"
                className="bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--navy-dark))] hover:from-[hsl(var(--navy-dark))] hover:to-[hsl(var(--navy-dark))] shadow-md"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingAll ? "animate-spin" : ""}`} />
                {isRefreshingAll
                  ? `새로고침 중... ${refreshProgress ? `(${refreshProgress.done}/${refreshProgress.total})` : ""}`
                  : "모든 학교 분석 새로고침"}
              </Button>
            </div>
            <div className="space-y-8">
              {[1, 2].map((pageNum) => (
                <A4Page key={`${selectedReport.id}-${pageNum}`} ref={pageNum === 1 ? page1Ref : page2Ref}>
                  <SchoolReport
                    key={`${selectedReport.id}-${pageNum}`}
                    data={{
                      schoolName: selectedReport.school_name,
                      schoolLogo: selectedReport.school_logo || undefined,
                      yearData: selectedReport.year_data,
                    }}
                    schoolType={isHighSchool(selectedReport.school_name) ? "고등학교" : "중학교"}
                    savedAiAnalysis={selectedReport.ai_analysis || undefined}
                    savedSubjectAnalysis={selectedReport.subject_analysis || undefined}
                    onAnalysisComplete={pageNum === 1 ? handleAnalysisComplete : undefined}
                    page={pageNum as 1 | 2}
                    region={currentRegion}
                  />
                </A4Page>
              ))}
            </div>


          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            {reports.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-lg text-slate-500 font-medium">저장된 리포트가 없습니다.</p>
              </div>
            ) : (
              <>
                {/* 고등부 섹션 */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--gold-accent))] bg-clip-text text-transparent">
                      고등부
                    </h2>
                    {reports.filter(report => isHighSchool(report.school_name)).length > 0 && (
                      <Button
                        onClick={() => handleDownloadAllReports("고등학교")}
                        disabled={isSaving}
                        variant="secondary"
                        size="sm"
                        className="bg-gradient-to-r from-[hsl(var(--gold-accent))] to-amber-500 text-white hover:from-amber-600 hover:to-amber-600 shadow-md"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {isSaving ? "생성 중..." : "전체 저장"}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-6">
                    {reports.filter(report => isHighSchool(report.school_name)).length === 0 ? (
                      <p className="text-sm text-slate-400">저장된 고등부 리포트가 없습니다.</p>
                    ) : (
                      reports.filter(report => isHighSchool(report.school_name)).map((report) => (
                <Card
                  key={report.id}
                  className="group p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 border border-[hsl(var(--gold-accent))]/20 bg-white hover:scale-[1.02] relative overflow-hidden"
                  onClick={() => fetchReportDetail(report.id)}
                >
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <pattern id={`pattern-${report.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="1" fill="hsl(var(--gold-accent))" />
                      </pattern>
                      <rect width="100%" height="100%" fill={`url(#pattern-${report.id})`} />
                    </svg>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3 pb-3 border-b border-[hsl(var(--gold-accent))]/10">
                      <h3 className="font-bold text-xl bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--gold-accent))] bg-clip-text text-transparent whitespace-nowrap">{getDisplaySchoolName(report.school_name, currentRegion)}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[hsl(var(--navy))] bg-[hsl(var(--gold-accent))]/10 px-2 py-1 rounded whitespace-nowrap">생성</span>
                        <p className="text-xs text-slate-600">
                          {new Date(report.created_at).toLocaleString("ko-KR", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[hsl(var(--navy))] bg-[hsl(var(--gold-accent))]/10 px-2 py-1 rounded whitespace-nowrap">수정</span>
                        <p className="text-xs text-slate-600">
                          {new Date(report.updated_at).toLocaleString("ko-KR", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-5 pt-4 border-t border-[hsl(var(--gold-accent))]/10">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchReportDetail(report.id);
                        }}
                        variant="default"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--navy-dark))] hover:from-[hsl(var(--navy-dark))] hover:to-[hsl(var(--navy-dark))]"
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        분석
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(report.id);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[hsl(var(--gold-accent))]/30 hover:bg-[hsl(var(--gold-accent))]/10 hover:border-[hsl(var(--gold-accent))]"
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        수정
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(report.id);
                        }}
                        variant="destructive"
                        size="sm"
                        className="flex-1 shadow-sm"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </Card>
                      ))
                    )}
                  </div>
                </div>

                {/* 중등부 섹션 */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--gold-accent))] bg-clip-text text-transparent">
                      중등부
                    </h2>
                    {reports.filter(report => isMiddleSchool(report.school_name)).length > 0 && (
                      <Button
                        onClick={() => handleDownloadAllReports("중학교")}
                        disabled={isSaving}
                        variant="secondary"
                        size="sm"
                        className="bg-gradient-to-r from-[hsl(var(--gold-accent))] to-amber-500 text-white hover:from-amber-600 hover:to-amber-600 shadow-md"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {isSaving ? "생성 중..." : "전체 저장"}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-6">
                    {reports.filter(report => isMiddleSchool(report.school_name)).length === 0 ? (
                      <p className="text-sm text-slate-400">저장된 중등부 리포트가 없습니다.</p>
                    ) : (
                      reports.filter(report => isMiddleSchool(report.school_name)).map((report) => (
                        <Card
                          key={report.id}
                          className="group p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 border border-[hsl(var(--gold-accent))]/20 bg-white hover:scale-[1.02] relative overflow-hidden"
                          onClick={() => fetchReportDetail(report.id)}
                        >
                          {/* Subtle pattern overlay */}
                          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                              <pattern id={`pattern-${report.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="20" cy="20" r="1" fill="hsl(var(--gold-accent))" />
                              </pattern>
                              <rect width="100%" height="100%" fill={`url(#pattern-${report.id})`} />
                            </svg>
                          </div>

                          <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3 pb-3 border-b border-[hsl(var(--gold-accent))]/10">
                              <h3 className="font-bold text-xl bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--gold-accent))] bg-clip-text text-transparent whitespace-nowrap">{getDisplaySchoolName(report.school_name, currentRegion)}</h3>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[hsl(var(--navy))] bg-[hsl(var(--gold-accent))]/10 px-2 py-1 rounded whitespace-nowrap">생성</span>
                                <p className="text-xs text-slate-600">
                                  {new Date(report.created_at).toLocaleString("ko-KR", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[hsl(var(--navy))] bg-[hsl(var(--gold-accent))]/10 px-2 py-1 rounded whitespace-nowrap">수정</span>
                                <p className="text-xs text-slate-600">
                                  {new Date(report.updated_at).toLocaleString("ko-KR", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-5 pt-4 border-t border-[hsl(var(--gold-accent))]/10">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fetchReportDetail(report.id);
                                }}
                                variant="default"
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--navy-dark))] hover:from-[hsl(var(--navy-dark))] hover:to-[hsl(var(--navy-dark))]"
                              >
                                <BarChart3 className="w-3 h-3 mr-1" />
                                분석
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(report.id);
                                }}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-[hsl(var(--gold-accent))]/30 hover:bg-[hsl(var(--gold-accent))]/10 hover:border-[hsl(var(--gold-accent))]"
                              >
                                <Pencil className="w-3 h-3 mr-1" />
                                수정
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(report.id);
                                }}
                                variant="destructive"
                                size="sm"
                                className="flex-1 shadow-sm"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                삭제
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-[hsl(var(--gold-accent))]/20 text-center">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} <span className="font-bold bg-gradient-to-r from-[hsl(var(--navy))] to-[hsl(var(--gold-accent))] bg-clip-text text-transparent">{currentRegion === "songpa" ? "브래니악 영어학원" : "옳은영어"}</span>. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Repository;
