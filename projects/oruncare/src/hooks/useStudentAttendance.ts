import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface UseStudentAttendanceProps {
  onAttendanceChange?: (status: string | null, studentId: string, date: string) => void;
}

export const useStudentAttendance = (studentId: string, date: Date, options?: UseStudentAttendanceProps) => {
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      if (!studentId) {
        setAttendanceStatus(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('student_id', studentId)
          .eq('date', formattedDate)
          .maybeSingle();
          
        if (error) throw error;
        
        setAttendanceStatus(data?.status || null);
      } catch (error) {
        console.error('Error fetching attendance status:', error);
        setAttendanceStatus(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceStatus();

    // 실시간 업데이트를 위한 구독 설정
    const channel = supabase
      .channel('attendance_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `student_id=eq.${studentId} and date=eq.${formattedDate}`
        },
        (payload) => {
          console.log('Attendance status changed:', payload);
          let newStatus = null;
          
          if (payload.eventType === 'DELETE') {
            newStatus = null;
          } else {
            newStatus = payload.new?.status || null;
          }
          
          setAttendanceStatus(newStatus);
          
          // 출석 상태 변경 콜백 호출
          if (options?.onAttendanceChange) {
            options.onAttendanceChange(newStatus, studentId, formattedDate);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, formattedDate]);
  
  return {
    attendanceStatus,
    isLoading
  };
};