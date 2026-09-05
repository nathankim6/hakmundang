import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw, Volume2 } from "lucide-react";
import { Problem } from "@/data/workbookData";
import confetti from "canvas-confetti";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface HighlightRange {
  start: number;
  end: number;
  color: 'yellow' | 'blue' | 'green' | 'label-only';
  label?: string; // 'S', 'V', "S'", "V'", etc.
  labelStart?: number; // Original start position for fixed label
  labelEnd?: number;   // Original end position for fixed label
}

interface FlyingWord {
  id: string;
  word: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface InteractiveProblemProps {
  problem: Problem;
  problemNumber: number;
}

export function InteractiveProblem({ problem, problemNumber }: InteractiveProblemProps) {
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [highlights, setHighlights] = useState<HighlightRange[]>([]);
  const [highlightHistory, setHighlightHistory] = useState<HighlightRange[][]>([]);
  const [wordHistory, setWordHistory] = useState<{ available: string[], selected: string[] }[]>([]);
  const [highlightRedoHistory, setHighlightRedoHistory] = useState<HighlightRange[][]>([]);
  const [wordRedoHistory, setWordRedoHistory] = useState<{ available: string[], selected: string[] }[]>([]);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [hasPlayedCorrect, setHasPlayedCorrect] = useState(false);
  const [flyingWord, setFlyingWord] = useState<FlyingWord | null>(null);
  
  const koreanTextRef = useRef<HTMLParagraphElement>(null);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);
  const wordBankRef = useRef<HTMLDivElement>(null);
  const answerAreaRef = useRef<HTMLDivElement>(null);
  const wordButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  
  const { playCorrectSound, playWrongSound } = useSoundEffects();

  // Initialize words from hints
  useEffect(() => {
    if (problem.hints && problem.hints.length > 0) {
      // Shuffle the hints
      const shuffled = [...problem.hints].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    } else if (problem.answer) {
      // If no hints, extract words from answer
      const words = problem.answer.split(/\s+/).filter(w => w.length > 0);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }
    setSelectedWords([]);
    setIsCorrect(null);
    setIsWrong(false);
    setHighlights([]);
    setHighlightHistory([]);
    setHighlightRedoHistory([]);
    setWordHistory([]);
    setWordRedoHistory([]);
    setIsTypingMode(false);
    setTypedAnswer("");
    setHasPlayedCorrect(false);
    setFlyingWord(null);
  }, [problem]);

  // Check answer whenever selectedWords or typedAnswer changes
  useEffect(() => {
    if (!problem.answer) return;

    const currentAnswer = isTypingMode ? typedAnswer : selectedWords.join(" ");
    if (currentAnswer.length === 0) {
      setIsCorrect(null);
      setIsWrong(false);
      return;
    }

    const normalizedAnswer = problem.answer.toLowerCase().replace(/[.,!?'"]/g, '').trim();
    const normalizedCurrent = currentAnswer.toLowerCase().replace(/[.,!?'"]/g, '').trim();

    if (normalizedCurrent === normalizedAnswer) {
      setIsCorrect(true);
      setIsWrong(false);
      
      // Play sound and confetti only once
      if (!hasPlayedCorrect) {
        setHasPlayedCorrect(true);
        playCorrectSound();
        
        // Enhanced confetti celebration
        const duration = 2000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f59e0b']
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f59e0b']
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        
        // Initial burst
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f59e0b', '#a855f7']
        });
        
        frame();
      }
    } else {
      setIsCorrect(false);
      // Check if it's a partial match (prefix)
      if (normalizedAnswer.startsWith(normalizedCurrent)) {
        setIsWrong(false);
      } else {
        if (!isWrong) {
          playWrongSound();
        }
        setIsWrong(true);
      }
    }
  }, [selectedWords, typedAnswer, problem.answer, isTypingMode, hasPlayedCorrect, playCorrectSound, playWrongSound, isWrong]);

  // Handle word click with animation
  const handleWordClick = (word: string, index: number, withAnimation = false, buttonElement?: HTMLButtonElement) => {
    if (withAnimation && buttonElement && answerAreaRef.current) {
      const buttonRect = buttonElement.getBoundingClientRect();
      const answerRect = answerAreaRef.current.getBoundingClientRect();
      
      // Calculate target position (center of answer area, adjusted for existing words)
      const targetX = answerRect.left + answerRect.width / 2;
      const targetY = answerRect.top + answerRect.height / 2;
      
      const flyingWordData: FlyingWord = {
        id: `${word}-${Date.now()}`,
        word,
        startX: buttonRect.left + buttonRect.width / 2,
        startY: buttonRect.top + buttonRect.height / 2,
        endX: targetX,
        endY: targetY,
      };
      
      setFlyingWord(flyingWordData);
      
      // Remove from available immediately (for visual)
      setAvailableWords(prev => prev.filter((_, i) => i !== index));
      
      // Add to selected after animation completes
      setTimeout(() => {
        setSelectedWords(prev => [...prev, word]);
        setFlyingWord(null);
        setIsTypingMode(false);
      }, 400);
    } else {
      // Save history before changing and clear redo
      setWordHistory(prev => [...prev, { available: [...availableWords], selected: [...selectedWords] }]);
      setWordRedoHistory([]);
      setIsTypingMode(false);
      setSelectedWords([...selectedWords, word]);
      setAvailableWords(availableWords.filter((_, i) => i !== index));
    }
  };

  // Handle removing word from answer
  const handleRemoveWord = (index: number) => {
    // Save history before changing and clear redo
    setWordHistory(prev => [...prev, { available: [...availableWords], selected: [...selectedWords] }]);
    setWordRedoHistory([]);
    const word = selectedWords[index];
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, word]);
  };

