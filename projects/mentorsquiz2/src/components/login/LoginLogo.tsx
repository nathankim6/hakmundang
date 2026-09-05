import React from 'react';

export const LoginLogo = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="rounded-full border border-white/20 p-0 overflow-hidden flex items-center justify-center bg-gray-200/80 backdrop-blur-md w-20 h-20 hover:scale-105 transition-all duration-300 hover:bg-gray-300/90">
        <img 
          src="/lovable-uploads/23fa69c2-af38-4e34-8414-25cfe997b910.png" 
          alt="Logo" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};