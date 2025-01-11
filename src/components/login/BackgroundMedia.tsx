import React from 'react';

interface BackgroundMediaProps {
  url: string;
  isVideo: boolean;
}

export const BackgroundMedia = ({ url, isVideo }: BackgroundMediaProps) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {isVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute h-full w-full object-cover"
          style={{ minWidth: '100%', minHeight: '100%' }}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={url}
          alt="Background"
          className="absolute h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};