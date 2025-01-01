import React from 'react';

export const AppHeader = () => {
  return (
    <div className="flex items-center justify-center space-x-6">
      <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg">
        <img 
          src="/lovable-uploads/352a49ca-b123-4f07-992a-cf59e4b7058a.png" 
          alt="ORUN ACADEMY Logo" 
          className="w-28 h-28 object-contain"
        />
      </div>
      
      <div className="flex flex-col items-center relative">
        <div className="title-sparkle"></div>
        <h1 className="text-7xl font-bold animate-title tracking-wider relative group">
          <span className="inline-block transform transition-transform group-hover:scale-105 duration-300">
            ORUN AI QUIZ MAKER
          </span>
        </h1>
      </div>
    </div>
  );
};