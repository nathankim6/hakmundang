
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getStudentWordbook } from "@/utils/wordbookService";
import { useState, useEffect } from "react";

export const useFilteredClasses = (selectedTeacher: string, searchTerm?: string) => {
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);

  const { data: classes = [], isLoading: isClassesLoading } = useQuery({
    queryKey: ['classes', selectedTeacher],
    queryFn: async () => {
      console.log('Fetching classes for teacher:', selectedTeacher);
      
      let query = supabase
        .from('classes')
        .select(`
          *,
          students (
            id,
            name,
            wordbook,
            total_days,
            days_per_test,
            test_start_date
          )
        `);

      if (selectedTeacher !== 'all') {
        query = query.eq('teacher', selectedTeacher);
      }

      query = query.order('name');

      const { data: classesData, error: classesError } = await query;

      if (classesError) {
        console.error('Error fetching classes:', classesError);
        return [];
      }

      // 우선순위 지정을 위한 최근 단어장 가져오기
      let recentWordbook = '';
      try {
        recentWordbook = localStorage.getItem('recent_wordbook') || '';
      } catch (e) {
        console.error('Failed to get recent wordbook from localStorage:', e);
      }

      // 선생님 필터링일 때는 해당 선생님의 학생들만 포함되도록 필터링
      const processedClasses = classesData?.map(classData => ({
        ...classData,
        students: classData.students
          .filter((student: any) => {
            if (selectedTeacher === 'all') return true;
            return classData.teacher === selectedTeacher;
          })
          .map((student: any) => ({
            ...student,
            // 각 학생이 영구적인 단어장을 갖도록 보장
            wordbook: getStudentWordbook(student.id, student.wordbook, recentWordbook)
          }))
      })) || [];

      console.log('Fetched classes:', processedClasses.length);
      console.log('Classes details:', processedClasses.map(c => ({
        name: c.name,
        teacher: c.teacher,
        schedule: c.schedule,
        studentCount: c.students.length
      })));

      return processedClasses;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Filter classes based on search term if provided
  useEffect(() => {
    if (!classes) {
      setFilteredClasses([]);
      return;
    }

    if (!searchTerm) {
      setFilteredClasses(classes);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const filtered = classes.map(cls => {
      // First filter students based on search term
      const filteredStudents = cls.students.filter((student: any) => 
        student.name.toLowerCase().includes(lowerSearchTerm)
      );
      
      // Return a new class object with filtered students
      return {
        ...cls,
        students: filteredStudents
      };
    }).filter(cls => {
      // Now filter classes that either match the search term in name/teacher/schedule
      // or have at least one student matching the search term
      return cls.name.toLowerCase().includes(lowerSearchTerm) || 
             cls.teacher.toLowerCase().includes(lowerSearchTerm) || 
             cls.schedule.toLowerCase().includes(lowerSearchTerm) ||
             cls.students.length > 0;
    });
    
    setFilteredClasses(filtered);
  }, [classes, searchTerm]);

  return { 
    classes: searchTerm ? filteredClasses : classes, 
    isClassesLoading 
  };
};
