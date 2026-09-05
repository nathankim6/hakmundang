import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  ClipboardList, 
  BookOpen, 
  Target, 
  Calendar, 
  ChevronRight, 
  Loader2, 
  Plus,
  Home,
  Sparkles
} from "lucide-react";

interface Exam {
  id: string;
  title: string;
  exam_code: string;
  grade: string;
  grammar_type: string | null;
  difficulty: string | null;
  question_count: number;
  is_active: boolean;
  created_at: string;
}

const ExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching exams:", error);
      } else {
        setExams(data || []);
      }
      setIsLoading(false);
    };

    fetchExams();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const getGradeStyle = (grade: string) => {
    if (grade.includes("중1")) return { bg: "from-blue-500 to-blue-600", badge: "bg-blue-100 text-blue-700" };
    if (grade.includes("중2")) return { bg: "from-purple-500 to-purple-600", badge: "bg-purple-100 text-purple-700" };
    if (grade.includes("중3")) return { bg: "from-pink-500 to-pink-600", badge: "bg-pink-100 text-pink-700" };
    if (grade.includes("고1")) return { bg: "from-orange-500 to-orange-600", badge: "bg-orange-100 text-orange-700" };
    if (grade.includes("고2")) return { bg: "from-teal-500 to-teal-600", badge: "bg-teal-100 text-teal-700" };
    if (grade.includes("고3")) return { bg: "from-red-500 to-red-600", badge: "bg-red-100 text-red-700" };
    return { bg: "from-gray-500 to-gray-600", badge: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      {/* Mobile Header - Only visible on mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate("/")} className="p-2 -ml-2">
            <Home className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="font-bold">시험 목록</span>
          <button onClick={() => navigate("/exam-create")} className="p-2 -mr-2">
            <Plus className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>

      {/* Desktop Header - Only visible on desktop */}
      <header className="hidden md:block border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>홈</span>
            </button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl font-bold">시험 목록</h1>
          </div>
          <Button onClick={() => navigate("/exam-create")}>
            <Plus className="w-4 h-4 mr-2" />
            새 시험 만들기
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-14 md:pt-0 pb-6 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section - Different layouts for mobile/desktop */}
          <div className="pt-6 pb-8 text-center md:text-left md:flex md:items-center md:gap-6 md:py-12">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto md:mx-0 mb-4 md:mb-0 shadow-lg">
              <ClipboardList className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">시험 참여</h1>
              <p className="text-muted-foreground text-sm md:text-base">시험을 선택하여 응시하세요</p>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">불러오는 중...</p>
            </div>
          ) : exams.length === 0 ? (
            <Card className="border-0 shadow-lg max-w-md mx-auto">
              <CardContent className="py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">아직 시험이 없어요</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  새로운 시험을 만들어보세요
                </p>
                <Button onClick={() => navigate("/exam-create")} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  시험 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile: List Layout */}
              <div className="md:hidden space-y-3">
                {exams.map((exam) => {
                  const gradeStyle = getGradeStyle(exam.grade);
                  
                  return (
                    <Card
                      key={exam.id}
                      className="border-0 shadow-md overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
                      onClick={() => navigate(`/exam/${exam.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Left Color Bar */}
                          <div className={`w-1.5 bg-gradient-to-b ${gradeStyle.bg}`} />
                          
                          {/* Content */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base mb-1.5 truncate">
                                  {exam.title}
                                </h3>
                                
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                  <Badge variant="outline" className={`${gradeStyle.badge} text-xs px-2 py-0.5`}>
                                    {exam.grade}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5 flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {exam.question_count}문제
                                  </Badge>
                                </div>

                                {/* Grammar Type */}
                                {exam.grammar_type && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span className="truncate">{exam.grammar_type}</span>
                                  </div>
                                )}
                              </div>

                              {/* Right Side */}
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(exam.created_at)}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <ChevronRight className="w-4 h-4 text-primary" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => {
                  const gradeStyle = getGradeStyle(exam.grade);
                  
                  return (
                    <Card
                      key={exam.id}
                      className="border shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                      onClick={() => navigate(`/exam/${exam.id}`)}
                    >
                      {/* Top Color Bar */}
                      <div className={`h-2 bg-gradient-to-r ${gradeStyle.bg}`} />
                      
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {exam.title}
                          </h3>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <Badge variant="outline" className={`${gradeStyle.badge} px-3 py-1`}>
                            {exam.grade}
                          </Badge>
                          <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" />
                            {exam.question_count}문제
                          </Badge>
                          {exam.difficulty && (
                            <Badge variant="outline" className="px-3 py-1">
                              {exam.difficulty}
                            </Badge>
                          )}
                        </div>

                        {/* Grammar Type */}
                        {exam.grammar_type && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <BookOpen className="w-4 h-4" />
                            <span className="truncate">{exam.grammar_type}</span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(exam.created_at)}</span>
                          </div>
                          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {exam.exam_code}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Floating Action Button - Mobile Only */}
      {exams.length > 0 && (
        <div className="md:hidden fixed bottom-6 right-4 safe-area-bottom">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-xl"
            onClick={() => navigate("/exam-create")}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
