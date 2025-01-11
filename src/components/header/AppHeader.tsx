import React from 'react';

export const AppHeader = () => {
  return (
    <div className="flex items-center justify-center space-x-6 p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white shadow-xl border border-slate-100 relative overflow-hidden">
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(155, 135, 245, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(214, 188, 250, 0.1) 0%, transparent 50%)
            `,
            backgroundSize: '50px 50px',
            backgroundPosition: '0 0, 25px 25px'
          }}>
        </div>
      </div>
      
      {/* Logo container with refined styling */}
      <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center relative z-10 shadow-lg transition-transform duration-300 hover:scale-105">
        <img 
          src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
          alt="ORUN ACADEMY Logo" 
          className="w-24 h-24 object-contain"
        />
      </div>
      
      {/* Title section with enhanced styling */}
      <div className="flex flex-col items-center relative z-10">
        <h1 className="text-6xl font-bold tracking-wider relative">
          <span className="glass-title glow-effect" data-text="ORUN AI QUIZ MAKER">
            ORUN AI QUIZ MAKER
          </span>
        </h1>
        <div className="title-bar glow-bar"></div>
      </div>
    </div>
  );
};