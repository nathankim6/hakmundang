import React from 'react';

export const AppHeader = () => {
  return (
    <div className="flex items-center justify-center space-x-6 p-8 rounded-2xl bg-gradient-to-r from-[#E5F6FF]/90 via-[#F0FAFF]/80 to-[#E5F6FF]/90 shadow-lg border border-[#38BDF8]/20 backdrop-blur-sm relative overflow-hidden">
      {/* Sophisticated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/20 via-[#38BDF8]/15 to-[#7DD3FC]/10 opacity-90 animate-gradient"></div>
      
      {/* Enhanced radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(186,230,253,0.2),transparent_70%)] mix-blend-overlay"></div>
      
      {/* Logo container with refined styling */}
      <div className="group w-28 h-28 rounded-full bg-gradient-to-br from-[#F0FAFF] via-white to-[#E5F6FF] flex items-center justify-center relative z-10 border border-[#38BDF8]/30 shadow-[0_8px_32px_-8px_rgba(56,189,248,0.3)] transition-all duration-1000 hover:shadow-[0_12px_36px_-8px_rgba(56,189,248,0.4)] hover:scale-105">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#38BDF8]/10 via-transparent to-[#7DD3FC]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="absolute inset-0 rounded-full shadow-inner"></div>
        <img 
          src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
          alt="ORUN ACADEMY Logo" 
          className="w-24 h-24 object-contain drop-shadow-lg transition-transform duration-1000 group-hover:scale-105"
        />
      </div>
      
      {/* Title section with enhanced styling */}
      <div className="flex flex-col items-center relative z-10">
        <div className="title-sparkle"></div>
        <h1 className="text-7xl font-bold tracking-wider relative group">
          <span className="glass-title inline-block transform transition-transform group-hover:scale-105 duration-1000">
            ORUN AI QUIZ MAKER
          </span>
        </h1>
        <div className="title-bar"></div>
      </div>

      {/* Refined border gradients */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#38BDF8]/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#38BDF8]/20 to-transparent"></div>
      <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#38BDF8]/20 to-transparent"></div>
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#38BDF8]/20 to-transparent"></div>
    </div>
  );
};