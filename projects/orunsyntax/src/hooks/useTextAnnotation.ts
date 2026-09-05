import { useEffect, useCallback, useState, useRef } from 'react';

export interface Annotation {
  id: string;
  type: 'subject' | 'verb' | 'object' | 'complement' | 'bracket' | 'paren' | 'triangle' | 'gloss' | 'underline';
  text: string;
  meaning?: string;
}

interface UseTextAnnotationOptions {
  answers?: Map<number, string>;
}

export function useTextAnnotation({ answers }: UseTextAnnotationOptions = {}) {
  const [showMeaningInput, setShowMeaningInput] = useState(false);
  const [meaningInputPosition, setMeaningInputPosition] = useState({ x: 0, y: 0 });
  const [pendingSelection, setPendingSelection] = useState<{ range: Range; text: string } | null>(null);
  
  // Correction input state
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);
  const [correctionInputPosition, setCorrectionInputPosition] = useState({ x: 0, y: 0 });
  const [pendingCorrectionSpan, setPendingCorrectionSpan] = useState<HTMLSpanElement | null>(null);
  
  // Track count of S, V, O, C annotations per sentence
  const subjectCountRef = useRef(0);
  const verbCountRef = useRef(0);
  const objectCountRef = useRef(0);
  const complementCountRef = useRef(0);
  
  // Track which question number we're currently annotating
  const currentQuestionIdRef = useRef<number | null>(null);
  
  // Track annotation history for undo
  const annotationHistoryRef = useRef<HTMLSpanElement[]>([]);

  const getPrimeLabel = (base: string, count: number): string => {
    if (count === 0) return base;
    return base + "'".repeat(count);
  };
  
  const resetCountsIfNewSentence = (sentenceEl: Element) => {
    // Find the parent question-item to identify the sentence
    const questionItem = sentenceEl.closest('.question-item');
    if (!questionItem) return;
    
    // Get the question number from the question-number element
    const questionNumberEl = questionItem.querySelector('.question-number');
    const questionId = questionNumberEl ? parseInt(questionNumberEl.textContent || '0', 10) : null;
    
    // Reset if different question number
    if (questionId !== currentQuestionIdRef.current) {
      subjectCountRef.current = 0;
      verbCountRef.current = 0;
      objectCountRef.current = 0;
      complementCountRef.current = 0;
      currentQuestionIdRef.current = questionId;
    }
  };

  const undoLastAnnotation = useCallback(() => {
    if (!annotationHistoryRef.current || annotationHistoryRef.current.length === 0) return;
    const lastAnnotation = annotationHistoryRef.current.pop();
    if (!lastAnnotation || !lastAnnotation.parentNode) return;
    
    const type = lastAnnotation.getAttribute('data-annotation');
    
    // Decrease count for S/V/O/C
    if (type === 'subject' && subjectCountRef.current > 0) {
      subjectCountRef.current--;
    } else if (type === 'verb' && verbCountRef.current > 0) {
      verbCountRef.current--;
    } else if (type === 'object' && objectCountRef.current > 0) {
      objectCountRef.current--;
    } else if (type === 'complement' && complementCountRef.current > 0) {
      complementCountRef.current--;
    }
    
    // Move all child nodes out of the span (preserving nested annotations)
    const parent = lastAnnotation.parentNode;
    while (lastAnnotation.firstChild) {
      parent.insertBefore(lastAnnotation.firstChild, lastAnnotation);
    }
    parent.removeChild(lastAnnotation);
    
    // Normalize parent to merge adjacent text nodes
    parent.normalize();
  }, []);

  const toggleAnswerForSentence = useCallback(() => {
    // Find the currently focused/clicked sentence
    const activeElement = document.activeElement;
    const questionItem = activeElement?.closest('.question-item') || 
                         document.querySelector('.question-item:hover');
    
    if (!questionItem) {
      // Try to find from selection
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const el = container.nodeType === Node.TEXT_NODE 
          ? container.parentElement 
          : container as Element;
        const foundItem = el?.closest('.question-item');
        if (foundItem) {
          toggleAnswerOnQuestion(foundItem);
          return;
        }
      }
      return;
    }
    
    toggleAnswerOnQuestion(questionItem);
  }, [answers]);

  const toggleAnswerOnQuestion = useCallback((questionItem: Element) => {
    if (!answers) return;
    
    // Get question number
    const numberEl = questionItem.querySelector('.question-number');
    if (!numberEl) return;
    
    const questionId = parseInt(numberEl.textContent || '0', 10);
    const correction = answers.get(questionId);
    
    if (!correction) return;
    
    // Parse correction: "disturbed -> disturbing"
    const [wrongWord, correctWord] = correction.split('->').map(s => s.trim());
    
    if (!wrongWord || !correctWord) return;
    
    // Find sentence element
    const sentenceEl = questionItem.querySelector('.sentence-en');
    if (!sentenceEl) return;
    
    // Check if correction is already applied - if so, toggle it off
    const existingCorrection = sentenceEl.querySelector('.inline-correction');
    if (existingCorrection) {
      // Restore original text
      const originalText = existingCorrection.getAttribute('data-original') || '';
      const textNode = document.createTextNode(originalText);
      existingCorrection.parentNode?.replaceChild(textNode, existingCorrection);
      sentenceEl.normalize();
      return;
    }
    
    // Find and replace the wrong word in the sentence text
    const walker = document.createTreeWalker(
      sentenceEl,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent || '';
      // Case-insensitive search for the wrong word
      const regex = new RegExp(`\\b${wrongWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const match = text.match(regex);
      
      if (match && match.index !== undefined) {
        const matchedWord = match[0];
        const beforeText = text.substring(0, match.index);
        const afterText = text.substring(match.index + matchedWord.length);
        
        // Create the inline correction element
        const correctionSpan = document.createElement('span');
        correctionSpan.className = 'inline-correction';
        correctionSpan.setAttribute('data-original', matchedWord);
        correctionSpan.innerHTML = `
          <span class="inline-wrong">${matchedWord}</span>
          <span class="inline-arrow">→</span>
          <span class="inline-correct">${correctWord}</span>
        `;
        
        // Replace the text node with before text + correction + after text
        const parent = node.parentNode;
        if (parent) {
          if (beforeText) {
            parent.insertBefore(document.createTextNode(beforeText), node);
          }
          parent.insertBefore(correctionSpan, node);
          if (afterText) {
            parent.insertBefore(document.createTextNode(afterText), node);
          }
          parent.removeChild(node);
        }
        break;
      }
    }
  }, [answers]);

  const applyAnnotation = useCallback((type: 'subject' | 'verb' | 'object' | 'complement' | 'bracket' | 'paren' | 'triangle' | 'gloss' | 'underline') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    
    if (!selectedText) return;

    // Check if selection is within a sentence element
    const container = range.commonAncestorContainer;
    const sentenceEl = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement?.closest('.sentence-en, .sentence-kr')
      : (container as Element).closest?.('.sentence-en, .sentence-kr');
    
    if (!sentenceEl) return;
    
    // Reset counts if this is a different sentence/question
    resetCountsIfNewSentence(sentenceEl);

    const span = document.createElement('span');
    span.className = getAnnotationClass(type);
    span.setAttribute('data-annotation', type);
    
    if (type === 'subject') {
      const label = getPrimeLabel('S', subjectCountRef.current);
      span.setAttribute('data-label', label);
      subjectCountRef.current++;
    } else if (type === 'verb') {
      const label = getPrimeLabel('V', verbCountRef.current);
      span.setAttribute('data-label', label);
      verbCountRef.current++;
    } else if (type === 'object') {
      const label = getPrimeLabel('O', objectCountRef.current);
      span.setAttribute('data-label', label);
      objectCountRef.current++;
    } else if (type === 'complement') {
      const label = getPrimeLabel('C', complementCountRef.current);
      span.setAttribute('data-label', label);
      complementCountRef.current++;
    } else if (type === 'bracket') {
      span.setAttribute('data-prefix', '[');
      span.setAttribute('data-suffix', ']');
    } else if (type === 'paren') {
      span.setAttribute('data-prefix', '(');
      span.setAttribute('data-suffix', ')');
    }
    // triangle type doesn't need special attributes

    // Use extractContents + appendChild to support nested/overlapping annotations
    try {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      selection.removeAllRanges();
      
      // For gloss type, show input popup for adding annotation above text
      if (type === 'gloss') {
        const rect = span.getBoundingClientRect();
        setCorrectionInputPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
        setPendingCorrectionSpan(span);
        setShowCorrectionInput(true);
      }
      
      // Add to history for undo
      annotationHistoryRef.current?.push(span);
    } catch (e) {
      console.warn('Could not apply annotation:', e);
    }
  }, []);

  const handleCorrectionSubmit = useCallback((glossText: string) => {
    if (pendingCorrectionSpan && glossText.trim()) {
      pendingCorrectionSpan.setAttribute('data-gloss', glossText.trim());
    } else if (pendingCorrectionSpan && !glossText.trim()) {
      // If no correction provided, remove the annotation
      const parent = pendingCorrectionSpan.parentNode;
      if (parent) {
        const textNode = document.createTextNode(pendingCorrectionSpan.textContent || '');
        parent.replaceChild(textNode, pendingCorrectionSpan);
        textNode.parentNode?.normalize();
      }
    }
    setShowCorrectionInput(false);
    setPendingCorrectionSpan(null);
  }, [pendingCorrectionSpan]);

  const closeCorrectionInput = useCallback(() => {
    // Remove the span if user cancels
    if (pendingCorrectionSpan) {
      const parent = pendingCorrectionSpan.parentNode;
      if (parent) {
        const textNode = document.createTextNode(pendingCorrectionSpan.textContent || '');
        parent.replaceChild(textNode, pendingCorrectionSpan);
        textNode.parentNode?.normalize();
      }
    }
    setShowCorrectionInput(false);
    setPendingCorrectionSpan(null);
  }, [pendingCorrectionSpan]);

  const closeMeaningInput = useCallback(() => {
    setShowMeaningInput(false);
    setPendingSelection(null);
  }, []);

  // Dummy function for compatibility
  const handleMeaningSubmit = useCallback((_meaning: string) => {
    setShowMeaningInput(false);
    setPendingSelection(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Handle ~ (backquote) for toggling answer
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        toggleAnswerForSentence();
        return;
      }
      
      // Handle Shift shortcuts (underline)
      if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) return;
        
        switch (e.key) {
          case '!':
          case '1':
            e.preventDefault();
            applyAnnotation('underline');
            break;
        }
        return;
      }
      
      // Handle Alt shortcuts (bracket, paren, triangle, correction)
      if (e.altKey) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) return;
        
        switch (e.key) {
          case '1':
            e.preventDefault();
            applyAnnotation('bracket');
            break;
          case '2':
            e.preventDefault();
            applyAnnotation('paren');
            break;
          case '3':
            e.preventDefault();
            applyAnnotation('triangle');
            break;
          case '4':
            e.preventDefault();
            applyAnnotation('gloss');
            break;
        }
        return;
      }
      
      if (!e.ctrlKey && !e.metaKey) return;
      
      // Handle Ctrl+Z for undo (without selection requirement)
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        undoLastAnnotation();
        return;
      }
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) return;

      switch (e.key) {
        case '1':
          e.preventDefault();
          applyAnnotation('subject');
          break;
        case '2':
          e.preventDefault();
          applyAnnotation('verb');
          break;
        case '3':
          e.preventDefault();
          applyAnnotation('object');
          break;
        case '4':
          e.preventDefault();
          applyAnnotation('complement');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [applyAnnotation, undoLastAnnotation, toggleAnswerForSentence]);

  return {
    showMeaningInput,
    meaningInputPosition,
    pendingSelection,
    handleMeaningSubmit,
    closeMeaningInput,
    showCorrectionInput,
    correctionInputPosition,
    handleCorrectionSubmit,
    closeCorrectionInput
  };
}

function getAnnotationClass(type: string): string {
  switch (type) {
    case 'subject':
      return 'annotation annotation-subject';
    case 'verb':
      return 'annotation annotation-verb';
    case 'object':
      return 'annotation annotation-object';
    case 'complement':
      return 'annotation annotation-complement';
    case 'bracket':
      return 'annotation annotation-bracket';
    case 'paren':
      return 'annotation annotation-paren';
    case 'triangle':
      return 'annotation annotation-triangle';
    case 'gloss':
      return 'annotation annotation-gloss';
    case 'underline':
      return 'annotation annotation-underline';
    default:
      return 'annotation';
  }
}
