
import { TestRangeInputs } from '../components/TestRangeInputs';
import { memo } from 'react';

interface TestRangeSectionProps {
  student: {
    id: string;
    range_start: string | number;
    range_end: string | number;
    next_range_start?: string | number;
    next_range_end?: string | number;
    previous_range_start?: number | string;
    previous_range_end?: number | string;
    previous_result?: 'pass' | 'fail' | 'absent' | 'not-taken';
  };
  onLocalChange: (field: string, value: any) => void;
  isAuthenticated: boolean;
  pendingSaves?: string[];
}

export const TestRangeSection = memo(({ 
  student, 
  onLocalChange, 
  isAuthenticated, 
  pendingSaves = [] 
}: TestRangeSectionProps) => {
  // Pass through values directly without any conversion or manipulation
  const rangeStart = student.range_start;
  const rangeEnd = student.range_end;
  const nextRangeStart = student.next_range_start;
  const nextRangeEnd = student.next_range_end;

  // Pass any value directly to parent without conversion, but only if changed
  const handleRangeChange = (field: string, value: any) => {
    // Get current value based on field name
    const currentValue = field === 'range_start' ? student.range_start :
                         field === 'range_end' ? student.range_end :
                         field === 'next_range_start' ? student.next_range_start :
                         student.next_range_end;
    
    // Only trigger save if value has changed to prevent unnecessary API calls
    if (value !== currentValue) {
      onLocalChange(field, value);
    }
  };

  return (
    <div className="space-y-1">
      <TestRangeInputs
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        nextRangeStart={nextRangeStart}
        nextRangeEnd={nextRangeEnd}
        onRangeChange={handleRangeChange}
        isReadOnly={!isAuthenticated}
        compact={true}
        pendingSaves={pendingSaves}
      />
    </div>
  );
});

TestRangeSection.displayName = 'TestRangeSection';
