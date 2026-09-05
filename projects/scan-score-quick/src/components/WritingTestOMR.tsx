import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, Download, Loader2 } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WritingQuestion } from "@/types/test";
import { generateWritingTestDocx } from "@/utils/generateWritingTestDocx";
const DEFAULT_CLASS_LIST = ["1FO", "1INT", "1AD", "2FO", "2INT", "2AD", "3FO", "3INT", "3AD", "TOP", "고등부", "신규생", "IVY"];
const getClassListLocal = (): string[] => {
  const savedList = localStorage.getItem('omr-class-list');
  if (savedList) {
    try { return JSON.parse(savedList); } catch { return DEFAULT_CLASS_LIST; }
  }
  return DEFAULT_CLASS_LIST;
};
const fetchClassList = async (): Promise<string[]> => {
  try {
    const { data } = await (supabase as any)
      .from('app_settings')
      .select('value')
      .eq('key', 'omr-class-list')
      .maybeSingle();
    if (data?.value && Array.isArray(data.value)) {
      localStorage.setItem('omr-class-list', JSON.stringify(data.value));
      return data.value as string[];
    }
  } catch {}
  return getClassListLocal();
};

const STORAGE_KEY_PREFIX = 'orun_writing_progress_';

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Process word for display: lowercase first letter (except "I"), remove trailing punctuation
const processWordForDisplay = (word: string): string => {
  // Remove trailing punctuation (period, comma, exclamation, question mark)
  let processed = word.replace(/[.,!?]+$/, '');

  // Lowercase the first letter if it's uppercase (except standalone "I")
  if (processed !== 'I' && processed.length > 0 && processed[0] === processed[0].toUpperCase()) {
    processed = processed[0].toLowerCase() + processed.slice(1);
  }

  return processed;
};

// Restore original word from processed display word
const findOriginalWord = (displayWord: string, originalWords: string[]): string | undefined => {
  return originalWords.find((orig) => processWordForDisplay(orig) === displayWord);
};

