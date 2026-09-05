
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TestSchedule } from "@/types/calendar";

export const useTestSchedules = (selectedTeacher: string) => {
  const { data: testSchedules = [], isLoading: isTestSchedulesLoading } = useQuery({
    queryKey: ['test_schedules', selectedTeacher],
    queryFn: async () => {
      let classIds: string[] = [];
      
      // 선생님이 'all'이 아닐 경우, 먼저 해당 선생님의 클래스 ID들을 가져옵니다
      if (selectedTeacher !== 'all') {
        const { data: teacherClasses, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher', selectedTeacher);

        if (classError) {
          console.error('Error fetching teacher classes:', classError);
          return [];
        }

        classIds = teacherClasses.map(c => c.id);
        
        // 선생님의 반이 없는 경우 빈 배열 반환
        if (classIds.length === 0) {
          return [];
        }
      }

      // 테스트 스케줄 쿼리 구성
      let query = supabase
        .from('test_schedules')
        .select(`
          id,
          test_date,
          range_start,
          range_end,
          wrong_count,
          created_at,
          homework_completed,
          next_range_start,
          next_range_end,
          previous_range_start,
          previous_range_end,
          previous_result,
          updated_at,
          homework_content,
          next_homework_content,
          teacher_comment,
          student_id,
          class_id,
          result,
          student:students(
            id,
            name,
            wordbook,
            total_days,
            days_per_test,
            test_start_date
          ),
          class:classes!inner(
            id,
            name,
            teacher
          )
        `);

      // 선생님 필터링 적용
      if (selectedTeacher !== 'all') {
        query = query.in('class_id', classIds);
      }

      query = query.order('test_date', { ascending: true });

      const { data: schedules, error: schedulesError } = await query;

      if (schedulesError) {
        console.error('Error fetching test schedules:', schedulesError);
        return [];
      }

      // null 체크 및 데이터 변환
      return (schedules || [])
        .filter(schedule => schedule.student && schedule.class)
        .map(schedule => {
          // 문자열로 저장된 numeric 값들을 명시적으로 숫자로 변환
          const convertToNumber = (value: any) => {
            if (value === null || value === undefined) return undefined;
            const parsed = Number(value);
            return isNaN(parsed) ? 0 : parsed;
          };

          return {
            ...schedule,
            // 결과 값이 null이면 명시적으로 null로 설정
            result: schedule.result === null ? null : schedule.result,
            // 숫자 필드들을 명시적으로 변환하여 타입 일관성 유지
            range_start: convertToNumber(schedule.range_start),
            range_end: convertToNumber(schedule.range_end),
            next_range_start: schedule.next_range_start ? convertToNumber(schedule.next_range_start) : undefined,
            next_range_end: schedule.next_range_end ? convertToNumber(schedule.next_range_end) : undefined,
            previous_range_start: schedule.previous_range_start ? convertToNumber(schedule.previous_range_start) : undefined,
            previous_range_end: schedule.previous_range_end ? convertToNumber(schedule.previous_range_end) : undefined,
            student: schedule.student,
            class: schedule.class
          } as TestSchedule;
        });
    },
    // Enable automatic refetching in response to realtime updates
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 10000, // 10 seconds
  });

  return { testSchedules, isTestSchedulesLoading };
};
