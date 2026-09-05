
import React from 'react';
import { Employee, EmployeeDepartment } from '@/lib/types';
import { useEmployeeStore } from '@/lib/employeeStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Users } from 'lucide-react';

interface EmployeeListProps {
  department: EmployeeDepartment;
  selectedEmployeeId: string | null;
  onSelectEmployee: (employeeId: string) => void;
}

export function EmployeeList({ 
  department, 
  selectedEmployeeId, 
  onSelectEmployee 
}: EmployeeListProps) {
  const { getEmployeesByDepartment } = useEmployeeStore();
  const employees = getEmployeesByDepartment(department);
  
  // Get position priority based on department
  const getPositionPriority = (position: string, dept: EmployeeDepartment): number => {
    if (dept === 'administration') {
      // Administration department: CEO (대표) first, then 실장
      if (position.includes('대표')) return 100;
      if (position.includes('실장')) return 90;
      if (position.includes('부장')) return 80;
    } else if (dept === 'elementary') {
      // Elementary department: 부장 first, then 헤드
      if (position.includes('부장')) return 100;
      if (position.includes('헤드')) return 90;
    } else {
      // Default for other departments: just prioritize 부장
      if (position.includes('부장')) return 100;
    }
    
    // Common positions in all departments
    if (position.includes('팀장')) return 70;
    if (position.includes('과장')) return 60;
    if (position.includes('대리')) return 50;
    if (position.includes('주임')) return 40;
    if (position.includes('사원')) return 30;
    if (position.includes('인턴')) return 20;
    
    return 0; // Default priority
  };
  
  // Sort employees based on department-specific position priorities
  const sortedEmployees = [...employees].sort((a, b) => {
    // Special case for high department: Tony should appear before 김성진
    if (department === 'high') {
      if (a.name === 'Tony' && b.name === '김성진') return -1;
      if (a.name === '김성진' && b.name === 'Tony') return 1;
    }
    
    // Get position priorities
    const priorityA = getPositionPriority(a.position || "", department);
    const priorityB = getPositionPriority(b.position || "", department);
    
    // If priorities differ, sort by priority (higher first)
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    // If they have the same position importance, sort by name
    const nameComparison = a.name.localeCompare(b.name);
    if (nameComparison !== 0) return nameComparison;
    
    // As a final tiebreaker, sort by ID to maintain consistent order
    return a.id.localeCompare(b.id);
  });
  
  return (
    <div className="py-4">
      {sortedEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-secondary/50 p-3 rounded-full mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm text-center">등록된 직원이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-0.5 px-2 py-2">
          {sortedEmployees.map((employee) => (
            <button
              key={employee.id}
              className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 ${
                selectedEmployeeId === employee.id
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'hover:bg-secondary/70'
              }`}
              onClick={() => onSelectEmployee(employee.id)}
            >
              <Avatar className={`h-10 w-10 mr-3 border-2 transition-all ${
                selectedEmployeeId === employee.id 
                  ? 'border-primary' 
                  : 'border-transparent'
              }`}>
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback className="bg-secondary text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className={`font-medium ${
                  selectedEmployeeId === employee.id ? 'text-primary' : ''
                }`}>{employee.name}</div>
                <div className="text-xs text-muted-foreground">{employee.position}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
