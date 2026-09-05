import { Progress } from "@/components/ui/progress";
import { Sparkles, StopCircle, Brain, Zap, Cpu, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingProgressProps {
  current: number;
  total: number;
  onStop: () => void;
}

export const LoadingProgress = ({ current, total, onStop }: LoadingProgressProps) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="relative font-inter">
      {/* Ultra-compact horizontal layout */}
      <div className="relative p-3 rounded-xl bg-gradient-to-r from-slate-50/95 to-blue-50/95 backdrop-blur-sm border border-slate-200/60 shadow-lg overflow-hidden">
        
        {/* Minimal accent strip */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 to-indigo-500/3"></div>
        
        <div className="relative z-10">
          {/* Compact horizontal layout */}
          <div className="flex items-center gap-4">
            {/* Icon + Status */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Brain className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 font-noto leading-tight">
                  문제가 생성중입니다.
                </h3>
                <p className="text-xs text-slate-500">AI 엔진 동작 중</p>
              </div>
            </div>

            {/* Progress Bar - Takes remaining space */}
            <div className="flex-1 relative mx-4">
              <div className="relative">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-wave"></div>
                  </div>
                </div>
                
                {/* Step indicators below progress */}
                <div className="absolute -bottom-3 left-0 right-0 flex justify-between">
                  {Array.from({ length: Math.min(total, 8) }, (_, i) => {
                    const stepIndex = Math.floor((i * total) / Math.min(total, 8));
                    return (
                      <div 
                        key={i}
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${
                          stepIndex < current 
                            ? 'bg-emerald-500' 
                            : stepIndex === current 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-slate-300'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Progress Info + Actions */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-mono">
                    {current}/{total}
                  </span>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded text-xs font-mono">
                    {percentage}%
                  </div>
                </div>
                <div className="text-xs text-slate-500">완료</div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onStop}
                className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <StopCircle className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">중단</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};