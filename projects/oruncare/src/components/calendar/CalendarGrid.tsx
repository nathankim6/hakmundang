import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TestSchedule, Holiday } from '@/types/calendar';
import { CheckCircle2, XCircle, RotateCcw, MessageSquarePlus, MessageSquare, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useDailyMemos } from '@/hooks/useDailyMemos';
import { useFilteredClasses } from '@/hooks/useFilteredClasses';
import { isClassScheduledDay } from '@/utils/calendar';
import { PlusCircle, X } from 'lucide-react';
import { useManualClasses } from '@/hooks/useManualClasses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CalendarGridProps {
  currentDate: Date;
  testSchedules: TestSchedule[];
  holidays: Holiday[];
  onDaySelect: (day: Date | null) => void;
  selectedDay: Date | null;
  selectedTeacher: string;
  classes: any[];
}

export const CalendarGrid = ({
  currentDate,
  testSchedules,
  holidays,
  onDaySelect,
  selectedDay,
  selectedTeacher,
  classes
}: CalendarGridProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [editingMemo, setEditingMemo] = useState('');
  const { memos, addMemo, updateMemo, deleteMemo } = useDailyMemos();
  const { manualClasses, addManualClass, deleteManualClass } = useManualClasses();
  const [showAddClassDialog, setShowAddClassDialog] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const handleDayClick = (day: Date) => {
    onDaySelect(day);
  };

  const handleResetDay = async (day: Date) => {
    const daySchedules = testSchedules?.filter(schedule => 
      isSameDay(new Date(schedule.test_date), day)
    ) || [];

    if (daySchedules.length === 0) {
      toast({
        title: "초기화할 시험 일정이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const scheduleIds = daySchedules.map(schedule => schedule.id);
      const { error } = await supabase
        .from('test_schedules')
        .delete()
        .in('id', scheduleIds);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['test_schedules'] });

      toast({
        title: `${daySchedules.length}개의 시험 일정이 초기화되었습니다.`,
      });
    } catch (error) {
      console.error('Error resetting schedules:', error);
      toast({
        title: "시험 일정 초기화 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleMemoSubmit = async (day: Date) => {
    const existingMemo = memos?.find(memo => 
      isSameDay(new Date(memo.date), day)
    );

    try {
      if (existingMemo) {
        await updateMemo.mutateAsync({ id: existingMemo.id, memo: editingMemo });
      } else {
        await addMemo.mutateAsync({ date: day, memo: editingMemo });
      }

      setEditingDate(null);
      setEditingMemo('');
      toast({
        title: "메모가 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error saving memo:', error);
      toast({
        title: "메모 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleMemoDelete = async (id: string) => {
    try {
      await deleteMemo.mutateAsync(id);
      toast({
        title: "메모가 삭제되었습니다.",
      });
    } catch (error) {
      console.error('Error deleting memo:', error);
      toast({
        title: "메모 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getScheduledClassesForDay = (day: Date) => {
    if (checkIfHoliday(day)) return [];
    
    const scheduledClasses = classes.filter(cls => {
      try {
        return isClassScheduledDay(day, cls.schedule);
      } catch (error) {
        console.error('Error checking schedule for class:', cls.name, error);
        return false;
      }
    });

    return scheduledClasses;
  };

  const getTestClassesForDay = (day: Date) => {
    const daySchedules = testSchedules?.filter(schedule => 
      isSameDay(new Date(schedule.test_date), day)
    ) || [];

    const testClasses = new Set();
    daySchedules.forEach(schedule => {
      testClasses.add(schedule.class.name);
    });

    return Array.from(testClasses) as string[];
  };

  const getAllClassesForDay = (day: Date) => {
    const scheduledClasses = getScheduledClassesForDay(day);
    const testClasses = getTestClassesForDay(day);
    
    const allClasses = new Map();
    
    scheduledClasses.forEach(cls => {
      if (selectedTeacher === 'all' || cls.teacher === selectedTeacher) {
        allClasses.set(cls.name, {
          name: cls.name,
          hasTest: false,
          teacher: cls.teacher
        });
      }
    });
    
    testClasses.forEach(className => {
      if (allClasses.has(className)) {
        allClasses.get(className).hasTest = true;
      } else {
        const classData = classes.find(c => c.name === className);
        if (selectedTeacher === 'all' || classData?.teacher === selectedTeacher) {
          allClasses.set(className, {
            name: className,
            hasTest: true,
            teacher: classData?.teacher
          });
        }
      }
    });
    
    return Array.from(allClasses.values());
  };

  const checkIfHoliday = (day: Date): boolean => {
    return holidays.some(holiday => 
      isSameDay(new Date(holiday.start_date), day) || 
      isSameDay(new Date(holiday.end_date), day)
    );
  };

  const formatDayNumber = (date: Date) => {
    return format(date, 'd일', { locale: ko });
  };

  const handleAddClass = () => {
    if (!selectedClassId || !selectedDate) {
      toast({
        title: "수업과 날짜를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    addManualClass.mutate({
      classId: selectedClassId,
      date: selectedDate
    }, {
      onSuccess: () => {
        setShowAddClassDialog(false);
        setSelectedClassId('');
        setSelectedDate(null);
      }
    });
  };

  const handleDeleteClass = (manualClassId: string) => {
    deleteManualClass.mutate(manualClassId);
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-3 bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-100/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-200/50">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div 
            key={day} 
            className={cn(
              "text-center font-semibold py-2 rounded-lg text-sm tracking-wide transition-all duration-200",
              "bg-gradient-to-b from-slate-700 to-slate-800 text-white shadow-sm",
              index === 0 && "from-rose-500 to-rose-600",
              index === 6 && "from-blue-500 to-blue-600"
            )}
          >
            {day}요일
          </div>
        ))}
        {days.map((day) => {
          const daySchedules = testSchedules?.filter(schedule => 
            isSameDay(new Date(schedule.test_date), day)
          ) || [];

          const isHoliday = checkIfHoliday(day);
          const dayMemo = memos?.find(memo => 
            isSameDay(new Date(memo.date), day)
          );

          const dayManualClasses = manualClasses.filter(mc => 
            isSameDay(new Date(mc.date), day)
          );

          const isEditing = editingDate && isSameDay(editingDate, day);
          const classesForDay = getAllClassesForDay(day);
          const isOtherMonth = day.getMonth() !== currentDate.getMonth();
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "relative min-h-[130px] p-3 border border-slate-200/60 rounded-xl transition-all duration-300 ease-out",
                isOtherMonth 
                  ? "opacity-30 bg-slate-50/30" 
                  : "bg-gradient-to-br from-white via-white to-slate-50/50 backdrop-blur-sm shadow-sm hover:shadow-lg hover:border-slate-300/80",
                isToday(day) && "ring-2 ring-slate-400 ring-offset-2 bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-300",
                isHoliday && "bg-gradient-to-br from-rose-50/80 via-white to-rose-50/50 border-rose-300/60",
                isWeekend && !isOtherMonth && !isHoliday && "bg-gradient-to-br from-slate-50/60 via-white to-slate-100/40",
                isSelected && "ring-2 ring-slate-500 ring-offset-2 transform scale-[1.02] shadow-xl border-slate-400",
                "hover:transform hover:scale-[1.01] cursor-pointer group/day"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg font-semibold text-sm transition-all duration-200",
                  isToday(day) && "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-md",
                  isHoliday && "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md",
                  !isToday(day) && !isHoliday && day.getDay() === 0 && "text-rose-500 bg-rose-50/50",
                  !isToday(day) && !isHoliday && day.getDay() === 6 && "text-blue-500 bg-blue-50/50",
                  !isToday(day) && !isHoliday && day.getDay() !== 0 && day.getDay() !== 6 && "text-slate-700 bg-slate-100/50",
                )}>
                  {format(day, 'd')}
                </span>
                <div className="flex gap-1 opacity-0 group-hover/day:opacity-100 transition-opacity duration-200">
                  {!isHoliday && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-slate-200/80 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(day);
                        setShowAddClassDialog(true);
                      }}
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-slate-500" />
                    </Button>
                  )}
                  {daySchedules.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-rose-100 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetDay(day);
                      }}
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 rounded-lg transition-colors",
                      dayMemo ? "hover:bg-blue-100 text-blue-500" : "hover:bg-slate-200/80 text-slate-400"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDate(day);
                      setEditingMemo(dayMemo?.memo || '');
                    }}
                  >
                    {dayMemo ? (
                      <MessageSquare className="h-3.5 w-3.5" />
                    ) : (
                      <MessageSquarePlus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {isEditing ? (
                <div 
                  className="absolute inset-2 bg-white z-10 p-2 border rounded-md shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    value={editingMemo}
                    onChange={(e) => setEditingMemo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleMemoSubmit(day);
                      } else if (e.key === 'Escape') {
                        setEditingDate(null);
                        setEditingMemo('');
                      }
                    }}
                    placeholder="메모를 입력하세요"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingDate(null);
                        setEditingMemo('');
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMemoSubmit(day)}
                    >
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 mt-1.5">
                  {isHoliday && holidays && (
                    <div className="text-xs px-2.5 py-1.5 bg-gradient-to-r from-rose-100 to-rose-50 text-rose-600 font-semibold rounded-lg inline-block border border-rose-200/50 shadow-sm">
                      {holidays.find(holiday => 
                        isSameDay(new Date(holiday.start_date), day) || 
                        isSameDay(new Date(holiday.end_date), day)
                      )?.description}
                    </div>
                  )}
                  
                  {dayMemo && (
                    <div className="text-xs bg-gradient-to-r from-amber-50 to-amber-100/50 p-2 rounded-lg group relative border border-amber-200/60 shadow-sm">
                      <p className="pr-6 line-clamp-2 text-amber-800 font-medium">{dayMemo.memo}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMemoDelete(dayMemo.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-rose-500" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {classesForDay.map((classInfo, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "text-xs px-2 py-1.5 rounded-lg font-medium transition-all duration-200",
                          classInfo.hasTest ? 
                            "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-sm" : 
                            "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border border-slate-200/80 hover:border-slate-300",
                          "truncate"
                        )}
                      >
                        {classInfo.name}
                      </div>
                    ))}
                  
                    {dayManualClasses.map((manualClass) => (
                      <div 
                        key={manualClass.id}
                        className="text-xs px-2 py-1.5 rounded-lg font-medium bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/80 flex justify-between items-center group shadow-sm"
                      >
                        <span className="truncate pr-1">{manualClass.class.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(manualClass.id);
                          }}
                        >
                          <X className="h-2.5 w-2.5 text-rose-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {classesForDay.length > 0 && (
                    <div className="text-xs text-white font-semibold bg-gradient-to-r from-slate-600 to-slate-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1 mt-1.5 shadow-sm whitespace-nowrap">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      총 {classesForDay.reduce((sum, classInfo) => {
                        const classData = classes.find(c => c.name === classInfo.name);
                        return sum + (classData?.students?.length || 0);
                      }, 0)}명
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={showAddClassDialog} onOpenChange={setShowAddClassDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>수업 추가하기</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>수업 선택</Label>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="수업을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddClassDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleAddClass}
              disabled={!selectedClassId || !selectedDate}
            >
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
