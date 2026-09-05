import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export type ProblemType = 'translation' | 'arrangement' | 'writing' | 'conditional';

interface HighlightRange {
  start: number;
  end: number;
  color: 'yellow' | 'lightYellow' | 'green' | 'gray' | 'label-only' | 'transparent';
  label?: string; // 'S', 'V', 'O', 'C', "S'", "V'", etc.
  labelStart?: number; // Original start position for fixed label
  labelEnd?: number;   // Original end position for fixed label
  type?: 'bracket' | 'parenthesis' | 'triangle'; // Special marker types
  underlineOnly?: boolean; // When true, show underline + label without changing background
}

interface ProblemRowProps {
  number: number;
  koreanSentence: string;
  hints?: string[];
  wordCount?: number;
  instructions?: string;
  type?: ProblemType;
  showAnswerLines?: boolean;
  className?: string;
  answer?: string;
  isActive?: boolean;
  onActivate?: (problemNumber: number) => void;
  section?: 'arrangement' | 'conditional';
}

const typeLabels: Record<ProblemType, { label: string; class: string }> = {
  translation: { label: '번역', class: 'type-indicator-translation' },
  arrangement: { label: '배열', class: 'type-indicator-arrangement' },
  writing: { label: '서술형', class: 'type-indicator-writing' },
  conditional: { label: '배열', class: 'type-indicator-conditional' },
};

