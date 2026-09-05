import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Shuffle, Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, initializeAudioContext } from '@/utils/sound-effects';
import { isAdminUser } from '@/utils/admin-check';
import { showAnswerToast } from '@/utils/answer-toast';

interface SentenceQuizProps {
  koreanSentence: string;
  englishWords: string[];
  onAnswer: (isCorrect: boolean) => void;
  className?: string;
}

const shuffleArray = (array: string[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function SentenceQuiz({ koreanSentence, englishWords, onAnswer, className = "" }: SentenceQuizProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleRegenerate = () => {
    const shuffled = shuffleArray(englishWords);
    setAvailableWords(shuffled); setSelectedWords([]); setShowResult(false);
  };

  useEffect(() => {
    const shuffled = shuffleArray(englishWords);
    setAvailableWords(shuffled); setSelectedWords([]); setShowResult(false);
  }, [englishWords]);

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

  const handleWordClick = (word: string, isFromAvailable: boolean) => {
    if (showResult) return;
    if (isFromAvailable) {
      setSelectedWords(prev => [...prev, word]);
      setAvailableWords(prev => prev.filter(w => w !== word));
    } else {
      setAvailableWords(prev => [...prev, word]);
      setSelectedWords(prev => prev.filter(w => w !== word));
    }
  };

  const handleShuffle = () => {
    if (showResult) return;
    setAvailableWords(shuffleArray(availableWords));
  };

  const handleSubmit = () => {
    const userSentence = selectedWords.join(' ').toLowerCase().trim();
    const correctSentence = englishWords.join(' ').toLowerCase().trim();
    const correct = userSentence === correctSentence;
    setIsCorrect(correct); setShowResult(true);
    showAnswerToast(correct, englishWords.join(' '));
    if (correct) playCorrectSound(); else playIncorrectSound();
    setTimeout(() => onAnswer(correct), 2000);
  };

  const handleReset = () => {
    setAvailableWords(shuffleArray(englishWords));
    setSelectedWords([]); setShowResult(false);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="editorial-card">
        <div className="px-7 sm:px-9 pt-7 pb-5 flex items-center justify-between">
          <span className="editorial-eyebrow">Word Order</span>
          {isAdminUser() && (
            <Button variant="ghost" size="sm" onClick={handleRegenerate}
              className="h-7 px-2.5 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 text-[11px] gap-1">
              <RotateCcw className="w-3 h-3" /> 재출제
            </Button>
          )}
        </div>
        <div className="editorial-rule" />

        <div className="px-7 sm:px-9 pt-8 pb-7 text-center">
          <div className="editorial-eyebrow mb-3">Translate to English</div>
          <p className="editorial-display text-[24px] sm:text-[30px] leading-snug">{koreanSentence}</p>
        </div>

        <div className="editorial-rule" />

        <div className="px-7 sm:px-9 pt-6 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="editorial-eyebrow">Your sentence</span>
            <span className="text-[10.5px] tracking-tight text-neutral-400">{selectedWords.length} / {englishWords.length}</span>
          </div>
          <div className="min-h-[78px] rounded-2xl border border-dashed border-amber-300 bg-amber-50/30 p-3">
            {selectedWords.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[12.5px] text-neutral-400 py-5">
                Tap words below in order
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedWords.map((word, index) => (
                  <button key={`s-${index}`} onClick={() => handleWordClick(word, false)} disabled={showResult}
                    className="px-3.5 py-2 rounded-xl bg-neutral-950 text-white text-[13.5px] font-medium hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-60">
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-7 sm:px-9 pb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="editorial-eyebrow">Available</span>
            <button onClick={handleShuffle} disabled={showResult || availableWords.length === 0}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 disabled:opacity-40 transition-colors">
              <Shuffle className="w-3 h-3" /> Shuffle
            </button>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 min-h-[64px]">
            {availableWords.length === 0 && !showResult ? (
              <div className="text-center text-[12.5px] text-neutral-400 py-3">All words used</div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {availableWords.map((word, index) => (
                  <button key={`a-${index}`} onClick={() => handleWordClick(word, true)} disabled={showResult}
                    className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-800 text-[13.5px] font-medium hover:border-neutral-400 active:scale-95 transition-all disabled:opacity-50">
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showResult && (
          <div className="px-7 sm:px-9 pb-4 animate-in fade-in slide-in-from-bottom-2">
            <div className={`${isCorrect ? 'editorial-result-correct' : 'editorial-result-wrong'} px-6 py-5`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCorrect ? 'bg-amber-500' : 'bg-neutral-900'} text-white`}>
                  {isCorrect ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" strokeWidth={3} />}
                </div>
                <span className={`text-[12px] font-medium tracking-[0.2em] uppercase ${isCorrect ? 'text-amber-800' : 'text-neutral-700'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <div className="editorial-eyebrow mb-1.5 text-center">Answer</div>
              <div className="text-[16px] font-medium text-neutral-900 text-center font-mono">{englishWords.join(' ')}</div>
            </div>
          </div>
        )}

        <div className="px-7 sm:px-9 pb-7 pt-1 flex gap-2">
          {!showResult ? (
            <>
              <Button variant="ghost" onClick={handleReset}
                disabled={selectedWords.length === 0 && availableWords.length === englishWords.length}
                className="editorial-btn-ghost flex-1">
                Reset
              </Button>
              <Button onClick={handleSubmit} disabled={selectedWords.length !== englishWords.length}
                className="editorial-btn-primary flex-[1.8]">
                Submit <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => onAnswer(isCorrect)} className="editorial-btn-primary flex-1">
                Next <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="ghost"
                className="editorial-btn-ghost px-5">
                Exit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
