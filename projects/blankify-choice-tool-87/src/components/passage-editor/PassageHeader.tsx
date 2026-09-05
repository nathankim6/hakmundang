
import React from 'react';
import { Trash2, X } from 'lucide-react';

interface PassageHeaderProps {
  index: number;
  onReset: () => void;
  onDelete?: (index: number) => void;
}

const PassageHeader: React.FC<PassageHeaderProps> = ({ 
  index, 
  onReset, 
  onDelete 
}) => {
  return (
    <div className="flex justify-between items-center mb-1">
      <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <span className="flex items-center justify-center w-7 h-7 bg-slate-800 text-white rounded-full text-sm">
          {index + 1}
        </span>
        <span>지문</span>
      </h2>
      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
        >
          <Trash2 className="h-4 w-4" />
          <span>초기화</span>
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(index)}
            className="text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 text-sm"
          >
            <X className="h-4 w-4" />
            <span>삭제</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PassageHeader;
