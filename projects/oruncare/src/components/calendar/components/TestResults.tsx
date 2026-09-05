
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TestSchedule } from '@/types/calendar';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestResultsProps {
  id: string;
  result?: TestSchedule['result'];
  wrongCount?: number | null;
  onResultChange: (value: TestSchedule['result']) => void;
  onWrongCountChange?: (value: number | null) => void;
  onEditingStateChange?: (editing: boolean) => void;
  isEditing?: boolean;
  isReadOnly?: boolean;
  compact?: boolean;
  pendingSaves?: string[];
  hideWrongCount?: boolean;
  attendanceStatus?: string | null; // 출석 상태 추가
}

export const TestResults = ({
  id,
  result,
  wrongCount,
  onResultChange,
  onWrongCountChange,
  onEditingStateChange,
  isReadOnly = false,
  compact = false,
  pendingSaves = [],
  hideWrongCount = false,
  attendanceStatus
}: TestResultsProps) => {
  const [localWrongCount, setLocalWrongCount] = useState<string>('');
  const isInitialized = useRef(false);
  const isUserEditing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSavedValue = useRef<number | null | undefined>(wrongCount);
  const hadFocusBeforeToast = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldAutoFocus = useRef<boolean>(false);

  useEffect(() => {
    if (!onWrongCountChange || hideWrongCount) return;

    if (isUserEditing.current) return;

    if (wrongCount !== lastSavedValue.current || !isInitialized.current) {
      if (wrongCount === null || wrongCount === undefined) {
        setLocalWrongCount('');
      } else {
        setLocalWrongCount(wrongCount.toString());
      }
      lastSavedValue.current = wrongCount;
      isInitialized.current = true;
    }
  }, [wrongCount, hideWrongCount, onWrongCountChange]);

  // 출석 상태에 따른 자동 결석 처리
  useEffect(() => {
    if (attendanceStatus === 'absent' && result !== 'absent') {
      // 출석부에서 결석 처리된 경우 자동으로 시험 결과를 결석으로 변경
      onResultChange('absent');
      if (onWrongCountChange && !hideWrongCount) {
        setLocalWrongCount('');
        isUserEditing.current = false;
        lastSavedValue.current = null;
        onWrongCountChange(null);
      }
    }
  }, [attendanceStatus, result, onResultChange, onWrongCountChange, hideWrongCount]);

  useEffect(() => {
    if (hideWrongCount) return;

    if (pendingSaves.includes('wrong_count') || pendingSaves.includes('result')) {
      hadFocusBeforeToast.current = document.activeElement === inputRef.current;
    } 
    else if (hadFocusBeforeToast.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
        hadFocusBeforeToast.current = false;
      }, 0);
    }
  }, [pendingSaves, hideWrongCount]);

  useEffect(() => {
    if (shouldAutoFocus.current && (result === 'pass' || result === 'fail')) {
      if (inputRef.current && !isReadOnly && !hideWrongCount && onWrongCountChange) {
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 100);
      }
      shouldAutoFocus.current = false;
    }
  }, [result, isReadOnly, hideWrongCount, onWrongCountChange]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  const handleResultChange = (value: TestSchedule['result']) => {
    if (isReadOnly) return;
    
    shouldAutoFocus.current = true;
    onResultChange(value);
    
    if (onWrongCountChange && !hideWrongCount && (value === 'absent' || value === 'not-taken')) {
      setLocalWrongCount('');
      isUserEditing.current = false;
      lastSavedValue.current = null;
      onWrongCountChange(null);
    }
  };

  const handleWrongCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly || !onWrongCountChange || hideWrongCount) return;
    
    const value = e.target.value;

    isUserEditing.current = true;
    onEditingStateChange?.(true);

    if (value === '' || /^\d+$/.test(value)) {
      setLocalWrongCount(value);
    }
  };

  const handleWrongCountBlur = () => {
    if (isReadOnly || !onWrongCountChange || hideWrongCount) return;

    if (isUserEditing.current) {
      saveWrongCount();
    }

    isUserEditing.current = false;
    onEditingStateChange?.(false);
  };

  const saveWrongCount = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    let valueToSave: number | null = null;
    if (localWrongCount !== '') {
      valueToSave = parseInt(localWrongCount, 10);
    }

    if (valueToSave !== lastSavedValue.current) {
      onWrongCountChange?.(valueToSave);
      lastSavedValue.current = valueToSave;
    }
  };

  const handleWrongCountFocus = () => {
    if (!hideWrongCount) {
      isUserEditing.current = true;
      onEditingStateChange?.(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isReadOnly || !onWrongCountChange || hideWrongCount) return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      saveWrongCount();
      isUserEditing.current = false;
      onEditingStateChange?.(false);
      inputRef.current?.blur();
    }
  };

  const handleResetResults = () => {
    if (isReadOnly) return;
    
    onResultChange(null);
    
    if (onWrongCountChange && !hideWrongCount) {
      setLocalWrongCount('');
      isUserEditing.current = false;
      lastSavedValue.current = null;
      onWrongCountChange(null);
    }
  };

  const isWrongCountSaving = pendingSaves.includes('wrong_count');
  const isResultSaving = pendingSaves.includes('result');

  return <div className={`space-y-1`}>
      <div className={`space-y-0.5`}>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1">
            <Label className={`text-xs text-gray-500 mb-0`}>시험 결과</Label>
            {isResultSaving && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-1"></div>}
          </div>
          
          {!isReadOnly && result !== null && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 px-1 py-0 text-gray-500 hover:text-gray-700 flex items-center gap-1 rounded-sm" 
              onClick={handleResetResults}
              disabled={isReadOnly}
            >
              <RotateCcw className="h-3 w-3" />
              <span className="text-[10px]">초기화</span>
            </Button>
          )}
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center flex-nowrap gap-1.5">
            <Button 
              variant={result === 'pass' ? 'default' : 'outline'} 
              size="sm" 
              className={cn(
                "h-7 px-2 text-xs flex items-center gap-1",
                result === 'pass' ? "bg-blue-500 hover:bg-blue-600 text-white" : "text-gray-700 border-gray-300"
              )}
              onClick={() => handleResultChange('pass')}
              disabled={isReadOnly}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              통과
            </Button>
            <Button 
              variant={result === 'fail' ? 'default' : 'outline'} 
              size="sm" 
              className={cn(
                "h-7 px-2 text-xs flex items-center gap-1",
                result === 'fail' ? "bg-red-500 hover:bg-red-600 text-white" : "text-gray-700 border-gray-300"
              )}
              onClick={() => handleResultChange('fail')}
              disabled={isReadOnly}
            >
              <XCircle className="h-3.5 w-3.5" />
              미통과
            </Button>
            <Button 
              variant={result === 'absent' ? 'default' : 'outline'} 
              size="sm" 
              className={cn(
                "h-7 px-2 text-xs flex items-center gap-1",
                result === 'absent' ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "text-gray-700 border-gray-300"
              )}
              onClick={() => handleResultChange('absent')}
              disabled={isReadOnly}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              결석
            </Button>
          </div>
          
          {!hideWrongCount && onWrongCountChange && (result === 'pass' || result === 'fail') && 
            <div className="flex items-center gap-1 ml-2">
              <Label className="text-[10px] text-gray-500 whitespace-nowrap">틀린 개수</Label>
              {isWrongCountSaving && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-0.5"></div>}
              <Input 
                ref={inputRef} 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                placeholder="틀린 개수" 
                className={cn(`w-12 h-6 text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`, isWrongCountSaving && "border-blue-400/60")} 
                value={localWrongCount} 
                onChange={handleWrongCountChange} 
                onBlur={handleWrongCountBlur} 
                onFocus={handleWrongCountFocus} 
                onKeyDown={handleKeyDown} 
                readOnly={isReadOnly} 
                // 여기가 문제: isWrongCountSaving 일 때도 disabled 되지 않도록 수정
                disabled={isReadOnly} 
              />
            </div>
          }
        </div>
      </div>
    </div>;
};

