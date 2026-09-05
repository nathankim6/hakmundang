import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlyingWord {
  id: number;
  word: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface InteractiveWordBankProps {
  words: string[];
  correctAnswer: string;
  onAnswerChange: (answer: string) => void;
  problemIndex: number;
}

export function InteractiveWordBank({ 
  words, 
  correctAnswer, 
  onAnswerChange,
  problemIndex 
}: InteractiveWordBankProps) {
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [flyingWords, setFlyingWords] = useState<FlyingWord[]>([]);

  // 문제가 바뀔 때마다 초기화
  useEffect(() => {
    setAvailableWords([...words]);
    setSelectedWords([]);
    setFlyingWords([]);
  }, [words, problemIndex]);

  // 선택된 단어가 바뀔 때 answer 업데이트
  useEffect(() => {
    onAnswerChange(selectedWords.join(' '));
  }, [selectedWords, onAnswerChange]);

  const handleWordClick = (word: string, index: number, event: React.MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const buttonRect = button.getBoundingClientRect();
    
    // 답안 영역 찾기
    const answerArea = document.getElementById(`answer-area-${problemIndex}`);
    if (!answerArea) return;
    
    const answerRect = answerArea.getBoundingClientRect();
    
    // 날아가는 애니메이션 시작
    const flyingId = Date.now();
    setFlyingWords(prev => [...prev, {
      id: flyingId,
      word,
      startX: buttonRect.left,
      startY: buttonRect.top,
      endX: answerRect.left + answerRect.width / 2,
      endY: answerRect.top + answerRect.height / 2,
    }]);

    // 보기에서 단어 제거
    setAvailableWords(prev => {
      const newWords = [...prev];
      newWords.splice(index, 1);
      return newWords;
    });

    // 애니메이션 후 단어 추가
    setTimeout(() => {
      setSelectedWords(prev => [...prev, word]);
      setFlyingWords(prev => prev.filter(fw => fw.id !== flyingId));
    }, 350);
  };

  const handleRemoveWord = (index: number) => {
    const word = selectedWords[index];
    setSelectedWords(prev => {
      const newWords = [...prev];
      newWords.splice(index, 1);
      return newWords;
    });
    setAvailableWords(prev => [...prev, word]);
  };

  const handleReset = () => {
    setAvailableWords([...words]);
    setSelectedWords([]);
    setFlyingWords([]);
  };

  return (
    <div className="space-y-5">
      {/* 보기 단어들 */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Word Bank
        </p>
        <div className="flex flex-wrap gap-2.5 min-h-[52px] p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/50 shadow-inner">
          {availableWords.map((word, index) => (
            <button
              type="button"
              key={`${word}-${index}`}
              onClick={(e) => handleWordClick(word, index, e)}
              className="group relative px-4 py-2 bg-background hover:bg-primary/5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-border/60 hover:border-primary/40 shadow-sm hover:shadow-md"
            >
              <span className="relative z-10">{word}</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
          {availableWords.length === 0 && (
            <span className="text-muted-foreground/60 text-sm italic py-2">
              All words have been placed
            </span>
          )}
        </div>
      </div>

      {/* 답안 영역 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Answer
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        </div>
        <div 
          id={`answer-area-${problemIndex}`}
          className="min-h-[64px] p-4 bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] border-2 border-dashed border-primary/25 rounded-xl flex flex-wrap gap-2.5 items-center transition-colors hover:border-primary/40"
        >
          {selectedWords.length === 0 ? (
            <span className="text-muted-foreground/50 text-sm italic">
              Click words above to build your sentence...
            </span>
          ) : (
            selectedWords.map((word, index) => (
              <button
                type="button"
                key={`selected-${word}-${index}`}
                onClick={() => handleRemoveWord(index)}
                className="group relative px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium tracking-wide transition-all duration-200 hover:bg-primary/85 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md hover:shadow-lg"
                title="Click to remove"
              >
                <span className="relative z-10">{word}</span>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/10 to-transparent" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* 날아가는 단어 애니메이션 */}
      {flyingWords.map(fw => (
        <div
          key={fw.id}
          className="fixed pointer-events-none z-50 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-xl"
          style={{
            left: fw.startX,
            top: fw.startY,
            animation: 'flyToAnswer 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            '--end-x': `${fw.endX - fw.startX}px`,
            '--end-y': `${fw.endY - fw.startY}px`,
          } as React.CSSProperties}
        >
          {fw.word}
        </div>
      ))}

      <style>{`
        @keyframes flyToAnswer {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.3)) scale(1.1);
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}