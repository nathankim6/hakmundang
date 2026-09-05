
import React from 'react';
import { BarChart3, Monitor, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardButtonProps {
  onClick: () => void;
  className?: string;
}

const DashboardButton = ({ onClick, className }: DashboardButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          variant="outline"
          size="icon"
          className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                     hover:from-blue-900/50 hover:via-blue-800/50 hover:to-blue-900/50
                     border-2 border-blue-500/30 hover:border-blue-400/60
                     text-blue-400 hover:text-blue-300
                     shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl
                     transition-all duration-300 ease-out
                     overflow-hidden group transform hover:scale-105
                     ${className}`}
          aria-label="상황판 열기"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-blue-600/20 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300
                         animate-gradient-x"></div>
          
          {/* Holographic border effect */}
          <div className="absolute inset-0 rounded-md border border-blue-400/20 
                         group-hover:border-blue-300/40 transition-colors duration-300"></div>
          
          {/* Main icon container */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {/* Default icon */}
            <BarChart3 className="h-5 w-5 transition-all duration-300 
                                group-hover:scale-110 group-hover:rotate-6
                                group-hover:opacity-0" />
            
            {/* Hover icon */}
            <Activity className="h-5 w-5 absolute opacity-0 scale-75 -rotate-6
                               group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-0
                               transition-all duration-300" />
          </div>
          
          {/* Animated scanning lines */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] 
                         bg-gradient-to-r from-transparent via-blue-400 to-transparent
                         animate-pulse group-hover:animate-ping"></div>
          
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] 
                         bg-gradient-to-r from-transparent via-blue-300/50 to-transparent
                         group-hover:via-blue-200/70 transition-colors duration-300"></div>
          
          {/* Side accent lines */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] 
                         bg-gradient-to-b from-transparent via-blue-400/30 to-transparent
                         group-hover:via-blue-300/50 transition-colors duration-300"></div>
          <div className="absolute right-0 top-0 bottom-0 w-[1px] 
                         bg-gradient-to-b from-transparent via-blue-400/30 to-transparent
                         group-hover:via-blue-300/50 transition-colors duration-300"></div>
          
          {/* Corner indicators */}
          <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-blue-400/40
                         group-hover:border-blue-300/60 transition-colors duration-300"></div>
          <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-blue-400/40
                         group-hover:border-blue-300/60 transition-colors duration-300"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-blue-400/40
                         group-hover:border-blue-300/60 transition-colors duration-300"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-blue-400/40
                         group-hover:border-blue-300/60 transition-colors duration-300"></div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-blue-400 rounded-full 
                           animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-3 right-3 w-0.5 h-0.5 bg-cyan-400 rounded-full 
                           animate-bounce opacity-50" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-blue-300 rounded-full 
                           animate-bounce opacity-70" style={{ animationDelay: '1s' }}></div>
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent 
        className="bg-slate-900/95 border border-blue-400/30 text-blue-100 font-medium
                   shadow-lg shadow-blue-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <span>상황판 대시보드</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default DashboardButton;
