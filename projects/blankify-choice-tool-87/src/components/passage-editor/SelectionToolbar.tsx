
import React from 'react';
import { Eraser, Wand2, MoveHorizontal } from 'lucide-react';

interface SelectionToolbarProps {
  selectedText: string;
  onBlankSelection: () => void;
  onChoiceSelection: () => void;
  onOrderSelection: () => void;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedText,
  onBlankSelection,
  onChoiceSelection,
  onOrderSelection
}) => {
  if (!selectedText) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-3 items-center mt-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
      <span className="text-slate-700">
        선택한 텍스트: <strong className="font-medium">{selectedText}</strong>
      </span>
      <div className="flex gap-2 ml-auto">
        <button
          onClick={onBlankSelection}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-1.5 px-3 rounded-md text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow"
        >
          <Eraser className="h-4 w-4" />
          <span>빈칸으로 변환</span>
        </button>
        <button
          onClick={onChoiceSelection}
          className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-1.5 px-3 rounded-md text-sm hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow"
        >
          <Wand2 className="h-4 w-4" />
          <span>선택문제로 변환</span>
        </button>
        <button
          onClick={onOrderSelection}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-1.5 px-3 rounded-md text-sm hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm hover:shadow"
        >
          <MoveHorizontal className="h-4 w-4" />
          <span>어순배열 문제로 변환</span>
        </button>
      </div>
    </div>
  );
};

export default SelectionToolbar;
