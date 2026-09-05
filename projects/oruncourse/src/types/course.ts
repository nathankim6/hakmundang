export interface Course {
  id: string;
  title: string;
  description: string;
  grade: 'elementary' | 'middle' | 'high';
  fee: number;
  schedule: string;
  poster: string;
  instructor: string;
  capacity: number;
  enrolled: number;
  createdAt: Date;
  applicationStartDate?: Date;
  applicationEndDate?: Date;
}

export interface Application {
  id: string;
  courseId: string;
  studentName: string;
  studentSchool: string;
  studentGrade: string;
  parentPhone: string;
  appliedAt: Date;
  status: 'pending' | 'approved' | 'on_hold';
}

export interface User {
  isAdmin: boolean;
  adminCode?: string;
}

export type GradeType = 'elementary' | 'middle' | 'high';

export const gradeLabels: Record<GradeType, string> = {
  elementary: '초등부',
  middle: '중등부',
  high: '고등부'
};

export const gradeColors: Record<GradeType, string> = {
  elementary: 'elementary',
  middle: 'middle',
  high: 'high'
};