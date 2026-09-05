
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TestResult } from "@/types/calendar";
import { BookOpen, CheckCircle2, XCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StudentTestResultsProps {
  schedule: any;
  onResultChange: (value: TestResult) => void;
  onWrongCountChange: (value: number | null) => void;
}

export const StudentTestResults = ({
  schedule,
  onResultChange,
  onWrongCountChange,
}: StudentTestResultsProps) => {
  const [localWrongCount, setLocalWrongCount] = useState<string>('');
  const isUserEditing = useRef(false);
  const lastSavedValue = useRef<number | null | undefined>(schedule?.wrong_count);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userIsTypingRef = useRef(false);
  const isInitialMount = useRef(true);
  const shouldAutoFocus = useRef(false);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastSavedValue.current = schedule?.wrong_count;
    }
    
    if (!isUserEditing.current && !userIsTypingRef.current) {
      if (schedule?.wrong_count !== undefined && schedule?.wrong_count !== null) {
        setLocalWrongCount(schedule.wrong_count.toString());
      } else {
        setLocalWrongCount('');
      }
      lastSavedValue.current = schedule?.wrong_count;
    }
  }, [schedule?.wrong_count]);

  useEffect(() => {
    isUserEditing.current = false;
    userIsTypingRef.current = false;
    
    if (schedule?.wrong_count !== undefined && schedule?.wrong_count !== null) {
      setLocalWrongCount(schedule.wrong_count.toString());
    } else {
      setLocalWrongCount('');
    }
    lastSavedValue.current = schedule?.wrong_count;
  }, [schedule?.id]);

  // Auto-focus when result changes to pass or fail
  useEffect(() => {
    if (shouldAutoFocus.current && (schedule?.result === 'pass' || schedule?.result === 'fail')) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      shouldAutoFocus.current = false;
    }
  }, [schedule?.result]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      let currentValue: number | null = null;
      if (localWrongCount !== '') {
        currentValue = parseInt(localWrongCount, 10);
      }
      
      if (currentValue !== lastSavedValue.current) {
        console.log("Final save on unmount");
        onWrongCountChange(currentValue);
      }
    };
  }, [localWrongCount, onWrongCountChange]);

  const handleWrongCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '' || /^\d+$/.test(value)) {
      isUserEditing.current = true;
      userIsTypingRef.current = true;
      setLocalWrongCount(value);
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveWrongCount();
        saveTimeoutRef.current = null;
        userIsTypingRef.current = false;
      }, 1500);
    }
  };

  const saveWrongCount = () => {
    let currentValue: number | null = null;
    
    if (localWrongCount !== '') {
      currentValue = parseInt(localWrongCount, 10);
    }
    
    const valueChanged = currentValue !== lastSavedValue.current;
    if (valueChanged) {
      console.log(`Saving wrong count: ${lastSavedValue.current} -> ${currentValue}`);
      setIsSaving(true);
      onWrongCountChange(currentValue);
      lastSavedValue.current = currentValue;
      
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    }
  };

  const handleWrongCountBlur = () => {
    setTimeout(() => {
      if (isUserEditing.current) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        
        saveWrongCount();
        isUserEditing.current = false;
      }
      
      setTimeout(() => {
        userIsTypingRef.current = false;
      }, 200);
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveWrongCount();
      isUserEditing.current = false;
      userIsTypingRef.current = false;
      inputRef.current?.blur();
    }
  };

  const handleResultChange = (value: TestResult) => {
    // Always trigger result change to allow toggling between all states
    shouldAutoFocus.current = true;
    setIsSaving(true);
    onResultChange(value);
    
    if (value === 'absent' || value === 'not-taken') {
      setLocalWrongCount('');
      isUserEditing.current = false;
      userIsTypingRef.current = false;
      lastSavedValue.current = null;
      onWrongCountChange(null);
    }
    
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleResetResults = () => {
    handleResultChange(null);
    
    setLocalWrongCount('');
    isUserEditing.current = false;
    userIsTypingRef.current = false;
    lastSavedValue.current = null;
    onWrongCountChange(null);
  };

  return (
    <div className="flex items-center gap-4 mb-3 bg-gray-50/80 p-3 rounded-lg border border-gray-100/80 relative">
      {isSaving && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
      )}
      
      <div className="flex items-center gap-2">
        <div className="flex items-center flex-nowrap gap-2">
          <Button 
            variant={schedule?.result === 'pass' ? 'default' : 'outline'} 
            size="sm" 
            className={cn(
              "h-6 px-1.5 py-0 text-xs flex items-center gap-1",
              schedule?.result === 'pass' ? "bg-blue-500 hover:bg-blue-600 text-white" : "text-gray-700 border-gray-300"
            )}
            onClick={() => handleResultChange('pass')}
          >
            <CheckCircle2 className="h-3 w-3" />
            통과
          </Button>
          <Button 
            variant={schedule?.result === 'fail' ? 'default' : 'outline'} 
            size="sm" 
            className={cn(
              "h-6 px-1.5 py-0 text-xs flex items-center gap-1",
              schedule?.result === 'fail' ? "bg-red-500 hover:bg-red-600 text-white" : "text-gray-700 border-gray-300"
            )}
            onClick={() => handleResultChange('fail')}
          >
            <XCircle className="h-3 w-3" />
            미통과
          </Button>
          <Button 
            variant={schedule?.result === 'absent' ? 'default' : 'outline'} 
            size="sm" 
            className={cn(
              "h-6 px-1.5 py-0 text-xs flex items-center gap-1",
              schedule?.result === 'absent' ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "text-gray-700 border-gray-300"
            )}
            onClick={() => handleResultChange('absent')}
          >
            <AlertTriangle className="h-3 w-3" />
            결석
          </Button>
        </div>
        
        {schedule?.result && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 px-1.5 py-0 text-gray-500 hover:text-gray-700 flex items-center gap-0.5 rounded-sm" 
            onClick={handleResetResults}
          >
            <RotateCcw className="h-3 w-3" />
            <span className="text-[10px]">초기화</span>
          </Button>
        )}
      </div>

      {(schedule?.result === 'pass' || schedule?.result === 'fail') && (
        <div className="flex items-center gap-2 ml-auto bg-white/90 px-3 py-1.5 rounded-md border border-gray-200/70 shadow-sm">
          <Label className="text-[10px] font-medium whitespace-nowrap flex items-center gap-1 text-gray-700">
            <BookOpen className="w-3 h-3 text-primary/80" />
            틀린 개수
          </Label>
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={cn(
              "w-14 h-6 text-center text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-gray-300/80 focus:border-primary/40 focus:ring-primary/30",
              isSaving && "border-blue-400/60"
            )}
            value={localWrongCount}
            onChange={handleWrongCountChange}
            onBlur={handleWrongCountBlur}
            onKeyDown={handleKeyDown}
            placeholder="0"
            aria-label="틀린 개수"
          />
        </div>
      )}
    </div>
  );
};
