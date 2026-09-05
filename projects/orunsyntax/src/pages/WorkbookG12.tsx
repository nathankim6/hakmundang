import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minimize, ChevronLeft, ChevronRight, Loader2, Sparkles, RotateCcw, LogOut, Shield } from 'lucide-react';
import { NavigationBar } from '@/components/NavigationBar';
import { WorkbookPage } from '@/components/WorkbookPage';
import { MeaningInput } from '@/components/MeaningInput';
import { CorrectionInput } from '@/components/CorrectionInput';
import { AnswerKey } from '@/components/AnswerKey';
import { CoverPage } from '@/components/CoverPage';
import { BackCover } from '@/components/BackCover';
import { TableOfContents } from '@/components/TableOfContents';
import { WeekDividerPage } from '@/components/WeekDividerPage';
import { WeeklyVocabTable, VocabItem, seededShuffle } from '@/components/WeeklyVocabTable';
import { VocabQuizPage } from '@/components/VocabQuizPage';

import { RCExplanationPage } from '@/components/RCExplanationPage';
import { SyntaxAnswerPage } from '@/components/SyntaxAnswerPage';
import { GuideDividerPage } from '@/components/GuideDividerPage';

import { ShortcutsPanel } from '@/components/ShortcutsPanel';
import { MobilePageStage } from '@/components/MobilePageStage';
import { useIsMobile } from '@/hooks/use-mobile';
import { parseQuestions, Question } from '@/lib/parseQuestions';
import { deduplicateSentences } from '@/lib/deduplicateSentences';
import { parseAnswers } from '@/lib/parseAnswers';
import { distributeWeekly, WeekData } from '@/lib/weeklyDistribution';
import { paginateGuideItems, countGuidePages, GuideItem } from '@/lib/paginateGuideItems';
import { useTextAnnotation } from '@/hooks/useTextAnnotation';
import { supabase } from '@/integrations/supabase/client';
import { SyntaxAnalysisDisplay } from '@/components/SyntaxAnalysisDisplay';
import { useAuth } from '@/contexts/AuthContext';
import type { RCQuestion, WeeklyRCData } from '@/types/readingComprehension';
import sentencesData from '@/data/sentences-g12.txt?raw';
import answersData from '@/data/answers-g12.txt?raw';

const QUESTIONS_PER_PAGE = 10;
const TOTAL_WEEKS = 20;
const VOCAB_PER_PAGE = 80;
const QUIZ_TOTAL = 100;
const QUIZ_PER_PAGE = 50;
const SENTENCES_FIRST_HALF_G10 = 50;
const SENTENCES_SECOND_HALF_G10 = 50;
const SENTENCES_FIRST_HALF_G11 = 45;
const SENTENCES_SECOND_HALF_G11 = 45;
const RC_QUESTIONS_PER_SET = 2;
const RC_PER_PAGE = 2;
const RC_EXPLANATIONS_PER_PAGE = 4;
const GUIDE_ITEMS_PER_PAGE = 3;

interface WorkbookG12Props {
  grade?: 'g10' | 'g11';
}