  // Reset problem
  const handleReset = () => {
    if (problem.hints && problem.hints.length > 0) {
      const shuffled = [...problem.hints].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    } else if (problem.answer) {
      const words = problem.answer.split(/\s+/).filter(w => w.length > 0);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }
    setSelectedWords([]);
    setIsCorrect(null);
    setIsWrong(false);
    setTypedAnswer("");
    setIsTypingMode(false);
    setHasPlayedCorrect(false);
    setFlyingWord(null);
  };

  // Handle keyboard shortcuts for highlighting and auto-complete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+1 for auto-selecting next correct word with animation
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        if (!problem.answer || availableWords.length === 0) return;
        
        // Get the correct answer words
        const answerWords = problem.answer.split(/\s+/).filter(w => w.length > 0);
        
        // Find the next word that should be selected
        const nextIndex = selectedWords.length;
        if (nextIndex >= answerWords.length) return; // Already complete
        
        const nextCorrectWord = answerWords[nextIndex];
        
        // Find this word in available words (case-insensitive match)
        const availableIndex = availableWords.findIndex(
          w => w.toLowerCase().replace(/[.,!?'"]/g, '') === nextCorrectWord.toLowerCase().replace(/[.,!?'"]/g, '')
        );
        
        if (availableIndex !== -1) {
          // Get the button element for animation
          const buttonElement = wordButtonRefs.current.get(availableIndex);
          const word = availableWords[availableIndex];
          
          if (buttonElement) {
            handleWordClick(word, availableIndex, true, buttonElement);
          } else {
            // Fallback without animation
            setSelectedWords([...selectedWords, word]);
            setAvailableWords(availableWords.filter((_, i) => i !== availableIndex));
            setIsTypingMode(false);
          }
        }
        return;
      }

      // Ctrl+Z for undo (words first, then highlights)
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        
        // First try to undo word selection
        if (wordHistory.length > 0) {
          const previousState = wordHistory[wordHistory.length - 1];
          // Save current state to redo history
          setWordRedoHistory(prev => [...prev, { available: [...availableWords], selected: [...selectedWords] }]);
          setAvailableWords(previousState.available);
          setSelectedWords(previousState.selected);
          setWordHistory(wordHistory.slice(0, -1));
          return;
        }
        
        // Then try to undo highlights
        if (highlightHistory.length > 0) {
          const previousState = highlightHistory[highlightHistory.length - 1];
          // Save current state to redo history
          setHighlightRedoHistory(prev => [...prev, [...highlights]]);
          setHighlights(previousState);
          setHighlightHistory(highlightHistory.slice(0, -1));
        }
        return;
      }

      // Ctrl+Y for redo (words first, then highlights)
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        
        // First try to redo word selection
        if (wordRedoHistory.length > 0) {
          const nextState = wordRedoHistory[wordRedoHistory.length - 1];
          // Save current state to undo history
          setWordHistory(prev => [...prev, { available: [...availableWords], selected: [...selectedWords] }]);
          setAvailableWords(nextState.available);
          setSelectedWords(nextState.selected);
          setWordRedoHistory(wordRedoHistory.slice(0, -1));
          return;
        }
        
