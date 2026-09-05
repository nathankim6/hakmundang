import { cn } from "@/lib/utils";

export type ProblemType = 'translation' | 'arrangement' | 'writing';

interface ProblemCardProps {
  number: number;
  koreanSentence: string;
  hints?: string[];
  wordCount?: number;
  instructions?: string;
  type?: ProblemType;
  className?: string;
}

const typeLabels: Record<ProblemType, { label: string; class: string }> = {
  translation: { label: '번역', class: 'type-badge-translation' },
  arrangement: { label: '배열', class: 'type-badge-arrangement' },
  writing: { label: '서술형', class: 'type-badge-writing' },
};

export function ProblemCard({
  number,
  koreanSentence,
  hints,
  wordCount,
  instructions,
  type = 'translation',
  className,
}: ProblemCardProps) {
  const typeInfo = typeLabels[type];
  
  return (
    <div className={cn("problem-card group transition-all duration-300 hover:shadow-elevated", className)}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Number Badge */}
        <div className={cn(
          "flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
          type === 'arrangement' ? "question-number-gold" : "question-number"
        )}>
          {String(number).padStart(2, '0')}
        </div>
        
        {/* Type Badge & Instructions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("type-badge", typeInfo.class)}>
              {typeInfo.label}
            </span>
            {wordCount && (
              <span className="text-xs text-muted-foreground">
                ({wordCount} 단어)
              </span>
            )}
          </div>
          {instructions && (
            <p className="text-xs text-muted-foreground italic">
              {instructions}
            </p>
          )}
        </div>
      </div>
      
      {/* Korean Sentence */}
      <div className="mb-6">
        <p className="text-lg font-serif leading-relaxed text-foreground">
          {koreanSentence}
        </p>
      </div>
      
      {/* Hints/Words */}
      {hints && hints.length > 0 && (
        <div className="hint-box mb-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Words & Phrases
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hints.map((hint, index) => (
              <span key={index} className="word-chip">
                {hint}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Answer Area */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Your Answer</span>
        </div>
        <div className="writing-area min-h-[100px] bg-card/50">
          {/* Lines for writing */}
        </div>
      </div>
    </div>
  );
}
