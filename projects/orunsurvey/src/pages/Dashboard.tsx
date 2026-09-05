import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Plus, 
  ExternalLink, 
  BarChart3, 
  Edit, 
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Link as LinkIcon
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import SurveyResponse from "./SurveyResponse";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  totalResponses: number;
}

const Dashboard = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, totalResponses: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSurveyForPreview, setSelectedSurveyForPreview] = useState<Survey | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      navigate("/auth");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    await Promise.all([fetchSurveys(), fetchStats()]);
    setLoading(false);
  };

  const fetchSurveys = async () => {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("설문조사를 불러오는데 실패했습니다.");
    } else {
      setSurveys(data || []);
    }
  };

  const fetchStats = async () => {
    const { data: surveys } = await supabase
      .from("surveys")
      .select("id, is_active");

    const { data: responses } = await supabase
      .from("survey_responses")
      .select("id", { count: "exact", head: true });

    if (surveys) {
      setStats({
        total: surveys.length,
        active: surveys.filter(s => s.is_active).length,
        inactive: surveys.filter(s => !s.is_active).length,
        totalResponses: responses?.length || 0
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    toast.success("로그아웃되었습니다.");
    navigate("/auth");
  };

  const copyLinkToClipboard = async (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다!", {
        description: "문자 메시지에 붙여넣어 학생들에게 보내세요."
      });
    } catch (error) {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const deleteSurvey = async (surveyId: string, surveyTitle: string) => {
    if (!confirm(`"${surveyTitle}" 설문조사를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 응답 데이터도 함께 삭제됩니다.`)) {
      return;
    }

    const { error } = await supabase
      .from("surveys")
      .delete()
      .eq("id", surveyId);

    if (error) {
      toast.error("설문조사 삭제에 실패했습니다.");
    } else {
      toast.success("설문조사가 삭제되었습니다.");
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-elegant">
            <div className="flex h-20 items-center gap-6 px-8">
              <SidebarTrigger className="hover:bg-muted/50 transition-all rounded-lg" />
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold tracking-luxury bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  대시보드
                </h1>
                <p className="text-sm text-muted-foreground mt-1 font-body">설문조사 관리 및 분석</p>
              </div>
              <Button 
                onClick={() => navigate("/create-survey")} 
                size="lg" 
                className="gap-2 shadow-elegant hover:shadow-glow transition-all duration-500 bg-gradient-to-r from-primary to-accent hover:scale-[1.02] font-body font-semibold"
              >
                <Plus className="h-5 w-5" />
                새 설문조사
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="animate-fade-in hover:shadow-elegant transition-all duration-500 border-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur overflow-hidden group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                    <CardTitle className="text-sm font-body font-semibold text-muted-foreground tracking-wide">전체 설문조사</CardTitle>
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stats.total}</div>
                    <p className="text-xs text-muted-foreground mt-2 font-body font-medium">
                      총 생성된 설문조사
                    </p>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in hover:shadow-success transition-all duration-500 border-0 bg-gradient-to-br from-green-500/5 to-green-600/10 backdrop-blur overflow-hidden group relative" style={{ animationDelay: "0.1s" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                    <CardTitle className="text-sm font-body font-semibold text-muted-foreground tracking-wide">활성 설문조사</CardTitle>
                    <div className="p-3 rounded-xl bg-green-500/10 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-4xl font-display font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">{stats.active}</div>
                    <p className="text-xs text-muted-foreground mt-2 font-body font-medium">
                      현재 진행 중
                    </p>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in hover:shadow-glow transition-all duration-500 border-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10 backdrop-blur overflow-hidden group relative" style={{ animationDelay: "0.2s" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                    <CardTitle className="text-sm font-body font-semibold text-muted-foreground tracking-wide">비활성 설문조사</CardTitle>
                    <div className="p-3 rounded-xl bg-orange-500/10 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-4xl font-display font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">{stats.inactive}</div>
                    <p className="text-xs text-muted-foreground mt-2 font-body font-medium">
                      종료됨
                    </p>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in hover:shadow-elegant transition-all duration-500 border-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 backdrop-blur overflow-hidden group relative" style={{ animationDelay: "0.3s" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                    <CardTitle className="text-sm font-body font-semibold text-muted-foreground tracking-wide">전체 응답</CardTitle>
                    <div className="p-3 rounded-xl bg-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-4xl font-display font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{stats.totalResponses}</div>
                    <p className="text-xs text-muted-foreground mt-2 font-body font-medium">
                      총 수집된 응답
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Surveys Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-display font-bold tracking-luxury bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      내 설문조사
                    </h2>
                    <p className="text-muted-foreground mt-1 text-base font-body">생성한 모든 설문조사를 관리하세요</p>
                  </div>
                </div>

                {surveys.length === 0 ? (
                  <Card className="p-20 text-center animate-fade-in border-2 border-dashed border-muted-foreground/20 bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
                    <div className="mx-auto max-w-md space-y-6">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl flex items-center justify-center shadow-elegant animate-float">
                        <FileText className="h-12 w-12 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-display font-bold">설문조사가 없습니다</CardTitle>
                      <CardDescription className="text-base leading-relaxed font-body">
                        첫 번째 설문조사를 만들어 응답을 수집하기 시작하세요
                      </CardDescription>
                      <Button 
                        onClick={() => navigate("/create-survey")} 
                        size="lg" 
                        className="mt-6 shadow-elegant hover:shadow-glow transition-all duration-500 bg-gradient-to-r from-primary to-accent hover:scale-[1.02] font-body font-semibold"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        첫 설문조사 만들기
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {surveys.map((survey, index) => (
                      <Card 
                        key={survey.id} 
                        className="animate-fade-in hover:shadow-elegant transition-all duration-500 group border-0 bg-card/95 backdrop-blur-sm overflow-hidden relative"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="space-y-4 relative">
                          <div className="flex justify-between items-start gap-3">
                            <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors duration-300 font-display font-bold tracking-wide">
                              {survey.title}
                            </CardTitle>
                            <span
                              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-body font-semibold shadow-sm ${
                                survey.is_active
                                  ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-700 dark:text-green-400 border-2 border-green-500/30"
                                  : "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 dark:text-gray-400 border-2 border-gray-500/30"
                              }`}
                            >
                              {survey.is_active ? "활성" : "비활성"}
                            </span>
                          </div>
                          {survey.description && (
                            <CardDescription className="line-clamp-2 text-sm leading-relaxed font-body">
                              {survey.description}
                            </CardDescription>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-muted/30 font-body">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="font-medium">
                              {new Date(survey.created_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyLinkToClipboard(survey.slug)}
                              className="w-full col-span-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-md font-medium"
                            >
                              <LinkIcon className="h-4 w-4 mr-1.5" />
                              링크 복사 (문자 발송용)
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (import.meta.env.DEV) {
                                  setSelectedSurveyForPreview(survey);
                                } else {
                                  window.open(`/s/${survey.slug}`, '_blank');
                                }
                              }}
                              className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-md font-medium"
                            >
                              <ExternalLink className="h-4 w-4 mr-1.5" />
                              보기
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/survey-results/${survey.id}`)}
                              className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-md font-medium"
                            >
                              <BarChart3 className="h-4 w-4 mr-1.5" />
                              통계
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/edit-survey/${survey.id}`)}
                              className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-md font-medium"
                            >
                              <Edit className="h-4 w-4 mr-1.5" />
                              편집
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSurvey(survey.id, survey.title)}
                              className="w-full transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive hover:shadow-md font-medium"
                            >
                              <Trash2 className="h-4 w-4 mr-1.5" />
                              삭제
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Survey Preview Section */}
              {selectedSurveyForPreview && (
                <div className="space-y-6 mt-8 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        설문조사 미리보기
                      </h2>
                      <p className="text-muted-foreground mt-1 text-base">{selectedSurveyForPreview.title}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSurveyForPreview(null)}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      닫기
                    </Button>
                  </div>
                  <Card className="overflow-hidden border-2 p-6">
                    <SurveyResponse 
                      previewMode={true} 
                      previewSlug={selectedSurveyForPreview.slug}
                    />
                  </Card>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-background">
            <div className="container mx-auto px-6 py-4">
              <p className="text-center text-sm text-muted-foreground">
                © 2024 ORUN ENGLISH. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
