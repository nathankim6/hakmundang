import React from 'react';

export const PageBackground = () => {
  return (
    <>
      {/* Main gradient background */}
      <div className="fixed inset-0 bg-luxury-light">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-accent/10 via-transparent to-luxury-purple/10 animate-gradient"></div>
        </div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, #1A1F2C 0, #1A1F2C 1px, transparent 0, transparent 50%),
                repeating-linear-gradient(-45deg, #1A1F2C 0, #1A1F2C 1px, transparent 0, transparent 50%)
              `,
              backgroundSize: '20px 20px'
            }}>
          </div>
        </div>
      </div>
      
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-purple/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </>
  );
};