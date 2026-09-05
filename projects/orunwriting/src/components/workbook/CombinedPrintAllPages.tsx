import { useMemo } from "react";
import { GrammarHardCover } from "./GrammarHardCover";
import { GrammarBackCover } from "./GrammarBackCover";
import { EndpaperPage } from "./EndpaperPage";
import { TitlePage } from "./TitlePage";
import { TableOfContentsPage } from "./TableOfContentsPage";
import { ProblemPage, Problem } from "./ProblemPage";
import { SectionDividerPage } from "./SectionDividerPage";
import { AnswerCoverPage } from "./AnswerCoverPage";
import { AnswerPage } from "./AnswerPage";
import { AppendixPage, AppendixDividerPage, APPENDIX_PAGE_COUNT } from "./AppendixPage";
import { SchoolProblemPage, SchoolAnswerPage } from "./SchoolProblemPage";
import { A4Page } from "./A4Page";
import { arrangementUnits } from "@/data/arrangementProblemsNew";
import { conditionalUnits } from "@/data/conditionalProblemsNew";
import { readingWorkbooks } from "@/data/readingWorkbookData";
import { schoolUnits, SCHOOL_PROBLEMS_PER_PAGE } from "@/data/schoolProblemsData";

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

interface CombinedPrintAllPagesProps {
  onClose: () => void;
}

