import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Clock, User, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getExamById, saveSubmission, Exam } from '@/lib/examStorageCloud';
import { InteractiveWordBank } from '@/components/exam/InteractiveWordBank';
import orunLogo from '@/assets/orun-academy-logo.jpg';

export default function ExamTake() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) return;
      
      const loadedExam = await getExamById(examId);
      if (!loadedExam) {
        toast({
          title: '시험을 찾을 수 없습니다',
          description: '존재하지 않거나 삭제된 시험입니다.',
          variant: 'destructive',
        });
        navigate('/exam/list');
        return;
      }
      
      setExam(loadedExam);
      setAnswers(new Array(loadedExam.problems?.length || 0).fill(''));
    };
    
    loadExam();
  }, [examId, navigate, toast]);

  const handleStart = () => {
    if (!participantName.trim()) {
      toast({
        title: '이름 필요',
        description: '이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setStarted(true);
  };

  const updateAnswer = useCallback((index: number, value: string) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const normalizeAnswer = (answer: string): string => {
    return answer
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleSubmit = async () => {
    if (!exam || !exam.problems) return;

    setIsSubmitting(true);

    let correctCount = 0;
    const answerDetails: { problemId: string; userAnswer: string; isCorrect: boolean }[] = [];

    exam.problems.forEach((problem, index) => {
      const userAnswer = normalizeAnswer(answers[index] || '');
      const correctAnswer = normalizeAnswer(problem.english);
      const isCorrect = userAnswer === correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }

      answerDetails.push({
        problemId: problem.id,
        userAnswer: answers[index] || '',
        isCorrect,
      });
    });

    const submissionId = await saveSubmission(
      exam.id,
      participantName.trim(),
      affiliation.trim() || null,
      correctCount,
      exam.problems.length,
      answerDetails
    );

    setIsSubmitting(false);

    if (submissionId) {
      setScore(correctCount);
      setSubmitted(true);
      toast({
        title: '제출 완료',
        description: '답안이 제출되었습니다.',
      });
    } else {
      toast({
        title: '제출 실패',
        description: '답안 제출 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    );
  }

  const problems = exam.problems || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/exam/list')}
              className="rounded-full hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20 bg-white shadow-lg shadow-primary/5">
                <img src={orunLogo} alt="ORUN Academy Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  {exam.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  출제자: {exam.creator}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-3xl">
        {!started ? (
          /* 시작 화면 */
          <div className="flex flex-col items-center">
            <Card className="w-full max-w-md border-0 shadow-2xl shadow-primary/5 bg-gradient-to-b from-card to-card/95">
              <CardContent className="p-8 space-y-6">
                {/* 시험 정보 */}
                <div className="text-center pb-6 border-b border-border/50">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">{exam.title}</h2>
                  <p className="text-muted-foreground">
                    {problems.length}문제 · 배열영작
                  </p>
                </div>
                
                {/* 입력 폼 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      이름 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="이름을 입력하세요"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className="h-12 rounded-xl border-border/60 focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="affiliation" className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      소속 <span className="text-muted-foreground text-xs">(선택)</span>
                    </Label>
                    <Input
                      id="affiliation"
                      placeholder="예: 오룬학원 고1A반"
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      className="h-12 rounded-xl border-border/60 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                  onClick={handleStart}
                >
                  시험 시작하기
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : submitted ? (
          /* 결과 화면 */
          <div className="flex flex-col items-center">
            <Card className="w-full max-w-md border-0 shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">제출 완료!</h2>
                <p className="text-muted-foreground">
                  {participantName}님의 답안이 제출되었습니다
                </p>
              </div>
              
              <CardContent className="p-8">
                <div className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">최종 점수</p>
                  <p className="text-5xl font-bold tracking-tight">
                    {score} <span className="text-2xl text-muted-foreground font-normal">/ {problems.length}</span>
                  </p>
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000"
                      style={{ width: `${(score / problems.length) * 100}%` }}
                    />
                  </div>
                  <p className="mt-3 text-lg font-semibold text-primary">
                    {Math.round((score / problems.length) * 100)}점
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => navigate('/exam/list')}>
                    목록으로
                  </Button>
                  <Button className="flex-1 h-11 rounded-xl" onClick={() => navigate('/')}>
                    홈으로
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* 시험 화면 */
          <>
            {/* 상태 바 */}
            <div className="mb-8 p-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg shadow-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{participantName}</p>
                  {affiliation && (
                    <p className="text-sm text-muted-foreground">{affiliation}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {answers.filter(a => a.trim()).length}
                  <span className="text-base text-muted-foreground font-normal"> / {problems.length}</span>
                </p>
                <p className="text-xs text-muted-foreground">완료</p>
              </div>
            </div>

            {/* 문제 목록 */}
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <Card 
                  key={problem.id} 
                  className="border-0 shadow-lg shadow-primary/5 overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/40 to-primary/20" />
                  <CardContent className="p-6">
                    {/* 문제 번호 및 한글 문장 */}
                    <div className="mb-6">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                          {index + 1}
                        </span>
                        <p className="text-lg leading-relaxed pt-1 font-medium">
                          {problem.korean}
                        </p>
                      </div>
                    </div>
                    
                    {/* 인터랙티브 단어 배열 */}
                    <InteractiveWordBank
                      words={problem.shuffled_words}
                      correctAnswer={problem.english}
                      onAnswerChange={(answer) => updateAnswer(index, answer)}
                      problemIndex={index}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 제출 버튼 */}
            <div className="mt-10 flex justify-center">
              <Button 
                size="lg" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-14 px-10 rounded-2xl text-base font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    답안 제출하기
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
