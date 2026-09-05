import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showAnswerToast } from '@/utils/answer-toast';

interface WordData {
  word: string;
  meaning: string;
  derivatives?: Array<{ word: string; meaning: string; }>;
}

interface WordQuizProps {
  wordData: WordData;
  onAnswer: (isCorrect: boolean) => void;
  className?: string;
}

export function WordQuiz({ wordData, onAnswer, className = "" }: WordQuizProps) {
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<{ [key: string]: boolean }>({});

  const questions = [
    { id: 'main', word: wordData.word, meaning: wordData.meaning },
    ...(wordData.derivatives || []).map((derivative, index) => ({
      id: `derivative-${index}`, word: derivative.word, meaning: derivative.meaning
    }))
  ];

  useEffect(() => {
    setUserAnswers({}); setShowResult(false); setResults({});
  }, [wordData]);

  const handleInputChange = (questionId: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    const newResults: { [key: string]: boolean } = {};
    let allCorrect = true;
    questions.forEach(q => {
      const userAnswer = userAnswers[q.id]?.toLowerCase().trim() || '';
      const correctAnswer = q.meaning.toLowerCase().trim();
      const isCorrect = userAnswer === correctAnswer;
      newResults[q.id] = isCorrect;
      if (!isCorrect) allCorrect = false;
    });
    setResults(newResults); setShowResult(true);
    showAnswerToast(allCorrect);
    setTimeout(() => onAnswer(allCorrect), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult && Object.keys(userAnswers).length === questions.length) {
      if (questions.every(q => userAnswers[q.id]?.trim())) handleSubmit();
    }
  };

  const handleReset = () => {
    setUserAnswers({}); setShowResult(false); setResults({});
  };

  const allAnswered = questions.every(q => userAnswers[q.id]?.trim());
  const allCorrect = Object.values(results).every(r => r);

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="editorial-card">
        <div className="px-7 sm:px-9 pt-7 pb-5 text-center">
          <div className="editorial-eyebrow mb-2">English → Korean</div>
          <p className="text-[12.5px] text-neutral-500 tracking-tight">한글로 뜻을 입력하세요</p>
        </div>
        <div className="editorial-rule" />

        <div className="px-7 sm:px-9 py-6 space-y-3">
          {questions.map((q, index) => (
            <div key={q.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <div className="flex items-baseline justify-between mb-2.5">
                <span className="editorial-eyebrow">
                  {index === 0 ? 'Headword' : `Derivative ${index}`}
                </span>
                <span className="editorial-display text-[22px]">{q.word}</span>
              </div>
              <Input
                value={userAnswers[q.id] || ''}
                onChange={(e) => handleInputChange(q.id, e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="뜻을 입력하세요"
                disabled={showResult}
                className={cn(
                  "h-11 text-center text-[15px] rounded-xl bg-white border-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-950/20",
                  showResult && results[q.id] !== undefined && (
                    results[q.id]
                      ? "border-amber-300 bg-amber-50/40"
                      : "border-neutral-400 bg-neutral-100"
                  )
                )}
              />
              {showResult && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[12px]">
                  {results[q.id] ? (
                    <><Check className="w-3.5 h-3.5 text-amber-600" strokeWidth={3} />
                      <span className="text-amber-800 font-medium">{q.meaning}</span></>
                  ) : (
                    <><X className="w-3.5 h-3.5 text-neutral-700" strokeWidth={3} />
                      <span className="text-neutral-800 font-medium">정답: {q.meaning}</span>
                      {userAnswers[q.id] && <span className="text-neutral-400 ml-1">· 입력: {userAnswers[q.id]}</span>}</>
                  )}
                </div>
              )}
            </div>
          ))}

          {showResult && (
            <div className={`${allCorrect ? 'editorial-result-correct' : 'editorial-result-wrong'} px-5 py-4 text-center`}>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${allCorrect ? 'bg-amber-500' : 'bg-neutral-900'} text-white`}>
                  {allCorrect ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" strokeWidth={3} />}
                </div>
                <span className={`text-[12.5px] font-medium tracking-[0.2em] uppercase ${allCorrect ? 'text-amber-800' : 'text-neutral-700'}`}>
                  {allCorrect ? 'All Correct' : `${Object.values(results).filter(r => r).length} / ${questions.length}`}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="px-7 sm:px-9 pb-7 flex gap-2">
          {!showResult ? (
            <>
              <Button variant="ghost" onClick={handleReset} disabled={Object.keys(userAnswers).length === 0}
                className="editorial-btn-ghost flex-1">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Clear
              </Button>
              <Button onClick={handleSubmit} disabled={!allAnswered}
                className="editorial-btn-primary flex-[1.8]">
                Submit <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => onAnswer(allCorrect)} className="editorial-btn-primary flex-1">
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
