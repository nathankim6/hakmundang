import React from 'react';

interface LoginTitleProps {
  subscriptionExpiry: string | null;
}

export const LoginTitle = ({ subscriptionExpiry }: LoginTitleProps) => {
  return (
    <div className="space-y-2 text-center">
      <h1 className="text-3xl font-medium animate-title bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent relative group transition-all duration-300">
        <span className="inline-block transform hover:scale-105 transition-transform duration-300 relative">
          ORUN AI QUIZ MAKER
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
        </span>
      </h1>
      {subscriptionExpiry && (
        <p className="text-sm text-white/80">
          구독 유효기간: {new Date(subscriptionExpiry).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};