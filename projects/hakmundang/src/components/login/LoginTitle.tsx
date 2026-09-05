
import React from 'react';

export const LoginTitle = () => {
  return (
    <div className="space-y-2 text-center">
      <h1 className="text-3xl font-medium animate-title relative group transition-all duration-300 whitespace-nowrap">
        <span className="inline-block transform hover:scale-105 transition-transform duration-300 relative text-[#E5E7EB] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          학문당 AI QUIZ MAKER
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
        </span>
      </h1>
    </div>
  );
};
