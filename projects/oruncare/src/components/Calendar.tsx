
import { useState } from 'react';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CalendarHeader } from './calendar/CalendarHeader';
import { HolidayDialog } from './calendar/HolidayDialog';
import { DailyStatistics } from './calendar/DailyStatistics';
import { useCalendarState } from '@/hooks/calendar/useCalendarState';
import { useTeachersList } from '@/hooks/calendar/useTeachersList';
import { useTestSchedules } from '@/hooks/test-schedules/useTestSchedules';
import { format, startOfDay, isSameDay, parseISO, isAfter, startOfToday, isBefore } from 'date-fns';
import { useHolidays } from '@/hooks/useHolidays';
import { useFilteredClasses } from '@/hooks/useFilteredClasses';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClassSelector } from './calendar/test-dialog/ClassSelector';
import { StudentList } from './calendar/test-dialog/StudentList';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import TestResultsDashboard from './dashboard/TestResultsDashboard';
import DashboardButton from './dashboard/DashboardButton';
import { toast } from 'sonner';

interface CalendarProps {
  showDailyStatsOnly?: boolean;
  onDateSelect?: (date: Date | null) => void;
  selectedDate?: Date | null;
}

const Calendar = ({ showDailyStatsOnly = false, onDateSelect, selectedDate: externalSelectedDate }: CalendarProps) => {
  const { isAuthenticated } = useAuth();
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showAddTestDialog, setShowAddTestDialog] = useState(false);
  const [showHolidayDialog, setShowHolidayDialog] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const { currentDate, setCurrentDate, selectedDay, setSelectedDay } = useCalendarState();
  const { teachers } = useTeachersList();
  const { testSchedules } = useTestSchedules(selectedTeacher);
  const { holidays } = useHolidays();
  const { classes } = useFilteredClasses(selectedTeacher);

  const effectiveSelectedDay = externalSelectedDate !== undefined ? externalSelectedDate : selectedDay;

  const todayStats = testSchedules
    .filter(schedule => {
      if (!schedule.test_date) return false;
      const scheduleDate = parseISO(schedule.test_date);
      const compareDate = effectiveSelectedDay ? startOfDay(effectiveSelectedDay) : startOfDay(new Date());
      return isSameDay(scheduleDate, compareDate);
    })
    .reduce((acc, schedule) => {
      if (!schedule.class?.name) return acc;
      
      const className = schedule.class.name;
      if (!acc[className]) {
        acc[className] = {
          students: [],
          teacher: schedule.class.teacher // Add teacher information
        };
      }
      
      acc[className].students.push({
        id: schedule.id,
        name: schedule.student?.name || '',
        result: schedule.result,
        wrongCount: schedule.wrong_count,
        range_start: schedule.range_start || 0,
        range_end: schedule.range_end || 0,
        next_range_start: schedule.next_range_start,
        next_range_end: schedule.next_range_end,
        homework_content: schedule.homework_content || '',
        homework_completed: schedule.homework_completed || false,
        next_homework_content: schedule.next_homework_content || '',
        previous_range_start: schedule.previous_range_start,
        previous_range_end: schedule.previous_range_end,
        previous_result: schedule.previous_result,
        teacher_comment: schedule.teacher_comment || null
      });

      return acc;
    }, {} as Record<string, { students: Array<any>; teacher?: string }>);

  const handleDayClick = (day: Date | null) => {
    if (!isAuthenticated) return;
    
    const normalizedDay = day ? startOfDay(day) : null;
    console.log('Normalized day:', normalizedDay ? format(normalizedDay, 'yyyy-MM-dd') : 'null');
    
    setSelectedDay(normalizedDay);
    onDateSelect?.(normalizedDay);
  };

  const handleAddTestClick = () => {
    if (!effectiveSelectedDay || !isAuthenticated) return;
    
    // Fix: Use the JavaScript Date object directly instead of startOfDay
    // This ensures we're comparing actual Date objects
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDateStart = new Date(effectiveSelectedDay);
    selectedDateStart.setHours(0, 0, 0, 0);
    
    if (selectedDateStart < today) {
      toast.error('과거 날짜에는 시험 일정을 추가할 수 없습니다.');
      return;
    }

    console.log('Opening test dialog for date:', format(effectiveSelectedDay, 'yyyy-MM-dd'));
    setShowAddTestDialog(true);
  };

  if (showDailyStatsOnly) {
    return (
      <div className="space-y-4 animate-fade-in">
        <DailyStatistics 
          statistics={todayStats} 
          selectedDate={effectiveSelectedDay || new Date()} 
          onDateSelect={(date) => {
            console.log('Date selected in DailyStatistics:', date ? format(date, 'yyyy-MM-dd') : 'null');
            const normalizedDate = date ? startOfDay(date) : null;
            onDateSelect?.(normalizedDate);
            setSelectedDay(normalizedDate);
          }}
          selectedTeacher={selectedTeacher}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <CalendarHeader
        currentDate={currentDate}
        onYearChange={(year) => {
          if (!isAuthenticated) return;
          const newDate = new Date(currentDate);
          newDate.setFullYear(parseInt(year));
          setCurrentDate(newDate);
        }}
        onMonthChange={(month) => {
          if (!isAuthenticated) return;
          const newDate = new Date(currentDate);
          newDate.setMonth(parseInt(month));
          setCurrentDate(newDate);
        }}
        selectedTeacher={selectedTeacher}
        onTeacherChange={(teacher) => {
          if (!isAuthenticated) return;
          setSelectedTeacher(teacher);
        }}
        teachers={teachers}
        onHolidayManage={() => {
          if (!isAuthenticated) return;
          setShowHolidayDialog(true);
        }}
      />
      
      <div className="rounded-2xl shadow-xl overflow-hidden border border-slate-200/60 bg-gradient-to-br from-slate-100/60 via-white/80 to-slate-50/60 backdrop-blur-md p-2">
        <CalendarGrid
          currentDate={currentDate}
          testSchedules={testSchedules}
          holidays={holidays || []}
          onDaySelect={handleDayClick}
          selectedDay={effectiveSelectedDay}
          selectedTeacher={selectedTeacher}
          classes={classes}
        />
      </div>

      <div className="flex justify-end gap-2">
        {effectiveSelectedDay && (
          <Button
            onClick={handleAddTestClick}
            className="gap-2 bg-gradient-to-r from-primary to-primary-dark text-white hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            시험 일정 추가
          </Button>
        )}
        
        <DashboardButton 
          onClick={() => setShowDashboard(true)} 
          className="ml-2"
        />
      </div>

      <Dialog 
        open={showAddTestDialog} 
        onOpenChange={setShowAddTestDialog}
        modal={true}
      >
        <DialogContent 
          className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-0 shadow-2xl"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          {/* Premium Header */}
          <div className="relative pb-6 mb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-t-lg -mx-6 -mt-6 px-6 pt-6" />
            <DialogHeader className="relative flex flex-row items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                <CalendarIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  시험 일정 추가
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {effectiveSelectedDay && format(effectiveSelectedDay, 'yyyy년 M월 d일 (EEEE)', { locale: undefined })} • 반을 선택하여 시험 일정을 추가하세요
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>
          
          <div className="space-y-6">
            <ClassSelector
              selectedClass={selectedClass}
              classes={classes}
              onClassSelect={setSelectedClass}
            />
            {selectedClass && (
              <StudentList
                classId={selectedClass}
                selectedDate={effectiveSelectedDay || new Date()}
                onClose={() => setShowAddTestDialog(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-[100vw] h-[100vh] p-0 m-0 bg-transparent border-0">
          <TestResultsDashboard 
            selectedDate={effectiveSelectedDay || new Date()} 
            onClose={() => setShowDashboard(false)}
            selectedTeacher={selectedTeacher}
          />
        </DialogContent>
      </Dialog>

      <HolidayDialog
        open={showHolidayDialog}
        onOpenChange={setShowHolidayDialog}
        holidays={holidays || []}
        onAddHoliday={async (holiday) => {
          console.log('Adding holiday:', holiday);
        }}
        onRemoveHoliday={async (id) => {
          console.log('Removing holiday:', id);
        }}
      />
    </div>
  );
};

export default Calendar;
