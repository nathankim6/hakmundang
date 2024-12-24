import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

interface LoadingProgressProps {
  current: number;
  total: number;
}

export const LoadingProgress = ({ current, total }: LoadingProgressProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-4 p-6 rounded-lg border-2 border-[#9b87f5]/20 relative bg-[#F8F7FF]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#9b87f5] animate-pulse" />
          <span className="font-semibold text-[#7E69AB]">문제 생성 중...</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {current} / {total}
        </span>
      </div>

      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-2 bg-[#E5DEFF]"
        />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#9b87f5]/60 animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};