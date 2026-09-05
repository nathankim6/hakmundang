import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Check, X, RotateCcw, Lightbulb, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { playCorrectSound, playIncorrectSound, playHintSound, playClickSound, initializeAudioContext } from '@/utils/sound-effects';
import { showAnswerToast } from '@/utils/answer-toast';

interface SpellingQuizProps {
  meaning: string;
  correctWord: string;
  onAnswer: (isCorrect: boolean) => void;
  className?: string;
  currentQuestion?: number;
  totalQuestions?: number;
}

export function SpellingQuiz({
  meaning,
  correctWord,
  onAnswer,
  className = "",
  currentQuestion = 1,
  totalQuestions = 1
}: SpellingQuizProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setShowHint(false);
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => {
      clearTimeout(timer);
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    };
  }, [meaning, correctWord]);

  useEffect(() => {
    const initAudio = () => {
      initializeAudioContext();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const handleSubmit = () => {
    if (showResult) return;
    const correct = userAnswer.toLowerCase().trim() === correctWord.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    showAnswerToast(correct, correctWord);
    if (correct) playCorrectSound(); else playIncorrectSound();
    autoNextTimerRef.current = setTimeout(() => onAnswer(correct), correct ? 1200 : 2500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult && userAnswer.trim()) handleSubmit();
  };

  const handleNextNow = () => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    onAnswer(isCorrect);
  };

  const handleReset = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="editorial-card">
        {/* Eyebrow header */}
        <div className="px-7 sm:px-9 pt-7 pb-5 flex items-center justify-between">
          <span className="editorial-eyebrow">Spelling — №{String(currentQuestion).padStart(2, '0')}</span>
          <span className="editorial-qbadge">{currentQuestion} / {totalQuestions}</span>
        </div>
        <div className="editorial-rule" />

        {/* Prompt */}
        <div className="px-7 sm:px-9 pt-10 pb-8 text-center">
          <div className="editorial-eyebrow mb-4">Meaning</div>
          <h2 className="editorial-display text-[34px] sm:text-[44px] md:text-[52px]">
            {meaning}
          </h2>
          {showHint && !showResult && (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-200 bg-amber-50/60 animate-in fade-in slide-in-from-top-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-mono text-[14px] tracking-[0.3em] text-neutral-900 font-medium">
                {correctWord[0]}{'•'.repeat(Math.max(0, correctWord.length - 1))}
              </span>
              <span className="text-[11px] text-neutral-500 tracking-wide">{correctWord.length} letters</span>
            </div>
          )}
        </div>

        <div className="editorial-rule" />

        {!showResult ? (
          <div className="px-7 sm:px-9 py-7 space-y-4">
            <Input
              ref={inputRef}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type the word"
              className="editorial-input"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => { playHintSound(); setShowHint(true); }}
                disabled={showHint}
                className="editorial-btn-ghost flex-1"
              >
                <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Hint
              </Button>
              <Button
                variant="ghost"
                onClick={() => { playClickSound(); handleReset(); }}
                disabled={!userAnswer}
                className="editorial-btn-ghost flex-1"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Clear
              </Button>
              <Button
                onClick={() => { playClickSound(); handleSubmit(); }}
                disabled={!userAnswer.trim()}
                className="editorial-btn-primary flex-[1.6]"
              >
                Submit <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-7 sm:px-9 py-7 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className={`${isCorrect ? 'editorial-result-correct' : 'editorial-result-wrong'} px-6 py-6 text-center`}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCorrect ? 'bg-amber-500' : 'bg-neutral-900'} text-white`}>
                  {isCorrect ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" strokeWidth={3} />}
                </div>
                <span className={`text-[12px] font-medium tracking-[0.2em] uppercase ${isCorrect ? 'text-amber-800' : 'text-neutral-700'}`}>
                  {isCorrect ? 'Correct' : 'Not quite'}
                </span>
              </div>
              <div className="editorial-eyebrow mb-2">Answer</div>
              <div className="editorial-display text-[36px] sm:text-[44px]">{correctWord}</div>
              {!isCorrect && userAnswer && (
                <div className="mt-4 pt-4 border-t border-neutral-200/70">
                  <div className="editorial-eyebrow mb-1">Your input</div>
                  <div className="text-[15px] font-medium text-neutral-500 line-through">{userAnswer}</div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[11.5px] text-neutral-500 tracking-tight">
                {isCorrect ? 'Advancing automatically…' : 'Will reappear later'}
              </p>
              <Button onClick={handleNextNow} className="editorial-btn-primary h-10 px-5">
                Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
