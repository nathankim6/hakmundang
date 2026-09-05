import React, { useState, useEffect, useMemo, useCallback } from "react";
import { smartSplitIgnoringParens } from "@/utils/smart-split";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import studyRangeIcon from "@/assets/orun-academy-new-logo.png";
import { ImageStudyCard } from "@/components/ui/image-study-card";
import { ImagePlus } from "lucide-react";

// 정규식을 컴포넌트 외부에 미리 정의하여 매번 새로 생성하지 않도록 함
const SHEET_DAY_REGEX = /^(?:\[([^\]]+)\]|([A-Za-z0-9]+))\s+Day\s*(\d+)/i;
const DAY_REGEX = /day\s*(\d+)/i;
const NUMBER_ONLY_REGEX = /^\d+$/;
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StudyCard } from "@/components/ui/study-card";
import { SentenceQuiz } from "@/components/ui/sentence-quiz";
import { ExampleQuiz } from "@/components/ui/example-quiz";
import { MultipleChoiceQuiz } from "@/components/ui/multiple-choice-quiz";
import { ReverseQuiz } from "@/components/ui/reverse-quiz";
import { DefinitionQuiz } from "@/components/ui/definition-quiz";
import { SpellingQuiz } from "@/components/ui/spelling-quiz";
import { SynonymAntonymQuiz } from "@/components/ui/synonym-antonym-quiz";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { FlashCard } from "@/types/study";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, SkipForward, Calendar, BookOpen, ChevronDown, Play, Wand2, Loader2, Shuffle, Check, Layers, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export default function Study() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [searchParams] = useSearchParams();
  const testType = searchParams.get('mode') || searchParams.get('type') || 'meaning';
  const [cardSet, setCardSet] = useState<any>(null);
  const [allWordData, setAllWordData] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [dayWordCounts, setDayWordCounts] = useState<Record<string, {
    total: number;
    main: number;
    derivative: number;
  }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyStarted, setStudyStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<string[]>([]);
  const [correctCards, setCorrectCards] = useState<string[]>([]);
  const [incorrectCards, setIncorrectCards] = useState<string[]>([]);
  const [incorrectWordsInfo, setIncorrectWordsInfo] = useState<Array<{word: string; meaning: string}>>([]);
  const [unknownWords, setUnknownWords] = useState<Array<{word: string; meaning: string; phonetic?: string; exampleEn?: string; exampleKr?: string}>>([]);
  const [showCardResult, setShowCardResult] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showAllDays, setShowAllDays] = useState(true);
  const [isDaySelectionCollapsed, setIsDaySelectionCollapsed] = useState(false); // 기본값: 펼쳐진 상태
  const [isRandomOrder, setIsRandomOrder] = useState(false); // 기본값: 순차 순서
  // 범위설정 상태
  const [showRangeInput, setShowRangeInput] = useState(false);
  const [rangeInputStart, setRangeInputStart] = useState('');
  const [rangeInputEnd, setRangeInputEnd] = useState('');
  // 파생어 개념 제거됨 - 모든 단어가 표제어로 처리됨
  const [availableTestModes, setAvailableTestModes] = useState<string[]>(['meaning', 'spelling', 'definition', 'reverse', 'example', 'sentence', 'synonym_antonym']);
  const [quizKey, setQuizKey] = useState(0); // 퀴즈 컴포넌트 강제 재마운트를 위한 key
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGeneratingChoices, setIsGeneratingChoices] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0, word: '' });
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageGenProgress, setImageGenProgress] = useState({ current: 0, total: 0, word: '' });
  const [wordImageUrls, setWordImageUrls] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // 기본적인 영어-한국어 매핑 함수 (임시)
  const getBasicKoreanMeaning = (englishWord: string): string => {
    const basicMappings: Record<string, string> = {
      'fair': '공정한',
      'attempt': '시도하다',
      'merely': '단지',
      'comfort': '위안',
      'import': '수입하다',
      'register': '등록하다',
      'accuse': '고발하다',
      'include': '포함하다',
      'exclude': '제외하다',
      'approach': '접근하다',
      'nevertheless': '그럼에도 불구하고',
      'acquire': '얻다',
      'advance': '발전하다',
      'advantage': '이점',
      'adventure': '모험',
      'advertisement': '광고',
      'advice': '조언',
      'affect': '영향을 주다',
      'afford': '여유가 있다',
      'agent': '대리인',
      'agriculture': '농업',
      'aim': '목표',
      'alarm': '경보',
      'album': '앨범',
      'allow': '허용하다',
      'although': '비록',
      'altogether': '모두',
      'amazing': '놀라운',
      'ambulance': '구급차',
      'among': '사이에',
      'amount': '양',
      'amuse': '즐겁게 하다',
      'ancient': '고대의',
      'anger': '분노',
      'angle': '각도',
      'ankle': '발목',
      'announce': '발표하다',
      'annoy': '성가시게 하다',
      'annual': '매년의',
      'another': '다른',
      'answer': '답하다',
      'anxious': '걱정하는',
      'anywhere': '어디든지',
      'apart': '떨어져',
      'apartment': '아파트',
      'apologize': '사과하다',
      'appear': '나타나다',
      'application': '지원서',
      'apply': '지원하다',
      'appointment': '약속',
      'appreciate': '감사하다',
      'appropriate': '적절한',
      'approve': '승인하다',
      'approximately': '대략',
      'architect': '건축가',
      'architecture': '건축',
      'area': '지역',
      'argue': '논쟁하다',
      'argument': '논쟁',
      'arise': '일어나다',
      'arm': '팔',
      'army': '군대',
      'arrange': '정리하다',
      'arrest': '체포하다',
      'arrival': '도착',
      'arrive': '도착하다',
      'article': '기사',
      'artificial': '인공의',
      'artist': '예술가',
      'ashamed': '부끄러운',
      'aside': '옆으로',
      'asleep': '잠든',
      'aspect': '측면',
      'assist': '돕다',
      'associate': '연관시키다',
      'association': '협회',
      'assume': '가정하다',
      'astonish': '놀라게 하다',
      'athlete': '운동선수',
      'atmosphere': '분위기',
      'atomic': '원자의',
      'attach': '붙이다',
      'attack': '공격하다',
      'attend': '참석하다',
      'attention': '주의',
      'attitude': '태도',
      'attract': '끌다',
      'attractive': '매력적인',
      'audience': '관객',
      'author': '작가',
      'automatic': '자동의',
      'automobile': '자동차',
      'autumn': '가을',
      'available': '이용 가능한',
      'average': '평균',
      'avoid': '피하다',
      'awake': '깨어 있는',
      'award': '상',
      'aware': '알고 있는',
      'awful': '끔찍한',
      // 추가 단어들
      'anticipate': '예상하다',
      'anticipation': '예상',
      'fairly': '공정하게',
      'fairness': '공정함',
      'handle': '다루다',
      'breed': '기르다',
      // 능률 고교필수2000 Day 01 핵심/파생어 보강
      // (중복 키 제거됨)
      'reliable': '신뢰할 수 있는',
      'rely': '의존하다',
      'reliance': '의존',
      'promote': '촉진하다; 승진시키다',
      'promotion': '승진; 촉진',
      'adjust': '조정하다',
      'adjustment': '조정',
      'predict': '예측하다',
      'predictable': '예측 가능한',
      'prediction': '예측',
      'install': '설치하다',
      'installation': '설치',
      'alternative': '대안',
      'appoint': '임명하다',
      'locate': '위치시키다',
      'originate': '기원하다',
      'variable': '변수',
      'various': '다양한',
      'varied': '다양한',
      'celebrity': '유명인사',
      'caution': '주의',
      'barrier': '장벽',
      'inclusion': '포함',
      'including': '~을 포함하여',
      'exclusion': '제외',
      'excluding': '~을 제외하고',
      'appeal to': '...에게 호소하다; ~의 흥미를 끌다'
    };

    // 매핑된 단어가 없으면 빈 문자열 반환 (Edge Function에서 올바른 뜻을 생성하도록)
    return basicMappings[englishWord.toLowerCase()] || '';
  };

  // Day별 단어 인덱스를 미리 계산 (useMemo로 캐싱하여 성능 최적화)
  const dayWordIndex = useMemo(() => {
    if (allWordData.length === 0) return null;
    
    const normalizeDayNum = (dayStr: string): string => {
      const num = parseInt(dayStr, 10);
      return isNaN(num) ? dayStr : num.toString();
    };
    
    const extractDay = (val: any) => {
      if (!val) return '';
      const str = val.toString();
      const m = str.match(DAY_REGEX);
      if (m) return normalizeDayNum(m[1]);
      if (NUMBER_ONLY_REGEX.test(str)) return normalizeDayNum(str);
      return '';
    };
    
    const index: Record<string, number[]> = {};
    
    allWordData.forEach((word, i) => {
      const dayField = word.day?.toString() || '';
      
      // 시트:day 형식 체크 (예: "P1 Day 1")
      const sheetDayMatch = dayField.match(SHEET_DAY_REGEX);
      if (sheetDayMatch) {
        const sheetName = sheetDayMatch[1] || sheetDayMatch[2];
        const dayNum = normalizeDayNum(sheetDayMatch[3]);
        const key = `${sheetName}:${dayNum}`;
        if (!index[key]) index[key] = [];
        index[key].push(i);
        return;
      }
      
      // 단순 day 형식
      const d1 = extractDay(word.word);
      const d2 = extractDay(word.day);
      const d3 = extractDay(word.meaning);
      const dayNum = d1 || d2 || d3;
      if (dayNum) {
        if (!index[dayNum]) index[dayNum] = [];
        index[dayNum].push(i);
      }
    });
    
    return index;
  }, [allWordData]);

  // Admin 상태 확인 (adminLoggedIn 또는 admin/101100 코드로 접속)
  useEffect(() => {
    const adminStatus = sessionStorage.getItem("adminLoggedIn") === "true";
    const accessCode = sessionStorage.getItem("accessCode");
    const isSpecialAdmin = accessCode === "101100" || accessCode === "admin" || accessCode === "orun0088";
    setIsAdmin(adminStatus || isSpecialAdmin);
  }, []);

  // 시험이 시작되면 Day 선택 섹션을 자동으로 접기
  useEffect(() => {
    if (studyStarted) {
      setIsDaySelectionCollapsed(true);
    }
  }, [studyStarted]);
  useEffect(() => {
    const fetchCardSet = async () => {
      if (!id) return;
      try {
        const {
          data,
          error
        } = await supabase.from('card_sets').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          // Convert database format to study format
          const wordData = Array.isArray(data.word_data) ? data.word_data : [];

          // 🔧 **능률 고교필수2000 데이터 구조 정규화** 
          console.log('능률 고교필수2000 샘플 데이터:', wordData.slice(0, 5));
          let normalizedWordData = wordData.map((item: any) => {
            // "능률 고교필수2000" 특수 케이스 처리
            if (data.title?.includes("능률") || data.title?.includes("고교필수")) {
              // 실제 데이터 구조: {"day": "표제어", "word": "Day 01", "meaning": "fair"}
              // 정규화 후: {"day": "Day 01", "word": "fair", "meaning": "공정한"}

              // 표제어 또는 파생어 모두 정규화
              if ((item.day === "표제어" || item.day === "파생어") && item.word?.toString().toLowerCase().includes('day')) {
                // 데이터베이스에서 "능률 고교필수2000" 데이터는 특수한 구조를 가지고 있음
                // 실제 영어 단어가 meaning 필드에, Day 정보가 word 필드에 있음
                const englishWord = item.meaning;
                const wordType = item.day; // "표제어" 또는 "파생어"

                // 1차: 기본 매핑
                const basicKoreanMeaning = getBasicKoreanMeaning(englishWord);
                return {
                  ...item,
                  word: englishWord,
                  meaning: basicKoreanMeaning,
                  // 비어있을 수 있음 -> 아래에서 보강
                  day: item.word,
                  // "Day 01" 형태
                  type: wordType // 표제어/파생어 정보 보존
                };
              }
            }
            return item; // 정상적인 데이터는 그대로 반환
          });

          // 비어있는 한국어 뜻 보강 (GPT 사용) - 최적화: 병렬 배치 처리
          try {
            const needsEnrich = data.title?.includes("능률") || data.title?.includes("고교필수");
            if (needsEnrich) {
              const itemsNeedingMeaning = normalizedWordData.filter((it: any) => 
                !it.meaning || it.meaning.toString().trim() === ''
              );
              
              if (itemsNeedingMeaning.length > 0) {
                console.log(`Enriching meanings for ${itemsNeedingMeaning.length} words in parallel batches...`);
                
                // Process in batches of 5 for better performance
                const batchSize = 5;
                for (let i = 0; i < itemsNeedingMeaning.length; i += batchSize) {
                  const batch = itemsNeedingMeaning.slice(i, i + batchSize);
                  const results = await Promise.all(
                    batch.map(async (it: any) => {
                      try {
                        // Add timeout of 3 seconds
                        const timeoutPromise = new Promise<null>((_, reject) => 
                          setTimeout(() => reject(new Error('Timeout')), 3000)
                        );
                        const apiPromise = supabase.functions.invoke('generate-korean-meaning', {
                          body: { word: (it.word || '').toString() }
                        });
                        const { data: mData, error: mErr } = await Promise.race([apiPromise, timeoutPromise]) as any;
                        if (!mErr && mData?.meaning) {
                          return { word: it.word, meaning: mData.meaning };
                        }
                      } catch (_) {/* ignore timeout/errors */}
                      return null;
                    })
                  );
                  
                  // Update meanings in normalizedWordData
                  results.forEach(result => {
                    if (result) {
                      const idx = normalizedWordData.findIndex((it: any) => it.word === result.word);
                      if (idx !== -1) {
                        normalizedWordData[idx] = { ...normalizedWordData[idx], meaning: result.meaning };
                      }
                    }
                  });
                }
              }
            }
          } catch (enrichErr) {
            console.warn('Meaning enrichment failed:', enrichErr);
          }
          console.log('정규화 전 첫 번째 데이터:', wordData[0]);
          console.log('정규화 후 첫 번째 데이터:', normalizedWordData[0]);
          // 파생어 개념 제거됨 - 모든 단어가 표제어로 처리
          // Set available test modes from database
          setAvailableTestModes(data.available_test_modes || ['meaning', 'spelling', 'definition', 'reverse', 'example', 'sentence']);

          // Set all word data and available days
          setAllWordData(normalizedWordData);

          // Helper function to normalize day number (removes leading zeros and converts to consistent string)
          const normalizeDayNum = (dayStr: string): string => {
            const num = parseInt(dayStr, 10);
            return isNaN(num) ? dayStr : num.toString();
          };

          // Extract actual days from normalized word data
          const daySet = new Set<string>();
          // 시트별 Day 추출을 위한 그룹화 맵
          const sheetDayGroups: Record<string, Set<string>> = {};
          
          console.log('전체 단어 데이터:', normalizedWordData.length, '개');
          console.log('정규화된 첫 번째 단어 데이터 샘플:', normalizedWordData[0]);
          
          normalizedWordData.forEach((word: any) => {
            const dayField = word.day?.toString() || '';
            
            // "P1 Day 01", "[Part 1] DAY 01" 형식 감지
            const sheetDayMatch = dayField.match(/^(?:\[([^\]]+)\]|([A-Za-z0-9]+))\s+Day\s*(\d+)/i);
            if (sheetDayMatch) {
              const sheetName = sheetDayMatch[1] || sheetDayMatch[2];
              const normalizedDay = normalizeDayNum(sheetDayMatch[3]);
              if (!sheetDayGroups[sheetName]) {
                sheetDayGroups[sheetName] = new Set();
              }
              sheetDayGroups[sheetName].add(normalizedDay);
              daySet.add(normalizedDay);
              return;
            }
            
            // 기존 로직: 단순 Day 형식
            const dayInWord = word.word && word.word.toString().toLowerCase().includes('day');
            const dayInDay = word.day && word.day.toString().toLowerCase().includes('day');
            const dayInMeaning = word.meaning && word.meaning.toString().toLowerCase().includes('day');
            if (dayInWord) {
              const match = word.word.toString().match(/day\s*(\d+)/i);
              if (match) {
                const normalizedDay = normalizeDayNum(match[1]);
                console.log('word.word에서 DAY 발견:', normalizedDay);
                daySet.add(normalizedDay);
              }
            } else if (dayInDay) {
              const match = word.day.toString().match(/day\s*(\d+)/i);
              if (match) {
                const normalizedDay = normalizeDayNum(match[1]);
                console.log('word.day에서 DAY 발견:', normalizedDay);
                daySet.add(normalizedDay);
              }
            } else if (dayInMeaning) {
              const match = word.meaning.toString().match(/day\s*(\d+)/i);
              if (match) {
                const normalizedDay = normalizeDayNum(match[1]);
                console.log('word.meaning에서 DAY 발견:', normalizedDay);
                daySet.add(normalizedDay);
              }
            } else if (word.day && /^\d+$/.test(word.day.toString())) {
              // MD보카와 같이 day 필드가 단순 숫자인 경우
              const normalizedDay = normalizeDayNum(word.day.toString());
              console.log('단순 숫자 DAY 발견:', normalizedDay);
              daySet.add(normalizedDay);
            }
          });
          
          const dayNumbers = Array.from(daySet).sort((a: string, b: string) => parseInt(a) - parseInt(b));
          console.log('추출된 DAY 목록:', dayNumbers);
          setAvailableDays(dayNumbers);
          
          // 시트가 여러 개인지 확인
          const sheetNames = Object.keys(sheetDayGroups);
          const hasMultipleSheets = sheetNames.length > 1;

          // Pre-calculate word counts for each day (성능 최적화)
          const calculateDayWordCounts = (wordData: any[]) => {
            const wordCounts: Record<string, {
              total: number;
              main: number;
              derivative: number;
            }> = {};
            dayNumbers.forEach((day: string) => {
              const dayWords = wordData.filter((word: any) => {
                // 능률 고교필수2000: word.meaning에 "Day 01" 형태로 있음 (정규화 후)
                // 워드마스터 시리즈: word.day에 "Day 01" 형태로 있음
                // MD보카: word.day에 "1", "2" 등 단순 숫자 형태로 있음
                const dayInWord = word.word && word.word.toString().toLowerCase().includes('day');
                const dayInDay = word.day && word.day.toString().toLowerCase().includes('day');
                const dayInMeaning = word.meaning && word.meaning.toString().toLowerCase().includes('day');
                if (dayInWord) {
                  const match = word.word.toString().match(/day\s*(\d+)/i);
                  if (match) {
                    return normalizeDayNum(match[1]) === day;
                  }
                  return false;
                } else if (dayInDay) {
                  const match = word.day.toString().match(/day\s*(\d+)/i);
                  if (match) {
                    return normalizeDayNum(match[1]) === day;
                  }
                  return false;
                } else if (dayInMeaning) {
                  const match = word.meaning.toString().match(/day\s*(\d+)/i);
                  if (match) {
                    return normalizeDayNum(match[1]) === day;
                  }
                  return false;
                } else if (word.day && /^\d+$/.test(word.day.toString())) {
                  // MD보카와 같이 day 필드가 단순 숫자인 경우
                  return normalizeDayNum(word.day.toString()) === day;
                }
                return false;
              });

              // 모든 단어를 표제어로 처리 (파생어 개념 제거)
              wordCounts[day] = {
                total: dayWords.length,
                main: dayWords.length,
                derivative: 0
              };
            });
            return wordCounts;
          };
          setDayWordCounts(calculateDayWordCounts(normalizedWordData));

          // Initialize with first day selected by default
          console.log('사용 가능한 DAY들:', dayNumbers);
          console.log('시트 정보:', sheetNames, '시트가 여러 개:', hasMultipleSheets);
          
          // 초기에는 아무 Day도 선택하지 않음 - 사용자가 직접 선택해야 함
          let initialSelectedDays: string[] = [];
          
          console.log('초기 선택된 DAY (없음 - 직접 선택 필요):', initialSelectedDays);
          setSelectedDays(initialSelectedDays);
          
          // Helper function to extract day number (uses normalizeDayNum from above)
          const extractDay = (val: any) => {
            if (!val) return '';
            const str = val.toString();
            const m = str.match(/day\s*(\d+)/i);
            if (m) return normalizeDayNum(m[1]);
            // 숫자만 있는 경우
            if (/^\d+$/.test(str)) return normalizeDayNum(str);
            return '';
          };
          
          // 초기 필터링 - 시트 형식 지원
          const filteredWords = normalizedWordData.filter((word: any) => {
            const dayField = word.day?.toString() || '';
            
            // "[Part 1] DAY 01", "P1 Day 01" 형식 체크
            const sheetDayMatch = dayField.match(/^(?:\[([^\]]+)\]|([A-Za-z0-9]+))\s+Day\s*(\d+)/i);
            if (sheetDayMatch) {
              const sheetName = sheetDayMatch[1] || sheetDayMatch[2];
              const dayNum = normalizeDayNum(sheetDayMatch[3]);
              const key = `${sheetName}:${dayNum}`;
              return initialSelectedDays.includes(key);
            }
            
            // 단순 Day 형식
            const d1 = extractDay(word.word);
            const d2 = extractDay(word.day);
            const d3 = extractDay(word.meaning);
            const dayNum = d1 || d2 || d3;
            return dayNum && initialSelectedDays.includes(dayNum);
          });
          console.log('필터링된 단어 수:', filteredWords.length);
          console.log('초기 선택된 DAY:', initialSelectedDays);
          const convertedCardSet = {
            title: data.title,
            description: data.description || "",
            testType: testType,
            // Use URL parameter instead of database value
            cards: filteredWords.map((word: any, index: number) => {
              // 🔧 정규화된 데이터에서 올바른 word와 meaning 추출
              let actualWord = word.word;
              let actualMeaning = word.meaning;

              // Day 정보가 meaning에 있다면 이를 제거하고 실제 단어를 추출
              if (actualMeaning?.toString().toLowerCase().includes('day')) {
                // Day 정보는 무시하고 word 필드의 값을 실제 단어로 사용
                actualWord = word.word;
                actualMeaning = ''; // 의미는 별도로 찾아야 함
              }
              if (testType === 'sentence') {
                // For sentence type, we need both Korean and English
                return {
                  id: `${data.id}-${index}`,
                  korean: actualMeaning,
                  english: actualWord,
                  englishWords: actualWord?.split(' ') || [],
                  difficulty: "medium" as const
                };
              } else if (testType === 'spelling') {
                // For spelling type (example quiz)  
                return {
                  id: `${data.id}-${index}`,
                  word: actualWord?.replace(/^Day\s*\d+\s*/i, '') || '',
                  meaning: actualMeaning || '',
                  example: word.example || `The word ${actualWord?.replace(/^Day\s*\d+\s*/i, '') || ''} is used in sentences.`,
                  difficulty: "medium" as const
                };
              } else if (testType === 'example') {
                // For example completion type
                return {
                  id: `${data.id}-${index}`,
                  word: actualWord?.replace(/^Day\s*\d+\s*/i, '') || '',
                  meaning: actualMeaning || '',
                  example: word.example || '',
                  // Will be generated by GPT if empty
                  difficulty: "medium" as const
                };
              } else if (testType === 'reverse') {
                // For reverse type (typing English word from Korean meaning)
                return {
                  id: `${data.id}-${index}`,
                  meaning: actualMeaning || '',
                  word: actualWord?.replace(/^Day\s*\d+\s*/i, '') || '',
                  difficulty: "medium" as const
                };
              } else if (testType === 'definition') {
                // For definition type (English definition to word)
                return {
                  id: `${data.id}-${index}`,
                  word: actualWord?.replace(/^Day\s*\d+\s*/i, '') || '',
                  meaning: actualMeaning || '',
                  englishDefinition: word.englishDefinition || word.english_definition || '',
                  difficulty: "medium" as const
                };
              } else if (testType === 'synonym_antonym') {
                // For synonym/antonym type - find the odd one out
                return {
                  id: `${data.id}-${index}`,
                  word: actualWord?.replace(/^Day\s*\d+\s*/i, '') || '',
                  meaning: actualMeaning || '',
                  synonyms: word.synonyms || [],
                  antonyms: word.antonyms || [],
                  difficulty: "medium" as const
                };
              } else {
                // For meaning type (regular cards)
                return {
                  id: `${data.id}-${index}`,
                  front: actualWord?.replace(/^Day\s*\d+\s*/i, '') || '',
                  back: actualMeaning || '',
                  difficulty: "medium" as const
                };
              }
            })
          };
          setCardSet(convertedCardSet);
        }
      } catch (error) {
        console.error('Error fetching card set:', error);
        setError('단어장을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchCardSet();
  }, [id]);

  // dayWordCounts를 useMemo로 캐싱하여 성능 최적화
  const calculatedDayWordCounts = useMemo(() => {
    if (!dayWordIndex || availableDays.length === 0) return {};
    
    const wordCounts: Record<string, { total: number; main: number; derivative: number }> = {};
    
    availableDays.forEach((day: string) => {
      // 최적화: dayWordIndex에서 O(1)로 인덱스 조회
      const indices = dayWordIndex[day] || [];
      const dayWords = indices.map(i => allWordData[i]);
      
      const mainWords = dayWords.filter((word: any) => {
        if (word.number && typeof word.number === 'number' && word.number > 0) return true;
        if (word.type === "표제어") return true;
        if (word.type === "파생어") return false;
        if (!word.number && word.word && /^[a-zA-Z]+$/.test(word.word.trim()) && !word.word.includes(' ')) return true;
        return false;
      });
      
      const derivativeWords = dayWords.filter((word: any) => {
        if (word.type === "파생어") return true;
        if (!word.number && word.word?.includes(' ')) return true;
        if (word.number && word.number <= 0) return true;
        return false;
      });
      
      const hasDerivatives = derivativeWords.length > 0;
      wordCounts[day] = {
        total: dayWords.length,
        main: hasDerivatives ? mainWords.length : dayWords.length,
        derivative: derivativeWords.length
      };
    });
    
    return wordCounts;
  }, [dayWordIndex, availableDays, allWordData]);
  
  // dayWordCounts 상태 동기화 (하위 호환성 유지)
  useEffect(() => {
    if (Object.keys(calculatedDayWordCounts).length > 0) {
      setDayWordCounts(calculatedDayWordCounts);
    }
  }, [calculatedDayWordCounts]);

  // 선택된 Day의 단어 인덱스를 useMemo로 캐싱 (카드 변환 지연)
  const selectedWordIndices = useMemo(() => {
    if (!dayWordIndex || selectedDays.length === 0) return [];
    return selectedDays.flatMap(day => dayWordIndex[day] || []);
  }, [selectedDays, dayWordIndex]);
  
  // 카드 변환 함수 (useCallback으로 메모이제이션)
  const convertWordToCard = useCallback((word: any, index: number, cardSetId: string) => {
    let actualWord = word.word;
    let actualMeaning = word.meaning;

    if (actualMeaning?.toString().toLowerCase().includes('day')) {
      actualWord = word.word;
      actualMeaning = getBasicKoreanMeaning(word.word);
    }
    
    const cleanWord = actualWord?.replace(/^Day\s*\d+\s*/i, '') || '';
    
    if (testType === 'sentence') {
      return { id: `${cardSetId}-${index}`, korean: actualMeaning, english: actualWord, englishWords: actualWord?.split(' ') || [], difficulty: "medium" as const };
    } else if (testType === 'spelling') {
      return { id: `${cardSetId}-${index}`, word: cleanWord, meaning: actualMeaning || '', example: word.example || `The word ${cleanWord} is used in sentences.`, difficulty: "medium" as const };
    } else if (testType === 'example') {
      return { id: `${cardSetId}-${index}`, word: cleanWord, meaning: actualMeaning || '', example: word.example || '', difficulty: "medium" as const };
    } else if (testType === 'reverse') {
      return { id: `${cardSetId}-${index}`, meaning: actualMeaning || '', word: cleanWord, difficulty: "medium" as const };
    } else if (testType === 'definition') {
      return { id: `${cardSetId}-${index}`, word: cleanWord, meaning: actualMeaning || '', englishDefinition: word.englishDefinition || word.english_definition || '', difficulty: "medium" as const };
    } else if (testType === 'synonym_antonym') {
      // 동/반의어 찾기 모드 - CSV에서 가져온 synonyms와 antonyms 데이터 사용
      return { 
        id: `${cardSetId}-${index}`, 
        word: cleanWord, 
        meaning: actualMeaning || '', 
        synonyms: word.synonyms || [],
        antonyms: word.antonyms || [],
        difficulty: "medium" as const 
      };
    } else if (testType === 'card') {
      // Image card mode - ensure all values are strings
      const exampleStr = word.example ? String(word.example) : '';
      const exampleParts = exampleStr.split(' / ');
      return {
        id: `${cardSetId}-${index}`,
        word: String(cleanWord || ''),
        meaning: String(actualMeaning || ''),
        phonetic: String(word.phonetic || word.ipa || ''),
        exampleEn: exampleParts[0] || '',
        exampleKr: String(word.exampleKr || word.example_kr || exampleParts[1] || ''),
        imageUrl: String(word.imageUrl || word.image_url || ''),
        difficulty: "medium" as const
      };
    } else {
      return { id: `${cardSetId}-${index}`, front: cleanWord, back: actualMeaning || '', difficulty: "medium" as const };
    }
  }, [testType]);
  
  // Day 선택 시 카드 업데이트 (인덱스 기반으로 최적화)
  useEffect(() => {
    if (allWordData.length > 0 && selectedWordIndices.length > 0 && cardSet) {
      const cardSetId = cardSet.id || 'temp';
      const updatedCards = selectedWordIndices.map((i, idx) => convertWordToCard(allWordData[i], idx, cardSetId));
      
      // 상태 업데이트를 일괄 처리
      setCardSet(prev => prev ? { ...prev, cards: updatedCards } : null);
      setCurrentIndex(0);
      setIsFlipped(false);
      setStudiedCards([]);
      setCorrectCards([]);
      setIncorrectCards([]);
      setIncorrectWordsInfo([]);
      setUnknownWords([]);
      setShowCardResult(false);
      setShowResult(false);
      setStudyStarted(false);
    }
  }, [selectedWordIndices, convertWordToCard]);
  const handleRestart = async () => {
    // 전체 재출제: 선택한 Day의 모든 단어 캐시를 삭제하여 GPT로 새로운 선지 생성
    setStudyStarted(false); // 먼저 학습 상태를 중지
    
    try {
      // Helper function to normalize day number
      const normalizeDayNum = (dayStr: string): string => {
        const num = parseInt(dayStr, 10);
        return isNaN(num) ? dayStr : num.toString();
      };

      // 선택한 Day의 모든 단어를 allWordData에서 직접 추출
      const selectedDayWords = allWordData.filter((word: any) => {
        const dayField = word.day?.toString() || '';
        
        // 시트:day 형식 체크 (예: "P1 Day 1", "[Part 1] DAY 01")
        const sheetDayMatch = dayField.match(/^(?:\[([^\]]+)\]|([A-Za-z0-9]+))\s+Day\s*(\d+)/i);
        if (sheetDayMatch) {
          const sheetName = sheetDayMatch[1] || sheetDayMatch[2];
          const dayNum = normalizeDayNum(sheetDayMatch[3]);
          const key = `${sheetName}:${dayNum}`;
          return selectedDays.includes(key);
        }
        
        // 단순 day 형식 (시트가 하나일 때)
        const dayInWord = word.word && word.word.toString().toLowerCase().includes('day');
        const dayInDay = word.day && word.day.toString().toLowerCase().includes('day');
        const dayInMeaning = word.meaning && word.meaning.toString().toLowerCase().includes('day');
        
        if (dayInWord) {
          const match = word.word.toString().match(/day\s*(\d+)/i);
          if (match) return selectedDays.includes(normalizeDayNum(match[1]));
          return false;
        } else if (dayInDay) {
          const match = word.day.toString().match(/day\s*(\d+)/i);
          if (match) return selectedDays.includes(normalizeDayNum(match[1]));
          return false;
        } else if (dayInMeaning) {
          const match = word.meaning.toString().match(/day\s*(\d+)/i);
          if (match) return selectedDays.includes(normalizeDayNum(match[1]));
          return false;
        } else if (word.day && /^\d+$/.test(word.day.toString())) {
          return selectedDays.includes(normalizeDayNum(word.day.toString()));
        }
        return false;
      });

      // 각 단어의 실제 word와 meaning을 추출
      const wordsToDelete = selectedDayWords.map((word: any) => {
        let actualWord = word.word;
        let actualMeaning = word.meaning;

        // Day 정보가 meaning에 있다면 이를 제거하고 실제 단어를 추출
        if (actualMeaning?.toString().toLowerCase().includes('day')) {
          actualWord = word.word;
          actualMeaning = getBasicKoreanMeaning(word.word);
        }

        return {
          word: actualWord,
          meaning: actualMeaning
        };
      });

      console.log(`선택한 Day ${selectedDays.join(', ')}의 모든 단어 캐시 삭제 중:`, wordsToDelete.length, '개');

      // 각 단어의 캐시 삭제
      for (const wordData of wordsToDelete) {
        const { error } = await supabase
          .from('word_quiz_cache')
          .delete()
          .eq('word', wordData.word.trim())
          .eq('meaning', wordData.meaning.trim());
        
        if (error) {
          console.error('Error deleting cache for word:', wordData.word, error);
        } else {
          console.log('Cache deleted for:', wordData.word);
        }
      }

      console.log('선택한 Day의 모든 단어 캐시 삭제 완료');
      
      // 학습 상태 완전 초기화
      setCurrentIndex(0);
      setIsFlipped(false);
      setStudiedCards([]);
      setCorrectCards([]);
      setIncorrectCards([]);
      setIncorrectWordsInfo([]);
      setUnknownWords([]);
      setShowCardResult(false);
      setShowResult(false);
      
      // 퀴즈 key를 변경하여 모든 퀴즈 컴포넌트 강제 재마운트
      setQuizKey(prev => prev + 1);
      
      // 약간의 지연 후 자동으로 학습 재시작
      setTimeout(() => {
        setStudyStarted(true);
        console.log('Study restarted with fresh GPT-generated choices for selected days');
      }, 300);
      
    } catch (error) {
      console.error('Error in handleRestart:', error);
      // 에러가 발생해도 학습 상태는 초기화
      setCurrentIndex(0);
      setIsFlipped(false);
      setStudiedCards([]);
      setCorrectCards([]);
      setIncorrectCards([]);
      setIncorrectWordsInfo([]);
      setUnknownWords([]);
      setShowCardResult(false);
      setShowResult(false);
      setStudyStarted(false);
    }
  };
  const toggleDay = (day: string, sheetName?: string) => {
    // 시트가 여러 개일 때는 "시트명:day" 형식으로 저장
    const key = sheetName ? `${sheetName}:${day}` : day;
    setSelectedDays(prev => {
      if (prev.includes(key)) {
        return prev.filter(d => d !== key);
      } else {
        return [...prev, key].sort();
      }
    });
    // Reset study when days change
    setStudyStarted(false);
  };
  // Load cached images from word_images table
  useEffect(() => {
    const loadCachedImages = async () => {
      if (!id || testType !== 'card') return;
      
      try {
        const { data, error } = await supabase
          .from('word_images')
          .select('word, image_url')
          .eq('card_set_id', id);
        
        if (!error && data && data.length > 0) {
          const urls: Record<string, string> = {};
          data.forEach((item: any) => {
            urls[item.word] = item.image_url;
          });
          setWordImageUrls(prev => ({ ...prev, ...urls }));
        }
      } catch (err) {
        console.error('Error loading cached images:', err);
      }
    };
    
    loadCachedImages();
  }, [id, testType]);

  if (loading) {
    return <FullPageLoading message="단어장을 불러오는 중..." />;
  }
  if (error || !cardSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {error || '단어장을 찾을 수 없습니다'}
          </h1>
          <p className="text-slate-500 mb-6">다시 시도해주세요</p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  const currentCard = cardSet.cards[currentIndex];
  const totalCards = cardSet.cards.length;
  const progress = studiedCards.length / totalCards * 100;

  // noDaysSelected 상태 추가 - Day가 선택되지 않았거나 단어가 없는 경우
  const noDaysSelected = selectedDays.length === 0;
  const noCardsAvailable = totalCards === 0 && !noDaysSelected;

  // currentCard 에러는 Day가 선택된 상태에서만 표시 (Day 미선택 시에는 Day 선택 UI 표시)
  const showCardError = !currentCard && !noDaysSelected && !noCardsAvailable && studyStarted;
  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };
  const handleAnswer = async (isCorrect: boolean) => {
    const cardId = currentCard.id;
    if (!studiedCards.includes(cardId)) {
      setStudiedCards(prev => [...prev, cardId]);
      if (isCorrect) {
        setCorrectCards(prev => [...prev, cardId]);
      } else {
        setIncorrectCards(prev => [...prev, cardId]);
        // 틀린 단어 정보 저장
        setIncorrectWordsInfo(prev => [...prev, {
          word: currentCard.word || currentCard.front,
          meaning: currentCard.meaning || currentCard.back
        }]);
      }
    }

    // 철자쓰기(reverse) 모드에서 틀린 문제는 뒤에 다시 추가
    if (!isCorrect && (testType === 'reverse' || cardSet.testType === 'reverse')) {
      const retryCard = { ...currentCard, id: `${cardId}_retry_${Date.now()}` };
      setCardSet((prev: any) => ({
        ...prev,
        cards: [...prev.cards, retryCard]
      }));
    }

    // Move to next card or show results
    const updatedTotalCards = cardSet.cards.length + (!isCorrect && (testType === 'reverse' || cardSet.testType === 'reverse') ? 1 : 0);
    if (currentIndex < updatedTotalCards - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Test completed - save results to database
      await saveTestResults();
      setShowResult(true);
    }
  };
  const saveTestResults = async () => {
    try {
      const storedData = localStorage.getItem('studentData');
      if (!storedData) return;
      const student = JSON.parse(storedData);
      const accuracy = studiedCards.length > 0 ? correctCards.length / studiedCards.length * 100 : 0;

      // Check if student already exists in test history
      const {
        data: existingData,
        error: fetchError
      } = await supabase.from('student_test_history').select('*').eq('student_name', student.name).single();
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing test history:', fetchError);
        return;
      }
      if (existingData) {
        // Update existing record
        const newTestCount = existingData.test_count + 1;
        const newTotalScore = existingData.total_score + accuracy;
        const newAverageScore = newTotalScore / newTestCount;
        await supabase.from('student_test_history').update({
          test_count: newTestCount,
          total_score: newTotalScore,
          average_score: newAverageScore,
          updated_at: new Date().toISOString()
        }).eq('id', existingData.id);
      } else {
        // Create new record
        await supabase.from('student_test_history').insert({
          student_name: student.name,
          student_class: student.class_name || null,
          test_count: 1,
          total_score: accuracy,
          average_score: accuracy
        });
      }
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };
  const handleSkip = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setShowResult(true);
    }
  };

  const handleSkipPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleSkipNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };




  // AI 이미지 일괄 생성 (Admin 전용, card 모드)
  const handleGenerateImages = async () => {
    if (selectedDays.length === 0) return;
    setIsGeneratingImages(true);
    
    try {
      const wordIndices: number[] = [];
      if (dayWordIndex) {
        for (const day of selectedDays) {
          const indices = dayWordIndex[day] || [];
          wordIndices.push(...indices);
        }
      }
      const uniqueIndices = [...new Set(wordIndices)].sort((a, b) => a - b);
      const wordsToGenerate = uniqueIndices.map(idx => allWordData[idx]).filter(Boolean);
      
      // Generate images for all words (force regenerate to replace existing ones)
      const totalWords = wordsToGenerate.length;
      if (totalWords === 0) {
        toast({ title: "생성할 단어가 없습니다." });
        setIsGeneratingImages(false);
        return;
      }
      
      setImageGenProgress({ current: 0, total: totalWords, word: '' });
      let successCount = 0;
      const BATCH_SIZE = 5; // 동시 5개씩 병렬 처리
      
      for (let i = 0; i < wordsToGenerate.length; i += BATCH_SIZE) {
        const batch = wordsToGenerate.slice(i, i + BATCH_SIZE);
        
        setImageGenProgress({ current: i + 1, total: totalWords, word: batch.map(w => (w.word || '').trim()).join(', ') });
        
        const results = await Promise.allSettled(
          batch.map(async (word) => {
            const wordText = (word.word || '').trim();
            const exampleText = word.example || `The word "${wordText}" is commonly used in everyday English.`;
            
            const { data, error } = await supabase.functions.invoke('generate-word-image', {
              body: { word: wordText, example: exampleText, cardSetId: id, forceRegenerate: true }
            });
            
            if (!error && data?.imageUrl) {
              const img = new Image();
              img.src = data.imageUrl;
              
              setWordImageUrls(prev => ({ ...prev, [wordText.toLowerCase()]: data.imageUrl }));
              
              const wordIdx = allWordData.findIndex(w => (w.word || '').trim() === wordText);
              if (wordIdx !== -1) {
                allWordData[wordIdx] = { ...allWordData[wordIdx], imageUrl: data.imageUrl };
              }
              return true;
            } else {
              console.error(`Image generation failed for ${wordText}:`, error || data?.error);
              return false;
            }
          })
        );
        
        successCount += results.filter(r => r.status === 'fulfilled' && r.value).length;
      }
      
      toast({
        title: `이미지 생성 완료`,
        description: `${successCount}/${totalWords}개 단어의 이미지가 생성되었습니다.`
      });
      
      // Update card set to reflect new images
      if (cardSet && cardSet.cards) {
        const updatedCards = cardSet.cards.map((card: any) => {
          const url = wordImageUrls[(card.word || '').toLowerCase()];
          return url ? { ...card, imageUrl: url } : card;
        });
        setCardSet(prev => prev ? { ...prev, cards: updatedCards } : null);
      }
    } catch (error) {
      console.error('Error in handleGenerateImages:', error);
      toast({ title: "이미지 생성 중 오류", description: "일부 이미지 생성에 실패했습니다.", variant: "destructive" });
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleStartStudy = () => {
    if (selectedDays.length === 0) return;

    // 카드 순서 결정
    if (isRandomOrder) {
      // 카드 셔플
      const shuffledCards = [...cardSet.cards].sort(() => Math.random() - 0.5);
      setCardSet(prev => ({
        ...prev,
        cards: shuffledCards
      }));
    }
    setStudyStarted(true);
  };

  // 선택된 Day의 모든 단어에 대해 선지 생성 및 캐시 저장 (Admin 전용)
  const handleGenerateChoices = async () => {
    if (selectedDays.length === 0) return;
    
    setIsGeneratingChoices(true);
    
    try {
      // dayWordIndex를 활용하여 선택된 Day의 단어 인덱스 가져오기
      const wordIndices: number[] = [];
      
      if (dayWordIndex) {
        for (const day of selectedDays) {
          const indices = dayWordIndex[day] || [];
          wordIndices.push(...indices);
        }
      }
      
      // 중복 제거 및 정렬
      const uniqueIndices = [...new Set(wordIndices)].sort((a, b) => a - b);
      
      // 인덱스를 사용하여 단어 가져오기
      const wordsToGenerate = uniqueIndices.map(idx => allWordData[idx]).filter(Boolean);
      
      // 모든 단어가 표제어로 처리됨 (파생어 필터링 제거)
      const filteredWords = wordsToGenerate;
      
      let successCount = 0;
      let errorCount = 0;
      const totalWords = filteredWords.length;
      setGeneratingProgress({ current: 0, total: totalWords, word: '' });
      
      for (let i = 0; i < filteredWords.length; i++) {
        const word = filteredWords[i];
        const wordText = (word.word || word.front || '').trim();
        const meaningText = (word.meaning || word.back || '').trim();
        
        // 실시간 진행 상태 업데이트
        setGeneratingProgress({ current: i + 1, total: totalWords, word: wordText });
        
        if (!wordText || !meaningText) continue;
        
        try {
          // 발음 정보 먼저 가져오기
          const { data: pronunciationData } = await supabase.functions.invoke('get-pronunciation', {
            body: { word: wordText }
          });
          
          const phoneticTranscription = pronunciationData?.ipa || null;
          const koreanPronunciation = pronunciationData?.korean || null;
          
          // 한글 선지 생성 (의미 맞추기 모드용)
          const { data: koreanData, error: koreanError } = await supabase.functions.invoke('generate-korean-wrong-choices', {
            body: { correctWord: wordText, correctMeaning: meaningText, numberOfChoices: 5 }
          });
          
          if (koreanError) {
            console.error(`Korean choices error for ${wordText}:`, koreanError);
          } else if (koreanData?.wrongChoices) {
            // 정답과 오답을 합쳐서 선택지 배열 생성
            const allMeanings = smartSplitIgnoringParens(meaningText, /[,·]/).map((m: string) => m.trim()).filter((m: string) => m);
            const choices = [...allMeanings, ...koreanData.wrongChoices].sort(() => Math.random() - 0.5);
            
            // 캐시에 저장 (의미 맞추기 모드) - 발음 데이터 포함
            await supabase.from('word_quiz_cache').upsert({
              word: wordText,
              meaning: meaningText,
              english_definition: meaningText,
              part_of_speech: '동사',
              wrong_choices: koreanData.wrongChoices,
              choices: choices,
              correct_answers: allMeanings,
              quiz_type: 'meaning',
              phonetic_transcription: phoneticTranscription,
              korean_pronunciation: koreanPronunciation
            }, {
              onConflict: 'word,meaning,quiz_type'
            });
            
            console.log(`Cached Korean choices for ${wordText} with pronunciation`);
          }
          
          // 영어 선지 생성 (예문 완성 모드용)
          const { data: englishData, error: englishError } = await supabase.functions.invoke('generate-english-wrong-choices', {
            body: { correctWord: wordText, koreanMeaning: meaningText, numberOfChoices: 4 }
          });
          
          if (englishError) {
            console.error(`English choices error for ${wordText}:`, englishError);
          } else if (englishData?.wrongChoices) {
            // 정답과 오답을 합쳐서 선택지 배열 생성
            const englishChoices = [wordText, ...englishData.wrongChoices].sort(() => Math.random() - 0.5);
            
            // 캐시에 저장 (예문 완성 모드) - 발음 데이터 포함
            await supabase.from('word_quiz_cache').upsert({
              word: wordText,
              meaning: meaningText,
              english_definition: meaningText,
              part_of_speech: '동사',
              wrong_choices: englishData.wrongChoices,
              choices: englishChoices,
              correct_answers: [wordText],
              quiz_type: 'example',
              phonetic_transcription: phoneticTranscription,
              korean_pronunciation: koreanPronunciation
            }, {
              onConflict: 'word,meaning,quiz_type'
            });
            
            console.log(`Cached English choices for ${wordText} with pronunciation`);
          }
          
          successCount++;
        } catch (err) {
          console.error(`Failed to generate choices for ${wordText}:`, err);
          errorCount++;
        }
      }
      
      toast({
        title: "선지 생성 및 저장 완료",
        description: `${successCount}개 단어의 선지가 생성 및 저장되었습니다. ${errorCount > 0 ? `(${errorCount}개 실패)` : ''}`,
      });
    } catch (err) {
      console.error('선지 생성 오류:', err);
      toast({
        title: "선지 생성 실패",
        description: "선지 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingChoices(false);
      setGeneratingProgress({ current: 0, total: 0, word: '' });
    }
  };
  if (showResult) {
    const accuracy = studiedCards.length > 0 ? correctCards.length / studiedCards.length * 100 : 0;
    const getGradeInfo = (acc: number) => {
      if (acc >= 90) return { grade: 'A+', color: 'from-emerald-400 to-green-500', bgColor: 'from-emerald-500/20 to-green-500/20', message: '완벽해요!' };
      if (acc >= 80) return { grade: 'A', color: 'from-blue-400 to-cyan-500', bgColor: 'from-blue-500/20 to-cyan-500/20', message: '훌륭해요!' };
      if (acc >= 70) return { grade: 'B+', color: 'from-violet-400 to-purple-500', bgColor: 'from-violet-500/20 to-purple-500/20', message: '잘했어요!' };
      if (acc >= 60) return { grade: 'B', color: 'from-yellow-400 to-orange-500', bgColor: 'from-yellow-500/20 to-orange-500/20', message: '조금 더 노력해봐요!' };
      return { grade: 'C', color: 'from-red-400 to-pink-500', bgColor: 'from-red-500/20 to-pink-500/20', message: '다시 복습해봐요!' };
    };
    const gradeInfo = getGradeInfo(accuracy);
    
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-lg">
          {/* Clean white card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
            {/* Grade badge */}
            <div className="relative mb-8">
              <div className={`w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br ${gradeInfo.bgColor} border border-slate-200 flex items-center justify-center shadow-lg`}>
                <div className={`text-5xl font-black bg-gradient-to-r ${gradeInfo.color} bg-clip-text text-transparent`}>
                  {gradeInfo.grade}
                </div>
              </div>
            </div>
            
            {/* Score ring */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <ProgressRing progress={accuracy} size="lg" />
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">시험 완료</h1>
              <p className={`text-lg font-medium bg-gradient-to-r ${gradeInfo.color} bg-clip-text text-transparent mb-1`}>
                {gradeInfo.message}
              </p>
              <p className="text-sm text-slate-500">
                {cardSet.title}
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-slate-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalCards}</div>
                <div className="text-xs text-slate-500">총 문제</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center shadow-sm">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-600">{correctCards.length}</div>
                <div className="text-xs text-slate-500">정답</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center shadow-sm">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-500">{incorrectCards.length}</div>
                <div className="text-xs text-slate-500">오답</div>
              </div>
            </div>
            
            {/* 틀린 단어 리스트 */}
            {incorrectWordsInfo.length > 0 && (
              <div className="mt-6 bg-white border border-red-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-bold text-slate-900">틀린 단어 ({incorrectWordsInfo.length}개)</h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {incorrectWordsInfo.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-red-600">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-900 truncate">{item.word.replace(/^\d+\.\s*/, '')}</p>
                        <p className="text-sm text-slate-500 truncate">{item.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleRestart} 
                variant="outline"
                className="flex-1 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                다시 학습
              </Button>
              <Link to="/" className="flex-1">
                <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/30">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  홈으로
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Subtle warm tint */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/60 via-transparent to-transparent"></div>
      </div>

      {/* Premium Header */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-indigo-50/50"></div>
        
        <div className="relative z-10 flex items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-slate-200 group-hover:border-slate-300 transition-all duration-300">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:block">돌아가기</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">
                {cardSet?.title || '학습 중'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {studyStarted && (
              <>
                {isAdmin && (
                  <Button 
                    onClick={handleRestart}
                    size="sm"
                    className="h-8 px-3 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-medium"
                  >
                    <RotateCcw className="w-3 h-3 mr-1.5" />
                    재출제
                  </Button>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <span className="text-xs font-bold text-blue-600">{currentIndex + 1}</span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="text-xs text-slate-500">{cardSet?.cards?.length || 0}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`relative z-10 w-full mx-auto px-3 max-w-md ${testType === 'card' ? 'py-2' : 'py-4'}`}>
        {/* Premium Day Selection Card */}
        <div className={testType === 'card' ? 'mb-2' : 'mb-4'}>
        <div className="relative bg-slate-950 rounded-2xl border border-white/10 ring-1 ring-amber-400/20 shadow-[0_0_0_1px_rgba(245,158,11,0.10),0_24px_60px_-28px_rgba(2,6,23,0.75)] overflow-hidden">
            {/* Editorial top hairline accent */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-amber-300/60 to-transparent" />
            {/* Gradient border glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(255,255,255,0.05) 50%, rgba(245,158,11,0.18) 100%)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
            {/* Subtle vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(251,191,36,0.07),transparent_60%)]" />

            {/* Collapsible Header */}
            <div 
              className={`relative flex items-center gap-3 cursor-pointer hover:bg-white/[0.03] transition-colors duration-200 ${testType === 'card' ? 'px-3.5 py-2.5' : 'px-4 py-3.5'}`}
              onClick={() => setIsDaySelectionCollapsed(!isDaySelectionCollapsed)}
            >
              <div className="relative">
                <div className={`rounded-xl bg-slate-900 ring-1 ring-white/10 flex items-center justify-center overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${testType === 'card' ? 'w-9 h-9' : 'w-11 h-11'}`}>
                  <img src={studyRangeIcon} alt="학습 범위" className={`object-contain ${testType === 'card' ? 'w-5 h-5' : 'w-6 h-6'}`} />
                </div>
                {selectedDays.length > 0 && (
                  <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-400 rounded-full flex items-center justify-center ring-2 ring-slate-950">
                    <span className="text-[9px] font-bold text-slate-900 tabular-nums font-mono">{selectedDays.length}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.22em] text-amber-400/80">Study Range</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <h3 className={`font-semibold text-white tracking-tight mt-0.5 ${testType === 'card' ? 'text-[13px]' : 'text-[14px]'}`}>학습 범위 설정</h3>
                <div className="flex items-center gap-2">
                  {selectedDays.length > 0 ? (
                    <span className="font-mono text-[10.5px] text-slate-300/90 tracking-tight truncate">DAY {(() => {
                      const days = selectedDays.slice(0, 3);
                      const grouped: Record<string, string[]> = {};
                      days.forEach(d => {
                        const partMatch = d.match(/^(.+):(\S+)$/);
                        if (partMatch) {
                          const part = partMatch[1];
                          const num = partMatch[2];
                          if (!grouped[part]) grouped[part] = [];
                          grouped[part].push(num);
                        } else {
                          if (!grouped['']) grouped[''] = [];
                          grouped[''].push(d);
                        }
                      });
                      const parts = Object.entries(grouped).map(([part, nums]) => 
                        part ? `${part}:${nums.join(', ')}` : nums.join(', ')
                      );
                      return parts.join(', ');
                    })()}{selectedDays.length > 3 ? ` +${selectedDays.length - 3}` : ''}</span>
                  ) : (
                    <span className="font-mono text-[10.5px] text-slate-500 tracking-tight">SELECT DAYS</span>
                  )}
                </div>
              </div>
              <div className={`w-7 h-7 rounded-lg bg-white/[0.04] ring-1 ring-white/10 flex items-center justify-center transition-transform duration-300 ${isDaySelectionCollapsed ? '' : 'rotate-180'}`}>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>


            {/* Hairline divider */}
            <div className={`h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-300 ${isDaySelectionCollapsed ? 'opacity-0' : 'opacity-100'}`} />
            
            {/* Collapsible Content */}
            <div className={`transition-all duration-300 ease-in-out ${isDaySelectionCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-none opacity-100'}`}>
              <div className="px-3.5 pb-3.5 pt-3 space-y-3">
                {/* Toolbar Row */}
                <div className="flex items-center justify-between gap-2">
                  <button 
                    onClick={() => setIsRandomOrder(!isRandomOrder)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[11px] font-medium tracking-tight ${
                      isRandomOrder 
                        ? 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30' 
                        : 'bg-white/5 text-slate-400 ring-1 ring-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Shuffle className="w-3 h-3" />
                    {isRandomOrder ? '랜덤' : '순서대로'}
                  </button>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowRangeInput(!showRangeInput)} 
                      className="h-7 px-2.5 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      범위설정
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedDays([])} 
                      className="h-7 px-2.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-full"
                    >
                      해제
                    </Button>
                    <span className="text-[10px] text-slate-500 ml-1 tabular-nums">{selectedDays.length}개</span>
                  </div>
                </div>

                {/* Range Input Panel */}
                {showRangeInput && (
                  <div className="p-2.5 bg-white/[0.03] rounded-xl ring-1 ring-white/10">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        placeholder="시작" 
                        value={rangeInputStart} 
                        onChange={e => setRangeInputStart(e.target.value)} 
                        className="w-16 h-8 px-2 text-xs font-semibold text-center ring-1 ring-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/60 bg-slate-950/60 text-slate-100 tabular-nums" 
                        min="1" 
                      />
                      <span className="text-xs font-medium text-slate-500">~</span>
                      <input 
                        type="number" 
                        placeholder="끝" 
                        value={rangeInputEnd} 
                        onChange={e => setRangeInputEnd(e.target.value)} 
                        className="w-16 h-8 px-2 text-xs font-semibold text-center ring-1 ring-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/60 bg-slate-950/60 text-slate-100 tabular-nums" 
                        min="1" 
                      />
                      <Button
                        size="sm" 
                        onClick={() => {
                          const start = parseInt(rangeInputStart);
                          const end = parseInt(rangeInputEnd);
                          if (!isNaN(start) && !isNaN(end) && start <= end) {
                            const rangeDays = availableDays.filter(day => {
                              const dayNum = parseInt(day);
                              return !isNaN(dayNum) && dayNum >= start && dayNum <= end;
                            });
                            setSelectedDays(rangeDays);
                            setShowRangeInput(false);
                            setRangeInputStart('');
                            setRangeInputEnd('');
                          }
                        }} 
                        className="h-8 px-3.5 text-[11px] font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg shadow-[0_2px_8px_-2px_rgba(255,255,255,0.3)]"
                      >
                        선택
                      </Button>
                    </div>
                  </div>
                )}

                {/* Day Selection Grid - Grouped by Sheet */}
                {(() => {
                  const normalizeDayNum = (dayStr: string): string => {
                    const num = parseInt(dayStr, 10);
                    return isNaN(num) ? dayStr : num.toString();
                  };
                  
                  const groupedDays: Record<string, string[]> = {};
                  const dayToFullLabel: Record<string, string> = {};
                  
                  allWordData.forEach((word: any) => {
                    const dayField = word.day?.toString() || '';
                    const sheetDayMatch = dayField.match(/^(?:\[([^\]]+)\]|([A-Za-z0-9]+))\s+(Day\s*\d+)/i);
                    if (sheetDayMatch) {
                      const sheetName = sheetDayMatch[1] || sheetDayMatch[2];
                      const dayPart = sheetDayMatch[3];
                      const dayNumMatch = dayPart.match(/\d+/);
                      if (dayNumMatch) {
                        const normalizedDay = normalizeDayNum(dayNumMatch[0]);
                        const fullLabel = `${sheetName} ${dayPart}`;
                        dayToFullLabel[normalizedDay] = fullLabel;
                        if (!groupedDays[sheetName]) {
                          groupedDays[sheetName] = [];
                        }
                        if (!groupedDays[sheetName].includes(normalizedDay)) {
                          groupedDays[sheetName].push(normalizedDay);
                        }
                      }
                    }
                  });
                  
                  const sheetKeys = Object.keys(groupedDays);
                  const hasMultipleSheets = sheetKeys.length > 1;
                  
                  if (hasMultipleSheets) {
                    return (
                      <div className="space-y-2">
                        {sheetKeys.map((sheetName, idx) => {
                          const days = groupedDays[sheetName].sort((a, b) => parseInt(a) - parseInt(b));
                          const sheetWordCount = days.reduce((acc, day) => {
                            const dayWords = allWordData.filter((word: any) => {
                              const dayField = word.day?.toString() || '';
                              const sheetDayMatch = dayField.match(/^(?:\[([^\]]+)\]|([A-Za-z0-9]+))\s+Day\s*(\d+)/i);
                              if (sheetDayMatch) {
                                return (sheetDayMatch[1] || sheetDayMatch[2]) === sheetName && normalizeDayNum(sheetDayMatch[3]) === day;
                              }
                              return false;
                            });
                            return acc + dayWords.length;
                          }, 0);
                          
                          return (
                            <div key={sheetName} className="p-2.5 rounded-2xl ring-1 ring-white/10 bg-white/[0.02]">
                              <div className="flex items-center justify-between mb-2 px-0.5">
                                <span className="font-semibold text-[11px] text-slate-200 tracking-tight">{sheetName}</span>
                                <span className="text-[10px] text-slate-500 tabular-nums">{sheetWordCount}개 단어</span>
                              </div>
                              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                                {days.map(day => {
                                  const dayWords = allWordData.filter((word: any) => {
                                    const dayField = word.day?.toString() || '';
                                     const sheetDayMatch = dayField.match(/^(?:\[([^\]]+)\]|([A-Za-z0-9]+))\s+Day\s*(\d+)/i);
                                     if (sheetDayMatch) {
                                       return (sheetDayMatch[1] || sheetDayMatch[2]) === sheetName && normalizeDayNum(sheetDayMatch[3]) === day;
                                    }
                                    return false;
                                  });
                                  const currentWordCount = dayWords.length;
                                  const dayKey = `${sheetName}:${day}`;
                                  const isSelected = selectedDays.includes(dayKey);
                                  
                                  return (
                                    <button 
                                      key={`${sheetName}-${day}`}
                                      onClick={() => toggleDay(day, sheetName)}
                                      className={`relative py-1.5 rounded-xl text-center transition-all duration-150 ${
                                        isSelected 
                                          ? 'bg-amber-400 text-slate-900 shadow-[0_4px_12px_-4px_rgba(251,191,36,0.6)] ring-1 ring-amber-300/60' 
                                          : 'bg-white/[0.04] ring-1 ring-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                                          <Check className="w-1.5 h-1.5 text-slate-900" strokeWidth={3} />
                                        </div>
                                      )}
                                      <span className="text-[11px] font-semibold tabular-nums">{day}</span>
                                      <span className={`block text-[8px] tabular-nums ${isSelected ? 'text-slate-700/80' : 'text-slate-500'}`}>{currentWordCount}</span>
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
                  
                  return (
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                      {availableDays.map(day => {
                        const dayWords = allWordData.filter((word: any) => {
                          const dayInWord = word.word && word.word.toString().toLowerCase().includes('day');
                          const dayInDay = word.day && word.day.toString().toLowerCase().includes('day');
                          const dayInMeaning = word.meaning && word.meaning.toString().toLowerCase().includes('day');
                          if (dayInWord) {
                            const match = word.word.toString().match(/day\s*(\d+)/i);
                            if (match) return normalizeDayNum(match[1]) === day;
                            return false;
                          } else if (dayInDay) {
                            const match = word.day.toString().match(/day\s*(\d+)/i);
                            if (match) return normalizeDayNum(match[1]) === day;
                            return false;
                          } else if (dayInMeaning) {
                            const match = word.meaning.toString().match(/day\s*(\d+)/i);
                            if (match) return normalizeDayNum(match[1]) === day;
                            return false;
                          } else if (word.day && /^\d+$/.test(word.day.toString())) {
                            return normalizeDayNum(word.day.toString()) === day;
                          }
                          return false;
                        });
                        
                        const currentWordCount = dayWords.length;
                        const isSelected = selectedDays.includes(day);
                        
                        return (
                          <button 
                            key={day} 
                            onClick={() => toggleDay(day)} 
                            className={`relative py-1.5 rounded-xl text-center transition-all duration-150 ${
                              isSelected 
                                ? 'bg-amber-400 text-slate-900 shadow-[0_4px_12px_-4px_rgba(251,191,36,0.6)] ring-1 ring-amber-300/60' 
                                : 'bg-white/[0.04] ring-1 ring-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                                <Check className="w-1.5 h-1.5 text-slate-900" strokeWidth={3} />
                              </div>
                            )}
                            <span className="text-[12px] font-semibold tabular-nums">{day.startsWith('Day') ? day.replace('Day', '').trim() : day}</span>
                            <span className={`block text-[8px] tabular-nums ${isSelected ? 'text-slate-700/80' : 'text-slate-500'}`}>{currentWordCount}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Start Section - Premium */}
                {selectedDays.length > 0 && (
                  <div className="relative mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/10">
                    <div className="relative flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 ring-1 ring-amber-400/30 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-amber-300" />
                        </div>
                        <div>
                          <span className="block text-[17px] font-semibold text-white tracking-tight tabular-nums leading-tight">
                            {selectedDays.reduce((sum, day) => {
                              const wordCount = dayWordCounts[day] || { total: 0, main: 0, derivative: 0 };
                              return sum + wordCount.total;
                            }, 0)}<span className="text-[12px] font-medium text-slate-400 ml-0.5">개</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">학습 단어</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && testType === 'card' && (
                          <Button 
                            onClick={handleGenerateImages}
                            disabled={isGeneratingImages}
                            size="sm"
                            className="h-9 px-3 bg-white/10 hover:bg-white/15 text-purple-200 ring-1 ring-purple-400/30 rounded-xl font-semibold text-[11px] border-0 tracking-tight"
                          >
                            {isGeneratingImages ? (
                              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{imageGenProgress.current}/{imageGenProgress.total}</>
                            ) : (
                              <><ImagePlus className="w-3.5 h-3.5 mr-1.5" />이미지생성</>
                            )}
                          </Button>
                        )}
                        {isAdmin && testType !== 'card' && (
                          <Button 
                            onClick={handleGenerateChoices}
                            disabled={isGeneratingChoices}
                            size="sm"
                            className="h-9 px-3 bg-white/10 hover:bg-white/15 text-amber-200 ring-1 ring-amber-400/30 rounded-xl font-semibold text-[11px] border-0 tracking-tight"
                          >
                            {isGeneratingChoices ? (
                              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{generatingProgress.current}/{generatingProgress.total}</>
                            ) : (
                              <><Wand2 className="w-3.5 h-3.5 mr-1.5" />선지생성</>
                            )}
                          </Button>
                        )}
                        <Button 
                          onClick={handleStartStudy} 
                          className="h-9 px-5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-[13px] border-0 shadow-[0_4px_14px_-4px_rgba(255,255,255,0.4)] tracking-tight"
                        >
                          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                          시작
                        </Button>
                      </div>
                    </div>
                    
                    {/* 실시간 진행 상태 표시 */}
                    {isGeneratingChoices && generatingProgress.total > 0 && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-950/40 ring-1 ring-amber-400/20">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-semibold text-amber-300 tracking-tight">선지 생성 중...</span>
                          <span className="text-[10px] font-bold text-amber-200 tabular-nums">
                            {generatingProgress.current} / {generatingProgress.total}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(generatingProgress.current / generatingProgress.total) * 100}%` }}
                          />
                        </div>
                        {generatingProgress.word && (
                          <p className="mt-1.5 text-[10px] text-slate-500 truncate">
                            현재: <span className="font-semibold text-slate-300">{generatingProgress.word}</span>
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Image generation progress */}
                    {isGeneratingImages && imageGenProgress.total > 0 && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-950/40 ring-1 ring-purple-400/20">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-semibold text-purple-300 tracking-tight">이미지 생성 중...</span>
                          <span className="text-[10px] font-bold text-purple-200 tabular-nums">
                            {imageGenProgress.current} / {imageGenProgress.total}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-400 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(imageGenProgress.current / imageGenProgress.total) * 100}%` }}
                          />
                        </div>
                        {imageGenProgress.word && (
                          <p className="mt-1.5 text-[10px] text-slate-500 truncate">
                            현재: <span className="font-semibold text-slate-300">{imageGenProgress.word}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Day 선택 안내 메시지 - Day가 선택되지 않았거나 단어가 없을 때 */}
        {(noDaysSelected || noCardsAvailable) && !studyStarted && (
          <div className="w-full max-w-md mx-auto mt-6 p-6 rounded-2xl bg-slate-900 border border-slate-700/50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800 border border-slate-600/50 flex items-center justify-center">
              <Layers className="w-6 h-6 text-slate-500" />
            </div>
            <h2 className="text-base font-bold text-slate-200 mb-1.5">
              {noDaysSelected ? 'Day를 선택해주세요' : '선택한 Day에 단어가 없습니다'}
            </h2>
            <p className="text-xs text-slate-500">
              {noDaysSelected ? '위의 Day 버튼을 눌러 학습할 범위를 선택하세요.' : '다른 Day를 선택해 주세요.'}
            </p>
          </div>
        )}

        {/* 카드 로드 에러 - Day가 선택되었지만 카드를 불러올 수 없을 때 */}
        {showCardError && (
          <div className="w-full max-w-md mx-auto mt-8 p-8 rounded-3xl bg-gradient-to-br from-red-50 via-orange-50/30 to-amber-50/50 border border-red-200/60 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">카드를 불러올 수 없습니다</h2>
            <p className="text-sm text-slate-500 mb-4">다시 시도해 주세요.</p>
            <Button onClick={handleRestart} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              다시 시작
            </Button>
          </div>
        )}

        {/* Premium Quiz Container */}
        {studyStarted && currentCard && (
          <>
            {/* Card study mode with AI images */}
            {testType === 'card' ? (
              showCardResult ? (
                /* Card swipe result screen */
                <div className="w-full max-w-md mx-auto">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                    {/* Summary */}
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-slate-800 mb-2">학습 완료!</h2>
                      <div className="flex justify-center gap-6 mt-4">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div className="text-lg font-bold text-emerald-600">{totalCards - unknownWords.length}</div>
                          <div className="text-xs text-slate-500">아는 단어</div>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="w-6 h-6 text-red-500" />
                          </div>
                          <div className="text-lg font-bold text-red-600">{unknownWords.length}</div>
                          <div className="text-xs text-slate-500">모르는 단어</div>
                        </div>
                      </div>
                    </div>

                    {/* Unknown words list */}
                    {unknownWords.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <X className="w-4 h-4 text-red-400" />
                          모르는 단어 ({unknownWords.length}개)
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {unknownWords.map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                              <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-red-600">{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-base font-bold text-slate-800">{item.word}</p>
                                  {item.phonetic && <span className="text-xs text-slate-400 font-mono">{item.phonetic}</span>}
                                </div>
                                <p className="text-sm text-slate-600">{item.meaning}</p>
                                {item.exampleEn && (
                                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.exampleEn.replace(/_/g, '')}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Re-study unknown words button */}
                        <Button
                          onClick={() => {
                            // Reconstruct cards from unknown words
                            const unknownCards = unknownWords.map((uw, idx) => {
                              const matchedCard = cardSet.cards.find((c: any) => 
                                String(c.word || '').toLowerCase() === uw.word.toLowerCase()
                              );
                              return matchedCard || {
                                id: `unknown-${idx}`,
                                word: uw.word,
                                meaning: uw.meaning,
                                phonetic: uw.phonetic || '',
                                exampleEn: uw.exampleEn || '',
                                exampleKr: uw.exampleKr || '',
                              };
                            });
                            setCardSet((prev: any) => prev ? { ...prev, cards: unknownCards } : null);
                            setCurrentIndex(0);
                            setIsFlipped(false);
                            setUnknownWords([]);
                            setShowCardResult(false);
                            setStudyStarted(true);
                          }}
                          className="w-full mt-4 h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-medium"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          모르는 단어만 다시 학습 ({unknownWords.length}개)
                        </Button>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={handleRestart}
                        variant="outline"
                        className="flex-1 h-11 rounded-xl text-sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        전체 다시 학습
                      </Button>
                      <Link to="/" className="flex-1">
                        <Button className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-sm">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          홈으로
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  {/* Progress bar */}
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-[9px] font-mono tracking-[0.22em] uppercase text-neutral-400">Progress</span>
                    <div className="flex-1 h-[3px] bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-neutral-950 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex) / totalCards) * 100}%` }}
                      />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-950 text-white text-[10.5px] font-mono tabular-nums tracking-[0.06em]">
                      {String(currentIndex + 1).padStart(2, '0')}/{String(totalCards).padStart(2, '0')}
                    </span>
                  </div>


                  <ImageStudyCard
                    key={`${quizKey}-${currentIndex}`}
                    word={String(currentCard.word || '')}
                    meaning={String(currentCard.meaning || '')}
                    phonetic={String(currentCard.phonetic || '')}
                    exampleEn={String(currentCard.exampleEn || '')}
                    exampleKr={String(currentCard.exampleKr || '')}
                    imageUrl={String(wordImageUrls[String(currentCard.word || '').toLowerCase()] || currentCard.imageUrl || '')}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(!isFlipped)}
                    onSwipeLeft={() => {
                      // Unknown word
                      setUnknownWords(prev => [...prev, {
                        word: String(currentCard.word || ''),
                        meaning: String(currentCard.meaning || ''),
                        phonetic: String(currentCard.phonetic || ''),
                        exampleEn: String(currentCard.exampleEn || ''),
                        exampleKr: String(currentCard.exampleKr || ''),
                      }]);
                      if (currentIndex < totalCards - 1) {
                        setCurrentIndex(prev => prev + 1);
                        setIsFlipped(false);
                      } else {
                        setShowCardResult(true);
                      }
                    }}
                    onSwipeRight={() => {
                      // Known word
                      if (currentIndex < totalCards - 1) {
                        setCurrentIndex(prev => prev + 1);
                        setIsFlipped(false);
                      } else {
                        setShowCardResult(true);
                      }
                    }}
                  />
                </div>
              )
            ) : testType === 'synonym_antonym' ? (
              <SynonymAntonymQuiz
                key={`${quizKey}-${currentIndex}`}
                word={currentCard.word}
                meaning={currentCard.meaning}
                synonyms={currentCard.synonyms}
                antonyms={currentCard.antonyms}
                onAnswer={handleAnswer}
                onSkipPrevious={currentIndex > 0 ? handleSkipPrevious : undefined}
                onSkipNext={currentIndex < totalCards - 1 ? handleSkipNext : undefined}
                className="w-full font-body"
                isLastQuestion={currentIndex === totalCards - 1}
                currentQuestion={currentIndex + 1}
                totalQuestions={totalCards}
              />
            ) : testType === 'meaning' || (cardSet.testType !== 'sentence' && cardSet.testType !== 'reverse' && cardSet.testType !== 'spelling' && cardSet.testType !== 'example' && cardSet.testType !== 'definition') ? (
              <MultipleChoiceQuiz 
                key={`${quizKey}-${currentIndex}`}
                word={currentCard.front} 
                meaning={currentCard.back} 
                type="meaning" 
                onAnswer={handleAnswer}
                onSkipPrevious={currentIndex > 0 ? handleSkipPrevious : undefined}
                onSkipNext={currentIndex < totalCards - 1 ? handleSkipNext : undefined}
                className="w-full font-body" 
                isLastQuestion={currentIndex === totalCards - 1} 
                currentQuestion={currentIndex + 1} 
                totalQuestions={totalCards} 
              />
            ) : (
              /* Original container for other modes */
              <div className="w-full">
                <div className="editorial-card w-full">
                  {/* Quiz content */}
                  <div className="relative z-10 w-full">
                    {cardSet.testType === 'sentence' ? (
                      <SentenceQuiz 
                        key={`${quizKey}-${currentIndex}`}
                        koreanSentence={currentCard.korean} 
                        englishWords={currentCard.englishWords} 
                        onAnswer={handleAnswer} 
                        className="w-full font-body" 
                      />
                    ) : cardSet.testType === 'reverse' ? (
                      <SpellingQuiz 
                        key={`${quizKey}-${currentIndex}`}
                        meaning={currentCard.meaning} 
                        correctWord={currentCard.word} 
                        onAnswer={handleAnswer} 
                        className="w-full font-body" 
                        currentQuestion={currentIndex + 1} 
                        totalQuestions={totalCards} 
                      />
                    ) : cardSet.testType === 'spelling' ? (
                      <MultipleChoiceQuiz 
                        key={`${quizKey}-${currentIndex}`}
                        word={currentCard.word} 
                        meaning={currentCard.meaning} 
                        example={currentCard.example} 
                        type="example" 
                        onAnswer={handleAnswer}
                        onSkipPrevious={currentIndex > 0 ? handleSkipPrevious : undefined}
                        onSkipNext={currentIndex < totalCards - 1 ? handleSkipNext : undefined}
                        className="w-full font-body" 
                        isLastQuestion={currentIndex === totalCards - 1} 
                        currentQuestion={currentIndex + 1} 
                        totalQuestions={totalCards} 
                      />
                    ) : cardSet.testType === 'example' ? (
                      <MultipleChoiceQuiz 
                        key={`${quizKey}-${currentIndex}`}
                        word={currentCard.word} 
                        meaning={currentCard.meaning} 
                        example={currentCard.example} 
                        type="example" 
                        onAnswer={handleAnswer}
                        onSkipPrevious={currentIndex > 0 ? handleSkipPrevious : undefined}
                        onSkipNext={currentIndex < totalCards - 1 ? handleSkipNext : undefined}
                        className="w-full font-body" 
                        isLastQuestion={currentIndex === totalCards - 1} 
                        currentQuestion={currentIndex + 1} 
                        totalQuestions={totalCards} 
                      />
                    ) : cardSet.testType === 'definition' ? (
                      <DefinitionQuiz 
                        key={`${quizKey}-${currentIndex}`}
                        word={currentCard.word} 
                        meaning={currentCard.meaning}
                        englishDefinition={currentCard.englishDefinition}
                        onAnswer={handleAnswer}
                        currentQuestion={currentIndex + 1}
                        totalQuestions={totalCards} 
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}