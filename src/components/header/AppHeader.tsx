import React from 'react';

export const AppHeader = () => {
  return (
    <div className="flex items-center justify-center space-x-6 p-8 rounded-2xl bg-gradient-to-r from-white/90 via-gray-50/80 to-white/90 shadow-lg border border-white/20 backdrop-blur-sm relative overflow-hidden">
      {/* Enhanced gradient overlay with darker navy tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a237e]/30 via-[#283593]/20 to-[#3949ab]/15 opacity-90 animate-gradient mix-blend-overlay"></div>
      
      {/* Elegant radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(249,255,182,0.2),transparent_70%)] mix-blend-overlay"></div>
      
      {/* Logo container with enhanced styling */}
      <div className="group w-28 h-28 rounded-full bg-gradient-to-br from-[#F1F0FB] via-white to-[#F6F6F7] flex items-center justify-center relative z-10 border border-white/50 shadow-[0_8px_32px_-8px_rgba(155,135,245,0.3)] transition-all duration-1200 hover:shadow-[0_12px_36px_-8px_rgba(155,135,245,0.4)] hover:scale-105">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#9b87f5]/10 via-transparent to-[#D946EF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1200"></div>
        <div className="absolute inset-0 rounded-full shadow-inner"></div>
        <img 
          src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
          alt="ORUN ACADEMY Logo" 
          className="w-24 h-24 object-contain drop-shadow-lg transition-transform duration-1200 group-hover:scale-105"
        />
      </div>
      
      {/* Title section with enhanced styling */}
      <div className="flex flex-col items-center relative z-10">
        <div className="title-sparkle"></div>
        <h1 className="text-7xl font-bold tracking-wider relative group">
          <span className="glass-title inline-block transform transition-transform group-hover:scale-105 duration-1200">
            ORUN AI QUIZ MAKER
          </span>
        </h1>
        <div className="title-bar"></div>
      </div>

      {/* Refined border gradients */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#9b87f5]/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#9b87f5]/20 to-transparent"></div>
      <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#9b87f5]/20 to-transparent"></div>
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#9b87f5]/20 to-transparent"></div>
    </div>
  );
};