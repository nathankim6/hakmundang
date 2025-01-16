import React from 'react';

export const PageBackground = () => {
  return (
    <>
      {/* Main gradient background */}
      <div className="fixed inset-0 bg-luxury-dark overflow-hidden">
        {/* Primary animated gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 via-[#D946EF]/20 to-[#0EA5E9]/20 animate-gradient"
            style={{ filter: 'blur(100px)' }}
          />
        </div>
        
        {/* Secondary animated gradient */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-[#F97316]/30 via-transparent to-[#8B5CF6]/30 animate-gradient"
            style={{ 
              animationDelay: '2s',
              filter: 'blur(80px)'
            }}
          />
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%),
                repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)
              `,
              backgroundSize: '20px 20px'
            }}>
          </div>
        </div>
      </div>
      
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large primary orb */}
        <div 
          className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15), rgba(217, 70, 239, 0.05))',
            filter: 'blur(60px)',
            animationDelay: '0s'
          }}
        />
        
        {/* Medium secondary orb */}
        <div 
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.05))',
            filter: 'blur(40px)',
            animationDelay: '1s'
          }}
        />
        
        {/* Small accent orb */}
        <div 
          className="absolute top-1/2 right-1/3 w-[200px] h-[200px] rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.15), rgba(217, 70, 239, 0.05))',
            filter: 'blur(30px)',
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Glowing lines */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.05]">
          <div 
            className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#8B5CF6] to-transparent animate-pulse"
            style={{ animationDuration: '3s' }}
          />
          <div 
            className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-[#D946EF] to-transparent animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div 
            className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-[#0EA5E9] to-transparent animate-pulse"
            style={{ animationDuration: '5s' }}
          />
        </div>
      </div>
    </>
  );
};