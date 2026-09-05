import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, RotateCcw, Lightbulb, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playCorrectSound, playIncorrectSound, initializeAudioContext } from '@/utils/sound-effects';
import { isAdminUser } from '@/utils/admin-check';
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

interface ReverseQuizProps {
  meaning: string;
  correctWord: string;
  onAnswer: (isCorrect: boolean) => void;
  className?: string;
}

export function ReverseQuiz({ meaning, correctWord, onAnswer, className }: ReverseQuizProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { toast } = useToast();

  const handleRegenerate = () => {
    setUserAnswer(""); setShowResult(false); setIsCorrect(false); setShowHint(false);
    toast({ title: "재출제 완료", description: "새로운 문제가 생성되었습니다." });
  };

  useEffect(() => {
    setUserAnswer(""); setShowResult(false); setIsCorrect(false); setShowHint(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    const correct = userAnswer.trim().toLowerCase() === correctWord.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    showAnswerToast(correct, correctWord);
    if (correct) {
      playCorrectSound();
      setTimeout(() => onAnswer(correct), 1500);
    } else {
      playIncorrectSound();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit(e as any);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className || ''}`}>
      <div className="editorial-card">
        <div className="px-7 sm:px-9 pt-7 pb-5 flex items-center justify-between">
          <span className="editorial-eyebrow">Korean → English</span>
          {isAdminUser() && (
            <Button variant="ghost" size="sm" onClick={handleRegenerate}
              className="h-7 px-2.5 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 text-[11px] gap-1">
              <RotateCcw className="w-3 h-3" /> 재출제
            </Button>
          )}
        </div>
        <div className="editorial-rule" />

        <div className="px-7 sm:px-9 pt-10 pb-8 text-center">
          <div className="editorial-eyebrow mb-4">Translate</div>
          <h2 className="editorial-display text-[32px] sm:text-[42px] md:text-[50px]">
            {cleanMeaningForDisplay(meaning)}
          </h2>
          {showHint && !showResult && (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-200 bg-amber-50/60 animate-in fade-in slide-in-from-top-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-mono text-[14px] tracking-[0.3em] text-neutral-900 font-medium">
                {correctWord.charAt(0).toUpperCase()}{'•'.repeat(correctWord.length - 1)}
              </span>
              <span className="text-[11px] text-neutral-500">{correctWord.length} letters</span>
            </div>
          )}
        </div>

        <div className="editorial-rule" />

        {!showResult ? (
          <form onSubmit={handleSubmit} className="px-7 sm:px-9 py-7 space-y-4">
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type the English word"
              className="editorial-input"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowHint(true)} disabled={showHint}
                className="editorial-btn-ghost flex-1">
                <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Hint
              </Button>
              <Button type="submit" disabled={!userAnswer.trim()}
                className="editorial-btn-primary flex-[1.8]">
                Submit <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
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
              <div className="editorial-display text-[36px] sm:text-[44px]">{correctWord}</div>
              {!isCorrect && userAnswer && (
                <div className="mt-4 pt-4 border-t border-neutral-200/70">
                  <div className="editorial-eyebrow mb-1">Your input</div>
                  <div className="text-[15px] font-medium text-neutral-500 line-through">{userAnswer}</div>
                </div>
              )}
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
