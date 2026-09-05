import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer, LogOut, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { GuideBookFrontCover, GuideBookBackCover } from '@/components/GuideBookCover';
import { SyntaxAnswerPage } from '@/components/SyntaxAnswerPage';
import { parseQuestions, Question } from '@/lib/parseQuestions';
import { deduplicateSentences } from '@/lib/deduplicateSentences';
import { distributeWeekly } from '@/lib/weeklyDistribution';
import { paginateGuideItems } from '@/lib/paginateGuideItems';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import sentencesData from '@/data/sentences-g12.txt?raw';

const SyntaxAnswerBook = () => {
  const { logout } = useAuth();
  const [sentenceNotes, setSentenceNotes] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [grammarCategories, setGrammarCategories] = useState<Record<number, string>>({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [analysisRes, catRes] = await Promise.all([
        supabase.functions.invoke('manage-syntax', { body: { action: 'getAll', workbookId: 'syntax2320' } }),
        supabase.functions.invoke('classify-grammar', { body: { action: 'getAll', workbookId: 'syntax2320' } }),
      ]);
      if (analysisRes.data?.analyses) setSentenceNotes(analysisRes.data.analyses);
      if (catRes.data?.categories) setGrammarCategories(catRes.data.categories);
      setIsLoading(false);
      setIsLoadingCategories(false);
    };
    loadData();
  }, []);

  const allParsedQuestions = useMemo(() => parseQuestions(sentencesData), []);
  const { deduplicated: originalQuestions } = useMemo(() => deduplicateSentences(allParsedQuestions), [allParsedQuestions]);

  // Distribute into 20 weeks
  const weeks = useMemo(() => {
    if (isLoadingCategories || Object.keys(grammarCategories).length === 0) return [];
    return distributeWeekly(originalQuestions, grammarCategories);
  }, [originalQuestions, grammarCategories, isLoadingCategories]);

  // Build analyzed items for selected week (or all weeks)
  const analyzedItems = useMemo(() => {
    const targetWeeks = selectedWeek ? weeks.filter(w => w.weekNumber === selectedWeek) : weeks;
    const items: { question: Question; analysis: string; origId: number; weekNumber: number; weekLocalId: number }[] = [];

    for (const week of targetWeeks) {
      for (let i = 0; i < week.questions.length; i++) {
        const q = week.questions[i];
        const origId = week.originalIds[i];
        const analysis = sentenceNotes[origId];
        if (analysis) {
          items.push({ question: q, analysis, origId, weekNumber: week.weekNumber, weekLocalId: q.id });
        }
      }
    }
    return items;
  }, [weeks, sentenceNotes, selectedWeek]);

  // Build pages with week titles using dynamic pagination
  const pages = useMemo(() => {
    const paginated = paginateGuideItems(analyzedItems);
    return paginated.map(pageItems => {
      const firstItem = pageItems[0] as typeof analyzedItems[0] | undefined;
      const weekTitle = firstItem ? `Week ${firstItem.weekNumber}` : '';
      return { items: pageItems as typeof analyzedItems, weekTitle };
    });
  }, [analyzedItems]);

  const totalPages = pages.length + 2; // cover + content + back cover

  const handlePageChange = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrintMode(false), 500);
    }, 100);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePageChange(currentPage - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handlePageChange(currentPage + 1); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, handlePageChange]);

  if (isLoading || isLoadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>구문분석 데이터 로딩중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background sa-book">
      <div className="no-print container mx-auto px-4 pt-4 flex items-center justify-between">
        <Link to="/workbook/syntax-2320" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          ORUN WEEKLY로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Printer className="w-4 h-4" />
            인쇄
          </button>
          <button onClick={logout} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>

      {/* Week selector */}
      <div className="no-print container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
          <button
            onClick={() => { setSelectedWeek(null); setCurrentPage(1); }}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              selectedWeek === null ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
            }`}
          >
            전체
          </button>
          {Array.from({ length: 20 }, (_, i) => i + 1).map(w => (
            <button
              key={w}
              onClick={() => { setSelectedWeek(w); setCurrentPage(1); }}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                selectedWeek === w ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
            >
              W{w}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}
            className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <input type="number" min={1} max={totalPages} value={currentPage}
              onChange={(e) => { const p = parseInt(e.target.value); if (p >= 1 && p <= totalPages) handlePageChange(p); }}
              className="w-14 text-center border border-border rounded px-2 py-1 text-sm bg-background"
            />
            <span className="text-sm text-muted-foreground">/ {totalPages}</span>
          </div>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}
            className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-1">
          ORUN GUIDE · {selectedWeek ? `Week ${selectedWeek}` : '전체'} · {analyzedItems.length}문장 · {totalPages}페이지
        </p>
      </div>

      <main className={`px-4 py-4 ${isPrintMode ? 'print-all-pages' : ''}`}>
        {isPrintMode ? (
          <div className="print-container">
            <GuideBookFrontCover totalQuestions={analyzedItems.length} />
            {pages.map((page, i) => (
              <SyntaxAnswerPage
                key={i}
                items={page.items}
                pageNumber={i + 2}
                chapterTitle={page.weekTitle}
              />
            ))}
            <GuideBookBackCover totalQuestions={analyzedItems.length} />
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {currentPage === 1 && <GuideBookFrontCover totalQuestions={analyzedItems.length} />}
            {currentPage > 1 && currentPage <= pages.length + 1 && (
              <SyntaxAnswerPage
                items={pages[currentPage - 2].items}
                pageNumber={currentPage}
                chapterTitle={pages[currentPage - 2].weekTitle}
              />
            )}
            {currentPage === totalPages && <GuideBookBackCover totalQuestions={analyzedItems.length} />}
          </div>
        )}
      </main>

      <footer className="no-print py-6 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          ORUN GUIDE · {analyzedItems.length}문장 · {totalPages}페이지
        </p>
      </footer>
    </div>
  );
};

export default SyntaxAnswerBook;
