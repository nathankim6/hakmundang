import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, BookOpen, FileText, Languages, Loader2, XCircle, GraduationCap } from 'lucide-react';
import { allHighSchoolQuestions, HighSchoolLevelTestQuestion, hsAnalysisCategories, hsSectionNames } from '@/data/highSchoolLevelTestQuestions';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import orunLogo from '@/assets/orun-academy-logo-level-test.jpg';
import { useTestAnswerPersistence } from '@/hooks/useTestAnswerPersistence';
import { syncAcademyFromUrl, getCurrentAcademy } from '@/utils/academy';

const HighSchoolLevelTest = () => {
  const navigate = useNavigate();
  useEffect(() => { syncAcademyFromUrl(); }, []);
  const [studentName, setStudentName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState<'vocabulary' | 'grammar' | 'practical' | 'reading'>('vocabulary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 답안 저장 훅
  const { loadSavedState, saveState, clearSavedState, markAsLoaded } = useTestAnswerPersistence('high');

  // 저장된 상태 복구 (마운트 시 한 번만 실행)
  useEffect(() => {
    const saved = loadSavedState();
    if (saved) {
      if (saved.studentName) setStudentName(saved.studentName);
      if (saved.studentSchool) setStudentSchool(saved.studentSchool);
      if (saved.studentGrade) setStudentGrade(saved.studentGrade);
      if (saved.answers) setAnswers(saved.answers as any);
      if (saved.currentSection) setCurrentSection(saved.currentSection as 'vocabulary' | 'grammar' | 'practical' | 'reading');
      if (saved.currentQuestionIndex !== undefined) setCurrentQuestionIndex(saved.currentQuestionIndex);
      if (saved.startTime) {
        setStartTime(new Date(saved.startTime));
        setIsStarted(true);
      }
      if (saved.elapsedTime) setElapsedTime(saved.elapsedTime);
      toast.info('이전에 작성하던 답안을 불러왔습니다.');
    } else {
      markAsLoaded();
    }
  }, [loadSavedState, markAsLoaded]);

  // 상태 변경 시 저장 (초기 로드 완료 후에만 동작)
  useEffect(() => {
    if (isStarted || Object.keys(answers).length > 0 || studentName.trim()) {
      saveState({
        studentName,
        studentSchool,
        studentGrade,
        answers,
        currentSection,
        currentQuestionIndex,
        startTime: startTime?.toISOString() || null,
        elapsedTime
      });
    }
  }, [studentName, studentSchool, studentGrade, answers, currentSection, currentQuestionIndex, startTime, elapsedTime, isStarted, saveState]);

  // 섹션별 문제 필터링
  const sectionQuestions = allHighSchoolQuestions.filter(q => q.section === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];

  // 전체 진행률 계산
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = allHighSchoolQuestions.length;
  const progressPercent = (totalAnswered / totalQuestions) * 100;

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!studentName.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }
    if (!studentSchool.trim()) {
      toast.error('학교를 입력해주세요.');
      return;
    }
    if (!studentGrade.trim()) {
      toast.error('학년을 입력해주세요.');
      return;
    }
    setIsStarted(true);
    setStartTime(new Date());
  };

  const handleAnswer = (value: string | number) => {
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // 다음 섹션으로
      const sections: Array<'vocabulary' | 'grammar' | 'practical' | 'reading'> = ['vocabulary', 'grammar', 'practical', 'reading'];
      const currentIdx = sections.indexOf(currentSection);
      if (currentIdx < sections.length - 1) {
        setCurrentSection(sections[currentIdx + 1]);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      // 이전 섹션으로
      const sections: Array<'vocabulary' | 'grammar' | 'practical' | 'reading'> = ['vocabulary', 'grammar', 'practical', 'reading'];
      const currentIdx = sections.indexOf(currentSection);
      if (currentIdx > 0) {
        const prevSection = sections[currentIdx - 1];
        const prevSectionQuestions = allHighSchoolQuestions.filter(q => q.section === prevSection);
        setCurrentSection(prevSection);
        setCurrentQuestionIndex(prevSectionQuestions.length - 1);
      }
    }
  };

  const isCorrect = (question: HighSchoolLevelTestQuestion, answer: string | number | undefined): boolean => {
    if (answer === undefined) return false;

    if (question.inputType === 'choice') {
      return answer === question.correctAnswer;
    } else {
      // 텍스트 입력 - 정답 비교 (대소문자 무시, 공백 제거)
      const studentAnswer = String(answer).toLowerCase().trim();
      
      // correctAnswers 배열이 있으면 그것을 사용
      if (question.correctAnswers) {
        return question.correctAnswers.some(correct => 
          correct.toLowerCase().trim() === studentAnswer
        );
      }
      
      // 기존 correctAnswer 사용
      const correctAnswers = String(question.correctAnswer).toLowerCase().split(',').map(a => a.trim());
      return correctAnswers.some(correct => {
        // 완전 일치 또는 포함 여부 확인
        return correct === studentAnswer || studentAnswer.includes(correct) || correct.includes(studentAnswer);
      });
    }
  };

  const calculateScoresForSubmit = () => {
    const sections: Array<'vocabulary' | 'grammar' | 'practical' | 'reading'> = ['vocabulary', 'grammar', 'practical', 'reading'];

    let totalEarned = 0;
    let totalPossible = 0;

    const sectionScores: Array<{
      section: string;
      sectionName: string;
      totalQuestions: number;
      correctCount: number;
      totalPoints: number;
      earnedPoints: number;
      percentage: number;
    }> = [];

    const subCategoryScores: Record<string, Array<{
      name: string;
      totalQuestions: number;
      correctCount: number;
      percentage: number;
    }>> = {};

    sections.forEach(section => {
      const sectionQs = allHighSchoolQuestions.filter(q => q.section === section);
      let sectionEarned = 0;
      let sectionTotal = 0;
      let correctCount = 0;

      sectionQs.forEach(q => {
        sectionTotal += q.points;
        if (isCorrect(q, answers[q.id])) {
          sectionEarned += q.points;
          correctCount++;
        }
      });

      totalEarned += sectionEarned;
      totalPossible += sectionTotal;

      sectionScores.push({
        section,
        sectionName: hsSectionNames[section],
        totalQuestions: sectionQs.length,
        correctCount,
        totalPoints: sectionTotal,
        earnedPoints: sectionEarned,
        percentage: Math.round((sectionEarned / sectionTotal) * 100)
      });

      // Sub-category scores
      const categoryData = hsAnalysisCategories[section as keyof typeof hsAnalysisCategories];
      if (categoryData) {
        subCategoryScores[section] = categoryData.subCategories.map(sub => {
          const subQuestions = allHighSchoolQuestions.filter(q => sub.questions.includes(q.id));
          const subCorrect = subQuestions.filter(q => isCorrect(q, answers[q.id])).length;
          return {
            name: sub.name,
            totalQuestions: subQuestions.length,
            correctCount: subCorrect,
            percentage: subQuestions.length > 0 ? Math.round((subCorrect / subQuestions.length) * 100) : 0
          };
        });
      }
    });

    const overallPercentage = Math.round((totalEarned / totalPossible) * 100);

    let level = 'Beginner';
    if (overallPercentage >= 90) level = 'Advanced';
    else if (overallPercentage >= 75) level = 'Upper-Intermediate';
    else if (overallPercentage >= 60) level = 'Intermediate';
    else if (overallPercentage >= 45) level = 'Pre-Intermediate';
    else if (overallPercentage >= 30) level = 'Elementary';

    return {
      sectionScores,
      subCategoryScores,
      totalScore: overallPercentage,
      level
    };
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { sectionScores, subCategoryScores, totalScore, level } = calculateScoresForSubmit();

      const { data, error } = await supabase
        .from('level_test_results')
        .insert({
          student_name: studentName,
          student_school: studentSchool,
          student_grade: studentGrade,
          answers: answers,
          total_score: totalScore,
          level: `고등_${level}`,
          section_scores: sectionScores,
          sub_category_scores: subCategoryScores,
          elapsed_time: elapsedTime,
          academy: getCurrentAcademy()
        })
        .select()
        .single();

      if (error) throw error;

      clearSavedState(); // 제출 성공 시 저장된 상태 삭제
      toast.success('시험이 제출되었습니다!');
      navigate('/level-test/complete');
    } catch (error) {
      console.error('Failed to save test result:', error);
      toast.error('결과 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'vocabulary':
        return <Languages className="w-5 h-5" />;
      case 'grammar':
        return <FileText className="w-5 h-5" />;
      case 'practical':
        return <GraduationCap className="w-5 h-5" />;
      case 'reading':
        return <BookOpen className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getSectionName = (section: string) => hsSectionNames[section] || section;

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'vocabulary':
        return 'bg-purple-500';
      case 'grammar':
        return 'bg-blue-500';
      case 'practical':
        return 'bg-teal-500';
      case 'reading':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 시작 화면
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur">
            <div className="text-center mb-6">
              <img 
                src={orunLogo} 
                alt="Orun Academy Logo" 
                className="w-24 h-24 mx-auto mb-4 object-contain" 
              />
              <h1 className="text-2xl font-bold mb-2 elegant-shimmer-text">High School Level Test</h1>
              <p className="text-slate-600 text-sm">옳은영어 고등부 레벨테스트</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                {/* Subtle decorative pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.06),transparent_50%)]" />
                
                <div className="relative">
                  <div className="flex items-center justify-center gap-2.5 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Test Structure</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                    {[
                      { label: '어휘', count: 7 },
                      { label: '문법', count: 8 },
                      { label: '영작', count: 3 },
                      { label: '독해', count: 4 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                        <span className="text-[11px] font-medium text-slate-600">{item.label}</span>
                        <span className="text-[11px] font-bold text-slate-800">{item.count}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 shadow-sm">
                      <span className="text-xs text-slate-300">총</span>
                      <span className="text-lg font-bold text-white">22</span>
                      <span className="text-xs text-slate-300">문항</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-700">이름</Label>
                <Input 
                  id="name" 
                  value={studentName} 
                  onChange={(e) => setStudentName(e.target.value)} 
                  placeholder="이름+휴대폰번호 뒷4자리를 입력하세요.(예시: 김옳은5554)" 
                  className="mt-1 placeholder:text-[10px] sm:placeholder:text-xs" 
                />
              </div>
              <div>
                <Label htmlFor="school" className="text-slate-700">학교</Label>
                <Input 
                  id="school" 
                  value={studentSchool} 
                  onChange={(e) => setStudentSchool(e.target.value)} 
                  placeholder="예: 성남고, 흑석고" 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="grade" className="text-slate-700">학년</Label>
                <Input 
                  id="grade" 
                  value={studentGrade} 
                  onChange={(e) => setStudentGrade(e.target.value)} 
                  placeholder="예: 1" 
                  className="mt-1" 
                />
              </div>
            </div>

            <Button 
              className="w-full mt-6 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950" 
              onClick={handleStart}
            >
              시험 시작하기
            </Button>

            <Button 
              variant="ghost" 
              className="w-full mt-2" 
              onClick={() => navigate('/')}
            >
              돌아가기
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // 시험 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getSectionColor(currentSection)}`}>
                {getSectionIcon(currentSection)}
                <span className="ml-1">{getSectionName(currentSection)}</span>
              </span>
              <span className="text-slate-600 text-sm">
                {currentQuestionIndex + 1} / {sectionQuestions.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>진행률: {totalAnswered}/{totalQuestions}문항</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
        </div>
      </div>

      {/* 문제 영역 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentQuestion && (
          <Card className="p-3 sm:p-4 shadow-lg border-0 bg-white/90 backdrop-blur relative">
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-slate-700">
                  {currentQuestion.id}번
                </span>
                <span className={`px-1.5 py-0.5 rounded text-xs text-white ${getSectionColor(currentSection)}`}>
                  {currentQuestion.subCategory}
                </span>
                <span className="text-xs text-slate-500">
                  {currentQuestion.points}점
                </span>
              </div>

              {/* 지시문과 문제 분리 */}
              {(() => {
                const parts = currentQuestion.questionText.split('\n\n');
                const instruction = parts[0];
                const questionSentence = parts.slice(1).join('\n\n');
                
                return (
                  <>
                    <div className="relative bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200/80 mb-2">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-l-lg" />
                      <p 
                        className="text-sm font-semibold text-slate-800 pl-2 [&_em]:italic [&_em]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: instruction }}
                      />
                    </div>
                    {questionSentence && (
                      <div 
                        className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 leading-relaxed text-justify [&_u]:underline [&_strong]:font-bold"
                        dangerouslySetInnerHTML={{ __html: questionSentence }}
                      />
                    )}
                  </>
                );
              })()}

              {/* 문장 삽입 문제: 삽입할 문장 먼저 표시 */}
              {currentQuestion.subCategory === '문장 삽입' && currentQuestion.questionContent && (
                <div 
                  className="mt-2 p-2 bg-white rounded-lg text-slate-800 text-sm leading-relaxed border border-slate-400 [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.questionContent }}
                />
              )}

              {/* 지문 표시 */}
              {currentQuestion.passageText && (
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p 
                    className="text-slate-700 text-sm leading-relaxed [&_u]:underline [&_strong]:font-bold"
                    dangerouslySetInnerHTML={{ __html: currentQuestion.passageText }}
                  />
                </div>
              )}

              {/* 추가 내용 표시 (문장 삽입 제외) */}
              {currentQuestion.subCategory !== '문장 삽입' && currentQuestion.questionContent && (
                <div 
                  className="mt-2 p-2 bg-amber-50 rounded-lg text-slate-700 whitespace-pre-line text-sm leading-relaxed border border-amber-200 [&_u]:underline [&_strong]:font-bold [&_.hs-box]:inline [&_.hs-box]:border [&_.hs-box]:border-slate-500 [&_.hs-box]:px-1 [&_.hs-box]:py-0.5 [&_.hs-box]:rounded [&_.hs-box]:bg-white/50"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.questionContent }}
                />
              )}
            </div>

            {/* 답안 입력 영역 */}
            <div className="mt-3">
              {currentQuestion.inputType === 'choice' && currentQuestion.options && (
                <RadioGroup 
                  value={answers[currentQuestion.id]?.toString() || ''} 
                  onValueChange={(value) => handleAnswer(parseInt(value))} 
                  className="space-y-1"
                >
                  {currentQuestion.options.map((option, idx) => (
                    <label 
                      key={idx} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                        answers[currentQuestion.id] === idx + 1 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <RadioGroupItem value={(idx + 1).toString()} className="h-4 w-4" />
                      <span className="text-slate-700 whitespace-pre-line">
                        {option}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.inputType === 'text' && (
                <Textarea 
                  value={(answers[currentQuestion.id] as string) || ''} 
                  onChange={(e) => handleAnswer(e.target.value)} 
                  placeholder="정답을 입력하세요" 
                  className="min-h-[60px] text-sm" 
                />
              )}
            </div>
          </Card>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-6 gap-3">
          <Button 
            variant="outline" 
            onClick={handlePrev} 
            disabled={currentSection === 'vocabulary' && currentQuestionIndex === 0} 
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전
          </Button>

          {currentSection === 'reading' && currentQuestionIndex === sectionQuestions.length - 1 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  제출 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  제출하기
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              className="flex-1 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950"
            >
              다음
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* 시험 중단 버튼 */}
        <div className="flex justify-center mt-4">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (window.confirm('정말 시험을 중단하시겠습니까? 모든 답안이 초기화됩니다.')) {
                setIsStarted(false);
                setAnswers({});
                setCurrentSection('vocabulary');
                setCurrentQuestionIndex(0);
                setElapsedTime(0);
              }
            }}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <XCircle className="w-4 h-4 mr-2" />
            시험 중단하기
          </Button>
        </div>

        {/* 섹션 네비게이션 */}
        <div className="mt-6 flex justify-center gap-2">
          {(['vocabulary', 'grammar', 'practical', 'reading'] as const).map(section => {
            const sectionQs = allHighSchoolQuestions.filter(q => q.section === section);
            const answeredCount = sectionQs.filter(q => answers[q.id] !== undefined).length;
            const isComplete = answeredCount === sectionQs.length;

            return (
              <button 
                key={section} 
                onClick={() => {
                  setCurrentSection(section);
                  setCurrentQuestionIndex(0);
                }} 
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentSection === section 
                    ? `${getSectionColor(section)} text-white` 
                    : isComplete 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {getSectionName(section)}
                <span className="ml-1">({answeredCount}/{sectionQs.length})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HighSchoolLevelTest;
