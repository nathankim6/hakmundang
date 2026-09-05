
import { useEffect, useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface TestRangeInputsProps {
  rangeStart: string | number;
  rangeEnd: string | number;
  nextRangeStart?: string | number;
  nextRangeEnd?: string | number;
  onRangeChange: (field: string, value: string | number) => void;
  isReadOnly?: boolean;
  compact?: boolean;
  pendingSaves?: string[];
}

export const TestRangeInputs = ({
  rangeStart,
  rangeEnd,
  nextRangeStart,
  nextRangeEnd,
  onRangeChange,
  isReadOnly = false,
  compact = false,
  pendingSaves = []
}: TestRangeInputsProps) => {
  // Store inputs as strings to preserve any character the user enters
  const [localRanges, setLocalRanges] = useState({
    rangeStart: rangeStart?.toString() || '',
    rangeEnd: rangeEnd?.toString() || '',
    nextRangeStart: nextRangeStart?.toString() || '',
    nextRangeEnd: nextRangeEnd?.toString() || ''
  });

  // Track if user is actively editing a field
  const isEditing = useRef<Record<string, boolean>>({});
  
  // Track if changes are pending to be saved
  const pendingChanges = useRef({
    rangeStart: false,
    rangeEnd: false,
    nextRangeStart: false,
    nextRangeEnd: false
  });
  
  // Track initial mount to avoid overwriting user input on first render
  const isInitialMount = useRef(true);

  // Update local state from props, but only if not currently editing that field
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (!isEditing.current.rangeStart) {
      setLocalRanges(prev => ({ ...prev, rangeStart: rangeStart?.toString() || '' }));
    }
  }, [rangeStart]);

  useEffect(() => {
    if (!isEditing.current.rangeEnd) {
      setLocalRanges(prev => ({ ...prev, rangeEnd: rangeEnd?.toString() || '' }));
    }
  }, [rangeEnd]);

  useEffect(() => {
    if (!isEditing.current.nextRangeStart) {
      setLocalRanges(prev => ({ ...prev, nextRangeStart: nextRangeStart?.toString() || '' }));
    }
  }, [nextRangeStart]);

  useEffect(() => {
    if (!isEditing.current.nextRangeEnd) {
      setLocalRanges(prev => ({ ...prev, nextRangeEnd: nextRangeEnd?.toString() || '' }));
    }
  }, [nextRangeEnd]);

  const handleInputChange = (field: string, value: string) => {
    // Mark as editing and having pending changes
    isEditing.current[field] = true;
    pendingChanges.current[field as keyof typeof pendingChanges.current] = true;
    
    // Accept and store any text input exactly as entered without modification
    setLocalRanges(prev => ({ ...prev, [field]: value }));
  };

  const handleFocus = (field: string) => {
    isEditing.current[field] = true;
  };

  const handleBlur = (field: string) => {
    // Only save if there are pending changes
    if (pendingChanges.current[field as keyof typeof pendingChanges.current]) {
      const value = localRanges[field as keyof typeof localRanges];
      
      // Map component field names to database field names
      const mapFieldToDbField: Record<string, string> = {
        'rangeStart': 'range_start',
        'rangeEnd': 'range_end',
        'nextRangeStart': 'next_range_start',
        'nextRangeEnd': 'next_range_end'
      };
      
      const dbField = mapFieldToDbField[field];
      
      if (dbField) {
        onRangeChange(dbField, value);
        pendingChanges.current[field as keyof typeof pendingChanges.current] = false;
      }
    }
    
    isEditing.current[field] = false;
  };
  
  // Handle tab key and enter key
  const handleKeyDown = (field: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const textArea = e.target as HTMLTextAreaElement;
      textArea.blur();
      handleBlur(field);
    }
  };

  const isRangeStartSaving = pendingSaves.includes('range_start');
  const isRangeEndSaving = pendingSaves.includes('range_end');
  const isNextRangeStartSaving = pendingSaves.includes('next_range_start');
  const isNextRangeEndSaving = pendingSaves.includes('next_range_end');

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <Label className={cn(
              "text-[10px] font-medium text-gray-500 whitespace-nowrap",
              compact && "mb-0"
            )}>
              오늘 시험 범위
            </Label>
            {(isRangeStartSaving || isRangeEndSaving) && (
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping ml-1"></div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Textarea
              value={localRanges.rangeStart}
              onChange={(e) => handleInputChange('rangeStart', e.target.value)}
              onFocus={() => handleFocus('rangeStart')}
              onBlur={() => handleBlur('rangeStart')}
              onKeyDown={(e) => handleKeyDown('rangeStart', e)}
              spellCheck={false}
              className={cn(
                "min-h-[32px] text-xs w-full resize-none py-1 px-2",
                compact && "min-h-[28px] py-0.5 px-2",
                isRangeStartSaving && "border-blue-400/60"
              )}
              placeholder={isReadOnly ? "-" : "시작 범위"}
              readOnly={isReadOnly}
              disabled={isReadOnly || isRangeStartSaving}
            />
            <span className="text-gray-500 text-xs">~</span>
            <Textarea
              value={localRanges.rangeEnd}
              onChange={(e) => handleInputChange('rangeEnd', e.target.value)}
              onFocus={() => handleFocus('rangeEnd')}
              onBlur={() => handleBlur('rangeEnd')}
              onKeyDown={(e) => handleKeyDown('rangeEnd', e)}
              spellCheck={false}
              className={cn(
                "min-h-[32px] text-xs w-full resize-none py-1 px-2",
                compact && "min-h-[28px] py-0.5 px-2",
                isRangeEndSaving && "border-blue-400/60"
              )}
              placeholder={isReadOnly ? "-" : "끝 범위"}
              readOnly={isReadOnly}
              disabled={isReadOnly || isRangeEndSaving}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <Label className={cn(
              "text-[10px] font-medium text-gray-500 whitespace-nowrap",
              compact && "mb-0"
            )}>
              다음 시험 범위
            </Label>
            {(isNextRangeStartSaving || isNextRangeEndSaving) && (
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping ml-1"></div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Textarea
              value={localRanges.nextRangeStart}
              onChange={(e) => handleInputChange('nextRangeStart', e.target.value)}
              onFocus={() => handleFocus('nextRangeStart')}
              onBlur={() => handleBlur('nextRangeStart')}
              onKeyDown={(e) => handleKeyDown('nextRangeStart', e)}
              spellCheck={false}
              className={cn(
                "min-h-[32px] text-xs w-full resize-none py-1 px-2",
                compact && "min-h-[28px] py-0.5 px-2",
                isNextRangeStartSaving && "border-blue-400/60"
              )}
              placeholder={isReadOnly ? "-" : "시작 범위"}
              readOnly={isReadOnly}
              disabled={isReadOnly || isNextRangeStartSaving}
            />
            <span className="text-gray-500 text-xs">~</span>
            <Textarea
              value={localRanges.nextRangeEnd}
              onChange={(e) => handleInputChange('nextRangeEnd', e.target.value)}
              onFocus={() => handleFocus('nextRangeEnd')}
              onBlur={() => handleBlur('nextRangeEnd')}
              onKeyDown={(e) => handleKeyDown('nextRangeEnd', e)}
              spellCheck={false}
              className={cn(
                "min-h-[32px] text-xs w-full resize-none py-1 px-2",
                compact && "min-h-[28px] py-0.5 px-2",
                isNextRangeEndSaving && "border-blue-400/60"
              )}
              placeholder={isReadOnly ? "-" : "끝 범위"}
              readOnly={isReadOnly}
              disabled={isReadOnly || isNextRangeEndSaving}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