export function ProblemRow({
  number,
  koreanSentence,
  hints,
  wordCount,
  instructions,
  type = 'translation',
  showAnswerLines = true,
  className,
  answer,
  isActive = false,
  onActivate,
  section = 'conditional',
}: ProblemRowProps) {
  const hasHints = hints && hints.length > 0;
  const isSecondGroup = number >= 11 && number <= 15;
  const isArrangement = section === 'arrangement';
  
  // Get the appropriate label based on section and problem number
  // For arrangement section (조건영작) problems 11-15, show "조건" label
  const getTypeLabel = () => {
    if (section === 'arrangement' && isSecondGroup) {
      return { label: '조건', class: 'type-indicator-conditional' };
    }
    return typeLabels[type];
  };
  const typeInfo = getTypeLabel();
  
  // Theme colors based on section
  // 조건영작 (arrangement): 딥 와인/로즈골드 테마 (더 확실한 차별화)
  // 배열영작 (conditional): 다크 네이비/골드 테마
  const themeColors = isArrangement ? {
    numberBg: 'linear-gradient(135deg, #c77d8e 0%, #9e4a5e 100%)',
    numberColor: '#fff',
    numberShadow: 'rgba(199,125,142,0.4)',
    activeRing: 'ring-pink-300',
    typeIndicatorBg: 'linear-gradient(135deg, rgba(199,125,142,0.2) 0%, rgba(158,74,94,0.15) 100%)',
    typeIndicatorColor: '#9e4a5e',
    typeIndicatorBorder: 'rgba(199,125,142,0.4)',
    metaBg: 'rgba(199,125,142,0.12)',
    metaBorder: 'rgba(199,125,142,0.25)',
    metaColor: '#9e4a5e',
    textColor: '#3d1a24',
    hintBoxBg: 'linear-gradient(135deg, rgba(92,28,46,0.04) 0%, rgba(139,58,78,0.06) 100%)',
    hintBoxBorder: 'rgba(199,125,142,0.25)',
    hintWordBorder: 'rgba(199,125,142,0.4)',
    hintWordHoverBg: 'linear-gradient(135deg, #c77d8e 0%, #9e4a5e 100%)',
    answerBg: 'rgba(199,125,142,0.06)',
    answerBorder: 'rgba(199,125,142,0.25)',
    selectedWordBg: 'linear-gradient(135deg, #5c1c2e 0%, #8b3a4e 100%)',
    selectedWordColor: '#f4c4d0',
    transformedBg: 'linear-gradient(135deg, #c77d8e 0%, #9e4a5e 100%)',
    transformedRing: 'ring-pink-300',
    placeholderColor: 'rgba(158,74,94,0.5)',
    resetColor: '#9e4a5e',
  } : {
    numberBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
    numberColor: '#0f1419',
    numberShadow: 'rgba(201,162,39,0.3)',
    activeRing: 'ring-amber-400',
    typeIndicatorBg: 'linear-gradient(135deg, rgba(201,162,39,0.15) 0%, rgba(139,105,20,0.1) 100%)',
    typeIndicatorColor: '#8b6914',
    typeIndicatorBorder: 'rgba(201,162,39,0.3)',
    metaBg: 'rgba(201,162,39,0.1)',
    metaBorder: 'rgba(201,162,39,0.2)',
    metaColor: '#8b6914',
    textColor: '#1a1a1a',
    hintBoxBg: 'linear-gradient(135deg, rgba(15,20,25,0.03) 0%, rgba(26,32,40,0.05) 100%)',
    hintBoxBorder: 'rgba(201,162,39,0.2)',
    hintWordBorder: 'rgba(201,162,39,0.3)',
    hintWordHoverBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
    answerBg: 'rgba(201,162,39,0.05)',
    answerBorder: 'rgba(201,162,39,0.2)',
    selectedWordBg: 'linear-gradient(135deg, #0f1419 0%, #1a2028 100%)',
    selectedWordColor: '#d4af37',
    transformedBg: 'linear-gradient(135deg, #c9a227 0%, #8b6914 100%)',
    transformedRing: 'ring-amber-300',
    placeholderColor: 'rgba(139,105,20,0.5)',
    resetColor: '#8b6914',
  };
  
  // Interactive state
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [highlights, setHighlights] = useState<HighlightRange[]>([]);
  const [highlightHistory, setHighlightHistory] = useState<HighlightRange[][]>([]);
  const [highlightRedoHistory, setHighlightRedoHistory] = useState<HighlightRange[][]>([]);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasPlayedCorrect, setHasPlayedCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false); // Toggle answer display with ~ key
  
  // Flying word animation state
  interface FlyingWord {
    id: string;
    word: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    isTransformed?: boolean; // 변형된 단어인지 여부
  }
  const [flyingWord, setFlyingWord] = useState<FlyingWord | null>(null);
  const [transformedWords, setTransformedWords] = useState<Set<number>>(new Set()); // 변형된 단어 인덱스 추적
  
  const koreanTextRef = useRef<HTMLParagraphElement>(null);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const answerAreaRef = useRef<HTMLDivElement>(null);
  const wordButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  
  const { playCorrectSound, playWrongSound } = useSoundEffects();

  // Initialize words from hints
  useEffect(() => {
    if (hasHints) {
      const shuffled = [...hints].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }
    setSelectedWords([]);
    setIsCorrect(null);
    setIsWrong(false);
    setHighlights([]);
    setHighlightHistory([]);
    setHighlightRedoHistory([]);
    setIsTypingMode(false);
    setTypedAnswer("");
    setShowCelebration(false);
    setHasPlayedCorrect(false);
    setFlyingWord(null);
    setTransformedWords(new Set());
  }, [hints, hasHints]);

  // Check answer
  useEffect(() => {
    if (!answer) return;

    const currentAnswer = isTypingMode ? typedAnswer : selectedWords.join(" ");
    if (currentAnswer.length === 0) {
      setIsCorrect(null);
      setIsWrong(false);
      return;
    }

    const normalizedAnswer = answer.toLowerCase().replace(/[.,!?'"]/g, '').trim();
    const normalizedCurrent = currentAnswer.toLowerCase().replace(/[.,!?'"]/g, '').trim();

    if (normalizedCurrent === normalizedAnswer) {
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
      if (normalizedAnswer.startsWith(normalizedCurrent)) {
        setIsWrong(false);
      } else {
        if (!isWrong) {
          playWrongSound();
        }
        setIsWrong(true);
      }
    }
  }, [selectedWords, typedAnswer, answer, isTypingMode, hasPlayedCorrect, playCorrectSound, playWrongSound, isWrong]);

  // Track word selection history for undo/redo
  const [wordHistory, setWordHistory] = useState<{ available: string[], selected: string[] }[]>([]);
  const [wordRedoHistory, setWordRedoHistory] = useState<{ available: string[], selected: string[] }[]>([]);

  // Handle word click
  const handleWordClick = (word: string, index: number) => {
    // Save current state to history before changing and clear redo
    setWordHistory([...wordHistory, { available: [...availableWords], selected: [...selectedWords] }]);
    setWordRedoHistory([]);
    setIsTypingMode(false);
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  // Handle removing word from answer
  const handleRemoveWord = (index: number) => {
    // Save current state to history before changing and clear redo
    setWordHistory([...wordHistory, { available: [...availableWords], selected: [...selectedWords] }]);
    setWordRedoHistory([]);
    const word = selectedWords[index];
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, word]);
  };

  // Reset problem
  const handleReset = () => {
    if (hasHints) {
      const shuffled = [...hints].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }
    setSelectedWords([]);
    setIsCorrect(null);
    setIsWrong(false);
    setTypedAnswer("");
    setIsTypingMode(false);
    setShowCelebration(false);
    setHasPlayedCorrect(false);
    setFlyingWord(null);
    setTransformedWords(new Set());
  };

  // Handle keyboard shortcuts for highlighting and undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if this row has any interaction (selected words, typed answer, or highlights)
      const hasInteraction = selectedWords.length > 0 || typedAnswer.length > 0 || highlights.length > 0 || wordHistory.length > 0;
      
      // Allow undo if row is focused, has selection, or has any interaction
      const isRowActive = rowRef.current?.contains(document.activeElement) || 
          window.getSelection()?.anchorNode?.parentElement?.closest(`[data-problem="${number}"]`) ||
          (e.ctrlKey && e.key === 'z' && hasInteraction);

      // Shift+1 for auto-selecting next correct word (only if this problem is active)
      // This should be checked FIRST before other conditions
      if (e.shiftKey && e.key === '!') {
        if (!isActive) return; // Only work on the clicked/active problem
        if (flyingWord) return; // Ignore if animation is in progress
        e.preventDefault();
        if (!answer) return;
        
        // Get the correct answer words
        const answerWords = answer.split(/\s+/).filter(w => w.length > 0);
        
        // Calculate how many answer words have been covered by selected hints
        // (multi-word hints cover multiple answer words)
        const coveredWordCount = selectedWords.reduce((count, hint) => {
          return count + hint.split(/\s+/).length;
        }, 0);
        
        // Find the next word that should be selected
        const nextIndex = coveredWordCount;
        if (nextIndex >= answerWords.length) return; // Already complete
        
        const nextCorrectWord = answerWords[nextIndex];
        const normalizedNextWord = nextCorrectWord.toLowerCase().replace(/[.,!?'"]/g, '');
        
        // Find this word in available words
        // PRIORITY: Check multi-word hints FIRST (they should take precedence over single-word matches)
        let availableIndex = -1;
        
        // First, check if there's a multi-word hint that matches the upcoming sequence
        for (let i = 0; i < availableWords.length; i++) {
          const hint = availableWords[i];
          const hintWords = hint.split(/\s+/);
          if (hintWords.length > 1) {
            // Check if the first word of the hint matches the next correct word
            const firstHintWord = hintWords[0].toLowerCase().replace(/[.,!?'"]/g, '');
            if (firstHintWord === normalizedNextWord) {
              // Verify the remaining words also match
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
        
        // If exact match not found, continue searching for other multi-word hints
        if (availableIndex === -1) {
          for (let i = 0; i < availableWords.length; i++) {
            const hint = availableWords[i];
            const hintWords = hint.split(/\s+/);
            if (hintWords.length > 1) {
              // Check if the first word of the hint matches
              const firstHintWord = hintWords[0].toLowerCase().replace(/[.,!?'"]/g, '');
              if (firstHintWord === normalizedNextWord) {
                // Verify the remaining words also match
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
        }
        
        // If still not found, try partial match (for transformed words like "choose" → "choosing")
        // IMPORTANT: Only match single-word hints to avoid matching "to" with "to send messages"
        if (availableIndex === -1) {
          availableIndex = availableWords.findIndex(w => {
            const hintWords = w.split(/\s+/);
            // Skip multi-word hints for partial matching
            if (hintWords.length > 1) return false;
            
            const normalizedHint = w.toLowerCase().replace(/[.,!?'"]/g, '');
            // Check if hint is a base form of the answer word (e.g., "choose" matches "choosing")
            // Require at least 4 characters to match to avoid false positives like "to" matching "top"
            const minMatchLength = Math.min(4, normalizedHint.length, normalizedNextWord.length);
            return normalizedNextWord.startsWith(normalizedHint.slice(0, minMatchLength)) || 
                   normalizedHint.startsWith(normalizedNextWord.slice(0, minMatchLength));
          });
        }
        
        if (availableIndex !== -1) {
          // Found in available words - animate from hint to answer
          const buttonElement = wordButtonRefs.current.get(availableIndex);
          const word = availableWords[availableIndex];
          const hintWords = word.split(/\s+/);
          const isMultiWordHint = hintWords.length > 1;
          
          // For multi-word hints, use the entire hint as one unit
          let useWord = word;
          let isTransformed = false;
          
          if (isMultiWordHint) {
            // Multi-word hint matched - get the corresponding answer sequence
            const answerSequence = answerWords.slice(nextIndex, nextIndex + hintWords.length).join(' ');
            const normalizedHint = word.toLowerCase().replace(/[.,!?'"]/g, '');
            const normalizedSequence = answerSequence.toLowerCase().replace(/[.,!?'"]/g, '');
            
            // Use answer sequence to preserve punctuation (like periods at the end)
            useWord = answerSequence;
            isTransformed = normalizedHint !== normalizedSequence;
          } else {
            // Single word hint
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
            
            // Save history for undo (use functional update to avoid stale closures)
            setWordHistory(prev => [...prev, { available: [...availableWords], selected: [...selectedWords] }]);
            setWordRedoHistory([]);
            
            // Add to selected after animation (capture current length for transformedWords)
            const currentSelectedLength = selectedWords.length;
            setTimeout(() => {
              setSelectedWords(prev => [...prev, useWord]);
              if (isTransformed) {
                setTransformedWords(prev => new Set([...prev, currentSelectedLength]));
              }
              setFlyingWord(null);
              setIsTypingMode(false);
            }, 150);
          } else {
            // Fallback without animation
            const currentSelectedLength = selectedWords.length;
            setWordHistory(prev => [...prev, { available: [...availableWords], selected: [...selectedWords] }]);
            setWordRedoHistory([]);
            setSelectedWords(prev => [...prev, useWord]);
            if (isTransformed) {
              setTransformedWords(prev => new Set([...prev, currentSelectedLength]));
            }
            setAvailableWords(prev => prev.filter((_, i) => i !== availableIndex));
            setIsTypingMode(false);
          }
        } else {
          // Word not in available words - it's a transformed/new word, add directly with animation
          // This handles cases where the answer word has no matching hint at all
          if (answerAreaRef.current) {
            const answerRect = answerAreaRef.current.getBoundingClientRect();
            
            const flyingWordData: FlyingWord = {
              id: `transformed-${Date.now()}`,
              word: nextCorrectWord,
              startX: answerRect.left + answerRect.width / 2,
              startY: answerRect.top - 30, // Appear from above
              endX: answerRect.left + answerRect.width / 2,
              endY: answerRect.top + answerRect.height / 2,
              isTransformed: true
            };
            
            setFlyingWord(flyingWordData);
            
            // Save history for undo
            const currentSelectedLength = selectedWords.length;
            setWordHistory(prev => [...prev, { available: [...availableWords], selected: [...selectedWords] }]);
            setWordRedoHistory([]);
            
            // Add to selected after animation
            setTimeout(() => {
              setSelectedWords(prev => [...prev, nextCorrectWord]);
              setTransformedWords(prev => new Set([...prev, currentSelectedLength]));
              setFlyingWord(null);
              setIsTypingMode(false);
            }, 150);
          } else {
            // Fallback without animation
            const currentSelectedLength = selectedWords.length;
            setWordHistory(prev => [...prev, { available: [...availableWords], selected: [...selectedWords] }]);
            setWordRedoHistory([]);
            setSelectedWords(prev => [...prev, nextCorrectWord]);
            setTransformedWords(prev => new Set([...prev, currentSelectedLength]));
            setIsTypingMode(false);
          }
        }
        return;
      }

      // Ctrl+Z for undo (words first, then highlights)
      if (e.ctrlKey && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        // Check if this row has any interaction
        const hasWordInteraction = wordHistory.length > 0;
        const hasHighlightInteraction = highlightHistory.length > 0;
        
        // Allow undo if there's any history to undo
        if (!hasWordInteraction && !hasHighlightInteraction) return;
        
        e.preventDefault();
        e.stopPropagation();
        
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
      if (e.ctrlKey && (e.key === 'y' || e.key === 'Y') && !e.shiftKey) {
        // Check if this row has any redo available
        const hasWordRedo = wordRedoHistory.length > 0;
        const hasHighlightRedo = highlightRedoHistory.length > 0;
        
        // Allow redo if there's any redo history
        if (!hasWordRedo && !hasHighlightRedo) return;
        
        e.preventDefault();
        e.stopPropagation();
        
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

      // Only handle highlighting if row is active
      if (!isRowActive) return;

      // ~ key: toggle answer display
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setShowAnswer(prev => !prev);
        return;
      }

      // Helper function to check if a node is inside a decorative/label element (not actual content)
      const isDecorativeNode = (node: Node): boolean => {
        let current: Node | null = node;
        while (current) {
          if (current instanceof HTMLElement) {
            // Label spans and decorative elements have these classes
            if (current.classList.contains('select-none') || 
                current.classList.contains('pointer-events-none')) {
              return true;
            }
          }
          current = current.parentNode;
        }
        return false;
      };

      // Helper function to create a filtered TreeWalker that excludes decorative text nodes
      const createFilteredTreeWalker = (root: Node): TreeWalker => {
        return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode: (node: Node) => {
            // Reject text nodes inside decorative elements (labels, symbols)
            if (isDecorativeNode(node)) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        });
      };

      // Helper function to calculate accurate text offset using data-start-index
      const getTextOffsetFromSelection = (container: HTMLElement, targetNode: Node, targetOffset: number): number => {
        // If the target node itself is decorative, we need to find the actual content node
        if (isDecorativeNode(targetNode)) {
          return 0; // Return 0 for decorative nodes - this shouldn't happen in normal selection
        }

        // Find ALL parent spans with data-start-index and use the OUTERMOST one
        // This is important for nested structures where inner spans may have incorrect indices
        let current: Node | null = targetNode;
        let outermostSpanWithIndex: HTMLElement | null = null;
        
        while (current && current !== container) {
          if (current instanceof HTMLElement && current.hasAttribute('data-start-index')) {
            outermostSpanWithIndex = current;
            // Don't break - continue to find outermost one
          }
          current = current.parentNode;
        }

        if (outermostSpanWithIndex) {
          const startIndex = parseInt(outermostSpanWithIndex.getAttribute('data-start-index') || '0', 10);
          
          // Calculate offset within this span by walking ONLY content text nodes
          const walker = createFilteredTreeWalker(outermostSpanWithIndex);
          let node: Text | null;
          let internalOffset = 0;
          
          while ((node = walker.nextNode() as Text | null)) {
            if (node === targetNode) {
              return startIndex + internalOffset + targetOffset;
            }
            internalOffset += node.textContent?.length || 0;
          }
          
          // If targetNode is not a text node but inside the span
          return startIndex + targetOffset;
        }
        
        // Fallback: find span containing the target node (use outermost)
        const spans = container.querySelectorAll('[data-start-index]');
        let outermostContainingSpan: Element | null = null;
        
        for (const span of spans) {
          if (span.contains(targetNode)) {
            // Check if this span is an ancestor of our current outermost
            if (!outermostContainingSpan || span.contains(outermostContainingSpan)) {
              outermostContainingSpan = span;
            }
          }
        }
        
        if (outermostContainingSpan) {
          const startIndex = parseInt(outermostContainingSpan.getAttribute('data-start-index') || '0', 10);
          const walker = createFilteredTreeWalker(outermostContainingSpan);
          let node: Text | null;
          let internalOffset = 0;
          
          while ((node = walker.nextNode() as Text | null)) {
            if (node === targetNode) {
              return startIndex + internalOffset + targetOffset;
            }
            internalOffset += node.textContent?.length || 0;
          }
          return startIndex;
        }
        
        // Last resort: count all content text directly (excluding decorative)
        const walker = createFilteredTreeWalker(container);
        let node: Text | null;
        let totalOffset = 0;
        
        while ((node = walker.nextNode() as Text | null)) {
          if (node === targetNode) {
            return totalOffset + targetOffset;
          }
          totalOffset += node.textContent?.length || 0;
        }
        
        return targetOffset;
      };

      // Helper function for special highlight types (brackets, parenthesis, triangle)
      const applySpecialHighlight = (type: 'bracket' | 'parenthesis' | 'triangle') => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const koreanElement = koreanTextRef.current;
        if (!koreanElement) return;

        if (!koreanElement.contains(range.commonAncestorContainer)) return;

        const selectedText = selection.toString();
        if (!selectedText) return;

        // Use accurate text offset calculation
        const start = getTextOffsetFromSelection(koreanElement, range.startContainer, range.startOffset);
        const end = getTextOffsetFromSelection(koreanElement, range.endContainer, range.endOffset);

        setHighlightHistory(prev => [...prev, highlights]);
        setHighlightRedoHistory([]);

        // Keep all existing highlights - don't modify them
        // Just add a new special highlight that will overlay on top
        const newHighlight: HighlightRange = {
          start,
          end,
          color: 'transparent', // Use transparent so it doesn't override existing colors
          type
        };

        // Add to existing highlights without modifying them
        const updatedHighlights = [...highlights, newHighlight];
        updatedHighlights.sort((a, b) => a.start - b.start);

        setHighlights(updatedHighlights);
        selection.removeAllRanges();
      };

      // Alt+1: brackets, green
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        applySpecialHighlight('bracket');
        return;
      }

      // Alt+2: parenthesis, gray
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        applySpecialHighlight('parenthesis');
        return;
      }

      // Alt+3: triangle marker
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        applySpecialHighlight('triangle');
        return;
      }

      // Ctrl+1, 2, 3, 4 for highlighting with S, V, O, C labels
      if (e.ctrlKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const koreanElement = koreanTextRef.current;
        if (!koreanElement) return;

        if (!koreanElement.contains(range.commonAncestorContainer)) return;

        const selectedText = selection.toString();
        if (!selectedText) return;

        // Use accurate text offset calculation
        const start = getTextOffsetFromSelection(koreanElement, range.startContainer, range.startOffset);
        const end = getTextOffsetFromSelection(koreanElement, range.endContainer, range.endOffset);

        // Save history before modifying and clear redo
        setHighlightHistory(prev => [...prev, highlights]);
        setHighlightRedoHistory([]);

        // Check if selection is within an existing highlight (color or special type)
        const isInsideExistingHighlight = highlights.some(h => 
          h.color !== 'label-only' && start >= h.start && end <= h.end
        );

        // Collect existing label-only highlights
        let labelOnlyHighlights: HighlightRange[] = highlights.filter(h => h.color === 'label-only');
        
        // Count existing labels for incrementing
        const existingLabels = labelOnlyHighlights.filter(h => h.label);

        let newLabel: string | undefined;

        switch (e.key) {
          case '1':
            const sCount = existingLabels.filter(h => h.label?.startsWith('S')).length;
            newLabel = sCount === 0 ? 'S' : 'S' + "'".repeat(sCount);
            break;
          case '2':
            const vCount = existingLabels.filter(h => h.label?.startsWith('V')).length;
            newLabel = vCount === 0 ? 'V' : 'V' + "'".repeat(vCount);
            break;
          case '3':
            const oCount = existingLabels.filter(h => h.label?.startsWith('O')).length;
            newLabel = oCount === 0 ? 'O' : 'O' + "'".repeat(oCount);
            break;
          case '4':
            const cCount = existingLabels.filter(h => h.label?.startsWith('C')).length;
            newLabel = cCount === 0 ? 'C' : 'C' + "'".repeat(cCount);
            break;
          default:
            return;
        }

        if (isInsideExistingHighlight) {
          // Selection is inside existing highlight - keep all existing highlights unchanged
          // Only add an underline-label marker for the selected portion
          const updatedHighlights = highlights.filter(h => h.color !== 'label-only');
          
          if (newLabel) {
            labelOnlyHighlights.push({
              start,
              end,
              color: 'label-only',
              label: newLabel,
              labelStart: start,
              labelEnd: end,
              underlineOnly: true  // Mark as underline-only (no background change)
            });
          }

          const allHighlights = [...updatedHighlights, ...labelOnlyHighlights];
          allHighlights.sort((a, b) => a.start - b.start);

          setHighlights(allHighlights);
        } else {
          // Normal case - not inside existing highlight
          // IMPORTANT: Keep ALL existing highlights unchanged, just add new ones on top
          const existingColorHighlights = highlights.filter(h => h.color !== 'label-only');

          let color: 'yellow' | 'lightYellow';
          switch (e.key) {
            case '1':
            case '2':
              color = 'yellow';
              break;
            case '3':
            case '4':
              color = 'lightYellow';
              break;
            default:
              color = 'yellow';
          }

          // Add new highlight without modifying existing ones
          const newHighlight: HighlightRange = {
            start,
            end,
            color
          };

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

          const allHighlights = [...existingColorHighlights, newHighlight, ...labelOnlyHighlights];
          allHighlights.sort((a, b) => a.start - b.start);

          setHighlights(allHighlights);
        }
        
        selection.removeAllRanges();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [highlights, highlightHistory, highlightRedoHistory, wordHistory, wordRedoHistory, availableWords, selectedWords, number, isActive, answer, flyingWord]);

  // Render korean text with highlights
  const renderKoreanText = () => {
    const text = koreanSentence;
    if (highlights.length === 0) return text;

    // Separate different types of highlights
    const specialHighlights = highlights.filter(h => h.type);
    const colorHighlights = highlights.filter(h => h.color !== 'label-only' && !h.type);
    const labelMarkers = highlights.filter(h => h.color === 'label-only');
    
    // Separate underline-only markers (for labels inside existing highlights)
    const underlineMarkers = labelMarkers.filter(h => h.underlineOnly);
    const regularLabelMarkers = labelMarkers.filter(h => !h.underlineOnly);

    // Build character info map - color highlights only (special highlights handled separately)
    interface CharInfo {
      color: HighlightRange['color'] | null;
    }
    const charInfo: CharInfo[] = Array(text.length).fill(null).map(() => ({ color: null }));
    
    // Only apply color highlights to charInfo (not special highlights)
    colorHighlights.forEach(highlight => {
      for (let i = highlight.start; i < highlight.end && i < text.length; i++) {
        charInfo[i] = { color: highlight.color };
      }
    });

    // Build character-to-label map (labels at their fixed positions) - only regular labels
    const charLabels: Array<string | null> = Array(text.length).fill(null);
    regularLabelMarkers.forEach(marker => {
      if (marker.label) {
        const labelPos = marker.labelStart ?? marker.start;
        if (labelPos < text.length) {
          charLabels[labelPos] = marker.label;
        }
      }
    });

    // Build underline ranges map
    interface UnderlineInfo {
      label: string;
      start: number;
      end: number;
    }
    const underlineRanges: UnderlineInfo[] = underlineMarkers
      .filter(m => m.label)
      .map(m => ({
        label: m.label!,
        start: m.start,
        end: m.end
      }));

    // Find special highlight ranges for bracket/parenthesis rendering (overlay layer)
    const specialRanges = specialHighlights.map(h => ({
      start: h.start,
      end: h.end,
      type: h.type
    }));

    // Check if a position is within a special range
    const getSpecialRangeAt = (pos: number) => {
      return specialRanges.find(r => pos >= r.start && pos < r.end);
    };

    // Get the special range that starts at this position (for rendering wrapper)
    const getSpecialRangeStartingAt = (pos: number) => {
      return specialRanges.find(r => r.start === pos);
    };

    // Helper function to render text with potential underline markers
    const renderTextWithUnderlines = (textContent: string, startIndex: number, baseClassName?: string, baseStyle?: React.CSSProperties): JSX.Element => {
      // Find underline markers that intersect with this text range
      const textEnd = startIndex + textContent.length;
      const relevantUnderlines = underlineRanges.filter(u => 
        u.start < textEnd && u.end > startIndex
      );

      if (relevantUnderlines.length === 0) {
        return baseClassName ? (
          <span className={baseClassName} style={baseStyle}>{textContent}</span>
        ) : (
          <>{textContent}</>
        );
      }

      // Build segments with underline info
      const segments: { text: string; underline?: UnderlineInfo }[] = [];
      let currentPos = startIndex;

      // Sort underlines by start position
      const sortedUnderlines = [...relevantUnderlines].sort((a, b) => a.start - b.start);

      for (const underline of sortedUnderlines) {
        const underlineStart = Math.max(underline.start, startIndex);
        const underlineEnd = Math.min(underline.end, textEnd);

        // Text before underline
        if (currentPos < underlineStart) {
          segments.push({
            text: textContent.slice(currentPos - startIndex, underlineStart - startIndex)
          });
        }

        // Underlined text
        segments.push({
          text: textContent.slice(underlineStart - startIndex, underlineEnd - startIndex),
          underline
        });

        currentPos = underlineEnd;
      }

      // Remaining text after last underline
      if (currentPos < textEnd) {
        segments.push({
          text: textContent.slice(currentPos - startIndex)
        });
      }

      return (
        <span className={baseClassName} style={baseStyle}>
          {segments.map((seg, idx) => {
            if (seg.underline) {
              const labelColors: Record<string, string> = {
                'S': 'from-amber-400 to-amber-500 text-amber-950',
                'V': 'from-yellow-400 to-yellow-500 text-yellow-950',
                'O': 'from-orange-400 to-orange-500 text-orange-950',
                'C': 'from-lime-400 to-lime-500 text-lime-950'
              };
              const labelColor = labelColors[seg.underline.label] || 'from-amber-400 to-amber-500 text-amber-950';
              return (
                <span key={idx} className="relative inline-flex flex-col items-center">
                  <span className="border-b-2 border-red-500">{seg.text}</span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap select-none pointer-events-none">
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${labelColor} text-base font-extrabold shadow-lg ring-2 ring-white/80 tracking-wide`}>
                      {seg.underline.label}
                    </span>
                  </span>
                </span>
              );
            }
            return <span key={idx}>{seg.text}</span>;
          })}
        </span>
      );
    };

    // Render parts
    const parts: JSX.Element[] = [];
    let i = 0;
    
    while (i < text.length) {
      const info = charInfo[i];
      const currentLabel = charLabels[i];
      
      // Check if this is the start of a special range
      const specialRange = specialRanges.find(r => r.start === i);
      
      if (specialRange) {
        // Render the special range content preserving inner color highlights
        const rangeStart = specialRange.start;
        const rangeEnd = specialRange.end;
        
        // Build inner content with color highlights preserved
        const innerParts: JSX.Element[] = [];
        let innerIdx = rangeStart;
        
        while (innerIdx < rangeEnd) {
          const innerInfo = charInfo[innerIdx];
          const innerLabel = charLabels[innerIdx];
          
          // Find end of this inner segment
          let innerSegmentEnd = innerIdx + 1;
          while (
            innerSegmentEnd < rangeEnd &&
            charInfo[innerSegmentEnd].color === innerInfo.color &&
            !charLabels[innerSegmentEnd]
          ) {
            innerSegmentEnd++;
          }
          
          const innerSegmentText = text.slice(innerIdx, innerSegmentEnd);
          
          if (innerInfo.color && innerInfo.color !== 'label-only' && innerInfo.color !== 'transparent') {
            const colorClasses: Record<string, string> = {
              yellow: 'bg-yellow-300 text-slate-900 print:bg-yellow-200',
              lightYellow: 'bg-yellow-100 text-slate-900 print:bg-yellow-100',
              green: 'bg-green-300 text-slate-900 print:bg-green-200',
              gray: 'bg-gray-300 text-slate-900 print:bg-gray-200'
            };
            
            innerParts.push(
              <span key={`inner-${innerIdx}`} data-start-index={innerIdx} className="relative inline-flex flex-col items-center">
                {innerLabel && (() => {
                  const labelColors: Record<string, string> = {
                    'S': 'from-amber-400 to-amber-500 text-amber-950',
                    'V': 'from-yellow-400 to-yellow-500 text-yellow-950',
                    'O': 'from-orange-400 to-orange-500 text-orange-950',
                    'C': 'from-lime-400 to-lime-500 text-lime-950'
                  };
                  const labelColor = labelColors[innerLabel] || 'from-amber-400 to-amber-500 text-amber-950';
                  return (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap select-none pointer-events-none z-10">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${labelColor} text-sm font-extrabold shadow-lg ring-2 ring-white/80 tracking-wide`}>
                        {innerLabel}
                      </span>
                    </span>
                  );
                })()}
                <span className={cn("px-0.5 rounded-sm", colorClasses[innerInfo.color] || '')}>
                  {renderTextWithUnderlines(innerSegmentText, innerIdx)}
                </span>
              </span>
            );
          } else if (innerLabel) {
            innerParts.push(
              <span key={`inner-${innerIdx}`} data-start-index={innerIdx} className="relative inline-flex flex-col items-center">
                {(() => {
                  const labelColors: Record<string, string> = {
                    'S': 'from-amber-400 to-amber-500 text-amber-950',
                    'V': 'from-yellow-400 to-yellow-500 text-yellow-950',
                    'O': 'from-orange-400 to-orange-500 text-orange-950',
                    'C': 'from-lime-400 to-lime-500 text-lime-950'
                  };
                  const labelColor = labelColors[innerLabel] || 'from-amber-400 to-amber-500 text-amber-950';
                  return (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap select-none pointer-events-none z-10">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${labelColor} text-sm font-extrabold shadow-lg ring-2 ring-white/80 tracking-wide`}>
                        {innerLabel}
                      </span>
                    </span>
                  );
                })()}
                {renderTextWithUnderlines(innerSegmentText, innerIdx)}
              </span>
            );
          } else {
            innerParts.push(
              <span key={`inner-${innerIdx}`} data-start-index={innerIdx}>
                {renderTextWithUnderlines(innerSegmentText, innerIdx)}
              </span>
            );
          }
          
          innerIdx = innerSegmentEnd;
        }
        
        // Wrap inner content with special highlight styling
        if (specialRange.type === 'bracket') {
          parts.push(
            <span 
              key={`special-${i}`} 
              data-start-index={specialRange.start}
              className="relative inline bracket-highlight"
            >
              {innerParts}
            </span>
          );
        } else if (specialRange.type === 'parenthesis') {
          parts.push(
            <span 
              key={`special-${i}`} 
              data-start-index={specialRange.start}
              className="relative inline parenthesis-highlight"
            >
              {innerParts}
            </span>
          );
        } else if (specialRange.type === 'triangle') {
          parts.push(
            <span 
              key={`special-${i}`} 
              data-start-index={specialRange.start}
              className="relative inline-flex flex-col items-center triangle-highlight"
            >
              {innerParts}
            </span>
          );
        }
        
        i = specialRange.end;
        continue;
      }
      
      // Find end of this segment (same color, no new labels, not entering a special range)
      let segmentEnd = i + 1;
      while (
        segmentEnd < text.length && 
        charInfo[segmentEnd].color === info.color &&
        !charLabels[segmentEnd] &&
        !specialRanges.some(r => r.start === segmentEnd)
      ) {
        segmentEnd++;
      }
      
      const segmentText = text.slice(i, segmentEnd);
      
      if (info.color && info.color !== 'label-only' && info.color !== 'transparent') {
        const colorClasses: Record<string, string> = {
          yellow: 'bg-yellow-300 text-slate-900 print:bg-yellow-200',
          lightYellow: 'bg-yellow-100 text-slate-900 print:bg-yellow-100',
          green: 'bg-green-300 text-slate-900 print:bg-green-200',
          gray: 'bg-gray-300 text-slate-900 print:bg-gray-200'
        };
        
        parts.push(
          <span key={`segment-${i}`} data-start-index={i} className="relative inline-flex flex-col items-center">
            {currentLabel && (() => {
              const labelColors: Record<string, string> = {
                'S': 'from-amber-400 to-amber-500 text-amber-950',
                'V': 'from-yellow-400 to-yellow-500 text-yellow-950',
                'O': 'from-orange-400 to-orange-500 text-orange-950',
                'C': 'from-lime-400 to-lime-500 text-lime-950'
              };
              const labelColor = labelColors[currentLabel] || 'from-amber-400 to-amber-500 text-amber-950';
              return (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap select-none pointer-events-none z-10">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${labelColor} text-sm font-extrabold shadow-lg ring-2 ring-white/80 tracking-wide`}>
                    {currentLabel}
                  </span>
                </span>
              );
            })()}
            <span className={cn("px-0.5 rounded-sm", colorClasses[info.color] || '')}>
              {renderTextWithUnderlines(segmentText, i)}
            </span>
          </span>
        );
      } else if (currentLabel) {
        // Label on non-highlighted text
        parts.push(
          <span key={`segment-${i}`} data-start-index={i} className="relative inline-flex flex-col items-center">
            {(() => {
              const labelColors: Record<string, string> = {
                'S': 'from-amber-400 to-amber-500 text-amber-950',
                'V': 'from-yellow-400 to-yellow-500 text-yellow-950',
                'O': 'from-orange-400 to-orange-500 text-orange-950',
                'C': 'from-lime-400 to-lime-500 text-lime-950'
              };
              const labelColor = labelColors[currentLabel] || 'from-amber-400 to-amber-500 text-amber-950';
              return (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap select-none pointer-events-none z-10">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${labelColor} text-sm font-extrabold shadow-lg ring-2 ring-white/80 tracking-wide`}>
                    {currentLabel}
                  </span>
                </span>
              );
            })()}
            {renderTextWithUnderlines(segmentText, i)}
          </span>
        );
      } else {
        parts.push(<span key={`segment-${i}`} data-start-index={i}>{renderTextWithUnderlines(segmentText, i)}</span>);
      }
      
      i = segmentEnd;
    }

    return parts;
  };

  // Handle answer area click for typing mode
  const handleAnswerAreaClick = () => {
    if (selectedWords.length === 0 && !isTypingMode) {
      setIsTypingMode(true);
      setTimeout(() => answerInputRef.current?.focus(), 0);
    }
  };

  return (
    <div 
      ref={rowRef}
      data-problem={number}
      className={cn(
        "problem-row flex items-stretch rounded-md px-2 py-2 relative",
        showCelebration && "ring-2 ring-green-500 bg-green-50",
        className
      )}
    >
      {/* Celebration confetti effect (temporary) */}
      {showCelebration && (
        <div className="absolute top-0 left-8 pointer-events-none z-10 no-print">
          <span className="text-lg animate-bounce">🎉</span>
        </div>
      )}

      {/* Wrong answer X mark */}
      {isWrong && !showCelebration && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 no-print">
          <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/40 shadow-lg shadow-red-500/30 animate-pulse">
            <span className="relative flex items-center justify-center w-10 h-10">
              <span className="absolute inset-0 border-3 border-red-500 rounded-full opacity-60" />
              <span className="relative text-red-500 text-2xl font-bold">✕</span>
            </span>
          </div>
        </div>
      )}

      {/* Number with grading circle - clickable to activate */}
      <div 
        className="relative flex-shrink-0 mt-1 cursor-pointer"
        onClick={() => onActivate?.(number)}
        title="클릭하여 활성화 (Alt+1로 자동완성)"
      >
        <div 
          className={cn(
            "flex-shrink-0 flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full",
            isActive && `ring-2 ${themeColors.activeRing} ring-offset-1`
          )}
          style={{
            background: themeColors.numberBg,
            color: themeColors.numberColor,
            boxShadow: `0 2px 4px ${themeColors.numberShadow}`,
          }}
        >
          {String(number).padStart(2, '0')}
        </div>
        
        {/* Red grading circle - like teacher's marking */}
        {isCorrect === true && (
          <svg 
            className="absolute -inset-2 w-10 h-10 text-red-500 animate-fade-in no-print"
            viewBox="0 0 40 40"
            fill="none"
            style={{ 
              filter: 'drop-shadow(0 1px 1px rgba(239, 68, 68, 0.3))',
              transform: 'rotate(-5deg)'
            }}
          >
            {/* Hand-drawn style circle */}
            <ellipse 
              cx="20" 
              cy="20" 
              rx="16" 
              ry="15" 
              stroke="currentColor" 
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="2 0"
              style={{
                strokeDashoffset: 0,
              }}
            />
            {/* Second stroke for hand-drawn effect */}
            <ellipse 
              cx="20" 
              cy="20" 
              rx="14" 
              ry="13" 
              stroke="currentColor" 
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.4"
              style={{
                transform: 'rotate(3deg)',
                transformOrigin: 'center'
              }}
            />
          </svg>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col ml-2">
        {/* Type & Meta Info */}
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span 
            className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide rounded"
            style={{
              background: themeColors.typeIndicatorBg,
              color: themeColors.typeIndicatorColor,
              border: `1px solid ${themeColors.typeIndicatorBorder}`,
            }}
          >
            {typeInfo.label}
          </span>
          {wordCount && (
            <span 
              className="text-[11px] font-medium px-1.5 py-0.5 rounded"
              style={{ 
                color: themeColors.metaColor,
                background: themeColors.metaBg,
                border: `1px solid ${themeColors.metaBorder}`
              }}
            >
              {wordCount}단어
            </span>
          )}
          {instructions && (
            <span 
              className="text-[11px]"
              style={{ color: '#666666' }}
            >
              · {instructions}
            </span>
          )}
        </div>
        
        {/* Korean Sentence - with highlighting support */}
        <p 
          ref={koreanTextRef}
          className={cn(
            "font-medium mb-1 select-text cursor-text",
            className?.includes('text-3xl') ? 'text-[40px] leading-[2.5]' : 'text-[18px] leading-[2.2]'
          )}
          style={{ color: themeColors.textColor }}
        >
          {renderKoreanText()}
        </p>
        
        {/* Hints/Words - Interactive clicking */}
        {hasHints && (
          <div 
            className={cn("p-1.5 rounded no-print", className?.includes('text-3xl') ? 'mt-4' : 'mt-1')}
            style={{
              background: themeColors.hintBoxBg,
              border: `1px solid ${themeColors.hintBoxBorder}`,
            }}
            ref={wordBankRef => { /* for future use */ }}
          >
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <button
                  key={`${word}-${index}`}
                  ref={(el) => {
                    if (el) wordButtonRefs.current.set(index, el);
                    else wordButtonRefs.current.delete(index);
                  }}
                  onClick={() => handleWordClick(word, index)}
                  className={cn(
                    "inline-flex items-center font-medium rounded-full cursor-pointer transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 shadow-sm hover:shadow-md",
                    className?.includes('text-3xl') ? 'px-6 py-3 text-[32px]' : 'px-3 py-1 text-[11px]'
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: `1.5px solid ${themeColors.hintWordBorder}`,
                    color: themeColors.textColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.hintWordHoverBg} 0%, ${themeColors.typeIndicatorColor} 100%)`;
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = themeColors.typeIndicatorColor;
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                    e.currentTarget.style.color = themeColors.textColor;
                    e.currentTarget.style.borderColor = themeColors.hintWordBorder;
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Static hints for print - use shuffled availableWords to match screen display */}
        {hasHints && (
          <div className="hint-words-box hidden print:block">
            <div className="flex flex-wrap gap-0.5">
              {availableWords.map((word, index) => (
                <span key={index} className="hint-word">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Answer Lines - Interactive with typing and word display */}
        {showAnswerLines && (
          <div 
            ref={answerAreaRef}
            onClick={handleAnswerAreaClick}
            className={cn(
              "flex-1 flex flex-col justify-end mt-auto pt-1 min-h-[28px] cursor-text relative",
              isCorrect === true && "no-print",
              isWrong && "no-print"
            )}
          >
            {/* Flying word animation */}
            {flyingWord && (
              <div
                className={cn(
                  "fixed z-50 pointer-events-none",
                  "text-[11px] px-2 py-1 rounded shadow-lg",
                  flyingWord.isTransformed 
                    ? "bg-amber-500 text-white border-2 border-amber-600" 
                    : "bg-primary text-primary-foreground"
                )}
                style={{
                  left: flyingWord.startX,
                  top: flyingWord.startY,
                  transform: 'translate(-50%, -50%)',
                  animation: 'flyToAnswer 0.15s ease-out forwards',
                  '--end-x': `${flyingWord.endX - flyingWord.startX}px`,
                  '--end-y': `${flyingWord.endY - flyingWord.startY}px`,
                } as React.CSSProperties}
              >
                {flyingWord.isTransformed && <span className="mr-1">✨</span>}
                {flyingWord.word}
                {flyingWord.isTransformed && <span className="ml-1 text-[9px] opacity-80">변형</span>}
              </div>
            )}
            
            {/* Interactive answer display (screen only) */}
            <div 
              className={cn(
                "no-print min-h-[24px] rounded px-2 py-1 transition-all",
                isCorrect === true && "bg-green-100 border border-green-400",
                isWrong && "bg-red-50 border border-red-300 animate-pulse"
              )}
              style={{
                background: isCorrect ? undefined : isWrong ? undefined : themeColors.answerBg,
                border: isCorrect ? undefined : isWrong ? undefined : `1px solid ${themeColors.answerBorder}`,
              }}
            >
              {isTypingMode ? (
                <textarea
                  ref={answerInputRef}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="답을 입력하세요..."
                  className="w-full bg-transparent text-[12px] placeholder:text-gray-400 focus:outline-none resize-none min-h-[20px] leading-tight"
                  style={{ color: themeColors.textColor }}
                  rows={1}
                />
              ) : selectedWords.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedWords.map((word, index) => (
                    <button
                      key={`selected-${word}-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWord(index);
                      }}
                      className={cn(
                        "rounded transition-all relative",
                        className?.includes('text-2xl') ? 'text-[52px] px-6 py-4' : className?.includes('text-xl') ? 'text-[46px] px-5 py-3' : 'text-[28px] px-3 py-2',
                        isCorrect === true 
                          ? "bg-green-500 text-black" 
                          : isWrong 
                            ? "bg-red-400 text-white" 
                            : transformedWords.has(index)
                              ? `text-white shadow-md ring-2 ${themeColors.transformedRing}`
                              : "hover:opacity-80"
                      )}
                      style={{
                        background: isCorrect ? undefined : isWrong ? undefined : transformedWords.has(index) 
                          ? themeColors.transformedBg 
                          : themeColors.selectedWordBg,
                        color: isCorrect ? 'black' : isWrong ? undefined : themeColors.selectedWordColor,
                      }}
                    >
                      {transformedWords.has(index) && !isCorrect && !isWrong && (
                        <span className="mr-0.5">⚡</span>
                      )}
                      {word}
                    </button>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="text-[10px] ml-1 hover:opacity-70"
                    style={{ color: themeColors.resetColor }}
                    title="초기화"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className={cn(
                  className?.includes('text-2xl') ? 'text-[16px]' : className?.includes('text-xl') ? 'text-[14px]' : 'text-[11px]'
                )} style={{ color: themeColors.placeholderColor }}>클릭하여 입력 또는 위 단어 선택</span>
              )}
            </div>

            {/* Show answer toggle (~ key) */}
            {showAnswer && answer && (
              <div 
                className="no-print mt-2 p-2 rounded-lg border-2 border-dashed animate-fade-in"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderColor: 'rgba(34, 197, 94, 0.5)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600">정답:</span>
                  <span 
                    className={cn(
                      "font-medium text-green-700",
                      className?.includes('text-2xl') ? 'text-lg' : className?.includes('text-xl') ? 'text-base' : 'text-sm'
                    )}
                  >
                    {answer}
                  </span>
                </div>
              </div>
            )}

            {/* Print-only answer lines */}
            <div className="hidden print:flex print:flex-col print:flex-1">
              <div className="w-full flex-1 min-h-[12px] border-b border-dashed border-muted-foreground/40" />
              <div className="w-full flex-1 min-h-[12px] border-b border-dashed border-muted-foreground/40" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
