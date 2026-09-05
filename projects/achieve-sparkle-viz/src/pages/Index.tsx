import { useState, useRef } from "react";
import { SchoolForm, SchoolData } from "@/components/SchoolForm";
import { AchievementChart } from "@/components/AchievementChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportManager } from "@/components/ReportManager";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import jsPDF from "jspdf";
const Index = () => {
  const [schoolData, setSchoolData] = useState<SchoolData[] | null>(null);
  const [currentReportId, setCurrentReportId] = useState<string | undefined>(undefined);
  const chartRef = useRef<HTMLDivElement>(null);
  const handleFormSubmit = (data: SchoolData[]) => {
    setSchoolData(data);
  };
  const handleLoadReport = (data: SchoolData[]) => {
    setSchoolData(data);
  };
  const handleReportSaved = (id: string) => {
    setCurrentReportId(id);
  };
  const handleDownloadImage = async () => {
    if (!chartRef.current) return;
    try {
      toast.info("PDF 생성 중...");
      const pages = Array.from(
        chartRef.current.querySelectorAll<HTMLElement>("[data-a4-page]")
      );
      if (pages.length === 0) {
        toast.error("저장할 페이지가 없습니다.");
        return;
      }

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = 210;
      const pageH = 297;
      const margin = 5; // 5mm margin on all sides
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;

      // Hide tooltips during capture (recharts hover tooltips can stick around)
      const hideEls = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".recharts-tooltip-wrapper, [data-export-hidden='true']"
        )
      );
      const prevDisplay = hideEls.map((el) => el.style.display);
      hideEls.forEach((el) => (el.style.display = "none"));

      // Wait for fonts and all images inside the chart to be fully loaded
      // before capture so nothing renders as a 0-size element.
      try {
        // @ts-ignore
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {}
      const imgs = Array.from(
        chartRef.current.querySelectorAll<HTMLImageElement>("img")
      );
      await Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((res) => {
                img.addEventListener("load", () => res(), { once: true });
                img.addEventListener("error", () => res(), { once: true });
              })
        )
      );

      try {
        for (let i = 0; i < pages.length; i++) {
          const node = pages[i];
          // Use fixed A4 pixel dimensions (794×1123) — ignore border/shadow
          // so capture does not extend beyond the selected A4 area.
          const w = 794;
          const h = 1123;
          const dataUrl = await toPng(node, {
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: "#ffffff",
            width: w,
            height: h,
            canvasWidth: w,
            canvasHeight: h,
            style: {
              transform: "none",
              margin: "0",
              boxShadow: "none",
              border: "none",
              width: `${w}px`,
              height: `${h}px`,
            },
            filter: (el) => {
              if (!(el instanceof HTMLElement)) return true;
              if (el.dataset?.exportHidden === "true") return false;
              if (el.classList?.contains("recharts-tooltip-wrapper")) return false;
              return true;
            },
          });
          if (i > 0) pdf.addPage("a4", "portrait");
          // A4 page ratio (794:1123 ≈ 210:297) — fill content area with 5mm margin.
          const imgAspect = w / h;
          const boxAspect = contentW / contentH;
          let drawW = contentW;
          let drawH = contentH;
          if (imgAspect > boxAspect) {
            drawH = contentW / imgAspect;
          } else {
            drawW = contentH * imgAspect;
          }
          const offsetX = margin + (contentW - drawW) / 2;
          const offsetY = margin + (contentH - drawH) / 2;
          pdf.addImage(dataUrl, "PNG", offsetX, offsetY, drawW, drawH, undefined, "FAST");
        }
      } finally {
        hideEls.forEach((el, idx) => (el.style.display = prevDisplay[idx]));
      }

      pdf.save(`학교성취도분석_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF가 저장되었습니다!");
    } catch (error) {
      console.error("PDF 저장 실패:", error);
      toast.error("PDF 저장에 실패했습니다.");
    }
  };
  return <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <header className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/40 via-violet-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="container mx-auto relative">
          <div className="flex items-center justify-between py-8 px-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-xs font-semibold uppercase tracking-widest bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Education Analytics Platform
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight leading-tight">성적분포 및 학교 비교분석</h1>
              <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">학교알리미 공시정보 기반 학교별 성적 분포 및 비교 분석 프로그램</p>
            </div>
            <ReportManager currentData={schoolData} onLoadReport={handleLoadReport} currentReportId={currentReportId} onReportSaved={handleReportSaved} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 space-y-12">
        <SchoolForm onSubmit={handleFormSubmit} />
        
        {schoolData && <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-end mb-8">
              <Button onClick={handleDownloadImage} size="lg" className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary hover:to-primary shadow-[var(--shadow-premium)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 px-8 py-6 text-base font-bold">
                <Download className="w-5 h-5" />
                A4 PDF로 저장
              </Button>
            </div>
            <div ref={chartRef} data-chart-ref>
              <AchievementChart middleSchools={schoolData} />
            </div>
          </div>}

        {!schoolData && <Card className="relative overflow-hidden p-16 text-center bg-gradient-to-br from-card via-card to-muted/20 border-2 border-dashed border-border/50 shadow-[var(--shadow-soft)]">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
            
            <div className="max-w-2xl mx-auto space-y-6 relative">
              <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-3xl flex items-center justify-center shadow-lg border-2 border-primary/10">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-3xl font-black text-foreground mb-3 tracking-tight">
                  데이터를 입력해주세요
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  각 중학교의 성취도 비율을 입력하고 그래프 생성 버튼을 클릭하면<br />
                  전문적인 분석 차트가 생성됩니다
                </p>
              </div>
            </div>
          </Card>}
      </main>

      {/* Premium Footer */}
      <footer className="relative mt-16 py-8 px-4 bg-white border-t border-slate-200">
        <div className="container mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Education Analytics Platform
            </div>
            <p className="text-sm font-medium text-slate-400">© 2025 학교 성취도 분석 시스템. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;