export function CombinedPrintAllPages({ onClose }: CombinedPrintAllPagesProps) {
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

  // Generate all pages
  const pages = useMemo(() => {
    const allPages: any[] = [];
    let pageNum = 1;
    
    // Hard cover (front)
    allPages.push({ type: 'hardcover', pageNum: pageNum++ });
    
    // Front endpaper (내지)
    allPages.push({ type: 'endpaper', endpaperVariant: 'front', pageNum: pageNum++ });
    
    // Title page (면지)
    allPages.push({ type: 'titlepage', pageNum: pageNum++ });
    
    // Table of contents page
    allPages.push({ type: 'toc', pageNum: pageNum++ });
    
    // ============ PART 1: 서술형 유형연습 (Reading) ============
    allPages.push({ type: 'section-divider', section: 'reading', pageNum: pageNum++ });
    
    // Reading problem pages
    for (let i = 0; i < readingProblems.length; i += READING_PROBLEMS_PER_PAGE) {
      const pageProblems = readingProblems.slice(i, i + READING_PROBLEMS_PER_PAGE);
      allPages.push({
        type: 'reading-problems',
        readingProblems: pageProblems,
        section: 'reading',
        pageNum: pageNum++,
      });
    }
    
    // ============ PART 2: 조건영작 ============
    allPages.push({ type: 'section-divider', section: 'conditional', pageNum: pageNum++ });
    
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
          pageNum: pageNum++,
        });
      }
    });
    
    // ============ PART 3: 배열영작 ============
    allPages.push({ type: 'section-divider', section: 'arrangement', pageNum: pageNum++ });
    
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
          pageNum: pageNum++,
        });
      }
    });
    
    // ============ PART 4: 학교별 기출문제 ============
    allPages.push({ type: 'section-divider', section: 'school', pageNum: pageNum++ });
    
    schoolUnits.forEach((school) => {
      for (let i = 0; i < school.problems.length; i += SCHOOL_PROBLEMS_PER_PAGE) {
        const pageProblems = school.problems.slice(i, i + SCHOOL_PROBLEMS_PER_PAGE);
        allPages.push({
          type: 'school-problems',
          schoolName: school.schoolName,
          grade: school.grade,
          semester: school.semester,
          exam: school.exam,
          problems: pageProblems,
          startNumber: i + 1,
          pageNum: pageNum++,
        });
      }
    });
    
    // Answer cover page
    allPages.push({ type: 'answer-cover', pageNum: pageNum++ });
    
    // Reading answer pages
    for (let i = 0; i < readingProblems.length; i += READING_ANSWERS_PER_PAGE) {
      allPages.push({
        type: 'reading-answers',
        answerStartIndex: i,
        section: 'reading',
        pageNum: pageNum++,
      });
    }
    
    // Grammar answer pages (conditional + arrangement)
    const totalGrammarUnits = allGrammarUnits.length;
    for (let i = 0; i < totalGrammarUnits; i += UNITS_PER_ANSWER_PAGE) {
      allPages.push({
        type: 'answers',
        answerStartIndex: i,
        pageNum: pageNum++,
      });
    }
    
    // School answer pages
    for (let i = 0; i < schoolUnits.length; i += SCHOOL_ANSWERS_PER_PAGE) {
      allPages.push({
        type: 'school-answers',
        answerStartIndex: i,
        pageNum: pageNum++,
      });
    }
    
    // Appendix divider page (부록 간지)
    allPages.push({ type: 'appendix-divider', pageNum: pageNum++ });
    
    // Appendix pages (동사문형정리)
    for (let i = 0; i < APPENDIX_PAGE_COUNT; i++) {
      allPages.push({ type: 'appendix', appendixPageIndex: i, pageNum: pageNum++ });
    }
    
    // Back cover
    allPages.push({ type: 'backcover', pageNum: pageNum++ });
    
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
    startPage: 6,
    problemCount: readingProblems.length,
  }), [readingProblems.length]);

  // School info for TOC
  const schoolInfoForTOC = useMemo(() => {
    // Calculate school section start page
    let currentPage = 6; // After hardcover, endpaper, titlepage, TOC, reading divider
    const readingPageCount = Math.ceil(readingProblems.length / READING_PROBLEMS_PER_PAGE);
    currentPage += readingPageCount + 1; // +1 for conditional divider
    
    // Add conditional pages
    conditionalUnits.forEach((unit) => {
      currentPage += Math.ceil(unit.problems.length / PROBLEMS_PER_PAGE);
    });
    currentPage += 1; // arrangement divider
    
    // Add arrangement pages
    arrangementUnits.forEach((unit) => {
      currentPage += Math.ceil(unit.problems.length / PROBLEMS_PER_PAGE);
    });
    currentPage += 1; // school divider
    
    const schoolStartPage = currentPage;
    const schools = schoolUnits.map((school) => {
      const schoolPage = currentPage;
      const pageCount = Math.ceil(school.problems.length / SCHOOL_PROBLEMS_PER_PAGE);
      currentPage += pageCount;
      return {
        schoolName: school.schoolName,
        startPage: schoolPage,
        problemCount: school.problems.length,
      };
    });
    
    return { startPage: schoolStartPage, schools };
  }, [readingProblems.length]);

  // Appendix info for TOC
  const appendixInfoForTOC = useMemo(() => {
    // Calculate appendix start page (after answer pages)
    const answerCoverPage = pages.findIndex(p => p.type === 'answer-cover');
    const appendixDividerPage = pages.findIndex(p => p.type === 'appendix-divider');
    if (appendixDividerPage === -1) return undefined;
    return { startPage: appendixDividerPage + 1 };
  }, [pages]);

  // Prepare all problems data for answer pages
  const allProblemsForAnswers = useMemo(() => {
    return allGrammarUnits.map(unit => ({
      unitNumber: unit.number,
      unitTitle: unit.title,
      problems: unit.problems,
      section: unit.section,
    }));
  }, [allGrammarUnits]);

  const totalProblems = readingProblems.length + allGrammarUnits.reduce((sum, u) => sum + u.problems.length, 0) + schoolUnits.reduce((sum, s) => sum + s.problems.length, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-auto print:static print:overflow-visible print-container">
      {/* Control bar - hidden when printing */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between no-print">
        <h2 className="text-lg font-bold">전체 페이지 미리보기 ({totalPages}페이지)</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            PDF로 저장
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>

      {/* All pages */}
      <div className="pt-20" style={{ paddingTop: '5rem' }}>
        {pages.map((page, index) => (
          <div key={index} className="print-page-break">
            {page.type === 'hardcover' && (
              <GrammarHardCover totalPages={totalPages} />
            )}
            
            {page.type === 'endpaper' && (
              <EndpaperPage 
                pageNumber={page.pageNum} 
                totalPages={totalPages} 
                variant={page.endpaperVariant || 'front'} 
              />
            )}
            
            {page.type === 'titlepage' && (
              <TitlePage 
                pageNumber={page.pageNum} 
                totalPages={totalPages}
                mainTitle="서술형 마스터 클래스"
                subtitle="서술형 유형연습 + 조건영작 + 배열영작"
              />
            )}
            
            {page.type === 'toc' && (
              <TableOfContentsPage
                units={tocUnits}
                pageNumber={page.pageNum}
                totalPages={totalPages}
                onUnitClick={() => {}}
                readingInfo={readingInfo}
                schoolInfo={schoolInfoForTOC}
                appendixInfo={appendixInfoForTOC}
              />
            )}
            
            {page.type === 'section-divider' && (
              <SectionDividerPage
                section={page.section}
                pageNumber={page.pageNum}
                totalPages={totalPages}
              />
            )}
            
            {page.type === 'problems' && (
              <ProblemPage
                problems={page.problems}
                unitNumber={page.unitNumber}
                unitTitle={page.unitTitle}
                pageNumber={page.pageNum}
                totalPages={totalPages}
                startNumber={page.startNumber}
                section={page.section}
              />
            )}
            
            {page.type === 'reading-problems' && (
              <ReadingProblemPagePrint
                problems={page.readingProblems}
                pageNumber={page.pageNum}
                totalPages={totalPages}
              />
            )}
            
            {page.type === 'answer-cover' && (
              <AnswerCoverPage
                pageNumber={page.pageNum}
                totalPages={totalPages}
                totalProblems={totalProblems}
              />
            )}

            {page.type === 'reading-answers' && (
              <ReadingAnswerPagePrint
                problems={readingProblems}
                startIndex={page.answerStartIndex || 0}
                pageNumber={page.pageNum}
                totalPages={totalPages}
              />
            )}
            
            {page.type === 'answers' && (
              <AnswerPage
                problems={allProblemsForAnswers}
                pageNumber={page.pageNum}
                totalPages={totalPages}
                startIndex={page.answerStartIndex}
              />
            )}
            
            {page.type === 'school-problems' && (
              <SchoolProblemPage
                schoolName={page.schoolName}
                grade={page.grade}
                semester={page.semester}
                exam={page.exam}
                problems={page.problems}
                startNumber={page.startNumber}
                pageNumber={page.pageNum}
                totalPages={totalPages}
              />
            )}
            
            {page.type === 'school-answers' && (
              <SchoolAnswerPage
                schools={schoolUnits}
                startIndex={page.answerStartIndex || 0}
                pageNumber={page.pageNum}
                totalPages={totalPages}
              />
            )}
            
            {page.type === 'appendix-divider' && (
              <AppendixDividerPage
                pageNumber={page.pageNum}
                totalPages={totalPages}
              />
            )}
            
            {page.type === 'appendix' && (
              <AppendixPage
                pageNumber={page.pageNum}
                totalPages={totalPages}
                pageIndex={page.appendixPageIndex || 0}
              />
            )}
            
            {page.type === 'backcover' && (
              <GrammarBackCover totalPages={totalPages} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Reading Problem Page for Print
function ReadingProblemPagePrint({ 
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

        {/* Two-column layout */}
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
              
              {/* Passage */}
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

// Reading Answer Page for Print
function ReadingAnswerPagePrint({ 
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
        
        {/* Answers */}
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
