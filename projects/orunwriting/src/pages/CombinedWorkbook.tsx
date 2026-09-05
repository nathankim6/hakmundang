import { useState, useMemo, useRef, useEffect } from "react";
import { GrammarHardCover } from "@/components/workbook/GrammarHardCover";
import { GrammarBackCover } from "@/components/workbook/GrammarBackCover";
import { EndpaperPage } from "@/components/workbook/EndpaperPage";
import { TitlePage } from "@/components/workbook/TitlePage";
import { TableOfContentsPage } from "@/components/workbook/TableOfContentsPage";
import { ProblemPage, Problem } from "@/components/workbook/ProblemPage";
import { SectionDividerPage } from "@/components/workbook/SectionDividerPage";
import { AnswerCoverPage } from "@/components/workbook/AnswerCoverPage";
import { AnswerPage } from "@/components/workbook/AnswerPage";
import { AppendixPage, AppendixDividerPage, APPENDIX_PAGE_COUNT } from "@/components/workbook/AppendixPage";
import { CombinedPrintAllPages } from "@/components/workbook/CombinedPrintAllPages";
import { SchoolProblemPage, SchoolAnswerPage } from "@/components/workbook/SchoolProblemPage";
import { arrangementUnits } from "@/data/arrangementProblemsNew";
import { conditionalUnits } from "@/data/conditionalProblemsNew";
import { readingWorkbooks } from "@/data/readingWorkbookData";
import { schoolUnits, SCHOOL_PROBLEMS_PER_PAGE, SchoolProblem } from "@/data/schoolProblemsData";
import { A4Page } from "@/components/workbook/A4Page";
import { cn } from "@/lib/utils";
import { FileText, Printer, Navigation, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import orunLogo from "@/assets/orun-academy-logo-new.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PROBLEMS_PER_PAGE = 5;
const READING_PROBLEMS_PER_PAGE = 2;
const UNITS_PER_ANSWER_PAGE = 2;
const READING_ANSWERS_PER_PAGE = 10;
const SCHOOL_ANSWERS_PER_PAGE = 2;

interface ReadingProblemWithUnit {
  unitNumber: number;
  unitTitle: string;
  passage: string;
  problem: typeof readingWorkbooks[0]['units'][0]['problems'][0];
}

interface SchoolPageData {
  schoolName: string;
  grade: number;
  semester: string;
  exam: string;
  problems: SchoolProblem[];
  startNumber: number;
}

interface PageInfo {
  type: 'hardcover' | 'endpaper' | 'titlepage' | 'toc' | 'problems' | 'section-divider' | 'answer-cover' | 'answers' | 'backcover' | 'reading-problems' | 'reading-answers' | 'appendix-divider' | 'appendix' | 'school-problems' | 'school-answers';
  unitNumber?: number;
  unitTitle?: string;
  problems?: Problem[];
  readingProblems?: ReadingProblemWithUnit[];
  schoolPageData?: SchoolPageData;
  startNumber?: number;
  section?: 'arrangement' | 'conditional' | 'reading' | 'school';
  answerStartIndex?: number;
  endpaperVariant?: 'front' | 'back';
  appendixPageIndex?: number;
}

export default function CombinedWorkbook() {
  const navigate = useNavigate();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showGoToPageDialog, setShowGoToPageDialog] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [showPrintAll, setShowPrintAll] = useState(false);
  const pageContentRef = useRef<HTMLDivElement>(null);

  const workbook = readingWorkbooks[0];

  // Reading workbook problems
  const readingProblems = useMemo(() => {
    if (!workbook) return [];
    const problems: ReadingProblemWithUnit[] = [];
    workbook.units.forEach(unit => {
      unit.problems.forEach(problem => {
        problems.push({
          unitNumber: unit.number,
          unitTitle: unit.title,
          passage: problem.passage,
          problem,
        });
      });
    });
    return problems;
  }, [workbook]);

  // Grammar workbook units
  const allGrammarUnits = useMemo(() => {
    const conditionalWithSection = conditionalUnits.map(u => ({ ...u, section: 'conditional' as const }));
    const arrangementWithSection = arrangementUnits.map(u => ({ ...u, section: 'arrangement' as const }));
    return [...conditionalWithSection, ...arrangementWithSection];
  }, []);

  // Generate all pages for combined workbook
  const pages = useMemo(() => {
    const allPages: PageInfo[] = [];
    
    // Hard cover (front)
    allPages.push({ type: 'hardcover' });
    
    // Front endpaper (내지)
    allPages.push({ type: 'endpaper', endpaperVariant: 'front' });
    
    // Title page (면지)
    allPages.push({ type: 'titlepage' });
    
    // Table of contents page
    allPages.push({ type: 'toc' });
    
    // ============ PART 1: 서술형 유형연습 (Reading) ============
    allPages.push({ type: 'section-divider', section: 'reading' });
    
    // Reading problem pages
    for (let i = 0; i < readingProblems.length; i += READING_PROBLEMS_PER_PAGE) {
      const pageProblems = readingProblems.slice(i, i + READING_PROBLEMS_PER_PAGE);
      allPages.push({
        type: 'reading-problems',
        readingProblems: pageProblems,
        section: 'reading',
      });
    }
    
    // ============ PART 2: 배열영작 ============
    allPages.push({ type: 'section-divider', section: 'conditional' });
    
    conditionalUnits.forEach((unit) => {
      const problems = unit.problems;
      for (let i = 0; i < problems.length; i += PROBLEMS_PER_PAGE) {
        const pageProblems = problems.slice(i, i + PROBLEMS_PER_PAGE);
        allPages.push({
          type: 'problems',
          unitNumber: unit.number,
          unitTitle: unit.title,
          problems: pageProblems,
          startNumber: i + 1,
          section: 'conditional',
        });
      }
    });
    
    // ============ PART 3: 조건영작 ============
    allPages.push({ type: 'section-divider', section: 'arrangement' });
    
    arrangementUnits.forEach((unit) => {
      const problems = unit.problems;
      for (let i = 0; i < problems.length; i += PROBLEMS_PER_PAGE) {
        const pageProblems = problems.slice(i, i + PROBLEMS_PER_PAGE);
        allPages.push({
          type: 'problems',
          unitNumber: unit.number,
          unitTitle: unit.title,
          problems: pageProblems,
          startNumber: i + 1,
          section: 'arrangement',
        });
      }
    });
    
    // ============ PART 4: 학교별 기출문제 ============
    allPages.push({ type: 'section-divider', section: 'school' });
    
    // School problem pages
    schoolUnits.forEach((school) => {
      for (let i = 0; i < school.problems.length; i += SCHOOL_PROBLEMS_PER_PAGE) {
        const pageProblems = school.problems.slice(i, i + SCHOOL_PROBLEMS_PER_PAGE);
        allPages.push({
          type: 'school-problems',
          schoolPageData: {
            schoolName: school.schoolName,
            grade: school.grade,
            semester: school.semester,
            exam: school.exam,
            problems: pageProblems,
            startNumber: i + 1,
          },
          section: 'school',
        });
      }
    });
    
    // Answer cover page
    allPages.push({ type: 'answer-cover' });
    
    // Reading answer pages
    for (let i = 0; i < readingProblems.length; i += READING_ANSWERS_PER_PAGE) {
      allPages.push({
        type: 'reading-answers',
        answerStartIndex: i,
        section: 'reading',
      });
    }
    
    // Grammar answer pages (conditional + arrangement)
    const totalGrammarUnits = allGrammarUnits.length;
    for (let i = 0; i < totalGrammarUnits; i += UNITS_PER_ANSWER_PAGE) {
      allPages.push({
        type: 'answers',
        answerStartIndex: i,
      });
    }
    
    // School answer pages
    for (let i = 0; i < schoolUnits.length; i += SCHOOL_ANSWERS_PER_PAGE) {
      allPages.push({
        type: 'school-answers',
        answerStartIndex: i,
        section: 'school',
      });
    }
    
    // Appendix divider page (부록 간지)
    allPages.push({ type: 'appendix-divider' });
    
    // Appendix pages (동사문형정리)
    for (let i = 0; i < APPENDIX_PAGE_COUNT; i++) {
      allPages.push({ type: 'appendix', appendixPageIndex: i });
    }
    
    // Back cover (no back endpaper)
    allPages.push({ type: 'backcover' });
    
    return allPages;
  }, [readingProblems, allGrammarUnits]);

  const totalPages = pages.length;

  // Calculate TOC data
  const tocUnits = useMemo(() => {
    let currentPage = 6; // After hardcover, endpaper, titlepage, TOC, reading divider
    const result: {
      number: number;
      title: string;
      problemCount: number;
      startPage: number;
      section: 'arrangement' | 'conditional' | 'reading';
    }[] = [];
    
    // Skip reading section pages for TOC (only show grammar)
    const readingPageCount = Math.ceil(readingProblems.length / READING_PROBLEMS_PER_PAGE);
    currentPage += readingPageCount + 1; // +1 for conditional divider
    
    // Conditional units
    conditionalUnits.forEach((unit) => {
      const pageCount = Math.ceil(unit.problems.length / PROBLEMS_PER_PAGE);
      result.push({
        number: unit.number,
        title: unit.title,
        problemCount: unit.problems.length,
        startPage: currentPage,
        section: 'conditional',
      });
      currentPage += pageCount;
    });
    
    currentPage += 1; // arrangement divider
    
    // Arrangement units
    arrangementUnits.forEach((unit) => {
      const pageCount = Math.ceil(unit.problems.length / PROBLEMS_PER_PAGE);
      result.push({
        number: unit.number,
        title: unit.title,
        problemCount: unit.problems.length,
        startPage: currentPage,
        section: 'arrangement',
      });
      currentPage += pageCount;
    });
    
    return result;
  }, [readingProblems.length]);

  // Reading info for TOC
  const readingInfo = useMemo(() => ({
    startPage: 6, // After hardcover, endpaper, titlepage, TOC, reading divider
    problemCount: readingProblems.length,
  }), [readingProblems.length]);

  const handleUnitClick = (unitNumber: number, section: 'arrangement' | 'conditional') => {
    const pageIndex = pages.findIndex(
      (p) => p.type === 'problems' && p.unitNumber === unitNumber && p.startNumber === 1 && p.section === section
    );
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
    }
  };

  const currentPage = pages[currentPageIndex];

  const goToPage = (index: number) => {
    if (index >= 0 && index < totalPages) {
      setCurrentPageIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handlePrintAllPages = () => {
    setShowPrintAll(true);
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

  // Prepare all problems data for answer pages
  const allProblemsForAnswers = useMemo(() => {
    return allGrammarUnits.map(unit => ({
      unitNumber: unit.number,
      unitTitle: unit.title,
      problems: unit.problems,
      section: unit.section,
    }));
  }, [allGrammarUnits]);

  // Show print all pages view
  if (showPrintAll) {
    return <CombinedPrintAllPages onClose={() => setShowPrintAll(false)} />;
  }

  return (
    <div className="min-h-screen bg-muted py-8 print:py-0 print:bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 no-print">
        <div className="flex items-center gap-2 px-4 py-2 bg-card/95 backdrop-blur-md rounded-full shadow-lg border border-border">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-secondary"
            title="홈으로"
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border" />

          <button
            onClick={() => goToPage(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full transition-all",
              currentPageIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-secondary"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2 px-3">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPageIndex + 1}
              onChange={(e) => goToPage(Number(e.target.value) - 1)}
              className="w-12 h-8 text-center text-sm font-bold bg-secondary rounded border-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">/ {totalPages}</span>
          </div>
          
          <button
            onClick={() => goToPage(currentPageIndex + 1)}
            disabled={currentPageIndex === totalPages - 1}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full transition-all",
              currentPageIndex === totalPages - 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-secondary"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onClick={() => goToPage(0)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full transition-all",
              currentPageIndex === 0
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            )}
          >
            표지
          </button>
          <button
            onClick={() => goToPage(3)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full transition-all",
              currentPageIndex === 3
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            )}
          >
            목차
          </button>
          <button
            onClick={() => {
              const answerCoverIndex = pages.findIndex(p => p.type === 'answer-cover');
              if (answerCoverIndex !== -1) goToPage(answerCoverIndex);
            }}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full transition-all",
              currentPage?.type === 'answer-cover' || currentPage?.type === 'answers' || currentPage?.type === 'reading-answers'
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            )}
          >
            답지
          </button>
          
          <Dialog open={showGoToPageDialog} onOpenChange={setShowGoToPageDialog}>
            <DialogTrigger asChild>
              <button
                className="px-3 py-1 text-xs font-medium rounded-full transition-all hover:bg-secondary flex items-center gap-1"
                title="특정 페이지로 이동"
              >
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
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={goToPageInput}
                    onChange={(e) => setGoToPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGoToPageSubmit();
                    }}
                    placeholder={`1 - ${totalPages}`}
                    className="flex-1 h-10 px-3 text-center text-sm font-bold bg-secondary rounded border-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <span className="text-sm text-muted-foreground">페이지</span>
                </div>
                <button
                  onClick={handleGoToPageSubmit}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  이동
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={handlePrintAllPages}
            className="px-3 py-1 text-xs font-medium rounded-full transition-all hover:bg-secondary flex items-center gap-1"
            title="전체 페이지 인쇄"
          >
            <Printer className="w-3 h-3" />
            인쇄
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="pt-16 print:pt-0">
        <div className="animate-fade-in">
          {currentPage.type === 'hardcover' && (
            <GrammarHardCover totalPages={totalPages} />
          )}
          
          {currentPage.type === 'endpaper' && (
            <EndpaperPage 
              pageNumber={currentPageIndex + 1} 
              totalPages={totalPages} 
              variant={currentPage.endpaperVariant || 'front'} 
            />
          )}
          
          {currentPage.type === 'titlepage' && (
            <TitlePage 
              pageNumber={currentPageIndex + 1} 
              totalPages={totalPages}
              mainTitle="서술형 마스터 클래스"
              subtitle="서술형 유형연습 + 조건영작 + 배열영작"
            />
          )}
          
          {currentPage.type === 'toc' && (
            <TableOfContentsPage
              units={tocUnits}
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
              onUnitClick={(unitNumber: number) => {
                const unit = tocUnits.find(u => u.number === unitNumber);
                if (unit && unit.section !== 'reading') handleUnitClick(unitNumber, unit.section);
              }}
              readingInfo={readingInfo}
            />
          )}
          
          {currentPage.type === 'section-divider' && currentPage.section && (
            <SectionDividerPage
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
              section={currentPage.section}
            />
          )}
          
          {currentPage.type === 'problems' && currentPage.problems && currentPage.section && (
            <ProblemPage
              unitNumber={currentPage.unitNumber!}
              unitTitle={currentPage.unitTitle!}
              problems={currentPage.problems}
              startNumber={currentPage.startNumber!}
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
              section={currentPage.section as 'arrangement' | 'conditional'}
            />
          )}

          {currentPage.type === 'reading-problems' && currentPage.readingProblems && (
            <ReadingProblemPageComponent
              problems={currentPage.readingProblems}
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
            />
          )}
          
          {currentPage.type === 'school-problems' && currentPage.schoolPageData && (
            <SchoolProblemPage
              schoolName={currentPage.schoolPageData.schoolName}
              grade={currentPage.schoolPageData.grade}
              semester={currentPage.schoolPageData.semester}
              exam={currentPage.schoolPageData.exam}
              problems={currentPage.schoolPageData.problems}
              startNumber={currentPage.schoolPageData.startNumber}
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
            />
          )}
          
          {currentPage.type === 'answer-cover' && (
            <AnswerCoverPage
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
              totalProblems={readingProblems.length + allGrammarUnits.reduce((sum, u) => sum + u.problems.length, 0) + schoolUnits.reduce((sum, s) => sum + s.problems.length, 0)}
            />
          )}

          {currentPage.type === 'reading-answers' && (
            <ReadingAnswerPageComponent
              problems={readingProblems}
              startIndex={currentPage.answerStartIndex || 0}
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
            />
          )}
          
          {currentPage.type === 'answers' && (
            <AnswerPage
              problems={allProblemsForAnswers}
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
              startIndex={currentPage.answerStartIndex || 0}
            />
          )}
          
          {currentPage.type === 'school-answers' && (
            <SchoolAnswerPage
              schools={schoolUnits}
              startIndex={currentPage.answerStartIndex || 0}
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
            />
          )}
          
          {currentPage.type === 'appendix-divider' && (
            <AppendixDividerPage
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
            />
          )}
          
          {currentPage.type === 'appendix' && (
            <AppendixPage
              pageNumber={currentPageIndex + 1}
              totalPages={totalPages}
              pageIndex={currentPage.appendixPageIndex || 0}
            />
          )}
          
          {currentPage.type === 'backcover' && (
            <GrammarBackCover totalPages={totalPages} />
          )}
        </div>
      </main>

      {/* Bottom Navigation for mobile */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden no-print">
        <div className="flex items-center gap-4 px-6 py-3 bg-card/95 backdrop-blur-md rounded-full shadow-lg border border-border">
          <button
            onClick={() => goToPage(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full transition-all",
              currentPageIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-secondary"
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span className="text-sm font-medium">
            {currentPageIndex + 1} / {totalPages}
          </span>
          
          <button
            onClick={() => goToPage(currentPageIndex + 1)}
            disabled={currentPageIndex === totalPages - 1}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full transition-all",
              currentPageIndex === totalPages - 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-secondary"
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Reading Problem Page Component - 원본 ReadingWorkbook과 동일한 디자인
function ReadingProblemPageComponent({ 
  problems, 
  pageNumber, 
  totalPages 
}: { 
  problems: ReadingProblemWithUnit[]; 
  pageNumber: number; 
  totalPages: number;
}) {
  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      <div 
        className="flex-1 flex flex-col h-full p-8 relative"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Gold border frame */}
        <div 
          className="absolute"
          style={{
            inset: '8px',
            border: '1px solid #c9a227',
            pointerEvents: 'none',
          }}
        />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid #c9a227' }}>
          <span className="font-playfair italic text-sm" style={{ color: '#0f1419' }}>
            ORUN WRITING
          </span>
          <span className="text-xs" style={{ color: '#8b7355' }}>
            {pageNumber} / {totalPages}
          </span>
        </div>

        {/* Two-column layout - each column is one problem with its passage */}
        <div className="flex-1 grid grid-cols-2 gap-6">
          {problems.map((item, idx) => (
            <div key={`${item.unitNumber}-${item.problem.number}-${idx}`} className="flex flex-col h-full">
              {/* Unit & Problem Number */}
              <div className="mb-3 pb-2" style={{ borderBottom: '2px solid #c9a227' }}>
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2.5 py-1 text-xs font-bold rounded"
                    style={{ backgroundColor: '#0f1419', color: '#c9a227' }}
                  >
                    Unit {item.unitNumber}
                  </span>
                  <h3 className="text-xs font-bold" style={{ color: '#0f1419' }}>{item.unitTitle}</h3>
                </div>
              </div>
              
              {/* Passage - 각 문제마다 지문 전문 포함 */}
              <div 
                className="mb-4 p-4 rounded-lg"
                style={{ 
                  backgroundColor: '#f8f6f1',
                  border: '1px solid #e5e0d5',
                }}
              >
                <p 
                  className="text-[12px] leading-[1.9] text-justify whitespace-pre-wrap"
                  style={{ color: '#1a1a1a' }}
                >
                  {item.passage}
                </p>
              </div>
              
              {/* Problem */}
              <div className="flex-1 flex flex-col">
                <p 
                  className="whitespace-pre-line text-[12px] leading-[1.8] mb-3 text-justify"
                  style={{ color: '#1a1a1a' }}
                >
                  {item.problem.question}
                </p>
                {item.problem.options && (
                  <div 
                    className="mb-3 p-3 rounded-lg text-[11px] leading-[1.8]"
                    style={{ 
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #d0d0d0',
                    }}
                  >
                    <span className="font-bold" style={{ color: '#0f1419' }}>[보기] </span>
                    <span className="whitespace-pre-wrap" style={{ color: '#333333' }}>{item.problem.options}</span>
                  </div>
                )}
                {item.problem.conditions && (
                  <div 
                    className="mb-3 p-3 rounded-lg text-[11px] leading-[1.8]"
                    style={{ 
                      backgroundColor: '#fff8e7',
                      border: '1px solid #e5d9c3',
                    }}
                  >
                    <span className="font-bold" style={{ color: '#8b6914' }}>[조건] </span>
                    <span className="whitespace-pre-wrap" style={{ color: '#333333' }}>{item.problem.conditions}</span>
                  </div>
                )}
                {/* Answer space */}
                <div 
                  className="mt-auto flex-1 min-h-[50px] rounded-lg"
                  style={{ 
                    border: '2px dashed #c9a227',
                    backgroundColor: '#fafafa',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </A4Page>
  );
}

// Reading Answer Page Component - 원본 ReadingWorkbook과 동일한 디자인
function ReadingAnswerPageComponent({ 
  problems, 
  startIndex,
  pageNumber, 
  totalPages 
}: { 
  problems: ReadingProblemWithUnit[]; 
  startIndex: number;
  pageNumber: number; 
  totalPages: number;
}) {
  const pageProblems = problems.slice(startIndex, startIndex + 10);
  
  // Unit별로 그룹화
  const groupedByUnit = pageProblems.reduce((acc, item) => {
    const key = item.unitNumber;
    if (!acc[key]) {
      acc[key] = {
        unitNumber: item.unitNumber,
        unitTitle: item.unitTitle,
        problems: [],
      };
    }
    acc[key].problems.push(item.problem);
    return acc;
  }, {} as Record<number, { unitNumber: number; unitTitle: string; problems: typeof problems[0]['problem'][] }>);

  const unitGroups = Object.values(groupedByUnit);
  
  return (
    <A4Page pageNumber={pageNumber} totalPages={totalPages} noPadding noHeader noFooter>
      <div 
        className="flex-1 flex flex-col p-8 relative"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Gold border frame */}
        <div 
          className="absolute"
          style={{
            inset: '8px',
            border: '1px solid #c9a227',
            pointerEvents: 'none',
          }}
        />
        
        {/* Header */}
        <div className="mb-4 text-center">
          <h2 
            className="text-xl font-playfair italic font-bold"
            style={{ color: '#0f1419' }}
          >
            정답 및 해설
          </h2>
          <div 
            className="w-20 h-0.5 mx-auto mt-1 rounded-full"
            style={{ backgroundColor: '#c9a227' }}
          />
          <p className="text-[10px] mt-1" style={{ color: '#888888' }}>
            서술형 유형연습 {startIndex + 1} ~ {Math.min(startIndex + 10, problems.length)}번
          </p>
        </div>
        
        {/* Answers - single column for better readability */}
        <div className="flex-1 space-y-5 text-xs overflow-hidden">
          {unitGroups.map((unit) => (
            <div key={unit.unitNumber}>
              <div 
                className="flex items-center gap-2 mb-3 pb-1.5"
                style={{ borderBottom: '1px solid #c9a227' }}
              >
                <span 
                  className="px-2 py-0.5 text-[11px] font-bold rounded"
                  style={{ backgroundColor: '#0f1419', color: '#c9a227' }}
                >
                  Unit {unit.unitNumber}
                </span>
                <span className="text-sm font-medium" style={{ color: '#666666' }}>{unit.unitTitle}</span>
              </div>
              
              <div className="space-y-4">
                {unit.problems.map((problem) => (
                  <div key={`${unit.unitNumber}-${problem.number}`} className="pl-1">
                    <div className="flex gap-2">
                      <span className="font-bold min-w-[2.5rem] text-[12px]" style={{ color: '#8b6914' }}>
                        {unit.unitNumber}-{problem.number}.
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-[12px] mb-1 leading-relaxed" style={{ color: '#1a1a1a' }}>
                          [정답] {Array.isArray(problem.answer) ? problem.answer.join(' / ') : problem.answer}
                        </div>
                        {problem.explanation && (
                          <div className="text-[10px] leading-[1.7]" style={{ color: '#555555' }}>
                            [해설] {problem.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-2 pt-2 flex justify-center" style={{ borderTop: '1px solid #c9a227' }}>
          <span className="text-[10px]" style={{ color: '#8b7355' }}>
            ORUN ACADEMY
          </span>
        </div>
      </div>
    </A4Page>
  );
}
