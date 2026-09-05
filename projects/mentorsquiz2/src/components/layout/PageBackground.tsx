
import React from 'react';

export const PageBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base background with soft gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #f6f8fd 0%, #eef2f9 100%)'
        }}
      />
      
      {/* Truth/knowledge themed background image */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url('/assets/neural-network-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'soft-light'
        }}
      />
      
      {/* Neural network pattern layer - symbolizing connections and knowledge */}
      <div 
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #6a11cb 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #2575fc 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Geometric patterns symbolizing truth and knowledge */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(30deg, #8e9eab 1px, transparent 1px),
            linear-gradient(120deg, #eef2f3 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />
      
      {/* Abstract digital circuits layer - symbolizing logical pathways to truth */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url('/assets/digital-circuits.png')`,
          backgroundSize: '800px 800px',
          backgroundPosition: 'center',
          backgroundBlendMode: 'color-burn'
        }}
      />
      
      {/* Radial gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.8) 0%, rgba(246, 246, 252, 0.7) 100%)
          `,
          opacity: 0.9
        }}
      />
      
      {/* Subtle pulse animation at strategic points - representing moments of insight */}
      <div className="absolute h-full w-full">
        <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-blue-500/20 animate-pulse"></div>
        <div className="absolute bottom-[30%] right-[25%] w-2.5 h-2.5 rounded-full bg-indigo-500/20 animate-pulse delay-300"></div>
        <div className="absolute top-[60%] right-[40%] w-2 h-2 rounded-full bg-purple-500/20 animate-pulse delay-700"></div>
        <div className="absolute bottom-[40%] left-[15%] w-1.5 h-1.5 rounded-full bg-sky-500/20 animate-pulse delay-500"></div>
        <div className="absolute top-[35%] right-[20%] w-1.5 h-1.5 rounded-full bg-violet-500/20 animate-pulse delay-200"></div>
      </div>
      
      {/* Abstract vertical lines representing flows of knowledge */}
      <div className="absolute inset-0 opacity-[0.03]">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="absolute h-full w-px bg-gradient-to-b from-transparent via-slate-700/40 to-transparent"
            style={{
              left: `${(index + 1) * 8}%`,
              opacity: 0.4 + (Math.sin(index) * 0.2)
            }}
          />
        ))}
      </div>
      
      {/* Light particles effect - representing bits of truth and knowledge */}
      <div className="absolute top-0 left-0 right-0 opacity-[0.07] h-screen overflow-hidden">
        {Array.from({ length: 30 }).map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white animate-subtle-float"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 6 + 4}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Mathematical/scientific symbols pattern - representing rational analysis */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url('/assets/math-symbols.png')`,
          backgroundSize: '600px 600px',
          backgroundBlendMode: 'luminosity'
        }}
      />
      
      {/* Binary code subtle pattern - representing foundational knowledge */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url('/assets/binary-pattern.png')`,
          backgroundSize: '400px 400px',
          backgroundBlendMode: 'screen'
        }}
      />
      
      {/* Subtle glowing accents symbolizing insights and discoveries */}
      <div className="absolute inset-0">
        <div className="absolute top-[15%] left-[20%] w-32 h-32 rounded-full bg-indigo-500/5 blur-3xl"></div>
        <div className="absolute bottom-[25%] right-[15%] w-40 h-40 rounded-full bg-sky-400/5 blur-3xl"></div>
        <div className="absolute top-[50%] right-[30%] w-24 h-24 rounded-full bg-purple-500/5 blur-3xl"></div>
      </div>
    </div>
  );
};
