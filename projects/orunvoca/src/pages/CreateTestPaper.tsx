import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, FileText, Printer, CheckCircle2, Plus, Trash2, ClipboardList, BookOpen, Calendar, PenTool, Shuffle, Hash, RotateCcw, Layers } from "lucide-react";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import testPaperIcon from "@/assets/page-icons/create-test-paper-icon.png";
import orunTestLogo from "@/assets/orun-academy-test-logo.png";
import orunBookLogo from "@/assets/orun-academy-new-logo.png";
import brainiacLogoAsset from "@/assets/brainiac-logo.png.asset.json";
let brainiacLogo = brainiacLogoAsset.url;
// 원격 CDN 로고를 앱 로드 즉시 선반입 + data URL로 캐싱 (표시 지연 제거)
const brainiacLogoReady: Promise<string> = (async () => {
  try {
    if (typeof window === "undefined") return brainiacLogo;
    const res = await fetch(brainiacLogoAsset.url, { cache: "force-cache" });
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    brainiacLogo = dataUrl;
    return dataUrl;
  } catch {
    return brainiacLogo;
  }
})();
const isBrainiacTitle = (t?: string) => !!t && /BRAINIAC|브레니악|브레이닉/i.test(t.trim());
const brandLogoSrc = (t?: string) => (isBrainiacTitle(t) ? brainiacLogo : orunTestLogo);
const brandAlt = (t?: string) => (isBrainiacTitle(t) ? "BRAINIAC ENGLISH" : "ORUN");

const themeClass = (t?: string) => (isBrainiacTitle(t) ? "brainiac-theme" : "");
const brandFooterText = (t?: string) => (isBrainiacTitle(t) ? "BRAINIAC ENGLISH" : "ORUN ACADEMY");
const headerTitleStyle = (t?: string): React.CSSProperties | undefined =>
  isBrainiacTitle(t) ? { fontSize: "13px", letterSpacing: 0, whiteSpace: "nowrap" } : undefined;

