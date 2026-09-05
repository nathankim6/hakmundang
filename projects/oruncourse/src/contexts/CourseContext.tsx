import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, Application } from '@/types/course';
import { supabase } from '@/integrations/supabase/client';
import elementaryMathPoster from '@/assets/elementary-math-poster.jpg';
import middleEnglishPoster from '@/assets/middle-english-poster.jpg';
import highPhysicsPoster from '@/assets/high-physics-poster.jpg';

interface CourseContextType {
  courses: Course[];
  applications: Application[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'enrolled'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addApplication: (application: Omit<Application, 'id' | 'appliedAt' | 'status'>) => void;
  updateApplicationStatus: (id: string, status: Application['status']) => void;
  getApplicationsByCourse: (courseId: string) => Application[];
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};

interface CourseProviderProps {
  children: ReactNode;
}

// 초기 샘플 데이터
const initialCourses: Course[] = [
  {
    id: '1',
    title: '초등 수학 기초반',
    description: '초등학생을 위한 기초 수학 수업입니다. 재미있는 활동과 함께 수학의 기본기를 다집니다.',
    grade: 'elementary',
    fee: 150000,
    schedule: '월, 수, 금 16:00-17:30',
    poster: elementaryMathPoster,
    instructor: '김선생님',
    capacity: 15,
    enrolled: 8,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: '중등 영어 회화반',
    description: '중학생 대상 영어 회화 수업입니다. 실생활 영어 표현을 중심으로 학습합니다.',
    grade: 'middle',
    fee: 200000,
    schedule: '화, 목 18:00-19:30',
    poster: middleEnglishPoster,
    instructor: '이선생님',
    capacity: 12,
    enrolled: 5,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '3',
    title: '고등 물리 심화반',
    description: '고등학생을 위한 물리 심화 과정입니다. 대학 입시를 준비하는 학생들에게 적합합니다.',
    grade: 'high',
    fee: 300000,
    schedule: '토, 일 14:00-16:00',
    poster: highPhysicsPoster,
    instructor: '박선생님',
    capacity: 10,
    enrolled: 7,
    createdAt: new Date('2024-01-25')
  }
];

export const CourseProvider: React.FC<CourseProviderProps> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // 포스터 이미지 매핑
  const getPosterImage = (title: string) => {
    if (title.includes('초등') || title.includes('수학')) return elementaryMathPoster;
    if (title.includes('중등') || title.includes('영어')) return middleEnglishPoster;
    if (title.includes('고등') || title.includes('물리')) return highPhysicsPoster;
    return elementaryMathPoster; // 기본값
  };

