import React from 'react';

export const PageBackground = () => {
  return (
    <>
      {/* Main background with soft ivory gradient */}
      <div className="fixed inset-0">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)'
          }}
        />
      </div>

      {/* Elegant pattern overlay */}
      <div className="fixed inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1A1F2C 0.5px, transparent 0.5px),
              linear-gradient(-45deg, #1A1F2C 0.5px, transparent 0.5px)
            `,
            backgroundSize: '30px 30px',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Subtle light effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)'
          }}
        />
      </div>
    </>
  );
};