// 예문 빈칸 처리: 표제어가 두 단어 이상(구동사 등)일 때도 정확히 빈칸으로 치환
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const blankExample = (example?: string, word?: string): string => {
  if (!example) return '';
  if (!word) return example;
  const tokens = word
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .split(/[\s_]+/)
    .filter(Boolean);
  if (tokens.length === 0) return example;

  const build = (list: string[]) =>
    list
      .map((t, i) => {
        const base = escapeRe(t);
        const infl = i === list.length - 1 ? '(?:s|es|ed|ied|ing|d)?' : '';
        return `_*${base}${infl}_*`;
      })
      .join('[\\s_]+');

  let result = example;
  const loose = tokens
    .map((t, i) => `_*${escapeRe(t)}${i === 0 ? '[A-Za-z]*' : ''}_*`)
    .join('[\\s_]+');
  const patterns = [build(tokens), loose, `_*${escapeRe(tokens[0])}[A-Za-z]*_*`];
  for (const p of patterns) {
    const re = new RegExp(`(?<![A-Za-z])${p}(?![A-Za-z])`, 'gi');
    if (re.test(example)) {
      result = example.replace(new RegExp(`(?<![A-Za-z])${p}(?![A-Za-z])`, 'gi'), '________');
      break;
    }
  }

  // 남은 강조용 밑줄 표시 제거
  return result.replace(/(^|[\s(])_+([A-Za-z][A-Za-z'-]*)_+(?=$|[\s.,!?)])/g, '$1$2');
};


// BRAINIAC 뜻/품사 분리 헬퍼
const POS_LABEL_MAP: Record<string, string> = { '명': '명', '동': '동', '형': '형', '부': '부' };
const extractPOSFromMeaning = (meaning?: string): string => {
  if (!meaning) return '';
  const matches = [...meaning.matchAll(/\[([명동형부])\]/g)];
  if (matches.length === 0) return '';
  const uniq = [...new Set(matches.map((m) => POS_LABEL_MAP[m[1]] || m[1]))];
  return uniq.join('·');
};
const stripPOSFromMeaning = (meaning?: string): string => {
  if (!meaning) return '';
  return meaning.replace(/\s*\[([명동형부])\]\s*/g, ' ').replace(/\s+/g, ' ').trim();
};
interface CardSet {
  id: string;
  title: string;
  word_data: any;
  selected_days: string[];
  image_url?: string | null;
}
interface WordData {
  word: string;
  meaning: string;
  day: string;
  example?: string;
  englishDefinition?: string;
  synonyms?: {word: string;meaning: string;}[];
  antonyms?: {word: string;meaning: string;}[];
  isDerivative?: boolean;
  wordType?: string;
  isSynAntExtra?: boolean;
}

interface SynonymAntonymChoice {
  word: string;
  meaning: string;
  isUnrelated: boolean;
  relationship?: 'synonym' | 'antonym' | 'unrelated';
}

function compressDayRanges(days: string[], prefix: string = "D"): string {
  if (days.length === 0) return "";
  const nums = days
    .map((d) => {
      // Strip any [Part X] / [파트 X] bracket prefix so we parse the DAY number, not the Part number
      const cleaned = String(d).replace(/^\s*\[[^\]]+\]\s*/, '');
      const m = cleaned.match(/\d+/);
      return m ? parseInt(m[0], 10) : NaN;
    })
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);
  if (nums.length === 0) return days.join(", ");
  const ranges: string[] = [];
  let start = nums[0];
  let prev = nums[0];
  const fmt = (n: number) => `${prefix}${String(n).padStart(2, "0")}`;
  for (let i = 1; i <= nums.length; i++) {
    if (i < nums.length && nums[i] === prev + 1) {
      prev = nums[i];
    } else {
      if (start === prev) {
        ranges.push(fmt(start));
      } else {
        ranges.push(`${fmt(start)}~${fmt(prev)}`);
      }
      if (i < nums.length) {
        start = nums[i];
        prev = nums[i];
      }
    }
  }
  return ranges.join(", ");
}

function formatPartAndDays(days: string[]): string {
  if (!days || days.length === 0) return "";
  const groups = new Map<string, string[]>();
  const order: string[] = [];
  days.forEach((d) => {
    const m = String(d).match(/^\s*\[([^\]]+)\]\s*(.*)$/);
    const part = m ? m[1].trim() : "";
    const rest = m ? m[2] : String(d);
    if (!groups.has(part)) { groups.set(part, []); order.push(part); }
    groups.get(part)!.push(rest);
  });
  const segments = order.map((part) => {
    const dayStr = compressDayRanges(groups.get(part)!.map((d) => d.replace(/^DAY\s*/i, '').replace(/^Day\s*/, '')), "DAY ");
    return part ? `${part} · ${dayStr}` : dayStr;
  });
  return segments.join(", ");
}

interface SynonymAntonymQuestion {
  questionWord: WordData;
  choices: SynonymAntonymChoice[];
  correctAnswer: string;
}

interface DayRange {
  id: string;
  part: string; // "" = all/no parts, or specific part name
  startDay: number | "";
  endDay: number | "";
  questionCount: number | "all";
  orderType: "original" | "random";
  testType: "meaning" | "spelling" | "mixed" | "synonym_antonym" | "example_completion" | "english_definition" | "polysemy";
  appendSynAnt?: boolean; // BRAINIAC 동반어: 엑셀의 동의어/반의어를 표제어 리스트에 추가하여 출제
  customTitle?: string; // BRAINIAC: 범위별 커스텀 시험지 제목
}

type MixableType = "meaning" | "spelling" | "example_completion" | "english_definition";

interface GeneratedTestData {
  rangeLabel: string;
  title?: string;
  testTitle: string;
  testType: string;
  words: WordData[];
  selectedDays: string[];
  studentName?: string;
  synonymAntonymQuestions?: SynonymAntonymQuestion[];
  mixedTypeAssignments?: MixableType[];
}

const CreateTestPaper = () => {
  const navigate = useNavigate();
  // 로고 data URL 준비되면 즉시 리렌더 (인쇄/미리보기 지연 방지)
  const [, setLogoReady] = useState(0);
  useEffect(() => {
    let alive = true;
    brainiacLogoReady.then(() => { if (alive) setLogoReady(v => v + 1); });
    return () => { alive = false; };
  }, []);

  const {
    toast
  } = useToast();
  const [cardSets, setCardSets] = useState<CardSet[]>([]);
  const [selectedCardSet, setSelectedCardSet] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [testType, setTestType] = useState<"meaning" | "spelling" | "mixed" | "synonym_antonym" | "example_completion" | "english_definition" | "polysemy">("meaning");
  const [orderType, setOrderType] = useState<"original" | "random">("random");
  const [dayRangeStart, setDayRangeStart] = useState('');
  const [dayRangeEnd, setDayRangeEnd] = useState('');
  const [questionCount, setQuestionCount] = useState<number | "all">("all");
  const [testTitle, setTestTitle] = useState<string>("ORUN VOCA");
  const [studentName, setStudentName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTest, setGeneratedTest] = useState<{
    title?: string;
    testTitle: string;
    testType: string;
    words: WordData[];
    selectedDays: string[];
    studentName?: string;
    synonymAntonymQuestions?: SynonymAntonymQuestion[];
    mixedTypeAssignments?: MixableType[];
  } | null>(null);

  // Day 선택 모드: 'single' = Day 선택, 'multi' = 멀티 범위 생성
  const [daySelectionMode, setDaySelectionMode] = useState<'single' | 'multi'>('single');
  // 멀티 범위 상태
  const [multiRanges, setMultiRanges] = useState<DayRange[]>([]);
  const [generatedMultiTests, setGeneratedMultiTests] = useState<GeneratedTestData[]>([]);
  const [includeDerivatives, setIncludeDerivatives] = useState(false);
  const [polysemyBlanks, setPolysemyBlanks] = useState<Record<number, boolean[]>>({});
  const [mixedSelectedTypes, setMixedSelectedTypes] = useState<MixableType[]>(["meaning", "spelling", "example_completion", "english_definition"]);
  const [mixedTypeCounts, setMixedTypeCounts] = useState<Record<string, number>>({
    meaning: 0,
    spelling: 0,
    example_completion: 0,
    english_definition: 0,
  });

  const generateMixedTypeAssignments = (wordCount: number, types: MixableType[], counts?: Record<string, number>): MixableType[] => {
    if (types.length === 0) return Array(wordCount).fill("meaning");
    const assignments: MixableType[] = [];
    if (counts) {
      // 유형별 개수에 따라 정확히 배정
      types.forEach((t) => {
        const n = Math.max(0, counts[t] ?? 0);
        for (let i = 0; i < n; i++) assignments.push(t);
      });
      // 부족하면 라운드로빈으로 채움
      let i = 0;
      while (assignments.length < wordCount) {
        assignments.push(types[i % types.length]);
        i++;
      }
      // 초과하면 자름
      if (assignments.length > wordCount) assignments.length = wordCount;
    } else {
      for (let i = 0; i < wordCount; i++) {
        assignments.push(types[i % types.length]);
      }
    }
    // Shuffle for random distribution
    for (let i = assignments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
    }
    return assignments;
  };

  const getMixedTypeLabel = (type: MixableType): string => {
    switch(type) {
      case 'meaning': return '의미';
      case 'spelling': return '철자';
      case 'example_completion': return '예문';
      case 'english_definition': return '영영풀이';
      default: return '?';
    }
  };

  const getMixedTypeBadgeColor = (type: MixableType): string => {
    switch(type) {
      case 'meaning': return '#3b82f6';
      case 'spelling': return '#a855f7';
      case 'example_completion': return '#10b981';
      case 'english_definition': return '#f59e0b';
      default: return '#64748b';
    }
  };

  // 혼합형 문제 번호 옆 유형 표기 (Noto Sans 한글 라벨 배지)
  const getMixedTypeCode = (type: MixableType): string => {
    switch(type) {
      case 'meaning': return '의미';
      case 'spelling': return '철자';
      case 'example_completion': return '예문';
      case 'english_definition': return '정의';
      default: return '·';
    }
  };

  const mixedTypeBadgeStyle = (type: MixableType): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '22px',
    height: '13px',
    padding: '0 4px',
    marginBottom: '1.5px',
    fontFamily: "'Noto Sans KR', 'Noto Sans', sans-serif",
    fontSize: '7px',
    fontWeight: 600,
    lineHeight: 1,
    color: getMixedTypeBadgeColor(type),
    background: 'transparent',
    border: `0.8px solid ${getMixedTypeBadgeColor(type)}`,
    borderRadius: '9999px',
    letterSpacing: '-0.2px',
    whiteSpace: 'nowrap',
  });

  const splitMeaning = (meaning: string): string[] => {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    for (const char of meaning) {
      if (char === '(' || char === '（') depth++;
      if (char === ')' || char === '）') depth--;
      if ((char === ';' || char === ',') && depth === 0) {
        if (current.trim()) parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts.length > 0 ? parts : [meaning];
  };
  useEffect(() => {
    fetchCardSets();
  }, []);

  // BRAINIAC 자동 설정: sessionStorage에서 설정을 읽어 멀티 범위 모드로 자동 채움
  const [brainiacAutoGen, setBrainiacAutoGen] = useState(false);
  const [wordbookOnlySynAnt, setWordbookOnlySynAnt] = useState(false);
  useEffect(() => {
    if (cardSets.length === 0) return;
    const raw = sessionStorage.getItem('brainiacConfig');
    if (!raw) return;
    try {
      const cfg = JSON.parse(raw);
      sessionStorage.removeItem('brainiacConfig');
      if (cfg.cardSetId) setSelectedCardSet(cfg.cardSetId);
      if (cfg.testTitle) setTestTitle(cfg.testTitle);
      if (Array.isArray(cfg.mixedSelectedTypes)) setMixedSelectedTypes(cfg.mixedSelectedTypes);
      if (Array.isArray(cfg.multiRanges)) {
        setDaySelectionMode('multi');
        setMultiRanges(cfg.multiRanges);
        setWordbookOnlySynAnt(true);
        setBrainiacAutoGen(true);
      }
    } catch (e) {
      console.error('Brainiac config parse failed', e);
    }
  }, [cardSets]);

  useEffect(() => {
    if (brainiacAutoGen && selectedCardSet && multiRanges.length > 0) {
      setBrainiacAutoGen(false);
      // microtask로 미뤄 state가 반영된 뒤 실행
      setTimeout(() => { handleGenerateMultiTest(); }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brainiacAutoGen, selectedCardSet, multiRanges]);

  const fetchCardSets = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("card_sets").select("id, title, word_data, selected_days, image_url").order("created_at", {
        ascending: false
      });
      if (error) throw error;

      // Sort by ORUN VOCA number order: 0,1,2,3,4,5,6,7,8,Ultimate
      const sortedData = (data || []).sort((a, b) => {
        const getOrder = (title: string): number => {
          if (title.includes("Ultimate")) return 100;
          const match = title.match(/ORUN VOCA\s*(\d+)/i);
          if (match) return parseInt(match[1], 10);
          return 50; // Other titles go in the middle
        };
        return getOrder(a.title) - getOrder(b.title);
      });

      setCardSets(sortedData);
    } catch (error) {
      console.error("Error fetching card sets:", error);
      toast({
        title: "오류",
        description: "단어장을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getAvailableDays = () => {
    const selected = cardSets.find((cs) => cs.id === selectedCardSet);
    let days = selected?.selected_days || [];

    // selected_days가 비어있으면 word_data에서 직접 day 추출
    if (days.length === 0 && selected && Array.isArray(selected.word_data)) {
      const extractedDays = new Set<string>();
      selected.word_data.forEach((word: any) => {
        if (word.day) {
          extractedDays.add(word.day);
        }
      });
      days = Array.from(extractedDays);
    }
    return days.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''));
      const numB = parseInt(b.replace(/\D/g, ''));
      const hasNumA = !isNaN(numA);
      const hasNumB = !isNaN(numB);
      if (hasNumA && hasNumB) return numA - numB;
      if (hasNumA && !hasNumB) return -1;
      if (!hasNumA && hasNumB) return 1;
      return a.localeCompare(b);
    });
  };
  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };
  const getWordsForSelectedDays = (): WordData[] => {
    const selected = cardSets.find((cs) => cs.id === selectedCardSet);
    if (!selected) return [];
    const words: WordData[] = [];
    selected.word_data.forEach((item: any) => {
      if (selectedDays.includes(item.day)) {
        // 동의어/반의어 데이터 추출 - 두 가지 형식 모두 지원
        let synonyms: {word: string;meaning: string;}[] = [];
        let antonyms: {word: string;meaning: string;}[] = [];

        // 형식 1: 배열 형태 (synonyms: [{word, meaning}, ...])
        if (Array.isArray(item.synonyms) && item.synonyms.length > 0) {
          synonyms = item.synonyms.map((s: any) => ({
            word: s.word?.trim() || '',
            meaning: s.meaning?.trim() || ''
          })).filter((s: any) => s.word);
        }
        // 형식 2: 개별 필드 (synonym1, synonym1Meaning, ...)
        else {
          if (item.synonym1 && item.synonym1.trim()) {
            synonyms.push({ word: item.synonym1.trim(), meaning: item.synonym1Meaning || item.synonym1_meaning || '' });
          }
          if (item.synonym2 && item.synonym2.trim()) {
            synonyms.push({ word: item.synonym2.trim(), meaning: item.synonym2Meaning || item.synonym2_meaning || '' });
          }
          if (item.synonym3 && item.synonym3.trim()) {
            synonyms.push({ word: item.synonym3.trim(), meaning: item.synonym3Meaning || item.synonym3_meaning || '' });
          }
        }

        // 형식 1: 배열 형태 (antonyms: [{word, meaning}, ...])
        if (Array.isArray(item.antonyms) && item.antonyms.length > 0) {
          antonyms = item.antonyms.map((a: any) => ({
            word: a.word?.trim() || '',
            meaning: a.meaning?.trim() || ''
          })).filter((a: any) => a.word);
        }
        // 형식 2: 개별 필드 (antonym1, antonym1Meaning, ...)
        else {
          if (item.antonym1 && item.antonym1.trim()) {
            antonyms.push({ word: item.antonym1.trim(), meaning: item.antonym1Meaning || item.antonym1_meaning || '' });
          }
          if (item.antonym2 && item.antonym2.trim()) {
            antonyms.push({ word: item.antonym2.trim(), meaning: item.antonym2Meaning || item.antonym2_meaning || '' });
          }
          if (item.antonym3 && item.antonym3.trim()) {
            antonyms.push({ word: item.antonym3.trim(), meaning: item.antonym3Meaning || item.antonym3_meaning || '' });
          }
        }

        words.push({
          word: item.word.replace(/^\d+\.\s*/, '').trim(),
          meaning: item.meaning,
          day: item.day,
          example: item.example || item.exampleSentence || item.example_sentence || undefined,
          englishDefinition: item.englishDefinition || item.english_definition || item.definition || undefined,
          synonyms: synonyms.length > 0 ? synonyms : undefined,
          antonyms: antonyms.length > 0 ? antonyms : undefined
        });
      }
    });
    return words;
  };
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const generateSynonymAntonymQuestions = async (words: WordData[], allWords: WordData[], wordbookOnly = false): Promise<SynonymAntonymQuestion[]> => {
    const questions: SynonymAntonymQuestion[] = [];

    // 병렬로 GPT 호출 (한 번에 5개씩)
    const batchSize = 5;
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const batchPromises = batch.map(async (questionWord) => {
        // 해당 단어의 동의어, 반의어 가져오기 (CSV 데이터)
        const synonyms = questionWord.synonyms || [];
        const antonyms = questionWord.antonyms || [];

        // 동의어나 반의어가 없으면 스킵
        if (synonyms.length === 0 && antonyms.length === 0) {
          return null;
        }

        // 무관어 결정: BRAINIAC(wordbookOnly) 모드면 단어장 안에서만 선택, 아니면 GPT 호출
        let unrelatedWord: { word: string; meaning: string } = { word: 'tangible', meaning: '만질 수 있는' };

        if (wordbookOnly) {
          // 동의어/반의어/본단어와 겹치지 않는 단어장 단어 중 랜덤 선택
          const exclude = new Set<string>([
            questionWord.word.toLowerCase(),
            ...synonyms.map((s) => s.word.toLowerCase()),
            ...antonyms.map((a) => a.word.toLowerCase()),
          ]);
          const candidates = allWords.filter((w) => !exclude.has(w.word.toLowerCase()));
          if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            unrelatedWord = { word: pick.word, meaning: pick.meaning };
          } else {
            return null; // 무관어를 단어장에서 찾지 못하면 스킵
          }
        } else {
          try {
            const response = await supabase.functions.invoke('generate-unrelated-word', {
              body: {
                word: questionWord.word,
                meaning: questionWord.meaning,
                synonyms: synonyms,
                antonyms: antonyms
              }
            });

            if (response.data && response.data.word) {
              unrelatedWord = {
                word: response.data.word,
                meaning: response.data.meaning || '알 수 없음'
              };
            }
          } catch (err) {
            console.error('Failed to generate unrelated word:', err);
          }
        }


        // 7개 보기 생성: 동의어(최대3) + 반의어(최대3) + GPT 무관어(1)
        // CSV 데이터만 사용하고, 부족해도 다른 단어로 채우지 않음
        const choices: SynonymAntonymChoice[] = [
        ...synonyms.slice(0, 3).map((w) => ({
          word: w.word,
          meaning: w.meaning,
          isUnrelated: false,
          relationship: 'synonym' as const
        })),
        ...antonyms.slice(0, 3).map((w) => ({
          word: w.word,
          meaning: w.meaning,
          isUnrelated: false,
          relationship: 'antonym' as const
        })),
        { word: unrelatedWord.word, meaning: unrelatedWord.meaning, isUnrelated: true, relationship: 'unrelated' as const }];


        // 보기 셔플
        const shuffledChoices = shuffleArray(choices);

        return {
          questionWord,
          choices: shuffledChoices,
          correctAnswer: unrelatedWord.word
        };
      });

      const batchResults = await Promise.all(batchPromises);
      // null 결과 필터링 (동의어/반의어가 없는 단어는 스킵됨)
      questions.push(...batchResults.filter((q): q is SynonymAntonymQuestion => q !== null));
    }

    return questions;
  };

  const handleGenerateTest = async () => {
    if (!selectedCardSet) {
      toast({
        title: "단어장 선택 필요",
        description: "시험지를 생성할 단어장을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }
    if (selectedDays.length === 0) {
      toast({
        title: "Day 선택 필요",
        description: "시험지에 포함할 Day를 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    const allWords = getWordsForSelectedDays();
    let words = [...allWords];

    // 예문완성/영영풀이 타입인 경우 데이터 유무 경고
    if (testType === "example_completion") {
      const wordsWithExample = words.filter(w => w.example);
      if (wordsWithExample.length === 0) {
        toast({ title: "예문 데이터 없음", description: "선택한 Day의 단어에 예문 데이터가 없습니다. CSV 파일에 예문 컬럼을 포함해주세요.", variant: "destructive" });
        return;
      }
      if (wordsWithExample.length < words.length) {
        toast({ title: "일부 단어 예문 없음", description: `${words.length - wordsWithExample.length}개 단어에 예문이 없습니다. 시험지에 '예문 없음'으로 표시됩니다.` });
      }
    }
    if (testType === "english_definition") {
      const wordsWithDef = words.filter(w => w.englishDefinition);
      if (wordsWithDef.length === 0) {
        toast({ title: "영영풀이 데이터 없음", description: "선택한 Day의 단어에 영영풀이 데이터가 없습니다. CSV 파일에 영영풀이 컬럼을 포함해주세요.", variant: "destructive" });
        return;
      }
      if (wordsWithDef.length < words.length) {
        toast({ title: "일부 단어 영영풀이 없음", description: `${words.length - wordsWithDef.length}개 단어에 영영풀이가 없습니다. 시험지에 '영영풀이 없음'으로 표시됩니다.` });
      }
    }

    // 혼합형: 유형별 개수 합계로 총 문항 수 결정
    let effectiveCount: number | "all" = questionCount;
    if (testType === "mixed") {
      const sum = mixedSelectedTypes.reduce((acc, t) => acc + (mixedTypeCounts[t] ?? 0), 0);
      if (sum > 0) effectiveCount = sum;
    }

    // 문제 개수 제한 적용 - 개수가 적으면 랜덤 선정
    if (effectiveCount !== "all" && typeof effectiveCount === "number" && effectiveCount < words.length) {
      // 먼저 셔플하여 랜덤 선정
      words = shuffleArray(words).slice(0, effectiveCount);
      // 선정 후 순서 옵션에 따라 정렬
      if (orderType === "original") {
        // 원래 순서대로 정렬 (day 기준, 같은 day 내에서는 원래 인덱스 유지를 위해 재정렬)
        const originalWords = getWordsForSelectedDays();
        words = words.sort((a, b) => {
          const indexA = originalWords.findIndex((w) => w.word === a.word && w.meaning === a.meaning);
          const indexB = originalWords.findIndex((w) => w.word === b.word && w.meaning === b.meaning);
          return indexA - indexB;
        });
      }
    } else {
      // 전체 출제일 경우 순서 옵션만 적용
      if (orderType === "random") {
        words = shuffleArray(words);
      }
    }

    const selectedCardSetData = cardSets.find((cs) => cs.id === selectedCardSet);

    // 동반의어 시험인 경우 문제 생성 (GPT 호출 포함)
    let synonymAntonymQuestions: SynonymAntonymQuestion[] | undefined;
    if (testType === "synonym_antonym") {
      // 동의어/반의어 데이터가 있는 단어만 필터링
      const wordsWithSynonymsAntonyms = words.filter((w) =>
      w.synonyms && w.synonyms.length > 0 || w.antonyms && w.antonyms.length > 0
      );

      if (wordsWithSynonymsAntonyms.length === 0) {
        toast({
          title: "동/반의어 데이터 없음",
          description: "선택한 Day의 단어에 동의어/반의어 데이터가 없습니다. CSV 파일에 동의어/반의어 컬럼을 포함해주세요.",
          variant: "destructive"
        });
        return;
      }

      if (wordsWithSynonymsAntonyms.length < words.length) {
        toast({
          title: "일부 단어 제외됨",
          description: `동의어/반의어 데이터가 없는 ${words.length - wordsWithSynonymsAntonyms.length}개 단어가 제외되었습니다.`
        });
      }

      setIsGenerating(true);
      toast({
        title: "오답 선지 생성 중...",
        description: `${wordsWithSynonymsAntonyms.length}개 문제의 오답을 GPT로 생성하고 있습니다. 잠시 기다려주세요.`
      });

      try {
        synonymAntonymQuestions = await generateSynonymAntonymQuestions(wordsWithSynonymsAntonyms, allWords);
        toast({
          title: "오답 생성 완료",
          description: `${synonymAntonymQuestions.length}문제 시험지가 성공적으로 생성되었습니다.`
        });
      } catch (err) {
        console.error('Failed to generate questions:', err);
        toast({
          title: "오답 생성 실패",
          description: "문제 생성 중 오류가 발생했습니다.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      } finally {
        setIsGenerating(false);
      }
    }

    // 혼합형: 같은 유형끼리 모이도록 그룹핑하고, 각 그룹 내부 단어는 셔플
    let mixedTypeAssignments: MixableType[] | undefined;
    let finalWords = words;
    if (testType === "mixed") {
      mixedTypeAssignments = generateMixedTypeAssignments(words.length, mixedSelectedTypes, mixedTypeCounts);
      // 단어와 타입을 페어링
      const paired = finalWords.map((w, i) => ({ word: w, type: mixedTypeAssignments![i] }));
      // 유형별로 그룹핑하고 각 그룹 내부에서 단어를 셔플
      const typeOrder = mixedSelectedTypes;
      const grouped: { word: typeof paired[number]['word']; type: MixableType }[] = [];
      typeOrder.forEach((t) => {
        const group = paired.filter(p => p.type === t);
        for (let i = group.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [group[i], group[j]] = [group[j], group[i]];
        }
        grouped.push(...group);
      });
      finalWords = grouped.map(p => p.word);
      mixedTypeAssignments = grouped.map(p => p.type);
    }

    const testData = {
      title: selectedCardSetData?.title,
      testTitle,
      testType,
      words: finalWords,
      selectedDays,
      studentName,
      synonymAntonymQuestions,
      mixedTypeAssignments
    };
    setGeneratedTest(testData);
    setPolysemyBlanks({});

    // 시험지로 스크롤
    setTimeout(() => {
      document.getElementById('test-paper-preview')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };

  // 상단 시험지 유형을 바꾸면 멀티 범위들도 동일 유형으로 동기화
  useEffect(() => {
    setMultiRanges((prev) =>
      prev.length === 0 || prev.every((r) => r.testType === testType)
        ? prev
        : prev.map((r) => ({ ...r, testType }))
    );
  }, [testType]);

  // 멀티 범위 헬퍼 함수
  const addMultiRange = () => {
    setMultiRanges((prev) => {
      // 첫 번째 범위의 파트를 기본값으로 사용
      const firstPart = prev.length > 0 ? prev[0].part : "";
      return [...prev, {
        id: crypto.randomUUID(),
        part: firstPart,
        startDay: "",
        endDay: "",
        questionCount: "all",
        orderType: "random",
        testType: prev.length > 0 ? prev[0].testType : testType
      }];
    });
  };

  const removeMultiRange = (id: string) => {
    setMultiRanges((prev) => prev.filter((r) => r.id !== id));
  };

  const updateMultiRange = (id: string, field: keyof DayRange, value: any) => {
    setMultiRanges((prev) => {
      const updated = prev.map((r) => r.id === id ? { ...r, [field]: value } : r);
      // 첫 번째 범위의 파트를 변경하면 나머지 범위에도 동일 적용
      if (field === 'part' && prev.length > 0 && prev[0].id === id) {
        return updated.map((r) => ({ ...r, part: value }));
      }
      return updated;
    });
  };

  const getAvailableParts = (): string[] => {
    const allDays = getAvailableDays();
    const parts = new Set<string>();
    allDays.forEach(day => {
      const partMatch = day.match(/^\[([^\]]+)\]\s+/);
      if (partMatch) parts.add(partMatch[1]);
    });
    return Array.from(parts);
  };

  const getDaysForRange = (startDay: number, endDay: number, part?: string): string[] => {
    const availableDays = getAvailableDays();
    const filteredDays = part
      ? availableDays.filter(d => d.startsWith(`[${part}]`))
      : availableDays;
    const days: string[] = [];
    for (let i = startDay; i <= endDay; i++) {
      const dayMatch = filteredDays.find((d) => {
        // Part 접두사를 제거한 후 DAY 번호만 추출
        const withoutPart = d.replace(/^\[[^\]]+\]\s*/, '');
        const numMatch = withoutPart.match(/(\d+)/);
        const num = numMatch ? parseInt(numMatch[1]) : 0;
        return num === i;
      });
      if (dayMatch) days.push(dayMatch);
    }
    return days;
  };

  const getWordsForDays = (days: string[]): WordData[] => {
    const selected = cardSets.find((cs) => cs.id === selectedCardSet);
    if (!selected) return [];
    const words: WordData[] = [];
    selected.word_data.forEach((item: any) => {
      if (days.includes(item.day)) {
        // 파생어 필터링
        if (!includeDerivatives && item.isDerivative) return;
        const synonyms: {word: string;meaning: string;}[] = [];
        const antonyms: {word: string;meaning: string;}[] = [];
        if (Array.isArray(item.synonyms) && item.synonyms.length > 0) {
          item.synonyms.forEach((s: any) => {if (s.word?.trim()) synonyms.push({ word: s.word.trim(), meaning: s.meaning?.trim() || '' });});
        }
        if (Array.isArray(item.antonyms) && item.antonyms.length > 0) {
          item.antonyms.forEach((a: any) => {if (a.word?.trim()) antonyms.push({ word: a.word.trim(), meaning: a.meaning?.trim() || '' });});
        }
        if (item.synonym1?.trim()) synonyms.push({ word: item.synonym1.trim(), meaning: item.synonym1Meaning || item.synonym1_meaning || '' });
        if (item.synonym2?.trim()) synonyms.push({ word: item.synonym2.trim(), meaning: item.synonym2Meaning || item.synonym2_meaning || '' });
        if (item.synonym3?.trim()) synonyms.push({ word: item.synonym3.trim(), meaning: item.synonym3Meaning || item.synonym3_meaning || '' });
        if (item.antonym1?.trim()) antonyms.push({ word: item.antonym1.trim(), meaning: item.antonym1Meaning || item.antonym1_meaning || '' });
        if (item.antonym2?.trim()) antonyms.push({ word: item.antonym2.trim(), meaning: item.antonym2Meaning || item.antonym2_meaning || '' });
        if (item.antonym3?.trim()) antonyms.push({ word: item.antonym3.trim(), meaning: item.antonym3Meaning || item.antonym3_meaning || '' });
        words.push({
          word: item.word.replace(/^\d+\.\s*/, '').trim(),
          meaning: item.meaning,
          day: item.day,
          example: item.example || item.exampleSentence || item.example_sentence || undefined,
          englishDefinition: item.englishDefinition || item.english_definition || item.definition || undefined,
          synonyms: synonyms.length > 0 ? synonyms : undefined,
          antonyms: antonyms.length > 0 ? antonyms : undefined
        });
      }
    });
    return words;
  };

  const handleGenerateMultiTest = async () => {
    if (!selectedCardSet || multiRanges.length === 0) {
      toast({ title: "설정 필요", description: "단어장과 범위를 추가해주세요.", variant: "destructive" });
      return;
    }

    const selectedCardSetData = cardSets.find((cs) => cs.id === selectedCardSet);
    setIsGenerating(true);
    const allTests: GeneratedTestData[] = [];
    const skippedRanges: string[] = [];

    try {
      for (const range of multiRanges) {
        const startDayNum = typeof range.startDay === "number" ? range.startDay : parseInt(String(range.startDay));
        const endDayNum = typeof range.endDay === "number" ? range.endDay : parseInt(String(range.endDay));
        if (!startDayNum || !endDayNum) {
          skippedRanges.push(`Day ${range.startDay || "?"}-${range.endDay || "?"}`);
          continue;
        }
        const days = getDaysForRange(startDayNum, endDayNum, range.part || undefined);
        if (days.length === 0) {
          skippedRanges.push(`Day ${startDayNum}-${endDayNum}`);
          console.warn(`Skipped range Day ${startDayNum}-${endDayNum}: no matching days found. Available days:`, getAvailableDays());
          continue;
        }

        let allWords = getWordsForDays(days);
        // BRAINIAC 동반어 모드: 엑셀에 있는 동의어/반의어를 표제어 리스트에 추가
        if (range.appendSynAnt) {
          const seen = new Set<string>(allWords.map((w) => w.word.toLowerCase().trim()));
          const extras: WordData[] = [];
          allWords.forEach((parent) => {
            const extraList = [
              ...(parent.synonyms || []),
              ...(parent.antonyms || []),
            ];
            extraList.forEach((sa) => {
              const key = sa.word?.toLowerCase().trim();
              if (!key || seen.has(key)) return;
              if (!sa.meaning || !sa.meaning.trim()) return;
              seen.add(key);
              extras.push({
                word: sa.word.trim(),
                meaning: sa.meaning.trim(),
                day: parent.day,
                isSynAntExtra: true,
              });
            });
          });
          allWords = [...allWords, ...extras];
        }
        let words = [...allWords];

        const rangeTestType = range.testType || testType;

        // 혼합형: 상단에서 설정한 유형별 문제 개수 합계로 총 문항 수 결정
        let rangeEffectiveCount: number | "all" = range.questionCount;
        const mixedSum = mixedSelectedTypes.reduce((acc, t) => acc + (mixedTypeCounts[t] ?? 0), 0);
        if (rangeTestType === "mixed" && mixedSum > 0) {
          rangeEffectiveCount = mixedSum;
        }

        if (rangeEffectiveCount !== "all" && typeof rangeEffectiveCount === "number" && rangeEffectiveCount < words.length) {
          words = shuffleArray(words).slice(0, rangeEffectiveCount);
          if (range.orderType === "original") {
            words = words.sort((a, b) => {
              const indexA = allWords.findIndex((w) => w.word === a.word && w.meaning === a.meaning);
              const indexB = allWords.findIndex((w) => w.word === b.word && w.meaning === b.meaning);
              return indexA - indexB;
            });
          }
        } else {
          if (range.orderType === "random") {
            words = shuffleArray(words);
          }
        }

        let synonymAntonymQuestions: SynonymAntonymQuestion[] | undefined;
        if (rangeTestType === "synonym_antonym") {
          const wordsWithSA = words.filter((w) => w.synonyms && w.synonyms.length > 0 || w.antonyms && w.antonyms.length > 0);
          if (wordsWithSA.length > 0) {
            synonymAntonymQuestions = await generateSynonymAntonymQuestions(wordsWithSA, allWords, wordbookOnlySynAnt);
          }
        }

        // 혼합형: 유형별 개수대로 배정하고 같은 유형끼리 묶어서 배치
        let rangeMixedAssignments: MixableType[] | undefined;
        if (rangeTestType === "mixed") {
          rangeMixedAssignments = generateMixedTypeAssignments(words.length, mixedSelectedTypes, mixedSum > 0 ? mixedTypeCounts : undefined);
          const paired = words.map((w, i) => ({ word: w, type: rangeMixedAssignments![i] }));
          const grouped: typeof paired = [];
          mixedSelectedTypes.forEach((t) => {
            const group = paired.filter(p => p.type === t);
            for (let i = group.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [group[i], group[j]] = [group[j], group[i]];
            }
            grouped.push(...group);
          });
          words = grouped.map(p => p.word);
          rangeMixedAssignments = grouped.map(p => p.type);
        }


        const rangeLabel = `Day ${range.startDay}-${range.endDay}`;
        allTests.push({
          rangeLabel,
          title: selectedCardSetData?.title,
          testTitle: range.customTitle || testTitle,
          testType: rangeTestType,
          words,
          selectedDays: days,
          studentName,
          synonymAntonymQuestions,
          mixedTypeAssignments: rangeMixedAssignments
        });
      }

      setGeneratedMultiTests(allTests);
      setGeneratedTest(null);
      if (skippedRanges.length > 0) {
        toast({ 
          title: "일부 범위 건너뜀", 
          description: `${skippedRanges.join(', ')} 범위에 해당하는 Day가 단어장에 없어 건너뛰었습니다.`,
          variant: "destructive"
        });
      }
      toast({ title: "생성 완료", description: `${allTests.length}개 범위의 시험지가 생성되었습니다.` });

      setTimeout(() => {
        document.getElementById('multi-test-preview')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Multi-test generation failed:', err);
      toast({ title: "생성 실패", description: "시험지 생성 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintAllMulti = () => {
    if (generatedMultiTests.length === 0) return;
    printMultiContent('both');
  };

  const handlePrintMultiTestOnly = () => {
    if (generatedMultiTests.length === 0) return;
    printMultiContent('test');
  };

  const handlePrintMultiAnswerOnly = () => {
    if (generatedMultiTests.length === 0) return;
    printMultiContent('answer');
  };

  const getMultiPrintId = (prefix: 'multi-test' | 'multi-answer', testData: GeneratedTestData, index: number) => {
    const safeLabel = testData.rangeLabel.replace(/[^a-zA-Z0-9가-힣_-]+/g, '-');
    return `${prefix}-${index}-${safeLabel}`;
  };

  const printMultiContent = (mode: 'both' | 'test' | 'answer') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let allContent = '';
    generatedMultiTests.forEach((testData, idx) => {
      const testSection = document.getElementById(getMultiPrintId('multi-test', testData, idx));
      const answerSection = document.getElementById(getMultiPrintId('multi-answer', testData, idx));
      if (mode !== 'answer' && testSection) allContent += testSection.innerHTML;
      if (mode !== 'test' && answerSection) allContent += answerSection.innerHTML;
    });

    const titleMap = { both: '시험지+정답지 인쇄', test: '시험지 인쇄', answer: '정답지 인쇄' };
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${titleMap[mode]}</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          ${getFullPrintStyles()}
        </style>
      </head>
      <body>
        <div class="test-paper-container">
          ${allContent}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 800);
  };
  const renderSynonymAntonymTestPaper = (data: {
    title?: string;
    testTitle: string;
    words: WordData[];
    selectedDays: string[];
    studentName?: string;
    synonymAntonymQuestions?: SynonymAntonymQuestion[];
  }) => {
    const { title, testTitle, words, selectedDays, studentName, synonymAntonymQuestions } = data;

    if (!synonymAntonymQuestions || synonymAntonymQuestions.length === 0) {
      return <div className="text-center p-8 text-slate-500">동반의어 문제가 없습니다.</div>;
    }

    // 페이지당 20문제 (컴팩트 레이아웃)
    const questionsPerPage = 20;
    const pages: SynonymAntonymQuestion[][] = [];
    for (let i = 0; i < synonymAntonymQuestions.length; i += questionsPerPage) {
      pages.push(synonymAntonymQuestions.slice(i, i + questionsPerPage));
    }

    return (
      <div className="sa-preview-container">
        {pages.map((pageQuestions, pageIndex) =>
        <div key={pageIndex} className="sa-page">
            {/* 프리미엄 헤더 */}
            <div className="sa-header-v2">
              <div className="sa-header-brand">
                <img src={brandLogoSrc(testTitle)} alt={brandAlt(testTitle)} loading="eager" decoding="sync" fetchPriority="high" className="sa-header-logo" />
                <div className="sa-header-info">
                  <h1 className="sa-title">{testTitle}</h1>
                  <div className="sa-subtitle">
                    <span>{title}</span>
                    <span className="sa-dot">•</span>
                    <span>{formatPartAndDays(selectedDays)}</span>
                    <span className="sa-dot">•</span>
                    <span className="sa-badge">동반의어 찾기</span>
                  </div>
                </div>
              </div>
              <div className="sa-header-fields">
                <div className="sa-field">
                  <label>이름</label>
                  <div className="sa-field-input">{studentName || ''}</div>
                </div>
                <div className="sa-field">
                  <label>점수</label>
                  <div className="sa-field-input sa-field-score"></div>
                  <span className="sa-field-total">/{synonymAntonymQuestions.length}</span>
                </div>
              </div>
            </div>

            {/* 안내 문구 */}
            <div className="sa-guide">
              💡 <strong>문제:</strong> 주어진 단어와 <em>관련 없는 단어</em>를 찾아 번호를 쓰세요.
            </div>

            {/* 문제 그리드 - 2열 10행 = 20문제 (항상 20개 행 유지) */}
            <div className="sa-grid">
              {Array.from({ length: questionsPerPage }).map((_, qIdx) => {
              const question = pageQuestions[qIdx];
              const questionNum = pageIndex * questionsPerPage + qIdx + 1;

              // 문제가 없으면 빈 행 렌더링
              if (!question) {
                return (
                  <div key={qIdx} className="sa-item sa-item-empty">
                      <div className="sa-item-header">
                        <span className="sa-item-num">{questionNum}</span>
                        <span className="sa-item-word"></span>
                        <span className="sa-item-meaning"></span>
                        <div className="sa-item-ans"></div>
                      </div>
                      <div className="sa-item-choices">
                        {Array.from({ length: 7 }).map((_, cIdx) =>
                      <span key={cIdx} className="sa-item-choice sa-choice-empty">
                            <b>{"①②③④⑤⑥⑦"[cIdx]}</b>
                          </span>
                      )}
                      </div>
                    </div>);

              }

              return (
                <div key={qIdx} className="sa-item">
                    <div className="sa-item-header">
                      <span className="sa-item-num">{questionNum}</span>
                      <span className="sa-item-word">{question.questionWord.word}</span>
                      
                      
                    </div>
                    <div className="sa-item-choices">
                      {question.choices.map((choice, cIdx) =>
                    <span key={cIdx} className="sa-item-choice">
                          <b>{"①②③④⑤⑥⑦"[cIdx]}</b>{choice.word}
                        </span>
                    )}
                    </div>
                  </div>);

            })}
            </div>

            {/* 푸터 */}
            <div className="sa-page-footer">
              <span>{synonymAntonymQuestions.length}문제</span>
              <span className="sa-page-brand">{brandFooterText(testTitle)}</span>
              <span>{pageIndex + 1} / {pages.length}</span>
            </div>
          </div>
        )}
      </div>);

  };


  const renderSingleColumnTestPaper = (data: {
    title?: string;
    testTitle: string;
    testType: string;
    words: WordData[];
    selectedDays: string[];
    studentName?: string;
  }) => {
    const { title, testTitle, testType, words, selectedDays, studentName } = data;
    const isWriteWordType = testType === "example_completion" || testType === "english_definition";
    return (
      <div className="my-8">
        <div className={`test-page ${themeClass(testTitle)}`}>
          <div className="test-header-minimal">
            <div className="header-brand">
              <img src={brandLogoSrc(testTitle)} alt={brandAlt(testTitle)} loading="eager" decoding="sync" fetchPriority="high" className="header-logo" />
              <div className="header-title-group">
                <h1 className="header-main-title" style={headerTitleStyle(testTitle)}>{testTitle}</h1>
                <span className="header-sub-info">
                  {title} | {formatPartAndDays(selectedDays)} | 
                  {testType === "meaning" ? "뜻쓰기" : testType === "spelling" ? "스펠링" : testType === "example_completion" ? "예문완성" : testType === "english_definition" ? "영영풀이" : "혼합"} {words.length}문제
                </span>
              </div>
            </div>
            <div className="header-student-area">
              <div className="student-field">
                <label>이름</label>
                <span className="field-box field-name">{studentName || ''}</span>
              </div>
              <div className="student-field-divider" />
              <div className="student-field">
                <label>점수</label>
                <span className="field-box score-box"></span>
                <span className="score-suffix">/ {words.length}</span>
              </div>
            </div>
          </div>
          <div className="test-table-container">
            {(() => {
              const isBrainiacMeaning = isBrainiacTitle(testTitle) && testType === "meaning";
              return (
            <table className={`test-table-modern single-col-table ${isWriteWordType ? 'single-col-wide-q' : ''}`}>
              <colgroup>
                <col style={{width: '5%'}} />
                <col style={{width: isWriteWordType ? '60%' : isBrainiacMeaning ? '45%' : '45%'}} />
                {isBrainiacMeaning ? (
                  <>
                    <col style={{width: '35%'}} />
                    <col style={{width: '15%'}} />
                  </>
                ) : (
                  <col style={{width: isWriteWordType ? '35%' : '50%'}} />
                )}
              </colgroup>
              <thead>
                <tr>
                  <th className="th-no">#</th>
                  <th className="th-question">
                    {isWriteWordType ? (testType === "example_completion" ? "예문 (빈칸)" : "영영풀이") :
                    testType === "spelling" ? "한글 뜻" : testType === "mixed" ? "문제" : "English"}
                  </th>
                  {isBrainiacMeaning ? (
                    <>
                      <th className="th-answer">뜻</th>
                      <th className="th-answer">품사</th>
                    </>
                  ) : (
                  <th className="th-answer">
                    {isWriteWordType ? "English (철자)" :
                    testType === "spelling" ? "English" : testType === "mixed" ? "정답" : "뜻"}
                  </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {words.map((word, rowIdx) => {
                  const num = rowIdx + 1;
                  const isMeaning = testType === "meaning" || (testType === "mixed" && num % 2 === 1);
                  return (
                    <tr key={rowIdx}>
                      <td className="td-no">{num}</td>
                      <td className="td-question">
                        {testType === "example_completion" ?
                          <>{word.example ? blankExample(word.example, word.word) : <span style={{color:'#ef4444'}}>예문 없음</span>} <span className="spelling-hint">({word.word.charAt(0)})</span></> :
                        testType === "english_definition" ?
                          <>{word.englishDefinition || <span style={{color:'#ef4444'}}>영영풀이 없음</span>} <span className="spelling-hint">({word.word.charAt(0)})</span></> :
                        testType === "spelling" ?
                          <>{word.meaning} <span className="spelling-hint">({word.word.charAt(0)})</span></> :
                        testType === "mixed" ? isMeaning ? word.word :
                          <>{word.meaning} <span className="spelling-hint">({word.word.charAt(0)})</span></> :
                        word.word}
                      </td>
                      {isBrainiacMeaning ? (
                        <>
                          <td className="td-answer"></td>
                          <td className="td-answer"></td>
                        </>
                      ) : (
                        <td className="td-answer"></td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
              );
            })()}
          </div>
          <div className="test-footer-minimal">
            <span>{words.length}문제</span>
            <span>{brandFooterText(testTitle)}</span>
            <span>1/1</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPolysemyTestPaper = (data: {
    title?: string;
    testTitle: string;
    words: WordData[];
    selectedDays: string[];
    studentName?: string;
  }) => {
    const { title, testTitle, words, selectedDays, studentName } = data;
    const wordsPerPage = 50;
    const wordsPerColumn = 25;
    const pages: WordData[][] = [];
    for (let i = 0; i < words.length; i += wordsPerPage) {
      pages.push(words.slice(i, i + wordsPerPage));
    }

    const getMeaningWithBlanks = (word: WordData, wordIndex: number) => {
      const parts = splitMeaning(word.meaning);
      const blanks = polysemyBlanks[wordIndex] || parts.map(() => false);
      const hasBlanks = blanks.some(b => b);
      if (!hasBlanks) return word.meaning;
      return parts.map((part, i) => blanks[i] ? '________' : part).join(', ');
    };

    return (
      <div className="my-8">
        {pages.map((pageWords, pageIndex) => {
          const leftColumn = pageWords.slice(0, wordsPerColumn);
          const rightColumn = pageWords.slice(wordsPerColumn);
          return (
            <div key={pageIndex} className={`test-page ${themeClass(testTitle)}`}>
              <div className="test-header-minimal">
                <div className="header-brand">
                  <img src={brandLogoSrc(testTitle)} alt={brandAlt(testTitle)} loading="eager" decoding="sync" fetchPriority="high" className="header-logo" />
                  <div className="header-title-group">
                    <h1 className="header-main-title" style={headerTitleStyle(testTitle)}>{testTitle}</h1>
                    <span className="header-sub-info">
                      {title} | {formatPartAndDays(selectedDays)} | 다의어 {words.length}문제
                    </span>
                  </div>
                </div>
                <div className="header-student-area">
                  <div className="student-field">
                    <label>이름</label>
                    <span className="field-box field-name">{studentName || ''}</span>
                  </div>
                  <div className="student-field-divider" />
                  <div className="student-field">
                    <label>점수</label>
                    <span className="field-box score-box"></span>
                    <span className="score-suffix">/ {words.length}</span>
                  </div>
                </div>
              </div>
              <div className="test-table-container">
                <table className="test-table-modern meaning-layout-tight">
                  <colgroup>
                    <col style={{width: '4%'}} />
                    <col style={{width: '14%'}} />
                    <col style={{width: '32%'}} />
                    <col style={{width: '4%'}} />
                    <col style={{width: '14%'}} />
                    <col style={{width: '32%'}} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="th-no">#</th>
                      <th className="th-question">English</th>
                      <th className="th-answer">뜻 (빈칸 채우기)</th>
                      <th className="th-no">#</th>
                      <th className="th-question">English</th>
                      <th className="th-answer">뜻 (빈칸 채우기)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: wordsPerColumn }).map((_, rowIdx) => {
                      const leftWord = leftColumn[rowIdx];
                      const rightWord = rightColumn[rowIdx];
                      const leftNum = pageIndex * wordsPerPage + rowIdx + 1;
                      const rightNum = pageIndex * wordsPerPage + wordsPerColumn + rowIdx + 1;
                      const leftIdx = pageIndex * wordsPerPage + rowIdx;
                      const rightIdx = pageIndex * wordsPerPage + wordsPerColumn + rowIdx;
                      return (
                        <tr key={rowIdx}>
                          {leftWord ? (
                            <>
                              <td className="td-no">{leftNum}</td>
                              <td className="td-question">{leftWord.word}</td>
                              <td className="td-answer" style={{fontSize: '9px', fontWeight: 500, color: '#475569'}}>
                                {getMeaningWithBlanks(leftWord, leftIdx)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              <td className="td-answer td-empty"></td>
                            </>
                          )}
                          {rightWord ? (
                            <>
                              <td className="td-no">{rightNum}</td>
                              <td className="td-question">{rightWord.word}</td>
                              <td className="td-answer" style={{fontSize: '9px', fontWeight: 500, color: '#475569'}}>
                                {getMeaningWithBlanks(rightWord, rightIdx)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              <td className="td-answer td-empty"></td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="test-footer-minimal">
                <span>{words.length}문제</span>
                <span>{brandFooterText(testTitle)}</span>
                <span>{pageIndex + 1}/{pages.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPolysemyAnswerKey = (data: {
    title?: string;
    testTitle: string;
    words: WordData[];
    selectedDays: string[];
  }) => {
    const { title, testTitle, words, selectedDays } = data;
    const wordsPerPage = 50;
    const wordsPerColumn = 25;
    const pages: WordData[][] = [];
    for (let i = 0; i < words.length; i += wordsPerPage) {
      pages.push(words.slice(i, i + wordsPerPage));
    }

    const getAnswerParts = (word: WordData, wordIndex: number) => {
      const parts = splitMeaning(word.meaning);
      const blanks = polysemyBlanks[wordIndex] || parts.map(() => false);
      const hasBlanks = blanks.some(b => b);
      if (!hasBlanks) return word.meaning;
      return parts.filter((_, i) => blanks[i]).join(', ');
    };

    return (
      <div className="my-8">
        {pages.map((pageWords, pageIndex) => {
          const leftColumn = pageWords.slice(0, wordsPerColumn);
          const rightColumn = pageWords.slice(wordsPerColumn);
          return (
            <div key={pageIndex} className={`test-page answer-page ${themeClass(testTitle)}`}>
              <div className="answer-header-minimal">
                <div className="header-brand">
                  <span className="answer-label">정답지</span>
                  <h1 className="header-main-title" style={headerTitleStyle(testTitle)}>{testTitle}</h1>
                </div>
                <span className="header-sub-info">
                  {studentName && <span style={{ fontWeight: 700, marginRight: '6px' }}>{studentName}</span>}
                  {title} · {formatPartAndDays(selectedDays)} · 다의어 {words.length}문제
                </span>
              </div>
              <div className="test-table-container">
                <table className="test-table-modern answer-table-modern meaning-layout-tight">
                  <colgroup>
                    <col style={{width: '4%'}} />
                    <col style={{width: '14%'}} />
                    <col style={{width: '32%'}} />
                    <col style={{width: '4%'}} />
                    <col style={{width: '14%'}} />
                    <col style={{width: '32%'}} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="th-no">#</th>
                      <th className="th-question">English</th>
                      <th className="th-answer-filled">정답 (빈칸의 뜻)</th>
                      <th className="th-no">#</th>
                      <th className="th-question">English</th>
                      <th className="th-answer-filled">정답 (빈칸의 뜻)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: wordsPerColumn }).map((_, rowIdx) => {
                      const leftWord = leftColumn[rowIdx];
                      const rightWord = rightColumn[rowIdx];
                      const leftNum = pageIndex * wordsPerPage + rowIdx + 1;
                      const rightNum = pageIndex * wordsPerPage + wordsPerColumn + rowIdx + 1;
                      const leftIdx = pageIndex * wordsPerPage + rowIdx;
                      const rightIdx = pageIndex * wordsPerPage + wordsPerColumn + rowIdx;
                      return (
                        <tr key={rowIdx}>
                          {leftWord ? (
                            <>
                              <td className="td-no">{leftNum}</td>
                              <td className="td-question">{leftWord.word}</td>
                              <td className="td-answer-filled">{getAnswerParts(leftWord, leftIdx)}</td>
                            </>
                          ) : (
                            <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              <td className="td-answer-filled td-empty"></td>
                            </>
                          )}
                          {rightWord ? (
                            <>
                              <td className="td-no">{rightNum}</td>
                              <td className="td-question">{rightWord.word}</td>
                              <td className="td-answer-filled">{getAnswerParts(rightWord, rightIdx)}</td>
                            </>
                          ) : (
                            <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              <td className="td-answer-filled td-empty"></td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="answer-footer-minimal">
                <span>{words.length}문제</span>
                <span>{brandFooterText(testTitle)}</span>
                <span>{pageIndex + 1}/{pages.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const synAntBadge = (word: WordData) =>
    word.isSynAntExtra ? (
      <span
        style={{
          display: 'inline-block',
          marginLeft: 4,
          padding: '0 4px',
          fontSize: 8,
          fontWeight: 700,
          color: '#b45309',
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: 3,
          verticalAlign: 'middle',
        }}
      >
        동반
      </span>
    ) : null;

  const renderMixedQuestionCell = (word: WordData, assignedType: MixableType) => {
    switch(assignedType) {
      case 'meaning':
        return <>{word.word}{synAntBadge(word)}</>;
      case 'spelling':
        return <>{word.meaning} <span className="spelling-hint">({word.word.charAt(0)})</span>{synAntBadge(word)}</>;
      case 'example_completion':
        return word.example
          ? <>{blankExample(word.example, word.word)} <span className="spelling-hint">({word.word.charAt(0)})</span>{synAntBadge(word)}</>
          : <span style={{color:'#ef4444',fontSize:'9px'}}>예문 없음</span>;
      case 'english_definition':
        return word.englishDefinition
          ? <>{word.englishDefinition} <span className="spelling-hint">({word.word.charAt(0)})</span>{synAntBadge(word)}</>
          : <span style={{color:'#ef4444',fontSize:'9px'}}>영영풀이 없음</span>;
      default:
        return <>{word.word}{synAntBadge(word)}</>;
    }
  };

  const renderMixedAnswerCell = (word: WordData, assignedType: MixableType) => {
    switch(assignedType) {
      case 'meaning':
        return <>{word.meaning}{synAntBadge(word)}</>;
      case 'spelling':
      case 'example_completion':
      case 'english_definition':
        return <>{word.word}{synAntBadge(word)}</>;
      default:
        return <>{word.meaning}{synAntBadge(word)}</>;
    }
  };

  const renderMixedTestPaper = (data: {
    title?: string;
    testTitle: string;
    words: WordData[];
    selectedDays: string[];
    studentName?: string;
    mixedTypeAssignments?: MixableType[];
  }) => {
    const { title, testTitle, words, selectedDays, studentName } = data;
    const assignments = data.mixedTypeAssignments || generateMixedTypeAssignments(words.length, mixedSelectedTypes);
    const hasEC = assignments.includes('example_completion');
    const hasED = assignments.includes('english_definition');
    const hasWideType = hasEC || hasED;
    const wordsPerPage = 50;
    const wordsPerColumn = 25;
    const pages: { words: WordData[]; assignments: MixableType[] }[] = [];
    for (let i = 0; i < words.length; i += wordsPerPage) {
      pages.push({
        words: words.slice(i, i + wordsPerPage),
        assignments: assignments.slice(i, i + wordsPerPage)
      });
    }

    const mixedTypeSummary = mixedSelectedTypes.map(t => getMixedTypeLabel(t)).join('+');

    return (
      <div className="my-8">
        {pages.map((page, pageIndex) => {
          const leftWords = page.words.slice(0, wordsPerColumn);
          const rightWords = page.words.slice(wordsPerColumn);
          const leftAssignments = page.assignments.slice(0, wordsPerColumn);
          const rightAssignments = page.assignments.slice(wordsPerColumn);
          return (
            <div key={pageIndex} className={`test-page ${themeClass(testTitle)}`}>
              <div className="test-header-minimal">
                <div className="header-brand">
                  <img src={brandLogoSrc(testTitle)} alt={brandAlt(testTitle)} loading="eager" decoding="sync" fetchPriority="high" className="header-logo" />
                  <div className="header-title-group">
                    <h1 className="header-main-title" style={headerTitleStyle(testTitle)}>{testTitle}</h1>
                    <span className="header-sub-info">
                      {title} | {formatPartAndDays(selectedDays)} | 혼합({mixedTypeSummary}) {words.length}문제
                    </span>
                  </div>
                </div>
                <div className="header-student-area">
                  <div className="student-field">
                    <label>이름</label>
                    <span className="field-box field-name">{studentName || ''}</span>
                  </div>
                  <div className="student-field-divider" />
                  <div className="student-field">
                    <label>점수</label>
                    <span className="field-box score-box"></span>
                    <span className="score-suffix">/ {words.length}</span>
                  </div>
                </div>
              </div>
              <div className="test-table-container">
                <table className="test-table-modern mixed-type">
                  <colgroup>
                    <col style={{width: '5%'}} />
                    <col style={{width: hasWideType ? '30%' : '25%'}} />
                    <col style={{width: hasWideType ? '15%' : '20%'}} />
                    <col style={{width: '5%'}} />
                    <col style={{width: hasWideType ? '30%' : '25%'}} />
                    <col style={{width: hasWideType ? '15%' : '20%'}} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="th-no">#</th>
                      <th className="th-question">문제</th>
                      <th className="th-answer">정답</th>
                      <th className="th-no">#</th>
                      <th className="th-question">문제</th>
                      <th className="th-answer">정답</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: wordsPerColumn }).map((_, rowIdx) => {
                      const leftWord = leftWords[rowIdx];
                      const rightWord = rightWords[rowIdx];
                      const leftNum = pageIndex * wordsPerPage + rowIdx + 1;
                      const rightNum = pageIndex * wordsPerPage + wordsPerColumn + rowIdx + 1;
                      const leftType = leftAssignments[rowIdx];
                      const rightType = rightAssignments[rowIdx];
                      return (
                        <tr key={rowIdx}>
                          {leftWord && leftType ? (
                            <>
                              <td className="td-no">
                                <span className="mixed-type-label" style={mixedTypeBadgeStyle(leftType)}>{getMixedTypeCode(leftType)}</span>
                                <span className="question-number">{leftNum}</span>
                              </td>
                              <td className="td-question">{renderMixedQuestionCell(leftWord, leftType)}</td>
                              <td className="td-answer"></td>
                            </>
                          ) : (
                            <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              <td className="td-answer td-empty"></td>
                            </>
                          )}
                          {rightWord && rightType ? (
                            <>
                              <td className="td-no">
                                <span className="mixed-type-label" style={mixedTypeBadgeStyle(rightType)}>{getMixedTypeCode(rightType)}</span>
                                <span className="question-number">{rightNum}</span>
                              </td>
                              <td className="td-question">{renderMixedQuestionCell(rightWord, rightType)}</td>
                              <td className="td-answer"></td>
                            </>
                          ) : (
                            <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              <td className="td-answer td-empty"></td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="test-footer-minimal">
                <span>{words.length}문제</span>
                <span>{brandFooterText(testTitle)}</span>
                <span>{pageIndex + 1}/{pages.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMixedAnswerKey = (data: {
    title?: string;
    testTitle: string;
    words: WordData[];
    selectedDays: string[];
    mixedTypeAssignments?: MixableType[];
  }) => {
    const { title, testTitle, words, selectedDays } = data;
    const assignments = data.mixedTypeAssignments || generateMixedTypeAssignments(words.length, mixedSelectedTypes);
    const hasWideType = assignments.includes('example_completion') || assignments.includes('english_definition');
    const wordsPerPage = 50;
    const wordsPerColumn = 25;
    const pages: { words: WordData[]; assignments: MixableType[] }[] = [];
    for (let i = 0; i < words.length; i += wordsPerPage) {
      pages.push({
        words: words.slice(i, i + wordsPerPage),
        assignments: assignments.slice(i, i + wordsPerPage)
      });
    }
    const mixedTypeSummary = mixedSelectedTypes.map(t => getMixedTypeLabel(t)).join('+');

    return (
      <div className="my-8">
        {pages.map((page, pageIndex) => {
          const leftWords = page.words.slice(0, wordsPerColumn);
          const rightWords = page.words.slice(wordsPerColumn);
          const leftAssignments = page.assignments.slice(0, wordsPerColumn);
          const rightAssignments = page.assignments.slice(wordsPerColumn);
          return (
            <div key={pageIndex} className={`test-page answer-page ${themeClass(testTitle)}`}>
              <div className="answer-header-minimal">
                <div className="header-brand">
                  <span className="answer-label">정답지</span>
                  <h1 className="header-main-title" style={headerTitleStyle(testTitle)}>{testTitle}</h1>
                </div>
                <span className="header-sub-info">
                  {studentName && <span style={{ fontWeight: 700, marginRight: '6px' }}>{studentName}</span>}
                  {title} · {formatPartAndDays(selectedDays)} · 혼합({mixedTypeSummary}) {words.length}문제
                </span>
              </div>
              <div className="test-table-container">
                <table className="test-table-modern answer-table-modern mixed-type">
                  <colgroup>
                    <col style={{width: '5%'}} />
                    <col style={{width: hasWideType ? '30%' : '25%'}} />
                    <col style={{width: hasWideType ? '15%' : '20%'}} />
                    <col style={{width: '5%'}} />
                    <col style={{width: hasWideType ? '30%' : '25%'}} />
                    <col style={{width: hasWideType ? '15%' : '20%'}} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="th-no">#</th>
                      <th className="th-question">문제</th>
                      <th className="th-answer-filled">정답</th>
                      <th className="th-no">#</th>
                      <th className="th-question">문제</th>
                      <th className="th-answer-filled">정답</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: wordsPerColumn }).map((_, rowIdx) => {
                      const leftWord = leftWords[rowIdx];
                      const rightWord = rightWords[rowIdx];
                      const leftNum = pageIndex * wordsPerPage + rowIdx + 1;
                      const rightNum = pageIndex * wordsPerPage + wordsPerColumn + rowIdx + 1;
                      const leftType = leftAssignments[rowIdx];
                      const rightType = rightAssignments[rowIdx];
                      return (
                        <tr key={rowIdx}>
                          {leftWord && leftType ? (
                            <>
                              <td className="td-no">
                                <span className="mixed-type-label" style={mixedTypeBadgeStyle(leftType)}>{getMixedTypeCode(leftType)}</span>
                                <span className="question-number">{leftNum}</span>
                              </td>
                              <td className="td-question">{renderMixedQuestionCell(leftWord, leftType)}</td>
                              <td className="td-answer-filled">{renderMixedAnswerCell(leftWord, leftType)}</td>
                            </>
                          ) : (
                            <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              <td className="td-answer-filled td-empty"></td>
                            </>
                          )}
                          {rightWord && rightType ? (
                            <>
                              <td className="td-no">
                                <span className="mixed-type-label" style={mixedTypeBadgeStyle(rightType)}>{getMixedTypeCode(rightType)}</span>
                                <span className="question-number">{rightNum}</span>
                              </td>
                              <td className="td-question">{renderMixedQuestionCell(rightWord, rightType)}</td>
                              <td className="td-answer-filled">{renderMixedAnswerCell(rightWord, rightType)}</td>
                            </>
                          ) : (
                            <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              <td className="td-answer-filled td-empty"></td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="answer-footer-minimal">
                <span>{words.length}문제</span>
                <span>{brandFooterText(testTitle)}</span>
                <span>{pageIndex + 1}/{pages.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTestPaper = (data: {
    title?: string;
    testTitle: string;
    testType: string;
    words: WordData[];
    selectedDays: string[];
    studentName?: string;
    synonymAntonymQuestions?: SynonymAntonymQuestion[];
    mixedTypeAssignments?: MixableType[];
  }) => {
    // 혼합형 시험인 경우 별도 렌더링
    if (data.testType === "mixed") {
      return renderMixedTestPaper(data);
    }
    // 다의어 시험인 경우 별도 렌더링
    if (data.testType === "polysemy") {
      return renderPolysemyTestPaper(data);
    }
    // 동반의어 시험인 경우 별도 렌더링
    if (data.testType === "synonym_antonym") {
      return renderSynonymAntonymTestPaper(data);
    }

    const {
      title,
      testTitle,
      testType,
      words,
      selectedDays,
      studentName
    } = data;

    // ORUN VOCA 0/1/2 단일 Day (≤25단어) → 1단 레이아웃
    const isOrunVoca012 = title && (title.includes('ORUN VOCA 0') || title.includes('ORUN VOCA 1') || title.includes('ORUN VOCA 2'));
    if (isOrunVoca012 && words.length <= 25) {
      return renderSingleColumnTestPaper(data);
    }

    // 50단어씩 페이지 나누기 (2단 레이아웃, 한 컬럼에 25개)
    const wordsPerPage = 50;
    const wordsPerColumn = 25;
    const pages: WordData[][] = [];
    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageWords = words.slice(i, i + wordsPerPage);
      pages.push(pageWords);
    }
    const typeLabel = testType === "meaning" ? "영어 → 한글 (의미 쓰기)" : testType === "spelling" ? "한글 → 영어 (철자 쓰기)" : testType === "example_completion" ? "예문완성 (철자 쓰기)" : testType === "english_definition" ? "영영풀이 (철자 쓰기)" : "혼합형 (홀수: 의미, 짝수: 철자)";
    const typeColorClass = testType === "meaning" ? "type-meaning" : testType === "spelling" ? "type-spelling" : "type-mixed";
    const isWriteWordType = testType === "example_completion" || testType === "english_definition";
    return <div className="my-8">
        {pages.map((pageWords, pageIndex) => {
        const leftColumn = pageWords.slice(0, wordsPerColumn);
        const rightColumn = pageWords.slice(wordsPerColumn);
        return <div key={pageIndex} className={`test-page ${themeClass(testTitle)}`}>
              {/* 미니멀 헤더 */}
              <div className="test-header-minimal">
                <div className="header-brand">
                  <img src={brandLogoSrc(testTitle)} alt={brandAlt(testTitle)} loading="eager" decoding="sync" fetchPriority="high" className="header-logo" />
                  <div className="header-title-group">
                    <h1 className="header-main-title" style={headerTitleStyle(testTitle)}>{testTitle}</h1>
                    <span className="header-sub-info">
                      {title} | {formatPartAndDays(selectedDays)} | 
                      {testType === "meaning" ? "뜻쓰기" : testType === "spelling" ? "스펠링" : testType === "example_completion" ? "예문완성" : testType === "english_definition" ? "영영풀이" : "혼합"} {words.length}문제
                    </span>
                  </div>
                </div>
                <div className="header-student-area">
                  <div className="student-field">
                    <label>이름</label>
                    <span className="field-box field-name">{studentName || ''}</span>
                  </div>
                  <div className="student-field-divider" />
                  <div className="student-field">
                    <label>점수</label>
                    <span className="field-box score-box"></span>
                    <span className="score-suffix">/ {words.length}</span>
                  </div>
                </div>
              </div>
              
              {/* 테이블 */}
              <div className="test-table-container">
                {(() => {
                  const isBrainiacMeaning = isBrainiacTitle(testTitle) && testType === "meaning";
                  return (
                <table className={`test-table-modern ${isWriteWordType ? 'wide-question-table' : ''} ${testType === 'mixed' ? 'mixed-type' : ''}`}>
                  <colgroup>
                    <col style={{width: '4%'}} />
                     <col style={{width: isWriteWordType ? '35%' : testType === 'meaning' ? '23%' : '28%'}} />
                     {isBrainiacMeaning ? (<><col style={{width: '15%'}} /><col style={{width: '8%'}} /></>) : (
                     <col style={{width: isWriteWordType ? '11%' : testType === 'meaning' ? '23%' : '18%'}} />)}
                     <col style={{width: '4%'}} />
                     <col style={{width: isWriteWordType ? '35%' : testType === 'meaning' ? '23%' : '28%'}} />
                     {isBrainiacMeaning ? (<><col style={{width: '15%'}} /><col style={{width: '8%'}} /></>) : (
                     <col style={{width: isWriteWordType ? '11%' : testType === 'meaning' ? '23%' : '18%'}} />)}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="th-no">#</th>
                      <th className="th-question">{isWriteWordType ? (testType === "example_completion" ? "예문 (빈칸)" : "영영풀이") : testType === "spelling" ? "한글 뜻" : testType === "mixed" ? "문제" : "English"}</th>
                      {isBrainiacMeaning ? (<><th className="th-answer">뜻</th><th className="th-answer">품사</th></>) : (
                      <th className="th-answer">{isWriteWordType ? "English (철자)" : testType === "spelling" ? "English" : testType === "mixed" ? "정답" : "뜻"}</th>)}
                      <th className="th-no">#</th>
                      <th className="th-question">{isWriteWordType ? (testType === "example_completion" ? "예문 (빈칸)" : "영영풀이") : testType === "spelling" ? "한글 뜻" : testType === "mixed" ? "문제" : "English"}</th>
                      {isBrainiacMeaning ? (<><th className="th-answer">뜻</th><th className="th-answer">품사</th></>) : (
                      <th className="th-answer">{isWriteWordType ? "English (철자)" : testType === "spelling" ? "English" : testType === "mixed" ? "정답" : "뜻"}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: wordsPerColumn }).map((_, rowIdx) => {
                  const leftWord = leftColumn[rowIdx];
                  const rightWord = rightColumn[rowIdx];
                  const leftNum = pageIndex * wordsPerPage + rowIdx + 1;
                  const rightNum = pageIndex * wordsPerPage + wordsPerColumn + rowIdx + 1;
                  const leftIsMeaning = testType === "meaning" || testType === "mixed" && leftNum % 2 === 1;
                  const rightIsMeaning = testType === "meaning" || testType === "mixed" && rightNum % 2 === 1;

                  return (
                    <tr key={rowIdx}>
                          {leftWord ?
                      <>
                              <td className="td-no">{leftNum}</td>
                               <td className="td-question">
                                {testType === "example_completion" ?
                          <>{leftWord.example ? blankExample(leftWord.example, leftWord.word) : <span style={{color:'#ef4444',fontSize:'9px'}}>예문 없음</span>} <span className="spelling-hint">({leftWord.word.charAt(0)})</span></> :
                          testType === "english_definition" ?
                          <>{leftWord.englishDefinition || <span style={{color:'#ef4444',fontSize:'9px'}}>영영풀이 없음</span>} <span className="spelling-hint">({leftWord.word.charAt(0)})</span></> :
                          testType === "spelling" ?
                          <>{leftWord.meaning} <span className="spelling-hint">({leftWord.word.charAt(0)})</span></> :
                          testType === "mixed" ? leftIsMeaning ? leftWord.word :
                          <>{leftWord.meaning} <span className="spelling-hint">({leftWord.word.charAt(0)})</span></> :
                          leftWord.word}
                               </td>
                              {isBrainiacMeaning ? (<><td className="td-answer"></td><td className="td-answer"></td></>) : (<td className="td-answer"></td>)}
                            </> :

                      <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              {isBrainiacMeaning ? (<><td className="td-answer td-empty"></td><td className="td-answer td-empty"></td></>) : (<td className="td-answer td-empty"></td>)}
                            </>
                      }
                          
                          {rightWord ?
                      <>
                              <td className="td-no">{rightNum}</td>
                               <td className="td-question">
                                {testType === "example_completion" ?
                          <>{rightWord.example ? blankExample(rightWord.example, rightWord.word) : <span style={{color:'#ef4444',fontSize:'9px'}}>예문 없음</span>} <span className="spelling-hint">({rightWord.word.charAt(0)})</span></> :
                          testType === "english_definition" ?
                          <>{rightWord.englishDefinition || <span style={{color:'#ef4444',fontSize:'9px'}}>영영풀이 없음</span>} <span className="spelling-hint">({rightWord.word.charAt(0)})</span></> :
                          testType === "spelling" ?
                          <>{rightWord.meaning} <span className="spelling-hint">({rightWord.word.charAt(0)})</span></> :
                          testType === "mixed" ? rightIsMeaning ? rightWord.word :
                          <>{rightWord.meaning} <span className="spelling-hint">({rightWord.word.charAt(0)})</span></> :
                          rightWord.word}
                               </td>
                              {isBrainiacMeaning ? (<><td className="td-answer"></td><td className="td-answer"></td></>) : (<td className="td-answer"></td>)}
                            </> :

                      <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              {isBrainiacMeaning ? (<><td className="td-answer td-empty"></td><td className="td-answer td-empty"></td></>) : (<td className="td-answer td-empty"></td>)}
                            </>
                      }
                        </tr>);

                })}
                  </tbody>
                </table>
                  );
                })()}
              </div>
              
              {/* 미니멀 푸터 */}
              <div className="test-footer-minimal">
                <span>{words.length}문제</span>
                <span>{brandFooterText(testTitle)}</span>
                <span>{pageIndex + 1}/{pages.length}</span>
              </div>
            </div>;
      })}
      </div>;
  };
  const getFullPrintStyles = () => `
    @page { 
      size: A4 portrait; 
      margin: 0mm !important; 
    }
    * { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body { 
      margin: 0; 
      padding: 0; 
      background: white;
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
      width: 210mm;
    }
    .no-print { display: none !important; }
    .test-paper-container {
      background: white;
      padding: 0;
      margin: 0;
      width: 210mm;
    }
    
    /* 페이지 기본 - 여백 최소화 */
    .test-page {
      width: 210mm !important;
      height: 297mm !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 5mm 6mm 5mm 6mm !important;
      page-break-after: always !important;
      page-break-inside: avoid !important;
      display: flex !important;
      flex-direction: column !important;
      background: white !important;
    }
    .test-page:last-child {
      page-break-after: auto !important;
    }
    
    /* 미니멀 헤더 - 시험지 (프리미엄 라이트) */
     .test-header-minimal {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 9px 14px 9px 11px;
       background: #1e1b4b;
       border: 1px solid #312e81;
       border-radius: 10px;
       margin-bottom: 6px;
       flex-shrink: 0;
       position: relative;
       overflow: hidden;
       box-shadow: 0 1px 3px rgba(0,0,0,0.18);
     }
    .test-header-minimal::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3.5px;
      background: linear-gradient(90deg, #312e81 0%, #4f46e5 25%, #a5b4fc 50%, #d4a93a 75%, #312e81 100%);
      pointer-events: none;
    }
     .test-header-minimal::after {
       content: '';
       position: absolute;
       inset: 0;
       background: none;
       pointer-events: none;
     }
    .test-header-minimal > * {
      position: relative;
      z-index: 1;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
     .header-logo {
       height: 30px;
       width: auto;
       background: #fff;
       border: 1px solid rgba(255,255,255,0.25);
       border-radius: 7px;
       padding: 1px 4px;
     }
     .header-title-group {
       display: flex;
       flex-direction: column;
       justify-content: center;
       gap: 2px;
       border-left: 2px solid rgba(255,255,255,0.18);
       padding-left: 9px;
     }
     .header-main-title {
       font-family: 'Orbitron', 'Noto Sans KR', sans-serif !important;
       font-size: 13px !important;
       font-weight: 800;
       color: #ffffff;
       margin: 0;
       letter-spacing: 0.5px;
       line-height: 1.15;
       white-space: nowrap;
     }
      .header-sub-info {
        font-family: 'Noto Sans KR', sans-serif;
        font-size: 8px;
        color: #a5b4fc;
        font-weight: 500;
        letter-spacing: 0.6px;
        line-height: 1.2;
      }
     .header-student-area {
       display: flex;
       gap: 12px;
       align-items: center;
       background: rgba(255,255,255,0.08);
       border-radius: 8px;
       padding: 6px 10px;
       border: 1px solid rgba(255,255,255,0.14);
     }
     .student-field {
       display: flex;
       align-items: center;
       gap: 6px;
     }
     .student-field label {
       font-family: 'Orbitron', sans-serif;
       font-size: 7.5px;
       color: #a5b4fc;
       font-weight: 700;
       text-transform: uppercase;
       letter-spacing: 1px;
     }
     .student-field-divider {
       width: 1px;
       height: 20px;
       background: linear-gradient(180deg, transparent, rgba(255,255,255,0.25), transparent);
     }
      .field-box {
        min-width: 58px;
        height: 24px;
        background: #ffffff;
        border-radius: 3px;
        padding: 0 5px;
        display: inline-flex;
        align-items: center;
        font-size: 9.5px;
        font-weight: 600;
        color: #1e293b;
        border: 1px solid rgba(0,0,0,0.10);
      }
     .field-name {
       min-width: 64px;
     }
     .score-box {
       min-width: 28px;
       text-align: center;
       justify-content: center;
     }
     .score-suffix {
       font-family: 'Orbitron', sans-serif;
       font-size: 9px;
       font-weight: 700;
       color: #d4a93a;
       margin-left: 3px;
     }


    /* ============ BRAINIAC THEME (subtle navy/gold) ============ */
    .brainiac-theme .test-header-minimal {
      background: linear-gradient(120deg, #0f2e6b 0%, #1e4fa8 100%);
      border-bottom: 2px solid #d4a93a;
      padding: 9px 14px;
    }
    .brainiac-theme .test-header-minimal::before {
      opacity: 0;
      background: none;
    }
    .brainiac-theme .test-header-minimal::after {
      background: none;
    }
    .brainiac-theme .header-logo {
      height: 30px;
      background: white;
      padding: 2px 4px;
      border-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    }
    .brainiac-theme .header-main-title {
      font-family: 'Orbitron', 'Noto Sans KR', sans-serif;
      font-size: 12px !important;
      letter-spacing: 0.3px;
      text-shadow: 0 1px 1px rgba(0,0,0,0.25);
      white-space: nowrap;
    }
    .brainiac-theme .header-main-title::before {
      content: 'BRAINIAC ENGLISH · ';
      color: #f0d375;
      font-weight: 800;
      letter-spacing: 0.3px;
    }
    .brainiac-theme .header-sub-info {
      color: #e6ecfb;
      font-weight: 600;
      font-size: 12px !important;
    }
    .brainiac-theme .student-field label {
      color: #f0d375;
    }
    .brainiac-theme .field-box {
      border-bottom: 1.5px solid #d4a93a;
    }
    .brainiac-theme .score-suffix {
      color: #f0d375;
    }
    .brainiac-theme .test-footer-minimal {
      border-top: 1px solid #d4a93a !important;
      background: none !important;
      padding-top: 5px !important;
      color: #0f2e6b !important;
      font-weight: 700;
      letter-spacing: 0.8px;
      font-size: 10px !important;
    }
    .brainiac-theme .test-footer-minimal::before {
      content: 'BRAINIAC ENGLISH';
      color: #0f2e6b;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
    .brainiac-theme .test-footer-minimal span:nth-child(2) {
      color: #0f2e6b !important;
    }
    .brainiac-theme .th-question,
    .brainiac-theme .th-answer,
    .brainiac-theme .th-no {
      background: #0f2e6b !important;
      color: white !important;
      border-color: #0f2e6b !important;
    }
    .brainiac-theme .test-table-modern tbody tr:nth-child(even) {
      background: #f5f8fd;
    }
    .brainiac-theme .spelling-hint {
      color: #0f2e6b !important;
    }

    /* Brainiac 정답지 헤더/푸터 - 동일한 톤다운 디자인 */
    .brainiac-theme .answer-header-minimal {
      background: linear-gradient(120deg, #0f2e6b 0%, #1e4fa8 100%) !important;
      border-bottom: 2px solid #d4a93a;
      position: relative;
      overflow: hidden;
    }
    .brainiac-theme .answer-header-minimal::after {
      content: '';
      position: absolute;
      inset: 0;
      background: none;
      pointer-events: none;
    }
    .brainiac-theme .answer-header-minimal > * { position: relative; z-index: 1; }
    .brainiac-theme .answer-label {
      color: #0f2e6b !important;
      background: #f0d375 !important;
      letter-spacing: 2px !important;
      border: 1px solid #d4a93a;
      font-size: 13px !important;
    }
    .brainiac-theme .answer-label::before { content: ''; }
    .brainiac-theme .answer-label::after { content: ''; }
    .brainiac-theme .answer-header-minimal .header-main-title::before {
      content: 'BRAINIAC · ';
      color: #f0d375;
      font-weight: 800;
    }
    .brainiac-theme .answer-footer-minimal {
      border-top: 1px solid #d4a93a !important;
      background: none !important;
      padding-top: 5px !important;
      color: #0f2e6b !important;
      font-weight: 700;
      letter-spacing: 0.8px;
      font-size: 10px !important;
    }
    .brainiac-theme .answer-footer-minimal::before {
      content: 'ANSWER KEY';
      color: #0f2e6b;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
    
    
    
    /* 정답지 헤더 (다크) */
    .answer-header-minimal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 14px 9px 11px;
      background: #064e3b;
      border: 1px solid #065f46;
      border-radius: 10px;
      margin-bottom: 6px;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.18);
    }
    .answer-header-minimal::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3.5px;
      background: linear-gradient(90deg, #064e3b 0%, #059669 30%, #6ee7b7 55%, #d4a93a 80%, #064e3b 100%);
      pointer-events: none;
    }
    .answer-header-minimal::after {
      content: '';
      position: absolute;
      inset: 0;
      background: none;
      pointer-events: none;
    }
    .answer-header-minimal > * { position: relative; z-index: 1; }
    .answer-header-minimal .header-brand {
      gap: 10px;
    }
    .answer-header-minimal .header-title-group {
      border-left-color: rgba(255,255,255,0.18);
    }
    .answer-label {
      font-family: 'Orbitron', sans-serif;
      font-size: 9.5px;
      font-weight: 800;
      color: #064e3b;
      background: #d4a93a;
      padding: 5px 14px;
      border-radius: 999px;
      letter-spacing: 2.5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      text-transform: uppercase;
    }
    .answer-header-minimal .header-main-title {
      font-size: 13px !important;
      color: #ffffff;
    }
    .answer-header-minimal .header-sub-info {
      color: #a7f3d0;
      font-size: 7.5px;
    }

    
    /* 테이블 컨테이너 */
    .test-table-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    
    /* 모던 테이블 - 꽉 차게 */
    .test-table-modern {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 10px;
    }
    .test-table-modern thead tr {
      background: #f1f5f9;
    }
    .test-table-modern th {
      font-weight: 600;
      font-size: 8px;
      color: #475569;
      padding: 4px 3px;
      text-align: center;
      border: 1px solid #e2e8f0;
      letter-spacing: 0.2px;
    }
    .th-no { }
    .th-question { text-align: left; padding-left: 5px !important; }

    .wide-question-table .td-question { font-size: 9px; font-weight: 600; }

    .test-table-modern tbody tr {
      height: 10.2mm;
    }
    .test-table-modern tbody tr:nth-child(even) {
      background: #fafbfc;
    }
    .test-table-modern td {
      border: 1px solid #e2e8f0;
      padding: 1px 3px;
      vertical-align: middle;
      font-size: 10px;
      line-height: 1.2;
    }
    .td-no {
      text-align: center;
      font-weight: 700;
      color: #64748b;
      font-size: 9px;
      background: #f8fafc;
    }
    .td-question {
      font-weight: 700;
      color: #1e293b;
      font-size: 10px;
      padding-left: 3px !important;
      position: relative;
    }
    .td-answer {
      border-left: 2px solid #cbd5e1 !important;
    }
    .td-answer-filled {
      border-left: 2px solid #86efac !important;
      background: #fafffe !important;
      font-weight: 700;
      color: #166534;
      font-size: 10px;
    }
    .td-empty {
      background: #fafafa !important;
    }

    /* 혼합형 전용 - 작은 폰트 유지 */
    .mixed-type tbody tr {
      height: 9.6mm;
    }
    .mixed-type td {
      font-size: 8.5px;
      line-height: 1.15;
      padding: 1px 2px;
    }
    .mixed-type .td-no {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1px 0;
      line-height: 1.1;
      font-size: 8px;
    }
    .mixed-type .td-no .mixed-type-label {
      display: flex;
      margin-bottom: 2px;
    }
    .mixed-type .td-no .question-number {
      font-size: 10.5px;
      font-weight: 800;
      color: #1e293b;
    }
    .mixed-type .td-question {
      font-size: 8.5px;
    }
    .mixed-type .td-answer-filled {
      font-size: 8.5px;
    }
    .spelling-hint {
      color: #7c3aed;
      font-weight: 700;
      font-size: 9px;
      margin-left: 2px;
    }
    
    /* 타입 도트 */
    .type-dot {
      display: inline-block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      margin-left: 5px;
      vertical-align: middle;
    }
    .dot-meaning { background: #3b82f6; }
    .dot-spelling { background: #a855f7; }
    
    /* 정답지 테이블 */
    .answer-table-modern thead tr {
      background: #d1fae5;
    }
    .answer-table-modern th {
      color: #166534;
    }
    /* 정답지 폰트 확대 (혼합형 제외) */
    .answer-table-modern:not(.mixed-type) td {
      font-size: 11px;
    }
    .answer-table-modern:not(.mixed-type) .td-no {
      font-size: 9.5px;
    }
    .answer-table-modern:not(.mixed-type) .td-question {
      font-size: 11px;
    }
    .answer-table-modern:not(.mixed-type) .td-answer-filled {
      font-size: 11px;
    }
    
    /* 의미쓰기 정답지 overflow 방지 */
    .answer-table-modern.meaning-layout-tight tbody td {
      height: 10.2mm;
      max-height: 10.2mm;
      overflow: hidden;
    }
    .answer-table-modern.meaning-layout-tight .td-answer-filled {
      font-size: 9px !important;
      line-height: 1.05;
      white-space: normal;
      word-break: keep-all;
      overflow-wrap: anywhere;
    }
    
    /* 미니멀 푸터 */
    .test-footer-minimal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      margin-top: 5px;
      background: linear-gradient(180deg, #ffffff 0%, #f6f7fd 100%);
      border: 1px solid #dfe2f2;
      border-top: 2px solid #d4a93a;
      border-radius: 8px;
      font-family: 'Orbitron', sans-serif;
      font-size: 7px;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      color: #8f93bb;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    .test-footer-minimal::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23312e81' stroke-opacity='0.07' stroke-width='0.7'%3E%3Cpath d='M0 10 L10 0 L20 10 L10 20 Z'/%3E%3C/g%3E%3C/svg%3E");
      pointer-events: none;
    }
    .test-footer-minimal span { position: relative; z-index: 1; }
    .test-footer-minimal span:nth-child(2) {
      font-weight: 800;
      letter-spacing: 3px;
      color: #312e81;
    }
    
    /* 정답지 푸터 */
    .answer-footer-minimal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      margin-top: 5px;
      background: linear-gradient(180deg, #ffffff 0%, #f5faf8 100%);
      border: 1px solid #d3e9df;
      border-top: 2px solid #d4a93a;
      border-radius: 8px;
      font-family: 'Orbitron', sans-serif;
      font-size: 7px;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      color: #85a89b;
      flex-shrink: 0;
    }
    .answer-footer-minimal span:nth-child(2) {
      font-weight: 800;
      letter-spacing: 2px;
      color: #064e3b;
    }


    /* BRAINIAC final overrides - subtle navy/gold */
    .test-page.brainiac-theme {
      position: relative !important;
      background: #ffffff !important;
      border: 1px solid #c9d4ec !important;
    }
    .test-page.brainiac-theme::before {
      content: 'BRAINIAC';
      position: absolute;
      right: 9mm;
      bottom: 12mm;
      z-index: 0;
      font-size: 34px;
      font-weight: 900;
      color: rgba(15,46,107,0.04);
      transform: rotate(-12deg);
      pointer-events: none;
    }
    .test-page.brainiac-theme > * { position: relative; z-index: 1; }
    .brainiac-theme .test-header-minimal,
    .brainiac-theme .answer-header-minimal {
      box-shadow: 0 2px 6px rgba(15,46,107,0.12) !important;
    }
    .brainiac-theme .test-table-modern {
      border: 1px solid #c9d4ec !important;
    }
    .brainiac-theme .td-no {
      background: #f5f8fd !important;
      color: #0f2e6b !important;
    }
    .brainiac-theme .mixed-type .td-no .question-number {
      color: #0f2e6b;
    }
    .brainiac-theme .td-answer,
    .brainiac-theme .td-answer-filled {
      border-left: 1px solid #d4a93a !important;
    }
    
    /* ========================================
       동반의어 시험지 V2 - 20문제/페이지 
       ======================================== */
    .sa-preview-container {
      width: 100%;
    }
    .sa-page {
      width: 210mm !important;
      height: 297mm !important;
      padding: 5mm 6mm !important;
      margin: 0 auto 20px !important;
      background: white !important;
      display: flex !important;
      flex-direction: column !important;
      page-break-after: always !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 4px;
    }
    .sa-page:last-child {
      page-break-after: auto !important;
    }
    
    /* 헤더 */
    .sa-header-v2 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 8px;
      border: none;
      background-color: transparent;
      height: auto;
      padding: 6px 10px;
      background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
      border-radius: 5px;
      margin-bottom: 4px;
    }
    .sa-header-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sa-header-logo {
      height: 22px;
      width: auto;
    }
    .sa-header-info {
      display: flex;
      flex-direction: column;
    }
    .sa-title {
      font-size: 12px;
      font-weight: 800;
      color: white;
      margin: 0;
    }
    .sa-subtitle {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 7px;
      color: rgba(255,255,255,0.85);
    }
    .sa-dot {
      opacity: 0.5;
    }
    .sa-badge {
      background: rgba(255,255,255,0.2);
      padding: 1px 5px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 6px;
    }
    .sa-header-fields {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .sa-field {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .sa-field label {
      font-size: 7px;
      color: rgba(255,255,255,0.8);
      font-weight: 600;
    }
    .sa-field-input {
      min-width: 45px;
      height: 16px;
      background: white;
      border-radius: 3px;
      padding: 0 5px;
      display: inline-flex;
      align-items: center;
      font-size: 8px;
      font-weight: 700;
      color: #4c1d95;
    }
    .sa-field-score {
      min-width: 26px;
    }
    .sa-field-total {
      font-size: 9px;
      font-weight: 800;
      color: white;
    }
    
    /* 안내 문구 */
    .sa-guide {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-left: 3px solid #a855f7;
      border-radius: 4px;
      padding: 4px 8px;
      margin-bottom: 4px;
      font-size: 8px;
      color: #581c87;
    }
    .sa-guide strong {
      color: #7c3aed;
    }
    .sa-guide em {
      font-style: normal;
      background: #a855f7;
      color: white;
      padding: 0 4px;
      border-radius: 2px;
      font-weight: 700;
      font-size: 7px;
    }
    
    /* 문제 그리드 - 2열, A4 가득 채우기 */
    .sa-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2px 4px;
      align-content: stretch;
    }
    
    /* 문제 아이템 - 더 밀도있게 */
    .sa-item {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 3px;
      padding: 4px 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .sa-item-header {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 3px;
    }
    .sa-item-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: white;
      font-weight: 800;
      font-size: 9px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .sa-item-word {
      font-size: 11px;
      font-weight: 800;
      color: #1e1b4b;
    }
    .sa-item-meaning {
      font-size: 9px;
      color: #6b7280;
      flex: 1;
    }
    .sa-item-ans {
      width: 22px;
      height: 16px;
      border: 1.5px solid #d1d5db;
      border-radius: 3px;
      background: #fafafa;
      flex-shrink: 0;
    }
    
    /* 7개 선택지 - 2줄 배치, 폰트 확대 */
    .sa-item-choices {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px 6px;
      margin-top: 2px;
    }
    .sa-item-choice {
      font-size: 10px;
      color: #1f2937;
      white-space: nowrap;
    }
    .sa-item-choice b {
      color: #7c3aed;
      margin-right: 1px;
    }
    .sa-item-choice b {
      color: #7c3aed;
      font-weight: 700;
      margin-right: 1px;
    }
    
    /* 빈 문제 행 스타일 */
    .sa-item-empty {
      opacity: 0.4;
    }
    .sa-item-empty .sa-item-num {
      background: #d1d5db;
    }
    .sa-choice-empty b {
      color: #d1d5db;
    }
    
    /* 푸터 */
    .sa-page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0 0;
      margin-top: auto;
      border-top: 1px solid #e5e7eb;
      font-size: 8px;
      color: #9ca3af;
      flex-shrink: 0;
    }
    .sa-page-brand {
      font-weight: 700;
      color: #7c3aed;
      letter-spacing: 1px;
    }
    
    /* ========================================
       동반의어 정답지 V2 - 컴팩트 
       ======================================== */
    .sa-ans-page {
      padding: 6mm !important;
      background: linear-gradient(180deg, #ecfdf5 0%, #fff 100%) !important;
    }
    .sa-ans-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      border-radius: 5px;
      margin-bottom: 6px;
    }
    .sa-ans-badge {
      background: white;
      color: #059669;
      font-size: 10px;
      font-weight: 900;
      padding: 3px 10px;
      border-radius: 4px;
      letter-spacing: 2px;
    }
    .sa-ans-title-wrap {
      flex: 1;
    }
    .sa-ans-title {
      font-size: 12px;
      font-weight: 800;
      color: white;
      margin: 0;
    }
    .sa-ans-meta {
      font-size: 8px;
      color: rgba(255,255,255,0.85);
    }
    
    /* 정답 그리드 - 2열 (관계+의미 표시용) */
    .sa-ans-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 4px;
      align-content: stretch;
    }
    .sa-ans-card {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 6px 10px;
      background: white;
      border: 1px solid #d1fae5;
      border-left: 4px solid #10b981;
      border-radius: 5px;
    }
    .sa-ans-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sa-ans-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #059669, #10b981);
      color: white;
      font-weight: 800;
      font-size: 9px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .sa-ans-word {
      font-size: 11px;
      font-weight: 800;
      color: #1f2937;
    }
    .sa-ans-meaning {
      font-size: 9px;
      color: #6b7280;
      flex: 1;
    }
    .sa-ans-result {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      padding: 4px 10px;
      border-radius: 4px;
    }
    .sa-ans-symbol {
      font-size: 14px;
      font-weight: 800;
      color: #059669;
    }
    .sa-ans-answer {
      font-size: 10px;
      font-weight: 700;
      color: #065f46;
    }
    .sa-ans-wrong-meaning {
      font-size: 9px;
      color: #6b7280;
      margin-left: 4px;
      font-style: italic;
    }
    /* 관계 표시 배지들 */
    .sa-ans-choices-info {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 2px;
    }
    .sa-ans-choice-tag {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 8px;
      padding: 2px 6px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .sa-ans-choice-tag.synonym {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
    }
    .sa-ans-choice-tag.antonym {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }
    .sa-ans-choice-tag b {
      font-weight: 700;
    }
    .sa-ans-footer {
      display: flex;
      justify-content: space-between;
      padding: 4px 0 0;
      margin-top: auto;
      border-top: 1px solid #d1fae5;
      font-size: 8px;
      color: #6b7280;
      flex-shrink: 0;
    }
    .sa-ans-footer-brand {
      font-weight: 700;
      color: #059669;
    }
    
    /* 의미쓰기+예문완성 결합 테이블 */
    .meaning-example-table td {
      font-size: 9px;
      line-height: 1.15;
    }
    .meaning-example-table .td-question {
      font-size: 10px;
    }
    .meaning-example-table .me-example-cell {
      font-size: 8.5px !important;
      font-weight: 600;
    }
    .meaning-example-table .td-answer-filled {
      font-size: 9px;
    }
    
    /* 1단 레이아웃 (ORUN VOCA 0/1/2, 25단어 이하) */
    .single-col-table td {
      font-size: 14px;
      line-height: 1.3;
    }
    .single-col-table .td-no {
      font-size: 12px;
    }
    .single-col-table .td-question {
      font-size: 14px;
      font-weight: 700;
      padding-left: 8px !important;
    }
    .single-col-table .td-answer-filled {
      font-size: 14px;
    }
    .single-col-table .spelling-hint {
      font-size: 11px;
    }
    .single-col-table th {
      font-size: 10px;
    }
    .single-col-wide-q .td-question {
      font-size: 11px !important;
    }
  `;
  const handlePrint = () => {
    const testPaperSection = document.getElementById('test-paper-section');
    const answerKeySection = document.getElementById('answer-key-section');
    if (answerKeySection) {
      answerKeySection.style.display = 'none';
    }
    if (testPaperSection) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>시험지 인쇄</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              ${getFullPrintStyles()}
            </style>
          </head>
          <body>
            <div class="test-paper-container">
              ${testPaperSection.innerHTML}
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 800);
      }
    }
    if (answerKeySection) {
      answerKeySection.style.display = 'block';
    }
  };
  const handlePrintAnswerKey = () => {
    const testPaperSection = document.getElementById('test-paper-section');
    const answerKeySection = document.getElementById('answer-key-section');
    if (testPaperSection) {
      testPaperSection.style.display = 'none';
    }
    if (answerKeySection) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>정답지 인쇄</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              ${getFullPrintStyles()}
            </style>
          </head>
          <body>
            <div class="test-paper-container">
              ${answerKeySection.innerHTML}
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 800);
      }
    }
    if (testPaperSection) {
      testPaperSection.style.display = 'block';
    }
  };
  const renderSynonymAntonymAnswerKey = (data: {
    title?: string;
    testTitle: string;
    selectedDays: string[];
    synonymAntonymQuestions?: SynonymAntonymQuestion[];
  }) => {
    const { title, testTitle, selectedDays, synonymAntonymQuestions } = data;

    if (!synonymAntonymQuestions || synonymAntonymQuestions.length === 0) {
      return <div className="text-center p-8 text-slate-500">정답이 없습니다.</div>;
    }

    // 페이지당 20문제 (2열 10행 - 관계 및 의미 표시 공간 확보)
    const questionsPerPage = 20;
    const pages: SynonymAntonymQuestion[][] = [];
    for (let i = 0; i < synonymAntonymQuestions.length; i += questionsPerPage) {
      pages.push(synonymAntonymQuestions.slice(i, i + questionsPerPage));
    }

    return (
      <div className="sa-preview-container">
        {pages.map((pageQuestions, pageIndex) =>
        <div key={pageIndex} className="sa-page sa-ans-page">
            {/* 정답지 헤더 */}
            <div className="sa-ans-header">
              <div className="sa-ans-badge">정답지</div>
              <div className="sa-ans-title-wrap">
                <h1 className="sa-ans-title">{testTitle}</h1>
                <span className="sa-ans-meta">{title} · {formatPartAndDays(selectedDays)} · 동반의어 {synonymAntonymQuestions.length}문제</span>
              </div>
            </div>
            
            {/* 정답 그리드 - 2열 */}
            <div className="sa-ans-grid">
              {pageQuestions.map((question, qIdx) => {
              const questionNum = pageIndex * questionsPerPage + qIdx + 1;
              const answerIdx = question.choices.findIndex((c) => c.isUnrelated);
              const answerSymbol = answerIdx >= 0 ? "①②③④⑤⑥⑦"[answerIdx] : "?";

              // 동의어/반의어 분리
              const synonyms = question.choices.filter((c) => c.relationship === 'synonym');
              const antonyms = question.choices.filter((c) => c.relationship === 'antonym');

              return (
                <div key={qIdx} className="sa-ans-card">
                    {/* 헤더: 번호 + 단어 + 뜻 */}
                    <div className="sa-ans-card-header">
                      <span className="sa-ans-num">{questionNum}</span>
                      <span className="sa-ans-word">{question.questionWord.word}</span>
                      <span className="sa-ans-meaning">{question.questionWord.meaning}</span>
                    </div>
                    
                    {/* 정답: 오답 단어 + 뜻 */}
                    <div className="sa-ans-result">
                      <span className="sa-ans-symbol">{answerSymbol}</span>
                      <span className="sa-ans-answer">{question.correctAnswer}</span>
                      <span className="sa-ans-wrong-meaning">
                        {question.choices.find((c) => c.isUnrelated)?.meaning || ''}
                      </span>
                    </div>
                    
                    {/* 동의어/반의어 관계 표시 */}
                    <div className="sa-ans-choices-info">
                      {synonyms.map((s, sIdx) =>
                    <span key={`syn-${sIdx}`} className="sa-ans-choice-tag synonym">
                          <b>동</b> {s.word} <span style={{ color: '#6b7280' }}>{s.meaning}</span>
                        </span>
                    )}
                      {antonyms.map((a, aIdx) =>
                    <span key={`ant-${aIdx}`} className="sa-ans-choice-tag antonym">
                          <b>반</b> {a.word} <span style={{ color: '#6b7280' }}>{a.meaning}</span>
                        </span>
                    )}
                    </div>
                  </div>);

            })}
            </div>
            
            {/* 정답지 푸터 */}
            <div className="sa-ans-footer">
              <span>{synonymAntonymQuestions.length}문제</span>
              <span className="sa-ans-footer-brand">{brandFooterText(testTitle)} · 동반의어 정답지</span>
              <span>{pageIndex + 1} / {pages.length}</span>
            </div>
          </div>
        )}
      </div>);

  };


  const renderSingleColumnAnswerKey = (data: {
    title?: string;
    testTitle: string;
    testType?: string;
    words: WordData[];
    selectedDays: string[];
  }) => {
    const { title, testTitle, testType = "meaning", words, selectedDays } = data;
    const isWriteWordType = testType === "example_completion" || testType === "english_definition";
    return (
      <div className="my-8">
        <div className={`test-page answer-page ${themeClass(testTitle)}`}>
          <div className="answer-header-minimal">
            <div className="header-brand">
              <span className="answer-label">정답지</span>
              <h1 className="header-main-title" style={headerTitleStyle(testTitle)}>{testTitle}</h1>
            </div>
            <span className="header-sub-info">
              {studentName && <span style={{ fontWeight: 700, marginRight: '6px' }}>{studentName}</span>}
              {title} · {formatPartAndDays(selectedDays)} · {words.length}문제
            </span>
          </div>
          <div className="test-table-container">
            {(() => {
              const isBrainiacMeaning = isBrainiacTitle(testTitle) && testType === "meaning";
              return (
            <table className={`test-table-modern answer-table-modern single-col-table ${isWriteWordType ? 'single-col-wide-q' : ''}`}>
              <colgroup>
                <col style={{width: '5%'}} />
                <col style={{width: isWriteWordType ? '60%' : '45%'}} />
                {isBrainiacMeaning ? (<><col style={{width: '35%'}} /><col style={{width: '15%'}} /></>) : (
                <col style={{width: isWriteWordType ? '35%' : '50%'}} />)}
              </colgroup>
              <thead>
                <tr>
                  <th className="th-no">#</th>
                  <th className="th-question">
                    {isWriteWordType ? (testType === "example_completion" ? "예문" : "영영풀이") :
                    testType === "spelling" ? "한글 뜻" : testType === "mixed" ? "문제" : "English"}
                  </th>
                  {isBrainiacMeaning ? (<><th className="th-answer-filled">뜻</th><th className="th-answer-filled">품사</th></>) : (
                  <th className="th-answer-filled">
                    {isWriteWordType ? "정답 (English)" :
                    testType === "spelling" ? "English" : testType === "mixed" ? "정답" : "뜻"}
                  </th>)}
                </tr>
              </thead>
              <tbody>
                {words.map((word, rowIdx) => {
                  const num = rowIdx + 1;
                  const isMeaning = testType === "meaning" || (testType === "mixed" && num % 2 === 1);
                  return (
                    <tr key={rowIdx}>
                      <td className="td-no">{num}</td>
                      <td className="td-question">
                        {testType === "example_completion" ? (word.example ? blankExample(word.example, word.word) : '(예문 없음)') :
                        testType === "english_definition" ? (word.englishDefinition || '(영영풀이 없음)') :
                        testType === "spelling" ? word.meaning :
                        testType === "mixed" ? isMeaning ? word.word : word.meaning :
                        word.word}
                      </td>
                      {isBrainiacMeaning ? (
                        <>
                          <td className="td-answer-filled">{stripPOSFromMeaning(word.meaning)}</td>
                          <td className="td-answer-filled">{extractPOSFromMeaning(word.meaning)}</td>
                        </>
                      ) : (
                      <td className="td-answer-filled">
                        {isWriteWordType ? word.word :
                        testType === "spelling" ? word.word :
                        testType === "mixed" ? isMeaning ? word.meaning : word.word :
                        word.meaning}
                      </td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
              );
            })()}
          </div>
          <div className="answer-footer-minimal">
            <span>{words.length}문제</span>
            <span>{brandFooterText(testTitle)}</span>
            <span>1/1</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAnswerKey = (data: {
    title?: string;
    testTitle: string;
    testType?: string;
    words: WordData[];
    selectedDays: string[];
    synonymAntonymQuestions?: SynonymAntonymQuestion[];
    mixedTypeAssignments?: MixableType[];
  }) => {
    // 혼합형 시험인 경우 별도 렌더링
    if (data.testType === "mixed") {
      return renderMixedAnswerKey(data);
    }
    // 다의어 시험인 경우 별도 렌더링
    if (data.testType === "polysemy") {
      return renderPolysemyAnswerKey(data);
    }
    // 동반의어 시험인 경우 별도 렌더링
    if (data.testType === "synonym_antonym") {
      return renderSynonymAntonymAnswerKey(data);
    }

    const {
      title,
      testTitle,
      testType = "meaning",
      words,
      selectedDays
    } = data;

    // ORUN VOCA 0/1/2 단일 Day (≤25단어) → 1단 정답지
    const isOrunVoca012 = title && (title.includes('ORUN VOCA 0') || title.includes('ORUN VOCA 1') || title.includes('ORUN VOCA 2'));
    if (isOrunVoca012 && words.length <= 25) {
      return renderSingleColumnAnswerKey(data);
    }

    const wordsPerPage = 50;
    const wordsPerColumn = 25;
    const pages: WordData[][] = [];
    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageWords = words.slice(i, i + wordsPerPage);
      pages.push(pageWords);
    }
    const isWriteWordType = testType === "example_completion" || testType === "english_definition";
    const typeLabel = testType === "meaning" ? "의미 쓰기 정답" : testType === "spelling" ? "철자 쓰기 정답" : testType === "example_completion" ? "예문완성 정답" : testType === "english_definition" ? "영영풀이 정답" : "혼합형 정답";
    return <div className="my-8">
        {pages.map((pageWords, pageIndex) => {
        const leftColumn = pageWords.slice(0, wordsPerColumn);
        const rightColumn = pageWords.slice(wordsPerColumn);
        return <div key={pageIndex} className={`test-page answer-page ${themeClass(testTitle)}`}>
              {/* 정답지 헤더 */}
              <div className="answer-header-minimal">
                <div className="header-brand">
                  <span className="answer-label">정답지</span>
                  <h1 className="header-main-title" style={headerTitleStyle(testTitle)}>{testTitle}</h1>
                </div>
                <span className="header-sub-info">
                  {studentName && <span style={{ fontWeight: 700, marginRight: '6px' }}>{studentName}</span>}
                  {title} · {formatPartAndDays(selectedDays)} · {words.length}문제
                </span>
              </div>
              
              {/* 테이블 */}
              <div className="test-table-container">
                {(() => {
                  const isBrainiacMeaning = isBrainiacTitle(testTitle) && testType === "meaning";
                  return (
                <table className={`test-table-modern answer-table-modern ${isWriteWordType ? 'wide-question-table' : ''} ${testType === 'mixed' ? 'mixed-type' : ''} ${testType === 'meaning' ? 'meaning-layout-tight' : ''}`}>
                  <colgroup>
                    <col style={{width: '4%'}} />
                    <col style={{width: isWriteWordType ? '35%' : testType === 'meaning' ? '14%' : '28%'}} />
                     {isBrainiacMeaning ? (<><col style={{width: '20%'}} /><col style={{width: '12%'}} /></>) : (
                     <col style={{width: isWriteWordType ? '11%' : testType === 'meaning' ? '32%' : '18%'}} />)}
                     <col style={{width: '4%'}} />
                     <col style={{width: isWriteWordType ? '35%' : testType === 'meaning' ? '14%' : '28%'}} />
                     {isBrainiacMeaning ? (<><col style={{width: '20%'}} /><col style={{width: '12%'}} /></>) : (
                     <col style={{width: isWriteWordType ? '11%' : testType === 'meaning' ? '32%' : '18%'}} />)}
                  </colgroup>
                  <thead>
                     <tr>
                      <th className="th-no">#</th>
                      <th className="th-question">{isWriteWordType ? (testType === "example_completion" ? "예문" : "영영풀이") : testType === "spelling" ? "한글 뜻" : testType === "mixed" ? "문제" : "English"}</th>
                      {isBrainiacMeaning ? (<><th className="th-answer-filled">뜻</th><th className="th-answer-filled">품사</th></>) : (
                      <th className="th-answer-filled">{isWriteWordType ? "정답 (English)" : testType === "spelling" ? "English" : testType === "mixed" ? "정답" : "뜻"}</th>)}
                      <th className="th-no">#</th>
                      <th className="th-question">{isWriteWordType ? (testType === "example_completion" ? "예문" : "영영풀이") : testType === "spelling" ? "한글 뜻" : testType === "mixed" ? "문제" : "English"}</th>
                      {isBrainiacMeaning ? (<><th className="th-answer-filled">뜻</th><th className="th-answer-filled">품사</th></>) : (
                      <th className="th-answer-filled">{isWriteWordType ? "정답 (English)" : testType === "spelling" ? "English" : testType === "mixed" ? "정답" : "뜻"}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: wordsPerColumn }).map((_, rowIdx) => {
                  const leftWord = leftColumn[rowIdx];
                  const rightWord = rightColumn[rowIdx];
                  const leftNum = pageIndex * wordsPerPage + rowIdx + 1;
                  const rightNum = pageIndex * wordsPerPage + wordsPerColumn + rowIdx + 1;
                  const leftIsMeaning = testType === "meaning" || testType === "mixed" && leftNum % 2 === 1;
                  const rightIsMeaning = testType === "meaning" || testType === "mixed" && rightNum % 2 === 1;

                  return (
                    <tr key={rowIdx}>
                          {leftWord ?
                      <>
                              <td className="td-no">{leftNum}</td>
                               <td className="td-question">
                                {testType === "example_completion" ? (leftWord.example ? blankExample(leftWord.example, leftWord.word) : '(예문 없음)') :
                          testType === "english_definition" ? (leftWord.englishDefinition || '(영영풀이 없음)') :
                          testType === "spelling" ? leftWord.meaning :
                          testType === "mixed" ? leftIsMeaning ? leftWord.word : leftWord.meaning :
                          leftWord.word}
                               </td>
                               {isBrainiacMeaning ? (
                                 <>
                                   <td className="td-answer-filled">{stripPOSFromMeaning(leftWord.meaning)}</td>
                                   <td className="td-answer-filled">{extractPOSFromMeaning(leftWord.meaning)}</td>
                                 </>
                               ) : (
                               <td className="td-answer-filled">
                                {isWriteWordType ? leftWord.word :
                          testType === "spelling" ? leftWord.word :
                          testType === "mixed" ? leftIsMeaning ? leftWord.meaning : leftWord.word :
                          leftWord.meaning}
                               </td>)}
                            </> :

                      <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              {isBrainiacMeaning ? (<><td className="td-answer-filled td-empty"></td><td className="td-answer-filled td-empty"></td></>) : (<td className="td-answer-filled td-empty"></td>)}
                            </>
                      }
                          
                          {rightWord ?
                      <>
                              <td className="td-no">{rightNum}</td>
                               <td className="td-question">
                                {testType === "example_completion" ? (rightWord.example ? blankExample(rightWord.example, rightWord.word) : '(예문 없음)') :
                          testType === "english_definition" ? (rightWord.englishDefinition || '(영영풀이 없음)') :
                          testType === "spelling" ? rightWord.meaning :
                          testType === "mixed" ? rightIsMeaning ? rightWord.word : rightWord.meaning :
                          rightWord.word}
                               </td>
                               {isBrainiacMeaning ? (
                                 <>
                                   <td className="td-answer-filled">{stripPOSFromMeaning(rightWord.meaning)}</td>
                                   <td className="td-answer-filled">{extractPOSFromMeaning(rightWord.meaning)}</td>
                                 </>
                               ) : (
                               <td className="td-answer-filled">
                                {isWriteWordType ? rightWord.word :
                          testType === "spelling" ? rightWord.word :
                          testType === "mixed" ? rightIsMeaning ? rightWord.meaning : rightWord.word :
                          rightWord.meaning}
                               </td>)}
                            </> :

                      <>
                              <td className="td-no td-empty"></td>
                              <td className="td-question td-empty"></td>
                              {isBrainiacMeaning ? (<><td className="td-answer-filled td-empty"></td><td className="td-answer-filled td-empty"></td></>) : (<td className="td-answer-filled td-empty"></td>)}
                            </>
                      }
                        </tr>);

                })}
                  </tbody>
                </table>
                  );
                })()}
              </div>
              
              {/* 정답지 푸터 */}
              <div className="answer-footer-minimal">
                <span>{words.length}문제</span>
                <span>{brandFooterText(testTitle)}</span>
                <span>{pageIndex + 1}/{pages.length}</span>
              </div>
            </div>;
      })}
      </div>;
  };
  if (loading) {
    return <FullPageLoading message="로딩 중..." />;
  }
  return <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        <PageHeader title="단어 시험지 생성" subtitle="단어장과 옵션을 선택하여 시험지를 생성하세요" icon={testPaperIcon} iconAlt="시험지">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2 bg-[#1a1a1a] border-[#5c5142] text-white hover:bg-[#8b7355] backdrop-blur-sm shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
        </PageHeader>
        <div className="mt-5 flex flex-col items-center text-center">
          <p className="text-[11px] md:text-[13px] font-semibold text-[#1a1a1a] uppercase" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.32em" }}>
            VERITAS QUIZ MAKER
          </p>
          <div className="mt-2.5 h-px w-32 bg-gradient-to-r from-transparent via-[#8b7355]/60 to-transparent" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Options */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Step 1: 단어장 선택 */}
            <div className="rounded-[16px] bg-white ring-1 ring-[#ece5d9] shadow-[0_2px_8px_rgba(43,36,28,0.05),0_18px_40px_-30px_rgba(43,36,28,0.32)] overflow-hidden transition-shadow hover:shadow-[0_4px_14px_rgba(43,36,28,0.07),0_22px_46px_-30px_rgba(43,36,28,0.38)]">
              <div className="relative px-5 py-4 flex items-center gap-3 border-b border-[#f2ece2] bg-white">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9b99a] to-transparent" />
                <span className="w-6 h-6 rounded-full bg-[#201a14] flex items-center justify-center text-[11px] font-bold text-white tabular-nums">1</span>
                <BookOpen className="w-3.5 h-3.5 text-[#8b7355]" strokeWidth={1.75} />
                <h2 className="text-[14px] font-bold tracking-[-0.02em] text-[#1a1a1a]">단어장 선택</h2>
              </div>

              <div>
                <RadioGroup value={selectedCardSet} onValueChange={(val) => {
                  if (val !== selectedCardSet) {
                    setSelectedDays([]);
                    setGeneratedTest(null);
                    setGeneratedMultiTests([]);
                    setMultiRanges([]);
                  }
                  setSelectedCardSet(val);
                }}>
                  {(() => {
                    const categorize = (title: string) => {
                      if (/ORUN VOCA|Ultimate/i.test(title)) return 'orun';
                      if (/능률/.test(title)) return 'neungyul';
                      return 'others';
                    };
                    const groups: Record<string, typeof cardSets> = { orun: [], neungyul: [], others: [] };
                    cardSets.forEach((cs) => { groups[categorize(cs.title)].push(cs); });
                    const sections: Array<{ key: 'orun' | 'neungyul' | 'others'; label: string; accent: string }> = [
                      { key: 'orun', label: 'ORUN VOCA / Ultimate', accent: 'from-[#f5f1e8] to-white text-[#8b7355] border-[#c9b99a]' },
                      { key: 'neungyul', label: '능률보카', accent: 'from-blue-50 to-white text-blue-700 border-blue-200' },
                      { key: 'others', label: '기타 단어장', accent: 'from-[#faf8f5] to-white text-[#5c5142] border-[#e3d9c8]' },
                    ];
                    return (
                      <div className="divide-y divide-[#e3d9c8]">
                        {sections.map((sec) => groups[sec.key].length > 0 && (
                          <div key={sec.key}>
                            <div className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r ${sec.accent} border-y`}>
                              {sec.label} <span className="opacity-50 font-semibold">({groups[sec.key].length})</span>
                            </div>
                            {groups[sec.key].map((cardSet) => (
                              <Label key={cardSet.id} htmlFor={cardSet.id} className={`relative flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all text-xs ${selectedCardSet === cardSet.id ? 'bg-[#1a1a1a] text-white shadow-[inset_3px_0_0_0_#d4a93a]' : 'hover:bg-[#faf8f5]'}`}>
                                <RadioGroupItem value={cardSet.id} id={cardSet.id} className={selectedCardSet === cardSet.id ? 'border-[#c9b99a] text-[#d4a93a]' : ''} />
                                <span className="font-medium">{cardSet.title}</span>
                                {selectedCardSet === cardSet.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#d4a93a] ml-auto" />}

                              </Label>
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </RadioGroup>
              {/* 파생어 포함 옵션 */}
              {selectedCardSet && (() => {
                const selected = cardSets.find(cs => cs.id === selectedCardSet);
                const hasDerivatives = selected?.word_data?.some((item: any) => item.isDerivative);
                if (!hasDerivatives) return null;
                const totalWords = selected?.word_data?.length || 0;
                const mainWords = selected?.word_data?.filter((item: any) => !item.isDerivative).length || 0;
                const derivWords = totalWords - mainWords;
                return (
                  <div className="px-3 py-2 border-t border-[#e3d9c8] bg-[#faf8f5]/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#a8977c]" />
                      <div>
                        <p className="text-[11px] font-medium text-[#5c5142]">파생어 포함</p>
                        <p className="text-[9px] text-[#a8977c]">
                          {includeDerivatives 
                            ? `표제어 ${mainWords}개 + 파생어 ${derivWords}개 = 총 ${totalWords}개 출제` 
                            : `표제어 ${mainWords}개만 출제 (파생어 ${derivWords}개 제외)`}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={includeDerivatives} onChange={(e) => setIncludeDerivatives(e.target.checked)} className="sr-only peer" />
                      <div className="w-8 h-4 bg-[#e3d9c8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c9b99a] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#8b7355]"></div>
                    </label>
                  </div>
                );
              })()}
              </div>
            </div>
            {selectedCardSet && <div>
                <div className="relative rounded-[16px] bg-white ring-1 ring-[#ece5d9] shadow-[0_2px_8px_rgba(43,36,28,0.05),0_18px_40px_-30px_rgba(43,36,28,0.32)] overflow-hidden transition-shadow hover:shadow-[0_4px_14px_rgba(43,36,28,0.07),0_22px_46px_-30px_rgba(43,36,28,0.38)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9b99a] to-transparent pointer-events-none" />
                  {/* 모드 선택 탭 */}
                  <div className="flex items-center border-b border-[#e3d9c8]">
                    <button
                      onClick={() => { setDaySelectionMode('single'); setMultiRanges([]); }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-[13px] font-bold tracking-[-0.02em] transition-colors relative ${
                        daySelectionMode === 'single'
                          ? 'bg-white text-[#1a1a1a]'
                          : 'bg-[#faf8f5]/60 text-[#a8977c] hover:text-[#5c5142] hover:bg-white'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums transition-colors ${daySelectionMode === 'single' ? 'bg-[#201a14] text-white' : 'bg-[#f0ebe3] text-[#a8977c]'}`}>2</span>
                      <Calendar className={`w-3.5 h-3.5 ${daySelectionMode === 'single' ? 'text-[#a8977c]' : 'text-[#c9b99a]'}`} strokeWidth={1.75} />
                      <span>Day 선택</span>
                      {daySelectionMode === 'single' && selectedDays.length > 0 && <span className="text-[10px] font-semibold text-[#5c5142] bg-[#f0ebe3] px-1.5 py-0.5 rounded-full tabular-nums">{selectedDays.length}</span>}
                      {daySelectionMode === 'single' && <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-[#1a1a1a]" />}
                    </button>
                    <div className="w-px h-6 bg-[#f0ebe3]" />
                    <button
                      onClick={() => { setDaySelectionMode('multi'); setSelectedDays([]); }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-[13px] font-bold tracking-[-0.02em] transition-colors relative ${
                        daySelectionMode === 'multi'
                          ? 'bg-white text-[#1a1a1a]'
                          : 'bg-[#faf8f5]/60 text-[#a8977c] hover:text-[#5c5142] hover:bg-white'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${daySelectionMode === 'multi' ? 'bg-[#f5f1e8]0 text-white' : 'bg-[#e3d9c8] text-[#a8977c]'}`}>✦</span>
                      <span>멀티 범위 생성</span>
                      {daySelectionMode === 'multi' && multiRanges.length > 0 && <span className="text-[10px] font-semibold text-[#8b7355] bg-[#f5f1e8] px-1.5 py-0.5 rounded-full tabular-nums">{multiRanges.length}</span>}
                      {daySelectionMode === 'multi' && <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-[#f5f1e8]0" />}
                    </button>
                  </div>

                  {/* Day 선택 모드 */}
                  {daySelectionMode === 'single' && (
                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-[#a8977c] whitespace-nowrap">범위</span>
                        <Input type="number" inputMode="numeric" min={1} max={getAvailableDays().length} placeholder="시작" value={dayRangeStart} onChange={(e) => setDayRangeStart(e.target.value)} className="w-16 h-8 text-center text-xs border-[#e3d9c8] rounded bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <span className="text-[#c9b99a] font-bold text-[10px]">~</span>
                        <Input type="number" inputMode="numeric" min={1} max={getAvailableDays().length} placeholder="끝" value={dayRangeEnd} onChange={(e) => setDayRangeEnd(e.target.value)} className="w-16 h-8 text-center text-xs border-[#e3d9c8] rounded bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <Button size="sm" className="h-8 px-4 text-[11px] font-semibold rounded" onClick={() => {
                          const start = parseInt(dayRangeStart || '0');
                          const end = parseInt(dayRangeEnd || '0');
                          if (start > 0 && end >= start) {
                            const availableDays = getAvailableDays();
                            const newSelectedDays: string[] = [];
                            for (let i = start; i <= end; i++) {
                              const dayMatch = availableDays.find((d) => {
                                const num = parseInt(d.replace(/\D/g, '')) || 0;
                                return num === i;
                              });
                              if (dayMatch) newSelectedDays.push(dayMatch);
                            }
                            setSelectedDays(newSelectedDays);
                            setDayRangeStart('');
                            setDayRangeEnd('');
                          }
                        }}>적용</Button>
                        {selectedDays.length > 0 && <Button size="sm" variant="ghost" className="h-8 px-2 text-[10px] text-[#a8977c] hover:text-red-500" onClick={() => setSelectedDays([])}>초기화</Button>}
                      </div>
                      {(() => {
                        const allDays = getAvailableDays();
                        // [Part X] DAY XX 형식 그룹화 체크
                        const partGroups: Record<string, string[]> = {};
                        const ungroupedDays: string[] = [];
                        allDays.forEach(day => {
                          const partMatch = day.match(/^\[([^\]]+)\]\s+/);
                          if (partMatch) {
                            const partName = partMatch[1];
                            if (!partGroups[partName]) partGroups[partName] = [];
                            partGroups[partName].push(day);
                          } else {
                            ungroupedDays.push(day);
                          }
                        });
                        const hasKorean = (s: string) => /[\u3131-\uD79D]/.test(s);
                        const partKeys = Object.keys(partGroups).sort((a, b) => {
                          const ak = hasKorean(a) ? 1 : 0;
                          const bk = hasKorean(b) ? 1 : 0;
                          return ak - bk;
                        });
                        if (partKeys.length > 1) {
                          return (
                            <div className="space-y-2.5">
                              {partKeys.map((partName, idx) => {
                                const partDays = partGroups[partName];
                                return (
                                  <div key={partName} className="relative overflow-hidden rounded-[4px] bg-white ring-1 ring-[#e3d9c8] shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3">
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9b99a] to-transparent" />
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[11px] font-semibold tracking-[-0.01em] text-[#1a1a1a]">{partName}</span>
                                      <button onClick={() => {
                                        const allSelected = partDays.every(d => selectedDays.includes(d));
                                        if (allSelected) {
                                          setSelectedDays(prev => prev.filter(d => !partDays.includes(d)));
                                        } else {
                                          setSelectedDays(prev => [...new Set([...prev, ...partDays])]);
                                        }
                                      }} className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-[#f0ebe3] hover:bg-[#e3d9c8] text-[#5c5142] transition">
                                        {partDays.every(d => selectedDays.includes(d)) ? '해제' : '전체'}
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {partDays.map(day => {
                                        const dayLabel = day.replace(/^\[[^\]]+\]\s+/, '').replace('DAY ', '').replace('Day ', '');
                                        const isOn = selectedDays.includes(day);
                                        return (
                                          <button key={day} onClick={() => handleDayToggle(day)} className={`w-7 h-7 rounded-[3px] text-[10.5px] font-semibold tabular-nums transition-all duration-200 ${isOn ? 'bg-[#1a1a1a] text-white shadow-[0_4px_10px_-4px_rgba(15,23,42,0.5)]' : 'bg-[#faf8f5] ring-1 ring-[#e3d9c8]/70 text-[#5c5142] hover:bg-white hover:ring-[#c9b99a]'}`}>
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
                          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                            {allDays.map((day) => {
                              const isOn = selectedDays.includes(day);
                              return (
                                <button key={day} onClick={() => handleDayToggle(day)} className={`px-1 py-1.5 rounded-[3px] text-[10.5px] font-semibold tabular-nums transition-all duration-200 ${isOn ? 'bg-[#1a1a1a] text-white shadow-[0_4px_10px_-4px_rgba(15,23,42,0.5)]' : 'bg-white text-[#5c5142] ring-1 ring-[#e3d9c8]/70 hover:ring-[#c9b99a]'}`}>
                                  {day.replace('Day ', 'DAY ')}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* 멀티 범위 모드 */}
                  {daySelectionMode === 'multi' && (
                    <div className="p-3 space-y-2">
                      <div className="flex justify-end gap-1.5">
                        {multiRanges.length > 0 && (
                          <Button size="sm" onClick={() => { setMultiRanges([]); setGeneratedMultiTests([]); }} className="h-6 px-2.5 text-[10px] font-semibold rounded-md bg-[#f0ebe3] hover:bg-[#e3d9c8] text-[#a8977c] border border-[#e3d9c8] shadow-none">
                            <RotateCcw className="w-3 h-3 mr-1" /> 초기화
                          </Button>
                        )}
                        <Button size="sm" onClick={addMultiRange} className="h-6 px-2.5 text-[10px] font-semibold rounded-md bg-[#f0ebe3] hover:bg-[#e3d9c8] text-[#8b7355] border border-[#c9b99a] shadow-none">
                          <Plus className="w-3 h-3 mr-1" /> 범위 추가
                        </Button>
                      </div>
                      {multiRanges.length > 0 && <div className="space-y-1.5">
                          {multiRanges.map((range, idx) =>
                            <div key={range.id} className="flex flex-wrap items-center gap-2 p-2.5 bg-[#faf8f5] rounded border border-[#e3d9c8]">
                              <span className="w-5 h-5 rounded bg-[#8b7355] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                              {/* Part selector - only show when parts exist */}
                              {getAvailableParts().length > 1 && (
                                <select
                                  value={range.part}
                                  onChange={(e) => updateMultiRange(range.id, 'part', e.target.value)}
                                  className="h-8 px-1.5 text-[10px] font-medium rounded border border-blue-200 bg-blue-50 text-blue-700 outline-none focus:ring-1 focus:ring-blue-300"
                                >
                                  <option value="">전체 파트</option>
                                  {getAvailableParts().map(part => (
                                    <option key={part} value={part}>{part}</option>
                                  ))}
                                </select>
                              )}
                              <span className="text-[11px] text-[#a8977c] whitespace-nowrap">Day</span>
                              <Input type="number" inputMode="numeric" min={1} max={getAvailableDays().length} value={range.startDay === "" ? "" : range.startDay} onChange={(e) => updateMultiRange(range.id, 'startDay', e.target.value === "" ? "" : (parseInt(e.target.value) || ""))} onFocus={(e) => e.currentTarget.select()} className="w-14 h-8 text-center text-xs border-[#e3d9c8] rounded bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              <span className="text-[#c9b99a] text-[10px]">~</span>
                              <Input type="number" inputMode="numeric" min={1} max={getAvailableDays().length} value={range.endDay === "" ? "" : range.endDay} onChange={(e) => updateMultiRange(range.id, 'endDay', e.target.value === "" ? "" : (parseInt(e.target.value) || ""))} onFocus={(e) => e.currentTarget.select()} className="w-14 h-8 text-center text-xs border-[#e3d9c8] rounded bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              <div className="h-5 w-px bg-[#e3d9c8]" />
                              <select
                                value={range.testType}
                                onChange={(e) => updateMultiRange(range.id, 'testType', e.target.value)}
                                className="h-8 px-1.5 text-[10px] font-medium rounded border border-[#e3d9c8] bg-white text-[#5c5142] outline-none focus:ring-1 focus:ring-[#c9b99a]"
                              >
                                <option value="meaning">의미쓰기</option>
                                <option value="spelling">스펠링</option>
                                <option value="mixed">혼합형</option>
                                <option value="example_completion">예문완성</option>
                                <option value="english_definition">영영풀이</option>
                                
                              </select>
                              <div className="h-5 w-px bg-[#e3d9c8]" />
                              <Input type="number" inputMode="numeric" min={1} placeholder="전체" value={range.questionCount === "all" ? "" : range.questionCount} onChange={(e) => updateMultiRange(range.id, 'questionCount', e.target.value === "" ? "all" : parseInt(e.target.value) || "all")} onFocus={(e) => e.currentTarget.select()} className="w-16 h-8 text-center text-xs border-[#e3d9c8] rounded bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              <span className="text-[9px] text-[#a8977c]">문제</span>
                              <button onClick={() => updateMultiRange(range.id, 'orderType', range.orderType === 'random' ? 'original' : 'random')} className={`px-1.5 py-0.5 text-[9px] font-medium rounded border ${range.orderType === 'random' ? 'bg-[#8b7355] text-white border-[#5c5142]' : 'bg-white text-[#a8977c] border-[#e3d9c8]'}`}>
                                {range.orderType === 'random' ? '랜덤' : '순서'}
                              </button>
                              <button onClick={() => removeMultiRange(range.id)} className="p-0.5 text-[#c9b99a] hover:text-red-500 rounded flex-shrink-0">
                                <Trash2 className="w-3 h-3" />
                              </button>
                              {range.part && (() => {
                                const partDays = getAvailableDays().filter(d => d.startsWith(`[${range.part}]`));
                                const partWords = getWordsForDays(partDays);
                                return (
                                  <div className="basis-full text-[10px] text-[#a8977c] pl-7">
                                    {range.part} · Day {partDays.length}개 · 단어 {partWords.length}개
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                          <Button onClick={handleGenerateMultiTest} disabled={isGenerating || multiRanges.length === 0} className="w-full h-8 mt-1 text-xs font-semibold rounded">
                            <Printer className="w-3.5 h-3.5 mr-1.5" />
                            {isGenerating ? "생성 중..." : `${multiRanges.length}개 범위 한번에 생성`}
                          </Button>
                        </div>}
                    </div>
                  )}
                </div>
              </div>}

            {/* Step 3: 문제 개수 */}
            {selectedDays.length > 0 && multiRanges.length === 0 && <div>
                <div className="rounded-[16px] bg-white ring-1 ring-[#ece5d9] shadow-[0_2px_8px_rgba(43,36,28,0.05),0_18px_40px_-30px_rgba(43,36,28,0.32)] overflow-hidden transition-shadow hover:shadow-[0_4px_14px_rgba(43,36,28,0.07),0_22px_46px_-30px_rgba(43,36,28,0.38)]">
                  <div className="relative px-5 py-4 flex items-center gap-3 border-b border-[#f2ece2]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9b99a] to-transparent" />
                    <span className="w-6 h-6 rounded-full bg-[#201a14] flex items-center justify-center text-[11px] font-bold text-white tabular-nums">3</span>
                    <Hash className="w-3.5 h-3.5 text-[#a8977c]" strokeWidth={1.75} />
                    <h2 className="text-[14px] font-bold tracking-[-0.02em] text-[#1a1a1a]">문제 개수</h2>
                  </div>
                  {testType === 'mixed' ? (
                    <div className="p-3 space-y-2">
                      <p className="text-[10px] text-[#a8977c]">혼합형은 아래 시험지 유형 단계에서 각 유형별 문제 개수를 직접 설정합니다.</p>
                      <div className="flex items-center gap-2 px-2.5 py-2 rounded-[3px] bg-[#faf8f5] ring-1 ring-[#e3d9c8]/70">
                        <span className="text-[10px] font-semibold text-[#5c5142] uppercase tracking-[0.12em]">선택 Day 단어</span>
                        <span className="ml-auto text-sm font-bold text-[#1a1a1a]">
                          {getWordsForSelectedDays().length}개
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-2 rounded-[3px] bg-[#f5f1e8]/70 ring-1 ring-[#c9b99a]/70">
                        <span className="text-[10px] font-semibold text-[#8b7355] uppercase tracking-[0.12em]">선택 문항</span>
                        <span className="ml-auto text-sm font-bold text-[#8b7355]">
                          {mixedSelectedTypes.reduce((acc, t) => acc + (mixedTypeCounts[t] ?? 0), 0)} / {getWordsForSelectedDays().length}문제
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 p-3">
                      <div className="flex items-center gap-2 px-2.5 py-2 rounded-[3px] bg-[#faf8f5] ring-1 ring-[#e3d9c8]/70">
                        <span className="text-[10px] font-semibold text-[#5c5142] uppercase tracking-[0.12em]">선택 Day 단어</span>
                        <span className="ml-auto text-sm font-bold text-[#1a1a1a]">
                          {getWordsForSelectedDays().length}개
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input type="number" min="1" placeholder="전체" value={questionCount === "all" ? "" : questionCount} onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === null) { setQuestionCount("all"); }
                          else { const num = parseInt(value, 10); if (!isNaN(num) && num > 0) setQuestionCount(num); }
                        }} className="w-20 h-8 text-center text-sm font-semibold border-[#e3d9c8] rounded bg-white" />
                        <span className="text-xs text-[#a8977c]">
                          {questionCount === "all" ? `전체 문제 출제 (${getWordsForSelectedDays().length}문제)` : `${questionCount} / ${getWordsForSelectedDays().length}문제 출제`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>}

            {/* Step 4: 시험지 유형 */}
            {(selectedDays.length > 0 || multiRanges.length > 0) && <div>
                <div className="rounded-[16px] bg-white ring-1 ring-[#ece5d9] shadow-[0_2px_8px_rgba(43,36,28,0.05),0_18px_40px_-30px_rgba(43,36,28,0.32)] overflow-hidden transition-shadow hover:shadow-[0_4px_14px_rgba(43,36,28,0.07),0_22px_46px_-30px_rgba(43,36,28,0.38)]">
                  <div className="relative px-5 py-4 flex items-center gap-3 border-b border-[#f2ece2]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9b99a] to-transparent" />
                    <span className="w-6 h-6 rounded-full bg-[#201a14] flex items-center justify-center text-[11px] font-bold text-white tabular-nums">4</span>
                    <PenTool className="w-3.5 h-3.5 text-[#a8977c]" strokeWidth={1.75} />
                    <h2 className="text-[14px] font-bold tracking-[-0.02em] text-[#1a1a1a]">시험지 유형</h2>
                  </div>
                  <div className="p-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {[{
                      id: 'meaning', title: '의미 쓰기', desc: '영어 → 한글', abbr: 'M'
                    }, {
                      id: 'spelling', title: '철자 쓰기', desc: '한글 → 영어', abbr: 'S'
                    }, {
                      id: 'mixed', title: '혼합형', desc: '선택한 유형 밸런스 혼합', abbr: 'X'
                    }, {
                      id: 'polysemy', title: '다의어', desc: '선택한 뜻만 빈칸 출제', abbr: 'P'
                    }, {
                      id: 'example_completion', title: '예문완성', desc: '예문 빈칸에 철자 쓰기', abbr: 'EC'
                    }, {
                      id: 'english_definition', title: '영영풀이', desc: '영영뜻 보고 철자 쓰기', abbr: 'ED'
                    }].map((type) => <button key={type.id} onClick={() => setTestType(type.id as any)} className={`p-2.5 rounded text-left transition-colors border text-xs ${testType === type.id ? 'bg-[#8b7355] text-white border-[#5c5142]' : 'bg-white border-[#e3d9c8] hover:bg-[#faf8f5]'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${testType === type.id ? 'bg-white/20' : 'bg-[#f0ebe3] text-[#a8977c]'}`}>{type.abbr}</span>
                          <div>
                            <div className="font-semibold text-xs">{type.title}</div>
                            <div className={`text-[10px] ${testType === type.id ? 'text-white/60' : 'text-[#a8977c]'}`}>{type.desc}</div>
                          </div>
                        </div>
                      </button>)}
                  </div>

                  {/* 혼합형 하위 유형 선택 + 유형별 개수 */}
                  {testType === 'mixed' && (
                    <div className="px-3 pb-3 pt-1">
                      <div className="p-2.5 rounded-[3px] bg-[#faf8f5] border border-[#e3d9c8] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-[#a8977c] uppercase tracking-wider">혼합할 유형 + 유형별 문제 개수</span>
                          <span className="text-[9px] text-[#a8977c]">
                            {mixedSelectedTypes.length}개 · 합계 {mixedSelectedTypes.reduce((acc, t) => acc + (mixedTypeCounts[t] ?? 0), 0)}문제
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {([
                            { id: 'meaning' as MixableType, title: '의미 쓰기', abbr: 'M', color: '#3b82f6' },
                            { id: 'spelling' as MixableType, title: '철자 쓰기', abbr: 'S', color: '#a855f7' },
                            { id: 'example_completion' as MixableType, title: '예문완성', abbr: 'EC', color: '#10b981' },
                            { id: 'english_definition' as MixableType, title: '영영풀이', abbr: 'ED', color: '#f59e0b' },
                          ]).map((subType) => {
                            const isSelected = mixedSelectedTypes.includes(subType.id);
                            const canDeselect = mixedSelectedTypes.length > 2 || !isSelected;
                            return (
                              <div
                                key={subType.id}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all border ${
                                  isSelected
                                    ? 'bg-white border-[#c9b99a] shadow-sm'
                                    : 'bg-transparent border-transparent text-[#a8977c]'
                                } ${!canDeselect ? 'opacity-60' : ''}`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSelected && mixedSelectedTypes.length <= 2) return;
                                    setMixedSelectedTypes(prev =>
                                      isSelected
                                        ? prev.filter(t => t !== subType.id)
                                        : [...prev, subType.id]
                                    );
                                  }}
                                  className="flex items-center gap-2 flex-1 min-w-0 text-left hover:opacity-80"
                                >
                                  <span
                                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                    style={{ background: isSelected ? subType.color : '#cbd5e1' }}
                                  >{subType.abbr}</span>
                                  <span className={`truncate ${isSelected ? 'text-[#5c5142]' : 'text-[#a8977c]'}`}>{subType.title}</span>
                                  {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                                </button>
                                <Input
                                  type="number"
                                  min="0"
                                  value={mixedTypeCounts[subType.id] ?? 0}
                                  disabled={!isSelected}
                                  onChange={(e) => {
                                    const n = parseInt(e.target.value, 10);
                                    setMixedTypeCounts(prev => ({ ...prev, [subType.id]: isNaN(n) || n < 0 ? 0 : n }));
                                  }}
                                  onFocus={(e) => e.currentTarget.select()}
                                  className="w-14 h-7 text-center text-[11px] font-semibold border-[#e3d9c8] rounded bg-white px-1"
                                />
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[9px] text-[#a8977c] mt-1">
                          각 유형별 문제 개수를 직접 입력하세요 · 총 문항 수는 합계로 결정됩니다
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>}

            {/* Step 5: 단어 순서 */}
            {(selectedDays.length > 0 || multiRanges.length > 0) && <div>
                <div className="rounded-[16px] bg-white ring-1 ring-[#ece5d9] shadow-[0_2px_8px_rgba(43,36,28,0.05),0_18px_40px_-30px_rgba(43,36,28,0.32)] overflow-hidden transition-shadow hover:shadow-[0_4px_14px_rgba(43,36,28,0.07),0_22px_46px_-30px_rgba(43,36,28,0.38)]">
                  <div className="relative px-5 py-4 flex items-center gap-3 border-b border-[#f2ece2]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9b99a] to-transparent" />
                    <span className="w-6 h-6 rounded-full bg-[#201a14] flex items-center justify-center text-[11px] font-bold text-white tabular-nums">5</span>
                    <Shuffle className="w-3.5 h-3.5 text-[#a8977c]" strokeWidth={1.75} />
                    <h2 className="text-[14px] font-bold tracking-[-0.02em] text-[#1a1a1a]">단어 순서</h2>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-1.5">
                    {[{
                      id: 'original', title: '원래 순서', desc: '단어장 순서대로'
                    }, {
                      id: 'random', title: '랜덤 셔플', desc: '무작위로 섞기'
                    }].map((order) => <button key={order.id} onClick={() => setOrderType(order.id as "original" | "random")} className={`flex items-center gap-2 p-3 rounded-[12px] transition-all active:scale-[0.98] border text-xs ${orderType === order.id ? 'bg-[#8b7355] text-white border-[#5c5142]' : 'bg-white border-[#e3d9c8] hover:bg-[#faf8f5]'}`}>
                        <div className="flex-1 text-left">
                          <span className="font-semibold text-xs block">{order.title}</span>
                          <span className={`text-[10px] ${orderType === order.id ? 'text-white/60' : 'text-[#a8977c]'}`}>{order.desc}</span>
                        </div>
                      </button>)}
                  </div>
                </div>
              </div>}
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-3">
              <div className="rounded-[4px] bg-white/85 backdrop-blur-sm ring-1 ring-[#e3d9c8] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_50px_-30px_rgba(15,23,42,0.45)] overflow-hidden">
                <div className="relative px-3.5 py-3 bg-[#1a1a1a] flex items-center gap-2.5">
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#8b7355]/60 to-transparent" />
                  <div className="w-6 h-6 rounded-[3px] bg-gradient-to-br  flex items-center justify-center shadow-[0_4px_10px_-4px_rgba(245,158,11,0.7)]">
                    <FileText className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-[12px] font-semibold text-white tracking-[-0.01em]">시험지 설정</h3>
                </div>
                <div className="p-3.5 space-y-3">
                  <div>
                    <Label className="text-[9.5px] font-semibold text-[#a8977c] uppercase tracking-[0.12em]">시험지 제목</Label>
                    <Input value={testTitle} onChange={(e) => setTestTitle(e.target.value)} placeholder="시험지 제목 입력" className="mt-1.5 border-[#e3d9c8] bg-white rounded-[3px] h-9 text-xs font-medium focus:border-[#8b7355] focus:ring-2 focus:ring-[#c9b99a] transition-shadow" />
                  </div>
                  <div>
                    <Label className="text-[9.5px] font-semibold text-[#a8977c] uppercase tracking-[0.12em]">학생 이름 (선택)</Label>
                    <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="학생 이름 입력" className="mt-1.5 border-[#e3d9c8] bg-white rounded-[3px] h-9 text-xs font-medium focus:border-[#8b7355] focus:ring-2 focus:ring-[#c9b99a] transition-shadow" />
                  </div>
                  <div className="rounded-[4px] bg-[#faf8f5]/80 ring-1 ring-[#e3d9c8] p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8977c]">단어장</span>
                      <span className="font-semibold text-[#5c5142] text-right max-w-[60%] truncate">{cardSets.find((cs) => cs.id === selectedCardSet)?.title || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8977c]">선택 Day</span>
                      <span>{selectedDays.length > 0 ? <span className="px-2 py-0.5 rounded-full bg-[#1a1a1a] text-white text-[10px] font-bold tabular-nums">{selectedDays.length}개</span> : <span className="text-[#c9b99a]">-</span>}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8977c]">예상 문항수</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#f5f1e8] text-[#8b7355] ring-1 ring-[#c9b99a] text-[10px] font-bold tabular-nums">{getWordsForSelectedDays().length}문제</span>
                    </div>
                  </div>
                  <Button onClick={handleGenerateTest} disabled={isGenerating || !selectedCardSet || selectedDays.length === 0} className="group w-full h-12 text-[12px] rounded-[4px] bg-[#1a1a1a] hover:bg-[#8b7355] text-white ring-1 ring-[#c9b99a] shadow-[0_18px_36px_-18px_rgba(15,23,42,0.8)] disabled:opacity-40 disabled:shadow-none transition-all" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.16em" }}>
                    {isGenerating ? "GENERATING..." : "GENERATE"}
                    <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/dashboard")} className="w-full text-[#a8977c] hover:text-[#5c5142] text-[10px] tracking-[0.1em] uppercase">Cancel</Button>
                </div>

              </div>
            </div>
          </div>
        </div>

      {/* 생성된 시험지 미리보기 */}
        {generatedTest && <div id="test-paper-preview" className="mt-12 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">생성된 시험지</h2>
                <p className="text-sm text-[#a8977c] mt-1">인쇄 버튼을 클릭하여 출력하세요</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => { setGeneratedTest(null); toast({ title: "초기화 완료", description: "시험지가 초기화되었습니다." }); }} variant="outline" className="rounded-[4px] border-2 border-[#c9b99a] hover:bg-[#f0ebe3] dark:hover:bg-[#1a1a1a] text-[#5c5142]">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  초기화
                </Button>
                <Button onClick={handlePrint} className="bg-[#1a1a1a] hover:bg-[#1a1a1a] dark:bg-white dark:hover:bg-[#f0ebe3] dark:text-[#1a1a1a] rounded-[4px] shadow-lg">
                  <Printer className="w-4 h-4 mr-2" />
                  시험지 인쇄
                </Button>
                <Button onClick={handlePrintAnswerKey} variant="outline" className="rounded-[4px] border-2 hover:bg-[#f0ebe3] dark:hover:bg-[#1a1a1a]">
                  <Printer className="w-4 h-4 mr-2" />
                  정답지 인쇄
                </Button>
              </div>
            </div>
            {/* 다의어 빈칸 설정 에디터 */}
            {generatedTest.testType === 'polysemy' && (
              <div className="mb-6 rounded-[4px] bg-white shadow-sm ring-1 ring-[#e3d9c8]/60 overflow-hidden">
                <div className="px-4 py-2.5 bg-gradient-to-r from-orange-50 via-white to-orange-50 border-b border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-700">🎯 빈칸 설정</span>
                    <span className="text-[10px] text-[#a8977c]">클릭하여 빈칸으로 출제할 뜻을 선택하세요</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-6 px-2.5 text-[10px] border-orange-200 hover:bg-orange-50 text-orange-600" onClick={() => {
                      const newBlanks: Record<number, boolean[]> = {};
                      generatedTest.words.forEach((w, i) => {
                        const parts = splitMeaning(w.meaning);
                        newBlanks[i] = parts.map(() => true);
                      });
                      setPolysemyBlanks(newBlanks);
                    }}>전체 선택</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2.5 text-[10px] border-[#e3d9c8] text-[#a8977c]" onClick={() => setPolysemyBlanks({})}>전체 해제</Button>
                  </div>
                </div>
                <div className="p-3 max-h-[500px] overflow-y-auto space-y-1">
                  {generatedTest.words.map((word, idx) => {
                    const parts = splitMeaning(word.meaning);
                    const blanks = polysemyBlanks[idx] || parts.map(() => false);
                    const selectedCount = blanks.filter(b => b).length;
                    return (
                      <div key={idx} className="flex items-center gap-2 py-1.5 border-b border-[#e3d9c8] last:border-0">
                        <span className="w-7 text-[10px] font-bold text-[#a8977c] text-right flex-shrink-0">{idx + 1}</span>
                        <span className="text-xs font-bold text-[#5c5142] min-w-[90px] flex-shrink-0">{word.word}</span>
                        <div className="flex flex-wrap gap-1 flex-1">
                          {parts.map((part, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => {
                                const newBlanks = [...blanks];
                                newBlanks[pIdx] = !newBlanks[pIdx];
                                setPolysemyBlanks(prev => ({ ...prev, [idx]: newBlanks }));
                              }}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all border cursor-pointer ${
                                blanks[pIdx]
                                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                  : 'bg-white text-[#5c5142] border-[#e3d9c8] hover:border-orange-300 hover:bg-orange-50'
                              }`}
                            >
                              {part}
                            </button>
                          ))}
                        </div>
                        {selectedCount > 0 && (
                          <span className="text-[9px] font-semibold text-orange-500 flex-shrink-0">{selectedCount}개 선택</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* 시험지 전용 스타일 주입 */}
            <style dangerouslySetInnerHTML={{ __html: getFullPrintStyles() }} />
            <div id="test-paper-section" className="sa-preview-wrapper">
              {renderTestPaper(generatedTest)}
            </div>
            <div id="answer-key-section" className="sa-preview-wrapper mt-8">
              <h2 className="text-2xl font-bold mb-4 no-print text-[#1a1a1a] dark:text-white">정답지</h2>
              {renderAnswerKey(generatedTest)}
            </div>
          </div>}

      {/* 멀티 범위 생성 결과 미리보기 */}
      {generatedMultiTests.length > 0 && <div id="multi-test-preview" className="mt-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">생성된 시험지 ({generatedMultiTests.length}개 범위)</h2>
              <p className="text-sm text-[#a8977c] mt-1">시험지-정답지 순서로 한번에 인쇄됩니다</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handlePrintMultiTestOnly} variant="outline" className="border-2 border-blue-300 hover:bg-blue-50 text-blue-600 rounded-[4px]">
                <Printer className="w-4 h-4 mr-2" />
                시험지만 인쇄
              </Button>
              <Button onClick={handlePrintMultiAnswerOnly} variant="outline" className="border-2 border-emerald-300 hover:bg-emerald-50 text-emerald-600 rounded-[4px]">
                <Printer className="w-4 h-4 mr-2" />
                정답지만 인쇄
              </Button>
              <Button onClick={handlePrintAllMulti} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-[4px] shadow-lg">
                <Printer className="w-4 h-4 mr-2" />
                전체 인쇄
              </Button>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: getFullPrintStyles() }} />
          {generatedMultiTests.map((testData, idx) =>
        <div key={`${testData.testTitle}-${idx}`} className="mb-8">
              <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-[#5c5142] mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                {testData.rangeLabel} ({testData.words.length}문제)
              </h3>
              <div id={getMultiPrintId('multi-test', testData, idx)} className="sa-preview-wrapper">
                {renderTestPaper(testData)}
              </div>
              <div id={getMultiPrintId('multi-answer', testData, idx)} className="sa-preview-wrapper mt-4">
                <h4 className="text-base font-bold mb-2 no-print text-emerald-700 dark:text-emerald-400">📝 {testData.rangeLabel} 정답지</h4>
                {renderAnswerKey(testData)}
              </div>
            </div>
        )}
        </div>}
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        @media print {
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
          
          * {
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body { 
            width: 210mm;
            height: auto;
            margin: 0;
            padding: 0;
          }
          
          body > *:not(.print-root) { 
            display: none !important; 
          }
          
          .no-print { 
            display: none !important; 
          }
          
          #test-paper-section,
          #answer-key-section {
            display: block !important;
          }
          
          .test-paper-container,
          .sa-preview-wrapper {
            position: static;
            width: 210mm;
            padding: 0;
            background: white;
            margin: 0;
          }
          
          .test-page,
          .sa-page {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 8mm 10mm;
            box-shadow: none;
            background: white;
            display: flex;
            flex-direction: column;
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            break-inside: avoid;
          }
          
          .test-page:last-child,
          .sa-page:last-child { 
            page-break-after: auto; 
            break-after: auto;
          }
        }

        /* 미리보기 래퍼 - 동반의어 시험지용 */
        .sa-preview-wrapper {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          background: transparent;
          padding: 0;
        }
        .sa-preview-wrapper .sa-preview-container {
          width: 100%;
          max-width: 100%;
        }
        .sa-preview-wrapper .sa-page {
          width: 100% !important;
          max-width: 210mm;
          height: auto !important;
          min-height: 297mm;
          margin: 0 auto 24px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          border-radius: 8px;
          padding: 8mm 10mm !important;
        }
        .sa-preview-wrapper .sa-ans-page {
          background: linear-gradient(180deg, #ecfdf5 0%, #fff 100%) !important;
        }

        .test-paper-container {
          max-width: 210mm;
          margin: 0 auto;
          background: #f1f5f9;
          padding: 20px;
          border-radius: 12px;
        }

        .test-page, .answer-page {
          width: 210mm;
          height: 297mm;
          margin: 0 auto 20px;
          padding: 5mm 7mm;
          background: white;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
          border-radius: 4px;
          box-sizing: border-box;
        }

        .test-page:last-child, .answer-page:last-child { margin-bottom: 0; }

        /* ========== 미니멀 헤더 - 시험지 (프리미엄 라이트) ========== */
        .test-header-minimal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 11px 16px 11px 13px;
          background: #1e1b4b;
          border: 1px solid #312e81;
          border-radius: 12px;
          margin-bottom: 8px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.18);
        }
        .test-header-minimal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #312e81 0%, #4f46e5 25%, #a5b4fc 50%, #d4a93a 75%, #312e81 100%);
          pointer-events: none;
        }
        .test-header-minimal::after {
          content: '';
          position: absolute;
          inset: 0;
          background: none;
          pointer-events: none;
        }
        .test-header-minimal > * {
          position: relative;
          z-index: 1;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-logo {
          height: 36px;
          width: auto;
          background: #fff;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 9px;
          padding: 2px 5px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
        }
        .header-title-group {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 3px;
          border-left: 2px solid rgba(255,255,255,0.18);
          padding-left: 11px;
        }
        .header-main-title {
          font-family: 'Orbitron', 'Noto Sans KR', sans-serif !important;
          font-size: 14px !important;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.6px;
          line-height: 1.15;
          white-space: nowrap;
        }
        .header-sub-info {
          font-family: 'Noto Sans KR', sans-serif;
          font-size: 9px;
          color: #a5b4fc;
          font-weight: 500;
          letter-spacing: 0.6px;
          line-height: 1.2;
        }
        .header-student-area {
          display: flex;
          gap: 14px;
          align-items: center;
          background: rgba(255,255,255,0.08);
          border-radius: 9px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .student-field {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .student-field label {
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          color: #a5b4fc;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .student-field-divider {
          width: 1px;
          height: 22px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.25), transparent);
        }
        .field-box {
          min-width: 90px;
          height: 30px;
          background: #ffffff;
          border-radius: 4px;
          padding: 0 6px;
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 600;
          color: #1e293b;
          border: 1px solid rgba(0,0,0,0.10);
        }
        .field-name {
          min-width: 100px;
        }
        .score-box {
          min-width: 42px;
          text-align: center;
          justify-content: center;
        }
        .score-suffix {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: #d4a93a;
          margin-left: 4px;
        }

        /* ========== 정답지 헤더 (프리미엄 라이트) ========== */
        .answer-header-minimal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 11px 16px 11px 13px;
          background: #064e3b;
          border: 1px solid #065f46;
          border-radius: 12px;
          margin-bottom: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.18);
        }
        .answer-header-minimal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #064e3b 0%, #059669 30%, #6ee7b7 55%, #d4a93a 80%, #064e3b 100%);
          pointer-events: none;
        }
        .answer-header-minimal::after {
          content: '';
          position: absolute;
          inset: 0;
          background: none;
          pointer-events: none;
        }
        .answer-header-minimal > * { position: relative; z-index: 1; }
        .answer-header-minimal .header-brand {
          gap: 12px;
        }
        .answer-header-minimal .header-title-group {
          border-left-color: rgba(255,255,255,0.18);
        }
        .answer-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 800;
          color: #064e3b;
          background: #d4a93a;
          padding: 6px 16px;
          border-radius: 999px;
          letter-spacing: 2.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.22);
          text-transform: uppercase;
        }
        .answer-header-minimal .header-main-title {
          font-size: 14px !important;
          color: #ffffff;
        }
        .answer-header-minimal .header-sub-info {
          color: #a7f3d0;
        }


        /* ========== 테이블 컨테이너 ========== */
        .test-table-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: visible;
          min-height: 0;
        }
        .test-table-container table {
          width: 100%;
        }

        /* ========== 모던 테이블 ========== */
        .test-table-modern {
          width: 100%;
          height: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 10px;
        }
        .test-table-modern thead tr {
          background: #f1f5f9;
        }
        .test-table-modern th {
          font-weight: 600;
          font-size: 9px;
          color: #475569;
          padding: 4px 4px;
          text-align: center;
          border: 1px solid #e2e8f0;
          letter-spacing: 0.3px;
          height: 22px;
        }
        .th-no { }
        .th-question { text-align: left; padding-left: 8px !important; }

        .wide-question-table .td-question { font-size: 9px; font-weight: 600; }

        .test-table-modern tbody tr {
          height: 10.2mm;
          box-sizing: border-box;
        }
        .test-table-modern tbody tr:nth-child(even) {
          background: #fafbfc;
        }
        .test-table-modern td {
          border: 1px solid #e2e8f0;
          padding: 1px 3px;
          vertical-align: middle;
          font-size: 10px;
          line-height: 1.2;
          overflow: hidden;
        }
        .td-no {
          text-align: center;
          font-weight: 700;
          color: #64748b;
          font-size: 9px;
          background: #f8fafc;
        }
        .td-question {
          font-weight: 700;
          color: #1e293b;
          font-size: 10px;
          padding-left: 3px !important;
          position: relative;
        }
        .td-answer {
          border-left: 2px solid #cbd5e1 !important;
        }
        .td-answer-filled {
          border-left: 2px solid #10b981 !important;
          background: #f0fdf4 !important;
          font-weight: 800;
          color: #166534;
          font-size: 10px;
        }
        .td-empty {
          background: #fafafa !important;
        }

        /* 혼합형 전용 - 작은 폰트 유지 */
        .mixed-type tbody tr {
          height: 9.6mm;
        }
        .mixed-type td {
          font-size: 8.5px;
          line-height: 1.15;
          padding: 1px 2px;
        }
        .mixed-type .td-no {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1px 0;
          line-height: 1.1;
          font-size: 8px;
        }
        .mixed-type .td-no .mixed-type-label {
          display: flex;
          margin-bottom: 2px;
        }
        .mixed-type .td-no .question-number {
          font-size: 10.5px;
          font-weight: 800;
          color: #1e293b;
        }
        .mixed-type .td-question {
          font-size: 8.5px;
        }
        .mixed-type .td-answer-filled {
          font-size: 8.5px;
        }

        /* ========== 밑줄 힌트 ========== */
        .underline-hint {
          display: block;
          width: 90%;
          height: 1px;
          background: #94a3b8;
          margin: 0 auto;
        }

        /* ========== 타입 도트 ========== */
        .type-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-left: 6px;
          vertical-align: middle;
        }
        .dot-meaning { background: #3b82f6; }
        .dot-spelling { background: #a855f7; }

        /* ========== 정답지 테이블 ========== */
        .answer-table-modern thead tr {
          background: #d1fae5;
        }
        .answer-table-modern th {
          color: #166534;
        }
        /* 정답지 폰트 확대 (혼합형 제외) */
        .answer-table-modern:not(.mixed-type) td {
          font-size: 11px;
        }
        .answer-table-modern:not(.mixed-type) .td-no {
          font-size: 9.5px;
        }
        .answer-table-modern:not(.mixed-type) .td-question {
          font-size: 11px;
        }
        .answer-table-modern:not(.mixed-type) .td-answer-filled {
          font-size: 11px;
        }

        /* 의미쓰기 정답지 overflow 방지 */
        .answer-table-modern.meaning-layout-tight tbody td {
          height: 10.2mm;
          max-height: 10.2mm;
          overflow: hidden;
        }
        .answer-table-modern.meaning-layout-tight .td-answer-filled {
          font-size: 9px !important;
          line-height: 1.05;
          white-space: normal;
          word-break: keep-all;
          overflow-wrap: anywhere;
        }

        /* ========== 미니멀 푸터 ========== */
        .test-footer-minimal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 14px;
          margin-top: 6px;
          background:
            linear-gradient(180deg, #ffffff 0%, #f6f7fd 100%);
          border: 1px solid #dfe2f2;
          border-top: 2px solid #d4a93a;
          border-radius: 9px;
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: #8f93bb;
          flex-shrink: 0;
          min-height: 24px;
          position: relative;
          overflow: hidden;
        }
        .test-footer-minimal::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23312e81' stroke-opacity='0.07' stroke-width='0.7'%3E%3Cpath d='M0 10 L10 0 L20 10 L10 20 Z'/%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        .test-footer-minimal span {
          position: relative;
          z-index: 1;
        }
        .test-footer-minimal span:nth-child(2) {
          font-weight: 800;
          letter-spacing: 3px;
          color: #312e81;
        }

        /* ========== 정답지 푸터 ========== */
        .answer-footer-minimal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 14px;
          margin-top: auto;
          background: linear-gradient(180deg, #ffffff 0%, #f5faf8 100%);
          border: 1px solid #d3e9df;
          border-top: 2px solid #d4a93a;
          border-radius: 9px;
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: #85a89b;
          flex-shrink: 0;
          min-height: 24px;
        }
        .answer-footer-minimal span:nth-child(2) {
          font-weight: 800;
          letter-spacing: 2px;
          color: #064e3b;
        }


        /* 의미쓰기+예문완성 결합 테이블 */
        .meaning-example-table td {
          font-size: 9px;
          line-height: 1.15;
        }
        .meaning-example-table .td-question {
          font-size: 10px;
        }
        .meaning-example-table .me-example-cell {
          font-size: 8.5px !important;
          font-weight: 600;
        }
        .meaning-example-table .td-answer-filled {
          font-size: 9px;
        }

        /* 1단 레이아웃 (ORUN VOCA 0/1/2, 25단어 이하) */
        .single-col-table td {
          font-size: 14px;
          line-height: 1.3;
        }
        .single-col-table .td-no {
          font-size: 12px;
        }
        .single-col-table .td-question {
          font-size: 14px;
          font-weight: 700;
          padding-left: 8px !important;
        }
        .single-col-table .td-answer-filled {
          font-size: 14px;
        }
        .single-col-table .spelling-hint {
          font-size: 11px;
        }
        .single-col-table th {
          font-size: 10px;
        }
        .single-col-wide-q .td-question {
          font-size: 11px !important;
        }

        /* ========== BRAINIAC 인쇄 테마 (톤다운) ========== */
        .brainiac-theme .test-header-minimal {
          background: linear-gradient(120deg, #0f2e6b 0%, #1e4fa8 100%) !important;
          border-bottom: 2px solid #d4a93a !important;
        }
        .brainiac-theme .header-main-title {
          font-size: 12px !important;
        }
        .brainiac-theme .header-main-title::before {
          content: 'BRAINIAC ENGLISH · ';
          color: #f0d375;
          font-weight: 800;
        }
        .brainiac-theme .test-footer-minimal {
          border-top: 1px solid #d4a93a !important;
          background: none !important;
          color: #0f2e6b !important;
          font-weight: 700;
          letter-spacing: 0.8px;
          font-size: 10px !important;
        }
        .brainiac-theme .test-footer-minimal::before {
          content: 'BRAINIAC ENGLISH';
          color: #0f2e6b;
          font-weight: 800;
          letter-spacing: 1.5px;
        }
        .brainiac-theme .test-footer-minimal span:nth-child(2) {
          color: #0f2e6b !important;
        }
        .brainiac-theme .th-question,
        .brainiac-theme .th-answer,
        .brainiac-theme .th-no {
          background: #0f2e6b !important;
          color: white !important;
        }
        .brainiac-theme .answer-header-minimal {
          background: linear-gradient(120deg, #0f2e6b 0%, #1e4fa8 100%) !important;
          border-bottom: 2px solid #d4a93a !important;
        }
        .brainiac-theme .answer-label {
          color: #0f2e6b !important;
          background: #f0d375 !important;
          letter-spacing: 2px !important;
          border: 1px solid #d4a93a !important;
          font-size: 13px !important;
        }
        .brainiac-theme .answer-label::before { content: ''; }
        .brainiac-theme .answer-label::after { content: ''; }
        .brainiac-theme .answer-header-minimal .header-main-title::before {
          content: 'BRAINIAC · ';
          color: #f0d375;
          font-weight: 800;
        }
        .brainiac-theme .answer-footer-minimal {
          border-top: 1px solid #d4a93a !important;
          background: none !important;
          color: #0f2e6b !important;
          font-weight: 700;
          letter-spacing: 0.8px;
          font-size: 10px !important;
        }
        .brainiac-theme .answer-footer-minimal::before {
          content: 'ANSWER KEY';
          color: #0f2e6b;
          font-weight: 800;
          letter-spacing: 1.5px;
        }
        .brainiac-theme .answer-footer-minimal span:nth-child(2) {
          color: #0f2e6b !important;
        }
        .test-page.brainiac-theme {
          position: relative !important;
          background: #ffffff !important;
          border: 1px solid #c9d4ec !important;
        }
        .test-page.brainiac-theme::before {
          content: 'BRAINIAC';
          position: absolute;
          right: 9mm;
          bottom: 12mm;
          z-index: 0;
          font-size: 34px;
          font-weight: 900;
          color: rgba(15,46,107,0.04);
          transform: rotate(-12deg);
          pointer-events: none;
        }
        .test-page.brainiac-theme > * { position: relative; z-index: 1; }
        .brainiac-theme .test-header-minimal,
        .brainiac-theme .answer-header-minimal {
          box-shadow: 0 2px 6px rgba(15,46,107,0.12) !important;
        }
        .brainiac-theme .test-table-modern {
          border: 1px solid #c9d4ec !important;
        }
        .brainiac-theme .td-no {
          background: #f5f8fd !important;
          color: #0f2e6b !important;
        }
        .brainiac-theme .mixed-type .td-no .question-number {
          color: #0f2e6b;
        }
        .brainiac-theme .td-answer,
        .brainiac-theme .td-answer-filled {
          border-left: 1px solid #d4a93a !important;
        }
      `}</style>
    </div>;
};
export default CreateTestPaper;