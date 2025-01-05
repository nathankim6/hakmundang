import React from 'react';

interface BackgroundMediaProps {
  url: string;
  isVideo: boolean;
}

export const BackgroundMedia = ({ url, isVideo }: BackgroundMediaProps) => {
  return (
    <div className="absolute inset-0 -z-10">
      {isVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={url} type={`video/${url.split('.').pop()}`} />
        </video>
      ) : (
        <img
          src={url}
          alt="Background"
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    </div>
  );
};