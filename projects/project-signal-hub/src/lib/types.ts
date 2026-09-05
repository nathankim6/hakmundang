
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed';

export type AccessLevel = 'personal' | 'department' | 'all';

export type CalendarType = 'solar' | 'lunar';

export interface Employee {
  id: string;
  name: string;
  position: string;
  avatar?: string;
  department?: EmployeeDepartment;
  accessCode?: string;
  accessLevel?: AccessLevel;
  birthday?: Date;
  birthdayMonth?: number;
  birthdayDay?: number;
  calendarType?: CalendarType;
}

export type EmployeeDepartment = 'administration' | 'elementary' | 'middle' | 'high' | 'assistant' | 'operations';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[]; // Changed from string to string[] for multiple assignees
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  progress: number;
  isDeleted?: boolean;
  deletedAt?: string;
  attachments?: string[]; // Array of file paths in storage
  createdBy?: string; // User ID of task creator
}

export type TaskWithEmployee = Task & {
  employee: Employee;
};

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Report {
  id: string;
  employeeId: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  approvalStatus?: ApprovalStatus;
  approvalComments?: string;
  classContent?: string;
  absentStudents?: string;
  progressStatus?: string;
  homework?: string;
}

export interface DailyReport {
  id: string;
  employeeId: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  // Education-specific fields
  classContent?: string;     // 수업 진행 내용
  absentStudents?: string;   // 결석생
  progressStatus?: string;   // 진도 상황
  homework?: string;         // 숙제
  // Approval-related fields
  approvalStatus?: ApprovalStatus; // 결재 상태
  approvalComments?: string;       // 코멘트/피드백
}

export type DailyReportWithEmployee = DailyReport & {
  employee: Employee;
};
