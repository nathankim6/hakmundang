
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Updates a student's wordbook in both students and test_schedules tables
 * and updates the React Query cache for immediate UI updates
 */
export const updateStudentWordbook = async (
  studentId: string, 
  newWordbook: string,
  queryClient: ReturnType<typeof useQueryClient>
) => {
  if (!studentId || !newWordbook.trim()) {
    throw new Error('Invalid student ID or wordbook name');
  }

  try {
    console.log(`Updating wordbook for student ${studentId}: ${newWordbook}`);
    
    // 세션 간 지속성을 위해 먼저 localStorage에 저장
    try {
      localStorage.setItem(`wordbook_${studentId}`, newWordbook);
      localStorage.setItem('recent_wordbook', newWordbook);
      
      // 최근 단어장 목록 업데이트
      const recentWordbooks = localStorage.getItem('recent_wordbooks');
      if (recentWordbooks) {
        const wordbooks = JSON.parse(recentWordbooks);
        const updatedWordbooks = Array.from(new Set([newWordbook, ...wordbooks])).slice(0, 5);
        localStorage.setItem('recent_wordbooks', JSON.stringify(updatedWordbooks));
      } else {
        localStorage.setItem('recent_wordbooks', JSON.stringify([newWordbook]));
      }
    } catch (e) {
      console.error('Failed to save wordbook to localStorage:', e);
      // Continue even if localStorage fails
    }

    // 먼저 students 테이블 업데이트
    const { error: studentError } = await supabase
      .from('students')
      .update({ 
        wordbook: newWordbook,
        updated_at: new Date().toISOString() 
      })
      .eq('id', studentId);

    if (studentError) {
      console.error('Error updating student wordbook:', studentError);
      throw studentError;
    }

    // 그 다음 이 학생의 모든 test_schedules 업데이트
    const { error: scheduleError } = await supabase
      .from('test_schedules')
      .update({ 
        student_wordbook: newWordbook,
        updated_at: new Date().toISOString() 
      })
      .eq('student_id', studentId);

    if (scheduleError) {
      console.error('Error updating test schedule wordbook:', scheduleError);
      throw scheduleError;
    }

    // 즉각적인 UI 업데이트를 위해 캐시 업데이트 - test_schedules, 중첩된 student 객체가 있는 schedules 포함
    queryClient.setQueriesData({ queryKey: ['test_schedules'] }, (oldData: any) => {
      if (!oldData) return oldData;
      
      return oldData.map((schedule: any) => {
        if (schedule.student_id === studentId) {
          return {
            ...schedule,
            student_wordbook: newWordbook
          };
        }
        
        if (schedule.student?.id === studentId) {
          return {
            ...schedule,
            student: {
              ...schedule.student,
              wordbook: newWordbook
            },
            student_wordbook: newWordbook
          };
        }
        
        return schedule;
      });
    });

    // 즉각적인 UI 업데이트를 위해 캐시 업데이트 - classes
    queryClient.setQueriesData({ queryKey: ['classes'] }, (oldData: any) => {
      if (!oldData) return oldData;
      
      return oldData.map((classItem: any) => {
        if (classItem.students) {
          return {
            ...classItem,
            students: classItem.students.map((student: any) => {
              if (student.id === studentId) {
                return {
                  ...student,
                  wordbook: newWordbook
                };
              }
              return student;
            })
          };
        }
        return classItem;
      });
    });

    // 캐시에서 개별 학생 데이터 업데이트
    queryClient.setQueriesData({ queryKey: ['student', studentId] }, (oldData: any) => {
      if (!oldData) return oldData;
      return { ...oldData, wordbook: newWordbook };
    });

    // 모든 학생 목록에 대한 캐시 업데이트
    queryClient.setQueriesData({ queryKey: ['students'] }, (oldData: any) => {
      if (!oldData) return oldData;
      
      return oldData.map((student: any) => {
        if (student.id === studentId) {
          return {
            ...student,
            wordbook: newWordbook
          };
        }
        return student;
      });
    });

    console.log(`Successfully updated wordbook for student ${studentId}`);

    // 데이터를 새로고침하기 위해 캐시 무효화 - 비동기적으로 처리하여 UI 블로킹 방지
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['test_schedules'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }, 500);

    return { success: true };
  } catch (error) {
    console.error('Error in updateStudentWordbook:', error);
    throw error;
  }
};

