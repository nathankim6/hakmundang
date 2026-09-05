import { Sparkles, BookOpen } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  progress: number;
}

export const ProcessingModal = ({ isOpen, progress }: ProcessingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
        <div className="text-center">
          {/* Animated icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary-foreground animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2">
            단어장을 생성하고 있습니다
          </h3>
          <p className="text-muted-foreground mb-6">
            {progress < 70 ? '데이터를 처리하고 있습니다...' : '데이터베이스에 저장 중입니다...'}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-3 mb-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {progress}% 완료
          </p>

          {/* Tips */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl text-left">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-medium">Tip</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI가 IPA 발음기호와 문맥에 맞는 예문을 자동으로 생성합니다. 
              단어 수에 따라 시간이 조금 걸릴 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
