import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { readingWorkbooks } from "@/data/readingWorkbookData";
import { A4Page } from "@/components/workbook/A4Page";
import { EndpaperPage } from "@/components/workbook/EndpaperPage";
import { TitlePage } from "@/components/workbook/TitlePage";
import { cn } from "@/lib/utils";
import { Printer, Navigation, Home, Maximize2 } from "lucide-react";
import orunLogo from "@/assets/orun-academy-logo-new.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProblemFullscreenPopup } from "@/components/workbook/ProblemFullscreenPopup";
const PROBLEMS_PER_PAGE = 2; // 한 페이지에 2문제씩
const ANSWERS_PER_PAGE = 10; // 해설 페이지당 10문제씩

interface ProblemWithUnit {
  unitNumber: number;
  unitTitle: string;
  passage: string;
  problem: typeof readingWorkbooks[0]['units'][0]['problems'][0];
}
interface PageInfo {
  type: 'cover' | 'endpaper' | 'titlepage' | 'problems' | 'answers' | 'backcover';
  problems?: ProblemWithUnit[];
  answerStartIndex?: number;
  endpaperVariant?: 'front' | 'back';
}
export default function ReadingWorkbook() {
  const {
    workbookId
  } = useParams();
  const navigate = useNavigate();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showGoToPageDialog, setShowGoToPageDialog] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [showPrintAll, setShowPrintAll] = useState(false);
  const workbook = readingWorkbooks.find(wb => wb.id === `reading-workbook-${workbookId}`);

  // 모든 문제를 평면화 (각 문제에 개별 지문 포함)
  const allProblems = useMemo(() => {
    if (!workbook) return [];
    const problems: ProblemWithUnit[] = [];
    workbook.units.forEach(unit => {
      unit.problems.forEach(problem => {
        problems.push({
          unitNumber: unit.number,
          unitTitle: unit.title,
          passage: problem.passage,
          // 각 문제별 개별 지문 사용
          problem
        });
      });
    });
    return problems;
  }, [workbook]);
  const pages = useMemo(() => {
    if (!workbook) return [];
    const allPages: PageInfo[] = [];

    // Hard Cover page (front)
    allPages.push({
      type: 'cover'
    });

    // Front endpaper (내지)
    allPages.push({
      type: 'endpaper',
      endpaperVariant: 'front'
    });

    // Title page (면지)
    allPages.push({
      type: 'titlepage'
    });

    // Problem pages (2 problems per page, each with its own passage)
    for (let i = 0; i < allProblems.length; i += PROBLEMS_PER_PAGE) {
      const pageProblems = allProblems.slice(i, i + PROBLEMS_PER_PAGE);
      allPages.push({
        type: 'problems',
        problems: pageProblems
      });
    }

    // Answer pages (분할) - 10문제씩
    const totalAnswers = allProblems.length;
    for (let i = 0; i < totalAnswers; i += ANSWERS_PER_PAGE) {
      allPages.push({
        type: 'answers',
        answerStartIndex: i
      });
    }

    // Back endpaper (내지)
    allPages.push({
      type: 'endpaper',
      endpaperVariant: 'back'
    });

    // Back cover page
    allPages.push({
      type: 'backcover'
    });
    return allPages;
  }, [workbook, allProblems]);
  if (!workbook) {
    return <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">문제집을 찾을 수 없습니다</h1>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            홈으로 돌아가기
          </button>
        </div>
      </div>;
  }
  const totalPages = pages.length;
  const currentPage = pages[currentPageIndex];
  const goToPage = (index: number) => {
    if (index >= 0 && index < totalPages) {
      setCurrentPageIndex(index);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  const handleGoToPageSubmit = () => {
    const pageNum = parseInt(goToPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      goToPage(pageNum - 1);
      setShowGoToPageDialog(false);
      setGoToPageInput("");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (isTyping) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPage(currentPageIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToPage(currentPageIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, totalPages]);

  return <div className="min-h-screen bg-muted py-8 print:py-0 print:bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 no-print">
        <div className="flex items-center gap-2 px-4 py-2 bg-card/95 backdrop-blur-md rounded-full shadow-lg border border-border">
          <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-secondary" title="홈으로">
            <Home className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border" />

          <button onClick={() => goToPage(currentPageIndex - 1)} disabled={currentPageIndex === 0} className={cn("w-8 h-8 flex items-center justify-center rounded-full transition-all", currentPageIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary")}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2 px-3">
            <input type="number" min={1} max={totalPages} value={currentPageIndex + 1} onChange={e => goToPage(Number(e.target.value) - 1)} className="w-12 h-8 text-center text-sm font-bold bg-secondary rounded border-none focus:ring-2 focus:ring-primary" />
            <span className="text-sm text-muted-foreground">/ {totalPages}</span>
          </div>
          
          <button onClick={() => goToPage(currentPageIndex + 1)} disabled={currentPageIndex === totalPages - 1} className={cn("w-8 h-8 flex items-center justify-center rounded-full transition-all", currentPageIndex === totalPages - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary")}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <Dialog open={showGoToPageDialog} onOpenChange={setShowGoToPageDialog}>
            <DialogTrigger asChild>
              <button className="px-3 py-1 text-xs font-medium rounded-full transition-all hover:bg-secondary flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                이동
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px]">
              <DialogHeader>
                <DialogTitle>페이지 이동</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={totalPages} value={goToPageInput} onChange={e => setGoToPageInput(e.target.value)} onKeyDown={e => {
                  if (e.key === 'Enter') handleGoToPageSubmit();
                }} placeholder={`1 - ${totalPages}`} className="flex-1 h-10 px-3 text-center text-sm font-bold bg-secondary rounded border-none focus:ring-2 focus:ring-primary" autoFocus />
                  <span className="text-sm text-muted-foreground">페이지</span>
                </div>
                <button onClick={handleGoToPageSubmit} className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  이동
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <button onClick={() => setShowPrintAll(true)} className="px-3 py-1 text-xs font-medium rounded-full transition-all hover:bg-secondary flex items-center gap-1">
            <Printer className="w-3 h-3" />
            인쇄
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="pt-16 print:pt-0">
        <div className="animate-fade-in">
          {currentPage.type === 'cover' && <ReadingCoverPage workbook={workbook} totalPages={totalPages} allProblems={allProblems} />}
          
          {currentPage.type === 'endpaper' && <EndpaperPage pageNumber={currentPageIndex + 1} totalPages={totalPages} variant={currentPage.endpaperVariant || 'front'} />}
          
          {currentPage.type === 'titlepage' && <TitlePage pageNumber={currentPageIndex + 1} totalPages={totalPages} mainTitle="서술형 유형연습" subtitle="Reading Writing Drill" />}
          
          {currentPage.type === 'problems' && currentPage.problems && <ReadingProblemPage problems={currentPage.problems} pageNumber={currentPageIndex + 1} totalPages={totalPages} workbookTitle={workbook.title} allProblems={allProblems} />}
          
          {currentPage.type === 'answers' && <ReadingAnswerPage allProblems={allProblems} startIndex={currentPage.answerStartIndex || 0} pageNumber={currentPageIndex + 1} totalPages={totalPages} />}
          
          {currentPage.type === 'backcover' && <ReadingBackCoverPage totalPages={totalPages} />}
        </div>
      </main>

      {/* Print All Pages Modal */}
      {showPrintAll && <ReadingPrintAllPages workbook={workbook} pages={pages} allProblems={allProblems} totalPages={totalPages} onClose={() => setShowPrintAll(false)} />}
    </div>;
}

// Print All Pages Component
function ReadingPrintAllPages({
  workbook,
  pages,
  allProblems,
  totalPages,
  onClose
}: {
  workbook: typeof readingWorkbooks[0];
  pages: PageInfo[];
  allProblems: ProblemWithUnit[];
  totalPages: number;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };
  return <div className="fixed inset-0 z-[100] bg-background overflow-auto print:static print:overflow-visible print-container">
      {/* Control bar - hidden when printing */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between no-print">
        <h2 className="text-lg font-bold">전체 페이지 미리보기 ({totalPages}페이지)</h2>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            PDF로 저장
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
            닫기
          </button>
        </div>
      </div>

      {/* All pages */}
      <div className="pt-20" style={{
      paddingTop: '5rem'
    }}>
        {pages.map((page, index) => <div key={index} className="print-page-break">
            {page.type === 'cover' && <ReadingCoverPage workbook={workbook} totalPages={totalPages} allProblems={allProblems} />}
            
            {page.type === 'endpaper' && <EndpaperPage pageNumber={index + 1} totalPages={totalPages} variant={page.endpaperVariant || 'front'} />}
            
            {page.type === 'titlepage' && <TitlePage pageNumber={index + 1} totalPages={totalPages} mainTitle="서술형 유형연습" subtitle="Reading Writing Drill" />}
            
            {page.type === 'problems' && page.problems && <ReadingProblemPage problems={page.problems} pageNumber={index + 1} totalPages={totalPages} workbookTitle={workbook.title} allProblems={allProblems} />}
            
            {page.type === 'answers' && <ReadingAnswerPage allProblems={allProblems} startIndex={page.answerStartIndex || 0} pageNumber={index + 1} totalPages={totalPages} />}
            
            {page.type === 'backcover' && <ReadingBackCoverPage totalPages={totalPages} />}
          </div>)}
      </div>
    </div>;
}

// Cover Page Component (Hard Cover - Front)
function ReadingCoverPage({
  workbook,
  totalPages,
  allProblems
}: {
  workbook: typeof readingWorkbooks[0];
  totalPages: number;
  allProblems: ProblemWithUnit[];
}) {
  return <A4Page pageNumber={1} totalPages={totalPages} noPadding noHeader noFooter>
      {/* Dark navy background */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{
      backgroundColor: '#0f1419'
    }}>
        {/* Book spine effect - left side */}
        <div className="absolute left-0 top-0 bottom-0 w-4" style={{
        background: 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(212,175,55,0.2) 50%, rgba(0,0,0,0.3) 100%)'
      }} />
        
        {/* Outer gold border frame */}
        <div className="absolute" style={{
        inset: '24px',
        border: '2px solid rgba(212,175,55,0.4)',
        pointerEvents: 'none'
      }} />
        
        {/* Inner gold border frame */}
        <div className="absolute" style={{
        inset: '32px',
        border: '1px solid rgba(212,175,55,0.2)',
        pointerEvents: 'none'
      }} />

        {/* Corner ornaments */}
        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />
        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />

        {/* Content container */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-16">
          {/* Top: Logo */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-28 h-28 flex items-center justify-center overflow-hidden" style={{
            backgroundColor: 'transparent'
          }}>
              <img src={orunLogo} alt="ORUN Academy Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Part Number */}
          <p style={{
          fontSize: '11px',
          color: 'rgba(212,175,55,0.6)',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          marginBottom: '4px'
        }}>
            Part.1
          </p>
          
          {/* Part Title */}
          <p style={{
          fontSize: '14px',
          color: '#d4af37',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginBottom: '24px',
          fontWeight: '500'
        }}>
            Pattern Internalization
          </p>

          {/* Decorative line */}
          <div className="mb-8" style={{
          width: '120px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
        }} />

          {/* Main Title: ORUN WRITING - Cinzel Decorative style */}
          <h1 className="font-cinzel" style={{
          fontSize: '48px',
          lineHeight: '1.1',
          fontWeight: '700',
          color: '#c9a227',
          letterSpacing: '0.12em',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
            ​PATTERN 
INTERNALIZATION  
 
 
          </h1>

          {/* Subtitle */}
          <p style={{
          fontSize: '11px',
          color: 'rgba(212,175,55,0.5)',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          marginBottom: '32px'
        }}>
            WRITING COLLECTION
          </p>

          {/* Decorative diamond divider */}
          <div className="flex items-center gap-3 mb-8">
            <div style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4))'
          }} />
            <div style={{
            width: '6px',
            height: '6px',
            background: '#d4af37',
            transform: 'rotate(45deg)'
          }} />
            <div style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)'
          }} />
          </div>

          {/* Korean Title */}
          <h2 style={{
          fontSize: '28px',
          lineHeight: '1.2',
          fontWeight: '600',
          color: '#C0C0C0',
          marginBottom: '8px',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
            서술형 유형연습
          </h2>
          
          {/* English subtitle */}
          <p style={{
          fontSize: '12px',
          color: 'rgba(212,175,55,0.6)',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.3em',
          textTransform: 'uppercase'
        }}>
            Reading Writing Drill
          </p>

          {/* Bottom: Publisher */}
          <div className="absolute bottom-12 flex flex-col items-center">
            <div className="mb-3" style={{
            width: '80px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)'
          }} />
            <p style={{
            fontSize: '10px',
            color: 'rgba(212,175,55,0.5)',
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.6em',
            textTransform: 'uppercase'
          }}>
              ORUN ACADEMY
            </p>
          </div>
        </div>
      </div>
    </A4Page>;
}

// Back Cover Page Component
function ReadingBackCoverPage({
  totalPages
}: {
  totalPages: number;
}) {
  return <A4Page pageNumber={totalPages} totalPages={totalPages} noPadding noHeader noFooter>
      {/* Dark navy background */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{
      backgroundColor: '#0f1419'
    }}>
        {/* Book spine effect - right side (back cover) */}
        <div className="absolute right-0 top-0 bottom-0 w-4" style={{
        background: 'linear-gradient(270deg, rgba(0,0,0,0.5) 0%, rgba(212,175,55,0.2) 50%, rgba(0,0,0,0.3) 100%)'
      }} />
        
        {/* Outer gold border frame */}
        <div className="absolute" style={{
        inset: '24px',
        border: '2px solid rgba(212,175,55,0.4)',
        pointerEvents: 'none'
      }} />
        
        {/* Inner gold border frame */}
        <div className="absolute" style={{
        inset: '32px',
        border: '1px solid rgba(212,175,55,0.2)',
        pointerEvents: 'none'
      }} />

        {/* Corner ornaments */}
        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />
        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2" style={{
        borderColor: 'rgba(212,175,55,0.5)'
      }} />

        {/* Content container */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-16">
          {/* Main Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden" style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '2px solid rgba(212,175,55,0.3)'
          }}>
              <img src={orunLogo} alt="ORUN Academy Logo" className="w-20 h-20 object-contain rounded-full" />
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="font-cinzel" style={{
          fontSize: '32px',
          lineHeight: '1.2',
          fontWeight: '700',
          color: '#c9a227',
          letterSpacing: '0.15em',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
            ORUN ACADEMY
          </h1>

          {/* Decorative line */}
          <div className="mb-8" style={{
          width: '100px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
        }} />

          {/* Tagline */}
          <p style={{
          fontSize: '12px',
          color: 'rgba(212,175,55,0.6)',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
            Premium English Education
          </p>

          {/* Decorative diamond */}
          <div className="flex items-center gap-3 mb-12">
            <div style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))'
          }} />
            <div style={{
            width: '6px',
            height: '6px',
            background: 'rgba(212,175,55,0.5)',
            transform: 'rotate(45deg)'
          }} />
            <div style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)'
          }} />
          </div>

          {/* Series Info */}
          <div className="text-center" style={{
          padding: '20px 40px',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '4px'
        }}>
            <p style={{
            fontSize: '10px',
            color: 'rgba(212,175,55,0.5)',
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
              ORUN WRITING SERIES
            </p>
            <p style={{
            fontSize: '14px',
            color: '#C0C0C0',
            fontWeight: '500',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}>
              서술형 유형연습
            </p>
            <p style={{
            fontSize: '10px',
            color: 'rgba(212,175,55,0.5)',
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.2em',
            marginTop: '4px'
          }}>
              Part.1 Pattern Internalization
            </p>
          </div>

          {/* Bottom: Copyright */}
          <div className="absolute bottom-12 flex flex-col items-center">
            <p style={{
            fontSize: '9px',
            color: 'rgba(212,175,55,0.4)',
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.1em',
            textAlign: 'center'
          }}>
              © 2026 ORUN ACADEMY. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </A4Page>;
}

// Problem Page Component (2-column layout, 2 problems per page) - White theme
function ReadingProblemPage({
  problems,
  pageNumber,
  totalPages,
  workbookTitle,
  allProblems
}: {
  problems: ProblemWithUnit[];
  pageNumber: number;
  totalPages: number;
  workbookTitle: string;
  allProblems: ProblemWithUnit[];
}) {
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number | null>(null);
  const selectedProblem = selectedProblemIndex !== null ? allProblems[selectedProblemIndex] : null;
  const handleOpenProblem = (item: ProblemWithUnit) => {
    const index = allProblems.findIndex(p => p.unitNumber === item.unitNumber && p.problem.number === item.problem.number);
    setSelectedProblemIndex(index);
  };
  const handlePrevious = () => {
    if (selectedProblemIndex !== null && selectedProblemIndex > 0) {
      setSelectedProblemIndex(selectedProblemIndex - 1);
    }
  };
  const handleNext = () => {
    if (selectedProblemIndex !== null && selectedProblemIndex < allProblems.length - 1) {
      setSelectedProblemIndex(selectedProblemIndex + 1);
    }
  };
  return <>
      <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
        <div className="flex-1 flex flex-col h-full p-8 relative" style={{
        backgroundColor: '#ffffff'
      }}>
          {/* Gold border frame */}
          <div className="absolute" style={{
          inset: '8px',
          border: '1px solid #c9a227',
          pointerEvents: 'none'
        }} />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2" style={{
          borderBottom: '1px solid #c9a227'
        }}>
            <span className="font-playfair italic text-sm" style={{
            color: '#0f1419'
          }}>
              ORUN WRITING
            </span>
            <span className="text-xs" style={{
            color: '#8b7355'
          }}>
              {pageNumber} / {totalPages}
            </span>
          </div>

          {/* Two-column layout - each column is one problem with its passage */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {problems.map((item, idx) => <div key={`${item.unitNumber}-${item.problem.number}-${idx}`} className="flex flex-col h-full">
                {/* Unit & Problem Number */}
                <div className="mb-3 pb-2 flex items-center justify-between" style={{
              borderBottom: '2px solid #c9a227'
            }}>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded" style={{
                  backgroundColor: '#0f1419',
                  color: '#c9a227'
                }}>
                      Unit {item.unitNumber}
                    </span>
                    <h3 className="text-xs font-bold" style={{
                  color: '#0f1419'
                }}>{item.unitTitle}</h3>
                  </div>
                  {/* Fullscreen button */}
                  <button onClick={() => handleOpenProblem(item)} className="p-1.5 rounded hover:bg-gray-100 transition-colors no-print" title="전체화면으로 보기">
                    <Maximize2 className="w-4 h-4" style={{
                  color: '#8b6914'
                }} />
                  </button>
                </div>
                
                {/* Passage - 각 문제마다 지문 전문 포함 */}
                <div className="mb-4 p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow" style={{
              backgroundColor: '#f8f6f1',
              border: '1px solid #e5e0d5'
            }} onClick={() => handleOpenProblem(item)}>
                  <p className="text-[12px] leading-[1.9] text-justify whitespace-pre-wrap" style={{
                color: '#1a1a1a'
              }}>
                    {item.passage}
                  </p>
                </div>
                
                {/* Problem */}
                <div className="flex-1 flex flex-col">
                  <p className="whitespace-pre-line text-[12px] leading-[1.8] mb-3 text-justify" style={{
                color: '#1a1a1a'
              }}>
                    {item.problem.question}
                  </p>
                  {item.problem.options && <div className="mb-3 p-3 rounded-lg text-[11px] leading-[1.8]" style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #d0d0d0'
              }}>
                      <span className="font-bold" style={{
                  color: '#0f1419'
                }}>[보기] </span>
                      <span className="whitespace-pre-wrap" style={{
                  color: '#333333'
                }}>{item.problem.options}</span>
                    </div>}
                  {item.problem.conditions && <div className="mb-3 p-3 rounded-lg text-[11px] leading-[1.8]" style={{
                backgroundColor: '#fff8e7',
                border: '1px solid #e5d9c3'
              }}>
                      <span className="font-bold" style={{
                  color: '#8b6914'
                }}>[조건] </span>
                      <span className="whitespace-pre-wrap" style={{
                  color: '#333333'
                }}>{item.problem.conditions}</span>
                    </div>}
                  {/* Answer space */}
                  <div className="mt-auto flex-1 min-h-[50px] rounded-lg" style={{
                border: '2px dashed #c9a227',
                backgroundColor: '#fafafa'
              }} />
                </div>
              </div>)}
          </div>
        </div>
      </A4Page>

      {/* Fullscreen Popup */}
      {selectedProblem && <ProblemFullscreenPopup isOpen={!!selectedProblem} onClose={() => setSelectedProblemIndex(null)} passage={selectedProblem.passage} question={selectedProblem.problem.question} options={selectedProblem.problem.options} conditions={selectedProblem.problem.conditions} answer={selectedProblem.problem.answer} unitNumber={selectedProblem.unitNumber} unitTitle={selectedProblem.unitTitle} problemNumber={selectedProblem.problem.number} onPrevious={handlePrevious} onNext={handleNext} hasPrevious={selectedProblemIndex !== null && selectedProblemIndex > 0} hasNext={selectedProblemIndex !== null && selectedProblemIndex < allProblems.length - 1} />}
    </>;
}

