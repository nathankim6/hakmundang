import React from 'react';

export const AppHeader = () => {
  return (
    <div className="flex items-center justify-center space-x-6 p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white shadow-xl border border-slate-100 relative">
      {/* Logo container with refined styling */}
      <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center relative z-10 shadow-lg transition-transform duration-300 hover:scale-105">
        <img 
          src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
          alt="ORUN ACADEMY Logo" 
          className="w-24 h-24 object-contain"
        />
      </div>
      
      {/* Title section with modern styling */}
      <div className="flex flex-col items-center relative z-10">
        <h1 className="text-6xl font-bold tracking-wider relative">
          <span className="glass-title" data-text="ORUN AI QUIZ MAKER">
            ORUN AI QUIZ MAKER
          </span>
        </h1>
        <div className="title-bar"></div>
      </div>
    </div>
  );
};