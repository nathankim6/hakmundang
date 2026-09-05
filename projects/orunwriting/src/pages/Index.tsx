import { useState, useMemo, useRef, useEffect } from "react";
import { CoverPage } from "@/components/workbook/CoverPage";
import { GrammarHardCover } from "@/components/workbook/GrammarHardCover";
import { GrammarBackCover } from "@/components/workbook/GrammarBackCover";
import { EndpaperPage } from "@/components/workbook/EndpaperPage";
import { TitlePage } from "@/components/workbook/TitlePage";
import { TableOfContentsPage } from "@/components/workbook/TableOfContentsPage";
import { ProblemPage, Problem } from "@/components/workbook/ProblemPage";
import { SectionDividerPage } from "@/components/workbook/SectionDividerPage";
import { AnswerCoverPage } from "@/components/workbook/AnswerCoverPage";
import { AnswerPage } from "@/components/workbook/AnswerPage";
import { PrintAllPages } from "@/components/workbook/PrintAllPages";
import { arrangementUnits } from "@/data/arrangementProblemsNew";
import { conditionalUnits } from "@/data/conditionalProblemsNew";
import { cn } from "@/lib/utils";
import { FileText, Printer, Navigation, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
const PROBLEMS_PER_PAGE = 5;
const UNITS_PER_ANSWER_PAGE = 2; // 한 페이지에 2개 유닛의 정답

interface PageInfo {
  type: 'hardcover' | 'endpaper' | 'titlepage' | 'cover' | 'toc' | 'problems' | 'section-divider' | 'answer-cover' | 'answers' | 'backcover';
  unitNumber?: number;
  unitTitle?: string;
  problems?: Problem[];
  startNumber?: number;
  section?: 'arrangement' | 'conditional';
  answerStartIndex?: number;
  endpaperVariant?: 'front' | 'back';
}
const Index = () => {
  const navigate = useNavigate();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showGoToPageDialog, setShowGoToPageDialog] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [globalProblemIndex, setGlobalProblemIndex] = useState<number | null>(null);
  const pageContentRef = useRef<HTMLDivElement>(null);

  // Combine all units with section info (conditional first, then arrangement)
  // 조건영작: Unit 1~30 (총 30유닛), 배열영작: Unit 1~20 (총 20유닛)
  const allUnits = useMemo(() => {
    const conditionalWithSection = conditionalUnits.map(u => ({
      ...u,
      section: 'conditional' as const
    }));
    const arrangementWithSection = arrangementUnits.map(u => ({
      ...u,
      section: 'arrangement' as const
    }));
    return [...conditionalWithSection, ...arrangementWithSection];
  }, []);

  // Calculate total problems for answer pages
  const totalProblems = useMemo(() => {
    return allUnits.reduce((sum, unit) => sum + unit.problems.length, 0);
  }, [allUnits]);

  // Generate all pages - Hard cover, endpaper, title page, then content
  const pages = useMemo(() => {
    const allPages: PageInfo[] = [];

    // Hard cover (front)
    allPages.push({
      type: 'hardcover'
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

    // Table of contents page
    allPages.push({
      type: 'toc'
    });

    // Section divider for conditional (Part 1)
    allPages.push({
      type: 'section-divider',
      section: 'conditional'
    });

    // Problem pages for conditional units (all 30 units)
    conditionalUnits.forEach(unit => {
      const problems = unit.problems;
      for (let i = 0; i < problems.length; i += PROBLEMS_PER_PAGE) {
        const pageProblems = problems.slice(i, i + PROBLEMS_PER_PAGE);
        allPages.push({
          type: 'problems',
          unitNumber: unit.number,
          unitTitle: unit.title,
          problems: pageProblems,
          startNumber: i + 1,
          section: 'conditional'
        });
      }
    });

    // Section divider for arrangement (Part 2)
    allPages.push({
      type: 'section-divider',
      section: 'arrangement'
    });

    // Problem pages for arrangement units (all 20 units)
    arrangementUnits.forEach(unit => {
      const problems = unit.problems;
      for (let i = 0; i < problems.length; i += PROBLEMS_PER_PAGE) {
        const pageProblems = problems.slice(i, i + PROBLEMS_PER_PAGE);
        allPages.push({
          type: 'problems',
          unitNumber: unit.number,
          unitTitle: unit.title,
          problems: pageProblems,
          startNumber: i + 1,
          section: 'arrangement'
        });
      }
    });

    // Answer cover page
    allPages.push({
      type: 'answer-cover'
    });

    // Answer pages - 2 units per page
    const totalUnitsCount = allUnits.length;
    for (let i = 0; i < totalUnitsCount; i += UNITS_PER_ANSWER_PAGE) {
      allPages.push({
        type: 'answers',
        answerStartIndex: i // Now this is unit index, not problem index
      });
    }

    // Back endpaper (내지)
    allPages.push({
      type: 'endpaper',
      endpaperVariant: 'back'
    });

    // Back cover
    allPages.push({
      type: 'backcover'
    });
    return allPages;
  }, [totalProblems, allUnits.length]);
  const totalPages = pages.length;

  // Calculate TOC data with page numbers - Conditional first, then Arrangement
  const tocUnits = useMemo(() => {
    let currentPage = 6; // After hardcover, endpaper, titlepage, TOC, and conditional divider
    const result: {
      number: number;
      title: string;
      problemCount: number;
      startPage: number;
      section: 'arrangement' | 'conditional';
    }[] = [];

    // Conditional units (Part 1) - all 30 units
    conditionalUnits.forEach(unit => {
      const pageCount = Math.ceil(unit.problems.length / PROBLEMS_PER_PAGE);
      result.push({
        number: unit.number,
        title: unit.title,
        problemCount: unit.problems.length,
        startPage: currentPage,
        section: 'conditional'
      });
      currentPage += pageCount;
    });

    // Add 1 for arrangement divider
    currentPage += 1;

    // Arrangement units (Part 2) - all 20 units
    arrangementUnits.forEach(unit => {
      const pageCount = Math.ceil(unit.problems.length / PROBLEMS_PER_PAGE);
      result.push({
        number: unit.number,
        title: unit.title,
        problemCount: unit.problems.length,
        startPage: currentPage,
        section: 'arrangement'
      });
      currentPage += pageCount;
    });
    return result;
  }, []);
  const handleUnitClick = (unitNumber: number, section: 'arrangement' | 'conditional') => {
    // Find the first page of the unit
    const pageIndex = pages.findIndex(p => p.type === 'problems' && p.unitNumber === unitNumber && p.startNumber === 1 && p.section === section);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
    }
  };
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
  const handleGoToPageSubmit = () => {
    const pageNum = parseInt(goToPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      goToPage(pageNum - 1);
      setShowGoToPageDialog(false);
      setGoToPageInput("");
    }
  };
  const handlePrintCurrentPage = () => {
    window.print();
  };

  // Prepare all problems data for answer pages
  const allProblemsForAnswers = useMemo(() => {
    return allUnits.map(unit => ({
      unitNumber: unit.number,
      unitTitle: unit.title,
      problems: unit.problems,
      section: unit.section
    }));
  }, [allUnits]);

  // Flatten all problems for global navigation in popup
  const allProblemsFlat = useMemo(() => {
    const result: Array<{
      problem: Problem;
      unitNumber: number;
      unitTitle: string;
      section: 'arrangement' | 'conditional';
    }> = [];
    allUnits.forEach(unit => {
      unit.problems.forEach(problem => {
        result.push({
          problem,
          unitNumber: unit.number,
          unitTitle: unit.title,
          section: unit.section
        });
      });
    });
    return result;
  }, [allUnits]);
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

          <button onClick={() => goToPage(0)} className={cn("px-3 py-1 text-xs font-medium rounded-full transition-all", currentPageIndex === 0 ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>
            표지
          </button>
          <button onClick={() => goToPage(4)} className={cn("px-3 py-1 text-xs font-medium rounded-full transition-all", currentPageIndex === 4 ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>
            목차
          </button>
          <button onClick={() => {
          const answerCoverIndex = pages.findIndex(p => p.type === 'answer-cover');
          if (answerCoverIndex !== -1) goToPage(answerCoverIndex);
        }} className={cn("px-3 py-1 text-xs font-medium rounded-full transition-all", currentPage?.type === 'answer-cover' || currentPage?.type === 'answers' ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>
            답지
          </button>
          <Dialog open={showGoToPageDialog} onOpenChange={setShowGoToPageDialog}>
            <DialogTrigger asChild>
              <button className="px-3 py-1 text-xs font-medium rounded-full transition-all hover:bg-secondary flex items-center gap-1" title="특정 페이지로 이동">
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

          <button onClick={handlePrintCurrentPage} className="px-3 py-1 text-xs font-medium rounded-full transition-all hover:bg-secondary flex items-center gap-1" title="현재 페이지 인쇄">
            <Printer className="w-3 h-3" />
            인쇄
          </button>

          <button onClick={() => setShowPrintView(true)} className="px-3 py-1 text-xs font-medium rounded-full transition-all hover:bg-secondary flex items-center gap-1" title="전체 PDF로 저장">
            <FileText className="w-3 h-3" />
            전체 PDF
          </button>
        </div>
      </nav>

      {/* Print View Modal */}
      {showPrintView && <PrintAllPages onClose={() => setShowPrintView(false)} />}

      {/* Quick Unit Navigation - Conditional first, then Arrangement */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 no-print hidden lg:block">
        <div className="flex flex-col gap-1 p-2 bg-card/95 backdrop-blur-md rounded-lg shadow-lg border border-border max-h-[80vh] overflow-y-auto">
          <span className="text-xs text-muted-foreground text-center mb-1 font-medium">배열</span>
          {conditionalUnits.map(unit => {
          const isActive = currentPage.type === 'problems' && currentPage.unitNumber === unit.number && currentPage.section === 'conditional';
          return <button key={`cond-${unit.number}`} onClick={() => handleUnitClick(unit.number, 'conditional')} className={cn("w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition-all", isActive ? "bg-[hsl(175,60%,40%)] text-primary-foreground" : "hover:bg-secondary text-muted-foreground")}>
                {String(unit.number).padStart(2, '0')}
              </button>;
        })}
          <div className="w-full h-px bg-border my-1" />
          <span className="text-xs text-muted-foreground text-center mb-1 font-medium">조건</span>
          {arrangementUnits.map(unit => {
          const isActive = currentPage.type === 'problems' && currentPage.unitNumber === unit.number && currentPage.section === 'arrangement';
          return <button key={`arr-${unit.number}`} onClick={() => handleUnitClick(unit.number, 'arrangement')} className={cn("w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition-all", isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground")}>
                {String(unit.number).padStart(2, '0')}
              </button>;
        })}
        </div>
      </div>

      {/* Page Content */}
      <main className="pt-16 print:pt-0">
        <div className="animate-fade-in">
          {currentPage.type === 'hardcover' && <GrammarHardCover totalPages={totalPages} />}
          
          {currentPage.type === 'endpaper' && <EndpaperPage pageNumber={currentPageIndex + 1} totalPages={totalPages} variant={currentPage.endpaperVariant || 'front'} />}
          
          {currentPage.type === 'titlepage' && <TitlePage pageNumber={currentPageIndex + 1} totalPages={totalPages} mainTitle="서술형 마스터 클래스" subtitle="조건영작 + 배열영작" />}
          
          {currentPage.type === 'cover' && <CoverPage totalPages={totalPages} />}
          
          {currentPage.type === 'toc' && <TableOfContentsPage units={tocUnits} pageNumber={2} totalPages={totalPages} onUnitClick={(unitNumber: number) => {
          const unit = tocUnits.find(u => u.number === unitNumber);
          if (unit) handleUnitClick(unitNumber, unit.section);
        }} />}
          
          {currentPage.type === 'section-divider' && currentPage.section && <SectionDividerPage section={currentPage.section} pageNumber={currentPageIndex + 1} totalPages={totalPages} />}
          
          {currentPage.type === 'problems' && currentPage.problems && <ProblemPage problems={currentPage.problems} unitNumber={currentPage.unitNumber!} unitTitle={currentPage.unitTitle!} pageNumber={currentPageIndex + 1} totalPages={totalPages} startNumber={currentPage.startNumber!} section={currentPage.section} allProblems={allProblemsFlat} globalProblemIndex={globalProblemIndex} onGlobalProblemChange={setGlobalProblemIndex} />}
          
          {currentPage.type === 'answer-cover' && <AnswerCoverPage pageNumber={currentPageIndex + 1} totalPages={totalPages} totalProblems={totalProblems} />}
          
          {currentPage.type === 'answers' && <AnswerPage problems={allProblemsForAnswers} pageNumber={currentPageIndex + 1} totalPages={totalPages} startIndex={currentPage.answerStartIndex || 0} unitsPerPage={UNITS_PER_ANSWER_PAGE} />}
          
          {currentPage.type === 'backcover' && <GrammarBackCover totalPages={totalPages} />}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 no-print lg:hidden">
        <div className="flex items-center gap-1 px-3 py-2 bg-card/95 backdrop-blur-md rounded-full shadow-lg border border-border">
          <button onClick={() => goToPage(currentPageIndex - 1)} disabled={currentPageIndex === 0} className={cn("px-4 py-2 text-sm font-medium rounded-full transition-all", currentPageIndex === 0 ? "opacity-30 cursor-not-allowed" : "bg-secondary hover:bg-secondary/80")}>
            이전
          </button>
          <span className="px-3 text-sm font-bold">
            {currentPageIndex + 1} / {totalPages}
          </span>
          <button onClick={() => goToPage(currentPageIndex + 1)} disabled={currentPageIndex === totalPages - 1} className={cn("px-4 py-2 text-sm font-medium rounded-full transition-all", currentPageIndex === totalPages - 1 ? "opacity-30 cursor-not-allowed" : "bg-primary text-primary-foreground")}>
            다음
          </button>
        </div>
      </div>
    </div>;
};
export default Index;