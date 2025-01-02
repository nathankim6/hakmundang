import React from 'react';

export const AppHeader = () => {
  return (
    <div className="flex items-center justify-center space-x-6 p-8 rounded-2xl bg-gradient-to-r from-white/80 via-gray-50/50 to-white/80 shadow-lg border border-gray-200 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 via-[#9b87f5]/15 to-[#D946EF]/10 opacity-90 animate-gradient"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(229,222,255,0.4),transparent_70%)] mix-blend-overlay"></div>
      
      <div className="group w-28 h-28 rounded-full bg-gradient-to-br from-white via-[#F1F0FB] to-[#F6F6F7] flex items-center justify-center relative z-10 border border-white/50 shadow-[0_8px_32px_-8px_rgba(139,92,246,0.3)] transition-all duration-300 hover:shadow-[0_12px_36px_-8px_rgba(139,92,246,0.4)] hover:scale-105">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 rounded-full shadow-inner"></div>
        <img 
          src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
          alt="ORUN ACADEMY Logo" 
          className="w-24 h-24 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="flex flex-col items-center relative z-10">
        <div className="title-sparkle"></div>
        <h1 className="text-7xl font-bold animate-title tracking-wider relative group">
          <span className="inline-block transform transition-transform group-hover:scale-105 duration-300">
            ORUN AI QUIZ MAKER
          </span>
        </h1>
        <div className="title-bar"></div>
      </div>

      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
    </div>
  );
};