import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';

interface CardSetTitleProps {
  pageNumber: number;
  initialTitle?: string;
}

export const CardSetTitle: React.FC<CardSetTitleProps> = ({ pageNumber, initialTitle = `Set ${pageNumber + 1}` }) => {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="col-span-2 mb-4 flex justify-between items-center">
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
          className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none bg-transparent w-full"
          autoFocus
        />
      ) : (
        <h2 
          className="text-lg font-bold text-gray-800 hover:cursor-pointer flex items-center gap-2"
          onClick={() => setIsEditing(true)}
        >
          {title}
          <Edit2 className="w-4 h-4 text-gray-400 print:hidden" />
        </h2>
      )}
    </div>
  );
};