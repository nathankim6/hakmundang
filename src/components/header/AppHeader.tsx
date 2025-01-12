import React from 'react';

export const AppHeader = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Luxury gradient background with animated overlay */}
      <div className="absolute inset-0 bg-luxury-gradient opacity-90"></div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-luxury-accent/20 to-transparent animate-gradient"></div>
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8">
        <div className="flex items-center space-x-6 w-full justify-center">
          {/* Logo with enhanced styling */}
          <div className="relative transform transition-transform duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-luxury-accent/20 rounded-full blur-xl animate-pulse"></div>
            <img 
              src="/lovable-uploads/f91b258e-bdcf-40aa-95e8-5668f20b8129.png" 
              alt="학문당입시학원 Logo" 
              className="relative w-24 h-24 rounded-full object-cover"
            />
          </div>
          
          {/* Title section with platinum metallic styling */}
          <div className="flex flex-col items-center">
            <h1 className="text-6xl font-bold tracking-wider platinum-title relative group">
              학문당 AI QUIZ MAKER
              <div className="absolute inset-0 bg-luxury-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </h1>
          </div>
        </div>

        {/* Shimmering bar decoration - adjusted to match content width */}
        <div className="relative w-full flex justify-center">
          <div className="title-bar glow-bar mt-4" style={{ width: 'calc(100% - 4rem)' }}></div>
        </div>
      </div>
    </div>
  );
};