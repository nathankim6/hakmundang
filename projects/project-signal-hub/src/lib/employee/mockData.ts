
import { Employee } from './types';

// Mock employees for fallback
export const mockEmployees: Employee[] = [
  // Administration
  { id: '1', name: '김지원', position: '행정 총괄', avatar: '/placeholder.svg', department: 'administration', accessCode: 'admin1', accessLevel: 'all' },
  { id: '2', name: '이미나', position: '행정 담당자', avatar: '/placeholder.svg', department: 'administration', accessCode: 'admin2', accessLevel: 'personal' },
  
  // Elementary
  { id: '3', name: '박서연', position: '초등부 교사', avatar: '/placeholder.svg', department: 'elementary', accessCode: 'elem1', accessLevel: 'personal' },
  { id: '4', name: '최준호', position: '초등부 교사', avatar: '/placeholder.svg', department: 'elementary', accessCode: 'elem2', accessLevel: 'personal' },
  
  // Middle School
  { id: '5', name: '정다은', position: '중등부 교사', avatar: '/placeholder.svg', department: 'middle', accessCode: 'mid1', accessLevel: 'personal' },
  { id: '6', name: '한민준', position: '중등부장', avatar: '/placeholder.svg', department: 'middle', accessCode: 'mid2', accessLevel: 'department' },
  
  // High School
  { id: '7', name: '송지현', position: '고등부 교사', avatar: '/placeholder.svg', department: 'high', accessCode: 'high1', accessLevel: 'personal' },
  { id: '8', name: '윤도현', position: '고등부장', avatar: '/placeholder.svg', department: 'high', accessCode: 'high2', accessLevel: 'department' },
];
