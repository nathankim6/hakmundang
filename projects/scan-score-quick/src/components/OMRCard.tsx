import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { supabase } from "@/integrations/supabase/client";
import { QuestionAnswer, QuestionType } from "@/types/test";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateConsistentScore } from "@/utils/testUtils/scoreCalculation";
import { isSubjectiveAnswerCorrect } from "@/utils/testUtils/answerValidation";

const DEFAULT_CLASS_LIST = ["1FO", "1INT", "1AD", "2FO", "2INT", "2AD", "3FO", "3INT", "3AD", "TOP", "고등부", "신규생", "IVY"];
const DEFAULT_BRANCH_LIST = ["초등관", "뉴베리타스관", "흑석관"];

const getListLocal = (key: string, fallback: string[]): string[] => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try { return JSON.parse(saved); } catch { return fallback; }
  }
  return fallback;
};

const fetchList = async (key: string, fallback: string[]): Promise<string[]> => {
  try {
    const { data } = await (supabase as any)
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (data?.value && Array.isArray(data.value)) {
      localStorage.setItem(key, JSON.stringify(data.value));
      return data.value as string[];
    }
  } catch {}
  return getListLocal(key, fallback);
};


const STORAGE_KEY_PREFIX = 'orun_omr_progress_';

const OMRCard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams();
  const [studentAnswers, setStudentAnswers] = useState<Record<number, QuestionAnswer>>({});
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentBranch, setStudentBranch] = useState("");
  const [testData, setTestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classList, setClassList] = useState<string[]>([]);
  const [branchList, setBranchList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isLoadedRef = useRef(false);
  const storageKey = testId ? `${STORAGE_KEY_PREFIX}${testId}` : null;

  useEffect(() => {
    setClassList(getListLocal('omr-class-list', DEFAULT_CLASS_LIST));
    setBranchList(getListLocal('omr-branch-list', DEFAULT_BRANCH_LIST));
    fetchList('omr-class-list', DEFAULT_CLASS_LIST).then(setClassList);
    fetchList('omr-branch-list', DEFAULT_BRANCH_LIST).then(setBranchList);

    // Realtime: sync list edits across all devices instantly
    const channel = supabase
      .channel('omr-lists-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        (payload: any) => {
          const row = payload.new || payload.old;
          if (!row?.key) return;
          if (row.key === 'omr-class-list' && Array.isArray(row.value)) {
            setClassList(row.value);
            localStorage.setItem('omr-class-list', JSON.stringify(row.value));
          } else if (row.key === 'omr-branch-list' && Array.isArray(row.value)) {
            setBranchList(row.value);
            localStorage.setItem('omr-branch-list', JSON.stringify(row.value));
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
      console.log(`[OMR Persistence] Loading from ${storageKey}:`, saved ? 'found' : 'not found');
      
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const savedAt = parsed.savedAt || 0;
        const age = now - savedAt;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        console.log(`[OMR Persistence] Data age: ${Math.round(age / 1000 / 60)} minutes`);
        
        if (savedAt && age < maxAge) {
          const state = parsed.state;
          if (state.answers) setStudentAnswers(state.answers);
          if (state.studentName) setStudentName(state.studentName);
          if (state.studentPhone) setStudentPhone(state.studentPhone);
          if (state.studentClass) setStudentClass(state.studentClass);
          if (state.studentBranch) setStudentBranch(state.studentBranch);
          console.log(`[OMR Persistence] Restored state:`, state);
        } else {
          console.log(`[OMR Persistence] Data expired, removing`);
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.error('[OMR Persistence] Failed to load:', e);
    }
    
    isLoadedRef.current = true;
  }, [storageKey]);

  // Save state to localStorage
  useEffect(() => {
    if (!storageKey || !isLoadedRef.current) return;
    
    // Only save if there's meaningful data
    if (!studentName.trim() && !studentPhone.trim() && Object.keys(studentAnswers).length === 0 && !studentClass && !studentBranch) {
      return;
    }
    
    try {
      const dataToSave = {
        state: {
          answers: studentAnswers,
          studentName,
          studentPhone,
          studentClass,
          studentBranch
        },
        savedAt: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      console.log(`[OMR Persistence] State saved`);
    } catch (e) {
      console.error('[OMR Persistence] Failed to save:', e);
    }
  }, [storageKey, studentAnswers, studentName, studentPhone, studentClass, studentBranch]);

  // Clear saved state
  const clearSavedState = () => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
      console.log(`[OMR Persistence] State cleared`);
    }
  };

  useEffect(() => {
    const loadTestData = async () => {
      try {
        setIsLoading(true);
        if (testId) {
          const { data: test, error } = await supabase
            .from('tests')
            .select('*')
            .eq('test_id', testId)
            .maybeSingle();
            
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
          
          // Check if it's a writing test and redirect
          const writingQuestions = (test as any)?.writing_questions;
          if (writingQuestions && Array.isArray(writingQuestions) && writingQuestions.length > 0) {
            navigate(`/writing/${testId}`, { replace: true });
            return;
          }
          
          setTestData({
            title: test.title,
            testId: test.test_id,
            answers: test.answers,
            questionCount: test.question_count,
            testFormat: (test as any).test_format ?? (test as any).testFormat ?? (test as any).format
          });
        } else if (location.state) {
          setTestData(location.state);
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
  const handleAnswerChange = (questionNumber: number, answer: string | number, type: QuestionType) => {
    if (type === 'multiple') {
      const currentAnswers = Array.isArray(studentAnswers[questionNumber]?.answer) ? studentAnswers[questionNumber].answer as number[] : [];
      let newAnswers: number[];
      if (typeof answer === "number") {
        newAnswers = currentAnswers.includes(answer) ? currentAnswers.filter(a => a !== answer) : [...currentAnswers, answer].sort((a, b) => a - b);
      } else {
        newAnswers = currentAnswers;
      }
      setStudentAnswers(prev => ({
        ...prev,
        [questionNumber]: {
          type,
          answer: newAnswers
        }
      }));
    } else {
      setStudentAnswers(prev => ({
        ...prev,
        [questionNumber]: {
          type,
          answer: String(answer)
        }
      }));
    }
  };
  const calculateScore = async () => {
    if (isSubmitting) return;
    if (!studentBranch) {
      toast({
        title: "소속을 선택해주세요",
        variant: "destructive"
      });
      return;
    }
    if (!studentName.trim()) {
      toast({
        title: "이름을 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    if (!/^[가-힣]+$/.test(studentName.trim())) {
      toast({
        title: "이름 형식이 올바르지 않습니다",
        description: "이름은 한글만 입력 가능합니다. (영문, 숫자, 공백, 특수문자 사용 불가)",
        variant: "destructive"
      });
      return;
    }
    if (!/^\d{4}$/.test(studentPhone.trim())) {
      toast({
        title: "휴대폰번호 뒷 4자리를 입력해주세요",
        description: "숫자 4자리만 입력 가능합니다.",
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
    const requiredAnswers = testData.questionCount;
    const answeredCount = Object.keys(studentAnswers).length;
      
    if (answeredCount !== requiredAnswers) {
      toast({
        title: "모든 문항을 체크해주세요",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 세션 확인 및 갱신
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('Session check error:', sessionError);
      }
      
      // Use the consistent score calculation function
      const score = calculateConsistentScore(studentAnswers, testData.answers, testData.testFormat);
      
      // Calculate correct count
      let correctCount = 0;
      Object.keys(testData.answers).forEach(questionNumber => {
        const correctAnswer = testData.answers[questionNumber] as QuestionAnswer;
        const studentAnswer = studentAnswers[Number(questionNumber)];
        
        if (correctAnswer && studentAnswer && correctAnswer.type === studentAnswer.type) {
          let isCorrect = false;
          if (correctAnswer.type === 'multiple') {
            const correctAnswerArray = Array.isArray(correctAnswer.answer) ? correctAnswer.answer : [correctAnswer.answer];
            const studentAnswerArray = Array.isArray(studentAnswer.answer) ? studentAnswer.answer : [studentAnswer.answer];
            const sortedCorrect = [...correctAnswerArray].sort((a: any, b: any) => a - b);
            const sortedStudent = [...studentAnswerArray].sort((a: any, b: any) => a - b);
            isCorrect = sortedCorrect.length === sortedStudent.length &&
                        sortedCorrect.every((value, index) => value === sortedStudent[index]);
          } else if (correctAnswer.type === 'subjective') {
            isCorrect = isSubjectiveAnswerCorrect(
              String(studentAnswer.answer),
              String(correctAnswer.answer)
            );
          }
          
          if (isCorrect) {
            correctCount++;
          }
        }
      });
      
      console.log('Submitting test with class:', studentClass, 'and name:', studentName);
      
      // Clear saved state on successful submission
      clearSavedState();
      
      const combinedName = `${studentName.trim()}${studentPhone.trim()}`;
      // 소속은 student_answers 메타에 저장(리포트 표시 X, 추후 필터용)
      const answersWithMeta = { ...studentAnswers, __branch: studentBranch } as any;
      navigate('/result', {
        state: {
          score,
          correct: correctCount,
          total: testData.questionCount,
          studentAnswers: answersWithMeta,
          testData,
          studentName: combinedName,
          studentClass: studentClass.trim(),
          studentBranch
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
  if (isLoading) {
    return <div className="min-h-screen p-2 sm:p-4 md:p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <Card className="w-full max-w-5xl mx-auto border-2 border-slate-200/60 shadow-2xl bg-white">
          <div className="flex justify-center items-center h-32 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30">
            <p className="text-slate-600 font-semibold">시험 정보를 불러오는 중...</p>
          </div>
        </Card>
      </div>;
  }
  if (!testData) {
    return null;
  }
  const formatAnswerValue = (answer: any): string => {
    if (Array.isArray(answer)) {
      return answer.length > 0 ? answer.join(', ') : '';
    }
    if (typeof answer === 'number' || typeof answer === 'string') {
      return String(answer);
    }
    return '';
  };
  return <div className="min-h-screen bg-white p-2 sm:p-4 md:p-6">
      <Card className="w-full max-w-5xl mx-auto border-2 border-slate-200/60 shadow-2xl bg-white overflow-hidden">
        {/* OMR Card Header - Professional Design */}
        <div className="relative border-b-2 border-slate-200/80 bg-slate-50 px-4 sm:px-8 py-5 sm:py-7">
          <div className="absolute inset-0 bg-grid-slate-200/40 [mask-image:linear-gradient(0deg,transparent,white)] pointer-events-none" style={{backgroundSize: '20px 20px', backgroundImage: 'linear-gradient(to right, rgb(226 232 240 / 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.4) 1px, transparent 1px)'}} />
          <div className="relative z-10">
            <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-5">
              <BackButton 
                fallbackPath="/"
                variant="ghost" 
                size="sm" 
                className="hover:bg-blue-50 text-slate-600 shrink-0 -ml-1 mt-1"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-slate-700 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight mb-3 break-keep leading-tight animate-fade-in drop-shadow-sm">{testData.title}</h1>
                <div className="h-1 w-full max-w-3xl bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full shadow-sm shadow-blue-500/20" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>모든 문항을 정확히 표기하세요</span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Student Info Section - Professional Style */}
        <div className="px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 bg-white">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 p-4 sm:p-5 border-2 border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 border-2 border-emerald-300/70 rounded-lg bg-gradient-to-br from-emerald-50 to-white shadow-sm shrink-0">
                <span className="text-xs sm:text-sm font-bold text-emerald-700">소속</span>
              </div>
              <Select value={studentBranch} onValueChange={setStudentBranch}>
                <SelectTrigger className="flex-1 h-12 sm:h-16 border-2 border-emerald-200/70 bg-white hover:bg-emerald-50/50 font-bold text-sm sm:text-base transition-colors shadow-sm">
                  <SelectValue placeholder="소속 선택" />
                </SelectTrigger>
                <SelectContent className="max-h-none">
                  {branchList.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 border-2 border-blue-300/70 rounded-lg bg-gradient-to-br from-blue-50 to-white shadow-sm shrink-0">
                <span className="text-xs sm:text-sm font-bold text-blue-700">반</span>
              </div>
              <Select value={studentClass} onValueChange={setStudentClass}>
                <SelectTrigger className="flex-1 h-12 sm:h-16 border-2 border-blue-200/70 bg-white hover:bg-blue-50/50 font-bold text-sm sm:text-base transition-colors shadow-sm">
                  <SelectValue placeholder="반 선택" />
                </SelectTrigger>
                <SelectContent className="max-h-none">
                  {classList.map(className => <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 border-2 border-indigo-300/70 rounded-lg bg-gradient-to-br from-indigo-50 to-white shadow-sm shrink-0">
                <span className="text-xs sm:text-sm font-bold text-indigo-700">성명</span>
              </div>
              <Input 
                id="studentName" 
                value={studentName} 
                onChange={e => setStudentName(e.target.value)}
                placeholder="(예: 김옳은)  *영문 이니셜은 쓰지 마세요*" 
                maxLength={20}
                className="flex-1 min-w-0 h-12 sm:h-16 border-2 border-indigo-200/70 bg-white hover:bg-indigo-50/30 focus:bg-white font-bold text-xs sm:text-sm md:text-base px-2 sm:px-4 transition-colors shadow-sm placeholder:text-[10px] sm:placeholder:text-xs md:placeholder:text-sm" 
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 border-2 border-indigo-300/70 rounded-lg bg-gradient-to-br from-indigo-50 to-white shadow-sm shrink-0">
                <span className="text-[10px] sm:text-xs font-bold text-indigo-700 leading-tight text-center px-1">번호<br/>뒤4자리</span>
              </div>
              <Input 
                id="studentPhone" 
                value={studentPhone} 
                onChange={e => setStudentPhone(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                placeholder="휴대폰번호 뒷 4자리 (예: 5554)" 
                inputMode="numeric"
                maxLength={4}
                className="flex-1 min-w-0 h-12 sm:h-16 border-2 border-indigo-200/70 bg-white hover:bg-indigo-50/30 focus:bg-white font-bold text-xs sm:text-sm md:text-base px-2 sm:px-4 transition-colors shadow-sm placeholder:text-[10px] sm:placeholder:text-xs md:placeholder:text-sm tracking-widest" 
              />
            </div>
            <p className="text-[9px] sm:text-[10px] text-red-500 font-semibold mt-0.5 ml-14 sm:ml-[76px]">⚠ 이름과 휴대폰번호 뒷 4자리를 모두 입력해야 제출됩니다</p>
          </div>

          {/* Answer Sheet Section - Professional OMR Grid */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-y-2 border-slate-200/80 shadow-sm">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                답안 작성란
              </h2>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-blue-400/50 rounded-lg shadow-md">
                <span className="text-xs sm:text-sm font-bold text-white">{testData.questionCount}</span>
                <span className="text-xs sm:text-sm font-semibold text-blue-100">문항</span>
              </div>
            </div>
            
            {/* OMR Grid - Real OMR Style */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-gradient-to-b from-slate-50 to-white shadow-inner">
              {/* OMR Header */}
              <div className="grid grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] bg-slate-800 text-white text-xs font-bold">
                <div className="py-2 text-center border-r border-slate-600">번호</div>
                <div className="py-2 flex justify-center gap-3 sm:gap-6">
                  {['①', '②', '③', '④', '⑤'].map((symbol, idx) => (
                    <span key={idx} className="w-9 sm:w-10 text-center">{symbol}</span>
                  ))}
                </div>
              </div>
              
              {Array.from({
              length: testData.questionCount
            }, (_, i) => i + 1).map(num => {
              const questionType = (testData.answers[num] as QuestionAnswer)?.type || 'multiple';
              const bgColor = num % 2 === 0 ? 'bg-slate-100/50' : 'bg-white';
              
              return <div key={num} className={`grid grid-cols-[50px_1fr] sm:grid-cols-[60px_1fr] items-center ${bgColor} border-b border-slate-200 transition-colors`}>
                  <div className="py-2.5 sm:py-3 flex items-center justify-center border-r border-slate-200 bg-slate-50">
                    <span className="font-bold text-sm sm:text-base text-slate-700">{num}</span>
                  </div>
                  <div className="py-2.5 sm:py-3 px-2 sm:px-4">
                    {questionType === 'subjective' ? (
                      <Input 
                        type="text" 
                        value={formatAnswerValue(studentAnswers[num]?.answer)} 
                        onChange={e => handleAnswerChange(num, e.target.value, 'subjective')} 
                        placeholder="답을 입력하세요" 
                        className="w-full max-w-xs h-9 sm:h-10 border-2 border-slate-300 bg-white hover:bg-blue-50/30 focus:bg-white font-medium text-sm transition-colors rounded-md" 
                      />
                    ) : (
                      <div className="flex justify-center gap-3 sm:gap-6">
                        {[1, 2, 3, 4, 5].map(option => {
                          const isSelected = Array.isArray(studentAnswers[num]?.answer) && (studentAnswers[num]?.answer as number[]).includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleAnswerChange(num, option, 'multiple')}
                              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm font-bold rounded-full border-2 touch-manipulation active:scale-90 select-none transition-all duration-150 ${
                                isSelected 
                                  ? 'bg-slate-800 text-white border-slate-900 shadow-md' 
                                  : 'bg-white text-slate-400 border-slate-300 hover:border-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>;
            })}
            </div>
          </div>

          {/* Submit Button - Professional Style */}
          <div className="pt-2 sm:pt-4 border-t-2 border-dashed border-slate-200/80">
            <Button 
              onClick={calculateScore} 
              size="lg" 
              disabled={isSubmitting}
              className="w-full h-12 sm:h-14 font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 border-2 border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '제출 중...' : '답안 제출'}
            </Button>
          </div>
        </div>
      </Card>
    </div>;
};
export default OMRCard;