import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Maximize, Minimize, ChevronLeft, ChevronRight, Loader2, Sparkles, RotateCcw, LogOut, Shield, Lock, Tag, List, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NavigationBar } from '@/components/NavigationBar';
import { WorkbookPage } from '@/components/WorkbookPage';
import { MeaningInput } from '@/components/MeaningInput';
import { CorrectionInput } from '@/components/CorrectionInput';
import { AnswerKey } from '@/components/AnswerKey';
import { CoverPage } from '@/components/CoverPage';
import { BackCover } from '@/components/BackCover';
import { TableOfContents } from '@/components/TableOfContents';
import { DividerPage } from '@/components/DividerPage';
import { ShortcutsPanel } from '@/components/ShortcutsPanel';
import { parseQuestions } from '@/lib/parseQuestions';
import { parseAnswers } from '@/lib/parseAnswers';
import { useTextAnnotation } from '@/hooks/useTextAnnotation';
import { VOLUMES } from '@/types/volume';
import { SyntaxAnalysisDisplay } from '@/components/SyntaxAnalysisDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import sentencesData from '@/data/sentences.txt?raw';
import answersData from '@/data/answers.txt?raw';

const QUESTIONS_PER_PAGE = 10;

// Map volume ID to access control ID
const VOLUME_ACCESS_MAP: Record<number, string> = {
  1: 'syntax10000-vol1',
  2: 'syntax10000-vol2',
  3: 'syntax10000-vol3',
};

