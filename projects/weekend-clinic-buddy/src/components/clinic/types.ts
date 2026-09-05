export type AttendanceStatus = "pending" | "present" | "late" | "absent";
export type DayKey = "토" | "일" | "월" | "화" | "수" | "목" | "금";

export interface Student {
  id: string;
  name: string;
  school: string;
  day: DayKey | string; // allow multi-day strings like "월금"
  time: string;
  status: AttendanceStatus;
  note?: string;
}

export interface SchoolMeta {
  name: string;
  range: string;
}

export interface Week {
  week: number;
  header: string;
  dateLabel: string;
  schools: SchoolMeta[]; // for color tags + range/과제 per school
  students: Student[];
}