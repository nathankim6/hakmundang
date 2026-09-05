
import React from 'react';
export const AppHeader = () => {
  React.useEffect(() => {
    // Load Nanum Gothic font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);
  return <div className="flex items-center justify-center space-x-6 p-6 rounded-2xl bg-gradient-to-br from-[#1A1F2C] via-[#222222] to-[#403E43] shadow-xl border border-slate-700 relative overflow-hidden">
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
        backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(155, 135, 245, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(214, 188, 250, 0.2) 0%, transparent 50%)
            `,
        backgroundSize: '50px 50px',
        backgroundPosition: '0 0, 25px 25px'
      }}>
        </div>
      </div>

      {/* AI-themed decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Circuit lines with shimmer effect */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-30">
          <div className="absolute top-4 left-4 w-16 h-[1px] bg-blue-300 rotate-45 animate-pulse"></div>
          <div className="absolute top-8 left-8 w-12 h-[1px] bg-purple-300 -rotate-45 animate-pulse delay-150"></div>
          <div className="absolute top-12 left-2 w-8 h-[1px] bg-cyan-300 rotate-90 animate-pulse delay-300"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30">
          <div className="absolute bottom-4 right-4 w-16 h-[1px] bg-blue-300 -rotate-45 animate-pulse delay-200"></div>
          <div className="absolute bottom-8 right-8 w-12 h-[1px] bg-purple-300 rotate-45 animate-pulse delay-300"></div>
          <div className="absolute bottom-12 right-2 w-8 h-[1px] bg-cyan-300 -rotate-90 animate-pulse delay-400"></div>
        </div>

        {/* Glowing dots with enhanced animation */}
        <div className="absolute top-6 left-1/4 w-2 h-2 bg-blue-300 rounded-full opacity-60 animate-[twinkle_2s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-6 right-1/4 w-2 h-2 bg-purple-300 rounded-full opacity-60 animate-[twinkle_2s_ease-in-out_infinite_150ms]"></div>
        <div className="absolute top-1/2 left-8 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-50 animate-[twinkle_2s_ease-in-out_infinite_300ms]"></div>
        <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-50 animate-[twinkle_2s_ease-in-out_infinite_450ms]"></div>

        {/* Binary code effect with shimmer */}
        <div className="absolute top-0 right-0 text-[8px] font-mono opacity-20 tracking-wider rotate-12 text-blue-200 animate-[shimmer_3s_ease-in-out_infinite]">
          10110101<br />01001010<br />11010101
        </div>
        <div className="absolute bottom-0 left-0 text-[8px] font-mono opacity-20 tracking-wider -rotate-12 text-purple-200 animate-[shimmer_3s_ease-in-out_infinite_200ms]">
          01101001<br />10010110<br />01011010
        </div>
      </div>
      
      {/* Logo container with glowing effect - removed bg-white to eliminate rectangle */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center relative z-10 shadow-lg transition-transform duration-300 hover:scale-105 before:content-[''] before:absolute before:inset-[-2px] before:rounded-full before:bg-gradient-to-r before:from-white/60 before:via-white/80 before:to-white/60 before:animate-gradient before:blur-md">
        <img 
          src="/lovable-uploads/e36fff79-0408-4bd9-9340-7486553d52d5.png" 
          alt="학문당입시학원 Logo" 
          className="w-full h-full p-0 object-cover relative z-10 rounded-full" 
        />
      </div>
      
      {/* Title section with enhanced styling */}
      <div className="flex flex-col items-center relative z-10">
        {/* Main title */}
        <h1 className="text-7xl font-bold tracking-[0.2em] relative mb-1">
          <span className="glass-title glow-effect" data-text="MENTORS TABLE QUIZ MAKER">ACADEMIA</span>
        </h1>
        <div className="title-bar glow-bar mb-1"></div>
        {/* Subtitle text with glowing effect */}
        <h2 className="glass-title glow-effect text-lg tracking-wider relative">
          AI ENGLISH QUIZ MAKER
        </h2>
      </div>
    </div>;
};
