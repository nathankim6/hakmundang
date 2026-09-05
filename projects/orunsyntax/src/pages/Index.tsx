import { useState, useMemo, useCallback } from 'react';
import { NavigationBar } from '@/components/NavigationBar';
import { WorkbookPage } from '@/components/WorkbookPage';
import { MeaningInput } from '@/components/MeaningInput';
import { AnswerKey } from '@/components/AnswerKey';
import { CoverPage } from '@/components/CoverPage';
import { TableOfContents } from '@/components/TableOfContents';
import { DividerPage } from '@/components/DividerPage';
import { parseQuestions } from '@/lib/parseQuestions';
import { parseAnswers } from '@/lib/parseAnswers';
import { useTextAnnotation } from '@/hooks/useTextAnnotation';
import sentencesData from '@/data/sentences.txt?raw';
import answersData from '@/data/answers.txt?raw';

const QUESTIONS_PER_PAGE = 10;

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [printRange, setPrintRange] = useState<{ start: number; end: number } | null>(null);
  
  // Parse questions and answers from the text files
  const questions = useMemo(() => parseQuestions(sentencesData), []);
  const answers = useMemo(() => parseAnswers(answersData), []);
  
  // Text annotation hook with answers for Alt+1 feature
  const { 
    showMeaningInput, 
    meaningInputPosition, 
    pendingSelection, 
    handleMeaningSubmit, 
    closeMeaningInput 
  } = useTextAnnotation({ answers });
  
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  
  // Get current page questions
  const currentQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    return questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
  }, [questions, currentPage]);

  // Get all pages for printing
  const allPages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * QUESTIONS_PER_PAGE;
      pages.push({
        pageNumber: i + 1,
        questions: questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE),
      });
    }
    return pages;
  }, [questions, totalPages]);
  
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
    // Wait for render then print
    setTimeout(() => {
      window.print();
      // Reset after print dialog closes
      setTimeout(() => {
        setIsPrintMode(false);
        setPrintRange(null);
      }, 500);
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <NavigationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalQuestions={questions.length}
        onPageChange={handlePageChange}
        onPrint={handlePrint}
      />
      
      {/* Main Content - Show all pages in print mode */}
      <main className={`px-4 py-8 ${isPrintMode ? 'print-all-pages' : ''}`}>
        {isPrintMode ? (
          // Print mode: render cover, toc, dividers, and pages
          <div className="print-container">
            {/* Cover Page */}
            <CoverPage totalQuestions={questions.length} totalPages={totalPages} />
            
            {/* Table of Contents */}
            <TableOfContents 
              totalQuestions={questions.length} 
              totalPages={totalPages}
              questionsPerPage={QUESTIONS_PER_PAGE}
              onPageClick={handlePageChange}
            />
            
            {/* Pages with dividers every 100 pages */}
            {allPages
              .filter((page) => {
                if (printRange) {
                  return page.pageNumber >= printRange.start && page.pageNumber <= printRange.end;
                }
                return true;
              })
              .map((page) => {
                const shouldShowDivider = (page.pageNumber - 1) % 100 === 0;
                const chapterNumber = Math.floor((page.pageNumber - 1) / 100) + 1;
                const chapterStartPage = (chapterNumber - 1) * 100 + 1;
                const chapterEndPage = Math.min(chapterNumber * 100, totalPages);
                const chapterStartQ = (chapterStartPage - 1) * QUESTIONS_PER_PAGE + 1;
                const chapterEndQ = Math.min(chapterEndPage * QUESTIONS_PER_PAGE, questions.length);
                
                return (
                  <div key={page.pageNumber}>
                    {/* Divider page at the start of each 100-page chapter */}
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
                    />
                  </div>
                );
              })}
          </div>
        ) : (
          // Normal mode: render current page only
          <WorkbookPage
            questions={currentQuestions}
            pageNumber={currentPage}
            totalPages={totalPages}
            totalQuestions={questions.length}
          />
        )}
        
        {/* Answer Key Section (only in print mode) */}
        {isPrintMode && (
          <AnswerKey answers={answers} totalQuestions={questions.length} />
        )}
      </main>
      
      {/* Meaning Input Popup */}
      {showMeaningInput && pendingSelection && (
        <MeaningInput
          position={meaningInputPosition}
          selectedText={pendingSelection.text}
          onSubmit={handleMeaningSubmit}
          onClose={closeMeaningInput}
        />
      )}
      
      {/* Footer */}
      <footer className="no-print py-6 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          고3 상위권 구문 특강 · 총 {questions.length.toLocaleString()}문장 · {totalPages}페이지
        </p>
      </footer>
    </div>
  );
};

export default Index;
