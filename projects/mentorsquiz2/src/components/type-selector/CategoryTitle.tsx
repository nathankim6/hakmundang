
import React from 'react';

interface CategoryTitleProps {
  children: React.ReactNode;
}

export const CategoryTitle = ({ children }: CategoryTitleProps) => {
  return (
    <h3 className="text-gray-800 font-medium text-sm">
      {children}
    </h3>
  );
};
