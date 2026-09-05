import { useState, useRef, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Calendar, ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface StudentTestRangesProps {
  rangeStart: string | number;
  rangeEnd: string | number;
  nextRangeStart: string | number;
  nextRangeEnd: string | number;
  previousRangeStart?: string | number;
  previousRangeEnd?: string | number;
  onRangeChange: (field: string, value: string) => void;
}

export const StudentTestRanges = ({
  rangeStart,
  rangeEnd,
  nextRangeStart,
  nextRangeEnd,
  previousRangeStart,
  previousRangeEnd,
  onRangeChange,
}: StudentTestRangesProps) => {
  const [localValues, setLocalValues] = useState({
    rangeStart: rangeStart?.toString() || '',
    rangeEnd: rangeEnd?.toString() || '',
    nextRangeStart: nextRangeStart?.toString() || '',
    nextRangeEnd: nextRangeEnd?.toString() || ''
  });
  
  // Keep track of whether changes are pending submission
  const pendingChanges = useRef({
    rangeStart: false,
    rangeEnd: false,
    nextRangeStart: false,
    nextRangeEnd: false
  });

  // Track if user is actively editing a field
  const isEditing = useRef<Record<string, boolean>>({});
  
  // Track initial mount to avoid overwriting user input on first render
  const isInitialMount = useRef(true);

  // Update local state from props, but only if not currently editing that field
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (!isEditing.current.rangeStart) {
      setLocalValues(prev => ({ ...prev, rangeStart: rangeStart?.toString() || '' }));
    }
  }, [rangeStart]);
  
  useEffect(() => {
    if (!isEditing.current.rangeEnd) {
      setLocalValues(prev => ({ ...prev, rangeEnd: rangeEnd?.toString() || '' }));
    }
  }, [rangeEnd]);
  
  useEffect(() => {
    if (!isEditing.current.nextRangeStart) {
      setLocalValues(prev => ({ ...prev, nextRangeStart: nextRangeStart?.toString() || '' }));
    }
  }, [nextRangeStart]);
  
  useEffect(() => {
    if (!isEditing.current.nextRangeEnd) {
      setLocalValues(prev => ({ ...prev, nextRangeEnd: nextRangeEnd?.toString() || '' }));
    }
  }, [nextRangeEnd]);

  const handleInputChange = (field: string, value: string) => {
    isEditing.current[field] = true;
    pendingChanges.current[field as keyof typeof pendingChanges.current] = true;
    setLocalValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleInputBlur = (field: string) => {
    // Only save if there are pending changes
    if (pendingChanges.current[field as keyof typeof pendingChanges.current]) {
      const value = localValues[field as keyof typeof localValues];
      onRangeChange(field, value);
      pendingChanges.current[field as keyof typeof pendingChanges.current] = false;
    }
    
    isEditing.current[field] = false;
  };
  
  const handleInputFocus = (field: string) => {
    isEditing.current[field] = true;
  };
  
  const handleKeyDown = (field: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInputBlur(field);
      (e.target as HTMLElement).blur();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <Label className="text-sm font-medium flex items-center gap-1 mb-2 text-primary-dark">
          <Calendar className="w-4 h-4 text-primary" />
          오늘 시험 범위
        </Label>
        <div className="flex items-center gap-2">
          <Textarea
            className="min-h-[32px] text-sm resize-none text-center border-gray-300 focus:border-primary focus:ring-primary py-1"
            value={localValues.rangeStart}
            onChange={(e) => handleInputChange('rangeStart', e.target.value)}
            onBlur={() => handleInputBlur('rangeStart')}
            onFocus={() => handleInputFocus('rangeStart')}
            onKeyDown={(e) => handleKeyDown('rangeStart', e)}
          />
          <span className="text-gray-600 font-medium">~</span>
          <Textarea
            className="min-h-[32px] text-sm resize-none text-center border-gray-300 focus:border-primary focus:ring-primary py-1"
            value={localValues.rangeEnd}
            onChange={(e) => handleInputChange('rangeEnd', e.target.value)}
            onBlur={() => handleInputBlur('rangeEnd')}
            onFocus={() => handleInputFocus('rangeEnd')}
            onKeyDown={(e) => handleKeyDown('rangeEnd', e)}
          />
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <Label className="text-sm font-medium flex items-center gap-1 mb-2 text-secondary-dark">
          <ArrowUp className="w-4 h-4 text-secondary" />
          다음 시험 범위
        </Label>
        <div className="flex items-center gap-2">
          <Textarea
            className="min-h-[32px] text-sm resize-none text-center border-gray-300 focus:border-secondary focus:ring-secondary py-1"
            value={localValues.nextRangeStart}
            onChange={(e) => handleInputChange('nextRangeStart', e.target.value)}
            onBlur={() => handleInputBlur('nextRangeStart')}
            onFocus={() => handleInputFocus('nextRangeStart')}
            onKeyDown={(e) => handleKeyDown('nextRangeStart', e)}
          />
          <span className="text-gray-600 font-medium">~</span>
          <Textarea
            className="min-h-[32px] text-sm resize-none text-center border-gray-300 focus:border-secondary focus:ring-secondary py-1"
            value={localValues.nextRangeEnd}
            onChange={(e) => handleInputChange('nextRangeEnd', e.target.value)}
            onBlur={() => handleInputBlur('nextRangeEnd')}
            onFocus={() => handleInputFocus('nextRangeEnd')}
            onKeyDown={(e) => handleKeyDown('nextRangeEnd', e)}
          />
        </div>
      </div>
    </div>
  );
};
