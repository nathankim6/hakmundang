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
        {/* Side decorations */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32">
          <div className="absolute inset-0 bg-luxury-accent/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-purple/20 to-transparent rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/10 rounded-full"></div>
        </div>
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32">
          <div className="absolute inset-0 bg-luxury-accent/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-luxury-purple/20 to-transparent rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/10 rounded-full"></div>
        </div>

        {/* Diagonal lines decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                #fff 0px,
                #fff 1px,
                transparent 1px,
                transparent 20px
              )`
            }}>
          </div>
        </div>

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
            <h1 className="text-6xl font-bold tracking-wider platinum-title relative group animate-glow">
              학문당 AI 문제생성 프로그램
              <div className="absolute inset-0 bg-luxury-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </h1>
          </div>
        </div>

        {/* Centered shimmering bar decoration */}
        <div className="relative w-full flex justify-center mt-6">
          <div className="title-bar glow-bar" style={{ width: '60%', maxWidth: '600px' }}></div>
        </div>
      </div>
    </div>
  );
};