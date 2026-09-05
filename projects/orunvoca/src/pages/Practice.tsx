import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudyCard } from "@/components/ui/study-card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, ArrowLeft as PrevIcon, RotateCcw, Volume2, Star, ChevronDown } from "lucide-react";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import usFlag from "@/assets/us-flag.png";
import ukFlag from "@/assets/uk-flag.png";
import headerLogo from "@/assets/orun-academy-header-logo.jpg";
import { initializeAudioContext } from "@/utils/sound-effects";
import { isIOS, playBase64AudioWebAudio } from "@/utils/audio";
import { isStudentLoggedIn } from "@/utils/student-auth";
interface Word {
  id: string;
  word: string;
  meaning: string;
  day: string;
}
interface PronunciationInfo {
  ipa: string;
  korean: string;
}
export default function Practice() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    toast
  } = useToast();
  const [cardSet, setCardSet] = useState<any>(null);
  const [allWordData, setAllWordData] = useState<any[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [dayWordCounts, setDayWordCounts] = useState<Record<string, {
    total: number;
    main: number;
    derivative: number;
  }>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealLevel, setRevealLevel] = useState([0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRandomOrder, setIsRandomOrder] = useState(false);
  // 파생어 개념 제거됨 - 모든 단어가 표제어로 처리됨
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [isDaySelectionOpen, setIsDaySelectionOpen] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [showRangeInput, setShowRangeInput] = useState(false);
  const [rangeInputStart, setRangeInputStart] = useState('');
  const [rangeInputEnd, setRangeInputEnd] = useState('');
  const [pronunciationData, setPronunciationData] = useState<{
    [key: string]: PronunciationInfo;
  }>({});
  const [loadingPronunciation, setLoadingPronunciation] = useState<{
    [key: string]: boolean;
  }>({});
  const [refreshingAllPronunciations, setRefreshingAllPronunciations] = useState(false);
  // 기본적인 영어-한국어 매핑 함수 (능률 고교필수2000 전체 대응)
  const getBasicKoreanMeaning = (englishWord: string, originalItem?: any): string => {
    const basicMappings: Record<string, string> = {
      // A
      'abandon': '포기하다',
      'abbreviate': '줄이다',
      'abbreviation': '줄임말',
      'abdomen': '복부',
      'abdominal': '복부의',
      'abhor': '혐오하다',
      'abhorrence': '혐오',
      'abhorrent': '혐오스러운',
      'ability': '능력',
      'abnormal': '비정상적인',
      'abnormality': '비정상',
      'abolish': '폐지하다',
      'abound': '풍부하다',
      'abrupt': '갑작스러운',
      'abruptly': '갑자기',
      'absolute': '절대적인',
      'absolutely': '절대적으로',
      'absorb': '흡수하다',
      'absorption': '흡수',
      'abstain': '금하다',
      'abstract': '추상적인',
      'absurd': '터무니없는',
      'absurdity': '터무니없음',
      'abundance': '풍부',
      'abundant': '풍부한',
      'abuse': '남용하다',
      'accelerate': '가속하다',
      'acceleration': '가속',
      'accelerator': '가속기',
      'access': '접근',
      'accessible': '접근 가능한',
      'accommodate': '수용하다',
      'accommodation': '숙박',
      'accompany': '동행하다',
      'accomplish': '달성하다',
      'accomplishment': '성취',
      'accord': '일치',
      'accordance': '일치',
      'accordingly': '따라서',
      'according to': '~에 따르면',
      'account': '계정',
      'accumulate': '축적하다',
      'accumulation': '축적',
      'accumulative': '누적의',
      'accuracy': '정확성',
      'accurate': '정확한',
      'accurately': '정확하게',
      'accusation': '고발',
      'accuse': '고발하다',
      'accuse A of B': 'A를 B로 고발하다',
      'accustomed': '익숙한',
      'acid': '산',
      'acid rain': '산성비',
      'acknowledge': '인정하다',
      'acknowledg(e)ment': '인정',
      'acoustic': '음향의',
      'acquaint': '알게 하다',
      'acquaintance': '지인',
      'acquainted': '친숙한',
      'acquire': '얻다',
      'acquisition': '획득',
      'act for': '~을 대신하다',
      'action': '행동',
      'activate': '활성화하다',
      'activation': '활성화',
      'active': '활동적인',
      'activity': '활동',
      'act on': '~에 작용하다',
      'acute': '급성의',
      'adapt': '적응하다',
      'adaptation': '적응',
      'adaptive': '적응하는',
      'addict': '중독자',
      'addicted': '중독된',
      'addiction': '중독',
      'adequate': '적절한',
      'adequately': '적절하게',
      'adhere': '고수하다',
      'adherence': '고수',
      'adherent': '지지자',
      'adhere to': '~을 고수하다',
      'adhesion': '접착',
      'adhesive': '접착제',
      'adjust': '조정하다',
      'adjustment': '조정',
      'administer': '관리하다',
      'administration': '행정',
      'administrative': '행정의',
      'admirable': '감탄할만한',
      'admiration': '감탄',
      'admire': '감탄하다',
      'admission': '입학',
      'admit': '인정하다',
      'adolescence': '청소년기',
      'adolescent': '청소년',
      'adopt': '채택하다',
      'adoption': '입양',
      'adoptive': '입양의',
      'adorable': '사랑스러운',
      'adore': '사랑하다',
      'adverse': '불리한',
      'adversely': '불리하게',
      'adversity': '역경',
      'advocacy': '옹호',
      'advocate': '옹호하다',
      'aesthetic': '미적인',
      'affair': '일',
      'affect': '영향을 주다',
      'affection': '애정',
      'affectionate': '애정어린',
      'affiliate': '가입시키다',
      'affiliation': '가입',
      'affirm': '단언하다',
      'affirmation': '단언',
      'affirmative': '긍정적인',
      'afflict': '괴롭히다',
      'affliction': '고통',
      'affluence': '풍요',
      'affluent': '풍요로운',
      'affluently': '풍요롭게',
      'afford': '여유가 있다',
      'affordable': '감당할 수 있는',
      'agency': '기관',
      'agent': '대리인',
      'aggression': '공격',
      'aggressive': '공격적인',
      'agonize': '고민하다',
      'agony': '고통',
      'a great deal of': '많은',
      'agriculture': '농업',
      'ailment': '질병',
      'alchemist': '연금술사',
      'alert': '경고하다',
      'alien': '외국인',
      'allergic': '알레르기의',
      'allergy': '알레르기',
      'alleviate': '완화하다',
      'alliance': '동맹',
      'allocate': '할당하다',
      'allocate A to B': 'A를 B에 할당하다',
      'allot': '할당하다',
      'allotment': '할당',
      'ally': '동맹국',
      'alter': '바꾸다',
      'alternate': '교대의',
      'alternative': '대안',
      'altitude': '고도',
      'ambassador': '대사',
      'ambassadorial': '대사의',
      'ambiguity': '모호함',
      'ambiguous': '모호한',
      'ambition': '야망',
      'ambitious': '야심찬',
      'amend': '수정하다',
      'amendment': '수정',
      'amount to': '~에 달하다',
      'ample': '충분한',
      'amplify': '증폭하다',
      'analysis': '분석',
      'analytical': '분석적인',
      'analyze': '분석하다',
      'anatomy': '해부학',
      'ancestor': '조상',
      'announce': '발표하다',
      'announcement': '발표',
      'annoy': '성가시게 하다',
      'annoyed': '짜증난',
      'annoying': '성가신',
      'annual': '매년의',
      'anonymity': '익명',
      'anonymous': '익명의',
      'anonymously': '익명으로',
      'antarctic': '남극의',
      'anthropologist': '인류학자',
      'anthropology': '인류학',
      'antibiotic': '항생제',
      'anticipate': '예상하다',
      'anticipation': '예상',
      'antipathy': '반감',
      'antonym': '반의어',
      // Day 01 단어들 (능률 고교필수2000 - 중복 제거)
      'fair': '공정한',
      'fairly': '공정하게',
      'fairness': '공정함',
      'merely': '단지',
      'mere': '단순한',
      // 추가 보강: Day 01 관련 기본 단어들 (누락 보완)
      'comfort': '위로하다; 편안함',
      'comfortable': '편안한',
      'comforting': '위로가 되는',
      'comfortably': '편안하게',
      'import': '수입하다',
      'register': '등록하다',
      'include': '포함하다',
      'exclude': '제외하다',
      'approach': '접근하다',
      'appoint': '임명하다',
      'locate': '위치시키다',
      'originate': '기원하다',
      'aware': '알고 있는',
      'caution': '주의',
      'barrier': '장벽',
      'breed': '번식하다',
      'importer': '수입업자',
      'importable': '수입 가능한',
      'registration': '등록',
      'installation': '설치',
      'promotion': '승진; 촉진',
      'predict': '예측하다',
      'the accused': '피고인',
      'inclusion': '포함',
      'including': '~을 포함하여',
      'exclusion': '제외',
      'excluding': '~을 제외하고',
      'variation': '변화',
      'variety': '다양성',
      'nevertheless': '그럼에도 불구하고',
      'reliable': '신뢰할 수 있는',
      'rely': '의존하다',
      'reliance': '의존',
      'predictable': '예측 가능한',
      'install': '설치하다',
      'variable': '변수',
      'vary': '다양하다',
      'various': '다양한',
      'varied': '다양한',
      'handle': '다루다',
      'celebrity': '유명인',
      'be aware of': '~을 알고 있다',
      'with caution': '조심하여',
      // Day 02 단어들 (기존)
      'commit': '저지르다',
      'commitment': '약속',
      'hence': '따라서',
      'theorize': '이론화하다',
      'theory': '이론',
      'assert': '주장하다',
      'assertion': '주장',
      'distribute': '분배하다',
      'distribution': '분배',
      'steep': '가파른',
      'steeply': '가파르게',
      'former': '이전의',
      'latter': '후자의',
      'perceive': '인지하다',
      'perception': '인식',
      'perceptive': '인지력이 있는',
      'combine': '결합하다',
      'combination': '결합',
      // 추가 기본 단어들 (중복 제거됨)
      'able': '할 수 있는',
      'about': '~에 대하여',
      'above': '위에',
      'abroad': '해외에',
      'academic': '학문의',
      'accept': '받아들이다',
      'accident': '사고',
      'accidental': '우연한',
      'accidentally': '우연히',
      'achieve': '달성하다',
      'across': '가로질러',
      'actual': '실제의',
      'actually': '실제로',
      'address': '주소',
      'advance': '발전하다',
      'advantage': '이점',
      'adventure': '모험',
      'advertisement': '광고',
      'advice': '조언',
      'adviser': '조언자',
      'afraid': '두려워하는',
      'afternoon': '오후',
      'afterwards': '그 후에',
      'again': '다시',
      'against': '~에 반대하여',
      'age': '나이',
      'aged': '나이든',
      'ago': '전에',
      'agree': '동의하다',
      'agreement': '동의',
      'ahead': '앞에',
      'aid': '도움',
      'aim': '목표',
      'air': '공기',
      'aircraft': '항공기',
      'airline': '항공사',
      'airport': '공항',
      'alarm': '경보',
      'album': '앨범',
      'alcohol': '알코올',
      'alive': '살아있는',
      'all': '모든',
      'allow': '허용하다',
      'almost': '거의',
      'alone': '혼자',
      'along': '~을 따라',
      'already': '이미',
      'also': '또한',
      'although': '비록',
      'altogether': '모두',
      'always': '항상',
      'amazing': '놀라운',
      'ambulance': '구급차',
      'among': '~사이에',
      'amount': '양',
      'amuse': '즐겁게 하다',
      'ancient': '고대의',
      'anger': '분노',
      'angle': '각도',
      'angry': '화난',
      'animal': '동물',
      'ankle': '발목',
      'anniversary': '기념일',
      'another': '다른',
      'answer': '답하다',
      'anxious': '걱정하는',
      'any': '어떤',
      'anybody': '누구든지',
      'anymore': '더 이상',
      'anyone': '누구든지',
      'anything': '무엇이든',
      'anyway': '어쨌든',
      'anywhere': '어디든지',
      'apart': '떨어져',
      'apartment': '아파트',
      'apologize': '사과하다',
      'apology': '사과',
      'appear': '나타나다',
      'appearance': '외모',
      'apple': '사과',
      'application': '지원서',
      'apply': '지원하다',
      'appreciate': '감사하다',
      'appropriate': '적절한',
      'approval': '승인',
      'approve': '승인하다',
      'approximately': '대략',
      'april': '4월',
      'architect': '건축가',
      'architecture': '건축',
      'area': '지역',
      'argue': '논쟁하다',
      'argument': '논쟁',
      'arise': '일어나다',
      'arm': '팔',
      'army': '군대',
      'around': '주위에',
      'arrange': '정리하다',
      'arrangement': '정리',
      'arrest': '체포하다',
      'arrival': '도착',
      'arrive': '도착하다',
      'arrow': '화살',
      'art': '예술',
      'article': '기사',
      'artificial': '인공의',
      'artist': '예술가',
      'artistic': '예술적인',
      'as': '~처럼',
      'ashamed': '부끄러운',
      'aside': '옆으로',
      'ask': '묻다',
      'asleep': '잠든',
      'aspect': '측면',
      'assist': '돕다',
      'assistance': '도움',
      'assistant': '조수',
      'associate': '연관시키다',
      'association': '협회',
      'assume': '가정하다',
      'astonish': '놀라게 하다',
      'at': '~에',
      'athlete': '운동선수',
      'athletic': '운동의',
      'atmosphere': '분위기',
      'atomic': '원자의',
      'attach': '붙이다',
      'attack': '공격하다',
      'attempt': '시도하다',
      'attend': '참석하다',
      'attention': '주의',
      'attitude': '태도',
      'attract': '끌다',
      'attraction': '매력',
      'attractive': '매력적인',
      'audience': '관객',
      'august': '8월',
      'aunt': '이모',
      'author': '작가',
      'authority': '권위',
      'automatic': '자동의',
      'automobile': '자동차',
      'autumn': '가을',
      'available': '이용 가능한',
      'average': '평균',
      'avoid': '피하다',
      'awake': '깨어 있는',
      'award': '상',
      'away': '떨어져서',
      'awful': '끔찍한'
    };
    const mapped = basicMappings[englishWord.toLowerCase()];
    if (mapped) return mapped;
    console.log(`매핑되지 않은 단어: ${englishWord}`);

    // 원본 데이터에서 한글 의미를 찾으려고 시도
    if (originalItem) {
      // 능률 고교필수2000의 경우 다른 필드에 한글 의미가 있을 수 있음
      if (originalItem.korean_meaning) return originalItem.korean_meaning;
      if (originalItem.definition) return originalItem.definition;
      if (originalItem.translation) return originalItem.translation;
    }

    // 매핑되지 않은 경우 "[단어] (뜻 없음)" 형태로 표시
    return `${englishWord} (한글 의미 없음)`;
  };
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
          setCardSet(data);

          // Convert database format to study format
          const wordData = Array.isArray(data.word_data) ? data.word_data : [];

          // 🔧 **능률 고교필수2000 데이터 구조 정규화** 
          console.log('능률 고교필수2000 샘플 데이터:', wordData.slice(0, 5));
          const normalizedWordData = wordData.map((item: any) => {
            // "능률 고교필수2000" 특수 케이스 처리
            if (data.title?.includes("능률") || data.title?.includes("고교필수")) {
              // 실제 데이터 구조 확인: {"day": "표제어", "word": "Day 01", "meaning": "fair"}
              console.log('원본 아이템:', item);

              // 표제어 또는 파생어 모두 정규화
              if ((item.day === "표제어" || item.day === "파생어") && item.word?.toString().toLowerCase().includes('day')) {
                const englishWord = item.meaning; // 실제 영어 단어
                const dayInfo = item.word; // "Day 01" 형태
                const wordType = item.day; // "표제어" 또는 "파생어"

                // 한국어 뜻 매핑 - 실제 영어 단어를 기반으로
                const koreanMeaning = getBasicKoreanMeaning(englishWord, item);
                console.log(`정규화: ${englishWord} (${wordType}) -> ${koreanMeaning}`);
                return {
                  ...item,
                  word: englishWord,
                  // 영어 단어
                  meaning: koreanMeaning,
                  // 한국어 뜻
                  day: dayInfo,
                  // "Day 01" 형태
                  type: wordType,
                  // 표제어/파생어 정보 보존
                  original_meaning: item.meaning // 원본 meaning 보존 (디버깅용)
                };
              }
            }
            return item; // 정상적인 데이터는 그대로 반환
          });
          console.log('정규화 전 첫 번째 데이터:', wordData[0]);
          console.log('정규화 후 첫 번째 데이터:', normalizedWordData[0]);

          // 파생어 개념 제거됨 - 모든 단어가 표제어로 처리
          // Set all word data and available days
          setAllWordData(normalizedWordData);

          // Helper function to normalize day number (removes leading zeros for consistent comparison)
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

          // Pre-calculate word counts for each day
          const wordCounts: Record<string, {
            total: number;
            main: number;
            derivative: number;
          }> = {};
          // MD보카인지 확인
          const isMDVocab = data.title?.includes("MD") || data.title?.includes("md");
          dayNumbers.forEach((day: string) => {
            // Day 매칭을 포맷 무관하게 처리
            const extractDay = (val: any) => {
              if (!val) return '';
              const str = val.toString();
              const m = str.match(/day\s*(\d+)/i);
              if (m) return normalizeDayNum(m[1]);
              // 숫자만 있는 경우
              if (/^\d+$/.test(str)) return normalizeDayNum(str);
              return '';
            };
            const dayWords = normalizedWordData.filter((w: any) => {
              const d1 = extractDay(w.word);
              const d2 = extractDay(w.day);
              const d3 = extractDay(w.meaning);
              const matched = [d1, d2, d3].find(dn => dn === day);
              return !!matched;
            });

            // 모든 단어를 표제어로 처리 (파생어 개념 제거)
            wordCounts[day] = {
              total: dayWords.length,
              main: dayWords.length,
              derivative: 0
            };
          });
          setDayWordCounts(wordCounts);

          // Initialize with first day selected by default
          console.log('사용 가능한 DAY들:', dayNumbers);
          console.log('시트 정보:', sheetNames, '시트가 여러 개:', hasMultipleSheets);
          let initialSelectedDays: string[] = [];
          if (hasMultipleSheets && sheetNames.length > 0) {
            // 시트가 여러 개인 경우: 첫 번째 시트의 첫 번째 Day를 "시트명:day" 형식으로 설정
            const firstSheet = sheetNames.sort()[0];
            const firstSheetDays = Array.from(sheetDayGroups[firstSheet]).sort((a, b) => parseInt(a) - parseInt(b));
            if (firstSheetDays.length > 0) {
              initialSelectedDays = [`${firstSheet}:${firstSheetDays[0]}`];
            }
          } else if (dayNumbers.length > 0) {
            // 시트가 하나이거나 없는 경우: 기존 로직
            initialSelectedDays = [dayNumbers[0]];
          }
          console.log('초기 선택된 DAY:', initialSelectedDays);
          setSelectedDays(initialSelectedDays);

          // 학생으로 로그인한 경우 Day 선택 창을 자동으로 접기
          if (isStudentLoggedIn()) {
            setIsDaySelectionOpen(false);
          }

          // Update words with filtered data
          updateWordsFromSelection(normalizedWordData, initialSelectedDays, isRandomOrder);
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

  // Update words when selection changes
  useEffect(() => {
    if (allWordData.length > 0) {
      updateWordsFromSelection(allWordData, selectedDays, isRandomOrder);
    }
  }, [selectedDays, isRandomOrder, allWordData]);
  const updateWordsFromSelection = (wordData: any[], days: string[], random: boolean) => {
    // Helper function to normalize day number (consistent with Study.tsx)
    const normalizeDayNum = (dayStr: string): string => {
      const num = parseInt(dayStr, 10);
      return isNaN(num) ? dayStr : num.toString();
    };
    let filteredWords = wordData.filter((word: any) => {
      const dayField = word.day?.toString() || '';

      // 시트:day 형식 체크 (예: "P1 Day 1", "[Part 1] DAY 01")
      const sheetDayMatch = dayField.match(/^(?:\[([^\]]+)\]|([A-Za-z0-9]+))\s+Day\s*(\d+)/i);
      if (sheetDayMatch) {
        const sheetName = sheetDayMatch[1] || sheetDayMatch[2];
        const dayNum = normalizeDayNum(sheetDayMatch[3]);
        const key = `${sheetName}:${dayNum}`;
        return days.includes(key);
      }

      // 단순 day 형식 (시트가 하나일 때)
      const extractDay = (val: any) => {
        if (!val) return '';
        const str = val.toString();
        const m = str.match(/day\s*(\d+)/i);
        if (m) return normalizeDayNum(m[1]);
        if (/^\d+$/.test(str)) return normalizeDayNum(str);
        return '';
      };
      const dayNum = extractDay(word.word) || extractDay(word.day) || extractDay(word.meaning);
      const isInSelectedDay = dayNum ? days.includes(dayNum) : false;
      return isInSelectedDay;
    });

    // 모든 단어가 표제어로 처리됨 (파생어 필터링 제거)

    if (random) {
      filteredWords = [...filteredWords].sort(() => Math.random() - 0.5);
    }
    setWords(filteredWords as unknown as Word[]);
    setCurrentIndex(0);
    setRevealLevel([0]);
  };
  const cleanMeaning = (meaning: string) => {
    return meaning.replace(/\[명\]|\[동\]|\[부\]|\[형\]|\[숫\]|\[감\]|\[대\]|\[접\]|\[관\]|\[조\]/g, '').trim();
  };
  const getRevealedMeaning = (meaning: string, level: number) => {
    if (level === 0) return "";
    const cleanedMeaning = cleanMeaning(meaning);
    const length = cleanedMeaning.length;
    const revealCount = Math.floor(length * level / 100);
    return cleanedMeaning.substring(0, revealCount) + "●".repeat(length - revealCount);
  };

  // 단어 길이에 따른 폰트 크기 자동 조절
  const getWordFontSize = (word: string) => {
    const length = word.length;
    if (length <= 10) return "text-xl sm:text-2xl md:text-3xl";
    if (length <= 15) return "text-lg sm:text-xl md:text-2xl";
    if (length <= 20) return "text-base sm:text-lg md:text-xl";
    return "text-sm sm:text-base md:text-lg";
  };

  // Helper functions to get filtered words
  const getFilteredWords = () => {
    return words; // words는 이미 선택된 days와 파생어 설정에 따라 필터링됨
  };
  const handleNextWord = () => {
    const filteredWords = getFilteredWords();
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRevealLevel([0]);
    }
  };
  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setRevealLevel([0]);
    }
  };

  // Load and generate pronunciation data for all words at once
  useEffect(() => {
    const loadAndGenerateAllPronunciationData = async () => {
      const filteredWords = getFilteredWords();
      if (filteredWords.length === 0) return;
      const wordList = filteredWords.map(w => w.word.toLowerCase());

      // First, load cached data
      const {
        data: cachedData
      } = await supabase.from('pronunciation_cache').select('*').in('word', wordList);
      const cachedWords = new Set(cachedData?.map(item => item.word) || []);
      const wordsToGenerate = filteredWords.filter(w => !cachedWords.has(w.word.toLowerCase()));

      // Update state with cached data
      if (cachedData) {
        const pronunciationMap: {
          [key: string]: PronunciationInfo;
        } = {};
        cachedData.forEach(item => {
          const originalWord = filteredWords.find(w => w.word.toLowerCase() === item.word)?.word || item.word;
          pronunciationMap[originalWord] = {
            ipa: item.ipa || '/ˈwɜːrd/',
            korean: item.korean || '발음 정보 없음'
          };
        });
        setPronunciationData(pronunciationMap);
      }

      // Generate pronunciation data for words not in cache - PARALLEL PROCESSING
      if (wordsToGenerate.length > 0) {
        console.log(`Generating pronunciation for ${wordsToGenerate.length} words in parallel...`);

        // Process in batches of 5 for better performance
        const batchSize = 5;
        const batches = [];
        for (let i = 0; i < wordsToGenerate.length; i += batchSize) {
          batches.push(wordsToGenerate.slice(i, i + batchSize));
        }
        for (const batch of batches) {
          const results = await Promise.all(batch.map(async word => {
            try {
              // Add timeout of 3 seconds
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);
              const {
                data,
                error
              } = await supabase.functions.invoke('get-pronunciation-info', {
                body: {
                  word: word.word
                }
              });
              clearTimeout(timeoutId);
              const pronunciationInfo: PronunciationInfo = error || !data ? {
                ipa: '/ˈwɜːrd/',
                korean: '발음 정보 없음'
              } : {
                ipa: data.ipa || '/ˈwɜːrd/',
                korean: data.korean || '발음 정보 없음'
              };

              // Save to cache (fire and forget)
              supabase.from('pronunciation_cache').upsert({
                word: word.word.toLowerCase(),
                ipa: pronunciationInfo.ipa,
                korean: pronunciationInfo.korean
              }).then(() => {});
              return {
                word: word.word,
                data: pronunciationInfo
              };
            } catch (error) {
              console.error(`Error generating pronunciation for ${word.word}:`, error);
              const fallbackData = {
                ipa: '/ˈwɜːrd/',
                korean: '발음 정보 없음'
              };

              // Save fallback to cache (fire and forget)
              supabase.from('pronunciation_cache').upsert({
                word: word.word.toLowerCase(),
                ipa: fallbackData.ipa,
                korean: fallbackData.korean
              }).then(() => {});
              return {
                word: word.word,
                data: fallbackData
              };
            }
          }));

          // Batch update state
          setPronunciationData(prev => {
            const newData = {
              ...prev
            };
            results.forEach(result => {
              newData[result.word] = result.data;
            });
            return newData;
          });
        }
        console.log('All pronunciation data generated and saved!');
      }
    };
    loadAndGenerateAllPronunciationData();
  }, [words, selectedDays]);
  const getCurrentWord = () => {
    const filteredWords = getFilteredWords();
    return filteredWords[currentIndex];
  };
  const handleDayChange = (day: string, sheetName?: string) => {
    // 시트가 여러 개일 때는 "시트명:day" 형식으로 저장
    const key = sheetName ? `${sheetName}:${day}` : day;
    setSelectedDays(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]);
    setCurrentIndex(0);
    setRevealLevel([0]);
  };
  const handleReset = () => {
    setCurrentIndex(0);
    setRevealLevel([0]);
    setFlippedCard(null);
  };
  const handleCardFlip = async (index: number) => {
    setFlippedCard(flippedCard === index ? null : index);
  };
  const fetchPronunciationInfo = async (word: string, forceRefresh = false) => {
    if ((pronunciationData[word] || loadingPronunciation[word]) && !forceRefresh) return;
    setLoadingPronunciation(prev => ({
      ...prev,
      [word]: true
    }));
    try {
      // First check the cache
      const {
        data: cachedData
      } = await supabase.from('pronunciation_cache').select('*').eq('word', word.toLowerCase()).maybeSingle();
      if (cachedData && !forceRefresh) {
        // Use cached data
        setPronunciationData(prev => ({
          ...prev,
          [word]: {
            ipa: cachedData.ipa || '/ˈwɜːrd/',
            korean: cachedData.korean || '발음 정보 없음'
          }
        }));
        return;
      }

      // If not in cache or forced refresh, get pronunciation from GPT
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke('get-pronunciation-info', {
          body: {
            word
          }
        });
        if (error) throw error;
        const pronunciationInfo = {
          ipa: data.ipa || '/ˈwɜːrd/',
          korean: data.korean || '발음 정보 없음'
        };

        // Save to cache
        await supabase.from('pronunciation_cache').upsert({
          word: word.toLowerCase(),
          ipa: pronunciationInfo.ipa,
          korean: pronunciationInfo.korean
        });
        setPronunciationData(prev => ({
          ...prev,
          [word]: pronunciationInfo
        }));
        if (forceRefresh) {
          // Removed toast notification
        }
      } catch (apiError) {
        console.error('GPT API Error:', apiError);

        // If GPT API fails but we have cache data, use it
        if (cachedData) {
          setPronunciationData(prev => ({
            ...prev,
            [word]: {
              ipa: cachedData.ipa || '/ˈwɜːrd/',
              korean: cachedData.korean || '발음 정보 없음'
            }
          }));
        } else {
          // Use fallback data and save to cache for future use
          const fallbackData = {
            ipa: '/ˈwɜːrd/',
            korean: '발음 정보 없음'
          };
          try {
            await supabase.from('pronunciation_cache').upsert({
              word: word.toLowerCase(),
              ipa: fallbackData.ipa,
              korean: fallbackData.korean
            });
          } catch (cacheError) {
            console.error('Cache save error:', cacheError);
          }
          setPronunciationData(prev => ({
            ...prev,
            [word]: fallbackData
          }));
        }
        if (forceRefresh) {
          // Removed toast notification
        }
      }
    } catch (error) {
      console.error('Error fetching pronunciation info:', error);

      // Use fallback data
      setPronunciationData(prev => ({
        ...prev,
        [word]: {
          ipa: '/ˈwɜːrd/',
          korean: '발음 정보 없음'
        }
      }));
    } finally {
      setLoadingPronunciation(prev => ({
        ...prev,
        [word]: false
      }));
    }
  };
  const handleRefreshPronunciation = (word: string) => {
    fetchPronunciationInfo(word, true);
  };
  const handleRefreshAllPronunciations = async () => {
    const filteredWords = getFilteredWords();
    if (filteredWords.length === 0) return;
    setRefreshingAllPronunciations(true);
    toast({
      title: "발음 정보 새로고침",
      description: `${filteredWords.length}개 단어의 발음 정보를 새로 생성합니다...`
    });
    try {
      // Clear existing pronunciation data
      setPronunciationData({});

      // Regenerate all pronunciations
      for (const word of filteredWords) {
        try {
          const {
            data,
            error
          } = await supabase.functions.invoke('get-pronunciation-info', {
            body: {
              word: word.word
            }
          });
          let pronunciationInfo: PronunciationInfo;
          if (error || !data) {
            pronunciationInfo = {
              ipa: '/ˈwɜːrd/',
              korean: '발음 정보 없음'
            };
          } else {
            pronunciationInfo = {
              ipa: data.ipa || '/ˈwɜːrd/',
              korean: data.korean || '발음 정보 없음'
            };
          }

          // Update cache
          await supabase.from('pronunciation_cache').upsert({
            word: word.word.toLowerCase(),
            ipa: pronunciationInfo.ipa,
            korean: pronunciationInfo.korean
          });

          // Update state
          setPronunciationData(prev => ({
            ...prev,
            [word.word]: pronunciationInfo
          }));
        } catch (error) {
          console.error(`Error refreshing pronunciation for ${word.word}:`, error);
        }
      }
      toast({
        title: "새로고침 완료",
        description: "모든 발음 정보가 새로 생성되었습니다."
      });
    } catch (error) {
      console.error('Error refreshing all pronunciations:', error);
      toast({
        title: "오류 발생",
        description: "발음 정보 새로고침 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setRefreshingAllPronunciations(false);
    }
  };
  const playPronunciation = async (word: string, accent: 'us' | 'uk') => {
    try {
      // Ensure AudioContext is unlocked before any playback (iOS)
      initializeAudioContext();
      const {
        data,
        error
      } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: word,
          accent
        }
      });
      if (error) throw error;
      if (isIOS) {
        await playBase64AudioWebAudio(data.audioContent);
      } else {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error);
    }
  };
  if (loading) {
    return <FullPageLoading message="단어장을 불러오는 중..." />;
  }
  if (error || !cardSet) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center border border-red-200">
            <span className="text-red-500 text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            {error || '단어장을 찾을 수 없습니다'}
          </h1>
          <Link to="/dashboard">
            
          </Link>
        </div>
      </div>;
  }
  const filteredWords = getFilteredWords();
  const currentWord = getCurrentWord();
  return <div className="min-h-screen bg-white pb-safe-area">
      {/* Mobile-Optimized Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/60 shadow-sm">
        <div className="px-2 sm:px-6 py-1.5 sm:py-3">
          <div className="flex items-center max-w-7xl mx-auto gap-2 sm:gap-3">
            {/* Back Button - Compact on mobile */}
            <Link to="/dashboard" className="shrink-0">
              <Button variant="ghost" size="sm" className="w-7 h-7 sm:w-auto sm:h-auto sm:px-4 sm:py-2 p-0 rounded-lg bg-slate-100 sm:bg-gradient-to-br sm:from-slate-50 sm:to-slate-100/80 border border-slate-200 hover:border-primary/50 transition-all active:scale-95">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                <span className="hidden sm:inline ml-2 text-sm font-semibold text-slate-700">뒤로가기</span>
              </Button>
            </Link>
            
            {/* Center Title - Compact text on mobile */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {(cardSet.logo_url || cardSet.image_url) && <img src={cardSet.logo_url || cardSet.image_url} alt="" className="hidden sm:block w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover shrink-0" />}
                <span className="text-[11px] sm:text-base font-semibold text-slate-700 truncate">
                  {cardSet.title}
                </span>
                <span className="hidden sm:flex items-center px-2 py-0.5 bg-primary/10 rounded-full text-xs font-medium text-primary shrink-0">
                  연습
                </span>
              </div>
            </div>
            
            {/* Refresh Button - Compact on mobile */}
            <Button onClick={handleRefreshAllPronunciations} variant="ghost" size="sm" disabled={refreshingAllPronunciations || selectedDays.length === 0} className="shrink-0 w-7 h-7 sm:w-auto sm:h-auto sm:px-4 sm:py-2 p-0 rounded-lg bg-blue-50 border border-blue-200 hover:border-blue-400 transition-all active:scale-95 disabled:opacity-50" title="새로고침">
              {refreshingAllPronunciations ? <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />}
              <span className="hidden sm:inline ml-2 text-sm font-semibold text-blue-700">새로고침</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-6 py-2 sm:py-4 max-w-7xl mx-auto space-y-2 sm:space-y-6">
        {/* Ultra Compact Day Selection for Mobile */}
        <div className="relative bg-white backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-2.5 sm:p-4">
          {/* Header with Range Selection */}
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">Day 선택</span>
              <span className="px-1.5 py-0.5 bg-blue-100 rounded text-[10px] sm:text-xs font-bold text-blue-600">{selectedDays.length}/{cardSet.selected_days?.length || 0}</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button variant="ghost" size="sm" onClick={() => setShowRangeInput(!showRangeInput)} className="h-6 px-1.5 sm:px-2 text-[9px] sm:text-[10px] font-semibold text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                범위설정
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => setSelectedDays([])} className="h-6 px-1.5 sm:px-2 text-[9px] sm:text-[10px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                해제
              </Button>
            </div>
          </div>

          {/* Range Input Panel */}
          {showRangeInput && <div className="mb-2.5 p-2 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg border border-violet-200">
              <div className="flex items-center gap-2">
                <input type="number" placeholder="시작" value={rangeInputStart} onChange={e => setRangeInputStart(e.target.value)} className="w-16 sm:w-20 h-7 px-2 text-xs font-semibold text-center border border-violet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400" min="1" />
                <span className="text-xs font-bold text-slate-500">~</span>
                <input type="number" placeholder="끝" value={rangeInputEnd} onChange={e => setRangeInputEnd(e.target.value)} className="w-16 sm:w-20 h-7 px-2 text-xs font-semibold text-center border border-violet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400" min="1" />
                <Button size="sm" onClick={() => {
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
            }} className="h-7 px-3 text-[10px] font-bold bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-md">
                  선택
                </Button>
              </div>
            </div>}

          {/* Compact Day Grid - Grouped by Sheet */}
          {(() => {
          const normalizeDayNum = (dayStr: string): string => {
            const num = parseInt(dayStr, 10);
            return isNaN(num) ? dayStr : num.toString();
          };

          // 시트별로 그룹화 로직
          const groupedDays: Record<string, string[]> = {};

          // allWordData에서 실제 day 라벨 추출하여 시트 이름 파악
          allWordData.forEach((word: any) => {
            const dayField = word.day?.toString() || '';
            // "P1 Day 01", "[Part 1] DAY 01" 형태인지 확인
            const sheetDayMatch = dayField.match(/^(?:\[([^\]]+)\]|([A-Za-z0-9]+))\s+(Day\s*\d+)/i);
            if (sheetDayMatch) {
              const sheetName = sheetDayMatch[1] || sheetDayMatch[2];
              const dayPart = sheetDayMatch[3];
              const dayNumMatch = dayPart.match(/\d+/);
              if (dayNumMatch) {
                const normalizedDay = normalizeDayNum(dayNumMatch[0]);
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
          const sheetStyles = [{
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            accent: 'text-blue-600',
            pill: 'bg-blue-100'
          }, {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            accent: 'text-emerald-600',
            pill: 'bg-emerald-100'
          }, {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            accent: 'text-amber-600',
            pill: 'bg-amber-100'
          }, {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            accent: 'text-purple-600',
            pill: 'bg-purple-100'
          }, {
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            accent: 'text-rose-600',
            pill: 'bg-rose-100'
          }];

          // 시트별로 그룹화된 경우
          if (hasMultipleSheets) {
            return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sheetKeys.map((sheetName, idx) => {
                const days = groupedDays[sheetName].sort((a, b) => parseInt(a) - parseInt(b));
                const style = sheetStyles[idx % sheetStyles.length];
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
                return <div key={sheetName} className={`p-2 rounded-lg ${style.bg} border ${style.border}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`font-bold text-xs ${style.accent}`}>{sheetName}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${style.pill} ${style.accent} font-medium`}>{sheetWordCount}단어</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {days.map(day => {
                      const dayKey = `${sheetName}:${day}`;
                      const isSelected = selectedDays.includes(dayKey);
                      return <button key={`${sheetName}-${day}`} onClick={() => handleDayChange(day, sheetName)} className={`w-7 h-7 rounded-md text-[10px] font-semibold transition-all duration-150 ${isSelected ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}>
                                {day}
                              </button>;
                    })}
                        </div>
                      </div>;
              })}
                </div>;
          }

          // 단일 시트인 경우 - 꽉 찬 그리드
          return <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1.5 sm:gap-2">
                {availableDays.map((day: string) => {
              const isSelected = selectedDays.includes(day);
              return <button key={day} onClick={() => handleDayChange(day)} className={`aspect-square min-w-[34px] rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 ease-out ${isSelected ? 'bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-300/40 scale-[1.05]' : 'bg-white/90 border border-slate-200/80 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-600 hover:shadow-md hover:scale-[1.03] active:scale-95'}`}>
                      {day}
                    </button>;
            })}
              </div>;
        })()}

          {/* Bottom Info Row - Ultra Compact on Mobile */}
          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-semibold text-blue-600">{selectedDays.length}개</span>
              {selectedDays.length > 0 && <>
                  <span className="text-slate-300">·</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-700">{filteredWords.length}단어</span>
                </>}
            </div>
            
            {/* Practice Order Toggle - Compact */}
            <div className="flex items-center bg-slate-100 rounded-md sm:rounded-lg p-0.5">
              <button onClick={() => setIsRandomOrder(true)} className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-semibold transition-all ${isRandomOrder ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                랜덤
              </button>
              <button onClick={() => setIsRandomOrder(false)} className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-semibold transition-all ${!isRandomOrder ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                순서
              </button>
            </div>
          </div>
        </div>

        {selectedDays.length > 0 && filteredWords.length > 0 && <>
            {/* Card Flip Practice Mode - No extra spacing on mobile */}
            <div className="space-y-1.5 sm:space-y-3">
              {/* Ultra Compact Progress bar on Mobile */}
              <div className="hidden sm:flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-neutral-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-950 text-white text-[10.5px] font-mono tabular-nums tracking-[0.06em]">
                    {String(filteredWords.length).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-400">Cards</span>
                </div>
                <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-neutral-400">
                  Tap to flip
                </div>
              </div>

              {/* Study Cards Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2.5 lg:gap-3">

                {filteredWords.map((word, index) => <StudyCard key={`${word.word}-${index}`} front={<>
                          <div className="hidden sm:flex flex-col h-full w-full">
                            <div className="flex items-start justify-between w-full mb-2">
                              <span className="text-[8px] font-mono tracking-[0.22em] uppercase text-[#8b7355]">Word</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-mono tracking-[0.14em] uppercase text-[#8b7355]">{word.day}</span>
                                <span className="text-[8px] font-mono tabular-nums tracking-[0.06em] text-[#a89a86]">{String(index + 1).padStart(2, '0')}</span>
                              </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center w-full">
                              <div className="text-[12px] lg:text-[18px] warm-sand-card-word leading-[1.1] break-words text-center">
                                {word.word}
                              </div>
                            </div>
                            <div className="h-px w-full bg-[#e8e2d6] my-1.5" />
                            {pronunciationData[word.word] && <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-[#9a8f7c]">{pronunciationData[word.word].ipa}</span>
                            </div>}
                            {loadingPronunciation[word.word] && <div className="inline-flex items-center gap-1">
                              <div className="w-2 h-2 border border-[#c9b99a] border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[8px] font-mono text-[#a89a86]">···</span>
                            </div>}
                          </div>
                          <div className="sm:hidden w-full text-center">
                            <div className="text-[11px] warm-sand-card-word leading-tight break-words">
                              {word.word}
                            </div>
                          </div>
                       </>} back={<div className="flex flex-col h-full w-full items-center justify-center">
                         <div className="hidden sm:block text-[8px] font-mono tracking-[0.2em] uppercase text-[#c9b99a] mb-2">Meaning</div>
                         <div className="h-px w-8 bg-[#c9b99a]/50 mb-3" />
                         <div className="text-[10px] sm:text-[15px] lg:text-base warm-sand-card-body text-center leading-snug px-1 sm:px-2 text-[#c9a227] font-bold">
                           {cleanMeaning(word.meaning)}
                         </div>
                       </div>} isFlipped={flippedCard === index} onFlip={() => handleCardFlip(index)} className="w-full" />)}

              </div>
            </div>

            {/* Table View */}
            <Collapsible open={isTableOpen} onOpenChange={setIsTableOpen}>
              <div className="glassmorphism rounded-2xl p-4">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground">📋 전체 단어 목록</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground/80">
                        {filteredWords.length}개 단어
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isTableOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="overflow-x-auto scrollbar-thin text-slate-950">
                      <table className="w-full text-left table-auto md:table-fixed min-w-full md:min-w-[800px]">
                        <thead className="bg-muted/50">
                           
                        </thead>
                        <tbody className="divide-y divide-border">
                           {filteredWords.map((word, index) => <tr key={index} className="hover:bg-muted/30 transition-colors">
                               <td className="px-3 py-3 whitespace-nowrap">
                                  <div className="text-xs text-center bg-blue-100 text-blue-700 dark:text-blue-600 rounded-full px-2 py-1 font-medium inline-block">
                                    {word.day}
                                  </div>
                               </td>
                                <td className="px-3 py-3 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-foreground break-words">
                                    {word.word}
                                  </div>
                                 </td>
                                <td className="px-3 py-3">
                                  <div className="text-sm text-foreground leading-tight whitespace-normal break-words">
                                    {cleanMeaning(word.meaning)}
                                  </div>
                               </td>
                                <td className="px-3 py-3 whitespace-nowrap text-center hidden md:table-cell text-slate-900">
                                  <button onClick={() => playPronunciation(word.word, "us")} className="p-2 hover:bg-muted rounded-full flex items-center justify-center mx-auto transition-colors" title="미국식 발음">
                                    <Volume2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                  </button>
                                </td>
                             </tr>)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </>}

        {/* Enhanced Empty State */}
        {selectedDays.length > 0 && filteredWords.length === 0 && <div className="glassmorphism rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-border/20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl flex items-center justify-center shadow-inner">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              단어가 없습니다
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
              선택된 Day들에 등록된 단어가 없습니다.<br />
              다른 Day를 선택해보세요.
            </p>
            <Button onClick={() => setIsDaySelectionOpen(true)} className="mt-6 px-6 py-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl touch-target">
              Day 다시 선택하기
            </Button>
          </div>}

        {/* Enhanced No Day Selected State */}
        {selectedDays.length === 0 && <div className="glassmorphism rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-border/20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center shadow-inner">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-slate-950">
              학습할 Day를 선택하세요
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
              위의 Day 선택 섹션에서 학습하고 싶은 Day를 선택해주세요.
            </p>
            <Button onClick={() => setIsDaySelectionOpen(true)} className="mt-6 px-6 py-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl touch-target">
              Day 선택하기
            </Button>
          </div>}
      </div>
    </div>;
}