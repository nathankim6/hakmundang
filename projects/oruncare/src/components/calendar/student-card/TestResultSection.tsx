
import { memo, useRef, useState, useEffect } from 'react';
import { TestResults } from '../components/TestResults';
import { TestSchedule } from '@/types/calendar';
import { useRealtimeTestSchedules } from '@/hooks/test-schedules/useRealtimeTestSchedules';

interface TestResultSectionProps {
  student: {
    id: string;
    result?: 'pass' | 'fail' | 'absent' | 'not-taken' | null;
    wrongCount?: number | null;
  };
  onLocalChange: (field: string, value: any) => void;
  isAuthenticated: boolean;
  pendingSaves?: string[];
  hasChanges: boolean;
  onChangeStatus: (hasChanges: boolean) => void;
  attendanceStatus?: string | null; // 출석 상태 추가
}

export const TestResultSection = memo(({ 
  student, 
  onLocalChange, 
  isAuthenticated,
  pendingSaves = [],
  hasChanges,
  onChangeStatus,
  attendanceStatus
}: TestResultSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const previousValues = useRef({
    result: student.result,
    wrongCount: student.wrongCount
  });

  // Enable real-time updates with the enhanced hook
  const { isSubscribed } = useRealtimeTestSchedules();

  // Log subscription status when it changes
  useEffect(() => {
    console.log(`TestResultSection for student ${student.id} - realtime subscription: ${isSubscribed}`);
  }, [isSubscribed, student.id]);

  // Sync local ref with props when student data changes
  useEffect(() => {
    previousValues.current = {
      result: student.result,
      wrongCount: student.wrongCount
    };
  }, [student.result, student.wrongCount]);

  const handleResultChange = (value: TestSchedule['result']) => {
    // Skip if value hasn't changed to prevent unnecessary saves
    if (value === previousValues.current.result) return;
    
    console.log(`Changing result for student ${student.id} from ${previousValues.current.result} to ${value}`);
    
    previousValues.current.result = value;
    onLocalChange('result', value);
    onChangeStatus(true);
    
    // Clear wrong count when result is absent, not-taken, or null
    if (value === 'absent' || value === 'not-taken' || value === null) {
      previousValues.current.wrongCount = null;
      onLocalChange('wrong_count', null);
    }
  };

  const handleWrongCountChange = (value: number | null) => {
    // Skip if value hasn't changed to prevent unnecessary saves
    if (value === previousValues.current.wrongCount) return;
    
    console.log(`Changing wrong count for student ${student.id} from ${previousValues.current.wrongCount} to ${value}`);
    
    previousValues.current.wrongCount = value;
    onLocalChange('wrong_count', value);
    onChangeStatus(true);
  };

  const handleEditingStateChange = (editing: boolean) => {
    setIsEditing(editing);
  };

  return (
    <TestResults
      id={student.id}
      result={student.result}
      wrongCount={student.wrongCount}
      onResultChange={handleResultChange}
      onWrongCountChange={handleWrongCountChange}
      onEditingStateChange={handleEditingStateChange}
      isEditing={isEditing}
      isReadOnly={!isAuthenticated}
      compact={true}
      pendingSaves={pendingSaves}
      hideWrongCount={false}
      attendanceStatus={attendanceStatus}
    />
  );
});

TestResultSection.displayName = 'TestResultSection';