        // Then try to redo highlights
        if (highlightRedoHistory.length > 0) {
          const nextState = highlightRedoHistory[highlightRedoHistory.length - 1];
          // Save current state to undo history
          setHighlightHistory(prev => [...prev, [...highlights]]);
          setHighlights(nextState);
          setHighlightRedoHistory(highlightRedoHistory.slice(0, -1));
        }
        return;
      }

      // Ctrl+1, 2, 3, 4 for highlighting
      if (e.ctrlKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const koreanElement = koreanTextRef.current;
        if (!koreanElement) return;

        // Check if selection is within korean text
        if (!koreanElement.contains(range.commonAncestorContainer)) return;

        const text = koreanElement.textContent || '';
        const selectedText = selection.toString();
        if (!selectedText) return;

        // Find the start position
        const beforeRange = document.createRange();
        beforeRange.setStart(koreanElement, 0);
        beforeRange.setEnd(range.startContainer, range.startOffset);
        const start = beforeRange.toString().length;
        const end = start + selectedText.length;

        // Generate label with prime marks for S and V
        const getLabel = (baseLabel: string, currentHighlights: HighlightRange[]): string => {
          // Count existing highlights with the same base label
          const count = currentHighlights.filter(h => h.label?.startsWith(baseLabel)).length;
          if (count === 0) return baseLabel;
          return baseLabel + "'".repeat(count);
        };

        // Save history before modifying and clear redo
        setHighlightHistory([...highlightHistory, highlights]);
        setHighlightRedoHistory([]);

        // Process overlapping highlights - preserve labeled highlights separately
        let updatedHighlights: HighlightRange[] = [];
        let labelOnlyHighlights: HighlightRange[] = []; // Store labels separately to keep positions fixed

        for (const existing of highlights) {
          const hasOverlap = !(end <= existing.start || start >= existing.end);
          
          if (hasOverlap) {
            // If this highlight has a label, preserve it as a label-only marker at original position
            if (existing.label) {
              labelOnlyHighlights.push({
                start: existing.start,
                end: existing.end,
                color: 'label-only',
                label: existing.label,
                labelStart: existing.labelStart ?? existing.start,
                labelEnd: existing.labelEnd ?? existing.end
              });
            }
            
            // Part before the new selection (color only, no label)
            if (existing.start < start) {
              updatedHighlights.push({
                start: existing.start,
                end: start,
                color: existing.color
              });
            }
            // Part after the new selection (color only, no label)
            if (existing.end > end) {
              updatedHighlights.push({
                start: end,
                end: existing.end,
                color: existing.color
              });
            }
          } else {
            // No overlap, keep existing highlight (but separate label if it has one)
            if (existing.label && existing.color !== 'label-only') {
              // Keep color highlight without label
              updatedHighlights.push({
                start: existing.start,
                end: existing.end,
                color: existing.color
              });
              // Add label-only marker
              labelOnlyHighlights.push({
                start: existing.start,
                end: existing.end,
                color: 'label-only',
                label: existing.label,
                labelStart: existing.labelStart ?? existing.start,
                labelEnd: existing.labelEnd ?? existing.end
              });
            } else if (existing.color === 'label-only') {
              // Keep existing label-only markers
              labelOnlyHighlights.push(existing);
            } else {
              updatedHighlights.push(existing);
            }
          }
        }

        let color: 'yellow' | 'blue' | 'green';
        let newLabel: string | undefined;

        // Count existing labels for generating new ones
        const existingLabels = labelOnlyHighlights.filter(h => h.label);

        switch (e.key) {
          case '1':
            color = 'yellow';
            // Generate new S label
            const sCount = existingLabels.filter(h => h.label?.startsWith('S')).length;
            newLabel = sCount === 0 ? 'S' : 'S' + "'".repeat(sCount);
            break;
          case '2':
            color = 'yellow';
            // Generate new V label
            const vCount = existingLabels.filter(h => h.label?.startsWith('V')).length;
            newLabel = vCount === 0 ? 'V' : 'V' + "'".repeat(vCount);
            break;
          case '3':
            color = 'blue';
            newLabel = undefined;
            break;
          case '4':
            color = 'green';
            newLabel = undefined;
            break;
          default:
            return;
        }

        // Add new color highlight
        updatedHighlights.push({
          start,
          end,
          color
        });

        // If new label, add it as label-only marker
        if (newLabel) {
          labelOnlyHighlights.push({
            start,
            end,
            color: 'label-only',
            label: newLabel,
            labelStart: start,
            labelEnd: end
          });
        }

        // Combine all highlights and sort
        const allHighlights = [...updatedHighlights, ...labelOnlyHighlights];
        allHighlights.sort((a, b) => a.start - b.start);

        setHighlights(allHighlights);
        selection.removeAllRanges();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [highlights, highlightHistory, highlightRedoHistory, wordHistory, wordRedoHistory, problem.answer, availableWords, selectedWords]);

  // Render korean text with highlights
  const renderKoreanText = () => {
    const text = problem.korean;
    if (highlights.length === 0) return text;

    // Separate color highlights and label-only markers
    const colorHighlights = highlights.filter(h => h.color !== 'label-only');
    const labelMarkers = highlights.filter(h => h.color === 'label-only');

    // Sort color highlights by start position
    const sortedHighlights = [...colorHighlights].sort((a, b) => a.start - b.start);
    
    // Build character-to-color map for proper rendering
    const charColors: Array<{ color: 'yellow' | 'blue' | 'green' | null }> = 
      Array(text.length).fill(null).map(() => ({ color: null }));
    
    sortedHighlights.forEach(highlight => {
      for (let i = highlight.start; i < highlight.end && i < text.length; i++) {
        charColors[i] = { color: highlight.color as 'yellow' | 'blue' | 'green' };
      }
    });

    // Build character-to-label map (labels at their fixed positions)
    const charLabels: Array<string | null> = Array(text.length).fill(null);
    labelMarkers.forEach(marker => {
      if (marker.label) {
        // Put label at the start of the original labeled range
        const labelPos = marker.labelStart ?? marker.start;
        if (labelPos < text.length) {
          charLabels[labelPos] = marker.label;
        }
      }
    });

    // Render parts
    const parts: JSX.Element[] = [];
    let i = 0;
    
    while (i < text.length) {
      const currentColor = charColors[i].color;
      const currentLabel = charLabels[i];
      
      // Find end of this segment (same color, no new labels)
      let segmentEnd = i + 1;
      while (
        segmentEnd < text.length && 
        charColors[segmentEnd].color === currentColor &&
        !charLabels[segmentEnd]
      ) {
        segmentEnd++;
      }
      
      const segmentText = text.slice(i, segmentEnd);
      
      if (currentColor) {
        const colorClasses = {
          yellow: 'bg-yellow-300/80 text-slate-900',
          blue: 'bg-blue-400/80 text-white',
          green: 'bg-green-400/80 text-white'
        };
        
        parts.push(
          <span key={`segment-${i}`} className="relative inline-flex flex-col items-center">
            {currentLabel && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-base font-black text-red-500 whitespace-nowrap drop-shadow-md">
                {currentLabel}
              </span>
            )}
            <span className={cn("px-0.5 rounded", colorClasses[currentColor])}>
              {segmentText}
            </span>
          </span>
        );
      } else if (currentLabel) {
        // Label on non-highlighted text
        parts.push(
          <span key={`segment-${i}`} className="relative inline-flex flex-col items-center">
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-base font-black text-red-500 whitespace-nowrap drop-shadow-md">
              {currentLabel}
            </span>
            {segmentText}
          </span>
        );
      } else {
        parts.push(<span key={`segment-${i}`}>{segmentText}</span>);
      }
      
      i = segmentEnd;
    }

    return parts;
  };

  // Handle answer area click for typing mode
  const handleAnswerAreaClick = () => {
    if (selectedWords.length === 0) {
      setIsTypingMode(true);
      setTimeout(() => answerInputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Flying Word Animation */}
      {flyingWord && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: flyingWord.startX,
            top: flyingWord.startY,
            transform: 'translate(-50%, -50%)',
            animation: 'flyToAnswer 0.4s ease-out forwards',
            '--end-x': `${flyingWord.endX - flyingWord.startX}px`,
            '--end-y': `${flyingWord.endY - flyingWord.startY}px`,
          } as React.CSSProperties}
        >
          <span className="px-3 py-2 rounded-lg font-medium bg-amber-500 text-black shadow-lg shadow-amber-500/50 border border-amber-400">
            {flyingWord.word}
          </span>
        </div>
      )}

      {/* Problem Number & Instructions */}
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground font-bold text-lg rounded-lg">
          {String(problemNumber).padStart(2, '0')}
        </span>
        {problem.instructions && (
          <span className="text-sm text-slate-400">{problem.instructions}</span>
        )}
        {problem.wordCount && (
          <span className="text-sm text-slate-500">({problem.wordCount}단어)</span>
        )}
      </div>

      {/* Korean Sentence - with highlighting support */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start justify-between gap-4">
          <p 
            ref={koreanTextRef}
            className="text-xl leading-relaxed font-medium text-white select-text cursor-text"
          >
            {renderKoreanText()}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <span className="px-2 py-0.5 bg-yellow-300/20 rounded">Ctrl+1 주어(S)</span>
          <span className="px-2 py-0.5 bg-yellow-300/20 rounded">Ctrl+2 동사(V)</span>
          <span className="px-2 py-0.5 bg-blue-400/20 rounded">Ctrl+3 파랑</span>
          <span className="px-2 py-0.5 bg-green-400/20 rounded">Ctrl+4 초록</span>
          <span className="px-2 py-0.5 bg-slate-600 rounded">Ctrl+Z 취소</span>
        </div>
      </div>

      {/* Word Bank */}
      <div ref={wordBankRef} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <div className="text-xs text-slate-500 mb-3">단어를 클릭하여 문장을 만드세요 <span className="text-amber-500">(Alt+1: 자동완성)</span></div>
        <div className="flex flex-wrap gap-2 min-h-[48px]">
          {availableWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              ref={(el) => {
                if (el) wordButtonRefs.current.set(index, el);
                else wordButtonRefs.current.delete(index);
              }}
              onClick={() => handleWordClick(word, index)}
              className={cn(
                "px-3 py-2 rounded-lg font-medium transition-all",
                "bg-slate-700 hover:bg-slate-600 text-white",
                "hover:scale-105 active:scale-95",
                "border border-slate-600 hover:border-slate-500"
              )}
            >
              {word}
            </button>
          ))}
          {availableWords.length === 0 && !isTypingMode && (
            <span className="text-slate-500 text-sm">모든 단어를 사용했습니다</span>
          )}
        </div>
      </div>

      {/* Answer Area */}
      <div 
        ref={answerAreaRef}
        onClick={handleAnswerAreaClick}
        className={cn(
          "rounded-xl p-6 border-2 transition-all min-h-[120px] cursor-text",
          isCorrect === true && "bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20",
          isWrong && "bg-red-500/10 border-red-500 animate-pulse",
          isCorrect === null && !isWrong && "bg-slate-800/50 border-slate-700 hover:border-slate-600"
        )}
      >
        <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
          <span>답안 {isTypingMode && "(타이핑 모드)"}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            초기화
          </button>
        </div>

        {isTypingMode ? (
          <textarea
            ref={answerInputRef}
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder="답을 직접 입력하세요..."
            className="w-full bg-transparent text-lg text-white placeholder:text-slate-500 focus:outline-none resize-none min-h-[60px]"
          />
        ) : (
          <div className="flex flex-wrap gap-2 min-h-[48px]">
            {selectedWords.map((word, index) => (
              <button
                key={`selected-${word}-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveWord(index);
                }}
                className={cn(
                  "px-3 py-2 rounded-lg font-medium transition-all",
                  "hover:scale-105 active:scale-95",
                  isCorrect === true 
                    ? "bg-green-500 text-white" 
                    : isWrong 
                      ? "bg-red-500/50 text-white border border-red-500" 
                      : "bg-primary/80 text-primary-foreground hover:bg-primary"
                )}
              >
                {word}
              </button>
            ))}
            {selectedWords.length === 0 && !isTypingMode && (
              <span className="text-slate-500 text-sm">클릭하여 타이핑하거나, 위에서 단어를 선택하세요</span>
            )}
          </div>
        )}
      </div>

      {/* Success Message with Circle Mark */}
      {isCorrect === true && (
        <div className="text-center py-4 animate-fade-in">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 text-green-400 rounded-2xl text-lg font-bold shadow-lg shadow-green-500/20 border border-green-500/30">
            <span className="relative flex items-center justify-center w-16 h-16">
              <span className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-30" />
              <span className="absolute inset-0 border-4 border-green-400 rounded-full animate-pulse" />
              <span className="relative text-green-400 text-4xl font-bold animate-bounce">○</span>
            </span>
            <span className="text-xl">🎉 정답입니다!</span>
          </div>
        </div>
      )}

      {/* Wrong Answer Message with X Mark */}
      {isWrong && (
        <div className="text-center py-4 animate-fade-in">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-red-500/20 via-rose-500/20 to-red-500/20 text-red-400 rounded-2xl text-lg font-bold shadow-lg shadow-red-500/20 border border-red-500/30">
            <span className="relative flex items-center justify-center w-14 h-14">
              <span className="absolute inset-0 border-4 border-red-500 rounded-full animate-pulse opacity-50" />
              <span className="relative text-red-400 text-3xl font-bold">✕</span>
            </span>
            <span className="text-lg">다시 시도해보세요</span>
          </div>
        </div>
      )}

      {/* CSS for flying animation */}
      <style>{`
        @keyframes flyToAnswer {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(
              calc(-50% + var(--end-x) * 0.5),
              calc(-50% + var(--end-y) * 0.5 - 30px)
            ) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(-50% + var(--end-x)),
              calc(-50% + var(--end-y))
            ) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
