import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, BookOpen, FileText, PenLine, Languages, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { allLevelTestQuestions, LevelTestQuestion, analysisCategories } from '@/data/levelTestQuestions';
import { toast } from "sonner";
import { useVocabularyDistractors } from '@/hooks/useVocabularyDistractors';
import { supabase } from '@/integrations/supabase/client';
import brainiacLogo from '@/assets/brainiac-logo.png.asset.json';
import { useTestAnswerPersistence } from '@/hooks/useTestAnswerPersistence';
import { syncAcademyFromUrl, getCurrentAcademy } from '@/utils/academy';
const LevelTest = () => {
  const navigate = useNavigate();
  // Persist academy code from URL (e.g. /level-test?academy=brainiac) for tagging submissions
  useEffect(() => { 
    const academy = syncAcademyFromUrl(); 
    if (academy === 'brainiac') {
      navigate('/level-test/prep?academy=brainiac');
      return;
    }
  }, [navigate]);
  const [studentName, setStudentName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState<'grammar' | 'reading' | 'vocabulary' | 'sentence'>('grammar');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number | string[] | {
    subjects: string[];
    verbs: string[];
  }>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // 답안 저장 훅
  const { loadSavedState, saveState, clearSavedState, markAsLoaded } = useTestAnswerPersistence('middle');

  // 저장된 상태 복구 (마운트 시 한 번만 실행)
  useEffect(() => {
    const saved = loadSavedState();
    if (saved) {
      if (saved.studentName) setStudentName(saved.studentName);
      if (saved.studentSchool) setStudentSchool(saved.studentSchool);
      if (saved.studentGrade) setStudentGrade(saved.studentGrade);
      if (saved.answers) setAnswers(saved.answers as any);
      if (saved.currentSection) setCurrentSection(saved.currentSection as 'grammar' | 'reading' | 'vocabulary' | 'sentence');
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

  // 어휘 문제 선지 생성 훅
  const {
    generateDistractors,
    getDistractors,
    isLoading: isDistractorLoading,
    isInitialLoading
  } = useVocabularyDistractors();

  // 섹션별 문제 필터링
  const sectionQuestions = allLevelTestQuestions.filter(q => q.section === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];

  // 이미지 프리로딩 (테스트 시작 전에 미리 로드)
  useEffect(() => {
    const imagesToPreload = allLevelTestQuestions.filter(q => q.chartImage).map(q => q.chartImage as string);
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // 어휘 문제일 경우 선지 자동 생성
  useEffect(() => {
    if (isStarted && currentQuestion?.section === 'vocabulary' && !isInitialLoading) {
      generateDistractors(currentQuestion.id);
    }
  }, [isStarted, currentQuestion?.id, currentQuestion?.section, generateDistractors, isInitialLoading]);

  // 전체 진행률 계산
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = allLevelTestQuestions.length;
  const progressPercent = totalAnswered / totalQuestions * 100;

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
  type SentenceAnswer = {
    subjects: string[];
    verbs: string[];
  };
  const handleAnswer = (value: string | number | string[] | SentenceAnswer) => {
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
      const sections: Array<'grammar' | 'reading' | 'vocabulary' | 'sentence'> = ['grammar', 'reading', 'vocabulary', 'sentence'];
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
      const sections: Array<'grammar' | 'reading' | 'vocabulary' | 'sentence'> = ['grammar', 'reading', 'vocabulary', 'sentence'];
      const currentIdx = sections.indexOf(currentSection);
      if (currentIdx > 0) {
        const prevSection = sections[currentIdx - 1];
        const prevSectionQuestions = allLevelTestQuestions.filter(q => q.section === prevSection);
        setCurrentSection(prevSection);
        setCurrentQuestionIndex(prevSectionQuestions.length - 1);
      }
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  type AnswerType = string | number | string[] | SentenceAnswer | undefined;
  const isCorrect = (question: LevelTestQuestion, answer: AnswerType): boolean => {
    if (answer === undefined) return false;

    // 문장 구조 분석 - 클릭 선택
    if (question.inputType === 'sentenceClick' && question.correctSubjects && question.correctVerbs) {
      const sentenceAnswer = answer as SentenceAnswer;
      if (!sentenceAnswer.subjects || !sentenceAnswer.verbs) return false;
      const selectedSubjects = sentenceAnswer.subjects.map(s => s.split('-')[1]);
      const selectedVerbs = sentenceAnswer.verbs.map(v => v.split('-')[1]);

      // 정답과 비교 (순서 무관)
      const correctSubjects = question.correctSubjects;
      const correctVerbs = question.correctVerbs;
      const subjectsMatch = correctSubjects.length === selectedSubjects.length && correctSubjects.every(s => selectedSubjects.includes(s));
      const verbsMatch = correctVerbs.length === selectedVerbs.length && correctVerbs.every(v => selectedVerbs.includes(v));
      return subjectsMatch && verbsMatch;
    }

    // 다중 선택 문제 (어휘)
    if (question.inputType === 'multiChoice' && question.correctAnswers) {
      if (!Array.isArray(answer)) return false;
      const selectedAnswers = answer as string[];
      const correctAnswers = question.correctAnswers;
      // 정답 개수와 선택 개수가 같고, 모든 정답이 선택되어야 함
      if (selectedAnswers.length !== correctAnswers.length) return false;
      return correctAnswers.every(correct => selectedAnswers.includes(correct));
    }
    if (question.inputType === 'choice') {
      return answer === question.correctAnswer;
    } else {
      const correctAnswers = String(question.correctAnswer).toLowerCase().split(',').map(a => a.trim());
      const studentAnswer = String(answer).toLowerCase().trim();
      if (question.section === 'vocabulary') {
        return correctAnswers.some(correct => studentAnswer.includes(correct) || correct.includes(studentAnswer));
      }
      return correctAnswers.some(correct => correct === studentAnswer);
    }
  };
  const calculateScoresForSubmit = () => {
    const sections: Array<'grammar' | 'reading' | 'vocabulary' | 'sentence'> = ['grammar', 'reading', 'vocabulary', 'sentence'];
    const sectionNames: Record<string, string> = {
      grammar: '문법',
      reading: '독해',
      vocabulary: '어휘',
      sentence: '문장 구조'
    };
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
      const sectionQuestions = allLevelTestQuestions.filter(q => q.section === section);
      let sectionEarned = 0;
      let sectionTotal = 0;
      let correctCount = 0;
      sectionQuestions.forEach(q => {
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
        sectionName: sectionNames[section],
        totalQuestions: sectionQuestions.length,
        correctCount,
        totalPoints: sectionTotal,
        earnedPoints: sectionEarned,
        percentage: Math.round(sectionEarned / sectionTotal * 100)
      });
      const categoryData = analysisCategories[section as keyof typeof analysisCategories];
      if (categoryData) {
        subCategoryScores[section] = categoryData.subCategories.map(sub => {
          const subQuestions = allLevelTestQuestions.filter(q => sub.questions.includes(q.id));
          const subCorrect = subQuestions.filter(q => isCorrect(q, answers[q.id])).length;
          return {
            name: sub.name,
            totalQuestions: subQuestions.length,
            correctCount: subCorrect,
            percentage: subQuestions.length > 0 ? Math.round(subCorrect / subQuestions.length * 100) : 0
          };
        });
      }
    });
    const overallPercentage = Math.round(totalEarned / totalPossible * 100);
    let level = 'Beginner';
    if (overallPercentage >= 90) level = 'Advanced';else if (overallPercentage >= 75) level = 'Upper-Intermediate';else if (overallPercentage >= 60) level = 'Intermediate';else if (overallPercentage >= 45) level = 'Pre-Intermediate';else if (overallPercentage >= 30) level = 'Elementary';
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
      const {
        sectionScores,
        subCategoryScores,
        totalScore,
        level
      } = calculateScoresForSubmit();
      const {
        data,
        error
      } = await supabase.from('level_test_results').insert({
        student_name: studentName,
        student_school: studentSchool,
        student_grade: studentGrade,
        answers: answers,
        total_score: totalScore,
        level: level,
        section_scores: sectionScores,
        sub_category_scores: subCategoryScores,
        elapsed_time: elapsedTime,
        academy: getCurrentAcademy()
      }).select().single();
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
      case 'grammar':
        return <FileText className="w-5 h-5" />;
      case 'reading':
        return <BookOpen className="w-5 h-5" />;
      case 'vocabulary':
        return <Languages className="w-5 h-5" />;
      case 'sentence':
        return <PenLine className="w-5 h-5" />;
      default:
        return null;
    }
  };
  const getSectionName = (section: string) => {
    switch (section) {
      case 'grammar':
        return '문법';
      case 'reading':
        return '독해';
      case 'vocabulary':
        return '어휘';
      case 'sentence':
        return '문장 구조';
      default:
        return '';
    }
  };
  const getSectionColor = (section: string) => {
    switch (section) {
      case 'grammar':
        return 'bg-blue-500';
      case 'reading':
        return 'bg-green-500';
      case 'vocabulary':
        return 'bg-purple-500';
      case 'sentence':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 시작 화면
  if (!isStarted) {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur">
            <div className="text-center mb-6">
              <img src={brainiacLogo.url} alt="Brainiac English Logo" className="w-24 h-24 mx-auto mb-4 object-contain" />
              <h1 className="text-2xl font-display font-black mb-2 tracking-tight uppercase elegant-shimmer-text">
                BRAINIAC ENGLISH
                <br />
                LEVEL TEST
              </h1>
              <p className="text-gray-600 text-sm">브래니악 영어 진단평가 중등부 · BEAT</p>
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
                    {(getCurrentAcademy() === 'brainiac'
                      ? [
                          { label: '문법', count: 87 },
                          { label: '독해', count: 8 },
                          { label: '어휘', count: 50 },
                        ]
                      : [
                          { label: '문법', count: 30 },
                          { label: '독해', count: 10 },
                          { label: '어휘', count: 50 },
                          { label: '구문', count: 10 },
                        ]
                    ).map((item, idx) => <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                        <span className="text-[11px] font-medium text-slate-600">{item.label}</span>
                        <span className="text-[11px] font-bold text-slate-800">{item.count}</span>
                      </div>)}
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 shadow-sm">
                      <span className="text-xs text-slate-300">총</span>
                      <span className="text-lg font-bold text-white">{getCurrentAcademy() === 'brainiac' ? 145 : 100}</span>
                      <span className="text-xs text-slate-300">문항</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">이름</Label>
                <Input id="name" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="이름+휴대폰번호 뒷4자리를 입력하세요.(예시: 김옳은5554)" className="mt-1 placeholder:text-[10px] sm:placeholder:text-xs" />
              </div>
              <div>
                <Label htmlFor="school" className="text-gray-700">학교</Label>
                <Input id="school" value={studentSchool} onChange={e => setStudentSchool(e.target.value)} placeholder="예: 중대부중, 신길중" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="grade" className="text-gray-700">학년</Label>
                <Input id="grade" value={studentGrade} onChange={e => setStudentGrade(e.target.value)} placeholder="예: 1" className="mt-1" />
              </div>
            </div>

            <Button className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" onClick={handleStart}>
              시험 시작하기
            </Button>

            <Button variant="ghost" className="w-full mt-2" onClick={() => navigate('/')}>
              돌아가기
            </Button>
          </Card>
        </div>
      </div>;
  }

  // 시험 화면
  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getSectionColor(currentSection)}`}>
                {getSectionIcon(currentSection)}
                <span className="ml-1">{getSectionName(currentSection)}</span>
              </span>
              <span className="text-gray-600 text-sm">
                {currentQuestionIndex + 1} / {sectionQuestions.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>진행률: {totalAnswered}/{totalQuestions}문항</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
        </div>
      </div>

      {/* 문제 영역 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentQuestion && <Card className="p-3 sm:p-4 shadow-lg border-0 bg-white/90 backdrop-blur relative">
            {/* 어휘 문제 선지 재생성 버튼 */}
            {currentQuestion.section === 'vocabulary' && <Button variant="ghost" size="sm" onClick={() => generateDistractors(currentQuestion.id, true)} disabled={isDistractorLoading(currentQuestion.id)} className="absolute top-2 right-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7 px-2">
                {isDistractorLoading(currentQuestion.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                <span className="ml-1 text-xs">재생성</span>
              </Button>}
            
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-slate-700">
                  {currentQuestion.id}번
                </span>
                <span className={`px-1.5 py-0.5 rounded text-xs text-white ${getSectionColor(currentSection)}`}>
                  {currentQuestion.subCategory}
                </span>
                <span className="text-xs text-gray-500">
                  {currentQuestion.points}점
                </span>
              </div>
              
              {currentQuestion.section === 'vocabulary' ? <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200/80">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-l-lg" />
                  <span className="text-xl font-bold text-indigo-600 pl-2">{currentQuestion.questionText}</span>
                </div> : <div className="relative bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200/80">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-l-lg" />
                  <h2 className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line pl-2">
                    {currentQuestion.questionText}
                  </h2>
                </div>}

              {currentQuestion.chartImage && <div className="mt-2 w-full overflow-hidden">
                  <img src={currentQuestion.chartImage} alt="도표" className="w-full max-w-md mx-auto h-auto object-contain rounded-lg border border-gray-200" loading="eager" />
                </div>}
              
              {currentQuestion.questionContent && <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-line text-sm leading-relaxed text-justify border" dangerouslySetInnerHTML={{
            __html: currentQuestion.questionContent.replace(/\n/g, '<br/>')
          }} />}
            </div>

            {/* 답안 입력 영역 */}
            <div className="mt-3">
              {currentQuestion.inputType === 'choice' && currentQuestion.options && <RadioGroup value={answers[currentQuestion.id]?.toString() || ''} onValueChange={value => handleAnswer(parseInt(value))} className="space-y-1">
                  {currentQuestion.options.map((option, idx) => <label key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${answers[currentQuestion.id] === idx + 1 ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <RadioGroupItem value={(idx + 1).toString()} className="h-4 w-4" />
                      <span className="text-gray-700" dangerouslySetInnerHTML={{
                __html: option
              }} />
                    </label>)}
                </RadioGroup>}

              {/* 어휘 문제 - 다중 선택 */}
              {currentQuestion.section === 'vocabulary' && currentQuestion.inputType === 'multiChoice' && <div>
                  <p className="text-xs text-gray-500 mb-2">이 단어에 해당하는 뜻을 모두 고르시오.</p>
                  {isDistractorLoading(currentQuestion.id) || isInitialLoading ? <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-500 mr-2" />
                      <span className="text-gray-600 text-sm">선지 생성 중...</span>
                    </div> : getDistractors(currentQuestion.id) ? <div className="space-y-1">
                      {getDistractors(currentQuestion.id)!.options.map((option, idx) => {
                const selectedAnswers = answers[currentQuestion.id] as string[] || [];
                const isSelected = selectedAnswers.includes(option);
                return <label key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                            <Checkbox checked={isSelected} onCheckedChange={checked => {
                    const current = answers[currentQuestion.id] as string[] || [];
                    if (checked) {
                      handleAnswer([...current, option]);
                    } else {
                      handleAnswer(current.filter(a => a !== option));
                    }
                  }} className="h-4 w-4" />
                            <span className="text-gray-700 text-sm">{option}</span>
                          </label>;
              })}
                    </div> : <div className="text-center py-4 text-gray-500 text-sm">
                      선지를 불러오는 중 오류가 발생했습니다.
                      <Button variant="outline" size="sm" className="ml-2" onClick={() => generateDistractors(currentQuestion.id)}>
                        다시 시도
                      </Button>
                    </div>}
                </div>}

              {/* 문장 구조 분석 - 클릭 선택 */}
              {currentQuestion.inputType === 'sentenceClick' && currentQuestion.sentenceWords && <div>
                  <p className="text-xs text-gray-500 mb-2">
                    <span className="font-medium text-indigo-600">더블 클릭</span> = 주어(S) | 
                    <span className="font-medium text-emerald-600 ml-1">한 번 클릭</span> = 동사(V)
                  </p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex flex-wrap gap-1.5 leading-relaxed">
                      {currentQuestion.sentenceWords.map((word, idx) => {
                  const answer = answers[currentQuestion.id] as {
                    subjects: string[];
                    verbs: string[];
                  } | undefined;
                  const subjects = answer?.subjects || [];
                  const verbs = answer?.verbs || [];
                  const isSubject = subjects.includes(`${idx}-${word}`);
                  const isVerb = verbs.includes(`${idx}-${word}`);
                  return <span key={idx} onClick={() => {
                    // 한번 클릭 - 동사 토글
                    const currentAnswer = answers[currentQuestion.id] as {
                      subjects: string[];
                      verbs: string[];
                    } || {
                      subjects: [],
                      verbs: []
                    };
                    const wordKey = `${idx}-${word}`;
                    if (isVerb) {
                      // 이미 동사면 해제
                      handleAnswer({
                        ...currentAnswer,
                        verbs: currentAnswer.verbs.filter(v => v !== wordKey)
                      });
                    } else if (isSubject) {
                      // 주어면 주어 해제
                      handleAnswer({
                        ...currentAnswer,
                        subjects: currentAnswer.subjects.filter(s => s !== wordKey)
                      });
                    } else {
                      // 동사로 추가
                      handleAnswer({
                        ...currentAnswer,
                        verbs: [...currentAnswer.verbs, wordKey]
                      });
                    }
                  }} onDoubleClick={e => {
                    e.preventDefault();
                    // 더블클릭 - 주어 토글
                    const currentAnswer = answers[currentQuestion.id] as {
                      subjects: string[];
                      verbs: string[];
                    } || {
                      subjects: [],
                      verbs: []
                    };
                    const wordKey = `${idx}-${word}`;
                    if (isSubject) {
                      // 이미 주어면 해제
                      handleAnswer({
                        ...currentAnswer,
                        subjects: currentAnswer.subjects.filter(s => s !== wordKey)
                      });
                    } else {
                      // 동사였으면 동사에서 제거하고 주어로
                      handleAnswer({
                        subjects: [...currentAnswer.subjects.filter(s => s !== wordKey), wordKey],
                        verbs: currentAnswer.verbs.filter(v => v !== wordKey)
                      });
                    }
                  }} className={`
                              text-xl md:text-2xl font-medium px-2 py-1 rounded-lg cursor-pointer select-none transition-all
                              ${isSubject ? 'bg-indigo-500 text-white ring-2 ring-indigo-300 shadow-lg' : isVerb ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 shadow-lg' : 'hover:bg-slate-200 text-slate-700'}
                            `}>
                            {word}
                            {isSubject && <span className="ml-1 text-xs font-bold">(S)</span>}
                            {isVerb && <span className="ml-1 text-xs font-bold">(V)</span>}
                          </span>;
                })}
                    </div>
                  </div>
                  
                  {/* 선택 현황 */}
                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-indigo-500 rounded"></span>
                      <span className="text-gray-600">
                        주어(S): {((answers[currentQuestion.id] as {
                    subjects: string[];
                    verbs: string[];
                  })?.subjects || []).map(s => s.split('-')[1]).join(', ') || '없음'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-emerald-500 rounded"></span>
                      <span className="text-gray-600">
                        동사(V): {((answers[currentQuestion.id] as {
                    subjects: string[];
                    verbs: string[];
                  })?.verbs || []).map(v => v.split('-')[1]).join(', ') || '없음'}
                      </span>
                    </div>
                  </div>
                </div>}

              {/* 문장 구조 분석 등 다른 텍스트 입력 */}
              {currentQuestion.inputType === 'text' && currentQuestion.section !== 'vocabulary' && <Textarea value={answers[currentQuestion.id] as string || ''} onChange={e => handleAnswer(e.target.value)} placeholder="답안을 입력하세요" className="min-h-[120px]" />}
            </div>
          </Card>}

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-6 gap-3">
          <Button variant="outline" onClick={handlePrev} disabled={currentSection === 'grammar' && currentQuestionIndex === 0} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전
          </Button>

        {currentSection === 'sentence' && currentQuestionIndex === sectionQuestions.length - 1 ? <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              {isSubmitting ? <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  제출 중...
                </> : <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  제출하기
                </>}
            </Button> : <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              다음
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>}
        </div>

        {/* 시험 중단 버튼 */}
        <div className="flex justify-center mt-4">
          <Button variant="ghost" onClick={() => {
          if (window.confirm('정말 시험을 중단하시겠습니까? 모든 답안이 초기화됩니다.')) {
            setIsStarted(false);
            setAnswers({});
            setCurrentSection('grammar');
            setCurrentQuestionIndex(0);
            setElapsedTime(0);
          }
        }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <XCircle className="w-4 h-4 mr-2" />
            시험 중단하기
          </Button>
        </div>

        {/* 섹션 네비게이션 */}
        <div className="mt-6 flex justify-center gap-2">
          {(['grammar', 'reading', 'vocabulary', 'sentence'] as const).map(section => {
          const sectionQs = allLevelTestQuestions.filter(q => q.section === section);
          const answeredCount = sectionQs.filter(q => answers[q.id] !== undefined).length;
          const isComplete = answeredCount === sectionQs.length;
          return <button key={section} onClick={() => {
            setCurrentSection(section);
            setCurrentQuestionIndex(0);
          }} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${currentSection === section ? `${getSectionColor(section)} text-white` : isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {getSectionName(section)}
                <span className="ml-1">({answeredCount}/{sectionQs.length})</span>
              </button>;
        })}
        </div>
      </div>
    </div>;
};
export default LevelTest;