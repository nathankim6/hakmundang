import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Target,
  Loader2,
  AlertCircle,
  Trophy,
  Home,
  Send,
  BookOpen
} from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: string[] | null;
  answer: string;
  explanation: string | null;
  grammar_type: string;
  difficulty: string;
}

interface Exam {
  id: string;
  title: string;
  grade: string;
  question_count: number;
  question_ids: string[];
}

const ExamTakePage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(new Date());
  const [showQuestionNav, setShowQuestionNav] = useState(false);

  useEffect(() => {
    const fetchExamAndQuestions = async () => {
      if (!examId) return;

      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .maybeSingle();

      if (examError || !examData) {
        console.error("Error fetching exam:", examError);
        toast({
          title: "시험을 찾을 수 없습니다",
          variant: "destructive",
        });
        navigate("/exams");
        return;
      }

      setExam(examData);

      const questionIds = examData.question_ids as string[];
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .in("id", questionIds);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return;
      }

      const sortedQuestions = questionIds
        .map((id) => questionsData?.find((q) => q.id === id))
        .filter(Boolean)
        .map((q) => ({
          ...q!,
          options: Array.isArray(q!.options) ? q!.options as string[] : null,
        }));

      setQuestions(sortedQuestions as Question[]);
      setIsLoading(false);
    };

    fetchExamAndQuestions();
  }, [examId, navigate, toast]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleSelectAnswer = (answer: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (answeredCount < questions.length) {
      toast({
        title: "모든 문제에 답해주세요",
        description: `${questions.length - answeredCount}문제가 남았습니다`,
        variant: "destructive",
      });
      return;
    }
    setIsSubmitted(true);
    setShowResult(true);
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "상": return "bg-red-500/10 text-red-600 border-red-200";
      case "중": return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "하": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">시험을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const results = calculateResults();
    const elapsedTime = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Simple Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => navigate("/exams")} className="p-2 -ml-2">
              <Home className="w-5 h-5 text-muted-foreground" />
            </button>
            <span className="font-semibold text-sm">시험 결과</span>
            <div className="w-9" />
          </div>
        </header>

        <main className="px-4 pt-20 pb-8">
          <div className="max-w-md mx-auto space-y-6">
            {/* Trophy Section */}
            <div className="text-center pt-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-1">시험 완료!</h1>
              <p className="text-muted-foreground text-sm">{exam?.title}</p>
            </div>

            {/* Score Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
              <CardContent className="p-6 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
                <div className="relative">
                  <p className="text-primary-foreground/80 text-sm mb-2">최종 점수</p>
                  <div className="text-7xl font-bold mb-2">{results.percentage}</div>
                  <p className="text-primary-foreground/90">
                    {results.total}문제 중 {results.correct}문제 정답
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-bold">{minutes}분 {seconds}초</p>
                  <p className="text-xs text-muted-foreground">소요 시간</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-bold">{results.correct}/{results.total}</p>
                  <p className="text-xs text-muted-foreground">정답 개수</p>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => {
                  setShowResult(false);
                  setCurrentIndex(0);
                }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                오답 확인하기
              </Button>
              <Button className="w-full h-12" onClick={() => navigate("/exams")}>
                시험 목록으로
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      {/* Compact Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate("/exams")} className="p-2 -ml-2">
            <Home className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-sm leading-tight">{exam?.title}</p>
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} / {questions.length}
            </p>
          </div>
          <button 
            onClick={() => setShowQuestionNav(!showQuestionNav)}
            className="p-2 -mr-2 relative"
          >
            <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {answeredCount}
            </span>
          </button>
        </div>
        {/* Progress Bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Question Navigation Drawer */}
      {showQuestionNav && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40 pt-14"
            onClick={() => setShowQuestionNav(false)}
          />
          <div className="fixed top-[60px] left-0 right-0 bg-background z-50 p-4 border-b shadow-lg max-h-[50vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">문제 선택</span>
              <span className="text-xs text-muted-foreground">{answeredCount}/{questions.length} 완료</span>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowQuestionNav(false);
                  }}
                  className={`aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                    idx === currentIndex
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : answers[q.id]
                      ? isSubmitted
                        ? answers[q.id] === q.answer
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                        : "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-[68px] pb-24 px-4 overflow-y-auto">
        <div className="max-w-lg mx-auto py-4">
          {/* Question Header */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className={`${getDifficultyColor(currentQuestion.difficulty)} text-xs`}>
              {currentQuestion.difficulty}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.grammar_type}
            </Badge>
          </div>

          {/* Question Card */}
          <Card className="border-0 shadow-lg mb-4">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-2">문제 {currentIndex + 1}</p>
              <div className="text-base leading-relaxed whitespace-pre-wrap font-medium">
                {currentQuestion.question_text}
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options && currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === option;
              const isCorrect = option === currentQuestion.answer;
              const showCorrectness = isSubmitted;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                    showCorrectness
                      ? isCorrect
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : isSelected
                        ? "border-red-500 bg-red-50"
                        : "border-transparent bg-muted/50"
                      : isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      showCorrectness
                        ? isCorrect
                          ? "bg-emerald-500 text-white"
                          : isSelected
                          ? "bg-red-500 text-white"
                          : "bg-muted-foreground/20 text-muted-foreground"
                        : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm">{option}</span>
                    {showCorrectness && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    {showCorrectness && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation (after submit) */}
          {isSubmitted && currentQuestion.explanation && (
            <Card className="mt-4 border-0 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-700 text-sm mb-1">해설</p>
                    <p className="text-blue-600 text-sm leading-relaxed">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t safe-area-bottom">
        <div className="flex items-center justify-between p-3 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            이전
          </Button>

          {/* Progress Indicator */}
          <div className="flex-1 flex justify-center">
            {!isSubmitted && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-primary">{answeredCount}</span>
                <span>/</span>
                <span>{questions.length}</span>
                <span className="ml-1">완료</span>
              </div>
            )}
          </div>

          {currentIndex === questions.length - 1 && !isSubmitted ? (
            <Button 
              size="lg" 
              onClick={handleSubmit}
              className="px-5 bg-gradient-to-r from-primary to-primary/80"
            >
              <Send className="w-4 h-4 mr-2" />
              제출
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="px-4"
            >
              다음
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamTakePage;