const Workbook = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isAdmin, logout, accessCode, canAccessWorkbook, isLoading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get initial volume from URL query parameter
  const initialVolume = parseInt(searchParams.get('volume') || '1');
  const [currentVolume, setCurrentVolume] = useState(initialVolume >= 1 && initialVolume <= 3 ? initialVolume : 1);
  
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
  
  // Grammar category states
  const [grammarCategories, setGrammarCategories] = useState<Record<number, string>>({});
  const [categoryViewMode, setCategoryViewMode] = useState(false);
  const [batchClassifying, setBatchClassifying] = useState(false);
  const [classifyProgress, setClassifyProgress] = useState({ current: 0, total: 0, started: false });
  const classifyAbortRef = useRef(false);

  // Check access permission for current volume
  const currentVolumeAccessId = VOLUME_ACCESS_MAP[currentVolume];
  const hasVolumeAccess = canAccessWorkbook(currentVolumeAccessId);

  // Get list of accessible volumes for this user
  const accessibleVolumes = useMemo(() => {
    return VOLUMES.filter(v => canAccessWorkbook(VOLUME_ACCESS_MAP[v.id]));
  }, [canAccessWorkbook]);

  // 고3(VOL 3) 표지 테마를 내지에 적용
  useEffect(() => {
    document.documentElement.classList.add('orun-theme-g12');
    return () => document.documentElement.classList.remove('orun-theme-g12');
  }, []);

  // If current volume is not accessible, switch to first accessible volume

  useEffect(() => {
    if (!authLoading && !hasVolumeAccess && accessibleVolumes.length > 0) {
      setCurrentVolume(accessibleVolumes[0].id);
    }
  }, [authLoading, hasVolumeAccess, accessibleVolumes]);

  // Access denied state - will be checked after all hooks
  const showAccessDenied = !authLoading && accessibleVolumes.length === 0 && !isAdmin;

  // Load analyses and grammar categories from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load analyses and categories in parallel
        const [analysesRes, categoriesRes] = await Promise.all([
          supabase.functions.invoke('manage-syntax', {
            body: { action: 'getAll', workbookId: 'syntax10000' }
          }),
          supabase.functions.invoke('classify-grammar', {
            body: { action: 'getAll', workbookId: 'syntax10000' }
          })
        ]);

        if (analysesRes.data?.analyses) {
          setSentenceNotes(analysesRes.data.analyses);
          setHasAnalysis(analysesRes.data.hasAnalysis || {});
        }
        
        if (categoriesRes.data?.categories) {
          setGrammarCategories(categoriesRes.data.categories);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoadingAnalyses(false);
      }
    };

    loadData();
  }, []);
  
  // Parse all questions and answers from the text files
  const allQuestions = useMemo(() => parseQuestions(sentencesData), []);
  const allAnswers = useMemo(() => parseAnswers(answersData), []);
  
  // Get current volume info
  const volumeInfo = useMemo(() => VOLUMES.find(v => v.id === currentVolume) || VOLUMES[0], [currentVolume]);
  
  // Filter questions for current volume
  const questions = useMemo(() => {
    const filtered = allQuestions.filter(q => q.id >= volumeInfo.startQuestion && q.id <= volumeInfo.endQuestion);
    
    if (!categoryViewMode) return filtered;
    
    // Sort by grammar category
    const CATEGORY_ORDER = [
      '주어-동사 수일치', '시제', '태(능동/수동)', '관계사', '분사', '동명사', 'to부정사',
      '가정법', '도치', '강조', '접속사', '비교급/최상급', '병렬구조',
      '대명사', '명사/대명사 일치', '관사/한정사', '부사', '형용사/부사 혼동', '전치사', '어순', '기타'
    ];
    
    return [...filtered].sort((a, b) => {
      const catA = grammarCategories[a.id] || '기타';
      const catB = grammarCategories[b.id] || '기타';
      const idxA = CATEGORY_ORDER.indexOf(catA);
      const idxB = CATEGORY_ORDER.indexOf(catB);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [allQuestions, volumeInfo, categoryViewMode, grammarCategories]);
  
  // Filter answers for current volume (convert Map to filtered array then back)
  const answers = useMemo(() => {
    const filteredAnswers = new Map<number, string>();
    allAnswers.forEach((value, key) => {
      if (key >= volumeInfo.startQuestion && key <= volumeInfo.endQuestion) {
        filteredAnswers.set(key, value);
      }
    });
    return filteredAnswers;
  }, [allAnswers, volumeInfo]);
  
  // Text annotation hook with answers for Alt+1 feature
  const { 
    showMeaningInput, 
    meaningInputPosition, 
    pendingSelection, 
    handleMeaningSubmit, 
    closeMeaningInput,
    showCorrectionInput,
    correctionInputPosition,
    handleCorrectionSubmit,
    closeCorrectionInput
  } = useTextAnnotation({ answers });
  
  const contentPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  // Each chapter has 1000 questions (100 pages), divider appears before each chapter
  const questionsPerChapter = 1000;
  const pagesPerChapter = questionsPerChapter / QUESTIONS_PER_PAGE; // 100 pages per chapter
  const dividerCount = Math.ceil(questions.length / questionsPerChapter); // Dividers for each chapter
  const specialPages = 2 + dividerCount + 1; // Cover (1) + TOC (1) + Dividers + BackCover (1)
  const totalPages = contentPages + specialPages;
  
  // Determine if a given absolute page is a divider, and which chapter
  const getPageInfo = useCallback((absolutePage: number): { type: 'cover' | 'toc' | 'divider' | 'content'; chapter?: number; contentPageIndex?: number } => {
    if (absolutePage === 1) return { type: 'cover' };
    if (absolutePage === 2) return { type: 'toc' };
    
    // After cover and TOC, structure is: [Divider1][100 pages][Divider2][100 pages]...
    let position = absolutePage - 2; // Position after cover & TOC (1-indexed)
    
    // Each chapter block = 1 divider + 100 content pages = 101 pages
    const chapterBlockSize = pagesPerChapter + 1; // 101
    const chapterIndex = Math.floor((position - 1) / chapterBlockSize); // 0-indexed chapter
    const positionInChapter = ((position - 1) % chapterBlockSize) + 1; // 1-indexed position within chapter block
    
    if (positionInChapter === 1) {
      // First page of chapter block is divider
      return { type: 'divider', chapter: chapterIndex + 1 };
    } else {
      // Content page
      const contentPageInChapter = positionInChapter - 1; // 1-indexed content page within chapter
      const contentPageIndex = chapterIndex * pagesPerChapter + contentPageInChapter - 1; // 0-indexed global content page
      return { type: 'content', contentPageIndex };
    }
  }, [pagesPerChapter]);
  
  // Get current page questions (accounting for special pages)
  const currentQuestions = useMemo(() => {
    const pageInfo = getPageInfo(currentPage);
    
    if (pageInfo.type !== 'content' || pageInfo.contentPageIndex === undefined) {
      return [];
    }
    
    const startIndex = pageInfo.contentPageIndex * QUESTIONS_PER_PAGE;
    return questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
  }, [questions, currentPage, getPageInfo]);

  // Get all pages for printing
  const allPages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < contentPages; i++) {
      const startIndex = i * QUESTIONS_PER_PAGE;
      pages.push({
        pageNumber: i + 1,
        questions: questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE),
      });
    }
    return pages;
  }, [questions, contentPages]);
  
  const handlePageChange = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const handleVolumeChange = useCallback((volumeId: number) => {
    setCurrentVolume(volumeId);
    setCurrentPage(1); // Reset to first page when volume changes
  }, []);

  const handlePrint = useCallback((startPage?: number, endPage?: number) => {
    if (startPage !== undefined && endPage !== undefined) {
      setPrintRange({ start: startPage, end: endPage });
    } else {
      setPrintRange(null);
    }
    setIsPrintMode(true);
    // Wait for render then print - use longer delay and requestAnimationFrame for reliable rendering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
          // Reset after print dialog closes
          setTimeout(() => {
            setIsPrintMode(false);
            setPrintRange(null);
          }, 1000);
        }, 500);
      });
    });
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

  // Listen for fullscreen changes (e.g., ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation for page change (works in both normal and fullscreen mode)
  useEffect(() => {
    // Skip if popup is open (popup has its own navigation)
    if (zoomedSentence !== null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input field
      const tagName = (e.target as HTMLElement).tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handlePageChange(currentPage + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedSentence, currentPage, handlePageChange]);

  // Handle sentence click for zoom (both fullscreen and normal mode)
  useEffect(() => {
    const handleSentenceClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't do anything if clicking inside the popup
      if (target.closest('.sentence-popup-overlay')) {
        return;
      }
      
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
    if (zoomedSentence === null) return;
    
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setZoomedSentence(null);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [zoomedSentence]);

  // Get zoomed sentence data
  const zoomedSentenceData = useMemo(() => {
    if (zoomedSentence === null) return null;
    const question = allQuestions.find(q => q.id === zoomedSentence);
    if (!question) return null;
    return {
      id: question.id,
      sentence: question.sentence,
      translation: question.translation
    };
  }, [zoomedSentence, allQuestions]);

  // Analyze syntax using AI
  const handleAnalyzeSyntax = useCallback(async () => {
    if (!zoomedSentenceData || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setIsEditingAnalysis(false);
    try {
      // Get the answer for this sentence
      const answer = answers.get(zoomedSentenceData.id) || '';
      
      const { data, error } = await supabase.functions.invoke('analyze-syntax', {
        body: {
          sentence: zoomedSentenceData.sentence,
          translation: zoomedSentenceData.translation,
          answer: answer
        }
      });

      if (error) {
        console.error('Error analyzing syntax:', error);
        setSentenceNotes(prev => ({
          ...prev,
          [zoomedSentenceData.id]: '구문 분석 중 오류가 발생했습니다. 다시 시도해주세요.'
        }));
        return;
      }

      if (data?.analysis) {
        setSentenceNotes(prev => ({
          ...prev,
          [zoomedSentenceData.id]: data.analysis
        }));
        setHasAnalysis(prev => ({
          ...prev,
          [zoomedSentenceData.id]: true
        }));
        
        // Save to database
        await supabase.functions.invoke('manage-syntax', {
          body: { 
            action: 'save', 
            questionId: zoomedSentenceData.id, 
            analysis: data.analysis,
            adminCode: accessCode,
            workbookId: 'syntax10000'
          }
        });
      }
    } catch (err) {
      console.error('Error calling analyze-syntax:', err);
      setSentenceNotes(prev => ({
        ...prev,
        [zoomedSentenceData.id]: '구문 분석 중 오류가 발생했습니다. 다시 시도해주세요.'
      }));
    } finally {
      setIsAnalyzing(false);
    }
  }, [zoomedSentenceData, isAnalyzing, answers, accessCode]);

  // Batch generate syntax analyses for a range of sentences
  const handleBatchGenerate = useCallback(async (startId: number, endId: number) => {
    if (batchGenerating) return;
    
    setBatchGenerating(true);
    batchAbortRef.current = false;
    const toGenerate = allQuestions.filter(q => 
      q.id >= startId && q.id <= endId && !hasAnalysis[q.id]
    );
    setBatchProgress({ current: 0, total: toGenerate.length, started: true });
    
    let successCount = 0;
    const newNotes: Record<number, string> = { ...sentenceNotes };
    const newHasAnalysis: Record<number, boolean> = { ...hasAnalysis };
    
    for (let i = 0; i < toGenerate.length; i++) {
      // Check if abort was requested using ref for immediate response
      if (batchAbortRef.current) {
        console.log('Batch generation aborted by user');
        break;
      }
      
      const q = toGenerate[i];
      const answer = allAnswers.get(q.id) || '';
      
      try {
        const { data, error } = await supabase.functions.invoke('analyze-syntax', {
          body: {
            sentence: q.sentence,
            translation: q.translation,
            answer: answer
          }
        });
        
        if (!error && data?.analysis) {
          newNotes[q.id] = data.analysis;
          newHasAnalysis[q.id] = true;
          successCount++;
          
          // Update state every 5 items to show progress and save to DB
          if (successCount % 5 === 0) {
            setSentenceNotes({ ...newNotes });
            setHasAnalysis({ ...newHasAnalysis });
          }
          
          // Save each analysis to database
          await supabase.functions.invoke('manage-syntax', {
            body: { 
              action: 'save', 
              questionId: q.id, 
              analysis: data.analysis,
              adminCode: accessCode,
              workbookId: 'syntax10000'
            }
          });
        }
      } catch (err) {
        console.error(`Error analyzing sentence ${q.id}:`, err);
      }
      
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Final save to state
    setSentenceNotes(newNotes);
    setHasAnalysis(newHasAnalysis);
    
    setBatchGenerating(false);
    batchAbortRef.current = false;
    setBatchProgress({ current: 0, total: 0, started: false });
    console.log(`Batch generation complete: ${successCount}/${toGenerate.length} successful`);
  }, [batchGenerating, allQuestions, allAnswers, hasAnalysis, sentenceNotes, accessCode]);

  // Batch classify grammar categories
  const handleBatchClassify = useCallback(async (startId: number, endId: number) => {
    if (batchClassifying) return;
    
    setBatchClassifying(true);
    classifyAbortRef.current = false;
    const toClassify = allQuestions.filter(q => 
      q.id >= startId && q.id <= endId && !grammarCategories[q.id]
    );
    setClassifyProgress({ current: 0, total: toClassify.length, started: true });
    
    const newCategories: Record<number, string> = { ...grammarCategories };
    let successCount = 0;
    
    for (let i = 0; i < toClassify.length; i++) {
      if (classifyAbortRef.current) break;
      
      const q = toClassify[i];
      const answer = allAnswers.get(q.id) || '';
      
      try {
        const { data, error } = await supabase.functions.invoke('classify-grammar', {
          body: {
            action: 'classify',
            sentence: q.sentence,
            answer,
            questionId: q.id,
            workbookId: 'syntax10000',
            adminCode: accessCode
          }
        });
        
        if (!error && data?.category) {
          newCategories[q.id] = data.category;
          successCount++;
          
          if (successCount % 10 === 0) {
            setGrammarCategories({ ...newCategories });
          }
        }
      } catch (err) {
        console.error(`Error classifying sentence ${q.id}:`, err);
      }
      
      setClassifyProgress(prev => ({ ...prev, current: i + 1 }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setGrammarCategories(newCategories);
    setBatchClassifying(false);
    classifyAbortRef.current = false;
    setClassifyProgress({ current: 0, total: 0, started: false });
    console.log(`Batch classify complete: ${successCount}/${toClassify.length}`);
  }, [batchClassifying, allQuestions, allAnswers, grammarCategories, accessCode]);

  // Keyboard navigation for sentence popup (left/right arrows)
  useEffect(() => {
    if (zoomedSentence === null) return;
    
    const handlePopupKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in textarea
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // Find previous sentence
        const currentIndex = allQuestions.findIndex(q => q.id === zoomedSentence);
        if (currentIndex > 0) {
          setZoomedSentence(allQuestions[currentIndex - 1].id);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // Find next sentence
        const currentIndex = allQuestions.findIndex(q => q.id === zoomedSentence);
        if (currentIndex < allQuestions.length - 1) {
          setZoomedSentence(allQuestions[currentIndex + 1].id);
        }
      }
    };
    
    window.addEventListener('keydown', handlePopupKeyDown);
    return () => window.removeEventListener('keydown', handlePopupKeyDown);
  }, [zoomedSentence, allQuestions]);

  // Generate chapter info for ShortcutsPanel
  const chapterInfoList = useMemo(() => {
    const chapters = [];
    const totalChaptersCount = Math.ceil(questions.length / questionsPerChapter);
    let cumulativePages = 3; // Cover + TOC + first divider
    for (let ch = 1; ch <= totalChaptersCount; ch++) {
      const startQ = (ch - 1) * questionsPerChapter + 1 + (volumeInfo.startQuestion - 1);
      const endQ = Math.min(ch * questionsPerChapter + (volumeInfo.startQuestion - 1), volumeInfo.endQuestion);
      chapters.push({
        chapterNumber: ch,
        label: `${startQ}-${endQ}`,
        page: cumulativePages, // Page of the divider
      });
      cumulativePages += 1 + pagesPerChapter; // divider + content pages
    }
    return chapters;
  }, [questions.length, questionsPerChapter, pagesPerChapter, volumeInfo]);

  // Access denied view
  if (showAccessDenied) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">접근 권한이 없습니다</h1>
          <p className="text-zinc-400 mb-6">이 워크북에 대한 접근 권한이 없습니다.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // Fullscreen presentation mode
  if (isFullscreen) {
    const pageInfo = getPageInfo(currentPage);
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
        {/* Exit fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          title="전체화면 나가기 (ESC)"
        >
          <Minimize className="w-6 h-6 text-white" />
        </button>
        
        {/* Page indicator */}
        <div className="absolute top-4 left-4 text-white/70 text-lg font-medium">
          {currentPage} / {totalPages}
        </div>
        
        {/* Navigation arrows */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
        
        {/* Content area */}
        <div className="w-full max-w-5xl mx-auto px-16 py-8 overflow-auto max-h-[90vh]">
          <div className="bg-white rounded-lg shadow-2xl transform scale-100">
            {currentPage === 1 && (
              <CoverPage totalQuestions={questions.length} totalPages={totalPages} volume={volumeInfo} />
            )}
            {currentPage === 2 && (
              <TableOfContents 
                totalQuestions={questions.length} 
                totalPages={totalPages}
                questionsPerPage={QUESTIONS_PER_PAGE}
                onPageClick={handlePageChange}
                volumeInfo={volumeInfo}
              />
            )}
            {currentPage > 2 && currentPage < totalPages && (() => {
              if (pageInfo.type === 'divider' && pageInfo.chapter) {
                const chapterNumber = pageInfo.chapter;
                const chapterStartQ = (chapterNumber - 1) * questionsPerChapter + 1 + (volumeInfo.startQuestion - 1);
                const chapterEndQ = Math.min(chapterNumber * questionsPerChapter + (volumeInfo.startQuestion - 1), volumeInfo.endQuestion);
                const chapterStartPage = (chapterNumber - 1) * pagesPerChapter + 1;
                const chapterEndPage = Math.min(chapterNumber * pagesPerChapter, contentPages);
                return (
                  <DividerPage
                    chapterNumber={chapterNumber}
                    startQuestion={chapterStartQ}
                    endQuestion={chapterEndQ}
                    startPage={chapterStartPage}
                    endPage={chapterEndPage}
                  />
                );
              }
              if (pageInfo.type === 'content' && currentQuestions.length > 0) {
                return (
                  <WorkbookPage
                    questions={currentQuestions}
                    pageNumber={currentPage}
                    totalPages={totalPages}
                    totalQuestions={questions.length}
                    grammarCategories={grammarCategories}
                    categoryViewMode={categoryViewMode}
                    gradeLabel="고등"
                  />
                );
              }
              return null;
            })()}
            {currentPage === totalPages && (
              <BackCover totalQuestions={questions.length} volume={volumeInfo} />
            )}
          </div>
        </div>
        
        {/* Keyboard shortcuts hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
          ← → 페이지 이동 · 문장 클릭하여 확대 · Ctrl+1~5 주석 · Alt+1~4 표시 · ESC 나가기
        </div>
        
        {/* Sentence Popup Overlay */}
        {zoomedSentenceData && (
          <div className="sentence-popup-overlay">
            <div className="sentence-popup-backdrop" />
            <div className="sentence-popup-content question-item" data-question-id={zoomedSentenceData.id}>
              <div className="sentence-popup-actions">
                <button 
                  className="sentence-popup-analyze"
                  onClick={handleAnalyzeSyntax}
                  disabled={isAnalyzing}
                  aria-label="구문분석"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isAnalyzing ? '분석중...' : '구문분석'}</span>
                </button>
                <button 
                  className="sentence-popup-close"
                  onClick={() => setZoomedSentence(null)}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
              <div className="question-number hidden">{zoomedSentenceData.id}</div>
              <div className="sentence-popup-number">{zoomedSentenceData.id}</div>
              <p className="sentence-en sentence-popup-en">{zoomedSentenceData.sentence}</p>
              {zoomedSentenceData.translation && (
                <p className="sentence-kr sentence-popup-kr">{zoomedSentenceData.translation}</p>
              )}
              <div className="sentence-popup-notes">
                <textarea
                  className="sentence-popup-textarea"
                  placeholder="필기를 입력하세요..."
                  value={sentenceNotes[zoomedSentenceData.id] || ''}
                  onChange={(e) => setSentenceNotes(prev => ({
                    ...prev,
                    [zoomedSentenceData.id]: e.target.value
                  }))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="sentence-popup-hint">
                텍스트 선택 후 Ctrl+1~5 주석 · Alt+1~4 표시 · ESC 또는 ✕ 버튼으로 닫기
              </div>
            </div>
          </div>
        )}
        
        {/* Correction Input Popup (for fullscreen mode) */}
        {showCorrectionInput && (
          <CorrectionInput
            position={correctionInputPosition}
            onSubmit={handleCorrectionSubmit}
            onClose={closeCorrectionInput}
          />
        )}
        
        {/* Meaning Input Popup (for fullscreen mode) */}
        {showMeaningInput && pendingSelection && (
          <MeaningInput
            position={meaningInputPosition}
            selectedText={pendingSelection.text}
            onSubmit={handleMeaningSubmit}
            onClose={closeMeaningInput}
          />
        )}
        
        {/* Shortcuts Panel (for fullscreen mode) */}
        <ShortcutsPanel chapters={chapterInfoList} onChapterSelect={handlePageChange} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Back to Home Link and Logout (hidden in print) */}
      <div className="no-print container mx-auto px-4 pt-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          문제집 목록으로
        </Link>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
              <Shield className="w-3 h-3" />
              관리자
            </span>
          )}
          <button
            onClick={logout}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>

      {/* Navigation */}
      <NavigationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalQuestions={questions.length}
        currentVolume={currentVolume}
        questionsPerPage={QUESTIONS_PER_PAGE}
        isAdmin={isAdmin}
        volumeStartQuestion={volumeInfo.startQuestion}
        onPageChange={handlePageChange}
        onPrint={handlePrint}
        onVolumeChange={handleVolumeChange}
        onFullscreen={toggleFullscreen}
      />

      {/* Batch Generation Panel - Admin Only */}
      {!isPrintMode && isAdmin && (
        <div className="no-print container mx-auto px-4 py-2">
          <div className="flex flex-col gap-3 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-amber-600">관리자 전용: 구문분석 일괄 생성</span>
            </div>
            {batchProgress.started ? (
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {batchProgress.current} / {batchProgress.total}
                </span>
                <button
                  onClick={() => { batchAbortRef.current = true; }}
                  className="px-3 py-1 text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive rounded transition-colors"
                >
                  중단
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Helper function to get button style based on completion */}
                {(() => {
                  const getButtonStyle = (start: number, end: number) => {
                    // Check if currently generating this range
                    if (batchGenerating && batchProgress.started) {
                      const currentId = batchProgress.current;
                      if (currentId >= start && currentId <= end) {
                        return "bg-amber-500 text-white animate-pulse";
                      }
                    }
                    
                    // Count completed in range
                    let completed = 0;
                    for (let i = start; i <= end; i++) {
                      if (hasAnalysis[i]) completed++;
                    }
                    const total = end - start + 1;
                    const percentage = (completed / total) * 100;
                    
                    if (percentage === 100) {
                      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30";
                    } else if (percentage > 0) {
                      return "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30";
                    }
                    return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
                  };

                  return (
                    <>
                      {/* Vol. 1 (1-3000) */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-primary">Vol. 1 (1~3000번)</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from({ length: 15 }, (_, i) => {
                            const start = i * 200 + 1;
                            const end = (i + 1) * 200;
                            return (
                              <button
                                key={`vol1-${start}`}
                                onClick={() => handleBatchGenerate(start, end)}
                                disabled={batchGenerating}
                                className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${getButtonStyle(start, end)}`}
                              >
                                {start}~{end}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Vol. 2 (3001-6000) */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-primary">Vol. 2 (3001~6000번)</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from({ length: 15 }, (_, i) => {
                            const start = 3001 + i * 200;
                            const end = 3000 + (i + 1) * 200;
                            return (
                              <button
                                key={`vol2-${start}`}
                                onClick={() => handleBatchGenerate(start, end)}
                                disabled={batchGenerating}
                                className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${getButtonStyle(start, end)}`}
                              >
                                {start}~{end}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Vol. 3 (6001-10000) */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-primary">Vol. 3 (6001~10000번)</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from({ length: 20 }, (_, i) => {
                            const start = 6001 + i * 200;
                            const end = Math.min(6000 + (i + 1) * 200, 10000);
                            return (
                              <button
                                key={`vol3-${start}`}
                                onClick={() => handleBatchGenerate(start, end)}
                                disabled={batchGenerating}
                                className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${getButtonStyle(start, end)}`}
                              >
                                {start}~{end}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30"></span>
                          완료
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30"></span>
                          일부 완료
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-secondary border border-border"></span>
                          미생성
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grammar Category Classification Panel - Admin Only */}
      {!isPrintMode && isAdmin && (
        <div className="no-print container mx-auto px-4 py-2">
          <div className="flex flex-col gap-3 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-sky-500" />
                <span className="font-medium text-sky-600">문법 카테고리 분류</span>
              </div>
              <button
                onClick={() => setCategoryViewMode(!categoryViewMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  categoryViewMode 
                    ? 'bg-sky-500 text-white border-sky-500' 
                    : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
                }`}
              >
                {categoryViewMode ? <Layers className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                {categoryViewMode ? '카테고리순 보기' : '원본순 보기'}
              </button>
            </div>
            {classifyProgress.started ? (
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${(classifyProgress.current / classifyProgress.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {classifyProgress.current} / {classifyProgress.total}
                </span>
                <button
                  onClick={() => { classifyAbortRef.current = true; }}
                  className="px-3 py-1 text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive rounded transition-colors"
                >
                  중단
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const getClassifyButtonStyle = (start: number, end: number) => {
                      let completed = 0;
                      let total = 0;
                      for (let i = start; i <= end; i++) {
                        if (allQuestions.find(q => q.id === i)) {
                          total++;
                          if (grammarCategories[i]) completed++;
                        }
                      }
                      const pct = total > 0 ? (completed / total) * 100 : 0;
                      if (pct === 100) return "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30";
                      if (pct > 0) return "bg-sky-500/20 text-sky-700 border border-sky-500/30";
                      return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
                    };

                    const volStart = volumeInfo.startQuestion;
                    const volEnd = volumeInfo.endQuestion;
                    const buttons = [];
                    for (let s = volStart; s <= volEnd; s += 200) {
                      const e = Math.min(s + 199, volEnd);
                      buttons.push(
                        <button
                          key={`classify-${s}`}
                          onClick={() => handleBatchClassify(s, e)}
                          disabled={batchClassifying}
                          className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${getClassifyButtonStyle(s, e)}`}
                        >
                          {s}~{e}
                        </button>
                      );
                    }
                    return buttons;
                  })()}
                </div>
                {/* Category stats */}
                {Object.keys(grammarCategories).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(() => {
                      const catCounts: Record<string, number> = {};
                      Object.values(grammarCategories).forEach(cat => {
                        catCounts[cat] = (catCounts[cat] || 0) + 1;
                      });
                      return Object.entries(catCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([cat, count]) => (
                          <Badge key={cat} variant="outline" className="text-[10px] py-0">
                            {cat} ({count})
                          </Badge>
                        ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main Content - Show all pages in print mode */}
      <main className={`px-4 py-8 ${isPrintMode ? 'print-all-pages' : ''}`}>
        {isPrintMode ? (
          // Print mode: render cover, toc, dividers, and pages
          <div className="print-container">
            {/* Cover Page */}
            <CoverPage totalQuestions={questions.length} totalPages={totalPages} volume={volumeInfo} />
            
            {/* Table of Contents */}
            <TableOfContents 
              totalQuestions={questions.length} 
              totalPages={totalPages}
              questionsPerPage={QUESTIONS_PER_PAGE}
              onPageClick={handlePageChange}
              volumeInfo={volumeInfo}
            />
            
            {/* Pages with dividers before each chapter (every 1000 questions) */}
            {allPages
              .filter((page) => {
                if (printRange) {
                  return page.pageNumber >= printRange.start && page.pageNumber <= printRange.end;
                }
                return true;
              })
              .map((page) => {
                // Calculate first question on this page (relative to volume)
                const firstQuestionOnPage = (page.pageNumber - 1) * QUESTIONS_PER_PAGE + 1;
                // Show divider before first page of each 1000-question chapter
                const shouldShowDivider = (firstQuestionOnPage - 1) % questionsPerChapter === 0;
                const chapterNumber = Math.floor((firstQuestionOnPage - 1) / questionsPerChapter) + 1;
                const chapterStartQ = (chapterNumber - 1) * questionsPerChapter + 1 + (volumeInfo.startQuestion - 1);
                const chapterEndQ = Math.min(chapterNumber * questionsPerChapter + (volumeInfo.startQuestion - 1), volumeInfo.endQuestion);
                const chapterStartPage = (chapterNumber - 1) * pagesPerChapter + 1;
                const chapterEndPage = Math.min(chapterNumber * pagesPerChapter, contentPages);
                
                return (
                  <div key={page.pageNumber}>
                    {/* Divider page at the start of each 1000-question chapter */}
                    {shouldShowDivider && (
                      <DividerPage
                        chapterNumber={chapterNumber}
                        startQuestion={chapterStartQ}
                        endQuestion={chapterEndQ}
                        startPage={chapterStartPage}
                        endPage={chapterEndPage}
                      />
                    )}
                    <WorkbookPage
                      questions={page.questions}
                      pageNumber={page.pageNumber}
                      totalPages={totalPages}
                      totalQuestions={questions.length}
                      grammarCategories={grammarCategories}
                      categoryViewMode={categoryViewMode}
                      gradeLabel="고등"
                    />
                  </div>
                );
              })}
          </div>
        ) : (
          // Normal mode: render based on current page type
          <>
            {currentPage === 1 && (
              <CoverPage totalQuestions={questions.length} totalPages={totalPages} volume={volumeInfo} />
            )}
            {currentPage === 2 && (
              <TableOfContents 
                totalQuestions={questions.length} 
                totalPages={totalPages}
                questionsPerPage={QUESTIONS_PER_PAGE}
                onPageClick={handlePageChange}
                volumeInfo={volumeInfo}
              />
            )}
            {currentPage > 2 && currentPage < totalPages && (() => {
              const pageInfo = getPageInfo(currentPage);
              if (pageInfo.type === 'divider' && pageInfo.chapter) {
                const chapterNumber = pageInfo.chapter;
                const chapterStartQ = (chapterNumber - 1) * questionsPerChapter + 1 + (volumeInfo.startQuestion - 1);
                const chapterEndQ = Math.min(chapterNumber * questionsPerChapter + (volumeInfo.startQuestion - 1), volumeInfo.endQuestion);
                const chapterStartPage = (chapterNumber - 1) * pagesPerChapter + 1;
                const chapterEndPage = Math.min(chapterNumber * pagesPerChapter, contentPages);
                return (
                  <DividerPage
                    chapterNumber={chapterNumber}
                    startQuestion={chapterStartQ}
                    endQuestion={chapterEndQ}
                    startPage={chapterStartPage}
                    endPage={chapterEndPage}
                  />
                );
              }
              if (pageInfo.type === 'content' && currentQuestions.length > 0) {
                return (
                  <WorkbookPage
                    questions={currentQuestions}
                    pageNumber={currentPage}
                    totalPages={totalPages}
                    totalQuestions={questions.length}
                    grammarCategories={grammarCategories}
                    categoryViewMode={categoryViewMode}
                    gradeLabel="고등"
                  />
                );
              }
              return null;
            })()}
            {currentPage === totalPages && (
              <BackCover totalQuestions={questions.length} volume={volumeInfo} />
            )}
          </>
        )}
        
        {/* Answer Key Section (only in print mode) */}
        {isPrintMode && (
          <AnswerKey 
            answers={answers} 
            totalQuestions={questions.length}
            questionRange={printRange ? {
              start: (printRange.start - 1) * QUESTIONS_PER_PAGE + 1,
              end: Math.min(printRange.end * QUESTIONS_PER_PAGE, questions.length)
            } : undefined}
          />
        )}
        
        {/* Back Cover (only in print mode, full print only) */}
        {isPrintMode && !printRange && (
          <BackCover totalQuestions={questions.length} volume={volumeInfo} />
        )}
      </main>
      
      {/* Sentence Popup Overlay (for normal mode) */}
      {zoomedSentenceData && (
        <div className="sentence-popup-overlay">
          <div className="sentence-popup-backdrop" />
          <div className="sentence-popup-content question-item" data-question-id={zoomedSentenceData.id}>
            <div className="sentence-popup-actions">
              {isAdmin && (
                hasAnalysis[zoomedSentenceData.id] && !isEditingAnalysis ? (
                  <button 
                    className="sentence-popup-reanalyze"
                    onClick={handleAnalyzeSyntax}
                    disabled={isAnalyzing}
                    aria-label="다시 분석"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    <span>{isAnalyzing ? '분석중...' : '다시 분석'}</span>
                  </button>
                ) : (
                  <button 
                    className="sentence-popup-analyze"
                    onClick={handleAnalyzeSyntax}
                    disabled={isAnalyzing}
                    aria-label="구문분석"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{isAnalyzing ? '분석중...' : '구문분석'}</span>
                  </button>
                )
              )}
              <button 
                className="sentence-popup-close"
                onClick={() => setZoomedSentence(null)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="question-number hidden">{zoomedSentenceData.id}</div>
            <div className="sentence-popup-number">{zoomedSentenceData.id}</div>
            <p className="sentence-en sentence-popup-en">{zoomedSentenceData.sentence}</p>
            {zoomedSentenceData.translation && (
              <p className="sentence-kr sentence-popup-kr">{zoomedSentenceData.translation}</p>
            )}
            <div className="sentence-popup-notes">
              {hasAnalysis[zoomedSentenceData.id] ? (
                <>
                  <SyntaxAnalysisDisplay 
                    analysis={sentenceNotes[zoomedSentenceData.id] || ''} 
                    onToggle={() => setIsSyntaxExpanded(!isSyntaxExpanded)}
                    isExpanded={isSyntaxExpanded}
                  />
                  {isEditingAnalysis && (
                    <div className="chalkboard-wrapper" style={{ marginTop: '12px' }}>
                      <div className="chalk-dust chalk-dust-1"></div>
                      <div className="chalk-dust chalk-dust-2"></div>
                      <div className="chalk-dust chalk-dust-3"></div>
                      <div className="eraser-marks"></div>
                      <textarea
                        className="sentence-popup-textarea"
                        placeholder="필기를 입력하세요..."
                        value={chalkboardNotes[zoomedSentenceData.id] || ''}
                        onChange={(e) => setChalkboardNotes(prev => ({
                          ...prev,
                          [zoomedSentenceData.id]: e.target.value
                        }))}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="chalkboard-wrapper">
                  <div className="chalk-dust chalk-dust-1"></div>
                  <div className="chalk-dust chalk-dust-2"></div>
                  <div className="chalk-dust chalk-dust-3"></div>
                  <div className="eraser-marks"></div>
                  <textarea
                    className="sentence-popup-textarea"
                    placeholder="필기를 입력하세요..."
                    value={chalkboardNotes[zoomedSentenceData.id] || ''}
                    onChange={(e) => setChalkboardNotes(prev => ({
                      ...prev,
                      [zoomedSentenceData.id]: e.target.value
                    }))}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
            {isAdmin && (
              <div className="sentence-popup-hint">
                텍스트 선택 후 Ctrl+1~5 주석 · Alt+1~4 표시 · Shift+1 밑줄 · ESC 또는 ✕ 버튼으로 닫기
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Correction Input Popup (for normal mode) */}
      {showCorrectionInput && (
        <CorrectionInput
          position={correctionInputPosition}
          onSubmit={handleCorrectionSubmit}
          onClose={closeCorrectionInput}
        />
      )}
      
      {/* Meaning Input Popup */}
      {showMeaningInput && pendingSelection && (
        <MeaningInput
          position={meaningInputPosition}
          selectedText={pendingSelection.text}
          onSubmit={handleMeaningSubmit}
          onClose={closeMeaningInput}
        />
      )}
      
      {/* Shortcuts Panel */}
      <ShortcutsPanel chapters={chapterInfoList} onChapterSelect={handlePageChange} />
      
      {/* Footer */}
      <footer className="no-print py-6 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          고3 상위권 구문 특강 · {volumeInfo.name} · {questions.length.toLocaleString()}문장 · {totalPages}페이지
        </p>
      </footer>
    </div>
  );
};

export default Workbook;
