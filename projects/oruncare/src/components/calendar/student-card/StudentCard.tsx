import { cn } from '@/lib/utils';
import { getCardStyle } from '../utils/cardStyles';
import { StudentHeader } from './StudentHeader';
import { TestResultSection } from './TestResultSection';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Book, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { memo, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounceCallback } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { useStudentAttendance } from '@/hooks/useStudentAttendance';
import { AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';

const pendingSavesMap = new Map<string, Set<string>>();
const saveTimeoutsMap = new Map<string, Record<string, NodeJS.Timeout>>();

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    result?: 'pass' | 'fail' | 'absent' | 'not-taken' | null;
    wrongCount?: number;
    range_start: number | string;
    range_end: number | string;
    next_range_start?: number | string;
    next_range_end?: number | string;
    homework_content?: string;
    homework_completed?: boolean;
    previous_range_start?: number | string;
    previous_range_end?: number | string;
    previous_result?: 'pass' | 'fail' | 'absent' | 'not-taken' | null;
    class_id?: string;
  };
  onDeleteSchedule: (scheduleId: string) => void;
  onLocalChange: (scheduleId: string, field: string, value: any) => void;
  index: number;
  onChangeStatus: (studentId: string, hasChanges: boolean) => void;
  hasChanges: boolean;
  manualSaveMode?: boolean;
}

const WORD_NOTES_KEY_PREFIX = 'wordnotes_';

