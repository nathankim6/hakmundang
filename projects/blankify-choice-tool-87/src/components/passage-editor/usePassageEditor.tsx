
import { useState, useRef, useEffect } from 'react';
import { Answer, HistoryState } from './types';

export const usePassageEditor = (
  index: number,
  passage: { content: string },
  onPassageChange: (index: number, content: string) => void
) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [choiceAnswers, setChoiceAnswers] = useState<Answer[]>([]);
  const [orderAnswers, setOrderAnswers] = useState<Answer[]>([]);
  const [blanksCount, setBlanksCount] = useState(0);
  const [choicesCount, setChoicesCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [history, setHistory] = useState<HistoryState[]>([]);

  const saveToHistory = (currentContent: string) => {
    setHistory(prev => [...prev, {
      content: currentContent,
      answers: [...answers],
      choiceAnswers: [...choiceAnswers],
      orderAnswers: [...orderAnswers],
      blanksCount,
      choicesCount,
      orderCount
    }]);
  };

  const handleTextSelect = () => {
    if (textAreaRef.current) {
      const selection = textAreaRef.current.value.substring(
        textAreaRef.current.selectionStart,
        textAreaRef.current.selectionEnd
      ).trim();
      
      setSelectedText(selection);
    }
  };

  const handleBlankSelection = () => {
    if (!textAreaRef.current || !selectedText) return;
    
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) return;
    
    saveToHistory(passage.content);
    
    const words = selectedText.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    const blankNumber = blanksCount + 1;
    
    const blanksWithHints = words.map(word => {
      const firstLetter = word.charAt(0);
      return `${firstLetter}____________`;
    }).join(' ');
    
    const blank = `(${blankNumber})${blanksWithHints}`;
    
    const newPassage = 
      passage.content.substring(0, start) + 
      blank + 
      passage.content.substring(end);
    
    onPassageChange(index, newPassage);
    setBlanksCount(blankNumber);
    
    const newAnswers = [...answers, { 
      number: blankNumber, 
      text: selectedText, 
      words: wordCount,
      type: 'blank' as const
    }];
    setAnswers(newAnswers);
    
    setSelectedText('');
  };

  const handleChoiceSelection = () => {
    if (!textAreaRef.current || !selectedText) return;
    
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) return;
    
    saveToHistory(passage.content);
    
    const choiceNumber = choicesCount + 1;
    const choice = `(${choiceNumber})**[${selectedText}/${selectedText}]**`;
    
    const newPassage = 
      passage.content.substring(0, start) + 
      choice + 
      passage.content.substring(end);
    
    onPassageChange(index, newPassage);
    setChoicesCount(choiceNumber);
    
    const newChoiceAnswers = [...choiceAnswers, { 
      number: choiceNumber, 
      text: selectedText,
      correctOption: selectedText,
      type: 'choice' as const
    }];
    setChoiceAnswers(newChoiceAnswers);
    
    setSelectedText('');
  };

  const handleOrderSelection = () => {
    if (!textAreaRef.current || !selectedText) return;
    
    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) return;
    
    saveToHistory(passage.content);
    
    const words = selectedText.split(/\s+/).filter(word => word.length > 0);
    
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    
    const orderNumber = orderCount + 1;
    const orderPlaceholder = `{ ${orderNumber}: ${shuffledWords.join(' / ')} }`;
    
    const newPassage = 
      passage.content.substring(0, start) + 
      orderPlaceholder + 
      passage.content.substring(end);
    
    onPassageChange(index, newPassage);
    setOrderCount(orderNumber);
    
    const newOrderAnswers = [...orderAnswers, { 
      number: orderNumber, 
      text: selectedText,
      originalOrder: words,
      type: 'order' as const
    }];
    setOrderAnswers(newOrderAnswers);
    
    setSelectedText('');
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    onPassageChange(index, lastState.content);
    setAnswers(lastState.answers);
    setChoiceAnswers(lastState.choiceAnswers);
    setOrderAnswers(lastState.orderAnswers);
    setBlanksCount(lastState.blanksCount);
    setChoicesCount(lastState.choicesCount);
    setOrderCount(lastState.orderCount);
    
    setHistory(prev => prev.slice(0, -1));
  };

  const resetPassage = () => {
    onPassageChange(index, '');
    setAnswers([]);
    setChoiceAnswers([]);
    setOrderAnswers([]);
    setBlanksCount(0);
    setChoicesCount(0);
    setOrderCount(0);
    setSelectedText('');
    setHistory([]);
  };

  const handleKeyboardShortcut = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === '1') {
      e.preventDefault();
      handleChoiceSelection();
    }
    
    if (e.ctrlKey && e.key === '2') {
      e.preventDefault();
      handleOrderSelection();
    }
    
    if (e.ctrlKey && e.key === '3') {
      e.preventDefault();
      handleBlankSelection();
    }
    
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    }
  };

  useEffect(() => {
    const adjustTextAreaHeight = () => {
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
      }
    };
    
    adjustTextAreaHeight();
    
    window.addEventListener('resize', adjustTextAreaHeight);
    
    return () => {
      window.removeEventListener('resize', adjustTextAreaHeight);
    };
  }, [passage.content]);

  return {
    textAreaRef,
    selectedText,
    answers,
    choiceAnswers,
    orderAnswers,
    history,
    handleTextSelect,
    handleBlankSelection,
    handleChoiceSelection,
    handleOrderSelection,
    handleUndo,
    handleKeyboardShortcut,
    resetPassage
  };
};
