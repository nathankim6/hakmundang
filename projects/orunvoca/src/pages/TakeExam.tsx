import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Loader2, Send, Clock, User, FileText, CheckCircle2, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Play, BookOpen, RefreshCw } from "lucide-react";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import orunLogo from "@/assets/orun-academy-logo.jpg";
import { getCurrentStudent } from "@/utils/student-auth";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle, ShadingType } from "docx";
import { saveAs } from "file-saver";
import { useIsMobile } from "@/hooks/use-mobile";
interface Question {
  id: string;
  question_number: number;
  question_type: string;
  word: string;
  meaning: string;
  choices: string[] | null;
  correct_answer: string;
  example_sentence?: string;
  english_definition?: string;
}

// 선지 표시용 정리 함수 - 괄호 내용 제거 및 번호 접두사 제거
const cleanChoiceForDisplay = (text: string): string => {
  if (!text || text.trim().length === 0) return text;
  
  let cleaned = text.trim();
  
  // 1. 숫자 접두사 제거 (예: "1.", "2.", "3. " 등)
  cleaned = cleaned.replace(/^\d+\.\s*/, '');
  
  // 2. 품사 마커 제거 [명], [동], [형], [부]
  cleaned = cleaned.replace(/\[([명동형부])\]\s*/g, '');
  cleaned = cleaned.replace(/\s*\[([명동형부])\]\s*/g, ' ');
  
  // 3. 소괄호와 그 내용 제거 (예: "(상품의) 소매점" -> "소매점")
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  
  // 4. 대괄호와 그 내용 제거 (예: "신입 사원[회원]" -> "신입 사원")
  cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
  
  // 5. 연속된 공백 정리 및 앞뒤 공백 제거
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

// 선지 정리 함수 (DB에서 이미 전처리된 선지를 표시용으로 정리)
const cleanChoices = (choices: string[] | null): string[] => {
  if (!choices) return [];
  return choices
    .filter(c => c && c.trim().length > 0)
    .map(c => cleanChoiceForDisplay(c));
};

const TakeExam = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("examId");
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{
    [key: number]: string | string[];
  }>({});
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExam, setShowExam] = useState(false);
  const [backupRestored, setBackupRestored] = useState(false);
  const [regeneratingQuestion, setRegeneratingQuestion] = useState<number | null>(null);
  const isMobile = useIsMobile();

  // 관리자 여부 확인
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const isAdmin = (() => {
    try {
      const accessCode = sessionStorage.getItem('accessCode');
      return accessCode === 'admin' || accessCode === '101100' || accessCode === 'orun0088';
    } catch {
      return false;
    }
  })() || adminUnlocked;

  // 관리자 코드 인증 프롬프트
  const ensureAdminAuth = (): boolean => {
    if (isAdmin) return true;
    const input = window.prompt('이 기능은 관리자 전용입니다.\n관리자 코드를 입력하세요:');
    if (input === null) return false;
    const code = input.trim();
    if (code === 'admin' || code === '101100' || code === 'orun0088') {
      setAdminUnlocked(true);
      toast({ title: '관리자 인증 완료', description: '관리자 기능이 활성화되었습니다.' });
      return true;
    }
    toast({ title: '인증 실패', description: '올바른 관리자 코드가 아닙니다.', variant: 'destructive' });
    return false;
  };


  // 미입력 문항 계산
  const unansweredQuestions = questions.filter(q => {
    const answer = answers[q.question_number];
    if (Array.isArray(answer)) return answer.length === 0;
    return !answer || typeof answer === 'string' && answer.trim() === '';
  }).map(q => q.question_number);
  const classOptions = ["신규생", "IVY", "1FO", "1INT", "1AD", "2FO", "2INT", "2AD", "3FO", "3INT", "3AD", "TOP", "고등부"];
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0); // 경과 시간 (초)

  // 답안 로컬 저장 (네트워크 끊김 대비) - useEffect 전에 정의
  const saveAnswersLocally = () => {
    try {
      const backupData = {
        examId,
        studentName,
        studentClass,
        answers,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(`exam_backup_${examId}`, JSON.stringify(backupData));
    } catch (e) {
      console.error('Failed to save answers locally:', e);
    }
  };


  // 주기적 자동 저장 (30초마다)
  useEffect(() => {
    if (!showExam || !examId) return;

    const autoSaveInterval = setInterval(() => {
      saveAnswersLocally();
    }, 30000); // 30초마다 자동 저장

    return () => clearInterval(autoSaveInterval);
  }, [showExam, answers, studentName, studentClass, examId]);

  // 로컬 백업 복구 (페이지 로드 시) - 관리자는 제외
  useEffect(() => {
    if (!examId || backupRestored) return;

    // 관리자 코드인 경우 백업 복원 건너뛰기
    const accessCode = sessionStorage.getItem('accessCode');
    const isAdminUser = accessCode === 'admin' || accessCode === '101100' || accessCode === 'orun0088';
    if (isAdminUser) {
      setBackupRestored(true);
      return;
    }

    try {
      const backupData = localStorage.getItem(`exam_backup_${examId}`);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        const savedAt = new Date(parsed.savedAt);
        const now = new Date();
        const minutesDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60);

        // 90분 이내의 백업만 복구
        if (minutesDiff < 90) {
          const shouldRestore = window.confirm(
            `이전에 저장된 답안이 있습니다 (${savedAt.toLocaleString('ko-KR')}).\n복원하시겠습니까?`
          );
          if (shouldRestore) {
            if (parsed.answers) setAnswers(parsed.answers);
            if (parsed.studentName) setStudentName(parsed.studentName);
            if (parsed.studentClass) setStudentClass(parsed.studentClass);
            toast({
              title: "답안 복원됨",
              description: "이전에 저장된 답안이 복원되었습니다.",
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore backup:', e);
    }
    setBackupRestored(true);
  }, [examId, backupRestored, toast]);

  // 실시간 경과 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (examId) {
      fetchExam();
    }
  }, [examId]);
  const fetchExam = async () => {
    try {
      const {
        data: examData,
        error: examError
      } = await supabase.from("exams").select("*").eq("id", examId).single();
      if (examError) throw examError;
      setExam(examData);
      const {
        data: questionsData,
        error: questionsError
      } = await supabase.from("exam_questions").select("*").eq("exam_id", examId).order("question_number");
      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (error: any) {
      console.error("Error fetching exam:", error);
      toast({
        title: "오류",
        description: "시험을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  // 정답이 복수인지 확인하는 함수
  const isMultipleAnswerQuestion = (question: Question): boolean => {
    if (question.question_type !== "multiple_choice") return false;
    try {
      const parsed = JSON.parse(question.correct_answer);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  };

  // 정답 비교를 위한 문자열 정규화 함수
  const normalizeForComparison = (text: string): string => {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')           // 연속 공백을 단일 공백으로
      .replace(/^\d+\.\s*/, '')       // 숫자 접두사 제거
      .replace(/\[([명동형부])\]\s*/g, '') // 품사 마커 제거
      .toLowerCase();                 // 소문자로 통일
  };

  // 복합 의미를 개별 단어로 분리 (DB 정답과 실제 선지 매칭용)
  // ⚠️ 특수 패턴 보존: "~을 조사하다", "영향을 미치다" 등은 분리하지 않음
  const splitCompoundMeaning = (text: string): string[] => {
    if (!text) return [];
    
    // 특수 패턴 감지 - 이 패턴들은 분리하지 않음
    const hasSpecialPattern = (t: string): boolean => {
      // ~로 시작하거나 포함
      if (/~/.test(t)) return true;
      // "A를", "A에게" 패턴
      if (/[A-Z]를|[A-Z]에게|[A-Z]의|[A-Z]을/.test(t)) return true;
      // "X을/를 Y하다" 형태 (동사구) - "영향을 미치다", "노력을 들이다" 등
      if (/[가-힣]+[을를]\s+[가-힣]+(하다|되다|주다|받다|시키다|지다|내다|치다|미치다|들이다|쏟다|기울이다|쓰다|보이다|끼치다|잡다|넣다|두다)/.test(t)) return true;
      return false;
    };
    
    // 특수 패턴이 있으면 분리하지 않고 그대로 반환
    if (hasSpecialPattern(text)) {
      return [text.trim()];
    }
    
    // 1. 숫자 패턴으로 분리 ("1. 전망 2. 가망" -> ["전망", "가망"])
    if (/\d+\./.test(text)) {
      const parts = text.split(/\s*\d+\.\s*/).filter(p => p.trim());
      if (parts.length > 1) {
        // 분리된 각 부분도 특수 패턴 확인
        return parts.map(p => p.trim()).filter(p => !hasSpecialPattern(p) || p.trim());
      }
    }
    
    // 2. 공백으로 구분된 한글 단어들이 각각 의미있는 경우 분리
    // "금속 금속의" -> ["금속", "금속의"]
    const words = text.split(/\s+/);
    if (words.length >= 2) {
      // 각 단어가 한글이고 의미 있는 길이인 경우
      const isKoreanMeaning = words.every(w => /^[가-힣]+$/.test(w) || /[가-힣]/.test(w));
      if (isKoreanMeaning) {
        // 동사/형용사가 앞에 오는 패턴 감지 ("감소시키다 감소", "부담을 지우다")
        const verbPattern = /(하다|시키다|지우다|되다|오다|가다|보다|주다|받다|먹다|마시다|지다|나다|내다|치다|들다|미치다|들이다|쏟다|기울이다|쓰다|보이다|끼치다|잡다|넣다|두다)$/;
        
        // 첫 번째 단어가 동사형이면 그것과 나머지를 분리
        if (verbPattern.test(words[0]) && words.length === 2) {
          return words;
        }
        
        // 마지막 단어가 동사형이면 분리 여부 결정
        if (verbPattern.test(words[words.length - 1])) {
          // "부담을 지우다" 같은 구절은 유지 (조사 "을/를"이 있으면 하나의 구)
          if (words.some(w => /을$|를$/.test(w))) {
            // 전체를 하나로 유지
            return [text.trim()];
          }
        }
        
        // 일반적인 명사+형용사 패턴 ("금속 금속의")
        if (words.length === 2) {
          // 두 단어 모두 짧은 경우 (명사 + 파생어)
          if (words[0].length <= 4 && words[1].length <= 4) {
            return words;
          }
        }
      }
    }
    
    return [text.trim()];
  };

  // 정답 배열 가져오기 - choices와 매칭하여 실제 선지에 있는 것만 반환
  const getCorrectAnswersArray = (question: Question): string[] => {
    const availableChoices = (question.choices || []).map(c => normalizeForComparison(c));
    
    let rawCorrectAnswers: string[] = [];
    try {
      const parsed = JSON.parse(question.correct_answer);
      if (Array.isArray(parsed)) {
        rawCorrectAnswers = parsed;
      } else {
        rawCorrectAnswers = [String(question.correct_answer)];
      }
    } catch {
      rawCorrectAnswers = [String(question.correct_answer)];
    }
    
    // 정답을 분리하여 실제 선지와 매칭
    const matchedAnswers: string[] = [];
    
    for (const rawAnswer of rawCorrectAnswers) {
      const normalizedRaw = normalizeForComparison(rawAnswer);
      
      // 1. 직접 매칭 시도
      if (availableChoices.includes(normalizedRaw)) {
        matchedAnswers.push(normalizedRaw);
        continue;
      }
      
      // 2. 분리 후 매칭 시도
      const splitParts = splitCompoundMeaning(rawAnswer);
      for (const part of splitParts) {
        const normalizedPart = normalizeForComparison(part);
        if (availableChoices.includes(normalizedPart) && !matchedAnswers.includes(normalizedPart)) {
          matchedAnswers.push(normalizedPart);
        }
      }
    }
    
    // 매칭된 정답이 없으면 원본 정규화 버전 반환
    if (matchedAnswers.length === 0) {
      return rawCorrectAnswers.map(a => normalizeForComparison(a));
    }
    
    return matchedAnswers;
  };
  const handleAnswerChange = (questionNumber: number, answer: string, isMultiSelect: boolean = false) => {
    setAnswers(prev => {
      if (isMultiSelect) {
        // 복수 선택 모드
        const currentAnswers = Array.isArray(prev[questionNumber]) ? prev[questionNumber] as string[] : prev[questionNumber] ? [prev[questionNumber] as string] : [];
        if (currentAnswers.includes(answer)) {
          // 이미 선택된 답을 다시 클릭하면 선택 해제
          const newAnswers = currentAnswers.filter(a => a !== answer);
          if (newAnswers.length === 0) {
            const newState = {
              ...prev
            };
            delete newState[questionNumber];
            return newState;
          }
          return {
            ...prev,
            [questionNumber]: newAnswers
          };
        } else {
          // 새로운 답 추가
          return {
            ...prev,
            [questionNumber]: [...currentAnswers, answer]
          };
        }
      } else {
        // 단일 선택 모드
        if (prev[questionNumber] === answer) {
          const newAnswers = {
            ...prev
          };
          delete newAnswers[questionNumber];
          return newAnswers;
        }
        return {
          ...prev,
          [questionNumber]: answer
        };
      }
    });
  };
  // 답변이 있는지 확인하는 헬퍼 함수
  const hasAnswer = (answer: string | string[] | undefined): boolean => {
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return answer.trim() !== "";
  };
  const getProgress = () => {
    const answeredCount = Object.keys(answers).filter(key => hasAnswer(answers[parseInt(key)])).length;
    return answeredCount / questions.length * 100;
  };

  // 관리자용 문제 재생성 함수
  const handleRegenerateQuestion = async (questionId: string, questionNumber: number, word: string, meaning: string, questionType: string) => {
    if (!ensureAdminAuth()) return;
    

    
    setRegeneratingQuestion(questionNumber);
    try {
      console.log('Regenerating question:', { questionId, word, meaning, questionType });
      
      // 시험지 내 동일 유형 문제들의 선지 개수를 통일 (최빈값 기준 - 가장 많이 사용된 선지 개수)
      const sameTypeQuestions = questions.filter(q => q.question_type === questionType && q.id !== questionId);
      const choicesCounts = sameTypeQuestions.map(q => q.choices?.length || 0).filter(c => c > 0);
      
      // 최빈값 계산: 가장 많이 나타나는 선지 개수
      const countFrequency: { [key: number]: number } = {};
      choicesCounts.forEach(count => {
        countFrequency[count] = (countFrequency[count] || 0) + 1;
      });
      
      let standardChoicesCount = 8; // 기본값
      if (Object.keys(countFrequency).length > 0) {
        // 가장 빈도가 높은 선지 개수 선택
        standardChoicesCount = Number(
          Object.entries(countFrequency).sort((a, b) => b[1] - a[1])[0][0]
        );
      }
      
      console.log('Standard choices count (mode):', standardChoicesCount, 'from', choicesCounts);
      
      const existingQuestion = questions.find(q => q.id === questionId);
      
      let newChoices: string[] = [];
      let newCorrectAnswer: string | string[] = '';
      
      if (questionType === 'multiple_choice') {
        // 정답 추출 (기존 로직 활용)
        const existingCorrectAnswers = existingQuestion ? getCorrectAnswersArray(existingQuestion) : [meaning];
        
        // 시험지 내 통일된 선지 개수에서 정답 개수를 뺀 만큼의 오답 생성
        const neededWrongChoices = standardChoicesCount - existingCorrectAnswers.length;
        
        // 한국어 오답 선지 재생성 - 영어 단어도 전달하여 난이도 매칭
        const { data: wrongChoicesData, error: wrongChoicesError } = await supabase.functions.invoke('generate-korean-wrong-choices', {
          body: { 
            correctWord: word, 
            correctMeaning: meaning, 
            numberOfChoices: neededWrongChoices,
            vocabularyLevel: 'intermediate' // 어휘 수준 힌트
          }
        });
        
        if (wrongChoicesError) throw wrongChoicesError;
        
        newChoices = [...existingCorrectAnswers, ...(wrongChoicesData?.wrongChoices || [])].sort(() => Math.random() - 0.5);
        newCorrectAnswer = JSON.stringify(existingCorrectAnswers);
        
      } else if (questionType === 'example') {
        // 시험지 내 통일된 선지 개수에서 정답(1개)을 뺀 만큼의 오답 생성
        const neededWrongChoices = standardChoicesCount - 1;
        
        // 영어 오답 선지 재생성
        const { data: wrongChoicesData, error: wrongChoicesError } = await supabase.functions.invoke('generate-english-wrong-choices', {
          body: { correctWord: word, koreanMeaning: meaning, numberOfChoices: neededWrongChoices }
        });
        
        if (wrongChoicesError) throw wrongChoicesError;
        
        newChoices = [word, ...(wrongChoicesData?.wrongChoices || [])].sort(() => Math.random() - 0.5);
        newCorrectAnswer = word;
        
      } else if (questionType === 'definition') {
        // 시험지 내 통일된 선지 개수에서 정답(1개)을 뺀 만큼의 오답 생성
        const neededWrongChoices = standardChoicesCount - 1;
        
        // 영어 오답 선지 재생성
        const { data: wrongChoicesData, error: wrongChoicesError } = await supabase.functions.invoke('generate-english-wrong-choices', {
          body: { correctWord: word, koreanMeaning: meaning, numberOfChoices: neededWrongChoices }
        });
        
        if (wrongChoicesError) throw wrongChoicesError;
        
        newChoices = [word, ...(wrongChoicesData?.wrongChoices || [])].sort(() => Math.random() - 0.5);
        newCorrectAnswer = word;
        
      } else if (questionType === 'synonym_antonym') {
        // 무관 단어 재생성
        const { data: unrelatedData, error: unrelatedError } = await supabase.functions.invoke('generate-unrelated-word', {
          body: { headword: word, meaning, synonyms: [], antonyms: [] }
        });
        
        if (unrelatedError) throw unrelatedError;
        
        const existingChoices = existingQuestion?.choices || [];
        const unrelatedWord = unrelatedData?.word || 'tangible';
        
        // 기존 선지에서 정답(무관 단어)만 교체 - 선지 개수 유지
        newChoices = existingChoices.slice(0, -1).concat([unrelatedWord]).sort(() => Math.random() - 0.5);
        newCorrectAnswer = unrelatedWord;
      }
      
      // DB 업데이트
      const { error: updateError } = await supabase
        .from('exam_questions')
        .update({ 
          choices: newChoices,
          correct_answer: typeof newCorrectAnswer === 'string' ? newCorrectAnswer : JSON.stringify(newCorrectAnswer)
        })
        .eq('id', questionId);
      
      if (updateError) throw updateError;
      
      // 로컬 상태 업데이트
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, choices: newChoices, correct_answer: typeof newCorrectAnswer === 'string' ? newCorrectAnswer : JSON.stringify(newCorrectAnswer) }
          : q
      ));
      
      // 해당 문제의 답안 초기화
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[questionNumber];
        return newAnswers;
      });
      
      toast({
        title: "재생성 완료",
        description: `${questionNumber}번 문제가 재생성되었습니다.`,
      });
      
    } catch (error) {
      console.error('Error regenerating question:', error);
      toast({
        title: "재생성 실패",
        description: "문제 재생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setRegeneratingQuestion(null);
    }
  };
  const handleDownloadWord = async () => {
    try {
      // 폰트 크기 8pt = 16 half-points
      const FONT_SIZE = 16;
      const FONT_SIZE_SMALL = 14;
      const FONT_SIZE_TITLE = 20;
      const FONT_SIZE_HEADER = 24;
      const FONT_NAME = "맑은 고딕";

      // 선지 번호 (1, 2, 3, 4 형식)
      const getChoiceLabel = (idx: number) => `${idx + 1})`;

      // 문제를 텍스트 형태로 생성
      const createQuestionParagraphs = () => {
        const allQuestions = [...questions].sort((a, b) => a.question_number - b.question_number);
        const paragraphs: any[] = [];
        allQuestions.forEach(question => {
          // 문제 내용 결정
          let questionText = "";
          let typeLabel = "";
          let correctAnswerCount = 0;
          if (question.question_type === "multiple_choice") {
            questionText = question.word;
            typeLabel = "뜻";
            // 정답 개수 계산
            const correctAnswers = getCorrectAnswersArray(question);
            correctAnswerCount = correctAnswers.length;
          } else if (question.question_type === "spelling") {
            questionText = question.meaning;
            typeLabel = "철자";
          } else if (question.question_type === "spelling_choice") {
            questionText = question.meaning;
            typeLabel = "철자(객)";
          } else if (question.question_type === "definition") {
            questionText = question.english_definition || question.word;
            typeLabel = "영영";
          } else {
            questionText = question.meaning;
            typeLabel = "예문";
          }

          // 문제 번호와 유형, 내용
          const textRuns: any[] = [
            new TextRun({
              text: `${question.question_number}. `,
              bold: true,
              size: FONT_SIZE,
              font: FONT_NAME
            }),
            new TextRun({
              text: `[${typeLabel}] `,
              size: FONT_SIZE_SMALL,
              font: FONT_NAME,
              color: "888888"
            }),
            new TextRun({
              text: questionText,
              size: FONT_SIZE,
              font: FONT_NAME
            })
          ];
          
          // 객관식 문제에 정답 개수 표시
          if (question.question_type === "multiple_choice" && correctAnswerCount > 0) {
            textRuns.push(new TextRun({
              text: ` (${correctAnswerCount}개)`,
              size: FONT_SIZE_SMALL,
              font: FONT_NAME,
              color: "0066CC",
              bold: true
            }));
          }
          
          paragraphs.push(new Paragraph({
            children: textRuns,
            spacing: {
              before: 80,
              after: 30
            }
          }));

          // 예문완성의 경우 예문 추가
          if (question.question_type === "example" && question.example_sentence) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: `   → ${question.example_sentence}`,
                size: FONT_SIZE_SMALL,
                font: FONT_NAME,
                italics: true,
                color: "555555"
              })],
              spacing: {
                after: 30
              }
            }));
          }

          // 선택지 (객관식, 영영풀이) - 한 줄에 표시
          if ((question.question_type === "multiple_choice" || question.question_type === "definition" || question.question_type === "example" || question.question_type === "spelling_choice") && question.choices) {
            const choiceText = question.choices.map((choice, idx) => `${getChoiceLabel(idx)} ${cleanChoiceForDisplay(choice)}`).join("  ");
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: `   ${choiceText}`,
                size: FONT_SIZE_SMALL,
                font: FONT_NAME
              })],
              spacing: {
                after: 40
              }
            }));
          }

          // 철자쓰기 답안란 (예문완성은 보기가 있으므로 제외)
          if (question.question_type === "spelling") {
            const cleanWord = question.correct_answer.replace(/^\d+\.\s*/, '').trim();
            const firstLetter = cleanWord[0] || "";
            paragraphs.push(new Paragraph({
              children: [new TextRun({
                text: `   [${firstLetter}`,
                size: FONT_SIZE,
                font: FONT_NAME,
                bold: true
              }), new TextRun({
                text: "_".repeat(15),
                size: FONT_SIZE,
                font: FONT_NAME,
                color: "AAAAAA"
              }), new TextRun({
                text: "]",
                size: FONT_SIZE,
                font: FONT_NAME,
                bold: true
              })],
              spacing: {
                after: 40
              }
            }));
          }

          // 문제 사이 빈 줄 추가
          paragraphs.push(new Paragraph({
            text: "",
            spacing: {
              after: 80
            }
          }));
        });
        return paragraphs;
      };

      // 정답을 텍스트로 생성 (한 문제씩 줄바꿈)
      const createAnswerParagraphs = () => {
        const allQuestions = [...questions].sort((a, b) => a.question_number - b.question_number);
        const paragraphs: any[] = [];
        allQuestions.forEach(question => {
          let answerText = "";
          if (question.question_type === "multiple_choice" || question.question_type === "definition" || question.question_type === "example" || question.question_type === "spelling_choice") {
            // definition 유형은 meaning을 사용, 나머지는 correct_answer 사용
            const answerToFind = question.question_type === "definition" ? question.meaning : question.correct_answer;
            const correctIndex = question.choices?.indexOf(answerToFind) ?? -1;
            // 번호와 함께 정답 내용도 표시
            answerText = correctIndex >= 0 ? `${getChoiceLabel(correctIndex)} ${answerToFind}` : answerToFind;
          } else {
            answerText = question.correct_answer.replace(/^\d+\.\s*/, '').trim();
          }
          paragraphs.push(new Paragraph({
            children: [new TextRun({
              text: `${question.question_number}. ${answerText}`,
              size: FONT_SIZE,
              font: FONT_NAME
            })],
            spacing: {
              before: 20,
              after: 20
            }
          }));
        });
        return paragraphs;
      };
      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: FONT_NAME,
                size: FONT_SIZE
              }
            }
          }
        },
        sections: [
        // 시험지 섹션 (2단)
        {
          properties: {
            page: {
              margin: {
                top: 567,
                right: 567,
                bottom: 567,
                left: 567
              }
            },
            column: {
              space: 400,
              count: 2
            }
          },
          children: [
          // 헤더
          new Paragraph({
            children: [new TextRun({
              text: "ORUN ENGLISH",
              bold: true,
              size: FONT_SIZE_HEADER,
              font: FONT_NAME
            }), new TextRun({
              text: "  |  ",
              size: FONT_SIZE,
              font: FONT_NAME,
              color: "CCCCCC"
            }), new TextRun({
              text: exam?.title || "어휘 시험",
              bold: true,
              size: FONT_SIZE_TITLE,
              font: FONT_NAME
            }), new TextRun({
              text: ` (${questions.length}문항)`,
              size: FONT_SIZE_SMALL,
              font: FONT_NAME,
              color: "888888"
            })],
            spacing: {
              after: 60
            },
            border: {
              bottom: {
                style: BorderStyle.SINGLE,
                size: 12,
                color: "333333"
              }
            }
          }),
          // 이름 입력란
          new Paragraph({
            children: [new TextRun({
              text: "이름: _______________     점수: _____ / " + questions.length,
              size: FONT_SIZE,
              font: FONT_NAME
            })],
            alignment: AlignmentType.RIGHT,
            spacing: {
              before: 80,
              after: 150
            }
          }),
          // 문제들
          ...createQuestionParagraphs()]
        },
        // 정답표 섹션 (2단)
        {
          properties: {
            page: {
              margin: {
                top: 567,
                right: 567,
                bottom: 567,
                left: 567
              }
            },
            column: {
              space: 400,
              count: 2
            }
          },
          children: [
          // 정답표 제목
          new Paragraph({
            children: [new TextRun({
              text: "정 답 표",
              bold: true,
              size: FONT_SIZE_HEADER,
              font: FONT_NAME
            }), new TextRun({
              text: `  |  ${exam?.title || "어휘 시험"}`,
              size: FONT_SIZE,
              font: FONT_NAME,
              color: "888888"
            })],
            spacing: {
              after: 100
            },
            border: {
              bottom: {
                style: BorderStyle.DOUBLE,
                size: 6,
                color: "333333"
              }
            }
          }),
          // 여백
          new Paragraph({
            text: "",
            spacing: {
              after: 150
            }
          }),
          // 정답들
          ...createAnswerParagraphs(),
          // 하단
          new Paragraph({
            text: "",
            spacing: {
              after: 200
            }
          }), new Paragraph({
            children: [new TextRun({
              text: `© ${new Date().getFullYear()} ORUN ENGLISH`,
              size: FONT_SIZE_SMALL,
              font: FONT_NAME,
              color: "AAAAAA"
            })],
            alignment: AlignmentType.CENTER
          })]
        }]
      });
      const blob = await Packer.toBlob(doc);
      const fileName = `${exam?.title || '시험지'}_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '-')}.docx`;
      saveAs(blob, fileName);
      toast({
        title: "Word 다운로드 완료",
        description: "시험지가 Word 파일로 저장되었습니다."
      });
    } catch (error) {
      console.error("Word 생성 오류:", error);
      toast({
        title: "Word 생성 실패",
        description: "Word 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 제출 재시도 함수 (네트워크 문제 대비)
  const submitWithRetry = async (submitFn: () => Promise<void>, maxRetries = 3): Promise<void> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await submitFn();
        return;
      } catch (error: any) {
        console.error(`Submit attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) throw error;
        // 재시도 전 대기 (1초, 2초, 3초...)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  };

  // saveAnswersLocally 함수는 상단에 정의됨 (useEffect 전에 필요하므로)

  // 로컬 백업 삭제
  const clearLocalBackup = () => {
    try {
      localStorage.removeItem(`exam_backup_${examId}`);
    } catch (e) {
      console.error('Failed to clear local backup:', e);
    }
  };
  const handleSubmit = async () => {
    // 이미 제출 중이면 중복 제출 방지
    if (submitting) {
      toast({
        title: "제출 중",
        description: "이미 제출 중입니다. 잠시만 기다려주세요.",
      });
      return;
    }

    // 미응답 문제가 있을 경우 경고 후 제출 허용
    const unansweredQuestions = questions.filter(q => !hasAnswer(answers[q.question_number]));
    if (unansweredQuestions.length > 0) {
      const confirm = window.confirm(`${unansweredQuestions.length}개의 답안이 비어있습니다. 그래도 제출하시겠습니까?`);
      if (!confirm) return;
    }

    // 제출 전 로컬에 답안 백업
    saveAnswersLocally();
    setSubmitting(true);
    try {
      let correctCount = 0;

      // 유형별 정답/문제수 추적
      const typeStats = {
        multiple_choice: {
          correct: 0,
          total: 0
        },
        spelling: {
          correct: 0,
          total: 0
        },
        definition: {
          correct: 0,
          total: 0
        },
        example: {
          correct: 0,
          total: 0
        }
      };
      // 부분 점수를 포함한 총점 계산용 변수
      let totalPartialScore = 0;
      
      // 정규화 함수 - 뜻맞추기 퀴즈와 동일한 로직
      const normalizeChoice = (s: string | undefined | null): string => {
        if (!s) return '';
        // 품사 마커 제거 및 정규화
        return s.trim()
          .replace(/\[([명동형부])\]\s*/g, '')
          .replace(/\s*\[([명동형부])\]\s*/g, ' ')
          .replace(/\([^)]*\)\s*/g, '')
          .replace(/\[[^\]]*\]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
      };
      
      const answerDetails = questions.map(question => {
        const studentAnswer = answers[question.question_number] || "";
        let isCorrect = false;
        let partialScore = 0; // 0 ~ 1 사이의 부분 점수
        
        if (question.question_type === "multiple_choice" && isMultipleAnswerQuestion(question)) {
          // 뜻맞추기 퀴즈와 동일한 클라이언트 채점 로직 사용 (AI 호출 없음)
          const correctAnswers = getCorrectAnswersArray(question);
          const studentAnswersArray = Array.isArray(studentAnswer) ? studentAnswer : [];
          
          // 정규화된 비교 (뜻맞추기 퀴즈와 동일)
          const normalizedSelected = studentAnswersArray.filter(Boolean).map(normalizeChoice);
          const normalizedCorrect = correctAnswers.filter(Boolean).map(normalizeChoice);
          
          // 모든 정답을 선택했는지 확인 (부분 일치 허용)
          const hasAllCorrect = normalizedCorrect.every(answer => 
            normalizedSelected.some(selected => 
              selected === answer || selected.includes(answer) || answer.includes(selected)
            )
          );
          
          // 오답을 선택하지 않았는지 확인
          const hasNoIncorrect = normalizedSelected.every(choice => 
            normalizedCorrect.some(correct => 
              choice === correct || choice.includes(correct) || correct.includes(choice)
            )
          );
          
          // 선택 개수도 비교 (완전 일치 확인)
          isCorrect = hasAllCorrect && hasNoIncorrect && studentAnswersArray.length === correctAnswers.length;
          
          // 부분 점수 계산 - 빈 답 선택 시 0점 처리
          const validSelected = normalizedSelected.filter(s => s && s.trim().length > 0);
          
          // 아무것도 선택하지 않았으면 0점
          if (validSelected.length === 0) {
            partialScore = 0;
          } else {
            const correctlySelected = normalizedCorrect.filter(correct => 
              correct && validSelected.some(sa => sa === correct || (sa.length > 1 && sa.includes(correct)) || (correct.length > 1 && correct.includes(sa)))
            ).length;
            const wronglySelected = validSelected.filter(selected => 
              selected && !normalizedCorrect.some(ca => ca === selected || (ca.length > 1 && ca.includes(selected)) || (selected.length > 1 && selected.includes(ca)))
            ).length;
            const totalCorrectCount = normalizedCorrect.length || 1;
            partialScore = isCorrect ? 1 : Math.max(0, (correctlySelected - wronglySelected) / totalCorrectCount);
          }
          
        } else if (question.question_type === "multiple_choice" || question.question_type === "definition" || question.question_type === "spelling_choice") {
          // 단일 정답 객관식, 영영풀이, 철자쓰기(객관식)
          const singleAnswer = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
          if (question.question_type === "spelling_choice") {
            isCorrect = (singleAnswer || '').toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
          } else {
            isCorrect = normalizeForComparison(singleAnswer) === normalizeForComparison(question.correct_answer);
          }
          partialScore = isCorrect ? 1 : 0;
        } else {
          // 철자쓰기와 예문완성은 대소문자 무시하고 비교
          const singleAnswer = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer;
          isCorrect = singleAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
          partialScore = isCorrect ? 1 : 0;
        }
        
        // 부분 점수 합산
        totalPartialScore += partialScore;
        
        if (isCorrect) correctCount++;

        // 유형별 통계 업데이트 (spelling_choice는 spelling으로 집계)
        const rawType = question.question_type;
        const questionType = (rawType === "spelling_choice" ? "spelling" : rawType) as keyof typeof typeStats;
        if (typeStats[questionType]) {
          typeStats[questionType].total++;
          if (isCorrect) {
            typeStats[questionType].correct++;
          }
        }
        return {
          question_number: question.question_number,
          question_type: question.question_type,
          word: question.word,
          meaning: question.meaning,
          student_answer: studentAnswer,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          partial_score: partialScore // 부분 점수 저장
        };
      });
      // 부분 점수 기반 총점 계산 (100점 만점)
      const score = Math.round((totalPartialScore / questions.length) * 100);
      const studentData = sessionStorage.getItem("studentData");
      const studentSessionId = studentData ? JSON.parse(studentData).sessionId : null;

      // 재시도 로직으로 제출
      await submitWithRetry(async () => {
        const {
          error: submissionError
        } = await supabase.from("exam_submissions").insert({
          exam_id: examId,
          student_session_id: studentSessionId,
          student_name: studentName,
          student_class: studentClass || null,
          answers: answerDetails,
          score,
          correct_count: correctCount,
          total_count: questions.length
        });
        if (submissionError) throw submissionError;
      });

      // exam_results 업데이트도 재시도 로직 적용
      await submitWithRetry(async () => {
        const {
          data: existingResult,
          error: fetchError
        } = await supabase.from("exam_results").select("*").eq("student_name", studentName).maybeSingle();
        if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

        // 유형별 점수 객체 생성 (0이 아닌 유형만 포함)
        const type_scores: any = {};
        if (typeStats.multiple_choice.total > 0) {
          type_scores.multiple_choice = typeStats.multiple_choice;
        }
        if (typeStats.spelling.total > 0) {
          type_scores.spelling = typeStats.spelling;
        }
        if (typeStats.definition.total > 0) {
          type_scores.definition = typeStats.definition;
        }
        if (typeStats.example.total > 0) {
          type_scores.example = typeStats.example;
        }
        if (existingResult) {
          const newTotalExams = existingResult.total_exams + 1;
          const newTotalScore = existingResult.total_score + score;
          const newAverageScore = newTotalScore / newTotalExams;
          const existingHistory = Array.isArray(existingResult.exam_history) ? existingResult.exam_history : [];
          const newHistory = [...existingHistory, {
            exam_id: examId,
            exam_title: exam.title,
            score,
            submitted_at: new Date().toISOString(),
            type_scores
          }];
          const {
            error: updateError
          } = await supabase.from("exam_results").update({
            total_exams: newTotalExams,
            total_score: newTotalScore,
            average_score: newAverageScore,
            exam_history: newHistory,
            updated_at: new Date().toISOString()
          }).eq("id", existingResult.id);
          if (updateError) throw updateError;
        } else {
          const {
            error: insertError
          } = await supabase.from("exam_results").insert({
            student_session_id: studentSessionId,
            student_name: studentName,
            total_exams: 1,
            total_score: score,
            average_score: score,
            exam_history: [{
              exam_id: examId,
              exam_title: exam.title,
              score,
              submitted_at: new Date().toISOString(),
              type_scores
            }]
          });
          if (insertError) throw insertError;
        }
      });

      // 제출 성공 시 로컬 백업 삭제
      clearLocalBackup();

      // 관리자 코드(admin, 101100)인 경우에만 시험 결과 페이지로 이동
      const accessCode = sessionStorage.getItem("accessCode");
      const isAdmin = accessCode === "admin" || accessCode === "101100";
      if (isAdmin) {
        toast({
          title: "제출 완료",
          description: `시험이 제출되었습니다. 점수: ${score}점 (${correctCount}/${questions.length})`
        });
        navigate("/exam-results");
      } else {
        // 학생은 수고하셨습니다 화면으로 이동
        navigate("/exam-complete");
      }
    } catch (error: any) {
      console.error("Error submitting exam:", error);
      toast({
        title: "제출 실패",
        description: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 답안은 저장되어 있습니다.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return <FullPageLoading message="시험 로딩 중..." />;
  }

  // 시험 시작 전 응시자 정보 입력 화면
  if (!showExam) {
    return <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* 로고 및 시험 정보 */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-white shadow-xl border border-slate-200/80 flex items-center justify-center overflow-hidden p-3 mx-auto">
                <img src={orunLogo} alt="ORUN" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {exam?.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              총 {questions.length}문제 • 어휘 테스트
            </p>
          </div>

          {/* 응시자 정보 입력 카드 */}
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-blue-500" />
                응시자 정보 입력
              </CardTitle>
              <CardDescription>
                시험 응시를 위해 아래 정보를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-name" className="text-sm font-medium">
                  이름 <span className="text-red-500">*</span>
                </Label>
                <Input id="student-name" placeholder="이름+휴대폰번호 뒷4자리 (예:김옳은5554)" value={studentName} onChange={e => setStudentName(e.target.value)} className="h-12 text-sm placeholder:text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-class" className="text-sm font-medium">
                  반 선택
                </Label>
                <select id="student-class" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full h-12 text-base border rounded-lg px-3 bg-background focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                  <option value="">반을 선택하세요</option>
                  {classOptions.map(option => <option key={option} value={option}>
                      {option}
                    </option>)}
                </select>
              </div>
            </CardContent>
            <div className="p-6 pt-2">
              <Button onClick={() => {
              if (!studentName.trim()) {
                toast({
                  title: "이름 입력 필요",
                  description: "이름을 입력해주세요.",
                  variant: "destructive"
                });
                return;
              }
              setShowExam(true);
            }} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg">
                <Play className="w-5 h-5 mr-2" />
                시험 시작하기
              </Button>
            </div>
          </Card>

          {/* 시험 안내 */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">시험 안내</p>
                <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                  <li>• 문제를 꼼꼼히 읽고 답안을 작성하세요</li>
                  <li>• 모든 문제에 답변하지 않아도 제출 가능합니다</li>
                  <li>• 제출 후에는 수정이 불가합니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  const answeredCount = Object.keys(answers).filter(key => hasAnswer(answers[parseInt(key)])).length;
  return <div className={`bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 ${isMobile ? 'h-[100dvh] flex flex-col overflow-hidden' : 'min-h-screen py-3 sm:py-6 md:py-10'}`}>
      <div className={`${isMobile ? 'flex flex-col h-full px-2 w-full' : 'max-w-4xl mx-auto px-4 sm:px-6'}`}>
        {/* 모바일 프리미엄 헤더 */}
        {isMobile ? <div className="flex-shrink-0 py-2 space-y-2">
            {/* 글래스모피즘 메인 헤더 카드 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
              {/* 배경 데코레이션 */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-emerald-400/15 to-teal-500/15 rounded-full blur-xl" />
              </div>
              
              <div className="relative p-3">
                {/* 상단: 로고 + 경과시간 + 제목 */}
                <div className="flex items-center gap-2 mb-2">
                  {/* 로고 with 글로우 */}
                  <div className="relative group flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative w-9 h-9 rounded-xl bg-white shadow-lg border border-slate-200/80 flex items-center justify-center overflow-hidden p-1 ring-2 ring-white/50">
                      <img src={orunLogo} alt="ORUN" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  
                  {/* 경과 시간 - 프리미엄 스타일 */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white px-2.5 py-1 rounded-lg shadow-lg flex-shrink-0">
                    <Clock className="w-3 h-3 opacity-70" />
                    <span className="text-xs font-bold tracking-wider tabular-nums">
                      {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:{String(elapsedTime % 60).padStart(2, '0')}
                    </span>
                  </div>
                  
                  {/* 제목 - 시계 오른쪽에 작은 폰트로 */}
                  
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-2">
                  총 {questions.length}문제 • 어휘 테스트
                </p>
                
                {/* 하단: 문제 진행 상태 바 */}
                <div className="flex items-center gap-2">
                  {/* 현재 문제 인디케이터 */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2.5 py-1 rounded-lg shadow-md">
                    <span className="text-[11px] font-bold">Q.{currentQuestionIndex + 1}</span>
                    <span className="text-[9px] opacity-80">/ {questions.length}</span>
                  </div>
                  
                  {/* 프로그레스 바 */}
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out relative" style={{
                  width: `${getProgress()}%`
                }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/30" />
                    </div>
                  </div>
                  
                  {/* 완료 상태 */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all duration-300 ${answeredCount === questions.length ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md animate-pulse' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'}`}>
                    {answeredCount === questions.length && <CheckCircle className="w-3 h-3" />}
                    <span>{answeredCount}/{questions.length}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 수험자 정보 - 표시 전용 */}
            
          </div> : (/* 데스크탑 헤더 */
      <div className="mb-4 sm:mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center overflow-hidden p-1.5">
                  <img src={orunLogo} alt="ORUN" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    {exam?.title}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    총 {questions.length}문제
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
              const student = getCurrentStudent();
              const storedAccessCode = sessionStorage.getItem('accessCode');
              const accessCode = student?.access_code || storedAccessCode;
              return (accessCode === "101100" || accessCode === "admin") && <Button onClick={handleDownloadWord} variant="outline" size="sm" className="h-9 px-3 text-xs font-medium border-slate-300 hover:bg-slate-100">
                      <FileText className="w-4 h-4 mr-1.5" />
                      <span className="hidden sm:inline">Word</span>
                    </Button>;
            })()}
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                  <span className="font-bold text-blue-700 dark:text-blue-300">경과</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:{String(elapsedTime % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 수험자 정보 표시 */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      수험자 성명
                    </Label>
                    <div className="h-11 flex items-center px-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg border border-slate-200/50">
                      <span className="text-base font-medium text-slate-700 dark:text-slate-200">{studentName}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      반
                    </Label>
                    <div className="h-11 flex items-center px-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg border border-slate-200/50">
                      <span className="text-base font-medium text-slate-700 dark:text-slate-200">{studentClass || '-'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        진행률
                      </Label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {answeredCount}/{questions.length}
                      </span>
                    </div>
                    <div className="relative h-11 flex items-center">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out" style={{
                      width: `${getProgress()}%`
                    }} />
                      </div>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                        {getProgress().toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>)}

        {/* 문제 섹션 */}
        {isMobile ?
      // 모바일: 한 문제씩 표시 - 스크롤 가능하게 변경
      <div className="flex-1 flex flex-col pb-28" style={{ minHeight: 'auto' }}>
            {questions.length > 0 && <>

                {/* 현재 문제 카드 - 프리미엄 디자인 */}
                <div className="flex flex-col">
                {(() => {
              const question = questions[currentQuestionIndex];
              if (!question) return null;
              
              return <div className={`flex flex-col bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 ${hasAnswer(answers[question.question_number]) ? "ring-2 ring-emerald-500/30" : ""}`}>
                      
                      {/* 문제 헤더 - 프리미엄 스타일 */}
                      <div className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-950 dark:to-slate-900">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner ${hasAnswer(answers[question.question_number]) ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white" : "bg-white/10 text-white/90 backdrop-blur-sm"}`}>
                              {question.question_number}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-semibold tracking-wide ${question.question_type === "multiple_choice" ? "text-blue-300" : (question.question_type === "spelling" || question.question_type === "spelling_choice") ? "text-violet-300" : question.question_type === "example" ? "text-emerald-300" : "text-amber-300"}`}>
                                {question.question_type === "multiple_choice" ? "MULTIPLE CHOICE" : question.question_type === "spelling" ? "SPELLING" : question.question_type === "spelling_choice" ? "SPELLING (MCQ)" : question.question_type === "example" ? "SENTENCE" : "DEFINITION"}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {question.question_type === "multiple_choice" ? isMultipleAnswerQuestion(question) ? "해당하는 뜻을 모두 선택" : "의미 선택" : question.question_type === "example" ? "빈칸에 들어갈 단어" : question.question_type === "definition" ? "영영풀이" : question.question_type === "spelling_choice" ? "정답 단어 선택" : "철자를 입력하세요"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {question.question_type !== 'spelling' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRegenerateQuestion(question.id, question.question_number, question.word, question.meaning, question.question_type)}
                                disabled={regeneratingQuestion === question.question_number}
                                className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/20"
                                title="문제 재생성"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${regeneratingQuestion === question.question_number ? 'animate-spin' : ''}`} />
                              </Button>
                            )}
                            {hasAnswer(answers[question.question_number]) && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-[9px] font-medium text-emerald-300">완료</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 문제 텍스트 영역 */}
                      <div className="flex-shrink-0 px-3 py-3 border-b border-slate-100 dark:border-slate-800">
                        {question.question_type === "example" && question.example_sentence ? (
                          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic">{question.example_sentence}</p>
                          </div>
                        ) : question.question_type === "definition" && question.english_definition ? (
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 px-3 py-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic">{question.english_definition}</p>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                              {question.question_type === "multiple_choice" ? question.word.replace(/^\d+\.\s*/, '').trim() : question.meaning}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 선택지/입력 영역 - 초컴팩트 2열 그리드 */}
                      <div className="px-2 py-1.5 flex flex-col">
                        {(question.question_type === "multiple_choice" || question.question_type === "definition" || question.question_type === "example" || question.question_type === "spelling_choice") && question.choices ? (() => {
                    const isMultiSelect = isMultipleAnswerQuestion(question);
                    const correctCount = isMultiSelect ? getCorrectAnswersArray(question).length : 1;
                    const currentAnswersForQ = Array.isArray(answers[question.question_number]) ? answers[question.question_number] as string[] : answers[question.question_number] ? [answers[question.question_number] as string] : [];
                    const selectedCount = currentAnswersForQ.length;
                    const isComplete = isMultiSelect && selectedCount === correctCount;
                    
                    return <div className="flex flex-col gap-1">
                                {isMultiSelect && (
                                  <div className={`flex-shrink-0 rounded-md px-2 py-1 transition-all duration-200 ${isComplete ? 'bg-emerald-100 border border-emerald-300' : 'bg-blue-100 border border-blue-300'}`}>
                                    <p className={`text-[10px] font-bold flex items-center justify-center gap-1 ${isComplete ? 'text-emerald-700' : 'text-blue-700'}`}>
                                      {isComplete ? (
                                        <><CheckCircle className="w-3 h-3" /> 완료!</>
                                      ) : (
                                        <>{selectedCount}/{correctCount}개 선택</>
                                      )}
                                    </p>
                                  </div>
                                )}
                                {/* 선택지 - 프리미엄 2열 그리드 */}
                                <div className="grid grid-cols-2 gap-1.5">
                                  {question.choices.map((choice, index) => {
                          const isSelected = currentAnswersForQ.includes(choice);
                          return (
                            <button 
                              key={index} 
                              onClick={() => handleAnswerChange(question.question_number, choice, isMultiSelect)} 
                              className={`group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200 active:scale-[0.97] text-left overflow-hidden ${
                                isComplete && isSelected 
                                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200/50" 
                                  : isSelected 
                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200/50" 
                                    : "bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
                              }`}
                            >
                              {/* 선택 시 미세 광택 효과 */}
                              {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                              )}
                              <div className={`relative w-5 h-5 ${isMultiSelect ? 'rounded-md' : 'rounded-full'} flex items-center justify-center flex-shrink-0 font-bold text-[10px] transition-all ${
                                isComplete && isSelected 
                                  ? "bg-white/25 text-white border border-white/40" 
                                  : isSelected 
                                    ? "bg-white/25 text-white border border-white/40" 
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}>
                                {isSelected ? "✓" : index + 1}
                              </div>
                              <span className={`relative flex-1 text-xs leading-snug line-clamp-2 ${
                                isComplete && isSelected 
                                  ? "font-semibold text-white" 
                                  : isSelected 
                                    ? "font-semibold text-white" 
                                    : "text-slate-700 group-hover:text-slate-900"
                              }`}>
                                {cleanChoiceForDisplay(choice)}
                              </span>
                            </button>
                          );
                        })}
                                </div>
                              </div>;
                  })() : (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg px-3 py-2">
                        <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                          <span className="text-lg">💡</span>
                          힌트: 첫 글자는{" "}
                          <span className="font-black text-lg px-2 py-0.5 bg-amber-200 rounded-md">
                            {(() => {
                              const cleanWord = question.correct_answer.replace(/^\d+\.\s*/, '').trim();
                              return cleanWord[0] || '';
                            })()}
                          </span>
                        </p>
                      </div>
                      <div className="relative">
                        <Input 
                          placeholder="철자를 입력하세요" 
                          value={answers[question.question_number] || ""} 
                          onChange={e => handleAnswerChange(question.question_number, e.target.value)} 
                          className="h-12 text-lg border-2 border-slate-200 focus:border-slate-400 rounded-lg font-mono tracking-widest bg-white shadow-inner" 
                        />
                        {answers[question.question_number] && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                      </div>
                    </div>;
            })()}
                </div>

                {/* 모바일 하단 네비게이션 - 화면 하단 고정 */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 px-3 pt-2 pb-[env(safe-area-inset-bottom,8px)] space-y-2 z-50">
                  {/* 미입력 경고 - 마지막 문제일 때만 */}
                  {currentQuestionIndex === questions.length - 1 && unansweredQuestions.length > 0 && <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="text-[10px] font-medium text-amber-700">미입력 {unansweredQuestions.length}개:</span>
                      <div className="flex gap-1 flex-wrap">
                        {unansweredQuestions.slice(0, 8).map(qNum => <button key={qNum} onClick={() => {
                  const idx = questions.findIndex(q => q.question_number === qNum);
                  if (idx !== -1) setCurrentQuestionIndex(idx);
                }} className="w-5 h-5 text-[10px] font-bold rounded bg-amber-200 text-amber-800 hover:bg-amber-300">
                            {qNum}
                          </button>)}
                        {unansweredQuestions.length > 8 && <span className="text-[10px] text-amber-600 self-center">+{unansweredQuestions.length - 8}</span>}
                      </div>
                    </div>}
                  
                  {/* 네비게이션 버튼 */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0} className="flex-1 h-10 text-xs font-semibold rounded-lg border-2 border-slate-200 disabled:opacity-40">
                      <ChevronLeft className="w-4 h-4 mr-0.5" />
                      이전
                    </Button>
                    
                    {currentQuestionIndex === questions.length - 1 ? <Button onClick={handleSubmit} disabled={submitting || !studentName.trim()} className="flex-[2] h-10 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                            <Send className="w-4 h-4 mr-1" />
                            제출
                          </>}
                      </Button> : <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="flex-1 h-10 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700">
                        다음
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </Button>}
                  </div>
                </div>
              </>}
          </div> :
      // 데스크탑: 기존 그리드 레이아웃
      <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 lg:grid lg:grid-cols-2">
            {questions.map((question, idx) => <Card key={question.id} className={`border-2 transition-all duration-200 flex flex-col ${answers[question.question_number] ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : "border-slate-200 hover:border-slate-300"}`}>
                <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-4">
                    {/* 문제 번호 */}
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg ${answers[question.question_number] ? "bg-green-600 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {question.question_number}
                    </div>

                    {/* 문제 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${question.question_type === "multiple_choice" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : (question.question_type === "spelling" || question.question_type === "spelling_choice") ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : question.question_type === "example" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : question.question_type === "synonym_antonym" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"}`}>
                          {question.question_type === "multiple_choice" ? "객관식(의미)" : question.question_type === "spelling" ? "철자쓰기" : question.question_type === "spelling_choice" ? "철자쓰기(객관식)" : question.question_type === "example" ? "예문완성" : question.question_type === "synonym_antonym" ? "동/반의어" : "영영풀이"}
                        </span>
                      </div>
                      <CardTitle className="text-sm sm:text-base md:text-lg font-semibold leading-tight">
                        {question.question_type === "multiple_choice" ? isMultipleAnswerQuestion(question) ? <span>다음 단어의 <span className="text-blue-600">모든 뜻</span>을 고르세요</span> : <span>다음 단어의 의미를 고르세요</span> : question.question_type === "example" ? <span>예문의 빈칸에 들어갈 단어</span> : question.question_type === "definition" ? <span>영영풀이에 해당하는 단어</span> : question.question_type === "synonym_antonym" ? <span>동/반의어가 <span className="text-rose-600 font-bold">아닌</span> 단어를 고르세요</span> : question.question_type === "spelling_choice" ? <span>의미에 맞는 <span className="text-purple-600">영어 단어</span>를 고르세요</span> : <span>의미의 영어 철자를 쓰세요</span>}
                      </CardTitle>
                      {question.question_type === "example" && question.example_sentence ? <div className="mt-2 sm:mt-4 space-y-2">
                          <div className="bg-muted/30 p-2 sm:p-4 rounded-lg">
                            <p className="text-sm sm:text-base md:text-lg font-mono leading-relaxed break-words">
                              {(() => {
                                // 슬래쉬 앞부분만 추출 (한국어 번역 제거)
                                const englishOnly = question.example_sentence.split('/')[0].trim();
                                // _단어_ 형태를 빈칸으로 변환
                                const parts = englishOnly.split(/(_[^_]+_)/g);
                                return parts.map((part, idx) => {
                                  if (part.startsWith('_') && part.endsWith('_')) {
                                    const wordLength = part.slice(1, -1).length;
                                    return <span key={idx} className="inline-block border-b-2 border-slate-500 mx-1" style={{ width: `${Math.max(wordLength * 10, 40)}px` }}>&nbsp;</span>;
                                  }
                                  return <span key={idx}>{part}</span>;
                                });
                              })()}
                            </p>
                          </div>
                        </div> : question.question_type === "definition" && question.english_definition ? <div className="mt-2 sm:mt-4 space-y-2">
                          <div className="bg-muted/30 p-2 sm:p-4 rounded-lg">
                            <p className="text-xs sm:text-sm md:text-base leading-relaxed break-words">{question.english_definition}</p>
                          </div>
                        </div> : question.question_type === "synonym_antonym" ? <div className="relative mt-3 sm:mt-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-rose-50 via-rose-100/50 to-pink-50 dark:from-rose-950/30 dark:via-rose-900/20 dark:to-pink-950/30 border-2 border-rose-200/50 dark:border-rose-800/50 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 rounded-2xl"></div>
                        <p className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold text-center break-words leading-tight py-2 text-rose-800 dark:text-rose-200 lg:text-7xl">
                          {question.word.replace(/^\d+\.\s*/, '').trim()}
                        </p>
                        <p className="relative text-base sm:text-lg text-center text-rose-600/80 dark:text-rose-300/80 mt-2">
                          {question.meaning}
                        </p>
                      </div> : <div className="relative mt-3 sm:mt-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-2 border-primary/20 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 rounded-2xl"></div>
                        <p className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold text-center break-words leading-tight py-2 text-gray-800 lg:text-7xl">
                          {question.question_type === "multiple_choice" ? question.word.replace(/^\d+\.\s*/, '').trim() : question.meaning}
                        </p>
                      </div>}
                    </div>

                    {/* 체크 표시 + 관리자용 재생성 버튼 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {question.question_type !== 'spelling' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRegenerateQuestion(question.id, question.question_number, question.word, question.meaning, question.question_type)}
                          disabled={regeneratingQuestion === question.question_number}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                          title="문제 재생성"
                        >
                          <RefreshCw className={`w-4 h-4 ${regeneratingQuestion === question.question_number ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                      {hasAnswer(answers[question.question_number]) && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-6">
                  {(question.question_type === "multiple_choice" || question.question_type === "definition" || question.question_type === "example" || question.question_type === "synonym_antonym" || question.question_type === "spelling_choice") && question.choices ?
            // 객관식 - OMR 버블 스타일
            (() => {
              const isMultiSelect = isMultipleAnswerQuestion(question);
              const isSynonymAntonym = question.question_type === "synonym_antonym";
              // DB에서 이미 전처리된 선지 사용
              const expandedChoices = cleanChoices(question.choices);
              const correctCount = isMultiSelect ? getCorrectAnswersArray(question).length : 1;
              return <div className="space-y-2">
                    {isMultiSelect && <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 mb-2">
                        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium">
                          📝 이 단어는 <span className="font-bold text-blue-600">{correctCount}개</span>의 뜻이 있습니다. 모든 정답을 선택하세요.
                        </p>
                      </div>}
                    {isSynonymAntonym && <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-2 sm:p-3 mb-2">
                        <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-200 font-medium">
                          🔍 <span className="font-bold">{question.word}</span>의 동의어/반의어가 <span className="font-bold text-rose-600">아닌</span> 단어 1개를 고르세요
                        </p>
                      </div>}
                    <div className="grid grid-cols-1 gap-1 sm:gap-2 md:gap-3">
                      {expandedChoices.map((choice, index) => {
                    const currentAnswers = Array.isArray(answers[question.question_number]) ? answers[question.question_number] as string[] : answers[question.question_number] ? [answers[question.question_number] as string] : [];
                    const isSelected = currentAnswers.includes(choice);
                    return <button key={index} onClick={() => handleAnswerChange(question.question_number, choice, isMultiSelect)} className={`w-full py-1.5 px-2 sm:p-3 md:p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 sm:gap-3 md:gap-4 ${isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"}`}>
                            {/* OMR 버블 */}
                            <div className={`w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 ${isMultiSelect ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center flex-shrink-0 font-bold text-[10px] sm:text-sm transition-all ${isSelected ? "border-blue-600 bg-blue-600 text-white scale-110" : "border-slate-300"}`}>
                              {isSelected ? "✓" : index + 1}
                            </div>
                            {/* 선택지 텍스트 */}
                            <span className={`text-left flex-1 text-[11px] sm:text-sm md:text-base leading-tight break-words ${isSelected ? "font-semibold text-blue-900 dark:text-blue-100" : ""}`}>
                              {cleanChoiceForDisplay(choice)}
                            </span>
                          </button>;
                  })}
                    </div>
                  </div>;
            })() :
            // 주관식 - 답안 작성란 (spelling, example)
            <div className="space-y-2 sm:space-y-3">
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 sm:p-3">
                        <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                          💡 힌트: 첫 글자는{" "}
                          <span className="font-bold text-base sm:text-lg px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-100 dark:bg-amber-900 rounded">
                            {(() => {
                      // 숫자와 점을 제거하고 순수 영어 단어만 추출
                      const cleanWord = question.correct_answer.replace(/^\d+\.\s*/, '').trim();
                      return cleanWord[0] || '';
                    })()}
                          </span>
                        </p>
                      </div>
                      <div className="relative">
                        <Input placeholder="답안을 입력하세요" value={answers[question.question_number] || ""} onChange={e => handleAnswerChange(question.question_number, e.target.value)} className="h-11 sm:h-12 md:h-14 text-base sm:text-lg md:text-xl border-2 font-mono tracking-wider" />
                        {answers[question.question_number] && <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>}
                      </div>
                    </div>}
                </CardContent>
              </Card>)}
          </div>}

        {/* 제출 버튼 - 데스크탑만 표시 */}
        {!isMobile && <Card className="mt-3 sm:mt-6 border shadow-md sticky bottom-2 sm:bottom-4">
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="text-xs text-muted-foreground flex items-center gap-2 sm:gap-4">
                  <span className="hidden sm:inline">답안 진행률:</span>
                  <span className="font-medium">{answeredCount}/{questions.length} ({getProgress().toFixed(0)}%)</span>
                </div>
                <Button onClick={handleSubmit} disabled={submitting || !studentName.trim()} size="sm" className="px-4 sm:px-6 py-2 text-sm font-semibold whitespace-nowrap">
                  {submitting ? <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      제출 중...
                    </> : <>
                      <Send className="mr-1.5 h-4 w-4" />
                      답안 제출
                    </>}
                </Button>
              </div>
            </CardContent>
          </Card>}
      </div>
    </div>;
};
export default TakeExam;