export const StudentCard = memo(({
  student,
  onDeleteSchedule,
  onLocalChange,
  index,
  onChangeStatus,
  hasChanges,
  manualSaveMode = false
}: StudentCardProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // 출석 상태 변경 시 시험 결과 자동 업데이트 핸들러
  const handleAttendanceChange = async (status: string | null, studentId: string, date: string) => {
    if (status === 'absent' && student.result !== 'absent') {
      // 결석 처리 시 시험 결과도 absent로 변경
      try {
        const { error } = await supabase
          .from('test_schedules')
          .update({ 
            result: 'absent',
            wrong_count: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', student.id);
          
        if (error) throw error;
        
        // 로컬 상태 업데이트
        onLocalChange(student.id, 'result', 'absent');
        onLocalChange(student.id, 'wrong_count', null);
        
        toast({
          title: "출석 연동 완료",
          description: "결석 처리로 인해 시험 결과가 자동으로 업데이트되었습니다.",
          duration: 3000,
        });
        
        queryClient.invalidateQueries({ queryKey: ['test_schedules'] });
      } catch (error) {
        console.error('Error updating test result on attendance change:', error);
      }
    }
  };

  // 오늘 날짜의 출석 상태 가져오기
  const today = new Date();
  const { attendanceStatus } = useStudentAttendance(student.id, today, {
    onAttendanceChange: handleAttendanceChange
  });
  const [wordNotesContent, setWordNotesContent] = useState('');
  const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set());
  const [hasLocalChanges, setHasLocalChanges] = useState(false); 
  const previousValues = useRef<Record<string, any>>({});
  const cardId = useRef(`card-${student.id}`).current;
  const isTypingWordNotes = useRef(false);
  const initialLoad = useRef(true);
  const isFocused = useRef(false);
  const wordNotesSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedWordNotes = useRef('');
  const storageKey = `${WORD_NOTES_KEY_PREFIX}${student.id}`;
  const [isSaving, setIsSaving] = useState(false);
  const contentLoaded = useRef(false);
  
  const saveToDatabase = async (content: string) => {
    try {
      const { error } = await supabase
        .from('test_schedules')
        .update({
          homework_content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', student.id);
        
      if (error) {
        console.error('Failed to save content to database:', error);
        throw error;
      }
      
      console.log(`Word notes saved to database for student ${student.id}:`, content);
      return true;
    } catch (err) {
      console.error('Error saving to database:', err);
      return false;
    }
  };
  
  useEffect(() => {
    if (!pendingSavesMap.has(student.id)) {
      pendingSavesMap.set(student.id, new Set());
    }
    if (!saveTimeoutsMap.has(student.id)) {
      saveTimeoutsMap.set(student.id, {});
    }
    
    return () => {
      const timeouts = saveTimeoutsMap.get(student.id);
      if (timeouts) {
        Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
      }
      
      if (isTypingWordNotes.current && wordNotesContent !== lastSavedWordNotes.current) {
        saveWordNotesToLocalStorage(wordNotesContent);
      }
    };
  }, [student.id, wordNotesContent]);
  
  useEffect(() => {
    if (!contentLoaded.current) {
      loadWordNotes();
      contentLoaded.current = true;
    }
  }, [student.id]);
  
  const loadWordNotes = () => {
    if (student.homework_content !== undefined && student.homework_content !== null) {
      console.log(`Loading homework content from props for student ${student.id}:`, student.homework_content);
      setWordNotesContent(student.homework_content);
      lastSavedWordNotes.current = student.homework_content;
      
      try {
        localStorage.setItem(storageKey, student.homework_content);
      } catch (e) {
        console.error('Failed to update localStorage:', e);
      }
      
      initialLoad.current = false;
      return;
    }
    
    try {
      const savedWordNotes = localStorage.getItem(storageKey);
      console.log(`Loading word notes from localStorage for student ${student.id}:`, savedWordNotes);
      
      if (savedWordNotes !== null) {
        setWordNotesContent(savedWordNotes);
        lastSavedWordNotes.current = savedWordNotes;
        
        saveToDatabase(savedWordNotes).catch(console.error);
      } else {
        setWordNotesContent('');
        lastSavedWordNotes.current = '';
      }
      
      previousValues.current = {
        result: student.result,
        wrong_count: student.wrongCount
      };
      
      initialLoad.current = false;
    } catch (e) {
      console.error('Failed to get content from localStorage:', e);
    }
  };
  
  const saveWordNotesToLocalStorage = (content: string) => {
    try {
      localStorage.setItem(storageKey, content);
      console.log(`Word notes saved to localStorage for student ${student.id}:`, content);
      lastSavedWordNotes.current = content;
      isTypingWordNotes.current = false;
    } catch (e) {
      console.error('Failed to save word notes to localStorage:', e);
    }
  };
  
  useEffect(() => {
    const studentPendingSaves = pendingSavesMap.get(student.id) || new Set();
    setPendingSaves(new Set(studentPendingSaves));
    
    const intervalId = setInterval(() => {
      const currentSaves = pendingSavesMap.get(student.id) || new Set();
      setPendingSaves(new Set(currentSaves));
    }, 100);
    
    return () => clearInterval(intervalId);
  }, [student.id]);
  
  const saveWordNotes = () => {
    if (wordNotesSaveTimeout.current) {
      clearTimeout(wordNotesSaveTimeout.current);
    }
    
    if (wordNotesContent === lastSavedWordNotes.current) {
      isTypingWordNotes.current = false;
      return;
    }
    
    wordNotesSaveTimeout.current = setTimeout(() => {
      saveWordNotesToLocalStorage(wordNotesContent);
      wordNotesSaveTimeout.current = null;
    }, 1000);
  };

  const handleManualSave = () => {
    setIsSaving(true);
    
    if (wordNotesSaveTimeout.current) {
      clearTimeout(wordNotesSaveTimeout.current);
      wordNotesSaveTimeout.current = null;
    }
    
    saveWordNotesToLocalStorage(wordNotesContent);
    saveToDatabase(wordNotesContent)
      .then((success) => {
        setIsSaving(false);
        if (success) {
          toast({
            title: "저장 완료",
            description: "과제 내용이 저장되었습니다.",
            duration: 2000,
          });
          
          queryClient.setQueriesData({ queryKey: ['test_schedules'] }, (oldData: any) => {
            if (!Array.isArray(oldData)) return oldData;
            
            return oldData.map((schedule: any) => {
              if (schedule.id === student.id) {
                return {
                  ...schedule,
                  homework_content: wordNotesContent,
                  updated_at: new Date().toISOString()
                };
              }
              return schedule;
            });
          });
        }
      })
      .catch(err => {
        setIsSaving(false);
        console.error('Save failed:', err);
        toast({
          title: "저장 실패",
          description: "과제 내용 저장 중 오류가 발생했습니다.",
          variant: "destructive",
          duration: 3000,
        });
      });
  };
  
  // 시험결과에서 결석 선택 시 출석부에도 결석 처리
  const syncAbsentToAttendance = async () => {
    try {
      const formattedDate = today.toISOString().split('T')[0];
      
      // 기존 출석 기록 확인
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', student.id)
        .eq('date', formattedDate)
        .maybeSingle();
      
      if (existingRecord) {
        // 기존 기록 업데이트
        if (existingRecord.status !== 'absent') {
          await supabase
            .from('attendance_records')
            .update({ 
              status: 'absent',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingRecord.id);
        }
      } else {
        // 새 기록 생성
        await supabase
          .from('attendance_records')
          .insert({
            student_id: student.id,
            date: formattedDate,
            status: 'absent'
          });
      }
      
      toast({
        title: "출석부 연동 완료",
        description: "시험 결석 처리로 인해 출석부가 자동으로 업데이트되었습니다.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error syncing absent to attendance:', error);
    }
  };

  const handleLocalChange = async (field: string, value: any) => {
    if (!isAuthenticated) {
      toast({
        title: "접근 제한",
        description: "이 기능을 사용하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    
    if (previousValues.current[field] === value) {
      return;
    }
    
    previousValues.current[field] = value;
    setHasLocalChanges(true);
    
    onLocalChange(student.id, field, value);
    
    // 시험결과가 결석으로 변경되면 출석부도 결석 처리
    if (field === 'result' && value === 'absent' && attendanceStatus !== 'absent') {
      syncAbsentToAttendance();
    }
    
    const studentPendingSaves = pendingSavesMap.get(student.id) || new Set();
    studentPendingSaves.add(field);
    pendingSavesMap.set(student.id, studentPendingSaves);
    
    setPendingSaves(new Set(studentPendingSaves));
    
    if (!manualSaveMode) {
      const timeouts = saveTimeoutsMap.get(student.id) || {};
      if (timeouts[field]) {
        clearTimeout(timeouts[field]);
      }
      
      timeouts[field] = setTimeout(async () => {
        const updateObj: Record<string, any> = {
          updated_at: new Date().toISOString(),
          [field]: value
        };
        
        console.log(`Saving field ${field} for student ${student.id}:`, updateObj);
        
        const { error } = await supabase
          .from('test_schedules')
          .update(updateObj)
          .eq('id', student.id);
          
        if (error) throw error;
        
        const pendingFields = pendingSavesMap.get(student.id);
        if (pendingFields) {
          pendingFields.delete(field);
          pendingSavesMap.set(student.id, pendingFields);
          setPendingSaves(new Set(pendingFields));
          
          if (pendingFields.size === 0) {
            setHasLocalChanges(false);
            onChangeStatus(student.id, false);
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['test_schedules'] });
      }, 2000);
      
      saveTimeoutsMap.set(student.id, timeouts);
    } else {
      onChangeStatus(student.id, true);
    }
  };
  
  const handleWordNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setWordNotesContent(newContent);
    isTypingWordNotes.current = true;
    
    if (wordNotesSaveTimeout.current) {
      clearTimeout(wordNotesSaveTimeout.current);
    }
    
    wordNotesSaveTimeout.current = setTimeout(() => {
      saveWordNotesToLocalStorage(newContent);
      
      saveToDatabase(newContent).catch(err => {
        console.error('Auto-save to database failed:', err);
      });
      
      wordNotesSaveTimeout.current = null;
    }, 1000);
    
    adjustTextareaHeight(e.target);
  };
  
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  
  const getResultHighlight = () => {
    switch(student.result) {
      case 'pass':
        return 'shadow-[0_0_12px_rgba(59,130,246,0.35)]';
      case 'fail':
        return 'shadow-[0_0_12px_rgba(239,68,68,0.35)]';
      case 'absent':
        return 'shadow-[0_0_12px_rgba(234,179,8,0.35)]';
      default:
        return '';
    }
  };

  const getAttendanceIcon = () => {
    switch(attendanceStatus) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getAttendanceText = () => {
    switch(attendanceStatus) {
      case 'present':
        return '출석';
      case 'late':
        return '지각';
      case 'absent':
        return '결석';
      default:
        return null;
    }
  };
  
  const isSavePending = pendingSaves.size > 0;
  
  useEffect(() => {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const textareas = card.querySelectorAll('.auto-resize-textarea');
    textareas.forEach(textarea => {
      adjustTextareaHeight(textarea as HTMLTextAreaElement);
    });
  }, [cardId, wordNotesContent]);
  
  const handleCardFocus = () => {
    isFocused.current = true;
  };
  
  const handleCardBlur = () => {
    setTimeout(() => {
      isFocused.current = false;
    }, 300);
  };
  
  const handleTextareaBlur = () => {
    if (isTypingWordNotes.current && wordNotesContent !== lastSavedWordNotes.current) {
      if (wordNotesSaveTimeout.current) {
        clearTimeout(wordNotesSaveTimeout.current);
        wordNotesSaveTimeout.current = null;
      }
      
      saveWordNotesToLocalStorage(wordNotesContent);
      saveToDatabase(wordNotesContent).catch(console.error);
    }
  };
  
  return (
    <Card 
      id={cardId}
      className={cn(
        "overflow-visible transition-all duration-300 border",
        getCardStyle(student.result),
        (isSavePending || hasChanges) && "border-blue-400/60"
      )}
      data-index={index}
      onFocus={handleCardFocus}
      onBlur={handleCardBlur}
    >
      {(isSavePending || hasChanges) && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
      )}
      
      <CardContent className="p-2.5">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <StudentHeader
              id={student.id}
              name={student.name}
              result={student.result}
              onDeleteSchedule={onDeleteSchedule}
              isAuthenticated={isAuthenticated}
              className={student.class_id}
            />
            
            {attendanceStatus && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
                {getAttendanceIcon()}
                <span className="text-xs font-medium text-gray-700">
                  {getAttendanceText()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Book className="h-4 w-4 text-indigo-600" />
                <Label className="text-sm font-medium text-indigo-700">RT 과제</Label>
              </div>
              <div className="relative bg-white/90 rounded-md shadow-sm border border-gray-200/80 hover:border-indigo-300 transition-all duration-200 w-full">
                <Textarea 
                  value={wordNotesContent}
                  onChange={handleWordNotesChange}
                  onBlur={handleTextareaBlur}
                  placeholder="RT시간에 수행할 과제를 입력하세요"
                  spellCheck={false}
                  className="auto-resize-textarea min-h-0 h-auto text-sm resize-none bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-indigo-400 focus-visible:ring-offset-0 py-2 px-3"
                  style={{ minHeight: '2rem' }}
                  onFocus={() => {
                    isTypingWordNotes.current = true;
                  }}
                />
                <div className="absolute bottom-1.5 right-1.5">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 py-0.5 bg-white/80 text-xs" 
                    onClick={handleManualSave}
                    disabled={isSaving || wordNotesContent === lastSavedWordNotes.current}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {isSaving ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/80 backdrop-blur-sm rounded-md p-2 border border-gray-200/60">
              <TestResultSection
                student={student}
                onLocalChange={handleLocalChange}
                isAuthenticated={isAuthenticated}
                pendingSaves={Array.from(pendingSaves).filter(field => 
                  ['result', 'wrong_count'].includes(field)
                )}
                hasChanges={hasChanges}
                onChangeStatus={(hasChanges) => onChangeStatus(student.id, hasChanges)}
                attendanceStatus={attendanceStatus}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  if (prevProps.index !== nextProps.index || prevProps.hasChanges !== nextProps.hasChanges || prevProps.manualSaveMode !== nextProps.manualSaveMode) {
    return false;
  }
  
  const prevStudent = prevProps.student;
  const nextStudent = nextProps.student;
  
  return prevStudent.id === nextStudent.id && 
         prevStudent.name === nextStudent.name &&
         prevStudent.result === nextStudent.result &&
         prevStudent.wrongCount === nextStudent.wrongCount &&
         prevStudent.homework_content === nextStudent.homework_content &&
         prevStudent.class_id === nextStudent.class_id;
});

StudentCard.displayName = 'StudentCard';
