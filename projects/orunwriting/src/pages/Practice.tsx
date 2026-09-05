import { useState, useMemo, useEffect, useCallback } from "react";
import { conditionalUnits } from "@/data/conditionalProblems";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RotateCcw, Check } from "lucide-react";
import { InteractiveProblem } from "@/components/practice/InteractiveProblem";

const Practice = () => {
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  const currentUnit = conditionalUnits[currentUnitIndex];
  const currentProblem = currentUnit?.problems[currentProblemIndex];

  const goToPrevProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    } else if (currentUnitIndex > 0) {
      setCurrentUnitIndex(currentUnitIndex - 1);
      setCurrentProblemIndex(conditionalUnits[currentUnitIndex - 1].problems.length - 1);
    }
  };

  const goToNextProblem = () => {
    if (currentProblemIndex < currentUnit.problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else if (currentUnitIndex < conditionalUnits.length - 1) {
      setCurrentUnitIndex(currentUnitIndex + 1);
      setCurrentProblemIndex(0);
    }
  };

  const totalProblems = useMemo(() => {
    return conditionalUnits.reduce((sum, unit) => sum + unit.problems.length, 0);
  }, []);

  const currentGlobalIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentUnitIndex; i++) {
      count += conditionalUnits[i].problems.length;
    }
    return count + currentProblemIndex + 1;
  }, [currentUnitIndex, currentProblemIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              ← 워크북
            </a>
            <div className="h-4 w-px bg-slate-600" />
            <h1 className="text-lg font-bold">배열영작 연습</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              Unit {String(currentUnit.number).padStart(2, '0')} - {currentProblemIndex + 1}/{currentUnit.problems.length}
            </span>
            <div className="h-4 w-px bg-slate-600" />
            <span className="text-xs text-slate-500">
              전체 {currentGlobalIndex}/{totalProblems}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Unit Title */}
          <div className="mb-6 text-center">
            <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium mb-2">
              Unit {String(currentUnit.number).padStart(2, '0')}
            </span>
            <h2 className="text-xl font-bold text-white">{currentUnit.title}</h2>
          </div>

          {/* Interactive Problem */}
          {currentProblem && (
            <InteractiveProblem
              key={`${currentUnitIndex}-${currentProblemIndex}`}
              problem={currentProblem}
              problemNumber={currentProblem.number}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={goToPrevProblem}
            disabled={currentUnitIndex === 0 && currentProblemIndex === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              currentUnitIndex === 0 && currentProblemIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>

          {/* Unit Quick Select */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-md px-2">
            {conditionalUnits.slice(0, 10).map((unit, idx) => (
              <button
                key={unit.number}
                onClick={() => {
                  setCurrentUnitIndex(idx);
                  setCurrentProblemIndex(0);
                }}
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition-all flex-shrink-0",
                  idx === currentUnitIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                )}
              >
                {String(unit.number).padStart(2, '0')}
              </button>
            ))}
          </div>

          <button
            onClick={goToNextProblem}
            disabled={currentUnitIndex === conditionalUnits.length - 1 && currentProblemIndex === currentUnit.problems.length - 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              currentUnitIndex === conditionalUnits.length - 1 && currentProblemIndex === currentUnit.problems.length - 1
                ? "opacity-30 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Practice;
