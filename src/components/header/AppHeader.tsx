import React from 'react';

export const AppHeader = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Luxury gradient background with animated overlay */}
      <div className="absolute inset-0 bg-luxury-gradient opacity-90"></div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-luxury-accent/20 to-transparent animate-gradient"></div>
      
      {/* Content container */}
      <div className="relative z-10 flex items-center justify-center space-x-6 p-8">
        {/* Logo with enhanced styling */}
        <div className="relative transform transition-transform duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-luxury-accent/20 rounded-full blur-xl animate-pulse"></div>
          <img 
            src="/lovable-uploads/f91b258e-bdcf-40aa-95e8-5668f20b8129.png" 
            alt="학문당입시학원 Logo" 
            className="relative w-24 h-24 object-contain"
          />
        </div>
        
        {/* Title section with luxury styling */}
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-bold tracking-wider text-[#1A1F2C] relative group">
            학문당 AI QUIZ MAKER
            <div className="absolute inset-0 bg-luxury-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </h1>
          
          {/* Animated underline */}
          <div className="h-1 w-full mt-4 bg-gradient-to-r from-transparent via-luxury-accent to-transparent rounded-full">
            <div className="h-full w-1/3 bg-white/30 rounded-full animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};