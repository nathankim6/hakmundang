import { useState } from "react";
import { A4Page } from "./A4Page";
import { ProblemRow, ProblemType } from "./ProblemRow";
import { GrammarProblemPopup } from "./GrammarProblemPopup";

export interface Problem {
  number: number;
  korean: string;
  hints?: string[];
  wordCount?: number;
  instructions?: string;
  type: ProblemType;
  answer?: string;
}

interface ProblemPageProps {
  problems: Problem[];
  unitNumber: number;
  unitTitle: string;
  pageNumber: number;
  totalPages: number;
  startNumber: number;
  section?: 'arrangement' | 'conditional';
  // Global navigation props for cross-page problem navigation
  allProblems?: Array<{ problem: Problem; unitNumber: number; unitTitle: string; section?: 'arrangement' | 'conditional' }>;
  globalProblemIndex?: number | null;
  onGlobalProblemChange?: (index: number | null) => void;
}

export function ProblemPage({ 
  problems, 
  unitNumber, 
  unitTitle, 
  pageNumber, 
  totalPages,
  startNumber,
  section = 'conditional',
  allProblems,
  globalProblemIndex,
  onGlobalProblemChange
}: ProblemPageProps) {
  const [activeProblemNumber, setActiveProblemNumber] = useState<number | null>(null);
  const [localPopupIndex, setLocalPopupIndex] = useState<number | null>(null);
  const isArrangement = section === 'arrangement';

  // Use global navigation if available, otherwise fall back to local
  const useGlobalNav = allProblems && onGlobalProblemChange;

  const handleActivate = (problemNumber: number) => {
    setActiveProblemNumber(prev => prev === problemNumber ? null : problemNumber);
  };

  const handleProblemClick = (problem: Problem, localIndex: number) => {
    if (useGlobalNav) {
      // Find this problem in global list - must match both unit number and problem number
      const globalIndex = allProblems.findIndex(
        p => p.problem.number === problem.number && 
             p.unitNumber === unitNumber &&
             p.section === section
      );
      console.log('handleProblemClick:', {
        problemNumber: problem.number,
        unitNumber,
        section,
        foundIndex: globalIndex,
        totalProblems: allProblems.length
      });
      if (globalIndex !== -1) {
        onGlobalProblemChange(globalIndex);
      }
    } else {
      setLocalPopupIndex(localIndex);
    }
  };

  // Local navigation handlers (fallback)
  const handleLocalPrevious = () => {
    if (localPopupIndex !== null && localPopupIndex > 0) {
      setLocalPopupIndex(localPopupIndex - 1);
    }
  };

  const handleLocalNext = () => {
    if (localPopupIndex !== null && localPopupIndex < problems.length - 1) {
      setLocalPopupIndex(localPopupIndex + 1);
    }
  };

  // Global navigation handlers
  const handleGlobalPrevious = () => {
    if (useGlobalNav && globalProblemIndex !== null && globalProblemIndex > 0) {
      const prevProblem = allProblems[globalProblemIndex - 1];
      console.log('Going to previous:', { 
        from: globalProblemIndex, 
        to: globalProblemIndex - 1,
        prevUnit: prevProblem?.unitNumber,
        prevProblemNum: prevProblem?.problem.number,
        prevSection: prevProblem?.section
      });
      onGlobalProblemChange(globalProblemIndex - 1);
    }
  };

  const handleGlobalNext = () => {
    if (useGlobalNav && globalProblemIndex !== null && globalProblemIndex < allProblems.length - 1) {
      const nextProblem = allProblems[globalProblemIndex + 1];
      console.log('Going to next:', { 
        from: globalProblemIndex, 
        to: globalProblemIndex + 1,
        nextUnit: nextProblem?.unitNumber,
        nextProblemNum: nextProblem?.problem.number,
        nextSection: nextProblem?.section
      });
      onGlobalProblemChange(globalProblemIndex + 1);
    }
  };

  const handleClose = () => {
    if (useGlobalNav) {
      onGlobalProblemChange(null);
    } else {
      setLocalPopupIndex(null);
    }
  };

  // Determine popup state based on navigation mode
  const isPopupOpen = useGlobalNav 
    ? globalProblemIndex !== null 
    : localPopupIndex !== null;

  const currentGlobalProblem = useGlobalNav && globalProblemIndex !== null 
    ? allProblems[globalProblemIndex] 
    : null;

  const popupProblem = useGlobalNav 
    ? currentGlobalProblem?.problem ?? null
    : (localPopupIndex !== null ? problems[localPopupIndex] : null);

  const popupUnitNumber = useGlobalNav 
    ? currentGlobalProblem?.unitNumber ?? unitNumber
    : unitNumber;

  const popupUnitTitle = useGlobalNav 
    ? currentGlobalProblem?.unitTitle ?? unitTitle
    : unitTitle;

  const hasPrev = useGlobalNav 
    ? globalProblemIndex !== null && globalProblemIndex > 0
    : localPopupIndex !== null && localPopupIndex > 0;

  const hasNextProblem = useGlobalNav 
    ? globalProblemIndex !== null && globalProblemIndex < allProblems.length - 1
    : localPopupIndex !== null && localPopupIndex < problems.length - 1;

  const handlePrev = useGlobalNav ? handleGlobalPrevious : handleLocalPrevious;
  const handleNext = useGlobalNav ? handleGlobalNext : handleLocalNext;

  // 조건영작 (arrangement): 딥 와인/로즈골드 테마 (더 확실한 차별화)
  // 배열영작 (conditional): 다크 네이비/골드 테마
  const themeColors = isArrangement ? {
    headerBg: 'linear-gradient(135deg, #5c1c2e 0%, #8b3a4e 100%)',
    headerBorder: 'rgba(199,125,142,0.4)',
    numberBadgeBg: 'linear-gradient(135deg, #f4c4d0 0%, #e8a8b8 100%)',
    numberBadgeColor: '#5c1c2e',
    titleColor: '#f4c4d0',
    metaColor: 'rgba(244,196,208,0.8)',
    metaBorder: 'rgba(199,125,142,0.3)',
  } : {
    headerBg: 'linear-gradient(135deg, #0f1419 0%, #1a2028 100%)',
    headerBorder: 'rgba(201,162,39,0.3)',
    numberBadgeBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
    numberBadgeColor: '#0f1419',
    titleColor: '#d4af37',
    metaColor: 'rgba(212,175,55,0.7)',
    metaBorder: 'rgba(212,175,55,0.2)',
  };

  return (
    <A4Page 
      pageNumber={pageNumber} 
      totalPages={totalPages}
      unitNumber={unitNumber}
      unitTitle={unitTitle}
      section={section}
    >
      {/* Unit Title Bar - Theme-based Design */}
      <div 
        className="flex items-center gap-3 rounded mb-1 px-3 py-1.5"
        style={{ 
          background: themeColors.headerBg,
          border: `1px solid ${themeColors.headerBorder}`,
        }}
      >
        <div 
          className="flex items-center justify-center font-bold"
          style={{ 
            width: '28px',
            height: '28px',
            background: themeColors.numberBadgeBg,
            borderRadius: '4px',
            fontSize: '11px',
            color: themeColors.numberBadgeColor,
          }}
        >
          {String(unitNumber).padStart(2, '0')}
        </div>
        <div className="flex-1">
          <h2 
            className="font-bold"
            style={{ 
              fontSize: '12px',
              color: themeColors.titleColor,
            }}
          >
            {unitTitle}
          </h2>
        </div>
        <div 
          className="px-2 py-0.5 rounded"
          style={{ 
            fontSize: '9px',
            color: themeColors.metaColor,
            border: `1px solid ${themeColors.metaBorder}`,
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.05em',
          }}
        >
          문제 {startNumber} - {startNumber + problems.length - 1}
        </div>
      </div>

      {/* Problems - flex container to fill ALL available space to footer */}
      <div className="flex flex-col flex-1 min-h-0">
        {problems.map((problem, index) => (
          <div 
            key={problem.number}
            className="flex-1 cursor-pointer hover:bg-black/5 transition-colors rounded"
            onClick={() => handleProblemClick(problem, index)}
          >
            <ProblemRow
              number={problem.number}
              koreanSentence={problem.korean}
              hints={problem.hints}
              wordCount={problem.wordCount}
              instructions={problem.instructions}
              type={problem.type}
              answer={problem.answer}
              isActive={activeProblemNumber === problem.number}
              onActivate={handleActivate}
              className="flex-1"
              section={section}
            />
          </div>
        ))}
      </div>

      {/* Fullscreen Popup */}
      <GrammarProblemPopup
        isOpen={isPopupOpen}
        onClose={handleClose}
        number={popupProblem?.number ?? 0}
        koreanSentence={popupProblem?.korean ?? ''}
        hints={popupProblem?.hints}
        wordCount={popupProblem?.wordCount}
        instructions={popupProblem?.instructions}
        type={popupProblem?.type ?? 'arrangement'}
        answer={popupProblem?.answer}
        unitNumber={popupUnitNumber}
        unitTitle={popupUnitTitle}
        section={section}
        onPrevious={handlePrev}
        onNext={handleNext}
        hasPrevious={hasPrev}
        hasNext={hasNextProblem}
      />
    </A4Page>
  );
}