/**
 * 다음 우선순위로 학생의 단어장을 검색합니다:
 * 1. localStorage에서 (가장 최근에 사용자가 설정한 값)
 * 2. 데이터베이스에서 (사용 가능하고 '미정'이 아닌 경우)
 * 3. 기본값은 가장 최근에 사용한 단어장
 */
export const getStudentWordbook = (
  studentId: string,
  databaseWordbook: string = '',
  recentWordbook: string = ''
): string => {
  if (!studentId) {
    return databaseWordbook || recentWordbook || '';
  }
  
  try {
    // 디버그
    console.log(`Getting wordbook for student ${studentId}`);
    console.log(`- Database wordbook: "${databaseWordbook}"`);
    
    // 먼저 localStorage에서 가져오기 (최우선순위)
    const storedWordbook = localStorage.getItem(`wordbook_${studentId}`);
    console.log(`- Stored wordbook: "${storedWordbook}"`);
    
    if (storedWordbook && storedWordbook.trim() !== '') {
      console.log(`- Using stored wordbook: ${storedWordbook}`);
      return storedWordbook;
    }
    
    // 다음으로, 데이터베이스 값이 유효하면 사용
    if (databaseWordbook && databaseWordbook !== '미정' && databaseWordbook.trim() !== '') {
      console.log(`- Using database wordbook: ${databaseWordbook}`);
      // 향후 사용을 위해 localStorage에 저장
      try {
        localStorage.setItem(`wordbook_${studentId}`, databaseWordbook);
      } catch (e) {
        console.error('Failed to save wordbook to localStorage:', e);
      }
      return databaseWordbook;
    }
    
    // 가장 최근에 사용한 단어장으로 폴백
    const recentFromStorage = localStorage.getItem('recent_wordbook');
    const finalWordbook = recentWordbook || recentFromStorage || '';
    console.log(`- Using recent wordbook: ${finalWordbook}`);
    
    return finalWordbook;
  } catch (e) {
    console.error('Error getting student wordbook:', e);
    return databaseWordbook || recentWordbook || '';
  }
};

/**
 * 단어장 데이터를 초기화하고 최신 상태로 동기화합니다
 */
export const syncWordbookData = async (queryClient: ReturnType<typeof useQueryClient>) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('id, wordbook')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching students for wordbook sync:', error);
      return false;
    }
    
    if (!students || students.length === 0) {
      return false;
    }
    
    // 모든 학생의 단어장을 localStorage와 동기화
    let recentWordbooks: string[] = [];
    students.forEach(student => {
      if (student.wordbook && student.wordbook !== '미정' && student.wordbook.trim() !== '') {
        try {
          // 현재 localStorage에 저장된 값이 있으면 우선시
          const existingWordbook = localStorage.getItem(`wordbook_${student.id}`);
          if (!existingWordbook) {
            localStorage.setItem(`wordbook_${student.id}`, student.wordbook);
            // 최근 단어장 목록에 추가
            if (!recentWordbooks.includes(student.wordbook)) {
              recentWordbooks.push(student.wordbook);
            }
          }
        } catch (e) {
          console.error('Failed to sync wordbook to localStorage:', e);
        }
      }
    });
    
    // 최근 단어장 목록 업데이트
    if (recentWordbooks.length > 0) {
      try {
        // 기존 목록과 병합
        const existingRecent = localStorage.getItem('recent_wordbooks');
        if (existingRecent) {
          const existing = JSON.parse(existingRecent);
          recentWordbooks = Array.from(new Set([...existing, ...recentWordbooks])).slice(0, 5);
        }
        
        localStorage.setItem('recent_wordbooks', JSON.stringify(recentWordbooks));
        
        // 가장 최근 단어장 설정
        if (!localStorage.getItem('recent_wordbook') && recentWordbooks.length > 0) {
          localStorage.setItem('recent_wordbook', recentWordbooks[0]);
        }
      } catch (e) {
        console.error('Failed to update recent wordbooks:', e);
      }
    }
    
    return true;
  } catch (e) {
    console.error('Error syncing wordbook data:', e);
    return false;
  }
};
