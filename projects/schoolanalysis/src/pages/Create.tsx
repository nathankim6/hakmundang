import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SchoolInfoForm, type SchoolData } from "@/components/SchoolInfoForm";
import { SchoolReport } from "@/components/SchoolReport";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/Header";

const Create = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentRegion = location.pathname.includes("songpa")
    ? "songpa"
    : location.pathname.includes("heukseok")
    ? "heukseok"
    : "dongjak";
  const regionLabel =
    currentRegion === "songpa" ? "송파" : currentRegion === "heukseok" ? "흑석" : "동작";
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [subjectAnalysis, setSubjectAnalysis] = useState<string>("");

  useEffect(() => {
    if (location.state?.editData) {
      setSchoolData(location.state.editData);
      setReportId(location.state.reportId || null);
      setAiAnalysis(location.state.aiAnalysis || "");
      setSubjectAnalysis(location.state.subjectAnalysis || "");
      setShowReport(false);
    }
  }, [location.state]);

  const handleFormSubmit = async (data: SchoolData) => {
    setSchoolData(data);
    setShowReport(true);

    try {
      if (reportId) {
        // Update existing report
        const { error } = await supabase
          .from("reports")
          .update({
            school_name: data.schoolName,
            school_logo: data.schoolLogo || null,
            year_data: data.yearData as any,
            region: currentRegion,
            ai_analysis: aiAnalysis || null,
            subject_analysis: subjectAnalysis || null,
          })
          .eq("id", reportId);

        if (error) throw error;
        toast.success("리포트가 업데이트되었습니다.");
      } else {
        // Create new report
        const { data: newReport, error } = await supabase
          .from("reports")
          .insert([{
            school_name: data.schoolName,
            school_logo: data.schoolLogo || null,
            year_data: data.yearData as any,
            region: currentRegion,
          }])
          .select()
          .single();

        if (error) throw error;
        if (newReport) {
          setReportId(newReport.id);
          toast.success("리포트가 저장되었습니다.");
        }
      }
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleAnalysisComplete = async (newAiAnalysis: string, newSubjectAnalysis: string) => {
    setAiAnalysis(newAiAnalysis);
    setSubjectAnalysis(newSubjectAnalysis);

    // Save to database if we have a report ID
    if (reportId) {
      try {
        const { error } = await supabase
          .from("reports")
          .update({
            ai_analysis: newAiAnalysis,
            subject_analysis: newSubjectAnalysis,
          })
          .eq("id", reportId);

        if (error) throw error;
      } catch (error) {
        console.error("Error saving analysis:", error);
      }
    }
  };

  const handleReset = () => {
    setShowReport(false);
    setSchoolData(null);
    setReportId(null);
    setAiAnalysis("");
    setSubjectAnalysis("");
    navigate(
      currentRegion === "songpa"
        ? "/create-songpa"
        : currentRegion === "heukseok"
        ? "/create-heukseok"
        : "/create",
      { replace: true }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Header />

      {/* Main Content */}
      <main className={!showReport ? "container mx-auto px-4 py-12" : "w-full py-8"}>
        {!showReport ? (
          <div className="space-y-8">
            <div className="container mx-auto px-0">
              <div className="inline-flex items-center rounded-full border border-[hsl(var(--gold-accent))]/30 bg-card/70 px-4 py-2 text-sm font-semibold text-[hsl(var(--navy))] shadow-sm">
                {regionLabel} 분석제작
              </div>
            </div>
            <SchoolInfoForm onSubmit={handleFormSubmit} initialData={schoolData || undefined} region={currentRegion} />
          </div>
        ) : (
          <div className="space-y-4">
            {showReport && (
              <div className="container mx-auto px-4">
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  새로운 분석
                </Button>
              </div>
            )}
            <div className="overflow-x-auto">
              {schoolData && (
                <SchoolReport 
                  data={schoolData} 
                  savedAiAnalysis={aiAnalysis}
                  savedSubjectAnalysis={subjectAnalysis}
                  onAnalysisComplete={handleAnalysisComplete}
                  schoolType={schoolData.schoolName.includes("고등학교") ? "고등학교" : "중학교"}
                  region={currentRegion}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} {currentRegion === "songpa" ? "브래니악 영어학원" : "옳은영어"}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Create;
