import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, initializeAudioContext } from '@/utils/sound-effects';
import { showAnswerToast } from '@/utils/answer-toast';

const cleanMeaningForDisplay = (text: string): string => {
  if (!text || text.trim().length === 0) return text;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/\[([명동형부])\]\s*/g, '');
  cleaned = cleaned.replace(/\s*\[([명동형부])\]\s*/g, ' ');
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  cleaned = cleaned.replace(/\[[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};

interface ExampleQuizProps {
  word: string;
  meaning: string;
  example: string;
  onAnswer: (isCorrect: boolean) => void;
  className?: string;
}

const createBlankedExample = (example: string, targetWord: string) => {
  if (!example || example.length < 5) {
    const defaultExample = `He didn't ${targetWord} at all when he heard the news.`;
    const firstLetter = targetWord.charAt(0);
    const hint = firstLetter + '_'.repeat(targetWord.length - 1);
    return { blankedText: defaultExample.replace(targetWord, hint), wordLength: targetWord.length, firstLetter: firstLetter.toLowerCase(), originalWord: targetWord };
  }
  const regex = new RegExp(`\\b${targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const match = example.match(regex);
  if (!match || match.length === 0) {
    const modifiedExample = `${example} The ${targetWord} was important.`;
    const firstLetter = targetWord.charAt(0);
    const hint = firstLetter + '_'.repeat(targetWord.length - 1);
    return { blankedText: modifiedExample.replace(new RegExp(`\\b${targetWord}\\b`, 'gi'), hint), wordLength: targetWord.length, firstLetter: firstLetter.toLowerCase(), originalWord: targetWord };
  }
  const wordInExample = match[0];
  const firstLetter = wordInExample.charAt(0);
  const hint = firstLetter + '_'.repeat(wordInExample.length - 1);
  return { blankedText: example.replace(regex, hint), wordLength: wordInExample.length, firstLetter: firstLetter.toLowerCase(), originalWord: wordInExample };
};

export function ExampleQuiz({ word, meaning, example, onAnswer, className = "" }: ExampleQuizProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [blankedInfo, setBlankedInfo] = useState<{ blankedText: string; wordLength: number; firstLetter: string; originalWord?: string; }>({ blankedText: '', wordLength: 0, firstLetter: '' });

  useEffect(() => {
    setBlankedInfo(createBlankedExample(example, word));
    setUserAnswer(''); setShowResult(false);
  }, [example, word]);

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
    const correct = userAnswer.toLowerCase().trim() === word.toLowerCase().trim();
    setIsCorrect(correct); setShowResult(true);
    showAnswerToast(correct, word);
    if (correct) playCorrectSound(); else playIncorrectSound();
    setTimeout(() => onAnswer(correct), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer.trim() && !showResult) handleSubmit();
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="editorial-card">
        <div className="px-7 sm:px-9 pt-7 pb-5 flex items-center justify-between">
          <span className="editorial-eyebrow">Cloze · Example</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50/60 text-amber-900 text-[10.5px] font-medium tracking-wide">
            {blankedInfo.firstLetter.toUpperCase()} · {blankedInfo.wordLength} letters
          </span>
        </div>
        <div className="editorial-rule" />

        <div className="px-7 sm:px-9 pt-8 pb-4 text-center">
          <div className="editorial-eyebrow mb-3">Meaning</div>
          <h2 className="editorial-display text-[24px] sm:text-[32px] leading-snug">
            {cleanMeaningForDisplay(meaning)}
          </h2>
        </div>

        <div className="px-7 sm:px-9 pb-7">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="editorial-eyebrow mb-3">Sentence</div>
            <p className="text-[17px] sm:text-[18px] leading-relaxed font-mono text-neutral-800">
              {blankedInfo.blankedText}
            </p>
          </div>
        </div>

        <div className="editorial-rule" />

        {!showResult ? (
          <div className="px-7 sm:px-9 py-7 space-y-4">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Fill in the blank"
              className="editorial-input"
              maxLength={blankedInfo.wordLength}
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setUserAnswer('')} disabled={!userAnswer}
                className="editorial-btn-ghost flex-1">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Clear
              </Button>
              <Button onClick={handleSubmit} disabled={!userAnswer.trim()}
                className="editorial-btn-primary flex-[1.8]">
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
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <div className="editorial-eyebrow mb-2">Answer</div>
              <div className="editorial-display text-[36px] sm:text-[44px]">{word}</div>
              {!isCorrect && userAnswer && (
                <div className="mt-4 pt-4 border-t border-neutral-200/70">
                  <div className="editorial-eyebrow mb-1">Your input</div>
                  <div className="text-[15px] font-medium text-neutral-500 line-through">{userAnswer}</div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-neutral-200/70 text-left">
                <div className="editorial-eyebrow mb-1">Full sentence</div>
                <div className="text-[14px] text-neutral-700 leading-relaxed font-mono">{example}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onAnswer(isCorrect)} className="editorial-btn-primary flex-1">
                Next <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="ghost"
                className="editorial-btn-ghost px-5">
                Exit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
