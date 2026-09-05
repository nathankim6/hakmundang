import logoImage from '@/assets/orun-academy-main-logo.jpg';
import { VolumeInfo } from '@/types/volume';

interface ChapterInfo {
  chapter: number;
  title: string;
  range: string;
  questionCount: number;
  startPage: number;
  endPage: number;
}

interface TableOfContentsProps {
  totalQuestions: number;
  totalPages: number;
  questionsPerPage: number;
  onPageClick?: (page: number) => void;
  volumeInfo?: VolumeInfo;
  customChapters?: ChapterInfo[];
}

// Helper functions for chapter calculation (1000 questions per chapter for 10000 set, 100 for smaller)
function getChapterRange(chapterNum: number, totalQuestions: number, volumeStartQuestion: number = 1): { start: number; end: number } {
  const questionsPerChapter = totalQuestions > 3000 ? 1000 : 100;
  
  if (totalQuestions <= 3000 && totalQuestions === 2320) {
    if (chapterNum <= 22) {
      return {
        start: (chapterNum - 1) * 100 + 1,
        end: chapterNum * 100
      };
    }
    // Chapter 23: questions 2201-2320
    return { start: 2201, end: 2320 };
  }
  
  // For volume-based chapters, calculate relative to volume start
  const relativeStart = (chapterNum - 1) * questionsPerChapter + 1;
  const relativeEnd = Math.min(chapterNum * questionsPerChapter, totalQuestions);
  
  return { 
    start: relativeStart + (volumeStartQuestion - 1), 
    end: relativeEnd + (volumeStartQuestion - 1) 
  };
}

function getTotalChapters(totalQuestions: number): number {
  if (totalQuestions === 2320) return 23;
  const questionsPerChapter = totalQuestions > 3000 ? 1000 : 100;
  return Math.ceil(totalQuestions / questionsPerChapter);
}

const CHAPTERS_PER_PAGE = 25; // All chapters fit on one page

export function TableOfContents({ 
  totalQuestions, 
  totalPages, 
  questionsPerPage,
  onPageClick,
  volumeInfo,
  customChapters
}: TableOfContentsProps) {
  // Use custom chapters if provided, otherwise generate from question structure
  const chapters: ChapterInfo[] = customChapters || (() => {
    const totalChapters = getTotalChapters(totalQuestions);
    const questionsPerChapter = totalQuestions > 3000 ? 1000 : 100;
    const generated: ChapterInfo[] = [];
    
    for (let i = 1; i <= totalChapters; i++) {
      const range = getChapterRange(i, totalQuestions, volumeInfo?.startQuestion);
      const startPage = Math.ceil(((i - 1) * questionsPerChapter + 1) / questionsPerPage);
      const endPage = Math.ceil(Math.min(i * questionsPerChapter, totalQuestions) / questionsPerPage);
      
      generated.push({
        chapter: i,
        title: `Chapter ${String(i).padStart(2, '0')}`,
        range: `No. ${range.start.toLocaleString()} — ${range.end.toLocaleString()}`,
        questionCount: range.end - range.start + 1,
        startPage,
        endPage,
      });
    }
    return generated;
  })();

  const totalChapters = chapters.length;

  // All chapters on one page
  const tocPages = [chapters];

  const handleChapterClick = (startPage: number) => {
    if (onPageClick) {
      onPageClick(startPage);
    }
  };

  return (
    <>
      {tocPages.map((pageChapters, pageIndex) => (
        <div key={pageIndex} className="toc-page a4-page rounded-xl animate-fade-in">
          {/* Background Pattern */}
          <div className="toc-pattern-overlay" />
          
          <div className="toc-content">
            {/* Header - only on first page */}
            {pageIndex === 0 && (
              <header className="toc-header">
                <div className="toc-header-top">
                  <div className="toc-logo">
                    <img src={logoImage} alt="Logo" className="toc-logo-image" />
                  </div>
                  <div className="toc-title-block">
                    <h1 className="toc-main-title">목 차</h1>
                    <span className="toc-sub-title">TABLE OF CONTENTS</span>
                  </div>
                </div>
                <div className="toc-header-line">
                  <div className="toc-line-gold" />
                  <span className="toc-diamond">◆</span>
                  <div className="toc-line-gold" />
                </div>
              </header>
            )}

            {/* Continuation header for subsequent pages */}
            {pageIndex > 0 && (
              <header className="toc-header-continuation">
                <div className="toc-continuation-line" />
                <span className="toc-continuation-text">목차 (계속)</span>
                <div className="toc-continuation-line" />
              </header>
            )}

            {/* Content */}
            <div className="toc-body">
              <div className="toc-chapters">
                {pageChapters.map((chapter) => (
                  <button
                    key={chapter.chapter}
                    className="toc-chapter-item toc-chapter-clickable"
                    onClick={() => handleChapterClick(chapter.startPage)}
                    type="button"
                  >
                    <div className="toc-chapter-left">
                      <span className="toc-chapter-number">{String(chapter.chapter).padStart(2, '0')}</span>
                      <div className="toc-chapter-info">
                        <span className="toc-chapter-title">{chapter.title}</span>
                        <span className="toc-chapter-range">{chapter.range}</span>
                      </div>
                    </div>
                    <div className="toc-chapter-meta">
                      <span className="toc-chapter-count">{chapter.questionCount}문장</span>
                    </div>
                    <div className="toc-chapter-dots" />
                    <div className="toc-chapter-pages">
                      <span className="toc-page-arrow">→</span>
                      <span className="toc-page-start">{chapter.startPage}</span>
                      <span className="toc-page-sep">—</span>
                      <span className="toc-page-end">{chapter.endPage}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Summary Box - only on last page */}
              {pageIndex === tocPages.length - 1 && (
                <div className="toc-summary">
                  <div className="toc-summary-item">
                    <span className="toc-summary-label">총 문장 수</span>
                    <span className="toc-summary-value">{totalQuestions.toLocaleString()}</span>
                  </div>
                  <div className="toc-summary-divider" />
                  <div className="toc-summary-item">
                    <span className="toc-summary-label">총 페이지</span>
                    <span className="toc-summary-value">{totalPages}</span>
                  </div>
                  <div className="toc-summary-divider" />
                  <div className="toc-summary-item">
                    <span className="toc-summary-label">총 챕터</span>
                    <span className="toc-summary-value">{totalChapters}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="toc-footer">
              <div className="toc-footer-line" />
              <span className="toc-footer-text">
                {volumeInfo 
                    ? `ORUN WEEKLY ${volumeInfo.name} | Nathan T`
                    : pageIndex === tocPages.length - 1 
                      ? 'ORUN WEEKLY | Nathan T' 
                      : `Page ${pageIndex + 1} of ${tocPages.length}`}
              </span>
              <div className="toc-footer-line" />
            </footer>
          </div>
        </div>
      ))}
    </>
  );
}