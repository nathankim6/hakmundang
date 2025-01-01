import React from 'react';

export const AppHeader = () => {
  return (
    <div className="flex items-center justify-center space-x-6 p-8 rounded-2xl bg-gradient-to-r from-white/80 via-gray-50/50 to-white/80 shadow-lg border border-gray-200 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E5E7EB]/40 to-[#9CA3AF]/30 opacity-70 animate-gradient"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(156,163,175,0.3),transparent_70%)] mix-blend-overlay"></div>
      
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F1F0FB] to-[#F6F6F7] flex items-center justify-center shadow-lg relative z-10 border border-gray-100">
        <img 
          src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
          alt="ORUN ACADEMY Logo" 
          className="w-28 h-28 object-contain"
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