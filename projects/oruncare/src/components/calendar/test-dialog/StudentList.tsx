import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { StudentCard } from "./StudentCard";
import { StudentListFooter } from "./StudentListFooter";
import { Student, TestSchedule } from "@/types/calendar";
import { getStudentWordbook } from "@/utils/wordbookService";
import { PreviousTestInfo } from "@/hooks/test-schedules/types";

interface StudentListProps {
  classId: string;
  selectedDate: Date;
  onClose: () => void;
}

interface Schedule extends TestSchedule {
  id: string;
  student_id: string;
  range_start: string | number;
  range_end: string | number;
}

export const StudentList = ({ classId, selectedDate, onClose }: StudentListProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [scheduleMap, setScheduleMap] = useState<Map<string, Schedule>>(new Map());
  const [loading, setLoading] = useState(true);
  const [previousTests, setPreviousTests] = useState<{ [key: string]: PreviousTestInfo }>({});
  const [homeworkContent, setHomeworkContent] = useState<{ [key: string]: string }>({});
  const [homeworkStatus, setHomeworkStatus] = useState<{ [key: string]: boolean }>({});
  const [recentWordbook, setRecentWordbook] = useState<string>("");
  const [studentWordbooks, setStudentWordbooks] = useState<{ [key: string]: string }>({});

  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedRecentWordbook = localStorage.getItem('recent_wordbook');
      if (savedRecentWordbook) {
        setRecentWordbook(savedRecentWordbook);
      }
      
      const loadedWordbooks: { [key: string]: string } = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('wordbook_')) {
          const studentId = key.replace('wordbook_', '');
          const wordbook = localStorage.getItem(key);
          if (wordbook) {
            loadedWordbooks[studentId] = wordbook;
          }
        }
      }
      
      setStudentWordbooks(loadedWordbooks);
    } catch (e) {
      console.error('Failed to load wordbooks from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, name, wordbook, total_days, days_per_test, test_start_date')
          .eq('class_id', classId);

        if (studentsError) throw studentsError;

        if (studentsData && studentsData.length > 0) {
          const validWordbooks = studentsData
            .filter(student => student.wordbook && student.wordbook.trim() !== '' && student.wordbook !== '미정')
            .map(student => student.wordbook);
          
          if (validWordbooks.length > 0) {
            const wordbookCounts = validWordbooks.reduce((acc, wordbook) => {
              acc[wordbook] = (acc[wordbook] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            const mostCommonWordbook = Object.entries(wordbookCounts)
              .sort((a, b) => b[1] - a[1])[0][0];
            
            if (!recentWordbook) {
              setRecentWordbook(mostCommonWordbook);
              try {
                localStorage.setItem('recent_wordbook', mostCommonWordbook);
              } catch (e) {
                console.error('Failed to save recent wordbook to localStorage:', e);
              }
            }
          }
        }

        setStudents(studentsData || []);

        const { data: schedules, error: schedulesError } = await supabase
          .from('test_schedules')
          .select('*')
          .eq('class_id', classId)
          .eq('test_date', selectedDate.toISOString().split('T')[0]);

        if (schedulesError) throw schedulesError;

        const newScheduleMap = new Map();
        schedules?.forEach(schedule => {
          newScheduleMap.set(schedule.student_id, schedule);
        });
        setScheduleMap(newScheduleMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    if (classId) {
      fetchStudents();
    }
  }, [classId, selectedDate, recentWordbook]);

  useEffect(() => {
    const fetchPreviousTests = async () => {
      if (!students.length) return;

      for (const student of students) {
        try {
          const { data, error } = await supabase
            .from('test_schedules')
            .select(`
              range_start,
              range_end,
              test_date,
              result,
              student_wordbook,
              student:students (
                wordbook
              )
            `)
            .eq('student_id', student.id)
            .order('test_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data) {
            const storedWordbook = studentWordbooks[student.id];
            const wordbook = storedWordbook || data.student_wordbook || data.student?.wordbook || student.wordbook;
            
            setPreviousTests(prev => ({
              ...prev,
              [student.id]: {
                range_start: data.range_start || "0",
                range_end: data.range_end || "0",
                wordbook: wordbook
              }
            }));
          }
        } catch (error) {
          console.error('Error fetching previous test:', error);
        }
      }
    };

    fetchPreviousTests();
  }, [students, studentWordbooks]);

  const createTestSchedulesMutation = useMutation({
    mutationFn: async (studentIds: string[]) => {
      try {
        const schedulesData = studentIds.map(studentId => {
          const previousTest = previousTests[studentId];
          const student = students.find(s => s.id === studentId);
          
          const storedWordbook = studentWordbooks[studentId];
          const wordbook = storedWordbook || 
                          previousTest?.wordbook || 
                          (student?.wordbook && student.wordbook !== '미정' ? student.wordbook : recentWordbook);
          
          return {
            student_id: studentId,
            class_id: classId,
            test_date: format(selectedDate, 'yyyy-MM-dd'),
            range_start: "0",
            range_end: "0",
            student_wordbook: wordbook,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });

        const { error } = await supabase
          .from('test_schedules')
          .insert(schedulesData);

        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error('Error in createTestSchedulesMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // query invalidation을 setTimeout으로 지연시켜 모달이 먼저 닫히도록 함
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['test_schedules'] });
      }, 100);
      
      toast({
        title: "시험 일정이 추가되었습니다.",
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error creating test schedules:', error);
      toast({
        title: "시험 일정 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSchedules = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "학생을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      createTestSchedulesMutation.mutate(selectedStudents);
    } catch (error) {
      console.error('Error in handleCreateSchedules:', error);
      toast({
        title: "시험 일정 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleChange = async (studentId: string, field: string, value: any) => {
    const schedule = scheduleMap.get(studentId);
    if (!schedule) return;

    try {
      const { error } = await supabase
        .from('test_schedules')
        .update({
          [field]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id);

      if (error) throw error;

      setScheduleMap(prev => {
        const newMap = new Map(prev);
        newMap.set(studentId, { ...schedule, [field]: value });
        return newMap;
      });

      queryClient.invalidateQueries({ queryKey: ['test_schedules'] });
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "일정 수정 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };

  const handleHomeworkContentChange = (scheduleId: string, content: string) => {
    setHomeworkContent(prev => ({
      ...prev,
      [scheduleId]: content
    }));

    supabase
      .from('test_schedules')
      .update({ 
        homework_content: content,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating homework content:', error);
          toast({
            title: "과제 내용 수정 중 오류가 발생했습니다",
            variant: "destructive",
          });
        } else {
          queryClient.invalidateQueries({ queryKey: ['test_schedules'] });
        }
      });
  };

  const handleHomeworkStatusChange = (scheduleId: string, checked: boolean) => {
    setHomeworkStatus(prev => ({
      ...prev,
      [scheduleId]: checked
    }));

    supabase
      .from('test_schedules')
      .update({ 
        homework_completed: checked,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating homework status:', error);
          toast({
            title: "과제 상태 수정 중 오류가 발생했습니다",
            variant: "destructive",
          });
        } else {
          queryClient.invalidateQueries({ queryKey: ['test_schedules'] });
        }
      });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleWordbookChange = (studentId: string, wordbook: string) => {
    if (wordbook && wordbook.trim() !== '' && wordbook !== '미정') {
      setRecentWordbook(wordbook);
      
      setStudentWordbooks(prev => ({
        ...prev,
        [studentId]: wordbook
      }));
      
      try {
        localStorage.setItem(`wordbook_${studentId}`, wordbook);
        localStorage.setItem('recent_wordbook', wordbook);
      } catch (e) {
        console.error('Failed to save wordbook to localStorage:', e);
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center">로딩 중...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 pb-20">
      {students.map((student) => {
        const schedule = scheduleMap.get(student.id);
        const previousTest = previousTests[student.id];
        const storedWordbook = studentWordbooks[student.id];
        
        const studentWordbook = storedWordbook || 
                              previousTest?.wordbook || 
                              (student.wordbook !== '미정' && student.wordbook !== '' ? student.wordbook : recentWordbook);
        
        return (
          <StudentCard
            key={student.id}
            student={{
              ...student,
              wordbook: studentWordbook || recentWordbook || student.wordbook,
            }}
            schedule={schedule}
            onScheduleChange={(field, value) => handleScheduleChange(student.id, field, value)}
            previousTest={previousTest}
            onStudentSelect={(checked) => {
              if (checked) {
                setSelectedStudents(prev => [...prev, student.id]);
              } else {
                setSelectedStudents(prev => prev.filter(id => id !== student.id));
              }
            }}
            isSelected={selectedStudents.includes(student.id)}
            homeworkContent={schedule ? homeworkContent[schedule.id] : ''}
            homeworkCompleted={schedule ? homeworkStatus[schedule.id] : false}
            onHomeworkContentChange={(content) => schedule && handleHomeworkContentChange(schedule.id, content)}
            onHomeworkStatusChange={(checked) => schedule && handleHomeworkStatusChange(schedule.id, checked)}
            onWordbookChange={(wordbook) => handleWordbookChange(student.id, wordbook)}
            simplified={true}
          />
        );
      })}

      <StudentListFooter
        selectedCount={selectedStudents.length}
        totalCount={students.length}
        onCancel={onClose}
        onConfirm={handleCreateSchedules}
        isLoading={createTestSchedulesMutation.isPending}
        onSelectAll={handleSelectAll}
        allSelected={selectedStudents.length === students.length && students.length > 0}
      />
    </div>
  );
};