const WritingTestOMR = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams();

  const [studentAnswers, setStudentAnswers] = useState<Record<number, string[]>>({});
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [testData, setTestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classList, setClassList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<Record<number, string[]>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isLoadedRef = useRef(false);
  const storageKey = testId ? `${STORAGE_KEY_PREFIX}${testId}` : null;

  useEffect(() => {
    setClassList(getClassListLocal());
    fetchClassList().then(setClassList);
    // Check admin status
    const adminAccess = localStorage.getItem('adminAccess');
    setIsAdmin(adminAccess === 'true');

    // Realtime sync for class list edits
    const channel = supabase
      .channel('writing-omr-class-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: 'key=eq.omr-class-list' },
        (payload: any) => {
          const row = payload.new || payload.old;
          if (row?.value && Array.isArray(row.value)) {
            setClassList(row.value);
            localStorage.setItem('omr-class-list', JSON.stringify(row.value));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load saved state from localStorage
  useEffect(() => {
    if (!storageKey) {
      isLoadedRef.current = true;
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const savedAt = parsed.savedAt || 0;
        const age = now - savedAt;
        const maxAge = 24 * 60 * 60 * 1000;

        if (savedAt && age < maxAge) {
          const state = parsed.state;
          if (state.answers) setStudentAnswers(state.answers);
          if (state.studentName) setStudentName(state.studentName);
          if (state.studentClass) setStudentClass(state.studentClass);
          if (state.shuffledWords) setShuffledWords(state.shuffledWords);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.error('[Writing Persistence] Failed to load:', e);
    }

    isLoadedRef.current = true;
  }, [storageKey]);

  // Save state to localStorage
  useEffect(() => {
    if (!storageKey || !isLoadedRef.current) return;

    if (!studentName.trim() && Object.keys(studentAnswers).length === 0 && !studentClass) {
      return;
    }

    try {
      const dataToSave = {
        state: {
          answers: studentAnswers,
          studentName,
          studentClass,
          shuffledWords
        },
        savedAt: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('[Writing Persistence] Failed to save:', e);
    }
  }, [storageKey, studentAnswers, studentName, studentClass, shuffledWords]);

  const clearSavedState = () => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  useEffect(() => {
    const loadTestData = async () => {
      try {
        setIsLoading(true);
        if (testId) {
          const { data: test, error } = await supabase.
          from('tests').
          select('*').
          eq('test_id', testId).
          maybeSingle();

          if (error) {
            console.error('Error loading test:', error);
            toast({
              title: "시험을 불러오는데 실패했습니다",
              description: "다시 시도해주세요.",
              variant: "destructive"
            });
            navigate('/');
            return;
          }
          if (!test) {
            toast({
              title: "시험을 찾을 수 없습니다",
              description: "올바른 시험 ID를 입력해주세요.",
              variant: "destructive"
            });
            navigate('/');
            return;
          }

          const questions = (test as any).writing_questions || [];
          setTestData({
            title: test.title,
            testId: test.test_id,
            questions,
            questionCount: questions.length,
            testFormat: 'writing'
          });

          // Initialize shuffled words if not already loaded from localStorage
          if (Object.keys(shuffledWords).length === 0 && questions.length > 0) {
            const newShuffled: Record<number, string[]> = {};
            questions.forEach((q: WritingQuestion, idx: number) => {
              newShuffled[idx + 1] = shuffleArray(q.arrangeWords || q.english.split(/\s+/));
            });
            setShuffledWords(newShuffled);
          }
        } else if (location.state) {
          setTestData(location.state);
          const questions = location.state.questions || [];
          if (Object.keys(shuffledWords).length === 0 && questions.length > 0) {
            const newShuffled: Record<number, string[]> = {};
            questions.forEach((q: WritingQuestion, idx: number) => {
              newShuffled[idx + 1] = shuffleArray(q.arrangeWords || q.english.split(/\s+/));
            });
            setShuffledWords(newShuffled);
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "오류가 발생했습니다",
          description: "다시 시도해주세요.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    loadTestData();
  }, [testId, location.state, navigate]);

  const handleWordClick = (questionNum: number, word: string) => {
    setStudentAnswers((prev) => {
      const current = prev[questionNum] || [];
      return {
        ...prev,
        [questionNum]: [...current, word]
      };
    });

    // Remove word from available pool
    setShuffledWords((prev) => ({
      ...prev,
      [questionNum]: (prev[questionNum] || []).filter((w, i) => {
        const firstIndex = prev[questionNum].indexOf(word);
        return i !== firstIndex;
      })
    }));
  };

  const handleAnswerWordClick = (questionNum: number, wordIndex: number) => {
    const word = studentAnswers[questionNum]?.[wordIndex];
    if (!word) return;

    // Remove from answer
    setStudentAnswers((prev) => {
      const current = [...(prev[questionNum] || [])];
      current.splice(wordIndex, 1);
      return {
        ...prev,
        [questionNum]: current
      };
    });

    // Add back to pool
    setShuffledWords((prev) => ({
      ...prev,
      [questionNum]: [...(prev[questionNum] || []), word]
    }));
  };

  const handleResetQuestion = (questionNum: number) => {
    const question = testData?.questions?.[questionNum - 1];
    if (!question) return;

    setStudentAnswers((prev) => ({
      ...prev,
      [questionNum]: []
    }));

    setShuffledWords((prev) => ({
      ...prev,
      [questionNum]: shuffleArray(question.arrangeWords || question.english.split(/\s+/))
    }));
  };

  const calculateScore = async () => {
    if (isSubmitting) return;

    if (!studentName.trim()) {
      toast({
        title: "이름을 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    if (!studentClass) {
      toast({
        title: "반을 선택해주세요",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const questions: WritingQuestion[] = testData.questions;
      let correctCount = 0;
      const results: {questionNum: number;korean: string;english: string;studentAnswer: string;isCorrect: boolean;}[] = [];

      questions.forEach((q, idx) => {
        const questionNum = idx + 1;
        const studentAnswer = (studentAnswers[questionNum] || []).join(' ');
        const correctAnswer = q.english;

        // Normalize for comparison
        const normalizedStudent = studentAnswer.toLowerCase().replace(/[.,!?]/g, '').trim();
        const normalizedCorrect = correctAnswer.toLowerCase().replace(/[.,!?]/g, '').trim();

        const isCorrect = normalizedStudent === normalizedCorrect;

        if (isCorrect) correctCount++;

        results.push({
          questionNum,
          korean: q.korean,
          english: q.english,
          studentAnswer,
          isCorrect
        });
      });

      const score = Math.round(correctCount / questions.length * 100);

      clearSavedState();

      navigate('/writing-result', {
        state: {
          score,
          correct: correctCount,
          total: questions.length,
          results,
          testData,
          studentName: studentName.trim(),
          studentClass: studentClass.trim()
        }
      });
    } catch (error) {
      console.error('Error during submission:', error);
      toast({
        title: "제출 중 오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Handle Word file download (admin only)
  const handleDownloadWord = async () => {
    if (!testData) return;

    setIsDownloading(true);
    try {
      await generateWritingTestDocx({
        title: testData.title,
        questionCount: testData.questionCount,
        questions: testData.questions
      });
      toast({
        title: "다운로드 완료",
        description: "시험지가 Word 파일로 저장되었습니다."
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "다운로드 실패",
        description: "파일 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <Card className="w-full max-w-4xl mx-auto p-8">
          <div className="flex justify-center items-center h-32">
            <p className="text-slate-600 font-semibold">시험 정보를 불러오는 중...</p>
          </div>
        </Card>
      </div>);

  }

  if (!testData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-1.5 sm:p-4 relative overflow-hidden">
      {/* Decorative Background Elements - Simplified for mobile performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-bl from-emerald-100/30 via-teal-50/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-tr from-slate-200/40 via-emerald-50/20 to-transparent rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-4xl mx-auto border-0 shadow-xl sm:shadow-2xl shadow-slate-200/50 bg-white/95 sm:bg-white/80 backdrop-blur-xl overflow-hidden relative z-10 rounded-2xl sm:rounded-3xl">
        {/* Compact Mobile Header */}
        <div className="relative border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 px-4 sm:px-6 py-4 sm:py-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5" />
          <div className="flex items-center gap-3 sm:gap-4 relative">
            <BackButton
              fallbackPath="/"
              variant="ghost"
              size="sm"
              className="hover:bg-slate-100 text-slate-600 shrink-0 rounded-xl h-9 w-9 sm:h-10 sm:w-10 p-0 flex items-center justify-center" />

            <div className="flex-1 min-w-0 text-center space-y-1.5">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight break-words">
                {testData.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  영작
                </span>
                <span className="text-sm text-slate-500 font-medium whitespace-nowrap">{testData.questionCount}문제</span>
              </div>
            </div>
            
            {/* Admin Download Button */}
            {isAdmin ?
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadWord}
              disabled={isDownloading}
              className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 px-0 rounded-xl border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 shadow-sm transition-all"
              title="시험지 다운로드 (Word)">

                {isDownloading ?
              <Loader2 className="w-4 h-4 animate-spin" /> :

              <Download className="w-4 h-4" />
              }
              </Button> :

            <div className="shrink-0 w-9 sm:w-10" />
            }
          </div>
        </div>

        {/* Student Info - Horizontal on mobile */}
        <div className="px-3 sm:px-6 py-3 sm:py-5 bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-100">
          <div className="flex gap-2 sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">반</label>
              <Select value={studentClass} onValueChange={setStudentClass}>
                <SelectTrigger className="h-9 sm:h-11 border-slate-200 bg-white hover:bg-slate-50 transition-colors rounded-lg sm:rounded-xl shadow-sm text-sm">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((className) =>
                  <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-[1.5] space-y-1">
              <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">성명</label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}

                className="h-9 sm:h-11 border-slate-200 bg-white hover:bg-slate-50 transition-colors rounded-lg sm:rounded-xl shadow-sm placeholder:text-slate-400 text-sm" placeholder="이름+휴대폰뒷4자리( ex: 김옳은5554)" />
              <p className="text-[9px] sm:text-[10px] text-red-500 font-semibold mt-0.5">⚠ 반드시 이름+번호 뒷4자리로 입력하세요</p>
            </div>
          </div>
        </div>

        {/* Questions Section - Optimized for mobile touch */}
        <div className="p-2 sm:p-6 space-y-3 sm:space-y-5 bg-gradient-to-b from-slate-50/30 to-white">
          {testData.questions.map((question: WritingQuestion, idx: number) => {
            const questionNum = idx + 1;
            const answer = studentAnswers[questionNum] || [];
            const availableWords = shuffledWords[questionNum] || [];
            const isCompleted = availableWords.length === 0 && answer.length > 0;

            return (
              <div
                key={questionNum}
                className={`
                  relative p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300
                  ${isCompleted ?
                'bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border-emerald-200/60 shadow-md sm:shadow-lg' :
                'bg-white border-slate-200/80 shadow-sm sm:shadow-md'}
                `
                }>

                {/* Question Header - Compact on mobile */}
                <div className="flex items-start justify-between mb-2.5 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`
                      flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base shrink-0 transition-all
                      ${isCompleted ?
                    'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md' :
                    'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-md'}
                    `
                    }>
                      {questionNum}
                    </div>
                    <p className="text-slate-700 font-medium leading-snug sm:leading-relaxed pt-0.5 sm:pt-1.5 text-[13px] sm:text-base">
                      {question.korean}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetQuestion(questionNum)}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg shrink-0 ml-1 h-7 w-7 sm:h-8 sm:w-8 p-0">

                    <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                
                {/* Answer Area - Touch optimized */}
                <div className={`
                  min-h-[44px] sm:min-h-[56px] p-2.5 sm:p-4 mb-2.5 sm:mb-4 rounded-lg sm:rounded-xl border-2 border-dashed transition-all duration-300
                  ${answer.length > 0 ?
                'bg-gradient-to-r from-emerald-50/50 to-teal-50/30 border-emerald-300/60' :
                'bg-slate-50/50 border-slate-200'}
                `
                }>
                  {answer.length === 0 ?
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 h-full">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      <span className="text-xs sm:text-sm">아래 단어를 탭하세요</span>
                    </div> :

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {answer.map((word, wordIdx) =>
                    <button
                      key={wordIdx}
                      onClick={() => handleAnswerWordClick(questionNum, wordIdx)}
                      className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-xs sm:text-sm font-medium 
                            active:from-rose-500 active:to-rose-600 transition-all duration-150 shadow-sm
                            active:scale-95 touch-manipulation">

                          {processWordForDisplay(word)}
                        </button>
                    )}
                    </div>
                  }
                </div>
                
                {/* Word Pool - Larger touch targets on mobile */}
                {availableWords.length > 0 &&
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {(() => {
                  const englishWords = question?.english?.split(/\s+/) || [];
                  const rawFirst = (englishWords[0] || '').toLowerCase();
                  const isArticleStart = ['the', 'a', 'an'].includes(rawFirst.replace(/[.,;!?]+$/g, ''));
                  const firstHint = isArticleStart && englishWords.length > 1
                    ? processWordForDisplay(englishWords[0]) + ' ' + processWordForDisplay(englishWords[1])
                    : processWordForDisplay(englishWords[0] || '');
                  const targetWords = isArticleStart
                    ? [processWordForDisplay(englishWords[0]), processWordForDisplay(englishWords[1])]
                    : [processWordForDisplay(englishWords[0] || '')];
                  const markedSet = new Set<string>();

                  return availableWords.map((word, wordIdx) => {
                    const displayed = processWordForDisplay(word);
                    const isTarget = targetWords.includes(displayed);
                    const isFirstWord = isTarget && !markedSet.has(displayed);
                    if (isFirstWord) markedSet.add(displayed);
                    return (
                      <button
                        key={wordIdx}
                        onClick={() => handleWordClick(questionNum, word)}
                        className={`px-2.5 py-2 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium 
                              transition-all duration-150 shadow-sm border active:scale-95 touch-manipulation
                              ${isFirstWord 
                                ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-300 ring-1 ring-amber-200' 
                                : 'bg-white text-slate-700 border-slate-200 active:bg-gradient-to-r active:from-emerald-500 active:to-teal-500 active:text-white active:border-transparent'
                              }`}>
                        <span className="flex items-center gap-1">
                          {displayed}
                          {isFirstWord && <span className="text-[9px] sm:text-[10px] text-amber-600 font-bold">첫단어{isArticleStart ? `(${firstHint})` : ''}</span>}
                        </span>
                      </button>
                    );
                  });
                })()}
                  </div>
                }
                
                {/* Completion Badge */}
                {isCompleted &&
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-emerald-500 text-white text-[10px] sm:text-xs font-semibold rounded-full shadow-sm">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      완료
                    </span>
                  </div>
                }
              </div>);

          })}
        </div>

        {/* Submit Button - Sticky on mobile for easy access */}
        <div className="sticky bottom-0 p-3 sm:p-6 border-t border-slate-100 bg-white/95 backdrop-blur-sm">
          <Button
            className="w-full h-11 sm:h-14 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 
              hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 
              text-white font-bold text-sm sm:text-lg rounded-xl shadow-lg shadow-emerald-200/50
              transition-all duration-300 active:scale-[0.98] touch-manipulation
              disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={calculateScore}
            disabled={isSubmitting}>

            {isSubmitting ?
            <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                제출 중...
              </span> :

            <span className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                답안 제출하기
              </span>
            }
          </Button>
        </div>
      </Card>
    </div>);

};

export default WritingTestOMR;