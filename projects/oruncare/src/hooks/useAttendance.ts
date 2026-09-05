
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export const useAttendance = (date: Date) => {
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('date', formattedDate);
          
        if (error) throw error;
        
        setAttendanceRecords(data || []);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceRecords();
  }, [formattedDate]);
  
  // 출석부에서 결석 처리 시 test_schedules도 결석으로 동기화
  const syncAbsentToTestSchedule = async (studentId: string, status: string | null) => {
    if (status === 'absent') {
      try {
        // 해당 날짜의 test_schedule 찾기
        const { data: schedules } = await supabase
          .from('test_schedules')
          .select('id, result')
          .eq('student_id', studentId)
          .eq('test_date', formattedDate);
        
        if (schedules && schedules.length > 0) {
          for (const schedule of schedules) {
            if (schedule.result !== 'absent') {
              await supabase
                .from('test_schedules')
                .update({ 
                  result: 'absent',
                  wrong_count: null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', schedule.id);
            }
          }
        }
      } catch (error) {
        console.error('Error syncing absent to test schedule:', error);
      }
    }
  };

  const markAttendance = async (studentId: string, status: string | null, reason?: string) => {
    setIsUpdating(true);
    try {
      // Check if there's already an attendance record for this student on this date
      const existingRecord = attendanceRecords.find(
        record => record.student_id === studentId
      );
      
      if (existingRecord) {
        if (status === null) {
          // If status is null, delete the record
          const { error } = await supabase
            .from('attendance_records')
            .delete()
            .eq('id', existingRecord.id);
            
          if (error) throw error;
          
          // Update local state by removing the record
          setAttendanceRecords(prev => 
            prev.filter(record => record.id !== existingRecord.id)
          );
        } else {
          // Update existing record with new status and reason
          const updateData: any = { 
            status, 
            updated_at: new Date().toISOString() 
          };
          
          if (reason !== undefined) {
            updateData.reason = reason;
          }
          
          const { data, error } = await supabase
            .from('attendance_records')
            .update(updateData)
            .eq('id', existingRecord.id)
            .select();
            
          if (error) throw error;
          
          // Update local state
          setAttendanceRecords(prev => 
            prev.map(record => 
              record.id === existingRecord.id ? data[0] : record
            )
          );
          
          // 결석으로 변경 시 test_schedules도 동기화
          await syncAbsentToTestSchedule(studentId, status);
        }
      } else if (status !== null) {
        // Only create new record if status is not null
        const insertData: any = {
          student_id: studentId,
          date: formattedDate,
          status
        };
        
        if (reason) {
          insertData.reason = reason;
        }
        
        const { data, error } = await supabase
          .from('attendance_records')
          .insert(insertData)
          .select();
          
        if (error) throw error;
        
        // Update local state
        setAttendanceRecords(prev => [...prev, data[0]]);
        
        // 결석으로 변경 시 test_schedules도 동기화
        await syncAbsentToTestSchedule(studentId, status);
      }
      
      return true;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateReason = async (studentId: string, reason: string) => {
    try {
      const existingRecord = attendanceRecords.find(
        record => record.student_id === studentId && record.status === 'absent'
      );
      
      if (existingRecord) {
        const { data, error } = await supabase
          .from('attendance_records')
          .update({ reason, updated_at: new Date().toISOString() })
          .eq('id', existingRecord.id)
          .select();
          
        if (error) throw error;
        
        // Update local state
        setAttendanceRecords(prev => 
          prev.map(record => 
            record.id === existingRecord.id ? data[0] : record
          )
        );
      }
    } catch (error) {
      console.error('Error updating reason:', error);
    }
  };
  
  return {
    attendanceRecords,
    isLoading,
    isUpdating,
    markAttendance,
    updateReason
  };
};
