import React from 'react';

interface FooterProps {
  pageNumber: number;
}

export const Footer: React.FC<FooterProps> = ({ pageNumber }) => (
  <div className="flex items-center justify-end py-4 px-4 print:py-2">
    <div className="text-sm text-gray-500">
      - {pageNumber} -
    </div>
  </div>
);