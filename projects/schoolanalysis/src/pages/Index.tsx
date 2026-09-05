import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SchoolInfoForm, type SchoolData } from "@/components/SchoolInfoForm";
import { SchoolReport } from "@/components/SchoolReport";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
            ai_analysis: aiAnalysis || null,
            subject_analysis: subjectAnalysis || null,
          })
          .eq("id", reportId);

        if (error) throw error;
        toast.success("리포트가 업데이트되었습니다.");
      } else {
        // Check if report already exists for this school
        const { data: existingReports } = await supabase
          .from("reports")
          .select("id")
          .eq("school_name", data.schoolName)
          .order("created_at", { ascending: false })
          .limit(1);

        if (existingReports && existingReports.length > 0) {
          // Update existing report
          const { error } = await supabase
            .from("reports")
            .update({
              school_logo: data.schoolLogo || null,
              year_data: data.yearData as any,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingReports[0].id);

          if (error) throw error;
          setReportId(existingReports[0].id);
          toast.success("리포트가 업데이트되었습니다.");
        } else {
          // Create new report
          const { data: newReport, error } = await supabase
            .from("reports")
            .insert([{
              school_name: data.schoolName,
              school_logo: data.schoolLogo || null,
              year_data: data.yearData as any,
            }])
            .select()
            .single();

          if (error) throw error;
          if (newReport) {
            setReportId(newReport.id);
            toast.success("리포트가 저장되었습니다.");
          }
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
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  옳은영어 고등학교 종합분석
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => window.open("https://lovable.dev/projects/846e6ae9-df75-4036-b65f-620c2fb21dd8", "_blank")}
                variant="ghost" 
                size="sm"
                className="gap-2"
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">기출DB</span>
              </Button>
              <Button 
                onClick={() => navigate("/repository")} 
                variant="ghost" 
                size="sm"
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">저장소</span>
              </Button>
              {showReport && (
                <Button 
                  onClick={handleReset} 
                  variant="ghost" 
                  size="sm"
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">새로운 분석</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={!showReport ? "container mx-auto px-4 sm:px-6 lg:px-8 py-8" : "w-full py-8"}>
        {!showReport ? (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                학부모 설명회 리포트
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl">
                데이터 기반 3개년도 학교 종합 분석
              </p>
            </div>
            <SchoolInfoForm onSubmit={handleFormSubmit} initialData={schoolData || undefined} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {schoolData && (
              <SchoolReport 
                data={schoolData} 
                savedAiAnalysis={aiAnalysis}
                savedSubjectAnalysis={subjectAnalysis}
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} 옳은영어. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
