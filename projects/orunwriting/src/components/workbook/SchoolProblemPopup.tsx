import { useEffect, useRef, useState, useCallback } from "react";
import { X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { SchoolProblem } from "@/data/schoolProblemsData";

interface FlyingWord {
  id: string;
  word: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isTransformed?: boolean;
}

interface HighlightRange {
  start: number;
  end: number;
  color: 'yellow' | 'blue' | 'green' | 'label-only';
  type?: 'bracket' | 'parenthesis' | 'triangle';
  label?: string;
  labelStart?: number;
  labelEnd?: number;
  isUnderlineLabel?: boolean; // S/V/O/C applied on already highlighted text
}

interface SchoolProblemPopupProps {
  isOpen: boolean;
  onClose: () => void;
  problem: SchoolProblem;
  schoolName: string;
  grade: number;
  semester: string;
  exam: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function SchoolProblemPopup({
  isOpen,
  onClose,
  problem,
  schoolName,
  grade,
  semester,
  exam,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: SchoolProblemPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const answerAreaRef = useRef<HTMLDivElement>(null);
  const passageRef = useRef<HTMLDivElement>(null);
  const wordButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  
  const { playCorrectSound, playWrongSound } = useSoundEffects();

  // Parse options into words if available
  const parseOptions = (options: string | undefined): string[] => {
    if (!options) return [];
    // Split by "/" or "," or spaces, filter empty
    return options.split(/[\/,\s]+/).filter(w => w.trim().length > 0);
  };

  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasPlayedCorrect, setHasPlayedCorrect] = useState(false);
  const [flyingWord, setFlyingWord] = useState<FlyingWord | null>(null);
  const [transformedWords, setTransformedWords] = useState<Set<number>>(new Set());
  const [highlights, setHighlights] = useState<HighlightRange[]>([]);

  // Unified history stack for all actions (highlights, words)
  type HistoryAction = 
    | { type: 'highlight'; highlights: HighlightRange[] }
    | { type: 'word'; available: string[]; selected: string[] };
  
  const [unifiedHistory, setUnifiedHistory] = useState<HistoryAction[]>([]);
  const [unifiedRedoHistory, setUnifiedRedoHistory] = useState<HistoryAction[]>([]);

  // Get answer as string
  const getAnswerString = (): string => {
    if (Array.isArray(problem.answer)) {
      return problem.answer[0] || "";
    }
    return problem.answer;
  };

  // Initialize words from options
  useEffect(() => {
    if (isOpen && problem.options) {
      const words = parseOptions(problem.options);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }
    setSelectedWords([]);
    setIsCorrect(null);
    setIsWrong(false);
    setShowCelebration(false);
    setHasPlayedCorrect(false);
    setFlyingWord(null);
    setTransformedWords(new Set());
    setHighlights([]);
    setUnifiedHistory([]);
    setUnifiedRedoHistory([]);
  }, [isOpen, problem]);

  // Get answer for auto-complete (use first alternative for words with /)
  const getAutoCompleteAnswer = (): string => {
    const answer = getAnswerString();
    // Replace "word1/word2" with just "word1"
    return answer.replace(/(\w+)\/\w+/g, '$1');
  };

  // Check answer - supports "/" alternatives in answer
  useEffect(() => {
    const answer = getAnswerString();
    if (!answer) return;

    const currentAnswer = selectedWords.join(" ");
    if (currentAnswer.length === 0) {
      setIsCorrect(null);
      setIsWrong(false);
      return;
    }

    const normalizedCurrent = currentAnswer.toLowerCase().replace(/[.,!?'"]/g, '').trim();

    // Generate all possible answer combinations from "/" alternatives
    const answerWords = answer.split(/\s+/);
    const alternatives: string[][] = answerWords.map(w => {
      if (w.includes('/')) return w.split('/').map(a => a.toLowerCase().replace(/[.,!?'"]/g, ''));
      return [w.toLowerCase().replace(/[.,!?'"]/g, '')];
    });

    // Check if current matches any combination
    const checkMatch = (idx: number, built: string): boolean => {
      if (idx === alternatives.length) return built.trim() === normalizedCurrent;
      for (const alt of alternatives[idx]) {
        if (checkMatch(idx + 1, built + (built ? ' ' : '') + alt)) return true;
      }
      return false;
    };

    if (checkMatch(0, '')) {
      setIsCorrect(true);
      setIsWrong(false);
      setShowCelebration(true);
      
      if (!hasPlayedCorrect) {
        setHasPlayedCorrect(true);
        playCorrectSound();
      }
      
      setTimeout(() => setShowCelebration(false), 2000);
    } else {
      setIsCorrect(false);
      // Check if current is a valid prefix of any answer combination
      const checkPrefix = (idx: number, built: string): boolean => {
        const trimmed = built.trim();
        if (normalizedCurrent === trimmed) return true;
        if (trimmed.length > 0 && !normalizedCurrent.startsWith(trimmed)) return false;
        if (idx === alternatives.length) return false;
        for (const alt of alternatives[idx]) {
          if (checkPrefix(idx + 1, built + (built ? ' ' : '') + alt)) return true;
        }
        return false;
      };

      if (checkPrefix(0, '')) {
        setIsWrong(false);
      } else {
        if (!isWrong) {
          playWrongSound();
        }
        setIsWrong(true);
      }
    }
  }, [selectedWords, problem, hasPlayedCorrect, playCorrectSound, playWrongSound, isWrong]);

  // Handle word click with flying animation
  const handleWordClick = (word: string, index: number) => {
    if (flyingWord) return; // Don't allow clicking while animation is in progress
    
    const buttonEl = wordButtonRefs.current.get(index);
    if (!buttonEl || !answerAreaRef.current) {
      // Fallback: no animation
      setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
      setUnifiedRedoHistory([]);
      setSelectedWords([...selectedWords, word]);
      setAvailableWords(availableWords.filter((_, i) => i !== index));
      return;
    }

    const buttonRect = buttonEl.getBoundingClientRect();
    const answerRect = answerAreaRef.current.getBoundingClientRect();

    const flyingWordData: FlyingWord = {
      id: `${word}-${Date.now()}`,
      word,
      startX: buttonRect.left + buttonRect.width / 2,
      startY: buttonRect.top + buttonRect.height / 2,
      endX: answerRect.left + answerRect.width / 2,
      endY: answerRect.top + answerRect.height / 2,
    };

    setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
    setUnifiedRedoHistory([]);
    setFlyingWord(flyingWordData);
    setAvailableWords(availableWords.filter((_, i) => i !== index));

    setTimeout(() => {
      setSelectedWords(prev => [...prev, word]);
      setFlyingWord(null);
    }, 400);
  };

  // Handle removing word from answer
  const handleRemoveWord = (index: number) => {
    setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
    setUnifiedRedoHistory([]);
    const word = selectedWords[index];
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, word]);
    // Remove from transformed words set
    setTransformedWords(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Shift down indices greater than removed
      const adjusted = new Set<number>();
      newSet.forEach(i => {
        if (i > index) adjusted.add(i - 1);
        else adjusted.add(i);
      });
      return adjusted;
    });
  };

  // Reset problem
  const handleReset = () => {
    if (problem.options) {
      const words = parseOptions(problem.options);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }
    setSelectedWords([]);
    setIsCorrect(null);
    setIsWrong(false);
    setShowCelebration(false);
    setHasPlayedCorrect(false);
    setFlyingWord(null);
    setTransformedWords(new Set());
  };

  // Helper function to calculate accurate text offset - map DOM position to original plainText offset
  const getTextOffsetFromSelection = useCallback((container: HTMLElement, targetNode: Node, targetOffset: number): number => {
    // First, check if the target node is inside a span with data-start-index
    let current: Node | null = targetNode;
    while (current && current !== container) {
      if (current instanceof HTMLElement && current.hasAttribute('data-start-index')) {
        const startIndex = parseInt(current.getAttribute('data-start-index') || '0', 10);
        // Calculate offset within this span's text content (excluding label spans)
        const walker = document.createTreeWalker(current, NodeFilter.SHOW_TEXT, null);
        let node: Text | null;
        let internalOffset = 0;
        while ((node = walker.nextNode() as Text | null)) {
          // Skip text nodes that are inside label spans (absolute positioned)
          const parent = node.parentElement;
          if (parent?.classList.contains('absolute')) {
            continue;
          }
          if (node === targetNode) {
            return startIndex + internalOffset + targetOffset;
          }
          internalOffset += node.textContent?.length || 0;
        }
        return startIndex + targetOffset;
      }
      current = current.parentNode;
    }
    
    // Fallback: walk through all spans with data-start-index
    const spans = container.querySelectorAll('[data-start-index]');
    for (const span of spans) {
      if (span.contains(targetNode)) {
        const startIndex = parseInt(span.getAttribute('data-start-index') || '0', 10);
        const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT, null);
        let node: Text | null;
        let internalOffset = 0;
        while ((node = walker.nextNode() as Text | null)) {
          const parent = node.parentElement;
          if (parent?.classList.contains('absolute')) {
            continue;
          }
          if (node === targetNode) {
            return startIndex + internalOffset + targetOffset;
          }
          internalOffset += node.textContent?.length || 0;
        }
        return startIndex;
      }
    }
    
    // Last fallback: use Range API (may not be accurate if decorators exist)
    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(targetNode, targetOffset);
    return preRange.toString().length;
  }, []);

  // Apply special highlight (bracket, parenthesis, triangle) - keeps existing highlights
  const applySpecialHighlight = useCallback((type: 'bracket' | 'parenthesis' | 'triangle') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const passageElement = passageRef.current;
    if (!passageElement) return;

    if (!passageElement.contains(range.commonAncestorContainer)) return;

    const text = passageElement.textContent || '';
    const selectedText = selection.toString();
    if (!selectedText) return;

    const start = getTextOffsetFromSelection(passageElement, range.startContainer, range.startOffset);
    const end = getTextOffsetFromSelection(passageElement, range.endContainer, range.endOffset);

    if (start >= end || start < 0 || end > text.length) return;

    setUnifiedHistory(prev => [...prev, { type: 'highlight', highlights: [...highlights] }]);
    setUnifiedRedoHistory([]);

    // Keep ALL existing highlights and just add the new one on top
    const newHighlight: HighlightRange = {
      start,
      end,
      color: type === 'bracket' ? 'green' : type === 'parenthesis' ? 'blue' : 'yellow',
      type,
    };

    const updatedHighlights = [...highlights, newHighlight].sort((a, b) => a.start - b.start);
    setHighlights(updatedHighlights);
    selection.removeAllRanges();
  }, [highlights, getTextOffsetFromSelection]);

  // Apply color highlight (S, V, O, C) - keeps existing highlights and adds on top
  const applyColorHighlight = useCallback((key: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const passageElement = passageRef.current;
    if (!passageElement) return;

    if (!passageElement.contains(range.commonAncestorContainer)) return;

    const text = passageElement.textContent || '';
    const selectedText = selection.toString();
    if (!selectedText) return;

    const start = getTextOffsetFromSelection(passageElement, range.startContainer, range.startOffset);
    const end = getTextOffsetFromSelection(passageElement, range.endContainer, range.endOffset);

    if (start >= end || start < 0 || end > text.length) return;

    setUnifiedHistory(prev => [...prev, { type: 'highlight', highlights: [...highlights] }]);
    setUnifiedRedoHistory([]);

    // Check if there's an overlapping highlight or special highlight (for underline style)
    const overlappingHighlights = highlights.filter(h => 
      !(h.end <= start || h.start >= end) && (h.color !== 'label-only' || h.type)
    );
    const hasExistingHighlight = overlappingHighlights.length > 0;
    const hasExistingSpecialHighlight = highlights.some(h => 
      !(h.end <= start || h.start >= end) && h.type
    );

    // Count existing labels for S', V', O', C' naming
    const existingLabels = highlights.filter(h => h.label);

    let color: 'yellow' | 'blue' | 'green' | 'label-only';
    let newLabel: string | undefined;

    switch (key) {
      case '1':
        color = hasExistingHighlight ? 'label-only' : 'yellow';
        const sCount = existingLabels.filter(h => h.label?.startsWith('S')).length;
        newLabel = sCount === 0 ? 'S' : 'S' + "'".repeat(sCount);
        break;
      case '2':
        color = hasExistingHighlight ? 'label-only' : 'yellow';
        const vCount = existingLabels.filter(h => h.label?.startsWith('V')).length;
        newLabel = vCount === 0 ? 'V' : 'V' + "'".repeat(vCount);
        break;
      case '3':
        color = hasExistingHighlight ? 'label-only' : 'blue';
        const oCount = existingLabels.filter(h => h.label?.startsWith('O')).length;
        newLabel = oCount === 0 ? 'O' : 'O' + "'".repeat(oCount);
        break;
      case '4':
        color = hasExistingHighlight ? 'label-only' : 'green';
        const cCount = existingLabels.filter(h => h.label?.startsWith('C')).length;
        newLabel = cCount === 0 ? 'C' : 'C' + "'".repeat(cCount);
        break;
      default:
        return;
    }

    // Add new highlight on top of existing ones (don't remove or split existing)
    const newHighlight: HighlightRange = {
      start,
      end,
      color,
      label: newLabel,
      labelStart: start,
      labelEnd: end,
      isUnderlineLabel: hasExistingHighlight,
    };

    const updatedHighlights = [...highlights, newHighlight].sort((a, b) => a.start - b.start);
    setHighlights(updatedHighlights);
    selection.removeAllRanges();
  }, [highlights, getTextOffsetFromSelection]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Ctrl+1,2,3,4 for highlighting S, V, O, C
      if (e.ctrlKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        applyColorHighlight(e.key);
        return;
      }

      // Alt+1 for brackets [ ]
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        applySpecialHighlight('bracket');
        return;
      }

      // Alt+2 for parenthesis ( )
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        applySpecialHighlight('parenthesis');
        return;
      }

      // Alt+3 for triangle △
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        applySpecialHighlight('triangle');
        return;
      }

      // Shift+1 for auto-selecting next correct word
      if (e.shiftKey && e.key === '!') {
        if (flyingWord) return;
        e.preventDefault();
        
        const answer = getAutoCompleteAnswer();
        if (!answer) return;

        const answerWords = answer.split(/\s+/).filter(w => w.length > 0);
        const coveredWordCount = selectedWords.reduce((count, hint) => {
          return count + hint.split(/\s+/).length;
        }, 0);

        const nextIndex = coveredWordCount;
        if (nextIndex >= answerWords.length) return;

        const nextCorrectWord = answerWords[nextIndex];
        const normalizedNextWord = nextCorrectWord.toLowerCase().replace(/[.,!?'"]/g, '');

        // Find this word in available words
        let availableIndex = -1;

        // First, check multi-word hints
        for (let i = 0; i < availableWords.length; i++) {
          const hint = availableWords[i];
          const hintWords = hint.split(/\s+/);
          if (hintWords.length > 1) {
            const firstHintWord = hintWords[0].toLowerCase().replace(/[.,!?'"]/g, '');
            if (firstHintWord === normalizedNextWord) {
              let allMatch = true;
              for (let j = 1; j < hintWords.length; j++) {
                const expectedIndex = nextIndex + j;
                if (expectedIndex >= answerWords.length) {
                  allMatch = false;
                  break;
                }
                const expectedWord = answerWords[expectedIndex].toLowerCase().replace(/[.,!?'"]/g, '');
                const hintWord = hintWords[j].toLowerCase().replace(/[.,!?'"]/g, '');
                if (expectedWord !== hintWord) {
                  allMatch = false;
                  break;
                }
              }
              if (allMatch) {
                availableIndex = i;
                break;
              }
            }
          }
        }

        // If no multi-word hint found, try exact single-word match
        if (availableIndex === -1) {
          availableIndex = availableWords.findIndex(
            w => w.toLowerCase().replace(/[.,!?'"]/g, '') === normalizedNextWord
          );
        }

        // If still not found, try partial match for transformed words
        if (availableIndex === -1) {
          availableIndex = availableWords.findIndex(w => {
            const hintWords = w.split(/\s+/);
            if (hintWords.length > 1) return false;

            const normalizedHint = w.toLowerCase().replace(/[.,!?'"]/g, '');
            // Use shorter match length for short words (e.g., have→has)
            const shortWord = normalizedHint.length <= 4 || normalizedNextWord.length <= 4;
            const minMatchLength = shortWord 
              ? Math.min(2, normalizedHint.length, normalizedNextWord.length)
              : Math.min(4, normalizedHint.length, normalizedNextWord.length);
            return normalizedNextWord.startsWith(normalizedHint.slice(0, minMatchLength)) ||
                   normalizedHint.startsWith(normalizedNextWord.slice(0, minMatchLength));
          });
        }

        if (availableIndex !== -1) {
          const buttonElement = wordButtonRefs.current.get(availableIndex);
          const word = availableWords[availableIndex];
          const hintWords = word.split(/\s+/);
          const isMultiWordHint = hintWords.length > 1;

          let useWord = word;
          let isTransformed = false;

          if (isMultiWordHint) {
            const answerSequence = answerWords.slice(nextIndex, nextIndex + hintWords.length).join(' ');
            const normalizedHint = word.toLowerCase().replace(/[.,!?'"]/g, '');
            const normalizedSequence = answerSequence.toLowerCase().replace(/[.,!?'"]/g, '');
            useWord = answerSequence;
            isTransformed = normalizedHint !== normalizedSequence;
          } else {
            isTransformed = word.toLowerCase().replace(/[.,!?'"]/g, '') !== normalizedNextWord;
            useWord = isTransformed ? nextCorrectWord : word;
          }

          if (buttonElement && answerAreaRef.current) {
            const buttonRect = buttonElement.getBoundingClientRect();
            const answerRect = answerAreaRef.current.getBoundingClientRect();

            const flyingWordData: FlyingWord = {
              id: `${word}-${Date.now()}`,
              word: useWord,
              startX: buttonRect.left + buttonRect.width / 2,
              startY: buttonRect.top + buttonRect.height / 2,
              endX: answerRect.left + answerRect.width / 2,
              endY: answerRect.top + answerRect.height / 2,
              isTransformed
            };

            setFlyingWord(flyingWordData);
            setAvailableWords(prev => prev.filter((_, i) => i !== availableIndex));

            setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
            setUnifiedRedoHistory([]);

            const currentSelectedLength = selectedWords.length;

            setTimeout(() => {
              setSelectedWords(prev => [...prev, useWord]);
              if (isTransformed) {
                setTransformedWords(prev => new Set([...prev, currentSelectedLength]));
              }
              setFlyingWord(null);
            }, 400);
          } else {
            // No button element, just add directly
            setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
            setUnifiedRedoHistory([]);
            setAvailableWords(prev => prev.filter((_, i) => i !== availableIndex));
            setSelectedWords(prev => [...prev, useWord]);
            if (isTransformed) {
              setTransformedWords(prev => new Set([...prev, selectedWords.length]));
            }
          }
        } else {
          // Word not found in word bank — add directly from the answer (e.g., "it", "is", "for", "drivers")
          setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
          setUnifiedRedoHistory([]);
          setSelectedWords(prev => [...prev, nextCorrectWord]);
        }
        return;
      }

      // Ctrl+Z for unified undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (unifiedHistory.length === 0) return;
        
        const lastAction = unifiedHistory[unifiedHistory.length - 1];
        
        if (lastAction.type === 'highlight') {
          setUnifiedRedoHistory(prev => [...prev, { type: 'highlight', highlights: [...highlights] }]);
          setHighlights(lastAction.highlights);
        } else if (lastAction.type === 'word') {
          setUnifiedRedoHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
          setAvailableWords(lastAction.available);
          setSelectedWords(lastAction.selected);
        }
        
        setUnifiedHistory(prev => prev.slice(0, -1));
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z for unified redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        if (unifiedRedoHistory.length === 0) return;
        
        const nextAction = unifiedRedoHistory[unifiedRedoHistory.length - 1];
        
        if (nextAction.type === 'highlight') {
          setUnifiedHistory(prev => [...prev, { type: 'highlight', highlights: [...highlights] }]);
          setHighlights(nextAction.highlights);
        } else if (nextAction.type === 'word') {
          setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
          setAvailableWords(nextAction.available);
          setSelectedWords(nextAction.selected);
        }
        
        setUnifiedRedoHistory(prev => prev.slice(0, -1));
        return;
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        e.preventDefault();
        onPrevious();
        return;
      }
      if (e.key === 'ArrowRight' && hasNext && onNext) {
        e.preventDefault();
        onNext();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, flyingWord, availableWords, selectedWords, unifiedHistory, unifiedRedoHistory, problem, hasPrevious, hasNext, onPrevious, onNext, highlights, applyColorHighlight, applySpecialHighlight]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasOptions = problem.options && problem.options.length > 0;

  // Render passage text with highlights - always use plain text rendering for accurate offset calculation
  const renderPassageWithHighlights = () => {
    if (!problem.passage) return null;
    
    // Strip HTML tags for text processing - this ensures offset calculation matches rendered text
    const plainText = problem.passage.replace(/<[^>]*>/g, '');
    
    // Always render as plain text spans (no dangerouslySetInnerHTML) for accurate selection offsets
    if (highlights.length === 0) {
      return (
        <div 
          ref={passageRef}
          className="p-4 rounded-lg text-base leading-[2] whitespace-pre-wrap"
          style={{ 
            backgroundColor: '#ffffff',
            border: '1px solid #d1fae5',
          }}
        >
          <span data-start-index={0}>{plainText}</span>
        </div>
      );
    }

    // Build highlight segments
    const specialHighlights = highlights.filter(h => h.type);
    const colorHighlights = highlights.filter(h => h.color !== 'label-only' && !h.type && !h.isUnderlineLabel);
    const labelMarkers = highlights.filter(h => h.color === 'label-only' || h.isUnderlineLabel);
    
    const sortedHighlights = [...colorHighlights, ...specialHighlights].sort((a, b) => a.start - b.start);
    
    interface CharInfo {
      color: HighlightRange['color'] | null;
      type?: 'bracket' | 'parenthesis' | 'triangle';
    }
    const charInfo: CharInfo[] = Array(plainText.length).fill(null).map(() => ({ color: null }));
    
    sortedHighlights.forEach(highlight => {
      for (let i = highlight.start; i < highlight.end && i < plainText.length; i++) {
        charInfo[i] = { color: highlight.color, type: highlight.type };
      }
    });

    const charLabels: Array<string | null> = Array(plainText.length).fill(null);
    const underlineLabels: Array<{ label: string; start: number; end: number } | null> = Array(plainText.length).fill(null);
    
    labelMarkers.forEach(marker => {
      if (marker.label) {
        const labelPos = marker.labelStart ?? marker.start;
        if (labelPos < plainText.length) {
          if (marker.isUnderlineLabel) {
            // Store underline label info - this renders as underline with label below
            underlineLabels[labelPos] = {
              label: marker.label,
              start: marker.labelStart ?? marker.start,
              end: marker.labelEnd ?? marker.end,
            };
          } else {
            // Regular label above the text
            charLabels[labelPos] = marker.label;
          }
        }
      }
    });

    const specialRanges = specialHighlights.map(h => ({
      start: h.start,
      end: h.end,
      type: h.type
    }));

    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < plainText.length) {
      const specialRange = specialRanges.find(r => r.start === i);
      
      if (specialRange) {
        const segmentLabel = charLabels[specialRange.start];
        
        let className = '';
        if (specialRange.type === 'bracket') {
          className = 'bracket-highlight';
        } else if (specialRange.type === 'parenthesis') {
          className = 'parenthesis-highlight';
        } else if (specialRange.type === 'triangle') {
          className = 'triangle-highlight';
        }

        // Render inner content with possible underline labels
        const innerElements: React.ReactNode[] = [];
        let innerIdx = specialRange.start;
        
        while (innerIdx < specialRange.end) {
          const underlineInfo = underlineLabels[innerIdx];
          
          if (underlineInfo && underlineInfo.start >= specialRange.start && underlineInfo.end <= specialRange.end) {
            // Render underline label within special range
            const underlineEnd = Math.min(underlineInfo.end, specialRange.end);
            const underlineText = plainText.slice(innerIdx, underlineEnd);
            
            innerElements.push(
              <span
                key={`underline-inner-${innerIdx}`}
                className="relative inline"
                data-start-index={innerIdx}
              >
                <span style={{ borderBottom: '2px solid #333', paddingBottom: '2px' }}>
                  {underlineText}
                </span>
                <span 
                  className="absolute left-1/2 -translate-x-1/2 text-[8px] font-bold whitespace-nowrap pointer-events-none"
                  style={{ bottom: '-14px', color: '#333' }}
                >
                  {underlineInfo.label}
                </span>
              </span>
            );
            innerIdx = underlineEnd;
          } else {
            // Regular text within special range
            let endIdx = innerIdx + 1;
            while (endIdx < specialRange.end && !underlineLabels[endIdx]) {
              endIdx++;
            }
            const regularText = plainText.slice(innerIdx, endIdx);
            innerElements.push(
              <span key={`regular-inner-${innerIdx}`} data-start-index={innerIdx}>
                {regularText}
              </span>
            );
            innerIdx = endIdx;
          }
        }

        if (specialRange.type === 'triangle') {
          // Triangle: overlay in center of text
          elements.push(
            <span
              key={`special-${i}`}
              className="relative inline"
            >
              {segmentLabel && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600 bg-amber-100 px-1 rounded whitespace-nowrap z-10">
                  {segmentLabel}
                </span>
              )}
              {innerElements}
              <span 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-bold pointer-events-none"
                style={{ fontSize: '1.2em' }}
              >
                △
              </span>
            </span>
          );
        } else {
          elements.push(
            <span
              key={`special-${i}`}
              className={`relative inline-block ${className}`}
            >
              {segmentLabel && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600 bg-amber-100 px-1 rounded whitespace-nowrap z-10">
                  {segmentLabel}
                </span>
              )}
              {innerElements}
            </span>
          );
        }
        i = specialRange.end;
        continue;
      }

      const info = charInfo[i];
      if (info.color && info.color !== 'label-only') {
        // Check if there's an underline label starting at this position
        const underlineInfo = underlineLabels[i];
        
        if (underlineInfo) {
          // Render the underline portion with its label
          const underlineEnd = Math.min(underlineInfo.end, plainText.length);
          const underlineText = plainText.slice(i, underlineEnd);
          
          let bgColor = '';
          switch (info.color) {
            case 'yellow':
              bgColor = 'rgba(253, 224, 71, 0.5)';
              break;
            case 'blue':
              bgColor = 'rgba(147, 197, 253, 0.5)';
              break;
            case 'green':
              bgColor = 'rgba(134, 239, 172, 0.5)';
              break;
          }
          
          elements.push(
            <span
              key={`underline-${i}`}
              className="relative inline-block"
              style={{ backgroundColor: bgColor }}
              data-start-index={i}
            >
              <span className="relative inline-block">
                <span style={{ borderBottom: '2px solid #333', paddingBottom: '2px' }}>
                  {underlineText}
                </span>
                <span 
                  className="absolute left-1/2 -translate-x-1/2 text-[8px] font-bold whitespace-nowrap"
                  style={{ bottom: '-14px', color: '#333' }}
                >
                  {underlineInfo.label}
                </span>
              </span>
            </span>
          );
          i = underlineEnd;
          continue;
        }
        
        // Regular color segment without underline
        let j = i;
        while (j < plainText.length && charInfo[j].color === info.color && !charInfo[j].type && !specialRanges.some(r => r.start === j) && !underlineLabels[j]) {
          j++;
        }
        
        const segmentText = plainText.slice(i, j);
        const segmentLabel = charLabels[i];
        
        let bgColor = '';
        switch (info.color) {
          case 'yellow':
            bgColor = 'rgba(253, 224, 71, 0.5)';
            break;
          case 'blue':
            bgColor = 'rgba(147, 197, 253, 0.5)';
            break;
          case 'green':
            bgColor = 'rgba(134, 239, 172, 0.5)';
            break;
        }

        elements.push(
          <span
            key={`color-${i}`}
            className="relative inline-block"
            style={{ backgroundColor: bgColor }}
            data-start-index={i}
          >
            {segmentLabel && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600 bg-amber-100 px-1 rounded whitespace-nowrap z-10">
                {segmentLabel}
              </span>
            )}
            {segmentText}
          </span>
        );
        i = j;
      } else {
        let j = i;
        while (j < plainText.length && !charInfo[j].color && !charInfo[j].type && !specialRanges.some(r => r.start === j)) {
          j++;
        }
        
        const segmentText = plainText.slice(i, j);
        const segmentLabel = charLabels[i];
        
        elements.push(
          <span key={`plain-${i}`} className="relative inline" data-start-index={i}>
            {segmentLabel && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600 bg-amber-100 px-1 rounded whitespace-nowrap z-10">
                {segmentLabel}
              </span>
            )}
            {segmentText}
          </span>
        );
        i = j;
      }
    }

    return (
      <div 
        ref={passageRef}
        className="p-4 rounded-lg text-base leading-[2] whitespace-pre-wrap"
        style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #d1fae5',
        }}
      >
        {elements}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Flying word animation */}
      {flyingWord && (
        <div
          className="fixed z-[10000] pointer-events-none"
          style={{
            left: flyingWord.startX,
            top: flyingWord.startY,
            transform: 'translate(-50%, -50%)',
            animation: 'flyToAnswer 0.4s ease-out forwards',
            '--endX': `${flyingWord.endX - flyingWord.startX}px`,
            '--endY': `${flyingWord.endY - flyingWord.startY}px`,
          } as React.CSSProperties}
        >
          <span 
            className={`inline-block px-4 py-2 rounded-lg text-lg font-bold shadow-lg ${
              flyingWord.isTransformed
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white ring-2 ring-green-300'
                : 'bg-gradient-to-r from-green-700 to-green-800 text-green-100'
            }`}
          >
            {flyingWord.word}
          </span>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/95 hover:bg-white shadow-xl transition-all hover:scale-110"
        title="닫기 (ESC)"
      >
        <X className="w-7 h-7" />
      </button>

      {/* Navigation buttons */}
      {hasPrevious && onPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-amber-500/95 hover:bg-amber-500 shadow-xl transition-all hover:scale-110"
          title="이전 문제 (←)"
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
      )}
      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-[280px] top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-amber-500/95 hover:bg-amber-500 shadow-xl transition-all hover:scale-110"
          title="다음 문제 (→)"
        >
          <ChevronRight className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Main Container with Popup and Shortcuts */}
      <div className="flex items-start gap-6">
        {/* Popup Card */}
        <div 
          ref={popupRef}
          className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex-1"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
            border: '3px solid #86efac',
          }}
        >
        {/* Header */}
        <div 
          className="flex items-center gap-4 px-6 py-4"
          style={{ 
            background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
            borderBottom: '2px solid #22c55e',
          }}
        >
          <div 
            className="flex items-center justify-center font-bold"
            style={{ 
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)',
              borderRadius: '10px',
              fontSize: '18px',
              color: '#166534',
            }}
          >
            {String(problem.number).padStart(2, '0')}
          </div>
          <div className="flex-1">
            <h2 
              className="font-bold text-xl"
              style={{ color: '#86efac' }}
            >
              {schoolName}
            </h2>
            <p className="text-sm" style={{ color: '#dcfce7' }}>
              {grade}학년 {semester} {exam}
            </p>
          </div>
        </div>

        {/* Problem Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Question */}
          <div className="text-lg font-medium leading-relaxed" style={{ color: '#1a1a1a' }}>
            {problem.question}
          </div>

          {/* Passage */}
          {problem.passage && renderPassageWithHighlights()}

          {/* Conditions */}
          {problem.conditions && (
            <div 
              className="p-3 rounded-lg text-base leading-relaxed"
              style={{ 
                backgroundColor: '#fef9f3',
                border: '1px solid #fde68a',
              }}
            >
              <span 
                className="inline-block px-2 py-1 rounded text-xs font-bold mr-2 mb-1"
                style={{ backgroundColor: '#92400e', color: '#fef3c7' }}
              >
                조건
              </span>
              <span style={{ color: '#333333' }}>{problem.conditions}</span>
            </div>
          )}

          {/* Options - Word bank */}
          {hasOptions && (
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: 'linear-gradient(135deg, rgba(22,101,52,0.04) 0%, rgba(20,83,45,0.06) 100%)',
                border: '1px solid #86efac',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="inline-block px-2 py-1 rounded text-xs font-bold"
                  style={{ backgroundColor: '#166534', color: '#86efac' }}
                >
                  보기
                </span>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-green-100"
                  style={{ color: '#166534' }}
                >
                  <RotateCcw className="w-3 h-3" />
                  초기화
                </button>
              </div>
              
              {/* Word buttons */}
              <div className="flex flex-wrap gap-2">
                {availableWords.map((word, index) => (
                  <button
                    key={`${word}-${index}`}
                    ref={el => {
                      if (el) wordButtonRefs.current.set(index, el);
                      else wordButtonRefs.current.delete(index);
                    }}
                    onClick={() => handleWordClick(word, index)}
                    className="px-4 py-2 rounded-lg text-base font-medium transition-all hover:scale-105 hover:shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
                    style={{
                      background: 'white',
                      border: '2px solid #86efac',
                      color: '#166534',
                    }}
                  >
                    ⚡ {word}
                  </button>
                ))}
                {availableWords.length === 0 && selectedWords.length > 0 && (
                  <span className="text-sm italic" style={{ color: '#16a34a' }}>
                    모든 단어가 사용되었습니다
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Answer Area */}
          {hasOptions && (
            <div 
              ref={answerAreaRef}
              className={`min-h-[80px] p-4 rounded-lg transition-all relative ${
                showCelebration ? 'ring-4 ring-green-400 ring-opacity-50' : ''
              } ${isWrong ? 'ring-2 ring-red-400' : ''} ${isCorrect ? 'ring-2 ring-green-500' : ''}`}
              style={{ 
                background: isCorrect 
                  ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                  : isWrong 
                    ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                    : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: `2px dashed ${isCorrect ? '#22c55e' : isWrong ? '#f87171' : '#86efac'}`,
              }}
            >
              {selectedWords.length === 0 ? (
                <span className="text-base italic" style={{ color: '#16a34a' }}>
                  단어를 클릭하거나 Alt+1을 눌러 답을 작성하세요...
                </span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedWords.map((word, index) => (
                    <button
                      key={`selected-${word}-${index}`}
                      onClick={() => handleRemoveWord(index)}
                      className={`px-4 py-2 rounded-lg text-base font-medium transition-all hover:scale-95 hover:opacity-80 ${
                        transformedWords.has(index) ? 'ring-2 ring-green-300' : ''
                      }`}
                      style={{
                        background: transformedWords.has(index)
                          ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                          : 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
                        color: transformedWords.has(index) ? '#ffffff' : '#86efac',
                      }}
                      title="클릭하여 제거"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Show expected answer for non-options problems */}
          {!hasOptions && (
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
              }}
            >
              <span 
                className="inline-block px-2 py-1 rounded text-xs font-bold mr-2 mb-2"
                style={{ backgroundColor: '#166534', color: '#86efac' }}
              >
                정답
              </span>
              <div className="text-base font-medium" style={{ color: '#166534' }}>
                {Array.isArray(problem.answer) ? problem.answer.join(' / ') : problem.answer}
              </div>
            </div>
          )}

          {/* Explanation */}
          {problem.explanation && (
            <div className="text-sm leading-relaxed" style={{ color: '#555555' }}>
              💡 {problem.explanation}
            </div>
          )}
        </div>

        {/* Footer hint - removed since we have sidebar */}
        <div 
          className="px-6 py-3 text-center text-sm"
          style={{ 
            background: 'rgba(0,0,0,0.03)',
            color: '#16a34a',
            borderTop: '1px solid #d1fae5',
          }}
        >
          ESC: 닫기
        </div>
        </div>

        {/* Shortcuts Panel */}
        <div 
          className="w-56 rounded-xl p-4 shadow-xl flex-shrink-0"
          style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
            border: '2px solid #4a5568',
          }}
        >
          <h3 
            className="text-base font-bold mb-4 pb-2 text-center"
            style={{ 
              color: '#e2e8f0',
              borderBottom: '1px solid #4a5568'
            }}
          >
            ⌨️ 단축키
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span 
                className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold min-w-[48px]"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                Shift+1
              </span>
              <span className="text-sm" style={{ color: '#cbd5e1' }}>
                자동완성
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span 
                className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold min-w-[48px]"
                style={{ backgroundColor: '#8b5cf6', color: '#ffffff' }}
              >
                Ctrl+Z/Y
              </span>
              <span className="text-sm" style={{ color: '#cbd5e1' }}>
                되돌리기
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span 
                className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold min-w-[48px]"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
              >
                ESC
              </span>
              <span className="text-sm" style={{ color: '#cbd5e1' }}>
                닫기
              </span>
            </div>
          </div>
          
          {/* Highlighting section */}
          <div 
            className="mt-4 pt-3"
            style={{ borderTop: '1px solid #4a5568' }}
          >
            <h4 
              className="text-xs font-bold mb-2"
              style={{ color: '#94a3b8' }}
            >
              🖍️ 형광펜 (텍스트 선택 후)
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{ backgroundColor: '#fde047', color: '#1a1a1a' }}
                >
                  Ctrl+1
                </span>
                <span className="text-xs" style={{ color: '#cbd5e1' }}>S (주어)</span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{ backgroundColor: '#fde047', color: '#1a1a1a' }}
                >
                  Ctrl+2
                </span>
                <span className="text-xs" style={{ color: '#cbd5e1' }}>V (동사)</span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{ backgroundColor: '#93c5fd', color: '#1a1a1a' }}
                >
                  Ctrl+3
                </span>
                <span className="text-xs" style={{ color: '#cbd5e1' }}>목적어</span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{ backgroundColor: '#86efac', color: '#1a1a1a' }}
                >
                  Ctrl+4
                </span>
                <span className="text-xs" style={{ color: '#cbd5e1' }}>보어</span>
              </div>
            </div>
          </div>
          
          {/* Symbols section */}
          <div 
            className="mt-4 pt-3"
            style={{ borderTop: '1px solid #4a5568' }}
          >
            <h4 
              className="text-xs font-bold mb-2"
              style={{ color: '#94a3b8' }}
            >
              📌 기호 (텍스트 선택 후)
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                >
                  Alt+1
                </span>
                <span className="text-xs" style={{ color: '#cbd5e1' }}>[ ] 대괄호</span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
                >
                  Alt+2
                </span>
                <span className="text-xs" style={{ color: '#cbd5e1' }}>( ) 소괄호</span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
                >
                  Alt+3
                </span>
                <span className="text-xs" style={{ color: '#cbd5e1' }}>△ 삼각형</span>
              </div>
            </div>
          </div>
          
          {/* Navigation section */}
          <div 
            className="mt-4 pt-3"
            style={{ borderTop: '1px solid #4a5568' }}
          >
            <h4 
              className="text-xs font-bold mb-2"
              style={{ color: '#94a3b8' }}
            >
              📍 문제 이동
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span 
                  className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold min-w-[48px]"
                  style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
                >
                  ←
                </span>
                <span className="text-sm" style={{ color: '#cbd5e1' }}>
                  이전 문제
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span 
                  className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-mono font-bold min-w-[48px]"
                  style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
                >
                  →
                </span>
                <span className="text-sm" style={{ color: '#cbd5e1' }}>
                  다음 문제
                </span>
              </div>
            </div>
          </div>
          
          {/* Mouse usage section */}
          <div 
            className="mt-4 pt-3"
            style={{ borderTop: '1px solid #4a5568' }}
          >
            <h4 
              className="text-xs font-bold mb-2"
              style={{ color: '#94a3b8' }}
            >
              🖱️ 마우스
            </h4>
            <div className="space-y-1 text-xs" style={{ color: '#cbd5e1' }}>
              <p>• 단어 클릭: 단어 선택</p>
              <p>• 답안 클릭: 단어 제거</p>
              <p>• 리셋 버튼: 초기화</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for flying animation */}
      <style>{`
        @keyframes flyToAnswer {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(calc(-50% + var(--endX) * 0.5), calc(-50% + var(--endY) * 0.5 - 30px)) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--endX)), calc(-50% + var(--endY))) scale(1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