const WorkbookG12 = ({ grade = 'g10' }: WorkbookG12Props) => {
  const gradeLabel = grade === 'g10' ? 'TOP/고1' : '고2';
  const SENTENCES_PER_WEEK = grade === 'g10' ? 100 : 90;
  const SENTENCES_FIRST_HALF = grade === 'g10' ? SENTENCES_FIRST_HALF_G10 : SENTENCES_FIRST_HALF_G11;
  const SENTENCES_SECOND_HALF = grade === 'g10' ? SENTENCES_SECOND_HALF_G10 : SENTENCES_SECOND_HALF_G11;
  const gradeTitle = grade === 'g10' ? 'ORUN WEEKLY G10' : 'ORUN WEEKLY G11';
  // 구문분석/어법 저장소를 학년별로 분리 (고2 결과가 고1 데이터를 덮어쓰지 않도록)
  const syntaxWorkbookId = grade === 'g10' ? 'syntax2320' : 'syntax2320-g11';
  const { isAdmin, logout } = useAuth();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [printRange, setPrintRange] = useState<{ start: number; end: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomedSentence, setZoomedSentence] = useState<number | null>(null);
  const [sentenceNotes, setSentenceNotes] = useState<Record<number, string>>({});
  const [chalkboardNotes, setChalkboardNotes] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState<Record<number, boolean>>({});
  const [isEditingAnalysis, setIsEditingAnalysis] = useState(isAdmin);
  const [isSyntaxExpanded, setIsSyntaxExpanded] = useState(false);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, started: false });
  const batchAbortRef = useRef(false);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
  const [grammarCategories, setGrammarCategories] = useState<Record<number, string>>({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [weeklyVocab, setWeeklyVocab] = useState<Record<number, VocabItem[]>>({});
  const [rcQuestions, setRcQuestions] = useState<RCQuestion[]>([]);

  // 학년별 표지 테마를 내지에 적용 (고1 blue / 고2 emerald)
  useEffect(() => {
    const themeClass = grade === 'g10' ? 'orun-theme-g10' : 'orun-theme-g11';
    document.documentElement.classList.add(themeClass);
    return () => document.documentElement.classList.remove(themeClass);
  }, [grade]);

  // Load analyses and categories from database

  useEffect(() => {
    const loadData = async () => {
      const [analysisRes, catRes] = await Promise.all([
        supabase.functions.invoke('manage-syntax', { body: { action: 'getAll', workbookId: syntaxWorkbookId } }),
        supabase.functions.invoke('classify-grammar', { body: { action: 'getAll', workbookId: syntaxWorkbookId } }),
      ]);
      if (analysisRes.data?.analyses) {
        setSentenceNotes(analysisRes.data.analyses);
        setHasAnalysis(analysisRes.data.hasAnalysis || {});
      }
      if (catRes.data?.categories) setGrammarCategories(catRes.data.categories);
      setIsLoadingAnalyses(false);
      setIsLoadingCategories(false);
    };
    loadData();
  }, [syntaxWorkbookId]);

  // Parse original questions and answers
  const allParsedQuestions = useMemo(() => parseQuestions(sentencesData), []);
  const { deduplicated: originalQuestions } = useMemo(() => deduplicateSentences(allParsedQuestions), [allParsedQuestions]);
  const answers = useMemo(() => parseAnswers(answersData), []);

  // Build weekly structure
  const weeks: WeekData[] = useMemo(() => {
    if (isLoadingCategories || Object.keys(grammarCategories).length === 0) return [];
    return distributeWeekly(originalQuestions, grammarCategories, SENTENCES_PER_WEEK);
  }, [originalQuestions, grammarCategories, isLoadingCategories, SENTENCES_PER_WEEK]);

  const { accessCode } = useAuth();

  // Load RC questions from DB (for both G10 and G11)
  useEffect(() => {
    const workbookId = grade === 'g10' ? 'weekly-g10' : 'weekly-g11';
    const loadRC = async () => {
      const { data, error } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('workbook_id', workbookId)
        .order('question_id', { ascending: true });
      if (error) { console.error('Error loading RC questions:', error); return; }
      if (!data) return;
      const mapped: RCQuestion[] = data.map((row: any) => ({
        id: row.question_id,
        year: row.year && row.year !== 'N/A' ? `${row.year} ${row.month || ''} ${row.question_number || ''}`.trim() : undefined,
        errorRate: row.error_rate || undefined,
        questionType: row.question_prompt || row.question_type,
        passage: row.passage,
        choices: (row.choices || []).map((c: string) => {
          const match = c.match(/^(①|②|③|④|⑤)\s*(.+)$/);
          return match
            ? { label: match[1], text: match[2] }
            : { label: '', text: c };
        }),
        answer: row.answer,
        translation: row.translation || '',
        explanation: row.explanation || '',
        vocabulary: Array.isArray(row.vocabulary)
          ? row.vocabulary.map((v: any) => ({ english: v.word, korean: v.meaning }))
          : [],
      }));
      setRcQuestions(mapped);
    };
    loadRC();
  }, [grade]);

  // RC removed from weekly workbooks
  const rcWeeks: WeeklyRCData[] = useMemo(() => [], []);


  // Load vocabulary from DB, extract missing weeks via AI and save to DB
  useEffect(() => {
    if (weeks.length === 0) return;
    
    const loadVocab = async () => {
      let vocabMap: Record<number, VocabItem[]> = {};
      
      // 1. Load all saved vocab from DB
      try {
        const res = await supabase.functions.invoke('manage-vocabulary', {
          body: { action: 'getAll', grade }
        });
        if (res.data?.vocabMap) {
          for (const [key, value] of Object.entries(res.data.vocabMap)) {
            if (Array.isArray(value) && value.length > 0) {
              vocabMap[Number(key)] = value as VocabItem[];
            }
          }
        }
      } catch (e) {
        console.error('Failed to load vocab from DB:', e);
      }
      
      // Find weeks missing from DB
      const missingWeeks = weeks.filter(w => !vocabMap[w.weekNumber] || vocabMap[w.weekNumber].length === 0);
      
      if (missingWeeks.length === 0) {
        setWeeklyVocab(vocabMap);
        return;
      }
      
      // Show what we have so far
      if (Object.keys(vocabMap).length > 0) {
        setWeeklyVocab(vocabMap);
      }
      
      console.log(`[${grade}] Extracting vocab for ${missingWeeks.length} missing weeks via AI:`, missingWeeks.map(w => w.weekNumber));
      
      // 2. Extract missing weeks via AI one at a time, splitting sentences into chunks to avoid timeout
      const CHUNK_SIZE = 45; // Split 90 sentences into 2 chunks of 45
      for (const week of missingWeeks) {
        try {
          const allSentences = week.questions.map((q, idx) => ({ 
            id: idx + 1, 
            sentence: q.sentence 
          }));
          
          // Split into chunks and call extract-vocabulary for each
          let allVocab: VocabItem[] = [];
          for (let c = 0; c < allSentences.length; c += CHUNK_SIZE) {
            const chunk = allSentences.slice(c, c + CHUNK_SIZE);
            try {
              const res = await supabase.functions.invoke('extract-vocabulary', {
                body: { sentences: chunk, weekNumber: week.weekNumber }
              });
              const chunkVocab = res.data?.vocabulary || [];
              // Adjust sentence_id offset for non-first chunks
              if (c > 0) {
                for (const v of chunkVocab) {
                  if (v.sentence_id) v.sentence_id += c;
                }
              }
              allVocab = [...allVocab, ...chunkVocab];
            } catch (chunkErr) {
              console.error(`Failed chunk ${c}-${c + CHUNK_SIZE} for week ${week.weekNumber}:`, chunkErr);
            }
          }
          
          // Deduplicate by word
          const seen = new Set<string>();
          allVocab = allVocab.filter(v => {
            const key = v.word?.toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          
          // Save to DB if we got results
          if (allVocab.length > 0) {
            vocabMap[week.weekNumber] = allVocab;
            await supabase.functions.invoke('manage-vocabulary', {
              body: { action: 'save', grade, weekNumber: week.weekNumber, vocabulary: allVocab }
            }).catch(e => console.error(`Failed to save vocab week ${week.weekNumber}:`, e));
          }
          
          setWeeklyVocab({ ...vocabMap });
        } catch (weekErr) {
          console.error(`Failed to extract vocab for week ${week.weekNumber}:`, weekErr);
        }
      }
    };
    
    loadVocab();
  }, [weeks, grade]);

  // Flatten all questions with global numbering for display
  const { allQuestions, globalOriginalIdMap } = useMemo(() => {
    const all: Question[] = [];
    const idMap = new Map<number, number>(); // globalId -> originalId
    for (const week of weeks) {
      for (let i = 0; i < week.questions.length; i++) {
        const globalId = (week.weekNumber - 1) * SENTENCES_PER_WEEK + (i + 1);
        all.push({ id: globalId, sentence: week.questions[i].sentence, translation: week.questions[i].translation });
        idMap.set(globalId, week.originalIds[i]);
      }
    }
    return { allQuestions: all, globalOriginalIdMap: idMap };
  }, [weeks]);

  // Build answer map for global questions
  const globalAnswers = useMemo(() => {
    const map = new Map<number, string>();
    for (const [globalId, origId] of globalOriginalIdMap.entries()) {
      const answer = answers.get(origId);
      if (answer) map.set(globalId, answer);
    }
    return map;
  }, [globalOriginalIdMap, answers]);

  const { 
    showMeaningInput, meaningInputPosition, pendingSelection,
    handleMeaningSubmit, closeMeaningInput,
    showCorrectionInput, correctionInputPosition,
    handleCorrectionSubmit, closeCorrectionInput
  } = useTextAnnotation({ answers: globalAnswers });

  // Page structure per week
  // G10: Divider + Vocab + 45 sentences + 2 RC pages + 45 sentences + 2 RC pages + explanation pages
  // G11: Divider + Vocab + 90 sentences (no RC)
  const weekPageInfo = useMemo(() => {
    const isG10 = grade === 'g10';
    const hasRC = rcWeeks.length > 0;
    const info: {
      weekNumber: number;
      contentPages: number;
      vocabPages: number;
      totalWeekPages: number;
      startAbsPage: number;
      // G10 specific
      firstHalfPages?: number;
      secondHalfPages?: number;
      explanationFirstPages?: number;
      explanationSecondPages?: number;
      guidePages?: number;
    }[] = [];
    let absPage = 3; // after cover + TOC
    for (const week of weeks) {
      const vocab = weeklyVocab[week.weekNumber] || [];
      const vocabContentPages = Math.max(1, Math.ceil(vocab.length / VOCAB_PER_PAGE));
      const quizPages = vocab.length > 0 ? Math.ceil(Math.min(vocab.length, QUIZ_TOTAL) / QUIZ_PER_PAGE) : 0;
      const vocabPages = vocabContentPages + quizPages;
      
      // Build guide items for this week and count pages dynamically
      const weekGuideItems: GuideItem[] = [];
      for (let qi = 0; qi < week.questions.length; qi++) {
        const origId = week.originalIds[qi];
        if (sentenceNotes[origId]) {
          weekGuideItems.push({
            question: { id: qi + 1, sentence: week.questions[qi].sentence, translation: week.questions[qi].translation },
            analysis: sentenceNotes[origId],
          });
        }
      }
      const guidePages = countGuidePages(weekGuideItems);
      
      if (hasRC) {
        const rcWeek = rcWeeks.find(rw => rw.weekNumber === week.weekNumber);
        const firstHalfPages = Math.ceil(SENTENCES_FIRST_HALF / QUESTIONS_PER_PAGE); // 5
        const secondHalfPages = Math.ceil(SENTENCES_SECOND_HALF / QUESTIONS_PER_PAGE); // 5
        const rcFirstCount = rcWeek ? rcWeek.firstHalf.length : 0;
        const rcSecondCount = rcWeek ? rcWeek.secondHalf.length : 0;
        const explanationFirstPages = rcFirstCount > 0 ? 1 : 0;
        const explanationSecondPages = rcSecondCount > 0 ? 1 : 0;
        const contentPages = firstHalfPages + secondHalfPages;
        const guideDividerPages = guidePages > 0 ? 1 : 0;
        const totalWeekPages = 1 + vocabPages + firstHalfPages + explanationFirstPages + secondHalfPages + explanationSecondPages + guideDividerPages + guidePages;
        
        info.push({
          weekNumber: week.weekNumber, contentPages, vocabPages, totalWeekPages, startAbsPage: absPage,
          firstHalfPages, secondHalfPages, explanationFirstPages, explanationSecondPages, guidePages,
        });
      } else if (hasRC) {
        // G11 with RC: same 45+45 structure as G10
        const firstHalfPages = Math.ceil(SENTENCES_FIRST_HALF / QUESTIONS_PER_PAGE);
        const secondHalfPages = Math.ceil(SENTENCES_SECOND_HALF / QUESTIONS_PER_PAGE);
        const rcWeek = rcWeeks.find(rw => rw.weekNumber === week.weekNumber);
        const rcFirstCount = rcWeek ? rcWeek.firstHalf.length : 0;
        const rcSecondCount = rcWeek ? rcWeek.secondHalf.length : 0;
        const explanationFirstPages = rcFirstCount > 0 ? 1 : 0;
        const explanationSecondPages = rcSecondCount > 0 ? 1 : 0;
        const contentPages = firstHalfPages + secondHalfPages;
        const guideDividerPages = guidePages > 0 ? 1 : 0;
        const totalWeekPages = 1 + vocabPages + firstHalfPages + explanationFirstPages + secondHalfPages + explanationSecondPages + guideDividerPages + guidePages;
        
        info.push({
          weekNumber: week.weekNumber, contentPages, vocabPages, totalWeekPages, startAbsPage: absPage,
          firstHalfPages, secondHalfPages, explanationFirstPages, explanationSecondPages, guidePages,
        });
      } else {
        // No RC: same 45+45 structure without explanation pages
        const firstHalfPages = Math.ceil(SENTENCES_FIRST_HALF / QUESTIONS_PER_PAGE);
        const secondHalfPages = Math.ceil(SENTENCES_SECOND_HALF / QUESTIONS_PER_PAGE);
        const contentPages = firstHalfPages + secondHalfPages;
        const guideDividerPages = guidePages > 0 ? 1 : 0;
        const totalWeekPages = 1 + vocabPages + contentPages + guideDividerPages + guidePages;

        info.push({
          weekNumber: week.weekNumber, contentPages, vocabPages, totalWeekPages, startAbsPage: absPage,
          firstHalfPages, secondHalfPages, explanationFirstPages: 0, explanationSecondPages: 0, guidePages,
        });
      }
      absPage += info[info.length - 1].totalWeekPages;
    }
    return info;
  }, [weeks, weeklyVocab, grade, rcWeeks, sentenceNotes]);

  const totalPages = useMemo(() => {
    if (weekPageInfo.length === 0) return 3;
    const lastWeek = weekPageInfo[weekPageInfo.length - 1];
    return lastWeek.startAbsPage + lastWeek.totalWeekPages; // +1 for back cover
  }, [weekPageInfo]);

  // Determine page type for any absolute page
  type PageType = 'cover' | 'toc' | 'divider' | 'content' | 'vocab' | 'backcover' | 'rc-explanation' | 'guide' | 'guide-divider';
  
  const getPageInfo = useCallback((absPage: number): {
    type: PageType;
    weekNumber?: number;
    contentPageIndex?: number;
    vocabPageIndex?: number;
    weekData?: WeekData;
    rcSetNumber?: number; // 1 or 2
    explanationPageIndex?: number;
    isLastPageOfHalf?: boolean;
    halfNumber?: number;
    guidePageIndex?: number;
  } => {
    if (absPage === 1) return { type: 'cover' };
    if (absPage === 2) return { type: 'toc' };
    if (absPage === totalPages) return { type: 'backcover' };

    for (const wi of weekPageInfo) {
      const relPage = absPage - wi.startAbsPage;
      if (relPage < 0) continue;
      if (relPage >= wi.totalWeekPages) continue;

      const weekData = weeks[wi.weekNumber - 1];
      if (relPage === 0) return { type: 'divider', weekNumber: wi.weekNumber, weekData };
      
      let offset = 1;
      // Vocab pages
      if (relPage < offset + wi.vocabPages) {
        return { type: 'vocab', weekNumber: wi.weekNumber, vocabPageIndex: relPage - offset, weekData };
      }
      offset += wi.vocabPages;

      if (wi.firstHalfPages !== undefined) {
        // G10 structure: firstHalf → explanation1 → secondHalf → explanation2 → guide pages
        if (relPage < offset + wi.firstHalfPages!) {
          const contentIdx = relPage - offset;
          const isLastPage = contentIdx === wi.firstHalfPages! - 1;
          return { type: 'content', weekNumber: wi.weekNumber, contentPageIndex: contentIdx, weekData, isLastPageOfHalf: isLastPage, halfNumber: 1 };
        }
        offset += wi.firstHalfPages!;

        if (wi.explanationFirstPages && relPage < offset + wi.explanationFirstPages) {
          return { type: 'rc-explanation', weekNumber: wi.weekNumber, rcSetNumber: 1, explanationPageIndex: 0, weekData };
        }
        offset += wi.explanationFirstPages || 0;

        if (relPage < offset + wi.secondHalfPages!) {
          const contentIdx = wi.firstHalfPages! + (relPage - offset);
          const isLastPage = (relPage - offset) === wi.secondHalfPages! - 1;
          return { type: 'content', weekNumber: wi.weekNumber, contentPageIndex: contentIdx, weekData, isLastPageOfHalf: isLastPage, halfNumber: 2 };
        }
        offset += wi.secondHalfPages!;

        if (wi.explanationSecondPages && relPage < offset + wi.explanationSecondPages) {
          return { type: 'rc-explanation', weekNumber: wi.weekNumber, rcSetNumber: 2, explanationPageIndex: 0, weekData };
        }
        offset += wi.explanationSecondPages || 0;

        // Guide divider + Guide pages (ORUN GUIDE)
        if (wi.guidePages && wi.guidePages > 0) {
          if (relPage === offset) {
            return { type: 'guide-divider', weekNumber: wi.weekNumber, weekData };
          }
          if (relPage < offset + 1 + wi.guidePages) {
            return { type: 'guide', weekNumber: wi.weekNumber, guidePageIndex: relPage - offset - 1, weekData };
          }
        }
      } else {
        // No RC: all content pages then guide pages
        const contentIdx = relPage - offset;
        if (contentIdx < wi.contentPages) {
          return { type: 'content', weekNumber: wi.weekNumber, contentPageIndex: contentIdx, weekData };
        }
        offset += wi.contentPages;
        
        // Guide divider + Guide pages for G11
        if (wi.guidePages && wi.guidePages > 0) {
          if (relPage === offset) {
            return { type: 'guide-divider', weekNumber: wi.weekNumber, weekData };
          }
          if (relPage < offset + 1 + wi.guidePages) {
            return { type: 'guide', weekNumber: wi.weekNumber, guidePageIndex: relPage - offset - 1, weekData };
          }
        }
      }
    }
    return { type: 'backcover' };
  }, [totalPages, weekPageInfo, weeks]);

  // Current page question range (G10 45+45 split aware)
  const currentContentRange = useMemo(() => {
    const pi = getPageInfo(currentPage);
    if (pi.type !== 'content' || !pi.weekData || pi.contentPageIndex === undefined) return null;

    // When RC questions exist, use 45+45 split structure
    if (pi.halfNumber !== undefined) {
      const firstHalfPages = Math.ceil(SENTENCES_FIRST_HALF / QUESTIONS_PER_PAGE); // 5
      const isFirstHalf = pi.contentPageIndex < firstHalfPages;

      const start = isFirstHalf
        ? pi.contentPageIndex * QUESTIONS_PER_PAGE
        : SENTENCES_FIRST_HALF + (pi.contentPageIndex - firstHalfPages) * QUESTIONS_PER_PAGE;

      const end = isFirstHalf
        ? Math.min(start + QUESTIONS_PER_PAGE, SENTENCES_FIRST_HALF)
        : Math.min(start + QUESTIONS_PER_PAGE, pi.weekData.questions.length);

      return { pi, start, end };
    }

    // No RC: continuous 90-sentence structure.
    const start = pi.contentPageIndex * QUESTIONS_PER_PAGE;
    const end = Math.min(start + QUESTIONS_PER_PAGE, pi.weekData.questions.length);
    return { pi, start, end };
  }, [currentPage, getPageInfo]);

  // Current page questions — use week-local numbering (1-90)
  const currentQuestions = useMemo(() => {
    if (!currentContentRange) return [];

    const { pi, start, end } = currentContentRange;
    return pi.weekData!.questions.slice(start, end).map((q, i) => ({
      id: start + i + 1,
      sentence: q.sentence,
      translation: q.translation,
    }));
  }, [currentContentRange]);

  // Grammar categories for current questions (using week-local IDs)
  const currentGrammarLabels = useMemo(() => {
    if (!currentContentRange) return {};

    const { pi, start, end } = currentContentRange;
    const labels: Record<number, string> = {};

    for (let i = start; i < end; i++) {
      const localId = i + 1;
      labels[localId] = pi.weekData!.grammarLabels[localId] || '';
    }

    return labels;
  }, [currentContentRange]);

  // Build TOC chapters (one per week)
  const tocChapters = useMemo(() => {
    return weekPageInfo.map(wi => {
      const week = weeks[wi.weekNumber - 1];
      const uniqueCats = [...new Set(Object.values(week.grammarLabels))];
      return {
        chapter: wi.weekNumber,
        title: `Week ${wi.weekNumber}`,
        range: `${uniqueCats.slice(0, 3).join(', ')}${uniqueCats.length > 3 ? ` +${uniqueCats.length - 3}` : ''}`,
        questionCount: SENTENCES_PER_WEEK,
        startPage: wi.startAbsPage + 1, // first content page
        endPage: wi.startAbsPage + wi.totalWeekPages - 1,
      };
    });
  }, [weekPageInfo, weeks, SENTENCES_PER_WEEK]);

  const handlePageChange = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const handlePrint = useCallback((startPage?: number, endPage?: number) => {
    if (startPage !== undefined && endPage !== undefined) {
      setPrintRange({ start: startPage, end: endPage });
    } else {
      setPrintRange(null);
    }
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => { setIsPrintMode(false); setPrintRange(null); }, 500);
    }, 100);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) setZoomedSentence(null);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle sentence click for zoom
  useEffect(() => {
    const handleSentenceClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.sentence-popup-overlay')) return;
      const sentenceEl = target.closest('.sentence-selectable');
      if (sentenceEl) {
        const questionId = sentenceEl.querySelector('.question-number')?.textContent?.trim();
        if (questionId) {
          const id = parseInt(questionId);
          setZoomedSentence(prev => prev === id ? null : id);
          setIsEditingAnalysis(false);
        }
      }
    };
    document.addEventListener('click', handleSentenceClick);
    return () => document.removeEventListener('click', handleSentenceClick);
  }, []);

  // ESC key to close popup
  useEffect(() => {
    if (!zoomedSentence) return;
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); setZoomedSentence(null); }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [zoomedSentence]);

  const zoomedSentenceData = useMemo(() => {
    if (!zoomedSentence) return null;
    return allQuestions.find(q => q.id === zoomedSentence) || null;
  }, [zoomedSentence, allQuestions]);

  const zoomedOriginalId = useMemo(() => {
    if (!zoomedSentence) return null;
    return globalOriginalIdMap.get(zoomedSentence) || zoomedSentence;
  }, [zoomedSentence, globalOriginalIdMap]);

  // Invoke analyze-syntax with retry (handles transient 503 / service degraded)
  const invokeAnalyzeWithRetry = useCallback(async (
    body: { sentence: string; translation?: string; answer?: string },
    retries = 3
  ): Promise<{ analysis?: string } | null> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const { data, error } = await supabase.functions.invoke('analyze-syntax', { body });
      if (!error && data?.analysis) return data;
      const msg = String((error as { message?: string })?.message || '');
      const transient = /503|429|degraded|temporarily unavailable|Failed to fetch|network/i.test(msg);
      if (!transient || attempt === retries) return null;
      await new Promise(r => setTimeout(r, 1500 * Math.pow(2, attempt)));
    }
    return null;
  }, []);

  // Analyze syntax using AI
  const handleAnalyzeSyntax = useCallback(async () => {
    if (!zoomedSentenceData || !zoomedOriginalId || isAnalyzing) return;
    setIsAnalyzing(true);
    setIsEditingAnalysis(false);
    try {
      const answer = answers.get(zoomedOriginalId) || '';
      const data = await invokeAnalyzeWithRetry({ sentence: zoomedSentenceData.sentence, translation: zoomedSentenceData.translation, answer });

      if (data?.analysis) {

        setSentenceNotes(prev => ({ ...prev, [zoomedOriginalId]: data.analysis }));
        setHasAnalysis(prev => ({ ...prev, [zoomedOriginalId]: true }));
        await supabase.functions.invoke('manage-syntax', {
          body: { action: 'save', questionId: zoomedOriginalId, analysis: data.analysis, adminCode: accessCode, workbookId: syntaxWorkbookId }
        });
      }
    } catch (err) {
      console.error('Error analyzing syntax:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [zoomedSentenceData, zoomedOriginalId, isAnalyzing, answers, accessCode, invokeAnalyzeWithRetry, syntaxWorkbookId]);

  // Batch generate syntax analyses for all weeks (parallel processing)
  const PARALLEL_CONCURRENCY = 3; // lower concurrency avoids edge runtime 503
  
  const handleBatchGenerate = useCallback(async (weekStart: number, weekEnd: number) => {
    if (batchGenerating) return;
    
    setBatchGenerating(true);
    batchAbortRef.current = false;
    
    // Collect all questions in range that don't have analysis yet
    const toGenerate: { globalId: number; originalId: number; sentence: string; translation?: string }[] = [];
    for (let w = weekStart; w <= weekEnd; w++) {
      const week = weeks[w - 1];
      if (!week) continue;
      for (let i = 0; i < week.questions.length; i++) {
        const origId = week.originalIds[i];
        if (!hasAnalysis[origId]) {
          toGenerate.push({
            globalId: (w - 1) * SENTENCES_PER_WEEK + (i + 1),
            originalId: origId,
            sentence: week.questions[i].sentence,
            translation: week.questions[i].translation,
          });
        }
      }
    }
    
    setBatchProgress({ current: 0, total: toGenerate.length, started: true });
    
    let completedCount = 0;
    let successCount = 0;
    const newNotes: Record<number, string> = { ...sentenceNotes };
    const newHasAnalysis: Record<number, boolean> = { ...hasAnalysis };
    
    // Process in parallel batches
    for (let batchStart = 0; batchStart < toGenerate.length; batchStart += PARALLEL_CONCURRENCY) {
      if (batchAbortRef.current) {
        console.log('Batch generation aborted');
        break;
      }
      
      const batch = toGenerate.slice(batchStart, batchStart + PARALLEL_CONCURRENCY);

      const results = await Promise.allSettled(
        batch.map(async (item) => {
          if (batchAbortRef.current) return null;
          const answer = answers.get(item.originalId) || '';

          const data = await invokeAnalyzeWithRetry({ sentence: item.sentence, translation: item.translation, answer });

          if (data?.analysis) {
            return { originalId: item.originalId, analysis: data.analysis };
          }
          return null;
        })
      );

      // Process results from this batch
      const batchAnalyses: Record<number, string> = {};
      for (const result of results) {
        completedCount++;
        if (result.status === 'fulfilled' && result.value) {
          newNotes[result.value.originalId] = result.value.analysis;
          newHasAnalysis[result.value.originalId] = true;
          batchAnalyses[result.value.originalId] = result.value.analysis;
          successCount++;
        }
      }

      // Persist this batch to DB and verify (retry up to 3 times)
      if (Object.keys(batchAnalyses).length > 0) {
        let saved = false;
        for (let attempt = 0; attempt < 3 && !saved; attempt++) {
          const { data: saveData, error: saveError } = await supabase.functions.invoke('manage-syntax', {
            body: { action: 'saveBatch', analyses: batchAnalyses, adminCode: accessCode, workbookId: syntaxWorkbookId }
          });
          if (!saveError && saveData?.success) {
            saved = true;
          } else {
            console.warn(`Batch save failed (attempt ${attempt + 1}):`, saveError || saveData);
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
        if (!saved) {
          // Fallback: save individually
          for (const [qid, text] of Object.entries(batchAnalyses)) {
            await supabase.functions.invoke('manage-syntax', {
              body: { action: 'save', questionId: Number(qid), analysis: text, adminCode: accessCode, workbookId: syntaxWorkbookId }
            });
          }
        }
      }

      setBatchProgress(prev => ({ ...prev, current: completedCount }));
      setSentenceNotes({ ...newNotes });
      setHasAnalysis({ ...newHasAnalysis });
      
      // Small delay between batches to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setSentenceNotes(newNotes);
    setHasAnalysis(newHasAnalysis);
    setBatchGenerating(false);
    batchAbortRef.current = false;
    setBatchProgress({ current: 0, total: 0, started: false });
    console.log(`Batch complete: ${successCount}/${toGenerate.length}`);
  }, [batchGenerating, weeks, hasAnalysis, sentenceNotes, answers, accessCode, syntaxWorkbookId]);

  // Count analyses per week
  const weekAnalysisCounts = useMemo(() => {
    const counts: Record<number, { done: number; total: number }> = {};
    for (const week of weeks) {
      let done = 0;
      for (const origId of week.originalIds) {
        if (hasAnalysis[origId]) done++;
      }
      counts[week.weekNumber] = { done, total: week.questions.length };
    }
    return counts;
  }, [weeks, hasAnalysis]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (zoomedSentence && e.key === ' ') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePageChange(currentPage - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handlePageChange(currentPage + 1); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, handlePageChange, zoomedSentence]);

  // Keyboard navigation for sentence popup
  useEffect(() => {
    if (zoomedSentence === null) return;
    const handlePopupKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const idx = allQuestions.findIndex(q => q.id === zoomedSentence);
        if (idx > 0) setZoomedSentence(allQuestions[idx - 1].id);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const idx = allQuestions.findIndex(q => q.id === zoomedSentence);
        if (idx < allQuestions.length - 1) setZoomedSentence(allQuestions[idx + 1].id);
      }
    };
    window.addEventListener('keydown', handlePopupKeyDown);
    return () => window.removeEventListener('keydown', handlePopupKeyDown);
  }, [zoomedSentence, allQuestions]);

  // Render sentence popup
  const renderSentencePopup = () => {
    if (!zoomedSentenceData || !zoomedOriginalId) return null;
    return (
      <div className="sentence-popup-overlay">
        <div className="sentence-popup-backdrop" />
        <div className="sentence-popup-content question-item" data-question-id={zoomedSentenceData.id}>
          <div className="sentence-popup-actions">
            {isAdmin && (
              hasAnalysis[zoomedOriginalId] && !isEditingAnalysis ? (
                <button className="sentence-popup-reanalyze" onClick={handleAnalyzeSyntax} disabled={isAnalyzing}>
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  <span>{isAnalyzing ? '분석중...' : '다시 분석'}</span>
                </button>
              ) : (
                <button className="sentence-popup-analyze" onClick={handleAnalyzeSyntax} disabled={isAnalyzing}>
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isAnalyzing ? '분석중...' : '구문분석'}</span>
                </button>
              )
            )}
            <button className="sentence-popup-close" onClick={() => setZoomedSentence(null)}>✕</button>
          </div>
          <div className="question-number hidden">{zoomedSentenceData.id}</div>
          <div className="sentence-popup-number">{zoomedSentenceData.id}</div>
          <p className="sentence-en sentence-popup-en">{zoomedSentenceData.sentence}</p>
          {zoomedSentenceData.translation && <p className="sentence-kr sentence-popup-kr">{zoomedSentenceData.translation}</p>}
          <div className="sentence-popup-notes">
            {hasAnalysis[zoomedOriginalId] ? (
              <>
                <SyntaxAnalysisDisplay
                  analysis={sentenceNotes[zoomedOriginalId] || ''}
                  onToggle={() => setIsSyntaxExpanded(!isSyntaxExpanded)}
                  isExpanded={isSyntaxExpanded}
                />
                {isEditingAnalysis && (
                  <div className="chalkboard-wrapper" style={{ marginTop: '12px' }}>
                    <textarea
                      className="sentence-popup-textarea"
                      placeholder="필기를 입력하세요..."
                      value={chalkboardNotes[zoomedOriginalId] || ''}
                      onChange={(e) => setChalkboardNotes(prev => ({ ...prev, [zoomedOriginalId!]: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="chalkboard-wrapper">
                <textarea
                  className="sentence-popup-textarea"
                  placeholder="필기를 입력하세요..."
                  value={chalkboardNotes[zoomedOriginalId] || ''}
                  onChange={(e) => setChalkboardNotes(prev => ({ ...prev, [zoomedOriginalId!]: e.target.value }))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
          <div className="sentence-popup-hint">
            텍스트 선택 후 Ctrl+1~5 주석 · Alt+1~4 표시 · ESC 닫기
          </div>
        </div>
      </div>
    );
  };

  // Render a specific page by absolute page number
  const renderPage = (absPage: number) => {
    const pi = getPageInfo(absPage);
    
    // Compute week-relative page number (resets to 1 each week)
    let weekRelPage = absPage;
    let weekTotalPg = totalPages;
    if (pi.weekNumber) {
      const wi = weekPageInfo.find(w => w.weekNumber === pi.weekNumber);
      if (wi) {
        weekRelPage = absPage - wi.startAbsPage + 1;
        weekTotalPg = wi.totalWeekPages;
      }
    }
    switch (pi.type) {
      case 'cover':
        return <CoverPage totalQuestions={allQuestions.length} totalPages={totalPages} title={gradeTitle} />;
      case 'toc':
        return <TableOfContents totalQuestions={allQuestions.length} totalPages={totalPages} questionsPerPage={QUESTIONS_PER_PAGE} onPageClick={handlePageChange} customChapters={tocChapters} />;
      case 'divider': {
        if (!pi.weekData) return null;
        const cats = [...new Set(Object.values(pi.weekData.grammarLabels))];
        const wi = weekPageInfo.find(w => w.weekNumber === pi.weekNumber);
        const divVocab = weeklyVocab[pi.weekNumber!] || [];
        const divRcWeek = rcWeeks.find(rw => rw.weekNumber === pi.weekNumber);
        const divRcCount = divRcWeek ? divRcWeek.firstHalf.length + divRcWeek.secondHalf.length : 0;
        return (
          <WeekDividerPage
            weekNumber={pi.weekNumber!}
            totalSentences={pi.weekData.questions.length}
            categories={cats}
            startPage={wi ? wi.startAbsPage + 1 : 0}
            endPage={wi ? wi.startAbsPage + wi.totalWeekPages - 1 : 0}
            gradeLabel={gradeLabel}
            totalVocabs={divVocab.length}
            totalRC={divRcCount}
          />
        );
      }
      case 'content': {
        if (!pi.weekData || pi.contentPageIndex === undefined) return null;
        
        // Compute questions for THIS specific page (not currentPage state)
        let start: number, end: number;
        if (pi.halfNumber !== undefined) {
          // 45+45 split structure
          const firstHalfPages = Math.ceil(SENTENCES_FIRST_HALF / QUESTIONS_PER_PAGE);
          const isFirstHalf = pi.contentPageIndex < firstHalfPages;
          start = isFirstHalf
            ? pi.contentPageIndex * QUESTIONS_PER_PAGE
            : SENTENCES_FIRST_HALF + (pi.contentPageIndex - firstHalfPages) * QUESTIONS_PER_PAGE;
          end = isFirstHalf
            ? Math.min(start + QUESTIONS_PER_PAGE, SENTENCES_FIRST_HALF)
            : Math.min(start + QUESTIONS_PER_PAGE, pi.weekData.questions.length);
        } else {
          start = pi.contentPageIndex * QUESTIONS_PER_PAGE;
          end = Math.min(start + QUESTIONS_PER_PAGE, pi.weekData.questions.length);
        }
        
        const pageQuestions = pi.weekData.questions.slice(start, end).map((q, i) => ({
          id: start + i + 1,
          sentence: q.sentence,
          translation: q.translation,
        }));
        
        if (pageQuestions.length === 0) return null;
        
        // Grammar labels for this page
        const pageGrammarLabels: Record<number, string> = {};
        for (let i = start; i < end; i++) {
          const localId = i + 1;
          pageGrammarLabels[localId] = pi.weekData.grammarLabels[localId] || '';
        }
        
        // Check if this is the last page of a half and should embed RC questions
        let embeddedRC: RCQuestion[] | undefined;
        if (pi.isLastPageOfHalf && pi.weekNumber) {
          const rcWeek = rcWeeks.find(rw => rw.weekNumber === pi.weekNumber);
          if (rcWeek) {
            embeddedRC = pi.halfNumber === 1 ? rcWeek.firstHalf : rcWeek.secondHalf;
            if (embeddedRC && embeddedRC.length === 0) embeddedRC = undefined;
          }
        }
        return (
           <WorkbookPage
            questions={pageQuestions}
            pageNumber={weekRelPage}
            totalPages={weekTotalPg}
            totalQuestions={allQuestions.length}
            grammarCategories={pageGrammarLabels}
            categoryViewMode={true}
            chapterTitle={`Week ${pi.weekNumber}`}
            rcQuestions={embeddedRC}
            gradeLabel={gradeLabel}
          />
        );
      }
      case 'vocab': {
        const allVocab = weeklyVocab[pi.weekNumber!] || [];
        const vocabContentPages = Math.max(1, Math.ceil(allVocab.length / VOCAB_PER_PAGE));
        const idx = pi.vocabPageIndex || 0;

        // Dedicated word-test pages after the vocabulary pages
        if (idx >= vocabContentPages) {
          const quizIndex = idx - vocabContentPages;
          const allQuiz = seededShuffle(allVocab, pi.weekNumber! * 31 + 7).slice(0, QUIZ_TOTAL);
          const quizStart = quizIndex * QUIZ_PER_PAGE;
          const quizSlice = allQuiz.slice(quizStart, quizStart + QUIZ_PER_PAGE);
          const quizPageCount = Math.max(1, Math.ceil(allQuiz.length / QUIZ_PER_PAGE));
          return (
            <VocabQuizPage
              weekNumber={pi.weekNumber!}
              quizItems={quizSlice}
              pageNumber={weekRelPage}
              totalPages={weekTotalPg}
              startNumber={quizStart + 1}
              partLabel={quizPageCount > 1 ? `${quizIndex + 1}/${quizPageCount}` : undefined}
            />
          );
        }

        const vocabStart = idx * VOCAB_PER_PAGE;
        const vocabSlice = allVocab.slice(vocabStart, vocabStart + VOCAB_PER_PAGE);
        return (
          <WeeklyVocabTable
            weekNumber={pi.weekNumber!}
            vocabItems={vocabSlice}
            pageNumber={weekRelPage}
            totalPages={weekTotalPg}
            startNumber={vocabStart + 1}
          />
        );
      }

      case 'rc-explanation': {
        const rcWeek = rcWeeks.find(rw => rw.weekNumber === pi.weekNumber);
        if (!rcWeek) return null;
        const rcSet = pi.rcSetNumber === 1 ? rcWeek.firstHalf : rcWeek.secondHalf;
        return (
          <RCExplanationPage
            questions={rcSet}
            pageNumber={weekRelPage}
            totalPages={weekTotalPg}
            weekNumber={pi.weekNumber!}
            explanationPageIndex={0}
          />
        );
      }
      case 'guide-divider': {
        if (!pi.weekData) return null;
        const weekGD = pi.weekData;
        const gdItems: GuideItem[] = [];
        for (let i = 0; i < weekGD.questions.length; i++) {
          const origId = weekGD.originalIds[i];
          if (sentenceNotes[origId]) {
            gdItems.push({
              question: { id: i + 1, sentence: weekGD.questions[i].sentence, translation: weekGD.questions[i].translation },
              analysis: sentenceNotes[origId],
            });
          }
        }
        const gdPages = paginateGuideItems(gdItems);
        const gdVocab = weeklyVocab[pi.weekNumber!] || [];
        const gdQuizAnswers = gdVocab.length > 0
          ? seededShuffle(gdVocab, pi.weekNumber! * 31 + 7).slice(0, QUIZ_TOTAL).map(v => ({ word: v.word, meaning: v.meaning }))
          : undefined;
        return (
          <GuideDividerPage
            weekNumber={pi.weekNumber!}
            totalGuideItems={gdItems.length}
            totalGuidePages={gdPages.length}
            gradeLabel={gradeLabel}
            vocabQuizAnswers={gdQuizAnswers}
          />
        );
      }
      case 'guide': {
        if (!pi.weekData) return null;
        const weekG = pi.weekData;
        const guideItems: GuideItem[] = [];
        for (let i = 0; i < weekG.questions.length; i++) {
          const origId = weekG.originalIds[i];
          if (sentenceNotes[origId]) {
            guideItems.push({
              question: { id: i + 1, sentence: weekG.questions[i].sentence, translation: weekG.questions[i].translation },
              analysis: sentenceNotes[origId],
            });
          }
        }
        const guidePagesList = paginateGuideItems(guideItems);
        const guidePageIdx = pi.guidePageIndex || 0;
        const pageItems = guidePagesList[guidePageIdx];
        if (!pageItems || pageItems.length === 0) return null;
        return (
          <SyntaxAnswerPage
            items={pageItems as { question: Question; analysis: string }[]}
            pageNumber={weekRelPage}
            chapterTitle={`Week ${pi.weekNumber}`}
            grade={grade}
          />

        );
      }
      case 'backcover':
        return <BackCover totalQuestions={allQuestions.length} />;
      default:
        return null;
    }
  };

  if (isLoadingAnalyses || isLoadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>ORUN WEEKLY 데이터 로딩중...</span>
        </div>
      </div>
    );
  }

  if (weeks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p>문법 카테고리 데이터가 필요합니다.</p>
          <Link to="/grammar-classification" className="text-primary underline mt-2 block">문법 분류 페이지로 이동</Link>
        </div>
      </div>
    );
  }

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
        <button onClick={toggleFullscreen} className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          <Minimize className="w-6 h-6 text-white" />
        </button>
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <input type="number" min={1} max={totalPages} value={currentPage}
            onChange={(e) => { const p = parseInt(e.target.value); if (p >= 1 && p <= totalPages) handlePageChange(p); }}
            className="w-14 text-center bg-white/10 text-white border border-white/30 rounded px-2 py-1 text-lg font-medium focus:outline-none"
          />
          <span className="text-white/70 text-lg font-medium">/ {totalPages}</span>
        </div>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full transition-colors">
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full transition-colors">
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
        <div className="w-full max-w-5xl mx-auto px-16 py-8 overflow-auto max-h-[90vh]">
          <div className="bg-white rounded-lg shadow-2xl">
            {renderPage(currentPage)}
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
          ← → 페이지 이동 · ESC 나가기
        </div>
        {showMeaningInput && pendingSelection && (
          <MeaningInput position={meaningInputPosition} selectedText={pendingSelection.text} onSubmit={handleMeaningSubmit} onClose={closeMeaningInput} />
        )}
        <ShortcutsPanel />
        {renderSentencePopup()}
        {showCorrectionInput && (
          <CorrectionInput position={correctionInputPosition} onSubmit={handleCorrectionSubmit} onClose={closeCorrectionInput} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top utility bar */}
      <div className="no-print orun-topbar">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="orun-topbar-link">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>문제집 목록</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="orun-topbar-badge">
                <Shield className="w-3 h-3" />
                관리자
              </span>
            )}
            <button onClick={logout} className="orun-topbar-link">
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
      </div>
      </div>

      {/* Admin batch generation panel */}
      {isAdmin && !isPrintMode && (
        <div className="no-print container mx-auto px-4 py-2">
          <details className="bg-muted/50 rounded-lg border border-border">
            <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              구문분석 일괄 생성 ({Object.values(weekAnalysisCounts).reduce((s, c) => s + c.done, 0)}/{allQuestions.length})
              {batchGenerating && (
                <span className="ml-2 text-xs text-primary">
                  진행중 {batchProgress.current}/{batchProgress.total}
                </span>
              )}
            </summary>
            <div className="px-4 pb-3 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => {
                  const counts = weekAnalysisCounts[w];
                  if (!counts) return null;
                  const pct = Math.round((counts.done / counts.total) * 100);
                  const isDone = pct === 100;
                  return (
                    <button
                      key={w}
                      onClick={() => handleBatchGenerate(w, w)}
                      disabled={batchGenerating || isDone}
                      className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : pct > 0
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      W{w} ({counts.done}/{counts.total})
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleBatchGenerate(1, TOTAL_WEEKS)}
                  disabled={batchGenerating}
                  className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {batchGenerating ? `생성중 ${batchProgress.current}/${batchProgress.total}` : '⚡ 전체 생성'}
                </button>
                {batchGenerating && (
                  <button
                    onClick={() => { batchAbortRef.current = true; }}
                    className="px-3 py-1.5 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                  >
                    중지
                  </button>
                )}
              </div>
            </div>
          </details>
        </div>
      )}

      <NavigationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalQuestions={allQuestions.length}
        questionsPerPage={QUESTIONS_PER_PAGE}
        isAdmin={isAdmin}
        onPageChange={handlePageChange}
        onPrint={handlePrint}
        onFullscreen={toggleFullscreen}
      />

      <main className={`orun-main ${isPrintMode ? 'print-all-pages' : ''}`}>
        {isPrintMode ? (
          <div className="print-container">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => !printRange || (p >= printRange.start && p <= printRange.end))
              .map(p => <div key={p}>{renderPage(p)}</div>)
            }
          </div>
        ) : isMobile ? (
          <MobilePageStage
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          >
            {renderPage(currentPage)}
          </MobilePageStage>
        ) : (
          <>
            {renderPage(currentPage)}
          </>
        )}

        {isPrintMode && <AnswerKey answers={globalAnswers} totalQuestions={allQuestions.length} />}
        {!isPrintMode && renderSentencePopup()}
      </main>

      {showMeaningInput && pendingSelection && (
        <MeaningInput position={meaningInputPosition} selectedText={pendingSelection.text} onSubmit={handleMeaningSubmit} onClose={closeMeaningInput} />
      )}

      <ShortcutsPanel />

      <footer className="no-print orun-footer">
        <div className="orun-footer-inner">
          <span className="orun-footer-brand">ORUN WEEKLY</span>
          <span className="orun-footer-sep">·</span>
          <span>{allQuestions.length.toLocaleString()}문장</span>
          <span className="orun-footer-sep">·</span>
          <span>{totalPages}페이지</span>
          <span className="orun-footer-sep">·</span>
          <span>{TOTAL_WEEKS}주차</span>
        </div>
      </footer>
    </div>
  );
};

export default WorkbookG12;
