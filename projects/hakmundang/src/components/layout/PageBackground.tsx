import React from 'react';

export const PageBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base background with subtle gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)'
        }}
      />
      
      {/* Elegant geometric pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #9b87f5 25%, transparent 25%),
            linear-gradient(-45deg, #9b87f5 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #9b87f5 75%),
            linear-gradient(-45deg, transparent 75%, #9b87f5 75%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
        }}
      />
      
      {/* Subtle circular pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(#7E69AB 1px, transparent 1px),
            radial-gradient(#7E69AB 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px'
        }}
      />

      {/* Soft gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(214, 188, 250, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(229, 222, 255, 0.1) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Additional decorative elements */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, #6E59A5 0px, #6E59A5 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, #6E59A5 0px, #6E59A5 1px, transparent 1px, transparent 20px)
          `
        }}
      />
    </div>
  );
};