// Answer Page Component - White theme (paginated)
function ReadingAnswerPage({
  allProblems,
  startIndex,
  pageNumber,
  totalPages
}: {
  allProblems: ProblemWithUnit[];
  startIndex: number;
  pageNumber: number;
  totalPages: number;
}) {
  // 현재 페이지에 표시할 문제들 (10개씩)
  const pageProblems = allProblems.slice(startIndex, startIndex + ANSWERS_PER_PAGE);

  // Unit별로 그룹화
  const groupedByUnit = pageProblems.reduce((acc, item) => {
    const key = item.unitNumber;
    if (!acc[key]) {
      acc[key] = {
        unitNumber: item.unitNumber,
        unitTitle: item.unitTitle,
        problems: []
      };
    }
    acc[key].problems.push(item.problem);
    return acc;
  }, {} as Record<number, {
    unitNumber: number;
    unitTitle: string;
    problems: typeof allProblems[0]['problem'][];
  }>);
  const unitGroups = Object.values(groupedByUnit);
  return <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      <div className="flex-1 flex flex-col p-8 relative" style={{
      backgroundColor: '#ffffff'
    }}>
        {/* Gold border frame */}
        <div className="absolute" style={{
        inset: '8px',
        border: '1px solid #c9a227',
        pointerEvents: 'none'
      }} />
        
        {/* Header */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-playfair italic font-bold" style={{
          color: '#0f1419'
        }}>
            정답 및 해설
          </h2>
          <div className="w-20 h-0.5 mx-auto mt-1 rounded-full" style={{
          backgroundColor: '#c9a227'
        }} />
          <p className="text-[10px] mt-1" style={{
          color: '#888888'
        }}>
            {startIndex + 1} ~ {Math.min(startIndex + ANSWERS_PER_PAGE, allProblems.length)}번
          </p>
        </div>
        
        {/* Answers - single column for better readability */}
        <div className="flex-1 space-y-5 text-xs overflow-hidden">
          {unitGroups.map(unit => <div key={unit.unitNumber}>
              <div className="flex items-center gap-2 mb-3 pb-1.5" style={{
            borderBottom: '1px solid #c9a227'
          }}>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded" style={{
              backgroundColor: '#0f1419',
              color: '#c9a227'
            }}>
                  Unit {unit.unitNumber}
                </span>
                <span className="text-sm font-medium" style={{
              color: '#666666'
            }}>{unit.unitTitle}</span>
              </div>
              
              <div className="space-y-4">
                {unit.problems.map(problem => <div key={`${unit.unitNumber}-${problem.number}`} className="pl-1">
                    <div className="flex gap-2">
                      <span className="font-bold min-w-[2.5rem] text-[12px]" style={{
                  color: '#8b6914'
                }}>
                        {unit.unitNumber}-{problem.number}.
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-[12px] mb-1 leading-relaxed" style={{
                    color: '#1a1a1a'
                  }}>
                          [정답] {Array.isArray(problem.answer) ? problem.answer.join(' / ') : problem.answer}
                        </div>
                        {problem.explanation && <div className="text-[10px] leading-[1.7]" style={{
                    color: '#555555'
                  }}>
                            [해설] {problem.explanation}
                          </div>}
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>)}
        </div>
        
        {/* Footer */}
        <div className="mt-2 pt-2 flex justify-center" style={{
        borderTop: '1px solid #c9a227'
      }}>
          <span className="text-[10px]" style={{
          color: '#8b7355'
        }}>
            ORUN ACADEMY
          </span>
        </div>
      </div>
    </A4Page>;
}