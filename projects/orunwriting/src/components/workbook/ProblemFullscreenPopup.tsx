import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { X, RotateCcw, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface HighlightRange {
  start: number;
  end: number;
  color: string;
  label?: string;
  type?: 'bracket' | 'parenthesis' | 'triangle';
  isUnderlineLabel?: boolean; // S/V/O/C applied on already highlighted text
}

interface FlyingWord {
  id: string;
  word: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isTransformed?: boolean;
}

interface ProblemFullscreenPopupProps {
  isOpen: boolean;
  onClose: () => void;
  passage: string;
  question: string;
  options?: string;
  conditions?: string;
  answer: string | string[];
  unitNumber: number;
  unitTitle: string;
  problemNumber: number;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function ProblemFullscreenPopup({
  isOpen,
  onClose,
  passage,
  question,
  options,
  conditions,
  answer,
  unitNumber,
  unitTitle,
  problemNumber,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: ProblemFullscreenPopupProps) {
  const [highlights, setHighlights] = useState<HighlightRange[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [chalkboardNotes, setChalkboardNotes] = useState('');
  const [isMemoCollapsed, setIsMemoCollapsed] = useState(false);
  const passageRef = useRef<HTMLDivElement>(null);
  const answerAreaRef = useRef<HTMLDivElement>(null);
  const wordButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const { playCorrectSound, playWrongSound } = useSoundEffects();

  // Word bank state
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [hasPlayedCorrect, setHasPlayedCorrect] = useState(false);
  const [flyingWord, setFlyingWord] = useState<FlyingWord | null>(null);
  const [transformedWords, setTransformedWords] = useState<Set<number>>(new Set());

  // Multi-blank answer state (for A, B, C type questions)
  const [filledBlanks, setFilledBlanks] = useState<string[]>([]);

  // Unified history stack for all actions (highlights, words, blanks, multi-part words)
  type HistoryAction = 
    | { type: 'highlight'; highlights: HighlightRange[] }
    | { type: 'word'; available: string[]; selected: string[] }
    | { type: 'blank'; blanks: string[] }
    | { type: 'multipart'; partAvailable: string[][]; partSelected: string[][] };
  
  const [unifiedHistory, setUnifiedHistory] = useState<HistoryAction[]>([]);
  const [unifiedRedoHistory, setUnifiedRedoHistory] = useState<HistoryAction[]>([]);

  // Multi-part word bank state (for (A), (B) type questions)
  const [currentPart, setCurrentPart] = useState<number>(0);
  const [partSelectedWords, setPartSelectedWords] = useState<string[][]>([]);
  const [partAvailableWords, setPartAvailableWords] = useState<string[][]>([]);
  const [partCorrect, setPartCorrect] = useState<boolean[]>([]);

  // Parse options into words
  const parseOptions = (opts: string | undefined): string[] => {
    if (!opts) return [];
    return opts.split(/[\/,\s]+/).filter(w => w.trim().length > 0);
  };

  // Parse multi-part options (e.g., "(A) word1 / word2\n\n(B) word3 / word4")
  interface PartData {
    label: string;
    words: string[];
    answer: string;
  }
  
  const parseMultiPartOptions = (opts: string | undefined, ans: string | string[]): PartData[] => {
    if (!opts) return [];
    
    // Check if options contain (A), (B) patterns
    const partMatches = opts.match(/\([A-Z]\)/g);
    if (!partMatches || partMatches.length < 2) return [];
    
    const parts: PartData[] = [];
    const answerArray = Array.isArray(ans) ? ans : [ans];
    
    // Split by (A), (B), etc.
    const partRegex = /\(([A-Z])\)\s*/g;
    const splitParts = opts.split(partRegex).filter(s => s.trim());
    
    for (let i = 0; i < splitParts.length; i += 2) {
      const label = splitParts[i];
      const content = splitParts[i + 1];
      if (label && content) {
        const words = content.split(/\s*\/\s*/).map(w => w.trim()).filter(w => w.length > 0);
        // Find matching answer
        const matchingAnswer = answerArray.find(a => a.startsWith(`(${label})`)) || '';
        parts.push({
          label: `(${label})`,
          words,
          answer: matchingAnswer.replace(/^\([A-Z]\)\s*/, '').trim()
        });
      }
    }
    
    return parts;
  };

  // Extract words from conditions field (e.g., "보기: word1 / word2 / word3" or lines with slashes)
  const parseConditionsForWords = (cond: string | undefined): string[] => {
    if (!cond) return [];
    
    // Look for patterns like "보기:" or lines containing " / " separator
    const lines = cond.split('\n');
    for (const line of lines) {
      // Check if line contains word separators (/)
      if (line.includes(' / ')) {
        // Remove "보기:" prefix if present
        const cleanLine = line.replace(/^보기:\s*/, '').replace(/^다음 단어를.*:\s*/, '');
        return cleanLine.split(/\s*\/\s*/).filter(w => w.trim().length > 0);
      }
    }
    return [];
  };

  // Check if options have multiple parts - memoize to prevent infinite loops
  const multiPartData = useMemo(() => parseMultiPartOptions(options, answer), [options, answer]);
  const hasMultiPart = multiPartData.length > 1;

  // Get word bank source - prioritize options, fallback to conditions (memoized)
  const wordBankWords = useMemo(() => {
    if (hasMultiPart) return []; // Handle separately
    if (options && options.length > 0) {
      return parseOptions(options);
    }
    return parseConditionsForWords(conditions);
  }, [hasMultiPart, options, conditions]);

  // Get answer as string
  const getAnswerString = (): string => {
    if (hasMultiPart) {
      return multiPartData[currentPart]?.answer || "";
    }
    if (Array.isArray(answer)) {
      return answer[0] || "";
    }
    return answer;
  };

  const hasWordBank = wordBankWords.length > 0 || hasMultiPart;
  const hasMultipleBlanks = Array.isArray(answer) && answer.length > 1 && !hasWordBank;

  // Reset state when popup opens or problem changes
  const problemKey = `${unitNumber}-${problemNumber}`;
  const prevProblemKeyRef = useRef<string>('');
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Only reset when problem actually changes
    if (prevProblemKeyRef.current === problemKey) return;
    prevProblemKeyRef.current = problemKey;
    
    // Reset highlight state
    setHighlights([]);
    setShowAnswer(false);
    setIsCorrect(null);
    setIsWrong(false);
    setHasPlayedCorrect(false);
    setFlyingWord(null);
    setTransformedWords(new Set());
    setFilledBlanks([]);
    setUnifiedHistory([]);
    setUnifiedRedoHistory([]);
    
    // Initialize word banks
    if (hasMultiPart && multiPartData.length > 0) {
      setCurrentPart(0);
      setPartSelectedWords(multiPartData.map(() => []));
      setPartAvailableWords(multiPartData.map(p => [...p.words].sort(() => Math.random() - 0.5)));
      setPartCorrect(multiPartData.map(() => false));
      setAvailableWords([]);
      setSelectedWords([]);
    } else if (wordBankWords.length > 0) {
      const shuffled = [...wordBankWords].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setSelectedWords([]);
      setPartSelectedWords([]);
      setPartAvailableWords([]);
      setPartCorrect([]);
    } else {
      setAvailableWords([]);
      setSelectedWords([]);
      setPartSelectedWords([]);
      setPartAvailableWords([]);
      setPartCorrect([]);
    }
  }, [isOpen, problemKey, hasMultiPart, multiPartData, wordBankWords]);

  // Check answer (for single word bank)
  useEffect(() => {
    if (hasMultiPart) return; // Handle separately
    
    const answerStr = getAnswerString();
    if (!answerStr || !hasWordBank) return;

    const currentAnswer = selectedWords.join(" ");
    if (currentAnswer.length === 0) {
      setIsCorrect(null);
      setIsWrong(false);
      return;
    }

    const normalizedAnswer = answerStr.toLowerCase().replace(/[.,!?'"]/g, '').trim();
    const normalizedCurrent = currentAnswer.toLowerCase().replace(/[.,!?'"]/g, '').trim();

    if (normalizedCurrent === normalizedAnswer) {
      setIsCorrect(true);
      setIsWrong(false);
      
      if (!hasPlayedCorrect) {
        setHasPlayedCorrect(true);
        playCorrectSound();
      }
    } else {
      setIsCorrect(false);
      if (normalizedAnswer.startsWith(normalizedCurrent)) {
        setIsWrong(false);
      } else {
        if (!isWrong) {
          playWrongSound();
        }
        setIsWrong(true);
      }
    }
  }, [selectedWords, answer, hasPlayedCorrect, playCorrectSound, playWrongSound, isWrong, hasWordBank, hasMultiPart]);

  // Check multi-part answers
  useEffect(() => {
    if (!hasMultiPart) return;
    
    const newCorrect = multiPartData.map((part, idx) => {
      const selected = partSelectedWords[idx] || [];
      const currentAnswer = selected.join(" ");
      const normalizedAnswer = part.answer.toLowerCase().replace(/[.,!?'"]/g, '').trim();
      const normalizedCurrent = currentAnswer.toLowerCase().replace(/[.,!?'"]/g, '').trim();
      return normalizedCurrent === normalizedAnswer;
    });
    
    setPartCorrect(newCorrect);
    
    // Check if all parts are correct
    if (newCorrect.every(c => c) && !hasPlayedCorrect) {
      setHasPlayedCorrect(true);
      playCorrectSound();
    }
  }, [partSelectedWords, multiPartData, hasMultiPart, hasPlayedCorrect, playCorrectSound]);

  // Handle word click for multi-part
  const handleMultiPartWordClick = (word: string, index: number, partIndex: number) => {
    const newAvailable = [...partAvailableWords];
    const newSelected = [...partSelectedWords];
    newAvailable[partIndex] = newAvailable[partIndex].filter((_, i) => i !== index);
    newSelected[partIndex] = [...(newSelected[partIndex] || []), word];
    setPartAvailableWords(newAvailable);
    setPartSelectedWords(newSelected);
  };

  // Handle removing word from multi-part answer
  const handleMultiPartRemoveWord = (wordIndex: number, partIndex: number) => {
    const newAvailable = [...partAvailableWords];
    const newSelected = [...partSelectedWords];
    const word = newSelected[partIndex][wordIndex];
    newSelected[partIndex] = newSelected[partIndex].filter((_, i) => i !== wordIndex);
    newAvailable[partIndex] = [...newAvailable[partIndex], word];
    setPartAvailableWords(newAvailable);
    setPartSelectedWords(newSelected);
  };

  // Reset multi-part word bank
  const handleMultiPartReset = (partIndex: number) => {
    const newAvailable = [...partAvailableWords];
    const newSelected = [...partSelectedWords];
    newAvailable[partIndex] = [...multiPartData[partIndex].words].sort(() => Math.random() - 0.5);
    newSelected[partIndex] = [];
    setPartAvailableWords(newAvailable);
    setPartSelectedWords(newSelected);
  };

  // Handle word click (single word bank)
  const handleWordClick = (word: string, index: number) => {
    setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
    setUnifiedRedoHistory([]);
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  // Handle removing word from answer (single word bank)
  const handleRemoveWord = (index: number) => {
    setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
    setUnifiedRedoHistory([]);
    const word = selectedWords[index];
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, word]);
    setTransformedWords(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      const adjusted = new Set<number>();
      newSet.forEach(i => {
        if (i > index) adjusted.add(i - 1);
        else adjusted.add(i);
      });
      return adjusted;
    });
  };

  // Reset word bank (single)
  const handleResetWords = () => {
    if (hasMultiPart) {
      setPartAvailableWords(multiPartData.map(p => [...p.words].sort(() => Math.random() - 0.5)));
      setPartSelectedWords(multiPartData.map(() => []));
      setCurrentPart(0);
    } else if (wordBankWords.length > 0) {
      const shuffled = [...wordBankWords].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }
    setSelectedWords([]);
    setIsCorrect(null);
    setIsWrong(false);
    setHasPlayedCorrect(false);
    setFlyingWord(null);
    setTransformedWords(new Set());
  };


  // Unified Undo
  const undoAction = useCallback(() => {
    if (unifiedHistory.length === 0) return;
    
    const lastAction = unifiedHistory[unifiedHistory.length - 1];
    
    if (lastAction.type === 'highlight') {
      setUnifiedRedoHistory(prev => [...prev, { type: 'highlight', highlights: [...highlights] }]);
      setHighlights(lastAction.highlights);
    } else if (lastAction.type === 'word') {
      setUnifiedRedoHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
      setAvailableWords(lastAction.available);
      setSelectedWords(lastAction.selected);
    } else if (lastAction.type === 'blank') {
      setUnifiedRedoHistory(prev => [...prev, { type: 'blank', blanks: [...filledBlanks] }]);
      setFilledBlanks(lastAction.blanks);
    } else if (lastAction.type === 'multipart') {
      setUnifiedRedoHistory(prev => [...prev, { type: 'multipart', partAvailable: partAvailableWords.map(arr => [...arr]), partSelected: partSelectedWords.map(arr => [...arr]) }]);
      setPartAvailableWords(lastAction.partAvailable);
      setPartSelectedWords(lastAction.partSelected);
    }
    
    setUnifiedHistory(prev => prev.slice(0, -1));
  }, [unifiedHistory, highlights, availableWords, selectedWords, filledBlanks, partAvailableWords, partSelectedWords]);

  // Unified Redo
  const redoAction = useCallback(() => {
    if (unifiedRedoHistory.length === 0) return;
    
    const nextAction = unifiedRedoHistory[unifiedRedoHistory.length - 1];
    
    if (nextAction.type === 'highlight') {
      setUnifiedHistory(prev => [...prev, { type: 'highlight', highlights: [...highlights] }]);
      setHighlights(nextAction.highlights);
    } else if (nextAction.type === 'word') {
      setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
      setAvailableWords(nextAction.available);
      setSelectedWords(nextAction.selected);
    } else if (nextAction.type === 'blank') {
      setUnifiedHistory(prev => [...prev, { type: 'blank', blanks: [...filledBlanks] }]);
      setFilledBlanks(nextAction.blanks);
    } else if (nextAction.type === 'multipart') {
      setUnifiedHistory(prev => [...prev, { type: 'multipart', partAvailable: partAvailableWords.map(arr => [...arr]), partSelected: partSelectedWords.map(arr => [...arr]) }]);
      setPartAvailableWords(nextAction.partAvailable);
      setPartSelectedWords(nextAction.partSelected);
    }
    
    setUnifiedRedoHistory(prev => prev.slice(0, -1));
  }, [unifiedRedoHistory, highlights, availableWords, selectedWords, filledBlanks, partAvailableWords, partSelectedWords]);

  // Get selection range within passage - use data-start-index for accurate offset
  const getSelectionRange = useCallback((): { start: number; end: number } | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    const passageElement = passageRef.current;
    if (!passageElement) return null;

    if (!passageElement.contains(range.commonAncestorContainer)) return null;

    // Get the selected text
    const selectedText = range.toString();
    if (!selectedText) return null;

    // Find original passage offset using data-start-index
    const getOriginalOffset = (targetNode: Node, targetOffset: number): number => {
      // Find the parent span with data-start-index
      let current: Node | null = targetNode;
      while (current && current !== passageElement) {
        if (current instanceof HTMLElement) {
          // Skip decorator elements
          if (current.hasAttribute('data-decorator')) {
            return -1; // Signal that we're in a decorator
          }
          
          if (current.hasAttribute('data-start-index')) {
            const startIndex = parseInt(current.getAttribute('data-start-index') || '0', 10);
            
            // Calculate offset within this span by walking text nodes
            const walker = document.createTreeWalker(current, NodeFilter.SHOW_TEXT, null);
            let internalOffset = 0;
            let node: Text | null;
            
            while ((node = walker.nextNode() as Text | null)) {
              // Skip decorator text nodes
              const parent = node.parentElement;
              if (parent?.hasAttribute('data-decorator')) continue;
              
              if (node === targetNode) {
                return startIndex + internalOffset + targetOffset;
              }
              internalOffset += node.textContent?.length || 0;
            }
            
            // If we didn't find the exact node, return based on position
            return startIndex + targetOffset;
          }
        }
        current = current.parentNode;
      }
      
      // Fallback: walk from start
      const walker = document.createTreeWalker(passageElement, NodeFilter.SHOW_TEXT, null);
      let offset = 0;
      let node: Text | null;
      
      while ((node = walker.nextNode() as Text | null)) {
        const parent = node.parentElement;
        if (parent?.hasAttribute('data-decorator')) continue;
        
        if (node === targetNode) {
          return offset + targetOffset;
        }
        offset += node.textContent?.length || 0;
      }
      
      return offset;
    };

    const startOffset = getOriginalOffset(range.startContainer, range.startOffset);
    const endOffset = getOriginalOffset(range.endContainer, range.endOffset);

    // If either offset is in a decorator, return null
    if (startOffset === -1 || endOffset === -1) return null;

    return { start: Math.min(startOffset, endOffset), end: Math.max(startOffset, endOffset) };
  }, []);

  // Apply highlight
  const applyHighlight = useCallback((color: string, label?: string, type?: 'bracket' | 'parenthesis' | 'triangle') => {
    const selectionRange = getSelectionRange();
    if (!selectionRange) return;

    // Save current state to history BEFORE making changes
    setUnifiedHistory(prev => [...prev, { type: 'highlight', highlights: [...highlights] }]);
    setUnifiedRedoHistory([]);

    // Check if the selection overlaps with existing highlights (for S/V/O/C labels)
    const overlappingHighlights = highlights.filter(h => 
      !(h.end <= selectionRange.start || h.start >= selectionRange.end)
    );
    
    // If there's an overlapping highlight and we're applying a label (S/V/O/C), use underline style
    const hasExistingHighlight = overlappingHighlights.length > 0 && !type;
    const isLabelApplication = !!label && ['S', 'V', 'O', 'C'].some(l => label.startsWith(l));
    
    const newHighlight: HighlightRange = {
      ...selectionRange,
      color: hasExistingHighlight && isLabelApplication ? 'transparent' : color,
      label,
      type,
      isUnderlineLabel: hasExistingHighlight && isLabelApplication,
    };

    // If applying underline label, keep the existing highlight and add new one
    let newHighlights: HighlightRange[];
    if (hasExistingHighlight && isLabelApplication) {
      newHighlights = [...highlights, newHighlight].sort((a, b) => a.start - b.start);
    } else {
      const filteredHighlights = highlights.filter(h => 
        h.end <= selectionRange.start || h.start >= selectionRange.end
      );
      newHighlights = [...filteredHighlights, newHighlight].sort((a, b) => a.start - b.start);
    }
    
    setHighlights(newHighlights);
    window.getSelection()?.removeAllRanges();
  }, [highlights, getSelectionRange]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if focus is on the chalkboard textarea - allow normal behavior for arrow keys and tilde
      const activeElement = document.activeElement;
      const isChalkboardFocused = activeElement?.tagName === 'TEXTAREA';
      
      // If chalkboard is focused, allow arrow keys and tilde to work normally
      if (isChalkboardFocused) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.stopPropagation();
          return; // Let the textarea handle arrow keys
        }
        if (e.key === '`' || e.key === '~') {
          e.stopPropagation();
          return; // Let the textarea handle tilde (handled by onKeyDown in textarea)
        }
      }
      
      // Shift+1 for multi-blank answers (A, B, C type)
      if (e.shiftKey && e.key === '!' && hasMultipleBlanks) {
        e.preventDefault();
        
        const answerArray = answer as string[];
        const nextIndex = filledBlanks.length;
        if (nextIndex >= answerArray.length) return;
        
        // Save to unified history
        setUnifiedHistory(prev => [...prev, { type: 'blank', blanks: [...filledBlanks] }]);
        setUnifiedRedoHistory([]);
        
        // Add next answer
        setFilledBlanks(prev => [...prev, answerArray[nextIndex]]);
        
        // Play sound if all blanks filled
        if (nextIndex === answerArray.length - 1) {
          playCorrectSound();
        }
        return;
      }

      // Shift+1 for auto-selecting next correct word (multi-part word bank)
      if (e.shiftKey && e.key === '!' && hasMultiPart) {
        e.preventDefault();
        
        // Find first incomplete part
        let targetPart = -1;
        for (let i = 0; i < multiPartData.length; i++) {
          if (!partCorrect[i]) {
            targetPart = i;
            break;
          }
        }
        
        if (targetPart === -1) return; // All parts complete
        
        const partData = multiPartData[targetPart];
        const currentSelected = partSelectedWords[targetPart] || [];
        const currentAvailable = partAvailableWords[targetPart] || [];
        
        const answerWords = partData.answer.split(/\s+/).filter(w => w.length > 0);
        const coveredWordCount = currentSelected.reduce((count, hint) => {
          return count + hint.split(/\s+/).length;
        }, 0);
        
        const nextIndex = coveredWordCount;
        if (nextIndex >= answerWords.length) return;
        
        const nextCorrectWord = answerWords[nextIndex];
        const normalizedNextWord = nextCorrectWord.toLowerCase().replace(/[.,!?'"]/g, '');
        
        // Find matching word in available words
        let availableIndex = currentAvailable.findIndex(
          w => w.toLowerCase().replace(/[.,!?'"]/g, '') === normalizedNextWord
        );
        
        // Try partial match (only for words longer than 3 characters)
        if (availableIndex === -1 && normalizedNextWord.length > 3) {
          availableIndex = currentAvailable.findIndex(w => {
            const normalizedHint = w.toLowerCase().replace(/[.,!?'"]/g, '');
            // Skip partial matching for short words
            if (normalizedHint.length <= 3) return false;
            
            const minMatchLength = Math.min(4, normalizedHint.length, normalizedNextWord.length);
            return normalizedNextWord.startsWith(normalizedHint.slice(0, minMatchLength)) ||
                   normalizedHint.startsWith(normalizedNextWord.slice(0, minMatchLength));
          });
        }
        
        if (availableIndex !== -1) {
          // Save to unified history BEFORE making changes
          setUnifiedHistory(prev => [...prev, { type: 'multipart', partAvailable: partAvailableWords.map(arr => [...arr]), partSelected: partSelectedWords.map(arr => [...arr]) }]);
          setUnifiedRedoHistory([]);
          
          const word = currentAvailable[availableIndex];
          const useWord = word.toLowerCase().replace(/[.,!?'"]/g, '') !== normalizedNextWord ? nextCorrectWord : word;
          
          const newAvailable = [...partAvailableWords];
          const newSelected = [...partSelectedWords];
          newAvailable[targetPart] = currentAvailable.filter((_, i) => i !== availableIndex);
          newSelected[targetPart] = [...currentSelected, useWord];
          setPartAvailableWords(newAvailable);
          setPartSelectedWords(newSelected);
        }
        return;
      }

      // Shift+1 for auto-selecting next correct word (single word bank)
      if (e.shiftKey && e.key === '!' && hasWordBank && !hasMultiPart) {
        if (flyingWord) return;
        e.preventDefault();
        
        const answerStr = getAnswerString();
        if (!answerStr) return;

        const answerWords = answerStr.split(/\s+/).filter(w => w.length > 0);
        const coveredWordCount = selectedWords.reduce((count, hint) => {
          return count + hint.split(/\s+/).length;
        }, 0);

        const nextIndex = coveredWordCount;
        if (nextIndex >= answerWords.length) return;

        const nextCorrectWord = answerWords[nextIndex];
        const normalizedNextWord = nextCorrectWord.toLowerCase().replace(/[.,!?'"]/g, '');

        let availableIndex = -1;

        // Check multi-word hints
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

        // Try exact single-word match
        if (availableIndex === -1) {
          availableIndex = availableWords.findIndex(
            w => w.toLowerCase().replace(/[.,!?'"]/g, '') === normalizedNextWord
          );
        }

        // Try partial match (only for words longer than 3 characters to avoid matching short words like "the" with "time")
        if (availableIndex === -1 && normalizedNextWord.length > 3) {
          availableIndex = availableWords.findIndex(w => {
            const hintWords = w.split(/\s+/);
            if (hintWords.length > 1) return false;

            const normalizedHint = w.toLowerCase().replace(/[.,!?'"]/g, '');
            // Skip partial matching for short words
            if (normalizedHint.length <= 3) return false;
            
            const minMatchLength = Math.min(4, normalizedHint.length, normalizedNextWord.length);
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
            }, 150);
          } else {
            setUnifiedHistory(prev => [...prev, { type: 'word', available: [...availableWords], selected: [...selectedWords] }]);
            setUnifiedRedoHistory([]);
            setAvailableWords(prev => prev.filter((_, i) => i !== availableIndex));
            setSelectedWords(prev => [...prev, useWord]);
            if (isTransformed) {
              setTransformedWords(prev => new Set([...prev, selectedWords.length]));
            }
          }
        }
        return;
      }

      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoAction();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redoAction();
        return;
      }

      // Ctrl+1: S marker, yellow
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        applyHighlight('#ffff00', 'S');
        return;
      }

      // Ctrl+2: V marker, yellow
      if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        applyHighlight('#ffff00', 'V');
        return;
      }

      // Ctrl+3: O marker, light yellow
      if (e.ctrlKey && e.key === '3') {
        e.preventDefault();
        applyHighlight('#fffacd', 'O');
        return;
      }

      // Ctrl+4: C marker, light yellow
      if (e.ctrlKey && e.key === '4') {
        e.preventDefault();
        applyHighlight('#fffacd', 'C');
        return;
      }

      // Alt+1: brackets, green
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        applyHighlight('#90ee90', undefined, 'bracket');
        return;
      }

      // Alt+2: parenthesis, gray
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        applyHighlight('#d3d3d3', undefined, 'parenthesis');
        return;
      }

      // Alt+3: triangle marker, red outline
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        applyHighlight('transparent', undefined, 'triangle');
        return;
      }

      // ~ key: toggle answer
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setShowAnswer(prev => !prev);
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

      // Escape: close popup
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, undoAction, redoAction, applyHighlight, onClose, hasWordBank, hasMultipleBlanks, hasMultiPart, multiPartData, partSelectedWords, partAvailableWords, partCorrect, flyingWord, availableWords, selectedWords, unifiedHistory, unifiedRedoHistory, answer, hasPrevious, hasNext, onPrevious, onNext, filledBlanks, playCorrectSound]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Render passage with highlights - add data-start-index for accurate offset calculation
  const renderPassageWithHighlights = () => {
    if (highlights.length === 0) {
      return <span data-start-index="0">{passage}</span>;
    }

    // Separate underline labels from regular highlights
    const underlineLabels = highlights.filter(h => h.isUnderlineLabel);
    const regularHighlights = highlights.filter(h => !h.isUnderlineLabel);

    // Build character-level info for rendering
    interface CharInfo {
      color: string | null;
      type?: 'bracket' | 'parenthesis' | 'triangle';
      label?: string;
      underlineLabel?: string;
    }
    
    const charInfo: CharInfo[] = Array(passage.length).fill(null).map(() => ({ color: null }));
    
    // Apply regular highlights first
    regularHighlights.forEach(highlight => {
      for (let i = highlight.start; i < highlight.end && i < passage.length; i++) {
        charInfo[i] = { 
          color: highlight.color, 
          type: highlight.type,
          label: i === highlight.start ? highlight.label : undefined,
        };
      }
    });
    
    // Apply underline labels (overlay on existing)
    underlineLabels.forEach(highlight => {
      for (let i = highlight.start; i < highlight.end && i < passage.length; i++) {
        charInfo[i].underlineLabel = i === highlight.start ? highlight.label : (charInfo[i].underlineLabel || '');
      }
    });

    const result: React.ReactNode[] = [];
    let i = 0;

    while (i < passage.length) {
      const info = charInfo[i];
      
      // Find the end of the current segment
      let j = i + 1;
      while (j < passage.length) {
        const nextInfo = charInfo[j];
        // Break if any property changes
        if (nextInfo.color !== info.color || 
            nextInfo.type !== info.type || 
            nextInfo.label || 
            nextInfo.underlineLabel ||
            (info.underlineLabel && j >= i + 1)) {
          break;
        }
        j++;
      }

      // First check for special highlights (bracket/parenthesis/triangle) - these take priority
      if (info.type === 'bracket' || info.type === 'parenthesis' || info.type === 'triangle') {
        // Find the full extent of this special highlight
        const typeHighlight = regularHighlights.find(h => h.type === info.type && h.start === i);
        if (typeHighlight) {
          const specialEnd = typeHighlight.end;
          
          // Render inner content with possible underline labels
          const innerElements: React.ReactNode[] = [];
          let innerIdx = i;
          
          while (innerIdx < specialEnd) {
            const innerInfo = charInfo[innerIdx];
            
            if (innerInfo.underlineLabel) {
              // Render underline label within special range
              const underlineHighlight = underlineLabels.find(h => h.start === innerIdx);
              const underlineEnd = Math.min(underlineHighlight?.end || innerIdx + 1, specialEnd);
              const underlineText = passage.slice(innerIdx, underlineEnd);
              
              innerElements.push(
                <span
                  key={`underline-inner-${innerIdx}`}
                  className="relative inline"
                  data-start-index={innerIdx}
                >
                  <span style={{ borderBottom: '4px solid #1e40af', paddingBottom: '4px' }}>
                    {underlineText}
                  </span>
                  <span 
                    className="absolute left-1/2 -translate-x-1/2 text-[18px] font-black whitespace-nowrap pointer-events-none"
                    style={{ 
                      bottom: '-28px', 
                      color: '#1e40af',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                    data-decorator="true"
                  >
                    {innerInfo.underlineLabel}
                  </span>
                </span>
              );
              innerIdx = underlineEnd;
            } else {
              // Regular text within special range
              let endIdx = innerIdx + 1;
              while (endIdx < specialEnd && !charInfo[endIdx].underlineLabel) {
                endIdx++;
              }
              const regularText = passage.slice(innerIdx, endIdx);
              innerElements.push(
                <span key={`regular-inner-${innerIdx}`} data-start-index={innerIdx}>
                  {regularText}
                </span>
              );
              innerIdx = endIdx;
            }
          }

          if (info.type === 'bracket') {
            result.push(
              <span 
                key={`highlight-${i}`}
                className="relative"
                style={{ backgroundColor: info.color || 'transparent' }}
              >
                <span className="text-green-700 font-bold" data-decorator="true">[</span>
                {innerElements}
                <span className="text-green-700 font-bold" data-decorator="true">]</span>
              </span>
            );
          } else if (info.type === 'parenthesis') {
            result.push(
              <span 
                key={`highlight-${i}`}
                className="relative"
                style={{ backgroundColor: info.color || 'transparent' }}
              >
                <span className="text-purple-700 font-bold" data-decorator="true">(</span>
                {innerElements}
                <span className="text-purple-700 font-bold" data-decorator="true">)</span>
              </span>
            );
          } else if (info.type === 'triangle') {
            result.push(
              <span 
                key={`highlight-${i}`}
                className="relative inline"
                style={{ backgroundColor: info.color || 'transparent' }}
              >
                {innerElements}
                <span 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-bold pointer-events-none"
                  style={{ fontSize: '1.2em' }}
                  data-decorator="true"
                >
                  △
                </span>
              </span>
            );
          }
          
          i = specialEnd;
          continue;
        }
      }

      // If we have an underline label (outside of special highlights), render it
      if (info.underlineLabel) {
        // Find end of underline segment
        const underlineEnd = underlineLabels.find(h => h.start === i)?.end || j;
        const segmentText = passage.slice(i, underlineEnd);
        
        const content = (
          <span 
            key={`underline-${i}`}
            className="relative inline"
          >
            <span 
              data-start-index={i}
              style={{ 
                borderBottom: '4px solid #1e40af',
                paddingBottom: '4px',
              }}
            >
              {segmentText}
            </span>
            <span 
              className="absolute left-1/2 -translate-x-1/2 text-[18px] font-black whitespace-nowrap pointer-events-none"
              style={{ 
                bottom: '-28px',
                color: '#1e40af',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              data-decorator="true"
            >
              {info.underlineLabel}
            </span>
          </span>
        );

        // Wrap with background color if exists
        if (info.color && info.color !== 'transparent') {
          result.push(
            <span key={`bg-${i}`} style={{ backgroundColor: info.color }}>
              {content}
            </span>
          );
        } else {
          result.push(content);
        }
        
        i = underlineEnd;
        continue;
      }

      const segmentText = passage.slice(i, j);

      if (info.color) {
        result.push(
          <span 
            key={`highlight-${i}`}
            className="relative inline-block"
            style={{ 
              backgroundColor: info.color,
              marginTop: info.label ? '28px' : '0',
            }}
          >
            {info.label && (
              <span 
                className="absolute left-1/2 -translate-x-1/2 text-[13px] font-black px-2 py-0.5 rounded-md shadow-md whitespace-nowrap"
                style={{ 
                  bottom: '100%',
                  marginBottom: '4px',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                  color: '#fff',
                  border: '2px solid #c9a227',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  zIndex: 10,
                }}
                data-decorator="true"
              >
                {info.label}
              </span>
            )}
            <span data-start-index={i}>{segmentText}</span>
          </span>
        );
      } else {
        result.push(
          <span key={`text-${i}`} data-start-index={i}>
            {segmentText}
          </span>
        );
      }

      i = j;
    }

    return result;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Flying word animation */}
      {flyingWord && (
        <div
          className="fixed z-[300] pointer-events-none"
          style={{
            left: flyingWord.startX,
            top: flyingWord.startY,
            transform: 'translate(-50%, -50%)',
            animation: 'flyToAnswer 0.15s ease-out forwards',
            '--endX': `${flyingWord.endX - flyingWord.startX}px`,
            '--endY': `${flyingWord.endY - flyingWord.startY}px`,
          } as React.CSSProperties}
        >
          <span 
            className={`inline-block px-4 py-2 rounded-lg text-xl font-bold shadow-lg ${
              flyingWord.isTransformed
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
            }`}
          >
            {flyingWord.word}
          </span>
        </div>
      )}

      {/* Navigation buttons */}
      {hasPrevious && onPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          title="이전 문제 (←)"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      )}
      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-96 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          title="다음 문제 (→)"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      )}

      {/* ESC 안내 - 닫기 버튼 대신 */}
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-sm z-10">
        ESC로 닫기
      </div>

      {/* Main content wrapper - 가로 배치, 칠판 아래 */}
      <div className="flex flex-col items-center gap-4 w-full px-6 overflow-visible">
        {/* 문제 영역 - 가로로 넓게 */}
        <div 
          className="bg-white shadow-2xl flex-shrink-0 w-full"
          style={{
            maxWidth: '95vw',
            padding: '24px 40px',
          }}
        >
        {/* Gold border frame */}
        <div 
          className="relative h-full"
          style={{
            border: '2px solid #c9a227',
            padding: '16px',
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between mb-6 pb-3"
            style={{ borderBottom: '2px solid #c9a227' }}
          >
            <div className="flex items-center gap-3">
              <span 
                className="px-3 py-1.5 text-sm font-bold rounded"
                style={{ backgroundColor: '#0f1419', color: '#c9a227' }}
              >
                Unit {unitNumber}
              </span>
              <h3 className="text-lg font-bold" style={{ color: '#0f1419' }}>
                {unitTitle}
              </h3>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#8b6914' }}>
              문제 {problemNumber}
            </span>
          </div>

          {/* Passage */}
          <div 
            ref={passageRef}
            className="mb-6 p-6 rounded-lg select-text"
            style={{ 
              backgroundColor: '#f8f6f1',
              border: '1px solid #e5e0d5',
            }}
          >
            <p 
              className="text-[24px] leading-[2.2] text-justify whitespace-pre-wrap font-semibold"
              style={{ color: '#1a1a1a' }}
            >
              {renderPassageWithHighlights()}
            </p>
          </div>

          {/* Question */}
          <div className="mb-4">
            <p 
              className="whitespace-pre-line text-[22px] leading-[2] text-justify font-semibold"
              style={{ color: '#1a1a1a' }}
            >
              {question}
            </p>
          </div>

          {/* Multi-Part Word Bank - for (A), (B) type questions */}
          {hasMultiPart && (
            <div className="space-y-4 mb-4">
              {multiPartData.map((part, partIndex) => {
                const currentAvailable = partAvailableWords[partIndex] || [];
                const currentSelected = partSelectedWords[partIndex] || [];
                const isPartCorrect = partCorrect[partIndex];
                
                return (
                  <div key={partIndex} className="rounded-lg overflow-hidden" style={{ border: '1px solid #c9a227' }}>
                    {/* Part Header & Word Bank */}
                    <div 
                      className="p-3"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(139,105,20,0.12) 100%)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span 
                          className="inline-block px-3 py-1.5 rounded-md text-base font-extrabold"
                          style={{ backgroundColor: '#0f1419', color: '#ffd700' }}
                        >
                          {part.label}
                        </span>
                        <button
                          onClick={() => handleMultiPartReset(partIndex)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-colors hover:bg-amber-100"
                          style={{ color: '#8b6914' }}
                        >
                          <RotateCcw className="w-4 h-4" />
                          초기화
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {currentAvailable.map((word, wordIndex) => (
                          <button
                            key={`${partIndex}-${word}-${wordIndex}`}
                            onClick={() => handleMultiPartWordClick(word, wordIndex, partIndex)}
                            className="px-3 py-2 rounded-lg text-xl font-bold transition-all hover:scale-105 hover:shadow-lg"
                            style={{
                              background: 'white',
                              border: '2.5px solid #c9a227',
                              color: '#3d2e0a',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                          >
                            {word}
                          </button>
                        ))}
                        {currentAvailable.length === 0 && currentSelected.length > 0 && (
                          <span className="text-base font-semibold italic" style={{ color: '#8b6914' }}>
                            모든 단어 사용됨
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Part Answer Area */}
                    <div 
                      className={`min-h-[60px] p-4 transition-all ${isPartCorrect ? 'ring-2 ring-green-500' : ''}`}
                      style={{ 
                        background: isPartCorrect 
                          ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                          : 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
                        borderTop: `2px dashed ${isPartCorrect ? '#22c55e' : '#c9a227'}`,
                      }}
                    >
                      {currentSelected.length === 0 ? (
                        <span className="text-lg italic font-medium" style={{ color: '#8b6914' }}>
                          {part.label} 답안 작성...
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {currentSelected.map((word, wordIndex) => (
                            <button
                              key={`selected-${partIndex}-${word}-${wordIndex}`}
                              onClick={() => handleMultiPartRemoveWord(wordIndex, partIndex)}
                              className="px-4 py-2 rounded-lg text-2xl font-extrabold transition-all hover:scale-95 hover:opacity-80 shadow-md"
                              style={{
                                background: 'linear-gradient(135deg, #0f1419 0%, #1a1a2e 100%)',
                                color: '#ffd700',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              }}
                              title="클릭하여 제거"
                            >
                              {word}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Single Word Bank - if options exist and not multi-part */}
          {hasWordBank && !hasMultiPart && (
            <div 
              className="mb-4 p-4 rounded-lg"
              style={{ 
                background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(139,105,20,0.12) 100%)',
                border: '1px solid #c9a227',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="inline-block px-2 py-1 rounded text-xs font-bold"
                  style={{ backgroundColor: '#0f1419', color: '#c9a227' }}
                >
                  보기
                </span>
                <button
                  onClick={handleResetWords}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-amber-100"
                  style={{ color: '#8b6914' }}
                >
                  <RotateCcw className="w-3 h-3" />
                  초기화
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {availableWords.map((word, index) => (
                  <button
                    key={`${word}-${index}`}
                    ref={el => {
                      if (el) wordButtonRefs.current.set(index, el);
                      else wordButtonRefs.current.delete(index);
                    }}
                    onClick={() => handleWordClick(word, index)}
                    className="px-5 py-3 rounded-lg text-2xl font-bold transition-all hover:scale-105 hover:shadow-md"
                    style={{
                      background: 'white',
                      border: '3px solid #c9a227',
                      color: '#3d2e0a',
                    }}
                  >
                    {word}
                  </button>
                ))}
                {availableWords.length === 0 && selectedWords.length > 0 && (
                  <span className="text-sm italic" style={{ color: '#8b6914' }}>
                    모든 단어가 사용되었습니다
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Answer Area with selected words - single word bank only */}
          {hasWordBank && !hasMultiPart && (
            <div 
              ref={answerAreaRef}
              className={`min-h-[80px] rounded-lg p-4 mb-4 transition-all ${
                isWrong ? 'ring-2 ring-red-400' : ''
              } ${isCorrect ? 'ring-2 ring-green-500' : ''}`}
              style={{ 
                background: isCorrect 
                  ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                  : isWrong 
                    ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                    : 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
                border: `2px dashed ${isCorrect ? '#22c55e' : isWrong ? '#f87171' : '#c9a227'}`,
              }}
            >
              {selectedWords.length === 0 ? (
                <span className="text-xl italic font-medium" style={{ color: '#8b6914' }}>
                  단어를 클릭하거나 Shift+1을 눌러 답을 작성하세요...
                </span>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {selectedWords.map((word, index) => (
                    <button
                      key={`selected-${word}-${index}`}
                      onClick={() => handleRemoveWord(index)}
                      className={`px-6 py-4 rounded-xl text-4xl font-extrabold transition-all hover:scale-95 hover:opacity-80 shadow-lg ${
                        transformedWords.has(index) ? 'ring-3 ring-amber-300' : ''
                      }`}
                      style={{
                        background: transformedWords.has(index)
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                          : 'linear-gradient(135deg, #0f1419 0%, #1a1a2e 100%)',
                        color: transformedWords.has(index) ? '#ffffff' : '#ffd700',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
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

          {/* Conditions */}
          {conditions && (
            <div 
              className="mb-4 p-4 rounded-lg text-[13px] leading-[2]"
              style={{ 
                backgroundColor: '#fff8e7',
                border: '1px solid #e5d9c3',
              }}
            >
              <span className="font-bold" style={{ color: '#8b6914' }}>[조건] </span>
              <span className="whitespace-pre-wrap" style={{ color: '#333333' }}>{conditions}</span>
            </div>
          )}

          {/* Multi-blank answer area (A, B, C type) */}
          {hasMultipleBlanks && (
            <div 
              className="mb-4 p-4 rounded-lg"
              style={{ 
                border: '2px dashed #c9a227',
                backgroundColor: filledBlanks.length === (answer as string[]).length ? '#dcfce7' : '#fafafa',
              }}
            >
              <div className="space-y-3">
                {(answer as string[]).map((_, index) => {
                  const label = String.fromCharCode(65 + index); // A, B, C...
                  const isFilled = index < filledBlanks.length;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span 
                        className="font-bold text-lg min-w-[30px]"
                        style={{ color: isFilled ? '#166534' : '#8b6914' }}
                      >
                        ({label})
                      </span>
                      <div 
                        className={`flex-1 px-4 py-2 rounded-lg text-lg font-medium transition-all ${
                          isFilled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isFilled ? filledBlanks[index] : 'Shift+1을 눌러 정답 채우기...'}
                      </div>
                    </div>
                  );
                })}
              </div>
              {filledBlanks.length === (answer as string[]).length && (
                <div className="mt-3 text-center text-green-600 font-bold">
                  ✓ 모든 빈칸이 채워졌습니다!
                </div>
              )}
            </div>
          )}

          {/* Show answer (toggle with ~) - for non-wordbank, non-multiblank */}
          {!hasWordBank && !hasMultipleBlanks && (
            <div 
              className="min-h-[100px] rounded-lg p-4"
              style={{ 
                border: '2px dashed #c9a227',
                backgroundColor: '#fafafa',
              }}
            >
              {showAnswer ? (
                <div className="text-[14px] leading-relaxed" style={{ color: '#1a1a1a' }}>
                  <span className="font-bold" style={{ color: '#8b6914' }}>[정답] </span>
                  {Array.isArray(answer) ? answer.join(' / ') : answer}
                </div>
              ) : (
                <div className="text-center text-gray-400 text-sm">
                  답안 작성 영역 (~ 키를 눌러 정답 확인)
                </div>
              )}
            </div>
          )}

          {/* Keyboard shortcuts guide */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-[10px] text-gray-500 text-center">
              <span className="font-semibold">단축키:</span>{" "}
              {(hasWordBank || hasMultipleBlanks) && "Shift+1: 정답 자동 선택 | "}
              Ctrl+1(S), Ctrl+2(V): 노란색 | Ctrl+3(O), Ctrl+4(C): 연노랑 | 
              Alt+1: [대괄호] 초록 | Alt+2: (소괄호) 회색 | Alt+3: △세모 | 
              ~: 정답 | Ctrl+Z: 취소 | Ctrl+Y: 다시 | ESC: 닫기
            </p>
          </div>
        </div>
      </div>

        {/* Chalkboard - 접기/펼치기 가능 */}
        <div 
          className="flex-shrink-0 shadow-2xl rounded-lg overflow-hidden w-full relative transition-all duration-300"
          style={{
            maxWidth: '95vw',
            height: isMemoCollapsed ? 'auto' : '14vh',
            background: 'linear-gradient(145deg, #2d4a3e 0%, #1a3029 50%, #0f1f1a 100%)',
            border: '8px solid #5c4033',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Chalkboard header - 클릭하면 접기/펼치기 */}
          <div 
            className="px-4 py-1 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
            style={{
              background: 'linear-gradient(to bottom, #6b5344, #5c4033)',
              borderBottom: isMemoCollapsed ? 'none' : '2px solid #4a3728',
            }}
            onClick={() => setIsMemoCollapsed(!isMemoCollapsed)}
          >
            <span className="text-white/90 text-sm font-medium tracking-wide">📝 칠판 메모장</span>
            <span className="ml-2 text-white/70">
              {isMemoCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </span>
          </div>
          
          {/* Chalkboard writing area - 접힌 상태에서는 숨김 */}
          {!isMemoCollapsed && (
            <>
              <textarea
                value={chalkboardNotes}
                onChange={(e) => setChalkboardNotes(e.target.value)}
                onKeyDown={(e) => {
                  // Handle Shift + ` to insert tilde (~)
                  // Check for backtick key with shift modifier
                  if (e.shiftKey && (e.key === '`' || e.code === 'Backquote')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const textarea = e.currentTarget;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const newValue = chalkboardNotes.substring(0, start) + '~' + chalkboardNotes.substring(end);
                    setChalkboardNotes(newValue);
                    // Set cursor position after the inserted tilde
                    requestAnimationFrame(() => {
                      textarea.selectionStart = textarea.selectionEnd = start + 1;
                    });
                  }
                }}
                placeholder="여기에 메모를 작성하세요..."
                className="w-full h-[calc(100%-32px)] p-3 resize-none focus:outline-none"
                style={{
                  background: 'transparent',
                  color: '#e8e8e8',
                  fontFamily: '"Noto Sans KR", sans-serif',
                  fontWeight: 700,
                  fontSize: '36px',
                  lineHeight: '1.5',
                  textShadow: '0 0 2px rgba(255,255,255,0.3)',
                  caretColor: '#ffffff',
                }}
              />
              
              {/* Chalk dust effect at bottom */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(255,255,255,0.05), transparent)',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Flying word animation CSS */}
      <style>{`
        @keyframes flyToAnswer {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(
              calc(-50% + var(--endX) / 2),
              calc(-50% + var(--endY) / 2 - 30px)
            ) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(-50% + var(--endX)),
              calc(-50% + var(--endY))
            ) scale(1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
