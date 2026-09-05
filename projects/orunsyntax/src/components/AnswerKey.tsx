import { BookOpen } from 'lucide-react';

interface AnswerKeyProps {
  answers: Map<number, string>;
  totalQuestions: number;
  questionRange?: { start: number; end: number };
}

// Number of answers that fit on one page (2 columns x ~40 rows)
const ANSWERS_PER_PAGE = 80;

// Chapter configuration: 100 questions per chapter, last chapter (23) has 120 questions
const QUESTIONS_PER_CHAPTER_NORMAL = 100;

// Helper to get chapter number for a question
const getChapterForQuestion = (questionNum: number, totalQuestions: number) => {
  // For Syntax 2320: 22 chapters of 100, last chapter of 120
  if (totalQuestions === 2320 || totalQuestions <= 2320) {
    if (questionNum <= 2200) {
      return Math.ceil(questionNum / QUESTIONS_PER_CHAPTER_NORMAL);
    }
    return 23;
  }
  // For other workbooks (Syntax 10000), use 1000 questions per chapter
  return Math.floor((questionNum - 1) / 1000) + 1;
};

// Helper to get question range for a chapter
const getChapterRange = (chapterNum: number, totalQuestions: number) => {
  // For Syntax 2320
  if (totalQuestions === 2320 || totalQuestions <= 2320) {
    if (chapterNum <= 22) {
      return {
        start: (chapterNum - 1) * QUESTIONS_PER_CHAPTER_NORMAL + 1,
        end: chapterNum * QUESTIONS_PER_CHAPTER_NORMAL
      };
    }
    // Chapter 23
    return {
      start: 2201,
      end: Math.min(2320, totalQuestions)
    };
  }
  // For other workbooks
  return {
    start: (chapterNum - 1) * 1000 + 1,
    end: Math.min(chapterNum * 1000, totalQuestions)
  };
};

export function AnswerKey({ answers, totalQuestions, questionRange }: AnswerKeyProps) {
  // Sort answers and filter by range if provided
  const answersArray = Array.from(answers.entries())
    .filter(([id]) => {
      if (!questionRange) return true;
      return id >= questionRange.start && id <= questionRange.end;
    })
    .sort((a, b) => a[0] - b[0]);
  
  // Calculate display total
  const displayTotalQuestions = questionRange 
    ? questionRange.end - questionRange.start + 1 
    : totalQuestions;
  
  // Group answers by chapter
  const chapters: Map<number, Array<[number, string]>> = new Map();
  answersArray.forEach(([id, correction]) => {
    const chapterNum = getChapterForQuestion(id, totalQuestions);
    if (!chapters.has(chapterNum)) {
      chapters.set(chapterNum, []);
    }
    chapters.get(chapterNum)!.push([id, correction]);
  });
  
  // Build pages with chapter awareness
  const pages: Array<{
    items: Array<{ type: 'header' | 'answer'; chapter?: number; id?: number; correction?: string }>
  }> = [];
  
  let currentPage: Array<{ type: 'header' | 'answer'; chapter?: number; id?: number; correction?: string }> = [];
  let itemsOnCurrentPage = 0;
  
  const sortedChapters = Array.from(chapters.entries()).sort((a, b) => a[0] - b[0]);
  
  sortedChapters.forEach(([chapterNum, chapterAnswers]) => {
    // Check if we need a new page for chapter header
    if (itemsOnCurrentPage > 0 && itemsOnCurrentPage + chapterAnswers.length + 4 > ANSWERS_PER_PAGE) {
      // Start new page for this chapter
      pages.push({ items: currentPage });
      currentPage = [];
      itemsOnCurrentPage = 0;
    }
    
    // Add chapter header (takes space of 4 answers for visual spacing)
    currentPage.push({ type: 'header', chapter: chapterNum });
    itemsOnCurrentPage += 4;
    
    // Add answers for this chapter
    chapterAnswers.forEach(([id, correction]) => {
      if (itemsOnCurrentPage >= ANSWERS_PER_PAGE) {
        pages.push({ items: currentPage });
        currentPage = [];
        itemsOnCurrentPage = 0;
      }
      currentPage.push({ type: 'answer', id, correction });
      itemsOnCurrentPage += 1;
    });
  });
  
  // Don't forget the last page
  if (currentPage.length > 0) {
    pages.push({ items: currentPage });
  }
  
  // If no pages, still show one empty page
  if (pages.length === 0) {
    pages.push({ items: [] });
  }
  
  return (
    <>
      {pages.map((page, pageIndex) => (
        <div key={pageIndex} className="answer-key-page a4-page rounded-xl animate-fade-in">
          <div className="page-content">
            {/* Header */}
            <header className="page-header">
              <div className="header-top-bar">
                <div className="header-brand">
                  <div className="header-logo">
                    <div className="header-logo-bg">
                      <BookOpen />
                    </div>
                  </div>
                  <div className="header-title-block">
                    <h1 className="header-main-title">정답지 (Answer Key)</h1>
                    <span className="header-sub-title">Grammar Corrections</span>
                  </div>
                </div>
                <div className="header-meta">
                  <div className="header-page-info">
                    {pages.length > 1 
                      ? `${pageIndex + 1} / ${pages.length} 페이지 · 총 ${displayTotalQuestions}문제`
                      : `총 ${displayTotalQuestions}문제`
                    }
                  </div>
                </div>
              </div>
              <div className="header-bottom-bar">
                <div className="header-line" />
                <span className="header-badge">ANSWER KEY</span>
                <div className="header-line header-line-reverse" />
              </div>
            </header>

            {/* Answer content with chapter dividers */}
            <div className="flex-1 flex flex-col gap-2">
              {page.items.map((item, idx) => {
                if (item.type === 'header') {
                  const range = getChapterRange(item.chapter!, totalQuestions);
                  return (
                    <div key={`header-${item.chapter}`} className="answer-chapter-header">
                      <div className="answer-chapter-line" />
                      <span className="answer-chapter-title">
                        Chapter {item.chapter} ({range.start} - {range.end})
                      </span>
                      <div className="answer-chapter-line" />
                    </div>
                  );
                }
                return null;
              })}
              
              {/* Answer Grid - grouped by chapter headers on this page */}
              <div className="answer-grid">
                {page.items
                  .filter(item => item.type === 'answer')
                  .map((item) => (
                    <div key={item.id} className="answer-item">
                      <span className="answer-number">{item.id}</span>
                      <span className="answer-correction">{item.correction}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Page footer for multi-page answer keys */}
            {pages.length > 1 && (
              <div className="mt-auto pt-4 text-center text-xs text-muted-foreground border-t border-border/50">
                Answer Key - Page {pageIndex + 1} of {pages.length}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
