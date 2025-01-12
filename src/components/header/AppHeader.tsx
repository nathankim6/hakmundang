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
      
      {/* Logo without circular background */}
      <div className="relative z-10 transition-transform duration-300 hover:scale-105">
        <img 
          src="/lovable-uploads/f91b258e-bdcf-40aa-95e8-5668f20b8129.png" 
          alt="학문당입시학원 Logo" 
          className="w-24 h-24 object-contain"
        />
      </div>
      
      {/* Title section with enhanced styling */}
      <div className="flex flex-col items-center relative z-10">
        <h1 className="text-6xl font-bold tracking-wider relative">
          <span className="glass-title glow-effect" data-text="학문당 AI 퀴즈메이커">
            학문당 AI 퀴즈메이커
          </span>
        </h1>
        <div className="title-bar glow-bar"></div>
      </div>
    </div>
  );
};