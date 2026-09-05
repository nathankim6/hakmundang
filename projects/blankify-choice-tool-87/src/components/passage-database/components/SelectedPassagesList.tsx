
import React from 'react';
import { Button } from "@/components/ui/button";
import { Passage } from '../hooks/types';
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";

interface SelectedPassagesListProps {
  accumulatedSelections: Passage[];
  maxSelections: number;
  showAccumulatedSelections: boolean;
  setShowAccumulatedSelections: (show: boolean) => void;
  clearAccumulatedSelections: () => void;
  removeFromAccumulated: (passageId: string) => void;
  handleApplySelectedPassages: () => void;
}

const SelectedPassagesList: React.FC<SelectedPassagesListProps> = ({
  accumulatedSelections,
  maxSelections,
  showAccumulatedSelections,
  setShowAccumulatedSelections,
  clearAccumulatedSelections,
  removeFromAccumulated,
  handleApplySelectedPassages
}) => {
  if (accumulatedSelections.length === 0) {
    return null;
  }
  
  // Always show selections by default
  React.useEffect(() => {
    setShowAccumulatedSelections(true);
  }, [setShowAccumulatedSelections]);
  
  return <div className="border rounded-lg p-3 bg-amber-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm font-medium text-indigo-700 mr-2">
            선택된 지문 {accumulatedSelections.length}/{maxSelections}
          </span>
          <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200">
            {accumulatedSelections.length > 0 && <span>{accumulatedSelections.length} / {maxSelections}</span>}
          </Badge>
        </div>
        <div className="space-x-2">
          <Button variant="ghost" size="sm" className="text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 h-7" onClick={handleApplySelectedPassages}>
            <Check className="h-4 w-4 mr-1" />
            <span className="text-xs">적용</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7" onClick={clearAccumulatedSelections}>
            <X className="h-4 w-4 mr-1" />
            <span className="text-xs">모두 취소</span>
          </Button>
        </div>
      </div>
      
      {showAccumulatedSelections && <div className="mt-3 flex flex-wrap gap-2">
          {accumulatedSelections.map(passage => <Badge key={passage.id} variant="secondary" className="bg-white flex items-center gap-1 py-1 pl-2 pr-1">
              <span className="truncate max-w-[150px] text-xs">{passage.content.substring(0, 20)}{passage.content.length > 20 ? '...' : ''}</span>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 rounded-full hover:bg-red-100 hover:text-red-600" onClick={() => removeFromAccumulated(passage.id)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>)}
        </div>}
    </div>;
};

export default SelectedPassagesList;
