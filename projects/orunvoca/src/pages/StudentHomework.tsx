import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { getCurrentStudent } from "@/utils/student-auth";
import {
  BookOpen, Clock, CheckCircle2, ArrowRight, RefreshCw,
  Trophy, Target, AlertCircle, Play, ChevronLeft, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface HomeworkItem {
  id: string;
  title: string;
  card_set_id: string;
  selected_days: string[];
  due_date: string;
  homework_types: string[];
  is_active: boolean;
  class_name: string;
  grade: string;
}

interface WordData {
  word: string;
  meaning: string;
  example?: string;
  definition?: string;
}

interface QuizQuestion {
  word: string;
  meaning: string;
  type: string;
  choices?: string[];
  correctAnswer: string;
  example?: string;
  definition?: string;
}

type Phase = "list" | "entry" | "quiz" | "result";

const StudentHomework = () => {
  const { toast } = useToast();
  const student = getCurrentStudent();
  
  const [phase, setPhase] = useState<Phase>("list");
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<HomeworkItem | null>(null);
  const [studentName, setStudentName] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Quiz states
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Result states
  const [score, setScore] = useState(0);
  const [wrongWords, setWrongWords] = useState<string[]>([]);
  const [isRetry, setIsRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchHomeworks();
  }, []);

  useEffect(() => {
    if (phase === "quiz" && startTime) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, startTime]);

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const studentData = getCurrentStudent();
      if (!studentData) {
        setLoading(false);
        return;
      }

      // Get homeworks linked to student's access code
      const { data: codeData } = await supabase
        .from("student_access_codes")
        .select("id")
        .eq("access_code", studentData.access_code)
        .single();

      if (!codeData) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("homeworks")
        .select("*")
        .eq("access_code_id", codeData.id)
        .eq("is_active", true)
        .gte("due_date", new Date().toISOString())
        .order("due_date", { ascending: true });

      setHomeworks((data || []) as HomeworkItem[]);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartHomework = async () => {
    if (!studentName.trim() || !phoneLast4.trim() || phoneLast4.length !== 4) {
      toast({ title: "입력 오류", description: "이름과 휴대폰 번호 뒷 4자리를 입력해주세요.", variant: "destructive" });
      return;
    }

    if (!selectedHomework) return;

    try {
      // Fetch word data from card set
      const { data: cardSet } = await supabase
        .from("card_sets")
        .select("word_data, selected_days")
        .eq("id", selectedHomework.card_set_id)
        .single();

      if (!cardSet) {
        toast({ title: "오류", description: "단어장을 찾을 수 없습니다.", variant: "destructive" });
        return;
      }

      const allWords = (cardSet.word_data as any[]) || [];
      
      // Filter by selected days
      const filteredWords = allWords.filter((w: any) => {
        const dayLabel = w.day || w.Day || "";
        return selectedHomework.selected_days.includes(dayLabel);
      });

      if (filteredWords.length === 0) {
        toast({ title: "오류", description: "선택된 DAY에 단어가 없습니다.", variant: "destructive" });
        return;
      }

      // Generate questions based on homework types
      const generatedQuestions = generateQuestions(filteredWords, selectedHomework.homework_types);
      setQuestions(generatedQuestions);
      setStartTime(new Date());
      setPhase("quiz");
    } catch (error) {
      console.error(error);
      toast({ title: "오류", description: "숙제를 불러오는데 실패했습니다.", variant: "destructive" });
    }
  };

  const generateQuestions = (words: any[], types: string[], retryWords?: string[]): QuizQuestion[] => {
    let targetWords = words;
    if (retryWords && retryWords.length > 0) {
      targetWords = words.filter(w => retryWords.includes(w.word || w.Word || ""));
    }

    const questions: QuizQuestion[] = [];
    const shuffled = [...targetWords].sort(() => Math.random() - 0.5);

    for (const wordItem of shuffled) {
      const word = wordItem.word || wordItem.Word || "";
      const meaning = wordItem.meaning || wordItem.Meaning || wordItem.meaning_ko || "";
      const example = wordItem.example || wordItem.Example || "";
      const definition = wordItem.definition || wordItem.Definition || wordItem.english_definition || "";

      for (const type of types) {
        if (type === "meaning") {
          // Generate wrong choices from other words
          const otherMeanings = words
            .filter(w => (w.word || w.Word) !== word)
            .map(w => w.meaning || w.Meaning || w.meaning_ko || "")
            .filter(m => m)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          
          questions.push({
            word, meaning, type: "meaning",
            choices: [meaning, ...otherMeanings].sort(() => Math.random() - 0.5),
            correctAnswer: meaning,
          });
        } else if (type === "spelling") {
          questions.push({
            word, meaning, type: "spelling",
            correctAnswer: word,
          });
        } else if (type === "example" && example) {
          const blankedSentence = example.replace(new RegExp(word, "gi"), "________");
          questions.push({
            word, meaning, type: "example",
            example: blankedSentence,
            correctAnswer: word,
          });
        } else if (type === "definition" && definition) {
          const otherWords = words
            .filter(w => (w.word || w.Word) !== word)
            .map(w => w.word || w.Word || "")
            .filter(w => w)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

          questions.push({
            word, meaning, type: "definition",
            definition,
            choices: [word, ...otherWords].sort(() => Math.random() - 0.5),
            correctAnswer: word,
          });
        }
      }
    }

    return questions.sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: answer }));
  };

  const handleSubmit = async () => {
    if (!selectedHomework || !startTime) return;

    const totalTime = Math.floor((Date.now() - startTime.getTime()) / 1000);
    let correct = 0;
    const wrong: string[] = [];

    questions.forEach((q, idx) => {
      const userAnswer = (answers[idx] || "").trim().toLowerCase();
      const correctAnswer = q.correctAnswer.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correct++;
      } else {
        if (!wrong.includes(q.word)) wrong.push(q.word);
      }
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    setScore(scorePercent);
    setWrongWords(wrong);

    const completed = scorePercent >= 80;
    setIsCompleted(completed);

    try {
      await supabase.from("homework_submissions").insert({
        homework_id: selectedHomework.id,
        student_name: studentName,
        student_phone_last4: phoneLast4,
        student_class: getCurrentStudent()?.class_name || "",
        answers: Object.entries(answers).map(([idx, ans]) => ({
          question_index: Number(idx),
          answer: ans,
          correct: (ans || "").trim().toLowerCase() === questions[Number(idx)].correctAnswer.trim().toLowerCase(),
        })),
        score: scorePercent,
        correct_count: correct,
        total_count: questions.length,
        is_completed: completed,
        retry_count: retryCount,
        wrong_words: wrong,
        time_spent_seconds: totalTime,
        completed_at: completed ? new Date().toISOString() : null,
      });
    } catch (error) {
      console.error("Submit error:", error);
    }

    setPhase("result");
  };

  const handleRetry = () => {
    if (!selectedHomework) return;
    
    // Fetch original words again for retry
    const retryQuestions = questions
      .filter((_, idx) => {
        const userAnswer = (answers[idx] || "").trim().toLowerCase();
        return userAnswer !== questions[idx].correctAnswer.trim().toLowerCase();
      });

    if (retryQuestions.length === 0) return;

    // Regenerate with only wrong words
    setRetryCount(prev => prev + 1);
    setIsRetry(true);
    setAnswers({});
    setCurrentIndex(0);
    setQuestions(retryQuestions.sort(() => Math.random() - 0.5));
    setStartTime(new Date());
    setPhase("quiz");
  };

  const currentQ = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // LIST PHASE
  if (phase === "list") {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">📚 나의 숙제</h1>
          <p className="text-muted-foreground mt-1">할당된 숙제를 확인하고 참여하세요</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">숙제 목록 불러오는 중...</p>
          </div>
        ) : homeworks.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">숙제가 없습니다!</h3>
            <p className="text-muted-foreground">현재 할당된 숙제가 없습니다.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {homeworks.map(hw => {
              const timeLeft = new Date(hw.due_date).getTime() - Date.now();
              const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
              const isUrgent = hoursLeft < 24;

              return (
                <Card key={hw.id} className={`border-2 transition-all hover:shadow-lg ${isUrgent ? "border-amber-400 dark:border-amber-600" : "border-border"}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{hw.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {hw.homework_types.map(t => (
                            <Badge key={t} variant="secondary" className="text-xs">
                              {t === "meaning" ? "📝 뜻 맞추기" : t === "spelling" ? "✍️ 철자" : t === "example" ? "📖 예문" : "🔤 영영"}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            마감: {format(new Date(hw.due_date), "MM/dd HH:mm", { locale: ko })}
                          </span>
                          {isUrgent && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              ⏰ {hoursLeft}시간 남음
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => { setSelectedHomework(hw); setPhase("entry"); }}
                        className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white"
                      >
                        <Play className="w-4 h-4 mr-1" /> 참여하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ENTRY PHASE
  if (phase === "entry") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-2 border-border">
          <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg text-center">
            <CardTitle className="text-white">📝 숙제 시작</CardTitle>
            <p className="text-slate-300 text-sm mt-1">{selectedHomework?.title}</p>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">이름 *</Label>
              <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="이름 입력" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">휴대폰 번호 뒷 4자리 *</Label>
              <Input 
                value={phoneLast4} 
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPhoneLast4(v);
                }}
                placeholder="0000"
                maxLength={4}
                inputMode="numeric"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPhase("list")} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> 뒤로
              </Button>
              <Button onClick={handleStartHomework} className="flex-1 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                시작하기 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // QUIZ PHASE
  if (phase === "quiz" && currentQ) {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{currentIndex + 1} / {questions.length}</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTimer(elapsedTime)}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          {isRetry && (
            <Badge variant="destructive" className="mt-2">🔄 재시험 ({retryCount}회차)</Badge>
          )}
        </div>

        {/* Question Card */}
        <Card className="mt-4 shadow-lg border-2 border-border">
          <CardContent className="p-6">
            {/* Question Type Badge */}
            <div className="mb-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 shadow-sm"
              style={{
                background: currentQ.type === "meaning" 
                  ? "linear-gradient(135deg, hsl(220 90% 96%), hsl(240 80% 94%))"
                  : currentQ.type === "spelling"
                  ? "linear-gradient(135deg, hsl(142 60% 94%), hsl(160 50% 92%))"
                  : currentQ.type === "example"
                  ? "linear-gradient(135deg, hsl(38 90% 94%), hsl(28 80% 92%))"
                  : "linear-gradient(135deg, hsl(280 60% 95%), hsl(300 50% 93%))"
              }}
            >
              <span className="text-lg">
                {currentQ.type === "meaning" ? "📝" : currentQ.type === "spelling" ? "✍️" : currentQ.type === "example" ? "📖" : "🔤"}
              </span>
              <span className="text-sm font-semibold tracking-tight"
                style={{
                  color: currentQ.type === "meaning" ? "hsl(220 70% 45%)"
                    : currentQ.type === "spelling" ? "hsl(142 50% 35%)"
                    : currentQ.type === "example" ? "hsl(28 70% 40%)"
                    : "hsl(280 50% 40%)"
                }}
              >
                {currentQ.type === "meaning" ? "뜻 맞추기" 
                  : currentQ.type === "spelling" ? "철자 쓰기"
                  : currentQ.type === "example" ? "예문 완성"
                  : "영영 풀이"}
              </span>
            </div>

            {/* Question */}
            {currentQ.type === "meaning" && (
              <div>
                <h2 className="text-2xl font-bold text-center my-6">{currentQ.word}</h2>
                <p className="text-center text-muted-foreground mb-6">위 단어의 뜻을 고르세요</p>
                <div className="grid gap-3">
                  {currentQ.choices?.map((choice, i) => (
                    <Button
                      key={i}
                      variant={answers[currentIndex] === choice ? "default" : "outline"}
                      className={`w-full justify-start h-auto py-3 px-4 text-left ${
                        answers[currentIndex] === choice ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleAnswer(choice)}
                    >
                      <span className="text-sm">{choice}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {currentQ.type === "spelling" && (
              <div>
                <h2 className="text-xl font-bold text-center my-6">{currentQ.meaning}</h2>
                <p className="text-center text-muted-foreground mb-6">위 뜻에 해당하는 영어 단어를 입력하세요</p>
                <Input
                  value={answers[currentIndex] || ""}
                  onChange={e => handleAnswer(e.target.value)}
                  placeholder="영어 단어 입력"
                  className="text-center text-lg"
                  autoFocus
                />
              </div>
            )}

            {currentQ.type === "example" && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">빈칸에 들어갈 단어를 입력하세요</p>
                <div className="bg-accent/20 p-4 rounded-lg my-4">
                  <p className="text-base italic">{currentQ.example}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">힌트: {currentQ.meaning}</p>
                <Input
                  value={answers[currentIndex] || ""}
                  onChange={e => handleAnswer(e.target.value)}
                  placeholder="단어 입력"
                  className="text-center text-lg"
                  autoFocus
                />
              </div>
            )}

            {currentQ.type === "definition" && (
              <div>
                <div className="bg-accent/20 p-4 rounded-lg my-4">
                  <p className="text-base">{currentQ.definition}</p>
                </div>
                <p className="text-center text-muted-foreground mb-4">위 정의에 해당하는 단어를 고르세요</p>
                <div className="grid gap-3">
                  {currentQ.choices?.map((choice, i) => (
                    <Button
                      key={i}
                      variant={answers[currentIndex] === choice ? "default" : "outline"}
                      className={`w-full justify-start h-auto py-3 px-4 ${
                        answers[currentIndex] === choice ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleAnswer(choice)}
                    >
                      {choice}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" /> 이전
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-green-600 to-green-500 text-white">
              제출하기 <CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={() => setCurrentIndex(prev => prev + 1)}>
              다음 <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // RESULT PHASE
  if (phase === "result") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            {isCompleted ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">숙제 완료!</h2>
                <p className="text-muted-foreground mb-6">훌륭합니다! 80% 이상 달성했습니다.</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💪</div>
                <h2 className="text-2xl font-bold mb-2">다시 도전해봐요!</h2>
                <p className="text-muted-foreground mb-6">80% 이상 달성해야 완료됩니다.</p>
              </>
            )}

            <div className="bg-accent/20 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold mb-2" style={{
                color: score >= 80 ? "hsl(var(--success))" : "hsl(var(--destructive))"
              }}>
                {score}%
              </div>
              <Progress value={score} className="h-3 mb-3" />
              <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                <span>정답: {questions.length - wrongWords.length}</span>
                <span>오답: {wrongWords.length}</span>
              </div>
            </div>

            {wrongWords.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2">틀린 단어</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {wrongWords.map((w, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">{w}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {!isCompleted && (
                <Button onClick={handleRetry} className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" /> 틀린 단어 다시 풀기
                </Button>
              )}
              <Button variant="outline" onClick={() => {
                setPhase("list");
                setAnswers({});
                setCurrentIndex(0);
                setQuestions([]);
                setIsRetry(false);
                setRetryCount(0);
                fetchHomeworks();
              }}>
                숙제 목록으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default StudentHomework;
