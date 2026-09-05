import { useState, useEffect, useRef } from 'react';
import { Check, X, Sparkles } from 'lucide-react';

interface MeaningInputProps {
  position: { x: number; y: number };
  selectedText: string;
  onSubmit: (meaning: string) => void;
  onClose: () => void;
}

export function MeaningInput({ position, selectedText, onSubmit, onClose }: MeaningInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed z-[9999] animate-scale-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y + 30}px`,
        transform: 'translate(-50%, 0)'
      }}
    >
      {/* Arrow pointing up */}
      <div className="flex justify-center -mb-[1px]">
        <div className="w-3 h-3 bg-gradient-to-br from-primary/20 to-card border-t border-l border-primary/30 rotate-45 translate-y-1.5" />
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 rounded-xl shadow-xl shadow-primary/10 p-3 min-w-[220px] backdrop-blur-sm">
          {/* Header with selected text */}
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border/50">
            <Sparkles className="w-3 h-3 text-primary/70" />
            <span className="text-[11px] font-medium text-primary/80 truncate max-w-[180px]">
              {selectedText}
            </span>
          </div>
          
          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="뜻/해석을 입력하세요..."
            className="w-full px-3 py-2 text-sm bg-background/80 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
          />
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-2.5">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              확인
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              취소
            </button>
          </div>
          
          {/* Hint text */}
          <div className="mt-2 text-center">
            <span className="text-[9px] text-muted-foreground/60">
              Enter로 확인 · ESC로 취소
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
