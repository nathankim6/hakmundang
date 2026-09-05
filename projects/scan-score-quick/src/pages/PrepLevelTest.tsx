import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, BookOpen, FileText, Languages, Loader2, XCircle } from 'lucide-react';
import { allPrepQuestions, PrepLevelTestQuestion, prepAnalysisCategories, prepSectionNames, calculatePrepTotalMaxScore, getPrepQuestionPoints } from '@/data/prepLevelTestQuestions';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import brainiacLogo from '@/assets/brainiac-logo.png.asset.json';
import { usePrepVocabularyDistractors } from '@/hooks/usePrepVocabularyDistractors';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTestAnswerPersistence } from '@/hooks/useTestAnswerPersistence';
import { syncAcademyFromUrl, getCurrentAcademy } from '@/utils/academy';
type SectionType = 'reading' | 'grammarA' | 'grammarB' | 'grammarC' | 'vocabulary' | 'sentenceAnalysis';
const PrepLevelTest = () => {
  const navigate = useNavigate();
  useEffect(() => { syncAcademyFromUrl(); }, []);
  const [studentName, setStudentName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionType>('reading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number | number[] | string[] | {
    subjects: string[];
    verbs: string[];
  }>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAbortDialog, setShowAbortDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 답안 저장 훅
  const { loadSavedState, saveState, clearSavedState, markAsLoaded } = useTestAnswerPersistence('prep');

  // 저장된 상태 복구 (마운트 시 한 번만 실행)
  useEffect(() => {
    const saved = loadSavedState();
    if (saved) {
      if (saved.studentName) setStudentName(saved.studentName);
      if (saved.studentSchool) setStudentSchool(saved.studentSchool);
      if (saved.studentGrade) setStudentGrade(saved.studentGrade);
      if (saved.answers) setAnswers(saved.answers as any);
      if (saved.currentSection) setCurrentSection(saved.currentSection as SectionType);
      if (saved.currentQuestionIndex !== undefined) setCurrentQuestionIndex(saved.currentQuestionIndex);
      if (saved.startTime) {
        setStartTime(new Date(saved.startTime));
        setIsStarted(true);
      }
      if (saved.elapsedTime) setElapsedTime(saved.elapsedTime);
      toast.info('이전에 작성하던 답안을 불러왔습니다.');
    } else {
      // 저장된 데이터가 없어도 로드 완료 표시 (이후 저장 활성화)
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

  // 어휘 선지 생성 훅
  const {
    getDistractors
  } = usePrepVocabularyDistractors();
  const sections: SectionType[] = ['reading', 'grammarA', 'grammarB', 'grammarC', 'vocabulary', 'sentenceAnalysis'];

  // 섹션별 문제 필터링
  const getSectionFromQuestion = (q: PrepLevelTestQuestion): SectionType => {
    if (q.section === 'grammar') {
      return `grammar${q.grammarLevel || 'A'}` as SectionType;
    }
    if (q.section === 'sentenceAnalysis') {
      return 'sentenceAnalysis';
    }
    return q.section as SectionType;
  };
  const sectionQuestions = allPrepQuestions.filter(q => getSectionFromQuestion(q) === currentSection);
  const currentQuestion = sectionQuestions[currentQuestionIndex];

  // 전체 진행률 계산
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = allPrepQuestions.length;
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
  const handleAnswer = (value: string | number | number[] | string[] | SentenceAnswer) => {
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
      const currentIdx = sections.indexOf(currentSection);
      if (currentIdx > 0) {
        const prevSection = sections[currentIdx - 1];
        const prevSectionQuestions = allPrepQuestions.filter(q => getSectionFromQuestion(q) === prevSection);
        setCurrentSection(prevSection);
        setCurrentQuestionIndex(prevSectionQuestions.length - 1);
      }
    }
  };
  type AnswerType = string | number | number[] | string[] | SentenceAnswer | undefined;
  const isCorrect = (question: PrepLevelTestQuestion, answer: AnswerType): boolean => {
    if (answer === undefined) return false;

    // 문장 클릭 문제 (주어/동사 찾기)
    if (question.inputType === 'sentenceClick' && question.correctSubjects && question.correctVerbs) {
      const sentenceAnswer = answer as SentenceAnswer;
      if (!sentenceAnswer.subjects || !sentenceAnswer.verbs) return false;
      const selectedSubjects = sentenceAnswer.subjects.map(s => s.split('-')[1]);
      const selectedVerbs = sentenceAnswer.verbs.map(v => v.split('-')[1]);
      const correctSubjects = question.correctSubjects;
      const correctVerbs = question.correctVerbs;
      const optionalSubjects = question.optionalSubjects || [];
      const optionalVerbs = question.optionalVerbs || [];
      
      // 필수 정답이 모두 포함되어 있는지 확인
      const requiredSubjectsMatch = correctSubjects.every(s => selectedSubjects.includes(s));
      const requiredVerbsMatch = correctVerbs.every(v => selectedVerbs.includes(v));
      
      // 학생이 선택한 것이 모두 정답(필수+선택적)에 속하는지 확인
      const allSubjectsValid = selectedSubjects.every(s => 
        correctSubjects.includes(s) || optionalSubjects.includes(s)
      );
      const allVerbsValid = selectedVerbs.every(v => 
        correctVerbs.includes(v) || optionalVerbs.includes(v)
      );
      
      // 필수 동사가 없고 선택적 동사만 있는 경우, 최소 하나의 선택적 동사를 선택해야 함
      const hasAtLeastOneVerb = correctVerbs.length > 0 || 
        (optionalVerbs.length > 0 && selectedVerbs.some(v => optionalVerbs.includes(v)));
      
      return requiredSubjectsMatch && requiredVerbsMatch && allSubjectsValid && allVerbsValid && hasAtLeastOneVerb;
    }

    // 단어 배열 문제
    if (question.inputType === 'wordArrangement') {
      if (Array.isArray(answer)) {
        const studentSentence = answer.join(' ');
        if (question.correctAnswers && question.correctAnswers.length > 0) {
          return question.correctAnswers.some(correct => correct.toLowerCase().trim() === studentSentence.toLowerCase().trim());
        }
        return studentSentence.toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim();
      }
      return false;
    }

    // 객관식 - 복수 정답 (모두 선택)
    if (question.inputType === 'choice') {
      // 복수 선택 문제인 경우 (배열로 답한 경우)
      if (Array.isArray(answer) && answer.every(item => typeof item === 'number')) {
        const numAnswer = answer as number[];
        // correctAnswer가 배열인 경우
        if (Array.isArray(question.correctAnswer)) {
          const correctSorted = [...(question.correctAnswer as number[])].sort((a, b) => a - b);
          const answerSorted = [...numAnswer].sort((a, b) => a - b);
          return correctSorted.length === answerSorted.length && correctSorted.every((v, i) => v === answerSorted[i]);
        }
        // correctAnswer가 단일 값인 경우
        return numAnswer.length === 1 && numAnswer[0] === question.correctAnswer;
      }
      // 단일 선택
      return answer === question.correctAnswer;
    }

    // 단답형 - 여러 정답 허용
    if (question.correctAnswers && question.correctAnswers.length > 0) {
      const studentAnswer = String(answer).toLowerCase().trim();
      
      // requireAllAnswers가 true면 모든 정답을 입력해야 함
      if (question.requireAllAnswers) {
        const studentParts = studentAnswer.split(/[,，]/).map(a => a.trim()).filter(a => a).sort();
        const correctParts = question.correctAnswers.map(a => a.toLowerCase().trim()).sort();
        return studentParts.length === correctParts.length && 
               correctParts.every(c => studentParts.some(s => s === c));
      }
      
      return question.correctAnswers.some(correct => correct.toLowerCase().trim() === studentAnswer);
    }

    // 단일 정답 (복수 정답인 경우 순서 상관없이 채점)
    if (question.correctAnswer) {
      const correctAnswers = String(question.correctAnswer).toLowerCase().split(',').map(a => a.trim());
      const studentAnswer = String(answer).toLowerCase().trim();

      // 학생 답안이 쉼표로 구분된 복수 답안인 경우
      const studentAnswers = studentAnswer.split(/[,，]/).map(a => a.trim()).filter(a => a.length > 0);
      if (studentAnswers.length > 1 && correctAnswers.length > 1) {
        // 복수 답안: 순서 상관없이 모든 정답이 포함되어 있으면 정답
        const sortedCorrect = [...correctAnswers].sort();
        const sortedStudent = [...studentAnswers].sort();
        if (sortedCorrect.length === sortedStudent.length && sortedCorrect.every((c, i) => c === sortedStudent[i])) {
          return true;
        }
      }
      if (question.section === 'vocabulary') {
        return correctAnswers.some(correct => studentAnswer.includes(correct) || correct.includes(studentAnswer));
      }
      return correctAnswers.some(correct => correct === studentAnswer);
    }
    return false;
  };
  const calculateScoresForSubmit = () => {
    let totalEarned = 0;
    const totalPossible = calculatePrepTotalMaxScore();
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
      const sectionQs = allPrepQuestions.filter(q => getSectionFromQuestion(q) === section);
      let sectionEarned = 0;
      let sectionTotal = 0;
      let correctCount = 0;
      sectionQs.forEach(q => {
        const pts = getPrepQuestionPoints(q);
        sectionTotal += pts;
        if (isCorrect(q, answers[q.id])) {
          sectionEarned += pts;
          correctCount++;
        }
      });
      totalEarned += sectionEarned;
      sectionScores.push({
        section,
        sectionName: prepSectionNames[section],
        totalQuestions: sectionQs.length,
        correctCount,
        totalPoints: sectionTotal,
        earnedPoints: sectionEarned,
        percentage: sectionTotal > 0 ? Math.round(sectionEarned / sectionTotal * 100) : 0
      });
      const categoryData = prepAnalysisCategories[section as keyof typeof prepAnalysisCategories];
      if (categoryData) {
        subCategoryScores[section] = categoryData.subCategories.map(sub => {
          const subQuestions = allPrepQuestions.filter(q => sub.questions.includes(q.id));
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
      totalScore: totalEarned,
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
        error
      } = await supabase.from('level_test_results').insert({
        student_name: studentName,
        student_school: studentSchool,
        student_grade: studentGrade,
        answers: answers,
        total_score: totalScore,
        level: `prep-${level}`,
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
  const handleAbortTest = () => {
    setShowAbortDialog(false);
    setIsStarted(false);
    setCurrentSection('reading');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStartTime(null);
    setElapsedTime(0);
    clearSavedState(); // 중단 시 저장된 상태 삭제
    navigate('/');
  };
  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'reading':
        return <BookOpen className="w-5 h-5" />;
      case 'grammarA':
      case 'grammarB':
      case 'grammarC':
        return <FileText className="w-5 h-5" />;
      case 'vocabulary':
        return <Languages className="w-5 h-5" />;
      case 'sentenceAnalysis':
        return <FileText className="w-5 h-5" />;
      default:
        return null;
    }
  };
  const getSectionName = (section: string) => {
    return prepSectionNames[section] || section;
  };
  const getSectionColor = (section: string) => {
    switch (section) {
      case 'reading':
        return 'bg-green-500';
      case 'grammarA':
        return 'bg-blue-400';
      case 'grammarB':
        return 'bg-blue-500';
      case 'grammarC':
        return 'bg-blue-600';
      case 'vocabulary':
        return 'bg-purple-500';
      case 'sentenceAnalysis':
        return 'bg-rose-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 시작 화면
  if (!isStarted) {
    const logoSrc = brainiacLogo.url;
    const titleText = 'Brainiac English Assessment Test (BEAT)';
    const subtitleText = '브래니악 영어 진단평가 Prep(초등) · BEAT';
    return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur">
            <div className="text-center mb-6">
              <img src={logoSrc} alt="Brainiac English Logo" className="w-24 h-24 mx-auto mb-4 object-contain" />
              <h1 className="text-2xl font-bold mb-2 elegant-shimmer-text">{titleText}</h1>
              <p className="text-gray-600 text-sm">{subtitleText}</p>
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
                      { label: '독해', count: 13 },
                      { label: '문법A', count: 40 },
                      { label: '문법B', count: 27 },
                      { label: '문법C', count: 20 },
                      { label: '어휘', count: 76 },
                      { label: '문장구조', count: 10 },
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
                      <span className="text-lg font-bold text-white">186</span>
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
                <Input id="school" value={studentSchool} onChange={e => setStudentSchool(e.target.value)} placeholder="예: 신길초, 흑석초" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="grade" className="text-gray-700">학년</Label>
                <Input id="grade" value={studentGrade} onChange={e => setStudentGrade(e.target.value)} placeholder="예: 5, 6" className="mt-1" />
              </div>
            </div>

            <Button className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700" onClick={handleStart}>
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
  return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAbortDialog(true)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-1" />
                시험중단
              </Button>
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
      <div className="max-w-4xl mx-auto px-4 py-3">
        {currentQuestion && <Card className="p-3 sm:p-4 shadow-lg border-0 bg-white/90 backdrop-blur relative">
            
            <div className="mb-2">
              <span className="text-xs text-foreground font-medium">문제 {currentQuestion.id}</span>
              <span className="ml-1.5 text-xs text-amber-600">({getPrepQuestionPoints(currentQuestion)}점)</span>
            </div>

            {/* 문제 텍스트 - 지문보다 먼저 표시 */}
            {/* 어휘 문제 - 단어만 크게 표시 */}
            {currentQuestion.section === 'vocabulary' ? (
              <h2 className="text-xl font-bold text-indigo-600 mb-2">{currentQuestion.questionText}</h2>
            ) : (
              <div className="relative bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200/80 mb-2">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-l-lg" />
                <h3 className="text-sm font-semibold text-slate-800 leading-relaxed pl-2 whitespace-pre-line">
                  {(() => {
                    const text = currentQuestion.questionText;
                    if (text.includes('(Tip:')) {
                      return <>
                        <span dangerouslySetInnerHTML={{ __html: text.split('(Tip:')[0] }} />
                        <span className="inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                          <span className="text-amber-500">💡</span>
                          <span>Tip: {text.split('(Tip:')[1]?.replace(')', '')}</span>
                        </span>
                      </>;
                    }
                    return <span dangerouslySetInnerHTML={{ __html: text }} />;
                  })()}
                </h3>
              </div>
            )}

            {/* 지문이 있는 경우 (독해) */}
            {currentQuestion.passageText && <div className="mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed text-justify" dangerouslySetInnerHTML={{
            __html: currentQuestion.passageText
          }} />
              </div>}

            {/* 일반 추가 내용 */}
            {currentQuestion.questionContent && <div className="mb-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed" dangerouslySetInnerHTML={{
            __html: currentQuestion.questionContent
          }} />
              </div>}

            {/* 객관식 - 복수선택 (모두 포함, correctAnswer가 배열이 아닌 경우) */}
            {currentQuestion.inputType === 'choice' && currentQuestion.options && currentQuestion.questionText.includes('모두') && !Array.isArray(currentQuestion.correctAnswer) && <div className="space-y-1">
                {currentQuestion.options.map((option, idx) => {
            const currentAnswerArray = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as number[] : [];
            const isChecked = currentAnswerArray.includes(idx + 1);
            return <div key={idx} className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <Checkbox id={`option-${idx}`} checked={isChecked} onCheckedChange={checked => {
                if (checked) {
                  handleAnswer([...currentAnswerArray, idx + 1].sort((a, b) => a - b));
                } else {
                  handleAnswer(currentAnswerArray.filter(v => v !== idx + 1));
                }
              }} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-sm" dangerouslySetInnerHTML={{
                __html: option
              }} />
                    </div>;
          })}
              </div>}


            {/* 객관식 - 복수선택 (correctAnswer가 배열인 경우) */}
            {currentQuestion.inputType === 'choice' && currentQuestion.options && Array.isArray(currentQuestion.correctAnswer) && <div className="space-y-1">
                {currentQuestion.options.map((option, idx) => {
            const rawAnswer = answers[currentQuestion.id];
            const selectedAnswers: number[] = Array.isArray(rawAnswer) ? rawAnswer as number[] : [];
            const isSelected = selectedAnswers.includes(idx + 1);
            const maxSelections = (currentQuestion.correctAnswer as number[]).length;
            return <div key={idx} onClick={() => {
              let newAnswers: number[];
              if (isSelected) {
                newAnswers = selectedAnswers.filter(a => a !== idx + 1);
              } else if (selectedAnswers.length < maxSelections) {
                newAnswers = [...selectedAnswers, idx + 1];
              } else {
                return;
              }
              handleAnswer(newAnswers);
            }} className={`flex items-center space-x-2 p-2 rounded-lg border-2 transition-colors cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                        {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <span className="flex-1 text-sm" dangerouslySetInnerHTML={{
                __html: option
              }} />
                    </div>;
          })}
                <p className="text-sm text-slate-500 mt-2">
                  {(() => {
              const rawAnswer = answers[currentQuestion.id];
              const selectedAnswers: number[] = Array.isArray(rawAnswer) ? rawAnswer as number[] : [];
              const maxSelections = (currentQuestion.correctAnswer as number[]).length;
              return `${selectedAnswers.length}/${maxSelections}개 선택됨`;
            })()}
                </p>
              </div>}

            {/* 객관식 - 단일선택 */}
            {currentQuestion.inputType === 'choice' && currentQuestion.options && !Array.isArray(currentQuestion.correctAnswer) && !currentQuestion.questionText.includes('모두') && <RadioGroup value={String(answers[currentQuestion.id] || '')} onValueChange={value => handleAnswer(Number(value))} className="space-y-1">
                {currentQuestion.options.map((option, idx) => <div key={idx} className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <RadioGroupItem value={String(idx + 1)} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-sm" dangerouslySetInnerHTML={{
              __html: option
            }} />
                  </div>)}
              </RadioGroup>}

            {/* 어휘 문제 - 다중 선택 */}
            {currentQuestion.section === 'vocabulary' && <div>
                <p className="text-sm text-gray-500 mb-3">
                  이 단어에 해당하는 뜻을 모두 고르시오. 
                  <span className="font-semibold text-purple-600">(정답 {currentQuestion.correctAnswers?.length || 0}개)</span>
                </p>
                {getDistractors(currentQuestion.id) ? <div className="space-y-1">
                    {getDistractors(currentQuestion.id)!.options.map((option, idx) => {
              const selectedAnswers = answers[currentQuestion.id] as string[] || [];
              const isSelected = selectedAnswers.includes(option);
              return <label key={idx} className={`flex items-start gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                          <Checkbox checked={isSelected} onCheckedChange={checked => {
                  const current = answers[currentQuestion.id] as string[] || [];
                  if (checked) {
                    handleAnswer([...current, option]);
                  } else {
                    handleAnswer(current.filter(a => a !== option));
                  }
                }} className="mt-0.5" />
                           <span className="text-gray-700 leading-relaxed text-sm">
                             <span className="font-semibold mr-2 text-slate-950">{['①','②','③','④','⑤'][idx] || `${idx+1}.`}</span>
                             {option}
                           </span>
                        </label>;
            })}
                  </div> : <div className="text-center py-8 text-gray-500">
                    선지를 불러오는 중 오류가 발생했습니다.
                  </div>}
              </div>}

            {/* 단답형 (어휘 문제 제외) */}
            {(currentQuestion.inputType === 'text' || currentQuestion.inputType === 'sentenceAnalysis') && currentQuestion.section !== 'vocabulary' && <Input value={String(answers[currentQuestion.id] || '')} onChange={e => handleAnswer(e.target.value)} placeholder="답을 입력하세요" className="text-lg" />}


            {/* 단어 배열 - 클릭으로 배열 */}
            {currentQuestion.inputType === 'wordArrangement' && currentQuestion.arrangeWords && <div className="space-y-4">
                {/* 답안 영역 */}
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 min-h-[60px]">
                  <p className="text-xs text-blue-600 mb-2 font-medium">답안 (클릭하여 취소)</p>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                const rawAnswer = answers[currentQuestion.id];
                const selectedWords = Array.isArray(rawAnswer) ? rawAnswer as string[] : [];
                return selectedWords.map((word, idx) => <span key={`selected-${idx}`} onClick={() => {
                  const newSelected = [...selectedWords];
                  newSelected.splice(idx, 1);
                  handleAnswer(newSelected);
                }} className="px-3 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm">
                          {word}
                        </span>);
              })()}
                    {(() => {
                const rawAnswer = answers[currentQuestion.id];
                const selectedWords = Array.isArray(rawAnswer) ? rawAnswer as string[] : [];
                return selectedWords.length === 0 && <span className="text-blue-400 text-sm">아래 단어를 클릭하여 배열하세요</span>;
              })()}
                  </div>
                </div>
                
                {/* 보기 영역 */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-2 font-medium">보기 (클릭하여 선택)</p>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.arrangeWords.map((word, idx) => {
                const rawAnswer = answers[currentQuestion.id];
                const selectedWords = Array.isArray(rawAnswer) ? rawAnswer as string[] : [];
                const isSelected = selectedWords.includes(word);
                return <span key={`option-${idx}`} onClick={() => {
                  if (!isSelected) {
                    handleAnswer([...selectedWords, word]);
                  }
                }} className={`px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium ${isSelected ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300 shadow-sm'}`}>
                          {word}
                        </span>;
              })}
                  </div>
                </div>
              </div>}

            {/* 문장 클릭 - 주어/동사 찾기 */}
            {currentQuestion.inputType === 'sentenceClick' && currentQuestion.sentenceWords && <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-3">단어를 클릭하면 본 동사(V), 더블클릭하면 본 주어(S)로 선택됩니다. 조동사+동사원형(원형부정사)는 모두 동사로 체크하세요.</p>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.sentenceWords.map((word, idx) => {
                const wordKey = `${idx}-${word}`;
                const currentAnswer = answers[currentQuestion.id] as {
                  subjects: string[];
                  verbs: string[];
                } || {
                  subjects: [],
                  verbs: []
                };
                const isSubject = currentAnswer.subjects?.includes(wordKey);
                const isVerb = currentAnswer.verbs?.includes(wordKey);
                return <span key={wordKey} onClick={() => {
                  if (isVerb) {
                    // 동사 해제
                    handleAnswer({
                      subjects: currentAnswer.subjects || [],
                      verbs: (currentAnswer.verbs || []).filter(v => v !== wordKey)
                    });
                  } else if (isSubject) {
                    // 주어 해제
                    handleAnswer({
                      subjects: (currentAnswer.subjects || []).filter(s => s !== wordKey),
                      verbs: currentAnswer.verbs || []
                    });
                  } else {
                    // 동사로 선택
                    handleAnswer({
                      subjects: currentAnswer.subjects || [],
                      verbs: [...(currentAnswer.verbs || []), wordKey]
                    });
                  }
                }} onDoubleClick={() => {
                  if (isSubject) {
                    // 주어 해제
                    handleAnswer({
                      subjects: (currentAnswer.subjects || []).filter(s => s !== wordKey),
                      verbs: currentAnswer.verbs || []
                    });
                  } else {
                    // 동사였으면 동사에서 제거하고 주어로
                    handleAnswer({
                      subjects: [...(currentAnswer.subjects || []).filter(s => s !== wordKey), wordKey],
                      verbs: (currentAnswer.verbs || []).filter(v => v !== wordKey)
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
                <div className="mt-4 flex gap-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-indigo-500 rounded"></span>
                    <span className="text-gray-600">
                      본 주어(S): {((answers[currentQuestion.id] as {
                  subjects: string[];
                  verbs: string[];
                })?.subjects || []).map(s => s.split('-')[1]).join(', ') || '없음'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-emerald-500 rounded"></span>
                    <span className="text-gray-600">
                      본 동사(V): {((answers[currentQuestion.id] as {
                  subjects: string[];
                  verbs: string[];
                })?.verbs || []).map(v => v.split('-')[1]).join(', ') || '없음'}
                    </span>
                  </div>
                </div>
              </div>}

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <Button variant="outline" onClick={handlePrev} disabled={currentSection === 'reading' && currentQuestionIndex === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전
              </Button>

              {currentSection === 'sentenceAnalysis' && currentQuestionIndex === sectionQuestions.length - 1 ? <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                  {isSubmitting ? <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      제출 중...
                    </> : <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      시험 제출
                    </>}
                </Button> : <Button onClick={handleNext}>
                  다음
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>}
            </div>
          </Card>}

        {/* 섹션 네비게이션 */}
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          {sections.map(section => {
          const sectionQs = allPrepQuestions.filter(q => getSectionFromQuestion(q) === section);
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

      {/* 시험 중단 다이얼로그 */}
      <AlertDialog open={showAbortDialog} onOpenChange={setShowAbortDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>시험을 중단하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              시험을 중단하면 현재까지의 모든 답안이 삭제됩니다.
              정말 중단하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속 진행</AlertDialogCancel>
            <AlertDialogAction onClick={handleAbortTest} className="bg-red-500 hover:bg-red-600">
              시험 중단
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default PrepLevelTest;