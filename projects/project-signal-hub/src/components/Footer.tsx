
import React from "react";

export function Footer() {
  return (
    <footer className="relative w-full py-6 mt-auto border-t border-border/30 bg-gradient-to-r from-slate-50/80 via-white/90 to-slate-50/80 dark:from-slate-900/80 dark:via-slate-800/90 dark:to-slate-900/80 backdrop-blur-sm overflow-hidden">
      {/* 은은한 배경 빛 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/15 to-pink-100/20 dark:from-blue-900/10 dark:via-purple-900/8 dark:to-pink-900/10"></div>
      
      {/* 움직이는 빛 효과 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
      </div>
      
      {/* 반짝이는 파티클 */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-2 left-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
        <div className="absolute top-3 right-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1.2s' }}></div>
        <div className="absolute bottom-2 left-1/3 w-1 h-1 bg-pink-300 rounded-full animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-3 right-1/4 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping" style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}></div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground relative z-10">
        <div className="relative inline-block">
          <span className="relative bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 dark:from-slate-300 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent font-medium">
            Copyright © 2025 ORUN ENGLISH. All rights reserved.
          </span>
          
          {/* 텍스트 뒤 은은한 글로우 */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/15 to-pink-500/10 blur-lg -z-10"></div>
        </div>
      </div>
      
      {/* 하단 테두리 글로우 */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </footer>
  );
}
