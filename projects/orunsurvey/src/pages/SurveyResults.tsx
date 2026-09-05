import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { ArrowLeft, Download, Trash2, RefreshCw, BarChart3, Table as TableIcon } from "lucide-react";
import { format } from "date-fns";


interface Response {
  id: string;
  created_at: string;
  name: string;
  [key: string]: any;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  question_order: number;
}



const SurveyResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      navigate("/auth");
      return;
    }

    fetchData();
  }, [navigate, id]);

  const fetchData = async () => {
    if (!id) return;

    const { data: surveyData, error: surveyError } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", id)
      .single();

    if (surveyError) {
      toast.error("설문조사를 불러오는데 실패했습니다.");
      navigate("/dashboard");
      return;
    }

    setSurvey(surveyData);

    const { data: questionsData, error: questionsError } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", id)
      .order("question_order");

    if (!questionsError && questionsData) {
      setQuestions(questionsData.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: Array.isArray(q.options) ? q.options.map(o => String(o)) : [],
        question_order: q.question_order
      })));
    }

    const { data: responsesData, error: responsesError } = await supabase
      .from("survey_responses")
      .select("*")
      .eq("survey_id", id)
      .order("created_at", { ascending: false });

    if (!responsesError) {
      setResponses(responsesData || []);
    }

    setLoading(false);
  };

  const handleDelete = async (responseId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("survey_responses")
      .delete()
      .eq("id", responseId);

    if (error) {
      toast.error("삭제에 실패했습니다.");
    } else {
      toast.success("삭제되었습니다.");
      fetchData();
    }
  };

  const handleExport = () => {
    const csv = [
      ["ID", "제출일시", "이름", ...Object.keys(responses[0] || {}).filter(k => !["id", "created_at", "name", "survey_id"].includes(k))],
      ...responses.map(r => [
        r.id,
        format(new Date(r.created_at), "yyyy-MM-dd HH:mm:ss"),
        r.name,
        ...Object.keys(r).filter(k => !["id", "created_at", "name", "survey_id"].includes(k)).map(k => 
          typeof r[k] === "object" ? JSON.stringify(r[k]) : r[k]
        )
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${survey?.title || "설문조사"}_응답_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
  };

  const getQuestionStats = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return null;

    if (question.question_type === "radio" || question.question_type === "checkbox") {
      const stats = new Map<string, number>();
      
      responses.forEach(response => {
        let answer;
        if (question.question_text.includes("합류")) {
          answer = response.join_class;
        } else if (question.question_text.includes("전형")) {
          answer = response.exam_type;
        } else {
          answer = response[questionId];
        }
        
        if (Array.isArray(answer)) {
          answer.forEach(a => {
            if (a) stats.set(a, (stats.get(a) || 0) + 1);
          });
        } else if (answer) {
          const values = typeof answer === 'string' ? answer.split(',').map(v => v.trim()) : [answer];
          values.forEach(v => {
            if (v) stats.set(v, (stats.get(v) || 0) + 1);
          });
        }
      });
      
      const result = Array.from(stats.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: responses.length > 0 ? ((value / responses.length) * 100).toFixed(1) : 0
      }));
      
      return result.length > 0 ? result : null;
    }

    return null;
  };

  const getTimeRangeStats = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || question.question_type !== "time_range") return null;

    const days = ["토요일", "일요일"];
    const hours = Array.from({ length: 14 }, (_, i) => i + 9); // 9시부터 22시까지
    
    const dayTimeStats: Record<string, Record<number, number>> = {};
    days.forEach(day => {
      dayTimeStats[day] = {};
      hours.forEach(hour => {
        dayTimeStats[day][hour] = 0;
      });
    });

    responses.forEach(response => {
      const timeSlots = response.time_slots || [];
      if (Array.isArray(timeSlots)) {
        timeSlots.forEach((slot: any) => {
          if (slot.day && dayTimeStats[slot.day] && slot.start !== undefined) {
            dayTimeStats[slot.day][slot.start] = (dayTimeStats[slot.day][slot.start] || 0) + 1;
          }
        });
      }
    });

    return { days, hours, stats: dayTimeStats };
  };

  const getStudentsByAnswer = (questionId: string, answerValue: string): Array<{name: string, school: string}> => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return [];

    const students: Array<{name: string, school: string}> = [];
    
    responses.forEach(response => {
      let answer;
      if (question.question_text.includes("합류")) {
        answer = response.join_class;
      } else if (question.question_text.includes("전형")) {
        answer = response.exam_type;
      } else {
        answer = response[questionId];
      }
      
      if (Array.isArray(answer)) {
        if (answer.includes(answerValue)) {
          students.push({ name: response.name, school: response.school });
        }
      } else if (answer) {
        const values = typeof answer === 'string' ? answer.split(',').map(v => v.trim()) : [answer];
        if (values.includes(answerValue)) {
          students.push({ name: response.name, school: response.school });
        }
      }
    });
    
    return students;
  };

  const getStudentsByTimeSlot = (day: string, hour: number): Array<{name: string, school: string}> => {
    const students: Array<{name: string, school: string}> = [];
    
    responses.forEach(response => {
      const timeSlots = response.time_slots || [];
      if (Array.isArray(timeSlots)) {
        const hasSlot = timeSlots.some((slot: any) => 
          slot.day === day && slot.start === hour
        );
        if (hasSlot) {
          students.push({ name: response.name, school: response.school });
        }
      }
    });
    
    return students;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              대시보드로 돌아가기
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData}
                className="hover:bg-primary/5"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport} 
                disabled={responses.length === 0}
                className="hover:bg-accent/10"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Survey Title and Summary */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 shadow-lg border border-primary/20">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">{survey?.title}</h1>
              <p className="text-muted-foreground">{survey?.description}</p>
            </div>
            <div className="bg-card rounded-lg px-6 py-4 shadow-md border border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">총 응답 수</p>
                <p className="text-4xl font-bold text-primary mt-1">{responses.length}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="charts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 bg-muted/50">
            <TabsTrigger value="charts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-5 w-5 mr-2" />
              통계 차트
            </TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TableIcon className="h-5 w-5 mr-2" />
              응답 목록
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            {responses.length === 0 ? (
              <Card className="border-2 border-dashed border-muted-foreground/25">
                <CardContent className="text-center py-16">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-lg text-muted-foreground">아직 응답이 없습니다.</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">첫 번째 응답을 기다리고 있습니다.</p>
                </CardContent>
              </Card>
            ) : (
              questions.map((question) => {
                // Handle time_range questions separately
                if (question.question_type === "time_range") {
                  const timeStats = getTimeRangeStats(question.id);
                  if (!timeStats) return null;

                  const maxCount = Math.max(
                    ...timeStats.days.flatMap(day => 
                      timeStats.hours.map(hour => timeStats.stats[day][hour])
                    )
                  );

                  return (
                    <Card key={question.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-primary">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                        <CardTitle className="text-xl mb-2">{question.question_text}</CardTitle>
                        <CardDescription>
                          {responses.length}개 응답
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {timeStats.days.map(day => (
                            <div key={day} className="bg-muted/30 rounded-lg p-4">
                              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                {day} 시간대별 가능 인원
                              </h4>
                              <div className="space-y-2">
                                {timeStats.hours.map(hour => {
                                  const count = timeStats.stats[day][hour];
                                  const isHighlighted = count > 0 && count >= maxCount * 0.5;
                                  const students = getStudentsByTimeSlot(day, hour);
                                  
                                  return (
                                    <TooltipProvider key={hour}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-2 cursor-pointer">
                                            <div className="w-12 text-sm text-muted-foreground">
                                              {hour}시
                                            </div>
                                            <div className="flex-1 h-8 bg-muted/50 rounded-md overflow-hidden relative">
                                              <div
                                                className={`h-full transition-all ${
                                                  isHighlighted ? 'bg-blue-500' : 'bg-gray-400'
                                                }`}
                                                style={{
                                                  width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%'
                                                }}
                                              />
                                              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
                                                {count > 0 && count}
                                              </div>
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        {count > 0 && (
                                          <TooltipContent side="right" className="max-w-xs">
                                            <div className="space-y-1">
                                              <p className="font-semibold text-sm mb-2">{day} {hour}시 선택 학생 ({count}명)</p>
                                              <div className="max-h-48 overflow-y-auto space-y-1">
                                                {students.map((student, idx) => (
                                                  <p key={idx} className="text-xs">
                                                    {student.name} ({student.school})
                                                  </p>
                                                ))}
                                              </div>
                                            </div>
                                          </TooltipContent>
                                        )}
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Handle other question types
                const stats = getQuestionStats(question.id);
                if (!stats || stats.length === 0) return null;

                return (
                  <Card key={question.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-primary">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                      <CardTitle className="text-xl mb-2">{question.question_text}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {question.question_type === "radio" ? "단일 선택" : "복수 선택"}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span>{responses.length}개 응답</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Stats Table */}
                      <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="font-semibold">선택지</TableHead>
                              <TableHead className="text-right font-semibold">응답 수</TableHead>
                              <TableHead className="text-right font-semibold">비율</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats.map((stat, index) => (
                              <TableRow key={index} className="hover:bg-muted/30">
                                <TableCell className="font-medium">{stat.name}</TableCell>
                                <TableCell className="text-right">
                                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                                    {stat.value}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-accent">
                                  {stat.percentage}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Student Lists by Answer */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-muted-foreground">선택지별 학생 명단</h4>
                        <div className="grid gap-4">
                          {stats.map((stat, index) => {
                            const students = getStudentsByAnswer(question.id, stat.name);
                            return (
                              <div key={index} className="bg-muted/20 rounded-lg p-4 border border-border/50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-foreground">{stat.name}</h5>
                                  <span className="text-sm text-muted-foreground">
                                    {students.length}명
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {students.map((student, idx) => (
                                    <span 
                                      key={idx}
                                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-foreground border border-primary/20"
                                    >
                                      {student.name} ({student.school})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="table">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5 text-primary" />
                  응답 목록
                </CardTitle>
                <CardDescription>
                  {responses.length > 0 ? `총 ${responses.length}개의 응답을 확인할 수 있습니다.` : '아직 응답이 없습니다.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {responses.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <TableIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-lg text-muted-foreground">아직 응답이 없습니다.</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">첫 번째 응답을 기다리고 있습니다.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">제출일시</TableHead>
                          <TableHead className="font-semibold">이름</TableHead>
                          <TableHead className="font-semibold">학교</TableHead>
                          <TableHead className="text-right font-semibold">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {responses.map((response) => (
                          <TableRow key={response.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {format(new Date(response.created_at), "yyyy-MM-dd HH:mm")}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{response.name}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">{response.school}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(response.id)}
                                className="hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SurveyResults;
