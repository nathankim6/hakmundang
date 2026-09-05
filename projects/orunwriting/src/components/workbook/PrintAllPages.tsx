import { useMemo } from "react";
import { CoverPage } from "./CoverPage";
import { TableOfContentsPage } from "./TableOfContentsPage";
import { ProblemPage, Problem } from "./ProblemPage";
import { SectionDividerPage } from "./SectionDividerPage";
import { AnswerCoverPage } from "./AnswerCoverPage";
import { AnswerPage } from "./AnswerPage";
import { arrangementUnits } from "@/data/arrangementProblemsNew";
import { conditionalUnits } from "@/data/conditionalProblemsNew";

const PROBLEMS_PER_PAGE = 5;
const UNITS_PER_ANSWER_PAGE = 2; // 한 페이지에 2개 유닛의 정답

interface PrintAllPagesProps {
  onClose: () => void;
}

export function PrintAllPages({ onClose }: PrintAllPagesProps) {
  const allUnits = useMemo(() => {
    const conditionalWithSection = conditionalUnits.map(u => ({ ...u, section: 'conditional' as const }));
    const arrangementWithSection = arrangementUnits.map(u => ({ ...u, section: 'arrangement' as const }));
    return [...conditionalWithSection, ...arrangementWithSection];
  }, []);

  const totalProblems = useMemo(() => {
    return allUnits.reduce((sum, unit) => sum + unit.problems.length, 0);
  }, [allUnits]);

  // Calculate TOC data
  const tocUnits = useMemo(() => {
    let currentPage = 4;
    const result: {
      number: number;
      title: string;
      problemCount: number;
      startPage: number;
      section: 'arrangement' | 'conditional';
    }[] = [];
    
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
    
    currentPage += 1;
    
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
  }, []);

  // Generate all pages data
  const pages = useMemo(() => {
    const allPages: any[] = [];
    let pageNum = 1;
    
    // Cover
    allPages.push({ type: 'cover', pageNum: pageNum++ });
    
    // TOC
    allPages.push({ type: 'toc', pageNum: pageNum++ });
    
    // Conditional section divider
    allPages.push({ type: 'section-divider', section: 'conditional', pageNum: pageNum++ });
    
    // Conditional problems
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
    
    // Arrangement section divider
    allPages.push({ type: 'section-divider', section: 'arrangement', pageNum: pageNum++ });
    
    // Arrangement problems (20 units)
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
    
    // Answer cover
    allPages.push({ type: 'answer-cover', pageNum: pageNum++ });
    
    // Answer pages - 2 units per page
    const totalUnits = allUnits.length;
    for (let i = 0; i < totalUnits; i += UNITS_PER_ANSWER_PAGE) {
      allPages.push({
        type: 'answers',
        answerStartIndex: i, // Now this is unit index, not problem index
        pageNum: pageNum++,
      });
    }
    
    return allPages;
  }, [allUnits]);

  const totalPages = pages.length;

  const allProblemsForAnswers = useMemo(() => {
    return allUnits.map(unit => ({
      unitNumber: unit.number,
      unitTitle: unit.title,
      problems: unit.problems,
      section: unit.section,
    }));
  }, [allUnits]);

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
            {page.type === 'cover' && (
              <CoverPage totalPages={totalPages} />
            )}
            
            {page.type === 'toc' && (
              <TableOfContentsPage
                units={tocUnits}
                pageNumber={2}
                totalPages={totalPages}
                onUnitClick={() => {}}
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
              />
            )}
            
            {page.type === 'answer-cover' && (
              <AnswerCoverPage
                pageNumber={page.pageNum}
                totalPages={totalPages}
                totalProblems={totalProblems}
              />
            )}
            
            {page.type === 'answers' && (
              <AnswerPage
                problems={allProblemsForAnswers}
                pageNumber={page.pageNum}
                totalPages={totalPages}
                startIndex={page.answerStartIndex}
                unitsPerPage={UNITS_PER_ANSWER_PAGE}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
