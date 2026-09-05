import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from '@/components/ui/calendar';
import { DailyStatisticsHeader } from './components/DailyStatisticsHeader';
import { TeacherComments } from './components/TeacherComments';
import DashboardButton from '../dashboard/DashboardButton';
import TestResultsDashboard from '../dashboard/TestResultsDashboard';
import DailyStatisticsTable from './DailyStatisticsTable';

interface DailyStatisticsProps {
  statistics: Record<string, {
    students: Array<{
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
      wordbook?: string | null;
    }>;
    teacher?: string;
  }>;
  selectedDate: Date;
  onDateSelect?: (date: Date | null) => void;
  selectedTeacher?: string;
}

export const DailyStatistics = ({ 
  statistics, 
  selectedDate, 
  onDateSelect,
  selectedTeacher = 'all'
}: DailyStatisticsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log('Selected date in DailyStatistics:', format(date, 'yyyy-MM-dd'));
      setShowCalendar(false);
      onDateSelect?.(date);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('test_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "시험 대상이 삭제되었습니다",
      });

      queryClient.invalidateQueries({ 
        queryKey: ['test_schedules'],
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "삭제 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };

  const filteredStatistics = selectedTeacher === 'all' 
    ? statistics 
    : Object.entries(statistics).reduce((acc, [className, stats]) => {
        if (stats.teacher === selectedTeacher) {
          acc[className] = stats;
        }
        return acc;
      }, {} as typeof statistics);

  // Get unique teachers from statistics
  const teachers = Array.from(new Set(
    Object.values(filteredStatistics)
      .map(stats => stats.teacher)
      .filter(Boolean)
  ));

  if (Object.keys(statistics).length === 0) return null;

  return (
    <div className="space-y-3">
      {/* TA Comments Section */}
      {teachers.length > 0 && (
        <TeacherComments
          selectedDate={selectedDate}
          teachers={teachers}
        />
      )}

      {/* Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>날짜 선택</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={ko}
            className="rounded-md border"
          />
        </DialogContent>
      </Dialog>

      {/* Dashboard Dialog */}
      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-[100vw] h-[100vh] p-0 m-0 bg-transparent border-0">
          <TestResultsDashboard 
            selectedDate={selectedDate} 
            onClose={() => setShowDashboard(false)}
            selectedTeacher={selectedTeacher}
          />
        </DialogContent>
      </Dialog>

      {/* Header with date and dashboard button */}
      <div className="flex justify-between items-center">
        <DailyStatisticsHeader
          selectedDate={selectedDate}
          onDateChange={(date) => {
            console.log('Date changed in DailyStatisticsHeader:', format(date, 'yyyy-MM-dd'));
            onDateSelect?.(date);
          }}
          onCalendarOpen={() => setShowCalendar(true)}
        />
        <DashboardButton onClick={() => setShowDashboard(true)} />
      </div>

      {/* Table View */}
      <DailyStatisticsTable
        statistics={filteredStatistics}
        selectedDate={selectedDate}
        onDeleteSchedule={handleDeleteSchedule}
      />
    </div>
  );
};
