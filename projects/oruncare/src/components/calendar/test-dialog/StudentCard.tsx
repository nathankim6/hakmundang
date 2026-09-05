
import { useState, useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { StudentTestRanges } from './StudentTestRanges';
import { StudentTestResults } from './StudentTestResults';
import { StudentHomework } from './StudentHomework';
import { getCardStyle } from '../utils/cardStyles';
import { cn } from '@/lib/utils';
import { TestResult } from '@/types/calendar';
import { useQueryClient } from '@tanstack/react-query';
import { updateStudentWordbook, getStudentWordbook } from '@/utils/wordbookService';
import { PreviousTestInfo } from '@/hooks/test-schedules/types';

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    wordbook: string | null;
    total_days: number;
    days_per_test: number;
    test_start_date?: string;
  };
  schedule?: any;
  onScheduleChange: (field: string, value: any) => void;
  onStudentSelect: (checked: boolean) => void;
  isSelected: boolean;
  previousTest?: PreviousTestInfo;
  homeworkContent?: string;
  homeworkCompleted?: boolean;
  onHomeworkContentChange?: (content: string) => void;
  onHomeworkStatusChange?: (checked: boolean) => void;
  onWordbookChange?: (wordbook: string) => void;
  simplified?: boolean;
}

export const StudentCard = ({
  student,
  schedule,
  onScheduleChange,
  onStudentSelect,
  isSelected,
  previousTest,
  homeworkContent,
  homeworkCompleted,
  onHomeworkContentChange,
  onHomeworkStatusChange,
  onWordbookChange,
  simplified = false
}: StudentCardProps) => {
  const [editableRange, setEditableRange] = useState({
    rangeStart: schedule?.range_start?.toString() || (previousTest?.range_end ? String(Number(previousTest.range_end) + 1) : ""),
    rangeEnd: schedule?.range_end?.toString() || "",
    nextRangeStart: schedule?.next_range_start?.toString() || "",
    nextRangeEnd: schedule?.next_range_end?.toString() || ""
  });
  const queryClient = useQueryClient();
  
  // Track local wordbook state - ensure it's never null
  const [displayedWordbook, setDisplayedWordbook] = useState(student.wordbook || '');
  // Track if this card has been modified and needs saving
  const hasChangedRef = useRef(false);
  // Track which card is currently being edited
  const isCurrentlyEditing = useRef(false);

  // Load the persisted wordbook from localStorage when component mounts
  useEffect(() => {
    const persistentWordbook = getStudentWordbook(student.id, student.wordbook || '');
    if (persistentWordbook) {
      setDisplayedWordbook(persistentWordbook);
      
      // Only update if different from current value
      if (onWordbookChange && persistentWordbook !== student.wordbook) {
        onWordbookChange(persistentWordbook);
        onScheduleChange("student_wordbook", persistentWordbook);
        hasChangedRef.current = true;
      }
    }
  }, [student.id, student.wordbook]);

  // Handle card focus and blur to track editing state
  useEffect(() => {
    const handleCardFocus = () => {
      isCurrentlyEditing.current = true;
    };
    
    const handleCardBlur = () => {
      // Add slight delay to prevent interrupting ongoing edits
      setTimeout(() => {
        isCurrentlyEditing.current = false;
      }, 100);
    };
    
    // Clean up the editing state when component unmounts
    return () => {
      isCurrentlyEditing.current = false;
    };
  }, []);

  const handleRangeChange = (field: string, value: string) => {
    // First update local state
    setEditableRange(prev => ({
      ...prev,
      [field]: value
    }));

    // Only if value actually changed
    const currentValue = editableRange[field as keyof typeof editableRange];
    if (currentValue !== value) {
      const numericValue = value === "" ? 0 : parseInt(value, 10);
      const apiField = field === "rangeStart" ? "range_start" :
                      field === "rangeEnd" ? "range_end" :
                      field === "nextRangeStart" ? "next_range_start" : "next_range_end";
      
      hasChangedRef.current = true;
      onScheduleChange(apiField, numericValue);
    }
  };

  const handleWordbookChange = async (newWordbook: string) => {
    if (!newWordbook || newWordbook.trim() === '') return;
    
    // Skip if no change
    if (displayedWordbook === newWordbook) return;
    
    // Update the local UI state immediately
    setDisplayedWordbook(newWordbook);
    
    // Store the wordbook in localStorage
    try {
      localStorage.setItem(`wordbook_${student.id}`, newWordbook);
      localStorage.setItem('recent_wordbook', newWordbook);
    } catch (e) {
      console.error('Failed to save wordbook to localStorage:', e);
    }
    
    // This makes sure that both the local student state is updated and also the schedule
    hasChangedRef.current = true;
    onScheduleChange("student_wordbook", newWordbook);
    
    // This notifies the parent component about wordbook changes
    if (onWordbookChange) {
      onWordbookChange(newWordbook);
    }

    // Update wordbook in the database and refresh cache
    try {
      await updateStudentWordbook(student.id, newWordbook, queryClient);
    } catch (error) {
      console.error("Failed to update wordbook:", error);
      // Revert to the original value if there's an error
      setDisplayedWordbook(student.wordbook || '');
    }
  };

  // Simplified version for student selection in test dialog
  if (simplified) {
    return (
      <div className={cn(
        "relative py-2 px-4 rounded-lg border bg-white shadow-sm transition-all hover:bg-gray-50",
        isSelected && "ring-2 ring-primary/60 bg-primary/5"
      )}>
        <div className="flex items-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onStudentSelect}
            className="h-4 w-4 mr-3"
          />
          <h3 className="font-medium text-gray-800">{student.name}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative p-3 rounded-lg border bg-white shadow-sm transition-all",
      schedule && getCardStyle(schedule.result),
      isSelected && "ring-2 ring-blue-500"
    )}
    onFocus={() => isCurrentlyEditing.current = true}
    onBlur={() => setTimeout(() => isCurrentlyEditing.current = false, 200)}
    >
      <div className="absolute top-3 left-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onStudentSelect}
          className="h-4 w-4"
        />
      </div>

      <div className="pl-7">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{student.name}</h3>

        <div className="grid grid-cols-1 gap-3 mt-3">
          <StudentTestRanges
            previousRangeStart={previousTest?.range_start}
            previousRangeEnd={previousTest?.range_end}
            rangeStart={editableRange.rangeStart}
            rangeEnd={editableRange.rangeEnd} 
            nextRangeStart={editableRange.nextRangeStart}
            nextRangeEnd={editableRange.nextRangeEnd}
            onRangeChange={handleRangeChange}
          />

          <StudentTestResults
            schedule={schedule}
            onResultChange={(value) => {
              hasChangedRef.current = true;
              onScheduleChange('result', value);
            }}
            onWrongCountChange={(value) => {
              hasChangedRef.current = true;
              onScheduleChange('wrong_count', value);
            }}
          />

          <StudentHomework
            homeworkContent={homeworkContent || ''}
            homeworkCompleted={homeworkCompleted || false}
            onHomeworkContentChange={(content) => {
              hasChangedRef.current = true;
              if (onHomeworkContentChange) {
                onHomeworkContentChange(content);
              }
            }}
            onHomeworkCompletedChange={(checked) => {
              hasChangedRef.current = true;
              if (onHomeworkStatusChange) {
                onHomeworkStatusChange(checked);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