  // 데이터베이스에서 강의 목록 로드
  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('강의 로드 실패:', error);
        return;
      }

      const coursesWithPosters = data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        grade: course.grade as 'elementary' | 'middle' | 'high',
        fee: course.fee,
        schedule: course.schedule,
        instructor: course.instructor,
        capacity: course.capacity,
        enrolled: course.enrolled,
        createdAt: new Date(course.created_at),
        poster: course.poster || getPosterImage(course.title),
        applicationStartDate: course.application_start_date ? new Date(course.application_start_date) : undefined,
        applicationEndDate: course.application_end_date ? new Date(course.application_end_date) : undefined
      }));

      setCourses(coursesWithPosters);
    } catch (error) {
      console.error('강의 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 데이터베이스에서 신청 목록 로드
  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('신청 로드 실패:', error);
        return;
      }

      const applicationsWithDates = data.map(app => ({
        id: app.id,
        courseId: app.course_id,
        studentName: app.student_name,
        studentSchool: '', // 기본값으로 빈 문자열
        studentGrade: '', // 기본값으로 빈 문자열
        parentPhone: app.parent_phone,
        appliedAt: new Date(app.created_at),
        status: app.status as Application['status']
      }));

      setApplications(applicationsWithDates);
    } catch (error) {
      console.error('신청 로드 중 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadCourses();
    loadApplications();
  }, []);

  const addCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'enrolled'>) => {
    try {
      const insertData: any = {
        title: courseData.title,
        description: courseData.description,
        grade: courseData.grade,
        fee: courseData.fee,
        schedule: courseData.schedule,
        instructor: courseData.instructor,
        capacity: courseData.capacity,
        enrolled: 0
      };

      if (courseData.applicationStartDate) {
        insertData.application_start_date = courseData.applicationStartDate.toISOString();
      }
      if (courseData.applicationEndDate) {
        insertData.application_end_date = courseData.applicationEndDate.toISOString();
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('강의 추가 실패:', error);
        return;
      }

      const newCourse: Course = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        grade: data.grade as 'elementary' | 'middle' | 'high',
        fee: data.fee,
        schedule: data.schedule,
        instructor: data.instructor,
        capacity: data.capacity,
        enrolled: data.enrolled,
        createdAt: new Date(data.created_at),
        poster: getPosterImage(data.title),
        applicationStartDate: data.application_start_date ? new Date(data.application_start_date) : undefined,
        applicationEndDate: data.application_end_date ? new Date(data.application_end_date) : undefined
      };

      setCourses(prev => [newCourse, ...prev]);
    } catch (error) {
      console.error('강의 추가 중 오류:', error);
    }
  };

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    try {
      const updateData: any = {};
      
      if (courseData.title !== undefined) updateData.title = courseData.title;
      if (courseData.description !== undefined) updateData.description = courseData.description;
      if (courseData.fee !== undefined) updateData.fee = courseData.fee;
      if (courseData.schedule !== undefined) updateData.schedule = courseData.schedule;
      if (courseData.poster !== undefined) updateData.poster = courseData.poster;
      if (courseData.instructor !== undefined) updateData.instructor = courseData.instructor;
      if (courseData.capacity !== undefined) updateData.capacity = courseData.capacity;
      if (courseData.enrolled !== undefined) updateData.enrolled = courseData.enrolled;
      if (courseData.applicationStartDate !== undefined) {
        updateData.application_start_date = courseData.applicationStartDate ? courseData.applicationStartDate.toISOString() : null;
      }
      if (courseData.applicationEndDate !== undefined) {
        updateData.application_end_date = courseData.applicationEndDate ? courseData.applicationEndDate.toISOString() : null;
      }

      const { error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('강의 수정 실패:', error);
        return;
      }

      setCourses(prev => prev.map(course => 
        course.id === id ? { 
          ...course, 
          ...courseData
        } : course
      ));
    } catch (error) {
      console.error('강의 수정 중 오류:', error);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('강의 삭제 실패:', error);
        return;
      }

      setCourses(prev => prev.filter(course => course.id !== id));
      setApplications(prev => prev.filter(app => app.courseId !== id));
    } catch (error) {
      console.error('강의 삭제 중 오류:', error);
    }
  };

  const addApplication = async (applicationData: Omit<Application, 'id' | 'appliedAt' | 'status'>) => {
    try {
      // applications 테이블에 추가
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          course_id: applicationData.courseId,
          student_name: applicationData.studentName,
          parent_phone: applicationData.parentPhone,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('신청 추가 실패:', error);
        return;
      }

      const newApplication: Application = {
        id: data.id,
        courseId: data.course_id,
        studentName: data.student_name,
        studentSchool: '', // 임시값 - 나중에 applications 테이블에 컬럼 추가 필요
        studentGrade: '', // 임시값 - 나중에 applications 테이블에 컬럼 추가 필요
        parentPhone: data.parent_phone,
        appliedAt: new Date(data.created_at),
        status: data.status
      };

      setApplications(prev => [...prev, newApplication]);
      
      // 신청자 수 증가 - enrolled 필드를 직접 가져와서 +1
      const { data: courseData } = await supabase
        .from('courses')
        .select('enrolled')
        .eq('id', applicationData.courseId)
        .single();

      if (courseData) {
        await supabase
          .from('courses')
          .update({ enrolled: courseData.enrolled + 1 })
          .eq('id', applicationData.courseId);
      }

      setCourses(prev => prev.map(course => 
        course.id === applicationData.courseId 
          ? { ...course, enrolled: course.enrolled + 1 }
          : course
      ));
    } catch (error) {
      console.error('신청 추가 중 오류:', error);
    }
  };

  const updateApplicationStatus = async (id: string, status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('신청 상태 수정 실패:', error);
        return;
      }

      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('신청 상태 수정 중 오류:', error);
    }
  };

  const getApplicationsByCourse = (courseId: string) => {
    return applications.filter(app => app.courseId === courseId);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <CourseContext.Provider value={{
      courses,
      applications,
      addCourse,
      updateCourse,
      deleteCourse,
      addApplication,
      updateApplicationStatus,
      getApplicationsByCourse
    }}>
      {children}
    </CourseContext.Provider>
  );
};