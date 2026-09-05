import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, Sparkles, CheckCircle2, BookOpen, Pencil, MessageSquare, Languages, Users, Key, X, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import PageHeader from "@/components/PageHeader";
import createExamIcon from "@/assets/page-icons/create-exam-icon.png";
import { sanitizeChoices, splitMeanings, isValidSplitResult } from "@/utils/smart-split";

interface CardSet {
  id: string;
  title: string;
  selected_days: string[];
  word_data: any;
}

interface AccessCode {
  id: string;
  name: string;
  access_code: string;
  is_active: boolean;
}

const CreateExam = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cardSets, setCardSets] = useState<CardSet[]>([]);
  const [selectedCardSet, setSelectedCardSet] = useState<string>("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [multipleChoiceCount, setMultipleChoiceCount] = useState<string>("");
  const [multipleChoiceDifficulty, setMultipleChoiceDifficulty] = useState<'high' | 'low'>('high');
  const [spellingCount, setSpellingCount] = useState<string>("");
  const [spellingMode, setSpellingMode] = useState<'subjective' | 'objective'>('subjective');
  const [exampleCount, setExampleCount] = useState<string>("");
  const [definitionCount, setDefinitionCount] = useState<string>("");
  const [synonymAntonymCount, setSynonymAntonymCount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showRangeInput, setShowRangeInput] = useState(false);
  const [rangeInputStart, setRangeInputStart] = useState('');
  const [rangeInputEnd, setRangeInputEnd] = useState('');
  
  // Progress tracking state
  const [progressSteps, setProgressSteps] = useState<{step: string; status: 'pending' | 'loading' | 'done' | 'error'; detail?: string}[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Access code selection state
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [selectedAccessCodes, setSelectedAccessCodes] = useState<string[]>([]);
  const [showAccessCodeSelector, setShowAccessCodeSelector] = useState(false);
  
  // Word selection state
  const [manuallySelectedWords, setManuallySelectedWords] = useState<Set<string>>(new Set());
  const [showWordSelector, setShowWordSelector] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  const handleRangeSelect = () => {
    const start = parseInt(rangeInputStart);
    const end = parseInt(rangeInputEnd);
    if (!isNaN(start) && !isNaN(end) && start <= end) {
      const rangeDays = availableDays.filter(day => {
        const dayNum = parseInt(day.replace(/\D/g, '')) || 0;
        return dayNum >= start && dayNum <= end;
      });
      setSelectedDays(rangeDays);
      setShowRangeInput(false);
      setRangeInputStart('');
      setRangeInputEnd('');
    }
  };

  useEffect(() => {
    fetchCardSets();
    fetchAccessCodes();
  }, []);

  const fetchAccessCodes = async () => {
    const { data, error } = await supabase
      .from("student_access_codes")
      .select("id, name, access_code, is_active")
      .eq("is_active", true)
      .neq("name", "사용자") // 자동 생성된 코드 제외
      .order("name", { ascending: true });

    if (!error && data) {
      setAccessCodes(data);
    }
  };

  const handleAccessCodeToggle = (accessCodeId: string) => {
    setSelectedAccessCodes(prev =>
      prev.includes(accessCodeId)
        ? prev.filter(id => id !== accessCodeId)
        : [...prev, accessCodeId]
    );
  };

  const handleSelectAllAccessCodes = () => {
    if (selectedAccessCodes.length === accessCodes.length) {
      setSelectedAccessCodes([]);
    } else {
      setSelectedAccessCodes(accessCodes.map(ac => ac.id));
    }
  };

  const fetchCardSets = async () => {
    const { data, error } = await supabase
      .from("card_sets")
      .select("id, title, selected_days, word_data")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "오류",
        description: "단어장을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    setCardSets(data || []);
  };

  const handleCardSetChange = (cardSetId: string) => {
    setSelectedCardSet(cardSetId);
    const cardSet = cardSets.find((cs) => cs.id === cardSetId);
    if (cardSet) {
      // selected_days가 비어있으면 word_data에서 직접 day 추출
      let days = cardSet.selected_days || [];
      
      if (days.length === 0 && Array.isArray(cardSet.word_data)) {
        const extractedDays = new Set<string>();
        cardSet.word_data.forEach((word: any) => {
          if (word.day) {
            extractedDays.add(word.day);
          }
        });
        days = Array.from(extractedDays).sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.replace(/\D/g, '')) || 0;
          return numA - numB;
        });
      }
      
      setAvailableDays(days);
      setSelectedDays([]);
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Reset manual word selection when days or card set changes
  useEffect(() => {
    setManuallySelectedWords(new Set());
  }, [selectedDays, selectedCardSet]);

  // Get words grouped by day for the selector
  const getWordsGroupedByDay = () => {
    if (!selectedCardSet || selectedDays.length === 0) return {};
    const cardSet = cardSets.find(cs => cs.id === selectedCardSet);
    if (!cardSet) return {};
    const wordData = Array.isArray(cardSet.word_data) ? cardSet.word_data : [];
    const groups: Record<string, any[]> = {};
    wordData.filter((word: any) => selectedDays.includes(word.day)).forEach((word: any) => {
      if (!groups[word.day]) groups[word.day] = [];
      groups[word.day].push(word);
    });
    return groups;
  };

  const handleWordToggle = (wordKey: string) => {
    setManuallySelectedWords(prev => {
      const next = new Set(prev);
      if (next.has(wordKey)) {
        next.delete(wordKey);
      } else {
        if (totalQuestions > 0 && next.size >= totalQuestions) return prev;
        next.add(wordKey);
      }
      return next;
    });
  };

  const handleSelectAllDay = (dayWords: any[]) => {
    setManuallySelectedWords(prev => {
      const next = new Set(prev);
      const dayKeys = dayWords.map(w => `${w.day}::${w.word}`);
      const allSelected = dayKeys.every(k => next.has(k));
      if (allSelected) {
        dayKeys.forEach(k => next.delete(k));
      } else {
        for (const k of dayKeys) {
          if (totalQuestions > 0 && next.size >= totalQuestions) break;
          next.add(k);
        }
      }
      return next;
    });
  };

  const toggleDayCollapse = (day: string) => {
    setCollapsedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  // 품사 기호 제거 함수
  const removePOSMarkers = (text: string): string => {
    return text.replace(/\[([명동형부])\]\s*/g, '');
  };

  // 괄호가 의미의 핵심 문맥인지 판별
  const hasContextualParentheses = (text: string): boolean => {
    if (/\([^)]*등[이의을를에]\)\s*[가-힣]+/.test(text)) return true;
    if (/\([^)]*[이가]\)\s*[가-힣]+/.test(text)) return true;
    if (/^\(/.test(text.trim())) return true;
    return false;
  };

  // 괄호/대괄호 제거 함수 (의미의 일부인 괄호는 보존)
  const removeHints = (text: string): string => {
    // 의미의 일부인 괄호는 보존
    if (hasContextualParentheses(text)) {
      return text
        .replace(/\[[^\]]*\]/g, '') // 대괄호만 제거
        .replace(/\s+/g, ' ')
        .trim();
    }
    return text
      .replace(/\([^)]*\)/g, '') // 소괄호 제거
      .replace(/\[[^\]]*\]/g, '') // 대괄호 제거
      .replace(/\s+/g, ' ')
      .trim();
  };

  // 괄호 내부의 쉼표를 무시하고 분리하는 스마트 스플릿
  const smartSplitIgnoringParens = (text: string, delimiters: RegExp): string[] => {
    const results: string[] = [];
    let current = '';
    let parenDepth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '(') { parenDepth++; current += char; }
      else if (char === ')') { parenDepth = Math.max(0, parenDepth - 1); current += char; }
      else if (delimiters.test(char) && parenDepth === 0) {
        const trimmed = current.trim();
        if (trimmed.length > 0) results.push(trimmed);
        current = '';
      } else { current += char; }
    }
    const last = current.trim();
    if (last.length > 0) results.push(last);
    return results;
  };

  // 단어의 모든 뜻을 추출하는 함수 (각 의미는 개별 선지로 분리)
  // ⚠️ 특수 패턴 보존: "~을 조사하다", "영향을 미치다" 등은 분리하지 않음
  const extractAllMeanings = (meaningText: string): string[] => {
    // 괄호 안 내용은 보존하고 구분자(; , · / 번호)로만 분리
    return splitMeanings(meaningText);
  };

  // GPT를 사용하여 한국어 오답 선택지 생성
  const generateKoreanWrongChoices = async (correctWord: string, correctMeaning: string, numberOfChoices: number): Promise<string[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-korean-wrong-choices', {
        body: {
          correctWord,
          correctMeaning,
          numberOfChoices
        }
      });
      if (error) throw error;
      return data.wrongChoices || [];
    } catch (error) {
      console.error('Error generating Korean wrong choices:', error);
      return [];
    }
  };

  // AI를 사용하여 영어 오답 선지 생성
  const generateEnglishWrongChoices = async (correctWord: string, koreanMeaning: string, numberOfChoices: number = 3): Promise<string[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-english-wrong-choices', {
        body: {
          correctWord,
          koreanMeaning,
          numberOfChoices
        }
      });
      if (error) throw error;
      return data.wrongChoices || [];
    } catch (error) {
      console.error('Error generating English wrong choices:', error);
      return [];
    }
  };

  // 선지 전처리: 결정적 분리를 기준으로 하고, AI 결과는 검증 후에만 사용
  const splitChoicesWithAI = async (choices: string[]): Promise<string[]> => {
    const local = sanitizeChoices(choices.flatMap((c) => splitMeanings(c)));
    try {
      const { data, error } = await supabase.functions.invoke('split-choices', {
        body: { choices }
      });
      if (error) throw error;
      const aiResult: string[] = data?.splitChoices || [];
      // AI가 괄호를 깨뜨리거나 조각을 만들면 결정적 분리 결과 사용
      if (!isValidSplitResult(choices, aiResult)) return local;
      // AI 결과도 한 번 더 결정적 분리로 정리
      const merged = sanitizeChoices(aiResult.flatMap((c) => splitMeanings(c)));
      return merged.length > 0 ? merged : local;
    } catch (error) {
      console.error('Error splitting choices with AI:', error);
      return local;
    }
  };

  // 폴백 선지 분리 로직
  const fallbackSplitChoices = (choices: string[]): string[] => {
    const result: string[] = [];
    for (const choice of choices) {
      let cleaned = choice
        .replace(/^\d+\.\s*/, '');
      // 괄호 선택적 제거
      if (!hasContextualParentheses(cleaned)) {
        cleaned = cleaned.replace(/\([^)]*\)/g, '');
      }
      cleaned = cleaned.replace(/\[[^\]]*\]/g, '').trim();
      const parts = smartSplitIgnoringParens(cleaned, /[,;·\/]/).filter(s => s);
      result.push(...parts);
    }
    return [...new Set(result)];
  };

  // 진행 상태 업데이트 헬퍼
  const updateProgress = (stepIndex: number, status: 'pending' | 'loading' | 'done' | 'error', detail?: string) => {
    setProgressSteps(prev => prev.map((step, i) => 
      i === stepIndex ? { ...step, status, detail: detail || step.detail } : step
    ));
    if (status === 'loading') setCurrentStep(stepIndex);
  };

  const handleCreateExam = async () => {
    const multipleChoice = parseInt(multipleChoiceCount) || 0;
    const spelling = parseInt(spellingCount) || 0;
    const example = parseInt(exampleCount) || 0;
    const definition = parseInt(definitionCount) || 0;
    const synonymAntonym = parseInt(synonymAntonymCount) || 0;
    const totalQuestionsCount = multipleChoice + spelling + example + definition + synonymAntonym;
    
    if (!selectedCardSet || selectedDays.length === 0 || !examTitle || totalQuestionsCount < 1) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 올바르게 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 진행 단계 초기화
    const steps = [
      { step: '단어 준비', status: 'pending' as const, detail: '단어장 데이터 로드 중...' },
      { step: '객관식 문제 생성', status: 'pending' as const, detail: `${multipleChoice}개 문제` },
      { step: '철자쓰기 문제 생성', status: 'pending' as const, detail: `${spelling}개 문제` },
      { step: '예문완성 문제 생성', status: 'pending' as const, detail: `${example}개 문제` },
      { step: '영영풀이 문제 생성', status: 'pending' as const, detail: `${definition}개 문제` },
      { step: '동/반의어 문제 생성', status: 'pending' as const, detail: `${synonymAntonym}개 문제` },
      { step: '선지 전처리 (AI)', status: 'pending' as const, detail: '선지 분리 및 정제' },
      { step: '시험 저장', status: 'pending' as const, detail: '데이터베이스 저장' },
    ];
    setProgressSteps(steps);
    setLoading(true);

    try {
      // Step 0: 단어 준비
      updateProgress(0, 'loading');
      const cardSet = cardSets.find((cs) => cs.id === selectedCardSet);
      if (!cardSet) throw new Error("단어장을 찾을 수 없습니다.");

      const wordData = Array.isArray(cardSet.word_data) ? cardSet.word_data : [];
      const wordsInSelectedDays = wordData.filter((word: any) =>
        selectedDays.includes(word.day)
      );

      if (wordsInSelectedDays.length < totalQuestionsCount) {
        toast({
          title: "단어 부족",
          description: `선택한 Day에 ${totalQuestionsCount}개의 문제를 만들 수 없습니다. (사용 가능한 단어: ${wordsInSelectedDays.length}개)`,
          variant: "destructive",
        });
        setLoading(false);
        setProgressSteps([]);
        return;
      }
      // 수동 선택된 단어가 있으면 사용, 없으면 라운드 로빈 랜덤 추출
      let shuffledWords: any[];
      
      if (manuallySelectedWords.size > 0) {
        // 수동 선택된 단어 사용
        shuffledWords = wordsInSelectedDays.filter((word: any) => 
          manuallySelectedWords.has(`${word.day}::${word.word}`)
        );
        // 최종 셔플 (문제 순서 랜덤화)
        for (let i = shuffledWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
        }
        updateProgress(0, 'done', `수동 선택 ${shuffledWords.length}개 단어 사용`);
      } else {
        // 각 Day에서 균등하게 단어를 추출한 뒤 셔플
        const dayGroups: Record<string, any[]> = {};
        wordsInSelectedDays.forEach((word: any) => {
          if (!dayGroups[word.day]) dayGroups[word.day] = [];
          dayGroups[word.day].push(word);
        });

        // 각 Day 그룹 내부를 랜덤 셔플
        Object.values(dayGroups).forEach(group => {
          for (let i = group.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [group[i], group[j]] = [group[j], group[i]];
          }
        });

        // 라운드 로빈 방식으로 각 Day에서 균등 추출
        const dayKeys = Object.keys(dayGroups);
        shuffledWords = [];
        const dayIndices: Record<string, number> = {};
        dayKeys.forEach(k => { dayIndices[k] = 0; });

        while (shuffledWords.length < totalQuestionsCount) {
          let added = false;
          for (const key of dayKeys) {
            if (shuffledWords.length >= totalQuestionsCount) break;
            if (dayIndices[key] < dayGroups[key].length) {
              shuffledWords.push(dayGroups[key][dayIndices[key]]);
              dayIndices[key]++;
              added = true;
            }
          }
          if (!added) break; // 모든 Day 소진
        }

        // 최종 셔플 (문제 순서 랜덤화)
        for (let i = shuffledWords.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
        }
        updateProgress(0, 'done', `${selectedDays.length}개 Day에서 균등 추출 완료 (${shuffledWords.length}개)`);
      }

      // 번호 접두사 제거 (예: "10. benefit" → "benefit")
      shuffledWords.forEach(w => { w.word = w.word.replace(/^\d+\.\s*/, '').trim(); });

      // Step 1: 객관식 문제 생성 준비
      updateProgress(1, 'loading');
      
      // 예문완성과 영영풀이 문제 생성
      // CSV 데이터에 예문/영영풀이가 있으면 우선 사용, 없으면 AI 생성
      let exampleQuestions: any[] = [];
      let definitionQuestions: any[] = [];

      // Step 3: 예문완성 문제 생성
      if (example > 0) {
        updateProgress(3, 'loading', `0/${example}개 처리 중...`);
        const exampleWords = shuffledWords.slice(multipleChoice + spelling, multipleChoice + spelling + example);
        
        // CSV에서 예문이 있는 단어와 없는 단어 분리
        const wordsWithExample = exampleWords.filter((w: any) => w.example && w.example.trim());
        const wordsWithoutExample = exampleWords.filter((w: any) => !w.example || !w.example.trim());
        
        // CSV 예문이 있는 단어들은 직접 사용
        for (let i = 0; i < wordsWithExample.length; i++) {
          const word = wordsWithExample[i];
          updateProgress(3, 'loading', `${i + 1}/${example}개 처리 중... (CSV)`);
          
          // 예문에서 단어를 ______ 로 대체
          let exampleSentence = word.example;
          const wordRegex = new RegExp(`\\b${word.word}\\b`, 'gi');
          exampleSentence = exampleSentence.replace(wordRegex, '______');
          
          exampleQuestions.push({
            word: word.word,
            meaning: word.meaning,
            generatedContent: exampleSentence
          });
        }
        
        // CSV 예문이 없는 단어들만 AI로 생성
        if (wordsWithoutExample.length > 0) {
          updateProgress(3, 'loading', `${wordsWithExample.length}/${example}개 완료, AI 생성 중...`);
          const { data: exampleData, error: exampleError } = await supabase.functions.invoke('generate-exam-questions', {
            body: { words: wordsWithoutExample, questionType: 'example' }
          });
          
          if (exampleError) throw exampleError;
          exampleQuestions = [...exampleQuestions, ...exampleData.results];
        }
        updateProgress(3, 'done', `${exampleQuestions.length}개 완료 ✓`);
      } else {
        updateProgress(3, 'done', '건너뜀');
      }

      // Step 4: 영영풀이 문제 생성
      if (definition > 0) {
        updateProgress(4, 'loading', `0/${definition}개 처리 중...`);
        const definitionWords = shuffledWords.slice(multipleChoice + spelling + example, multipleChoice + spelling + example + definition);
        
        // CSV에서 영영풀이가 있는 단어와 없는 단어 분리
        const wordsWithDefinition = definitionWords.filter((w: any) => w.englishDefinition && w.englishDefinition.trim());
        const wordsWithoutDefinition = definitionWords.filter((w: any) => !w.englishDefinition || !w.englishDefinition.trim());
        
        // CSV 영영풀이가 있는 단어들은 직접 사용
        for (let i = 0; i < wordsWithDefinition.length; i++) {
          const word = wordsWithDefinition[i];
          updateProgress(4, 'loading', `${i + 1}/${definition}개 처리 중... (CSV)`);
          
          definitionQuestions.push({
            word: word.word,
            meaning: word.meaning,
            generatedContent: word.englishDefinition
          });
        }
        
        // CSV 영영풀이가 없는 단어들만 AI로 생성
        if (wordsWithoutDefinition.length > 0) {
          updateProgress(4, 'loading', `${wordsWithDefinition.length}/${definition}개 완료, AI 생성 중...`);
          const { data: definitionData, error: definitionError } = await supabase.functions.invoke('generate-exam-questions', {
            body: { words: wordsWithoutDefinition, questionType: 'definition' }
          });
          
          if (definitionError) throw definitionError;
          definitionQuestions = [...definitionQuestions, ...definitionData.results];
        }
        updateProgress(4, 'done', `${definitionQuestions.length}개 완료 ✓`);
      } else {
        updateProgress(4, 'done', '건너뜀');
      }
      updateProgress(7, 'loading');
      const { data: exam, error: examError } = await supabase
        .from("exams")
        .insert({
          title: examTitle,
          card_set_id: selectedCardSet,
          selected_days: selectedDays,
          total_questions: totalQuestionsCount,
          multiple_choice_count: multipleChoice,
          spelling_count: spelling,
          example_count: example,
          definition_count: definition,
          synonym_antonym_count: synonymAntonym,
        })
        .select()
        .single();

      if (examError) throw examError;


      // 문제 생성
      const questions: any[] = [];
      let questionNumber = 1;

      // 객관식 문제 생성 (뜻 맞추기 방식 - 모든 정답 선택)
      // 난이도에 따라 선지 개수와 정답 개수 조절
      const isLowDifficulty = multipleChoiceDifficulty === 'low';
      const maxCorrectAnswers = isLowDifficulty ? 2 : 4;
      const totalChoices = isLowDifficulty ? 5 : 8;
      
      if (multipleChoice > 0) {
        for (let i = 0; i < multipleChoice; i++) {
          // 실시간 진행률 업데이트
          updateProgress(1, 'loading', `${i + 1}/${multipleChoice}개 처리 중...`);
          
          const word = shuffledWords[i];
          
          // 뜻 맞추기 퀴즈와 동일한 방식: AI로 선지 분리
          let correctAnswers: string[] = [];
          try {
            // AI 기반 선지 분리 (뜻 맞추기와 동일)
            const basicMeanings = extractAllMeanings(word.meaning);
            const aiSplitMeanings = await splitChoicesWithAI(basicMeanings);
            correctAnswers = sanitizeChoices(
              aiSplitMeanings.map(m => removeHints(removePOSMarkers(m)).trim())
            );
          } catch (error) {
            console.error('AI split failed, using fallback:', error);
            correctAnswers = sanitizeChoices(extractAllMeanings(word.meaning));
          }
          
          // 난이도에 따라 정답 개수 제한
          if (correctAnswers.length > maxCorrectAnswers) {
            // 랜덤 셔플 후 제한
            correctAnswers = correctAnswers.sort(() => Math.random() - 0.5).slice(0, maxCorrectAnswers);
          }
          
          const wrongChoicesNeeded = totalChoices - correctAnswers.length;
          
          // GPT로 한국어 오답 선택지 생성 (뜻 맞추기와 동일한 함수 사용)
          let wrongChoices: string[] = [];
          try {
            wrongChoices = await generateKoreanWrongChoices(word.word, correctAnswers[0], wrongChoicesNeeded);
            // 정답과 중복되지 않도록 필터링
            wrongChoices = wrongChoices.filter(choice => 
              !correctAnswers.some(correct => 
                choice.includes(correct) || correct.includes(choice) || choice === correct
              )
            );
          } catch (error) {
            console.error('Error generating wrong choices:', error);
          }
          
          // 오답이 부족한 경우 다른 단어의 뜻에서 보충
          if (wrongChoices.length < wrongChoicesNeeded) {
            const otherMeanings = wordsInSelectedDays
              .filter((w: any) => w.word !== word.word)
              .map((w: any) => extractAllMeanings(w.meaning))
              .flat()
              .filter(m => !correctAnswers.some(correct => m.includes(correct) || correct.includes(m)))
              .sort(() => Math.random() - 0.5);
            
            const additionalNeeded = wrongChoicesNeeded - wrongChoices.length;
            wrongChoices = [...wrongChoices, ...otherMeanings.slice(0, additionalNeeded)];
          }
          
          // 선택지를 랜덤하게 섞기
          const allChoices = sanitizeChoices([...correctAnswers, ...wrongChoices.slice(0, wrongChoicesNeeded)])
            .sort(() => Math.random() - 0.5);

          questions.push({
            exam_id: exam.id,
            question_number: questionNumber++,
            question_type: "multiple_choice",
            word: word.word,
            meaning: word.meaning,
            choices: allChoices,
            // 정답을 JSON 배열 문자열로 저장 (AI로 분리된 정답)
            correct_answer: JSON.stringify(correctAnswers),
          });
        }
        updateProgress(1, 'done', `${multipleChoice}개 완료 ✓`);
      } else {
        updateProgress(1, 'done', '건너뜀');
      }

      // Step 2: 철자쓰기 문제 생성 (주관식 or 객관식)
      if (spelling > 0) {
        updateProgress(2, 'loading', `0/${spelling}개 처리 중...`);
        for (let i = multipleChoice; i < multipleChoice + spelling; i++) {
          const currentSpellingIndex = i - multipleChoice + 1;
          updateProgress(2, 'loading', `${currentSpellingIndex}/${spelling}개 처리 중...`);

          const word = shuffledWords[i];
          const cleanWord = String(word.word).replace(/^\d+\.\s*/, '').trim();

          if (spellingMode === 'objective') {
            // 영어 오답 4개 생성 (같은 품사, 비슷한 수준)
            let wrongChoices: string[] = [];
            try {
              const { data: wcData, error: wcError } = await supabase.functions.invoke('generate-english-wrong-choices', {
                body: { correctWord: cleanWord, koreanMeaning: word.meaning, numberOfChoices: 4 },
              });
              if (wcError) throw wcError;
              wrongChoices = Array.isArray(wcData?.wrongChoices) ? wcData.wrongChoices.slice(0, 4) : [];
            } catch (e) {
              console.error('철자쓰기 객관식 오답 생성 실패', e);
            }
            // 부족하면 fallback으로 다른 단어들에서 채움
            if (wrongChoices.length < 4) {
              const pool = shuffledWords
                .map(w => String(w.word).replace(/^\d+\.\s*/, '').trim())
                .filter(w => w.toLowerCase() !== cleanWord.toLowerCase() && !wrongChoices.includes(w));
              while (wrongChoices.length < 4 && pool.length > 0) {
                const idx = Math.floor(Math.random() * pool.length);
                wrongChoices.push(pool.splice(idx, 1)[0]);
              }
            }
            const allChoices = [cleanWord, ...wrongChoices.slice(0, 4)]
              .sort(() => Math.random() - 0.5);

            questions.push({
              exam_id: exam.id,
              question_number: questionNumber++,
              question_type: "spelling_choice",
              word: cleanWord,
              meaning: word.meaning,
              choices: allChoices,
              correct_answer: cleanWord,
            });
          } else {
            questions.push({
              exam_id: exam.id,
              question_number: questionNumber++,
              question_type: "spelling",
              word: word.word,
              meaning: word.meaning,
              choices: null,
              correct_answer: word.word,
            });
          }
        }
        updateProgress(2, 'done', `${spelling}개 완료 ✓`);
      } else {
        updateProgress(2, 'done', '건너뜀');
      }

      // 예문 완성 문제 생성 (GPT로 생성된 예문 사용 - 객관식으로)
      // AI를 사용하여 같은 품사, 비슷한 수준의 오답 선지 생성
      if (exampleQuestions.length > 0) {
        updateProgress(3, 'loading', `0/${exampleQuestions.length}개 오답 선지 생성 중...`);
      }
      
      for (let i = 0; i < exampleQuestions.length; i++) {
        const exampleQ = exampleQuestions[i];
        updateProgress(3, 'loading', `${i + 1}/${exampleQuestions.length}개 오답 선지 생성 중...`);
        
        // AI로 같은 품사, 비슷한 수준의 오답 선지 생성
        let wrongWords: string[] = [];
        try {
          wrongWords = await generateEnglishWrongChoices(exampleQ.word, exampleQ.meaning, 3);
        } catch (error) {
          console.error('Error generating wrong choices for example:', error);
        }
        
        // AI 생성 실패 시 폴백: 다른 단어들에서 랜덤 선택
        if (wrongWords.length < 3) {
          const fallbackWords = shuffledWords
            .filter(w => w.word !== exampleQ.word && !wrongWords.includes(w.word))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - wrongWords.length)
            .map(w => w.word);
          wrongWords = [...wrongWords, ...fallbackWords];
        }
        
        const allChoices = [exampleQ.word, ...wrongWords].sort(() => Math.random() - 0.5);
        
        questions.push({
          exam_id: exam.id,
          question_number: questionNumber++,
          question_type: "example",
          word: exampleQ.word,
          meaning: exampleQ.meaning,
          choices: allChoices,
          correct_answer: exampleQ.word,
          example_sentence: exampleQ.generatedContent,
        });
      }
      
      if (exampleQuestions.length > 0) {
        updateProgress(3, 'done', `${exampleQuestions.length}개 완료 ✓`);
      }

      // 영영 풀이 문제 생성 (GPT로 생성된 정의 사용)
      // AI를 사용하여 같은 품사, 비슷한 수준의 오답 선지 생성
      if (definitionQuestions.length > 0) {
        updateProgress(4, 'loading', `0/${definitionQuestions.length}개 오답 선지 생성 중...`);
      }
      
      for (let i = 0; i < definitionQuestions.length; i++) {
        const defQ = definitionQuestions[i];
        updateProgress(4, 'loading', `${i + 1}/${definitionQuestions.length}개 오답 선지 생성 중...`);
        
        // AI로 같은 품사, 비슷한 수준의 오답 선지 생성
        let wrongWords: string[] = [];
        try {
          wrongWords = await generateEnglishWrongChoices(defQ.word, defQ.meaning, 3);
        } catch (error) {
          console.error('Error generating wrong choices for definition:', error);
        }
        
        // AI 생성 실패 시 폴백: 다른 단어들에서 랜덤 선택
        if (wrongWords.length < 3) {
          const fallbackWords = shuffledWords
            .filter(w => w.word !== defQ.word && !wrongWords.includes(w.word))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - wrongWords.length)
            .map(w => w.word);
          wrongWords = [...wrongWords, ...fallbackWords];
        }
        
        const allChoices = [defQ.word, ...wrongWords].sort(() => Math.random() - 0.5);
        
        questions.push({
          exam_id: exam.id,
          question_number: questionNumber++,
          question_type: "definition",
          word: defQ.word,
          meaning: defQ.meaning,
          choices: allChoices,
          correct_answer: defQ.word,
          english_definition: defQ.generatedContent,
        });
      }
      
      if (definitionQuestions.length > 0) {
        updateProgress(4, 'done', `${definitionQuestions.length}개 완료 ✓`);
      }

      // Step 5: 동/반의어 찾기 문제 생성
      // CSV 데이터에서 동의어/반의어가 있는 단어들 필터링
      const wordsWithSynonymsAntonyms = shuffledWords.filter((word: any) => {
        const hasSynonyms = (word.synonym1 && word.synonym1.trim()) || 
                            (word.synonym2 && word.synonym2.trim()) || 
                            (word.synonym3 && word.synonym3.trim());
        const hasAntonyms = (word.antonym1 && word.antonym1.trim()) || 
                            (word.antonym2 && word.antonym2.trim()) || 
                            (word.antonym3 && word.antonym3.trim());
        return hasSynonyms || hasAntonyms;
      });

      const synonymAntonymQuestionsToCreate = Math.min(synonymAntonym, wordsWithSynonymsAntonyms.length);
      
      if (synonymAntonym > 0 && synonymAntonymQuestionsToCreate > 0) {
        updateProgress(5, 'loading', `0/${synonymAntonymQuestionsToCreate}개 처리 중...`);
        // GPT를 사용하여 무관한 단어 생성 (배치 처리)
        const synonymAntonymQuestions: any[] = [];
        const batchSize = 5;
        
        for (let i = 0; i < synonymAntonymQuestionsToCreate; i += batchSize) {
          const batch = wordsWithSynonymsAntonyms.slice(i, Math.min(i + batchSize, synonymAntonymQuestionsToCreate));
          
          // 실시간 진행률 업데이트
          updateProgress(5, 'loading', `${Math.min(i + batchSize, synonymAntonymQuestionsToCreate)}/${synonymAntonymQuestionsToCreate}개 처리 중...`);
          
          const batchPromises = batch.map(async (word: any) => {
            // 동의어와 반의어 수집
            const synonyms: { word: string; meaning: string }[] = [];
            const antonyms: { word: string; meaning: string }[] = [];
            
            if (word.synonym1 && word.synonym1.trim()) {
              synonyms.push({ word: word.synonym1.trim(), meaning: word.synonym1Meaning || '' });
            }
            if (word.synonym2 && word.synonym2.trim()) {
              synonyms.push({ word: word.synonym2.trim(), meaning: word.synonym2Meaning || '' });
            }
            if (word.synonym3 && word.synonym3.trim()) {
              synonyms.push({ word: word.synonym3.trim(), meaning: word.synonym3Meaning || '' });
            }
            if (word.antonym1 && word.antonym1.trim()) {
              antonyms.push({ word: word.antonym1.trim(), meaning: word.antonym1Meaning || '' });
            }
            if (word.antonym2 && word.antonym2.trim()) {
              antonyms.push({ word: word.antonym2.trim(), meaning: word.antonym2Meaning || '' });
            }
            if (word.antonym3 && word.antonym3.trim()) {
              antonyms.push({ word: word.antonym3.trim(), meaning: word.antonym3Meaning || '' });
            }
            
            const relatedWords = [...synonyms.map(s => s.word), ...antonyms.map(a => a.word)];
            
            if (relatedWords.length === 0) return null;
            
            // GPT를 사용하여 무관한 단어 생성
            try {
              const response = await supabase.functions.invoke('generate-unrelated-word', {
                body: {
                  word: word.word,
                  meaning: word.meaning,
                  synonyms: synonyms,
                  antonyms: antonyms
                }
              });
              
              if (response.error) {
                console.error('Error generating unrelated word:', response.error);
                return null;
              }
              
              const unrelatedWord = response.data;
              if (!unrelatedWord || !unrelatedWord.word) return null;
              
              // 7개 선지: 동의어(최대3) + 반의어(최대3) + 무관어1
              const allChoices = [
                ...synonyms.slice(0, 3).map(s => s.word),
                ...antonyms.slice(0, 3).map(a => a.word),
                unrelatedWord.word
              ].sort(() => Math.random() - 0.5);
              
              return {
                exam_id: exam.id,
                question_number: 0, // 나중에 설정
                question_type: "synonym_antonym",
                word: word.word,
                meaning: word.meaning,
                choices: allChoices,
                correct_answer: unrelatedWord.word, // 정답은 동/반의어가 아닌 단어
              };
            } catch (error) {
              console.error('Error in generate-unrelated-word:', error);
              return null;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          synonymAntonymQuestions.push(...batchResults.filter(q => q !== null));
        }
        
        // 문제 번호 설정 및 questions 배열에 추가
        for (const saQuestion of synonymAntonymQuestions) {
          saQuestion.question_number = questionNumber++;
          questions.push(saQuestion);
        }
        updateProgress(5, 'done', `${synonymAntonymQuestions.length}개 완료 ✓`);
      } else {
        updateProgress(5, 'done', '건너뜀');
      }

      // Step 6: 선지 전처리 (AI) - 객관식 문제의 선지와 정답 동시 처리
      const multipleChoiceQuestions = questions.filter(q => q.question_type === 'multiple_choice' && q.choices);
      if (multipleChoiceQuestions.length > 0) {
        updateProgress(6, 'loading', `${multipleChoiceQuestions.length}개 문제 선지 분리 중...`);
        
        const preprocessBatchSize = 5;
        for (let i = 0; i < multipleChoiceQuestions.length; i += preprocessBatchSize) {
          const batch = multipleChoiceQuestions.slice(i, i + preprocessBatchSize);
          
          await Promise.all(batch.map(async (question) => {
            if (question.choices && question.choices.length > 0) {
              try {
                // 선지 분리
                const processedChoices = await splitChoicesWithAI(question.choices);
                // 중복 제거 및 빈 문자열 제거
                const uniqueChoices = sanitizeChoices(processedChoices);
                question.choices = uniqueChoices;
                
                // ⚠️ 중요: 정답도 동일하게 분리하여 개수 일치시키기
                // 정답 배열을 파싱하여 분리된 선지와 매칭
                let correctAnswers: string[] = [];
                try {
                  correctAnswers = JSON.parse(question.correct_answer);
                } catch {
                  correctAnswers = [question.correct_answer];
                }
                
                // 정답도 AI로 분리 (선지와 동일한 방식)
                const processedCorrectAnswers = await splitChoicesWithAI(correctAnswers);
                const uniqueCorrectAnswers = sanitizeChoices(processedCorrectAnswers);
                
                // 분리된 정답 중 실제 선지에 존재하는 것만 필터링
                // (정규화하여 비교)
                const normalizeForComparison = (text: string): string => {
                  return text
                    .replace(/\s+/g, ' ')
                    .replace(/^\d+\.\s*/, '')
                    .replace(/\[([명동형부])\]\s*/g, '')
                    .replace(/\([^)]*\)/g, '')
                    .replace(/\[[^\]]*\]/g, '')
                    .trim()
                    .toLowerCase();
                };
                
                const normalizedChoices = uniqueChoices.map(normalizeForComparison);
                const matchedCorrectAnswers = uniqueCorrectAnswers.filter(ans => {
                  const normalizedAns = normalizeForComparison(ans);
                  return normalizedChoices.some(choice => 
                    choice === normalizedAns || 
                    choice.includes(normalizedAns) || 
                    normalizedAns.includes(choice)
                  );
                });
                
                // 매칭된 정답이 있으면 업데이트, 없으면 원본 유지
                if (matchedCorrectAnswers.length > 0) {
                  question.correct_answer = JSON.stringify(matchedCorrectAnswers);
                  console.log(`Updated correct answers for question: ${matchedCorrectAnswers.length}개`);
                } else {
                  // 매칭 실패 시, 분리된 정답 그대로 사용
                  question.correct_answer = JSON.stringify(uniqueCorrectAnswers);
                  console.log(`No match found, using processed: ${uniqueCorrectAnswers.length}개`);
                }
              } catch (error) {
                console.error('Error preprocessing choices:', error);
              }
            }
          }));
          
          updateProgress(6, 'loading', `${Math.min(i + preprocessBatchSize, multipleChoiceQuestions.length)}/${multipleChoiceQuestions.length} 처리 완료`);
        }
        updateProgress(6, 'done', `${multipleChoiceQuestions.length}개 완료 ✓`);
      } else {
        updateProgress(6, 'done', '건너뜀');
      }

      updateProgress(7, 'loading', '데이터베이스 저장 중...');

      // 문제 저장
      const { error: questionsError } = await supabase
        .from("exam_questions")
        .insert(questions);

      if (questionsError) throw questionsError;

      // Assign exam to selected access codes
      if (selectedAccessCodes.length > 0) {
        const accessCodeExamInserts = selectedAccessCodes.map(accessCodeId => ({
          access_code_id: accessCodeId,
          exam_id: exam.id,
        }));

        const { error: accessCodeError } = await supabase
          .from("access_code_exams")
          .insert(accessCodeExamInserts);

        if (accessCodeError) {
          console.error("Error assigning exam to access codes:", accessCodeError);
        }
      }
      
      updateProgress(7, 'done', '저장 완료 ✓');

      toast({
        title: "시험 생성 완료",
        description: selectedAccessCodes.length > 0 
          ? `${examTitle} 시험이 생성되고 ${selectedAccessCodes.length}개의 액세스 코드에 할당되었습니다.`
          : `${examTitle} 시험이 생성되었습니다.`,
      });

      navigate("/exam-list");
    } catch (error: any) {
      console.error("Error creating exam:", error);
      // 현재 진행 중인 단계를 에러 상태로 변경
      setProgressSteps(prev => prev.map((step, i) => 
        step.status === 'loading' ? { ...step, status: 'error' as const, detail: '오류 발생' } : step
      ));
      toast({
        title: "시험 생성 실패",
        description: error.message || "시험 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = (parseInt(multipleChoiceCount) || 0) + (parseInt(spellingCount) || 0) + (parseInt(exampleCount) || 0) + (parseInt(definitionCount) || 0) + (parseInt(synonymAntonymCount) || 0);

  const questionTypes = [
    { id: 'multiple', label: '객관식(의미)', icon: CheckCircle2, value: multipleChoiceCount, setValue: setMultipleChoiceCount, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-500' },
    { id: 'spelling', label: '철자쓰기', icon: Pencil, value: spellingCount, setValue: setSpellingCount, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-500' },
    { id: 'example', label: '예문완성', icon: MessageSquare, value: exampleCount, setValue: setExampleCount, color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-500' },
    { id: 'definition', label: '영영풀이', icon: Languages, value: definitionCount, setValue: setDefinitionCount, color: 'from-violet-500/20 to-violet-600/10', iconColor: 'text-violet-500' },
    { id: 'synonym_antonym', label: '동/반의어 찾기', icon: Users, value: synonymAntonymCount, setValue: setSynonymAntonymCount, color: 'from-rose-500/20 to-rose-600/10', iconColor: 'text-rose-500' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        <PageHeader
          icon={createExamIcon}
          iconAlt="시험 생성"
          title="정기고사 생성"
          subtitle="​"
        >
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded border border-slate-200">
            <span className="text-xs text-slate-500">총 문제</span>
            <span className="text-sm font-bold text-slate-800">{totalQuestions}</span>
          </div>
        </PageHeader>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* 기본 정보 */}
            <div className="editorial-card">
              <div className="px-5 py-3.5 border-b border-neutral-200/70 bg-neutral-50/40 flex items-center gap-3">
                <span className="editorial-eyebrow">01</span>
                <h2 className="text-[13px] font-semibold text-neutral-900 tracking-tight">기본 정보</h2>
              </div>
              <div className="p-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="exam-title" className="text-[10px] font-medium text-slate-500">시험 제목</Label>
                  <Input id="exam-title" placeholder="예: 1차 정기고사" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className="h-8 text-xs bg-white border-slate-200" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="card-set" className="text-[10px] font-medium text-slate-500">단어장 선택</Label>
                  <Select value={selectedCardSet} onValueChange={handleCardSetChange}>
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="단어장을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[420px]">
                      {(() => {
                        const isOrun = (t: string) => (t.includes('ORUN') || t.includes('Ultimate')) && t.includes('VOCA');
                        const isNeungyul = (t: string) => t.includes('능률');
                        const orunSets = cardSets.filter(cs => isOrun(cs.title));
                        const neungyulSets = cardSets.filter(cs => !isOrun(cs.title) && isNeungyul(cs.title));
                        const otherSets = cardSets.filter(cs => !isOrun(cs.title) && !isNeungyul(cs.title));
                        const groups: { label: string; items: typeof cardSets }[] = [
                          { label: 'ORUN / Ultimate VOCA', items: orunSets },
                          { label: '능률보카 시리즈', items: neungyulSets },
                          { label: '기타 단어장', items: otherSets },
                        ];
                        return groups.filter(g => g.items.length > 0).map(g => (
                          <SelectGroup key={g.label}>
                            <SelectLabel className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500 px-3 pt-2 pb-1">{g.label}</SelectLabel>
                            {g.items.map((cardSet) => (
                              <SelectItem key={cardSet.id} value={cardSet.id}>{cardSet.title}</SelectItem>
                            ))}
                          </SelectGroup>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Day 선택 */}
            {availableDays.length > 0 && (
              <div className="editorial-card">
                <div className="px-5 py-3.5 border-b border-neutral-200/70 bg-neutral-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="editorial-eyebrow">02</span>
                    <h2 className="text-[13px] font-semibold text-neutral-900 tracking-tight">Day 선택</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowRangeInput(!showRangeInput)} className="h-6 px-2 text-[10px] font-medium text-slate-500 hover:text-slate-700">범위설정</Button>
                    {selectedDays.length > 0 && (
                      <>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedDays([])} className="h-6 px-2 text-[10px] text-slate-400 hover:text-slate-600">해제</Button>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-white text-[10px] font-bold">{selectedDays.length}개</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  {showRangeInput && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                      <input type="number" placeholder="시작" value={rangeInputStart} onChange={(e) => setRangeInputStart(e.target.value)} className="w-16 h-7 px-2 text-xs text-center border border-slate-200 rounded bg-white" min="1" />
                      <span className="text-[10px] text-slate-400">~</span>
                      <input type="number" placeholder="끝" value={rangeInputEnd} onChange={(e) => setRangeInputEnd(e.target.value)} className="w-16 h-7 px-2 text-xs text-center border border-slate-200 rounded bg-white" min="1" />
                      <Button type="button" size="sm" onClick={handleRangeSelect} className="h-7 px-3 text-[10px] font-medium rounded">선택</Button>
                    </div>
                  )}
                  {(() => {
                    const sortedDays = [...availableDays].sort((a, b) => {
                      const numA = parseInt(a.replace(/\D/g, '')) || 0;
                      const numB = parseInt(b.replace(/\D/g, '')) || 0;
                      return numA - numB;
                    });
                    // [Part X] DAY XX 형식 그룹화
                    const partGroups: Record<string, string[]> = {};
                    const ungroupedDays: string[] = [];
                    sortedDays.forEach(day => {
                      const partMatch = day.match(/^\[([^\]]+)\]\s+/);
                      if (partMatch) {
                        const partName = partMatch[1];
                        if (!partGroups[partName]) partGroups[partName] = [];
                        partGroups[partName].push(day);
                      } else {
                        ungroupedDays.push(day);
                      }
                    });
                    const partKeys = Object.keys(partGroups);
                    if (partKeys.length > 1) {
                      return (
                        <div className="space-y-2">
                          {partKeys.map((partName, idx) => {
                            const partDays = partGroups[partName];
                            const colors = ['bg-blue-50 border-blue-200', 'bg-emerald-50 border-emerald-200', 'bg-amber-50 border-amber-200', 'bg-purple-50 border-purple-200', 'bg-rose-50 border-rose-200', 'bg-cyan-50 border-cyan-200', 'bg-orange-50 border-orange-200'];
                            const accents = ['text-blue-600', 'text-emerald-600', 'text-amber-600', 'text-purple-600', 'text-rose-600', 'text-cyan-600', 'text-orange-600'];
                            return (
                              <div key={partName} className={`p-2 rounded-lg border ${colors[idx % colors.length]}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`font-bold text-xs ${accents[idx % accents.length]}`}>{partName}</span>
                                  <button type="button" onClick={() => {
                                    const allSelected = partDays.every(d => selectedDays.includes(d));
                                    if (allSelected) {
                                      setSelectedDays(prev => prev.filter(d => !partDays.includes(d)));
                                    } else {
                                      setSelectedDays(prev => [...new Set([...prev, ...partDays])]);
                                    }
                                  }} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${accents[idx % accents.length]}`}>
                                    {partDays.every(d => selectedDays.includes(d)) ? '해제' : '전체'}
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {partDays.map(day => {
                                    const dayLabel = day.replace(/^\[[^\]]+\]\s+/, '').replace('DAY ', '').replace('Day ', '');
                                    return (
                                      <button key={day} type="button" onClick={() => handleDayToggle(day)} className={`w-7 h-7 rounded-md text-[10px] font-semibold transition-all ${selectedDays.includes(day) ? 'bg-neutral-950 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'}`}>
                                        {dayLabel}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    // 기본 단일 그리드
                    return (
                      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1">
                        {sortedDays.map((day) => (
                          <button key={day} type="button" onClick={() => handleDayToggle(day)} className={`px-1 py-1.5 rounded text-[10px] font-medium transition-colors ${selectedDays.includes(day) ? 'bg-neutral-950 text-white' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
                            {day}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* 문제 유형별 개수 */}
            <div className="editorial-card">
              <div className="px-5 py-3.5 border-b border-neutral-200/70 bg-neutral-50/40 flex items-center gap-3">
                <span className="editorial-eyebrow">03</span>
                <h2 className="text-[13px] font-semibold text-neutral-900 tracking-tight">문제 유형별 개수</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5 bg-white">
                {questionTypes.map((type) => (
                  <div key={type.id} className="p-3 rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] hover:bg-white/90 hover:border-slate-300/70 hover:shadow-[0_12px_34px_-12px_rgba(15,23,42,0.16)] transition-all">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-slate-100/80 border border-slate-200/70 text-amber-600 backdrop-blur-md">
                        <type.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 tracking-wide">{type.label}</span>
                    </div>
                    <Input type="text" inputMode="numeric" placeholder="0" value={type.value} onChange={(e) => { const value = e.target.value.replace(/[^0-9]/g, ''); type.setValue(value); }} className="h-9 text-center text-sm font-bold rounded-xl bg-white/80 border-slate-200/80 text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-400/50 focus-visible:border-amber-400/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    {type.id === 'multiple' && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/60">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-1.5">난이도</div>
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => setMultipleChoiceDifficulty('high')} className={`flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${multipleChoiceDifficulty === 'high' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100/70 text-slate-500 border border-slate-200/60 hover:bg-slate-200/60'}`}>높음</button>
                          <button type="button" onClick={() => setMultipleChoiceDifficulty('low')} className={`flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${multipleChoiceDifficulty === 'low' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100/70 text-slate-500 border border-slate-200/60 hover:bg-slate-200/60'}`}>낮음</button>
                        </div>
                        <div className="mt-1.5 text-[9px] text-slate-400">{multipleChoiceDifficulty === 'high' ? '8개 선지, 정답 최대 4개' : '5개 선지, 정답 최대 2개'}</div>
                      </div>
                    )}
                    {type.id === 'spelling' && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/60">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-1.5">모드</div>
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => setSpellingMode('subjective')} className={`flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${spellingMode === 'subjective' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100/70 text-slate-500 border border-slate-200/60 hover:bg-slate-200/60'}`}>주관식</button>
                          <button type="button" onClick={() => setSpellingMode('objective')} className={`flex-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${spellingMode === 'objective' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100/70 text-slate-500 border border-slate-200/60 hover:bg-slate-200/60'}`}>객관식</button>
                        </div>
                        <div className="mt-1.5 text-[9px] text-slate-400">{spellingMode === 'subjective' ? '영어 철자를 직접 입력' : '영어 단어 5개 중 정답 선택'}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 출제단어 직접선택 */}
            {selectedCardSet && selectedDays.length > 0 && totalQuestions > 0 && (() => {
              const wordGroups = getWordsGroupedByDay();
              const sortedDays = Object.keys(wordGroups).sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.replace(/\D/g, '')) || 0;
                return numA - numB;
              });
              return (
                <div className="editorial-card">
                  <div className="px-5 py-3.5 border-b border-neutral-200/70 bg-neutral-50/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="editorial-eyebrow">04</span>
                      <h2 className="text-[13px] font-semibold text-neutral-900 tracking-tight">출제단어 직접선택</h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {manuallySelectedWords.size > 0 && (
                        <button type="button" onClick={() => setManuallySelectedWords(new Set())} className="text-[10px] text-slate-400 hover:text-red-500">초기화</button>
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${manuallySelectedWords.size === totalQuestions ? 'bg-emerald-100 text-emerald-700' : manuallySelectedWords.size > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {manuallySelectedWords.size} / {totalQuestions}
                      </span>
                      <button type="button" onClick={() => setShowWordSelector(!showWordSelector)} className="text-[10px] text-slate-500 hover:text-slate-700 flex items-center gap-0.5">
                        {showWordSelector ? '접기' : '보기'}
                        {showWordSelector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {showWordSelector && (
                    <div className="p-2 space-y-1.5">
                      {sortedDays.map(day => {
                        const words = wordGroups[day];
                        const daySelectedCount = words.filter((w: any) => manuallySelectedWords.has(`${w.day}::${w.word}`)).length;
                        const isCollapsed = collapsedDays.has(day);
                        return (
                          <div key={day} className="border border-slate-100 rounded overflow-hidden">
                            <button type="button" onClick={() => toggleDayCollapse(day)} className="w-full flex items-center justify-between px-2 py-1 bg-slate-50 hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-600">{day}</span>
                                <span className="text-[9px] text-slate-400">({words.length})</span>
                                {daySelectedCount > 0 && <span className="px-1 bg-slate-200 text-slate-600 text-[9px] font-bold rounded">{daySelectedCount}</span>}
                              </div>
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleSelectAllDay(words); }} className="text-[9px] text-slate-500 hover:text-slate-700 px-1">
                                  {words.every((w: any) => manuallySelectedWords.has(`${w.day}::${w.word}`)) ? '해제' : '전체'}
                                </button>
                                {isCollapsed ? <ChevronDown className="w-2.5 h-2.5 text-slate-400" /> : <ChevronUp className="w-2.5 h-2.5 text-slate-400" />}
                              </div>
                            </button>
                            {!isCollapsed && (
                              <div className="flex flex-wrap gap-[3px] p-1.5">
                                {words.map((word: any, idx: number) => {
                                  const wordKey = `${word.day}::${word.word}`;
                                  const isSelected = manuallySelectedWords.has(wordKey);
                                  const isDisabled = !isSelected && totalQuestions > 0 && manuallySelectedWords.size >= totalQuestions;
                                  return (
                                    <button key={idx} type="button" onClick={() => !isDisabled && handleWordToggle(wordKey)} disabled={isDisabled} className={`px-1.5 py-[2px] rounded text-[10px] font-medium leading-tight ${isSelected ? 'bg-neutral-950 text-white' : isDisabled ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`} title={`${word.word.replace(/^\d+\.\s*/, '')} - ${word.meaning}`}>
                                      {word.word.replace(/^\d+\.\s*/, '')}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {manuallySelectedWords.size === totalQuestions && (
                    <div className="p-2 border-t border-slate-100 text-center">
                      <span className="text-[10px] font-medium text-emerald-600">✓ {totalQuestions}개 단어 선택 완료</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-4">
            <div className="editorial-card sticky top-24">
              <div className="px-5 py-3.5 border-b border-neutral-200/70 bg-neutral-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="editorial-eyebrow">Summary</span>
                </div>
                <span className="editorial-qbadge">{totalQuestions || 0} Q</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-0 text-xs">
                  <div className="flex justify-between items-baseline py-2.5 border-b border-neutral-100">
                    <span className="editorial-eyebrow">Title</span>
                    <span className="font-medium text-neutral-800 truncate max-w-[160px] text-right">{examTitle || '—'}</span>
                  </div>
                  <div className="flex justify-between items-baseline py-2.5 border-b border-neutral-100">
                    <span className="editorial-eyebrow">Card Set</span>
                    <span className="font-medium text-neutral-800 truncate max-w-[160px] text-right">{cardSets.find(cs => cs.id === selectedCardSet)?.title || '—'}</span>
                  </div>
                  <div className="flex justify-between items-baseline py-2.5 border-b border-neutral-100">
                    <span className="editorial-eyebrow">Days</span>
                    <span className="font-medium text-neutral-800">{selectedDays.length > 0 ? `${selectedDays.length}개` : '—'}</span>
                  </div>
                  <div className="flex justify-between items-baseline py-2.5">
                    <span className="editorial-eyebrow">Selection</span>
                    <span className="font-medium text-neutral-800">{manuallySelectedWords.size > 0 ? `${manuallySelectedWords.size}개 수동` : '랜덤'}</span>
                  </div>
                </div>

                {/* 문제 유형 */}
                <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3">
                  <div className="editorial-eyebrow mb-2.5">By Type</div>
                  <div className="space-y-1.5">
                    {questionTypes.map((type) => (
                      <div key={type.id} className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">{type.label}</span>
                        <span className="font-semibold text-neutral-900 tabular-nums">{parseInt(type.value) || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 총 문제 수 — editorial display */}
                <div className="rounded-2xl bg-neutral-950 text-white px-5 py-4 flex items-end justify-between">
                  <span className="editorial-eyebrow text-neutral-400">Total Questions</span>
                  <span className="editorial-display text-[44px] leading-none text-white">{totalQuestions}</span>
                </div>

                {/* 생성 버튼 */}
                <Button onClick={handleCreateExam} disabled={loading || !selectedCardSet || selectedDays.length === 0 || totalQuestions === 0} className="w-full h-12 text-[13px] font-medium rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-neutral-950 shadow-[0_8px_24px_-8px_rgba(245,158,11,0.5)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">

                  {loading ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>생성 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>시험 생성</span>
                    </div>
                  )}
                </Button>

                {/* Progress */}
                {loading && progressSteps.length > 0 && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                      <span className="text-[10px] font-medium text-slate-600">진행 상태</span>
                    </div>
                    <div className="space-y-1">
                      {progressSteps.map((step, index) => (
                        <div key={index} className={`flex items-center justify-between p-1.5 rounded text-[10px] ${step.status === 'loading' ? 'bg-blue-50 border border-blue-100' : step.status === 'done' ? 'bg-emerald-50' : step.status === 'error' ? 'bg-red-50' : 'bg-slate-50'}`}>
                          <div className="flex items-center gap-1">
                            {step.status === 'loading' && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                            {step.status === 'done' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            {step.status === 'error' && <X className="w-3 h-3 text-red-500" />}
                            {step.status === 'pending' && <div className="w-3 h-3 rounded-full border border-slate-300" />}
                            <span className="font-medium text-slate-600">{step.step}</span>
                          </div>
                          <span className="text-slate-400">{step.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateExam;
